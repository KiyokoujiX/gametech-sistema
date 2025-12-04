import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function ProjectForm({ onSave, users = [], isEdit = false, projects = [] }) {
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  const gerentes = users.filter(u => u.rol === 'Gerente');

  const [form, setForm] = useState({
    nombre: '', descripcion: '', gerente: '', presupuesto: '', fecha_entrega: '', genero: 'Aventura', plataformas: 'PC', motor_juego: 'Unity'
  });

  useEffect(() => {
    if (isEdit && id && projects.length > 0) {
  
        const projectToEdit = projects.find(p => String(p.id) === String(id));
        if (projectToEdit) {
            setForm({
                ...projectToEdit,
                fecha_entrega: projectToEdit.fecha_entrega ? projectToEdit.fecha_entrega.split('T')[0] : ''
            });
        }
    }
  }, [isEdit, id, projects]);

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  const handleSubmit = (e) => {
    e.preventDefault();
    let gerenteFinal = form.gerente;
    if (!gerenteFinal && gerentes.length > 0) gerenteFinal = gerentes[0].nombre;

    if (isEdit) {
        onSave(id, { ...form, gerente: gerenteFinal, presupuesto: parseInt(form.presupuesto) });
    } else {
        onSave({ ...form, gerente: gerenteFinal, presupuesto: parseInt(form.presupuesto) });
    }
    navigate('/projects');
  };

  return (
    <div className="view">
      <div className="header-row">
        <h2>{isEdit ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
        <button className="btn ghost small btn-back" onClick={() => navigate('/projects')}>← Volver</button>
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        <label>Nombre del Proyecto <input type="text" name="nombre" value={form.nombre} required onChange={handleChange} /></label>
        <label>Descripción / Objetivos <textarea name="descripcion" value={form.descripcion} rows="3" required onChange={handleChange}></textarea></label>
        
        <label>Gerente
          <select name="gerente" value={form.gerente} onChange={handleChange} required>
            <option value="">Seleccione...</option>
            {gerentes.map(user => (
                <option key={user.id} value={user.nombre}>{user.nombre}</option>
            ))}
          </select>
        </label>

        <label>Género
            <select name="genero" value={form.genero} onChange={handleChange}>
                <option>Aventura</option><option>RPG</option><option>Simulación</option><option>Estrategia</option><option>Acción</option>
            </select>
        </label>
        
        <label>Plataformas
             <select name="plataformas" value={form.plataformas} onChange={handleChange}>
                  <option>PC</option><option>Consola</option><option>Móvil</option><option>Multiplataforma</option>
             </select>
        </label>

        <label>Motor de Juego
            <select name="motor_juego" value={form.motor_juego} onChange={handleChange}>
                <option>Unity</option><option>Unreal</option><option>Godot</option><option>Propio</option>
            </select>
        </label>
        
        <label>Presupuesto (S/.) <input type="number" name="presupuesto" value={form.presupuesto} required onChange={handleChange} /></label>
        <label>Fecha Entrega <input type="date" name="fecha_entrega" value={form.fecha_entrega} required onChange={handleChange} /></label>
        
        <button type="submit" className="btn primary">{isEdit ? 'Actualizar Proyecto' : 'Guardar Proyecto'}</button>
      </form>
    </div>
  );
}
export default ProjectForm;