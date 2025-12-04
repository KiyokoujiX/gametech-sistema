import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectForm from './pages/ProjectForm';
import ProjectDetail from './pages/ProjectDetail';
import Tasks from './pages/Tasks';
import TaskForm from './pages/TaskForm';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import './index.css';
import logo from './assets/logo.png'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [usersList, setUsersList] = useState([]); 
  const [showRecover, setShowRecover] = useState(false);

  const [isLightMode, setIsLightMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light';
  });
  const appScreenRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedAuth = localStorage.getItem('isAuthenticated');
    
    if (savedUser && savedAuth === 'true') {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const appScreen = document.getElementById('app-screen');
    if (appScreenRef.current) {
      if (isLightMode) appScreenRef.current.classList.add('light-mode');
      else appScreen.classList.remove('light-mode');
    }
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
  }, [isLightMode]);

  const toggleTheme = (checked) => { setIsLightMode(checked); };

  const fetchData = async () => {
    try {
      const resProjects = await fetch('https://gametech-api.onrender.com/api/proyectos-activos');
      const dataProjects = await resProjects.json();
      setProjects(Array.isArray(dataProjects) ? dataProjects : []);

      const resTasks = await fetch('https://gametech-api.onrender.com/api/tareas');
      const dataTasks = await resTasks.json();
      setTasks(Array.isArray(dataTasks) ? dataTasks : []);

      const resUsers = await fetch('https://gametech-api.onrender.com/api/usuarios');
      const dataUsers = await resUsers.json();
      setUsersList(Array.isArray(dataUsers) ? dataUsers : []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (email, password) => {
    try {
      const res = await fetch('https://gametech-api.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor.");
    }
  };

  const handleRecover = async (email) => {
    try {
        await fetch('https://gametech-api.onrender.com/api/recover', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        alert("Si el correo existe, se han enviado las instrucciones.");
        setShowRecover(false);
    } catch (error) { alert("Error al enviar solicitud"); }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    window.location.href = "/";
  };

  const addProject = async (newProject) => {
    await fetch('https://gametech-api.onrender.com/api/proyectos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newProject)
    });
    fetchData();
  };

  const editProject = async (id, updatedProject) => {
    await fetch(`https://gametech-api.onrender.com/api/proyectos/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedProject)
    });
    fetchData();
  };

  const addTask = async (newTask) => {
    await fetch('https://gametech-api.onrender.com/api/tareas', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTask)
    });
    fetchData();
  };

  const archiveProject = async (projectId) => {
    await fetch(`https://gametech-api.onrender.com/api/proyectos/${projectId}/archivar`, { method: 'PUT' });
    fetchData();
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    await fetch(`https://gametech-api.onrender.com/api/tareas/${taskId}/estado`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus })
    });
    fetchData();
  };

  if (!isAuthenticated) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <img src={logo} alt="Logo Gametech" width="160" />
          <p className="lead">Sistema Centralizado SGP</p>
          
          {!showRecover ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleLogin(e.target[0].value, e.target[1].value);
              }}>
                <label>Correo <input type="email" placeholder="admin@gametech.pe" required /></label>
                <label>Contraseña <input type="password" placeholder="••••••••" required /></label>
                <button type="submit" className="btn primary" style={{width: '100%'}}>Iniciar sesión</button>
                
                <p className="forgot">
                    <a href="#" onClick={(e) => { e.preventDefault(); setShowRecover(true); }}>
                        ¿Olvidaste tu contraseña?
                    </a>
                </p>
              </form>
          ) : (
              <form onSubmit={(e) => {
                  e.preventDefault();
                  handleRecover(e.target[0].value);
              }}>
                  <h3>Recuperar Cuenta</h3>
                  <p style={{fontSize:'13px', color:'#aaa'}}>Ingresa tu correo para recibir instrucciones.</p>
                  <label>Correo <input type="email" placeholder="tu@correo.com" required /></label>
                  <button type="submit" className="btn primary" style={{width: '100%'}}>Enviar Correo</button>
                  <button type="button" className="btn ghost" style={{width: '100%', marginTop:'10px'}} onClick={() => setShowRecover(false)}>Cancelar</button>
              </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div id="app-screen" ref={appScreenRef} style={{ display: 'flex', height: '100vh' }}>
       <Sidebar currentUser={user} onLogout={handleLogout} />
        
        <section className="content" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <div className="views" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            <Routes>
              <Route path="/" element={<Dashboard projects={projects} tasks={tasks} />} />
              <Route path="/dashboard" element={<Dashboard projects={projects} tasks={tasks} />} />
              
              <Route path="/projects" element={<Projects projects={projects} onArchive={archiveProject} currentUser={user} />} />
              
              <Route path="/projects/new" element={<ProjectForm onSave={addProject} users={usersList} />} />
              <Route path="/projects/edit/:id" element={<ProjectForm onSave={editProject} users={usersList} isEdit={true} projects={projects} />} />
              
              <Route path="/projects/:id" element={<ProjectDetail currentUser={user} onUpdateTask={updateTaskStatus} />} />
              
              <Route 
                path="/tasks" 
                element={
                  <Tasks 
                    tasks={tasks} 
                    currentUser={user} 
                    onUpdateTask={updateTaskStatus}
                    onTaskDeleted={fetchData}   // ← Esto evita recargar toda la página
                  />
                } 
              />
              
              <Route path="/tasks/new" element={<TaskForm onSave={addTask} projects={projects} users={usersList} />} />
              <Route path="/reports" element={<Reports projects={projects} tasks={tasks} />} />
              <Route path="/settings" element={<Settings onToggleTheme={toggleTheme} isLightMode={isLightMode} />} />
            </Routes>
          </div>
        </section>
      </div>
    </Router>
  );
}

function Header() {
  const location = useLocation();
  let title = "Panel de Control";
  if (location.pathname.includes("projects")) title = "Proyectos";
  if (location.pathname.includes("tasks")) title = "Tareas";
  if (location.pathname.includes("reports")) title = "Reportes";
  if (location.pathname.includes("settings")) title = "Configuración";
  return (
    <header className="topbar">
      <h1 id="viewTitle">{title}</h1>
      <input type="text" id="searchInput" placeholder="Buscar..." />
    </header>
  );
}

export default App;