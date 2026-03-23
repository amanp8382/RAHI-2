import React from 'react';

const Alerts = () => {
  return (
    <section id="alerts" className="page active">
      <div className="container">
        <h1>Safety Alerts</h1>
        <p>Current safety alerts and advisories for tourists.</p>
        <div className="placeholder-content">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Active Alerts</h3>
            </div>
            <div className="card-content">
              <div className="alerts-list">
                <div className="alert-item">
                  <span className="alert-info">
                    <span className="alert-dot severe"></span>
                    Heavy crowd near Red Fort - Avoid during 2-4 PM
                  </span>
                  <span className="alert-level severe">Severe</span>
                </div>
                <div className="alert-item">
                  <span className="alert-info">
                    <span className="alert-dot high"></span>
                    Road closure at Connaught Place due to construction
                  </span>
                  <span className="alert-level high">High</span>
                </div>
                <div className="alert-item">
                  <span className="alert-info">
                    <span className="alert-dot medium"></span>
                    Rain expected in Central Delhi - Carry umbrella
                  </span>
                  <span className="alert-level medium">Medium</span>
                </div>
                <div className="alert-item">
                  <span className="alert-info">
                    <span className="alert-dot low"></span>
                    Festival celebration at India Gate - Enjoy responsibly
                  </span>
                  <span className="alert-level low">Low</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Alerts;