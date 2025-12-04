import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png'; 

function Sidebar({ currentUser, onLogout }) {
  const location = useLocation();
  const p = location.pathname;
  const isFreelancer = currentUser?.rol === 'Freelancer';

  return (
    <aside className="sidebar">
      <img src={logo} alt="Logo Gametech" width="180" style={{marginBottom: '30px'}} />
      <nav className="nav">
        <Link to="/dashboard">
          <button className={`nav-item ${p === '/dashboard' || p === '/' ? 'active' : ''}`}>Panel de Control</button>
        </Link>
        <Link to="/projects">
          <button className={`nav-item ${p.includes('/projects') ? 'active' : ''}`}>Proyectos</button>
        </Link>
        <Link to="/tasks">
          <button className={`nav-item ${p.includes('/tasks') ? 'active' : ''}`}>Tareas</button>
        </Link>
        
        {!isFreelancer && (
          <>
            <Link to="/reports">
              <button className={`nav-item ${p === '/reports' ? 'active' : ''}`}>Reportes</button>
            </Link>
            <Link to="/settings">
              <button className={`nav-item ${p === '/settings' ? 'active' : ''}`}>Configuración</button>
            </Link>
          </>
        )}
      </nav>
      <button 
        className="btn ghost small" 
        style={{ marginTop: 'auto' }}
        onClick={onLogout}
      >
        Cerrar sesión
      </button>
    </aside>
  );
}
export default Sidebar;