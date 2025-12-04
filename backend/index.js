const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const isProduction = process.env.NODE_ENV === 'production';

const connectionConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: isProduction ? { rejectUnauthorized: false } : false
};

const pool = new Pool(connectionConfig);

pool.connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err.message));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, 
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000, 
  greetingTimeout: 10000,
  socketTimeout: 10000
});

const enviarNotificacion = async (destinatario, asunto, mensaje) => {
    const mailOptions = {
        from: '"SGP Gametech" <henrychavez522@gmail.com>',
        to: destinatario,
        subject: asunto,
        text: mensaje, 
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
                <h2 style="color: #00b7ff;">Gametech SGP - Notificación</h2>
                <p>Hola,</p>
                <p>${mensaje}</p>
                <hr/>
                <small style="color: #888;">Mensaje automático del sistema.</small>
            </div>
        `
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      let match = false;
      if (user.password.startsWith('$2b$')) {
          match = await bcrypt.compare(password, user.password);
      } else {
        match = (password === user.password);
      }

      if (match) {
        const { password, ...userWithoutPass } = user;
        res.json({ success: true, user: userWithoutPass });
      } else {
        res.status(401).json({ success: false, message: "Credenciales incorrectas" });
     }
    } else {
      res.status(401).json({ success: false, message: "Usuario no encontrado" });
    }
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: 'Error login' }); 
  }
});

app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query("SELECT id, nombre, rol, email FROM usuarios");
    res.json(result.rows);
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: 'Error usuarios' }); 
  }
});

app.get('/api/proyectos-activos', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM proyectos WHERE estado = 'activo'");
    res.json(result.rows);
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: 'Error proyectos' }); 
  }
});

app.get('/api/proyectos', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM proyectos");
    res.json(result.rows);
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: 'Error proyectos' }); 
  }
});

app.get('/api/proyectos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM proyectos WHERE id = $1", [id]);
    if (result.rows.length > 0) res.json(result.rows[0]);
    else res.status(404).json({ error: 'No encontrado' });
  } catch (err) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/proyectos', async (req, res) => {
  const { nombre, gerente, presupuesto } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO proyectos (nombre, descripcion, gerente, presupuesto, fecha_entrega, genero, plataformas, motor_juego)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [nombre, req.body.descripcion, gerente, presupuesto, req.body.fecha_entrega, req.body.genero, req.body.plataformas, req.body.motor_juego]
    );
    
    const gerenteRes = await pool.query("SELECT email FROM usuarios WHERE nombre = $1", [gerente]);
    if(gerenteRes.rows.length > 0) {
        enviarNotificacion(gerenteRes.rows[0].email, "Nuevo Proyecto Asignado", `Se te ha asignado la gerencia del proyecto "${nombre}".`);
    }
    res.status(201).json(result.rows[0]);
  } catch (err) { 
      console.error(err);
      res.status(500).json({ error: 'Error creando' });
  }
});

app.put('/api/proyectos/:id/archivar', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE proyectos SET estado = 'archivado' WHERE id = $1", [id]);
    res.json({ mensaje: "Archivado" });
  } catch (err) { res.status(500).json({ error: 'Error archivando' }); }
});

app.get('/api/tareas', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tareas");
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Error tareas' }); }
});

app.post('/api/tareas', async (req, res) => {
  const { title, assignee, project, deadline, status } = req.body;
  
  try {
    const result = await pool.query(
      "INSERT INTO tareas (title, assignee, deadline, status, project) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, assignee, deadline, status, project]
    );
    
    const userRes = await pool.query("SELECT email FROM usuarios WHERE nombre = $1", [assignee]);
    
    if (userRes.rows.length > 0 && userRes.rows[0].email) {
        const emailDestino = userRes.rows[0].email;
        const fechaFormateada = deadline ? deadline.split('-').reverse().join('/') : 'Sin fecha';
        const mensajeDetallado = `
            Hola, se te ha asignado una nueva responsabilidad en el sistema.<br><br>
            <b>📋 Detalles de la Tarea:</b><br>
            • <b>Título:</b> ${title}<br>
            • <b>Proyecto:</b> ${project}<br>
            • <b>Estado Inicial:</b> ${status}<br>
            • <b>Fecha Límite:</b> ${fechaFormateada}<br><br>
            Por favor, ingresa al SGP para gestionar tu avance.
        `;

        enviarNotificacion(
            emailDestino, 
            `Nueva Tarea Asignada: ${title}`, 
            mensajeDetallado
        );
    }

    res.status(201).json(result.rows[0]);
  } catch (err) { 
      console.error(err);
      res.status(500).json({ error: 'Error creando tarea' }); 
  }
});

app.put('/api/tareas/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query("UPDATE tareas SET status = $1 WHERE id = $2", [status, id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Error actualizando' }); }
});

app.delete('/api/tareas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM tareas WHERE id = $1", [id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Error eliminando' }); }
});

app.get('/api/proyectos/:id/recursos', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM recursos WHERE project_id = $1", [id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Error recursos' }); }
});

app.post('/api/recursos', upload.single('archivo'), async (req, res) => {
  const { tipo, project_id, categoria } = req.body;
  const nombreFinal = req.file ? req.file.originalname : req.body.nombre;
  
  const baseUrl = process.env.BASE_URL || 'https://gametech-api.onrender.com';
  const urlFinal = req.file ? `${baseUrl}/uploads/${req.file.filename}` : '#';

  try {
    await pool.query(
      "INSERT INTO recursos (nombre, tipo, url, project_id, categoria) VALUES ($1, $2, $3, $4, $5)",
      [nombreFinal, tipo, urlFinal, project_id, categoria]
    );
    res.json({ success: true });
  } catch (err) { 
      console.error(err);
      res.status(500).json({ error: 'Error guardando recurso' }); 
  }
});

app.delete('/api/recursos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM recursos WHERE id = $1", [id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Error eliminando recurso' }); }
});

app.get('/api/reportes/kpis', async (req, res) => {
  try {
    const proyectos = await pool.query("SELECT * FROM proyectos WHERE estado = 'activo'");
    const presupuesto = proyectos.rows.reduce((sum, p) => sum + parseFloat(p.presupuesto || 0), 0);
    const response = {
      activeProjects: proyectos.rows.length,
      totalBudget: presupuesto,
      efficiency: 81, 
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) { 
      console.error(err);
      res.status(500).json({ error: 'Error KPIs' }); 
    }
});

app.put('/api/proyectos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, gerente, presupuesto, fecha_entrega, genero, plataformas, motor_juego } = req.body;
  
  try {
    await pool.query(
      `UPDATE proyectos SET 
       nombre=$1, descripcion=$2, gerente=$3, presupuesto=$4, fecha_entrega=$5, 
       genero=$6, plataformas=$7, motor_juego=$8 
       WHERE id=$9`,
      [nombre, descripcion, gerente, presupuesto, fecha_entrega, genero, plataformas, motor_juego, id]
    );
    res.json({ success: true, message: "Proyecto actualizado" });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: 'Error editando proyecto' }); 
  }
});

app.post('/api/recover', async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    
    if (result.rows.length > 0) {
      const mensaje = `Hola, hemos recibido una solicitud para recuperar tu acceso al SGP.
      Por políticas de seguridad, el sistema no envía contraseñas automáticamente.
      PASOS A SEGUIR:
      1. Contacta inmediatamente al Administrador del Sistema (Gerencia).
      2. Solicita un restablecimiento manual de credenciales.
      Si tú no solicitaste esto, por favor reportalo.`;

      enviarNotificacion(email, " Recuperación de Acceso - SGP Gametech", mensaje);
      res.json({ success: true, message: "Correo enviado con instrucciones" });
    } else {
      res.json({ success: true, message: "Si el correo existe, se enviaron instrucciones" });
    }
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: 'Error al procesar recuperación' }); 
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});