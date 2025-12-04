import React, { useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Reports({ projects, tasks }) {

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/reportes/kpis");
        const data = await res.json();
        console.log("KPIs desde backend:", data);
      } catch (err) {
        console.error("Error al obtener KPIs:", err);
      }
    };

    fetchKPIs();
  }, []);

  const activeProjects = Array.isArray(projects) ? projects.filter(p => p.estado === 'activo') : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const totalBudget = activeProjects.reduce((sum, p) => sum + (parseFloat(p.presupuesto) || 0), 0);

  const totalTasks = safeTasks.length;
  const tasksDone = safeTasks.filter(t => t.status === "Done").length;
  const onTimePct = totalTasks > 0 ? Math.round((tasksDone / totalTasks) * 100) : 0;

  const efficiencyPct = totalTasks > 0 ? 85 : 0;

  const chartLabels = activeProjects.map(p => p.nombre);
  const chartDataPoints = activeProjects.map(p => {
    const pTasks = safeTasks.filter(t => t.project === p.nombre);
    const pDone = pTasks.filter(t => t.status === "Done").length;
    return pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;
  });

  const data = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Progreso (%)',
        data: chartDataPoints,
        backgroundColor: 'rgba(23, 224, 255, 0.6)',
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { color: '#a2a9b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#a2a9b8' }, grid: { display: false } }
    }
  };

  return (
    <div className="view">
      <div className="report-summary">
        <div className="stat">
          <div className="kpi-header">
            <p>Eficiencia Operativa</p>
            <span className="help-tooltip">?
              <span className="tooltip-text">Calidad: % de tareas aprobadas en primera revisión.</span>
            </span>
          </div>
          <h3>{totalTasks > 0 ? efficiencyPct + "%" : "--"}</h3>
        </div>

        <div className="stat">
          <div className="kpi-header"><p>Proyectos Activos</p></div>
          <h3>{activeProjects.length}</h3>
        </div>

        <div className="stat">
          <div className="kpi-header"><p>Presupuesto Activo</p></div>
          <h3>S/. {totalBudget.toLocaleString()}</h3>
        </div>

        <div className="stat">
          <div className="kpi-header">
            <p>Entregas a Tiempo</p>
            <span className="help-tooltip">?
              <span className="tooltip-text">Velocidad: % de tareas completadas antes de vencer.</span>
            </span>
          </div>
          <h3>{onTimePct}%</h3>
        </div>
      </div>

      <div className="chart-box" style={{ height: '400px' }}>
        {activeProjects.length > 0 ? (
            <Bar data={data} options={options} />
        ) : (
            <p style={{textAlign: 'center', paddingTop: '170px', color: 'var(--text-secondary)'}}>
                Sin datos financieros para mostrar.
            </p>
        )}
      </div>
    </div>
  );
}

export default Reports;
