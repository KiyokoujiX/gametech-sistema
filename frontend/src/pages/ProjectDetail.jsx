import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ProjectDetail = ({ currentUser, onUpdateTask }) => {
  const { id } = useParams();            
  const navigate = useNavigate();        
  const [project, setProject] = useState(null);
  const [documentos, setDocumentos] = useState([]); 
  const [recursos, setRecursos] = useState([]);     
  const [tareas, setTareas] = useState([]);
  const [activeTab, setActiveTab] = useState('tareas'); 
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');

  const isFreelancer = currentUser?.rol === 'Freelancer';
  const isManager = currentUser?.rol === 'Gerente';

  const cargarDatos = async () => {
      try {
        const projRes = await fetch(`http://localhost:3000/api/proyectos`); 
        const todosLosProyectos = await projRes.json();
        const proj = todosLosProyectos.find(p => String(p.id) === String(id));

        const tareasRes = await fetch(`http://localhost:3000/api/tareas`);
        const todasTareas = await tareasRes.json();

        const recRes = await fetch(`http://localhost:3000/api/proyectos/${id}/recursos`);
        const todosRecursos = await recRes.json();

        if (proj) {
            setProject(proj);
            setTareas(todasTareas.filter(t => t.project === proj.nombre));

            const listaRec = Array.isArray(todosRecursos) ? todosRecursos : [];
            setDocumentos(listaRec.filter(r => r.categoria === 'documentacion'));
            setRecursos(listaRec.filter(r => r.categoria === 'recurso'));
        }
        setLoading(false);
      } catch (err) { console.error(err); setLoading(false); }
  };

  useEffect(() => { cargarDatos(); }, [id]);

  const subirRecurso = async (e, categoria) => {
    e.preventDefault();
    const formData = new FormData();
    if (selectedFile) {
        formData.append('archivo', selectedFile);
        formData.append('nombre', fileName || selectedFile.name);
        formData.append('tipo', selectedFile.name.split('.').pop().toUpperCase());
    } else {
        if(!fileName) return alert("Escribe un nombre");
        formData.append('nombre', fileName);
        formData.append('tipo', 'Enlace');
    }
    formData.append('project_id', id);
    formData.append('categoria', categoria);

    try {
        await fetch('http://localhost:3000/api/recursos', { method: 'POST', body: formData });
        setSelectedFile(null); setFileName(''); e.target.reset();
        cargarDatos();
        alert("Guardado exitosamente");
    } catch (error) { alert("Error al subir"); }
  };

  const eliminarRecurso = async (recursoId) => {
      if(!window.confirm("¿Estás seguro de eliminar este archivo permanentemente?")) return;
      try {
          await fetch(`http://localhost:3000/api/recursos/${recursoId}`, { method: 'DELETE' });
          cargarDatos(); 
      } catch(e) { alert("Error al eliminar recurso"); }
  };

  const cambiarEstado = async (taskId, nuevoEstado) => {
    if (onUpdateTask) {
        await onUpdateTask(taskId, nuevoEstado);
        cargarDatos(); 
    }
  };

  const getStatusClass = (status) => {
    const s = status ? status.toLowerCase() : '';
    if (s.includes('done') || s.includes('complet')) return 'status-done';
    if (s.includes('doing') || s.includes('progres')) return 'status-doing';
    return 'status-todo';
  };

  if (loading) return <div className="view"><h2 style={{textAlign:'center', padding:'100px'}}>Cargando...</h2></div>;
  if (!project) return <div className="view"><h2 style={{color:'red', textAlign:'center'}}>Proyecto no encontrado</h2></div>;

  return (
    <div className="view">
      <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/projects')} className="btn ghost">← Volver</button>
        
        {isManager && (
            <button 
                onClick={() => navigate(`/projects/edit/${id}`)} 
                className="btn ghost" 
                style={{borderColor: 'var(--state-yellow)', color: 'var(--state-yellow)'}}
            >
                ✏️ Editar Datos
            </button>
        )}
      </div>

      <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>{project.nombre}</h2>
      <p style={{ color: '#888', marginBottom: '30px' }}>{project.descripcion}</p>

      <div className="tabs">
        <button onClick={() => setActiveTab('tareas')} className={`tab-btn ${activeTab === 'tareas' ? 'active' : ''}`}>Lista de Tareas</button>
        <button onClick={() => setActiveTab('recursos')} className={`tab-btn ${activeTab === 'recursos' ? 'active' : ''}`}>Recursos</button>
        <button onClick={() => setActiveTab('documentacion')} className={`tab-btn ${activeTab === 'documentacion' ? 'active' : ''}`}>Documentación</button>
      </div>

      {activeTab === 'tareas' && (
        <div className="tab-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ color: '#00b7ff', margin: 0 }}>Tareas del Proyecto</h3>
              {!isFreelancer && (
                  <Link to="/tasks/new" state={{ projectName: project.nombre }}>
                      <button className="btn primary small">+ Añadir Tarea</button>
                  </Link>
              )}
          </div>
          {tareas.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic' }}>No hay tareas asignadas.</p>
          ) : (
            <div className="tasks-list">
              {tareas.map((tarea, i) => {
                const s = tarea.status ? tarea.status.toLowerCase() : '';
                return (
                <div key={i} className="task" style={{borderLeft: '4px solid transparent'}}>
                  <div style={{flex: 2}}>
                      <strong style={{fontSize: '16px'}}>{tarea.title}</strong> 
                      <div style={{ fontSize: '13px', color: '#aaa', marginTop: '4px' }}>
                        Asignado: {tarea.assignee}
                      </div>
                  </div>
                  
                  <div style={{flex: 1}}>
                    <span className={`task-status-badge ${getStatusClass(tarea.status)}`}>
                        {tarea.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>
                      {(s.includes('to-do') || s.includes('pendiente')) && (
                          <button className="btn ghost small" style={{padding: '4px 10px', fontSize:'12px'}} onClick={() => cambiarEstado(tarea.id, 'Doing')}>
                              ▶ Iniciar
                          </button>
                      )}
                      {(s.includes('doing') || s.includes('en progreso')) && (
                          <button className="btn primary small" style={{padding: '4px 10px', fontSize:'12px'}} onClick={() => cambiarEstado(tarea.id, 'Done')}>
                              ✓ Terminar
                          </button>
                      )}
                      {(s.includes('done') || s.includes('completado')) && (
                          <span style={{ color: '#4bc0c0', fontWeight: 'bold' }}>¡Completado!</span>
                      )}
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      )}

      {activeTab === 'recursos' && (
        <div className="tab-content">
            <h3 style={{color:'#00b7ff', marginBottom:'15px'}}>Archivos y Entregables</h3>
            <div className="resource-list">
                {recursos.length === 0 && <p style={{color:'#666'}}>No hay archivos subidos.</p>}
                {recursos.map((r, idx) => (
                    <div key={idx} className="resource-item" style={{ display:'flex', alignItems:'center', gap:'15px', background:'rgba(255,255,255,0.03)', padding:'10px', marginBottom:'8px', borderRadius:'8px', justifyContent:'space-between' }}>
                        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                            <span style={{fontSize:'24px'}}>📁</span>
                            <div>
                                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none', color:'white'}}><h4 style={{margin:0}}>{r.nombre}</h4></a>
                                <p style={{margin:0, fontSize:'12px', color:'#888'}}>{r.tipo}</p>
                            </div>
                        </div>
                        
                        {!isFreelancer && (
                             <button 
                                onClick={() => eliminarRecurso(r.id)} 
                                style={{background:'none', border:'none', cursor:'pointer', fontSize:'18px'}} 
                                title="Eliminar archivo"
                             >
                                🗑️
                             </button>
                        )}
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '20px', padding: '20px', border: '1px dashed #555', borderRadius: '8px' }}>
                <h4 style={{marginTop:0, color:'#aaa'}}>Subir nuevo recurso</h4>
                <form onSubmit={(e) => subirRecurso(e, 'recurso')} style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    <input type="file" onChange={(e) => { setSelectedFile(e.target.files[0]); setFileName(e.target.files[0]?.name || ''); }} style={{padding:'10px', background:'#222'}} />
                    <button className="btn primary small">Subir Archivo</button>
                </form>
            </div>
        </div>
      )}

      {activeTab === 'documentacion' && (
        <div className="tab-content">
            <h3 style={{ color: '#00b7ff', marginBottom: '20px' }}>Documentación Oficial</h3>
            {documentos.length === 0 && <p style={{color:'#666'}}>No hay documentación oficial cargada.</p>}
            {documentos.map((d, idx) => (
                 <div key={idx} className="resource-item" style={{ display:'flex', alignItems:'center', gap:'15px', background:'rgba(255,255,255,0.03)', padding:'15px', borderRadius:'8px', marginBottom:'10px', justifyContent:'space-between' }}>
                    <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                        <span style={{fontSize:'24px'}}>📘</span>
                        <div>
                            <a href={d.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none', color:'white'}}><h4 style={{margin:0}}>{d.nombre}</h4></a>
                            <p style={{margin:0, fontSize:'12px', color:'#888'}}>{d.tipo}</p>
                        </div>
                    </div>
                    
                    {!isFreelancer && (
                         <button 
                            onClick={() => eliminarRecurso(d.id)} 
                            style={{background:'none', border:'none', cursor:'pointer', fontSize:'18px'}}
                            title="Eliminar documento"
                         >
                            🗑️
                         </button>
                    )}
                 </div>
            ))}
             <div style={{ marginTop: '20px', padding: '20px', border: '1px dashed #555', borderRadius: '8px' }}>
                <h4 style={{marginTop:0, color:'#aaa'}}>Agregar Documento</h4>
                <form onSubmit={(e) => subirRecurso(e, 'documentacion')} style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    <input type="file" onChange={(e) => { setSelectedFile(e.target.files[0]); setFileName(e.target.files[0]?.name || ''); }} style={{padding:'10px', background:'#222'}} />
                    <button className="btn primary small">Agregar</button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};
export default ProjectDetail;