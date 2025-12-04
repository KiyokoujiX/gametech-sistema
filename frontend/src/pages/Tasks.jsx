import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Tasks = ({ tasks = [], currentUser, onUpdateTask, onTaskDeleted }) => {
  const [filter, setFilter] = useState('all');
  const isFreelancer = currentUser?.rol === 'Freelancer';

  const eliminarTarea = async (taskId) => {
    if (!window.confirm("¿Estás seguro de eliminar esta tarea permanentemente?")) return;

    try {
      await fetch(`https://gametech-api.onrender.com/api/tareas/${taskId}`, { 
        method: 'DELETE' 
      });
      if (onTaskDeleted) onTaskDeleted();

    } catch (e) {
      alert("Error al eliminar");
    }
  };

  const normalizeStatus = (status) => status ? status.toLowerCase() : '';

  const getTaskStatus = (task) => {
    const s = normalizeStatus(task.status);

    if (s.includes('done') || s.includes('complet') || s.includes('terminad')) return 'on-time';

    if (task.deadline) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const deadlineDate = new Date(task.deadline);
      deadlineDate.setMinutes(deadlineDate.getMinutes() + deadlineDate.getTimezoneOffset());
      deadlineDate.setHours(0, 0, 0, 0);

      if (deadlineDate.getTime() < now.getTime()) return 'late'; // Vencida
      
      const diffTime = deadlineDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
      if (diffDays <= 3) return 'near'; // Cerca
    }
    
    return 'on-time';
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    const status = getTaskStatus(task);
    return status === filter;
  });

  const formatDate = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d.toLocaleDateString('es-PE');
  };

  const getBorderClass = (task) => {
    const status = getTaskStatus(task);
    return status === 'late' ? 'task late' :
           status === 'near' ? 'task near' : 'task on-time';
  };

  const getAlertText = (task) => {
    const status = getTaskStatus(task);
    return status === 'late' ? 'Vencida' :
           status === 'near' ? 'Cerca' : 'A tiempo';
  };

  const getAlertClass = (task) => {
    const status = getTaskStatus(task);
    return status === 'late' ? 'alert-late' :
           status === 'near' ? 'alert-near' : 'alert-on-time';
  };

  return (
    <div className="view">
      <div className="header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <h2 style={{ margin: 0 }}>Mis Tareas</h2>
          <select
            id="taskFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: '140px' }}
          >
            <option value="all">Todas</option>
            <option value="on-time">A tiempo</option>
            <option value="near">Cerca</option>
            <option value="late">Vencidas</option>
          </select>
        </div>

        {!isFreelancer && (
            <NavLink to="/tasks/new" className="btn primary">
            + Nueva Tarea
            </NavLink>
        )}
      </div>

      <div className="task-header">
        <span>Tarea</span>
        <span>Asignado a</span>
        <span>Estado / Acción</span>
        <span>Vencimiento</span>
        <span>Alerta</span>
      </div>

      <div className="tasks-list">
        {filteredTasks.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray)', gridColumn: '1/-1' }}>
            No hay tareas registradas con este criterio.
          </div>
        ) : (
          filteredTasks.map(task => {
            const s = normalizeStatus(task.status);
            return (
            <div key={task.id} className={getBorderClass(task)}>
              <span style={{fontWeight: '500'}}>{task.title}</span>
              <span>{task.assignee}</span>
              
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                 <span style={{color: 'var(--white)', marginRight: '5px'}}>{task.status}</span>
                 
                 {(s.includes('to-do') || s.includes('pendiente')) && (
                    <button 
                        className="btn ghost small" 
                        style={{padding: '2px 8px', fontSize: '11px'}}
                        onClick={() => onUpdateTask(task.id, 'Doing')}
                    >
                        ▶ Iniciar
                    </button>
                 )}

                 {(s.includes('doing') || s.includes('en progreso')) && (
                    <button 
                        className="btn primary small" 
                        style={{padding: '2px 8px', fontSize: '11px'}}
                        onClick={() => onUpdateTask(task.id, 'Done')}
                    >
                        ✓ Terminar
                    </button>
                 )}
                 
                 {!isFreelancer && (
                    <button 
                        onClick={() => eliminarTarea(task.id)} 
                        style={{background:'none', border:'none', cursor:'pointer', fontSize:'16px', marginLeft:'5px'}}
                        title="Eliminar Tarea"
                    >
                        🗑️
                    </button>
                 )}
              </div>

              <span>{formatDate(task.deadline)}</span>
              
              <span className={`status-badge ${getAlertClass(task).replace('alert-', '')}`}>
                {getAlertText(task)}
              </span>
            </div>
          )})
        )}
      </div>
    </div>
  );
};

export default Tasks;