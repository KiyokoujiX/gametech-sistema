import React from 'react';

function Settings({ onToggleTheme, isLightMode }) {
  
  const handleThemeChange = (e) => {
    if (typeof onToggleTheme === 'function') {
        onToggleTheme(e.target.checked);
    }
  };

  return (
    <div className="view">
      <h2>Configuración General</h2>

      <div className="settings-section">
        <div className="header-row">
          <h3>Gestión de Roles y Permisos (Políticas)</h3>
          <span className="help-tooltip">?
            <span className="tooltip-text">
              Visualización de los niveles de acceso actuales del sistema.
            </span>
          </span>
        </div>
        
        <table className="roles-table">
          <thead>
            <tr>
              <th>Rol</th>
              <th>Ver Reportes</th>
              <th>Crear Proyectos</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Gerente</td>
              <td><input type="checkbox" checked disabled /></td>
              <td><input type="checkbox" checked disabled /></td>
            </tr>
            <tr>
              <td>Equipo Interno</td>
              <td><input type="checkbox" checked disabled /></td>
              <td><input type="checkbox" disabled /></td>
            </tr>
            <tr>
              <td>Freelancer</td>
              <td><input type="checkbox" disabled /></td>
              <td><input type="checkbox" disabled /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="settings-section">
        <h3>Apariencia</h3>
        <div className="appearance-toggle">
          <p>Modo Claro</p>
          <label className="switch">
            <input 
                type="checkbox" 
                checked={isLightMode} 
                onChange={handleThemeChange} 
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default Settings;