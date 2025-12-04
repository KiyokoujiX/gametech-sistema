import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function TaskForm({ onSave, projects, users = [] }) {
  const navigate = useNavigate();
  
  const activeProjects = projects.filter(p => p.estado === 'activo');

  const [form, setForm] = useState({
    title: '', 
    assignee: users.length > 0 ? users[0].nombre : '', 
    deadline: '', 
    status: 'To-Do',
    project: activeProjects.length > 0 ? activeProjects[0].nombre : ''
  });

  const handleChange = (e) => setForm({...form, [e.target.id]: e.target.value});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let assigneeFinal = form.assignee;
    if (!assigneeFinal && users.length > 0) assigneeFinal = users[0].nombre;

    onSave({ ...form, assignee: assigneeFinal });
    navigate('/tasks');
  };

  return (
    <div className="view">
      <div className="header-row">
        <h2>Nueva Tarea</h2>
        <button className="btn ghost small btn-back" onClick={() => navigate('/tasks')}>← Volver</button>
      </div>
      
      <form onSubmit={handleSubmit} className="project-form">
        <label>Título <input type="text" id="title" required onChange={handleChange} /></label>
        
        <label>Asignado a
          <select id="assignee" onChange={handleChange} required>
             {users.length > 0 ? (
                users.map(u => (
                  <option key={u.id} value={u.nombre}>
                    {u.nombre} ({u.rol})
                  </option>
                ))
             ) : (
                <option>Cargando usuarios...</option>
             )}
          </select>
        </label>
        
        <label>Vencimiento <input type="date" id="deadline" required onChange={handleChange} /></label>
        
        <label>Estado
          <select id="status" onChange={handleChange}>
            <option>To-Do</option><option>Doing</option><option>Done</option>
          </select>
        </label>
        
        <label>Proyecto
           <select id="project" onChange={handleChange}>
             {activeProjects.map(p => (
               <option key={p.id} value={p.nombre}>{p.nombre}</option>
             ))}
           </select>
        </label>
        <button type="submit" className="btn primary">Guardar Tarea</button>
      </form>
    </div>
  );
}
export default TaskForm;