import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard({ projects, tasks }) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeProjects = Array.isArray(projects) ? projects : [];
  const activeProjects = safeProjects.filter(p => p.estado === 'activo');
  const activeProjectNames = activeProjects.map(p => p.nombre);
  
  const activeTasksCount = safeTasks.filter(t => 
    t.status !== "Done" && activeProjectNames.includes(t.project)
  ).length;
  
  const totalTasks = safeTasks.length;
  const tasksDone = safeTasks.filter(t => t.status === "Done").length;
  const onTimePct = totalTasks > 0 ? Math.round((tasksDone / totalTasks) * 100) : 0;

  const colaboradores = 10; 

  const chartData = {
    labels: activeProjectNames.length > 0 ? activeProjectNames : ['Sin Proyectos'],
    datasets: [
      {
        label: 'Done',
        data: activeProjects.map(p => safeTasks.filter(t => t.project === p.nombre && t.status === "Done").length),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Doing',
        data: activeProjects.map(p => safeTasks.filter(t => t.project === p.nombre && t.status === "Doing").length),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'To-Do',
        data: activeProjects.map(p => safeTasks.filter(t => t.project === p.nombre && t.status === "To-Do").length),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#a2a9b8' } } 
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: '#a2a9b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#a2a9b8' }, grid: { display: false } }
    }
  };

  return (
    <div className="view">
      <div className="stats">
        <div className="stat">
            <h3>{activeProjects.length}</h3>
            <p>Proyectos activos</p>
        </div>
        <div className="stat">
            <h3>{activeTasksCount}</h3>
            <p>Tareas pendientes</p>
        </div>
        <div className="stat">
            <h3>{colaboradores}</h3>
            <p>Colaboradores</p>
        </div>
        <div className="stat">
            <h3>{onTimePct}%</h3>
            <p>Entregas a tiempo</p>
        </div>
      </div>
      
      <div className="chart-box" style={{ height: '400px' }}>
         {activeProjects.length > 0 ? (
             <Bar data={chartData} options={options} />
         ) : (
             <p style={{textAlign: 'center', paddingTop: '170px', color: 'var(--text-secondary)'}}>
                 No hay proyectos activos. Crea uno para ver estadísticas.
             </p>
         )}
      </div>
    </div>
  );
}
export default Dashboard;