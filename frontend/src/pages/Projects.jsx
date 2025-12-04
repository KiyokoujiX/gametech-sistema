import React from 'react'; 
import { Link } from 'react-router-dom';

function Projects({ projects, onArchive, currentUser }) {
  const activeProjects = projects.filter(p => p.estado === 'activo');

  const isManager = currentUser?.rol === 'Gerente';

  const getStatus = (dateStr) => {
    if (!dateStr) return { text: "Sin fecha", cls: "near" };
    
    const now = new Date();
    now.setHours(0,0,0,0);

    const end = new Date(dateStr);
    end.setMinutes(end.getMinutes() + end.getTimezoneOffset());

    if (end < now) return { text: "Vencido", cls: "late" };
    return { text: "A tiempo", cls: "on-time" };
  };

  return (
    <div className="view">
      <div className="header-row">
        <h2>Gestión de Proyectos</h2>
        {isManager && (
          <Link to="/projects/new">
            <button className="btn primary small">+ Nuevo Proyecto</button>
          </Link>
        )}

      </div>
      <div className="projects-grid">
        {activeProjects.map(p => {
          const status = getStatus(p.fecha_entrega);
          const progreso = 50; 

          return (
            <div key={p.id} className="project-card">
              <div className="card-header">
                <h4>{p.nombre}</h4>
                <span className={`status-badge ${status.cls}`}>{status.text}</span>
              </div>
              <p>{p.descripcion}</p>
              <div className="bar"><div style={{width: `${progreso}%`}}></div></div>
              <div className="card-footer">
                <span>Gerente: {p.gerente}</span>
                <span>Entrega: {p.fecha_entrega ? p.fecha_entrega.split('T')[0] : 'N/A'}</span>
              </div>
              
              <Link to={`/projects/${p.id}`} style={{textDecoration:'none'}}>
                  <button className="btn ghost small" style={{width:'100%', marginTop:'10px'}}>Ver Detalles</button>
              </Link>
              
              {status.text === "Vencido" && (
                <button className="btn-archive" onClick={() => onArchive(p.id)}>
                  Archivar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default Projects;