import React from 'react';

const Admin = () => {
  return (
    <section id="admin" className="page active">
      <div className="container">
        <h1>Admin Portal</h1>
        <p>Administrative access for authorities and system management.</p>
        <div className="admin-login">
          <div className="card admin-card">
            <div className="card-header">
              <h3 className="card-title">Administrator Login</h3>
            </div>
            <div className="card-content">
              <form className="admin-form">
                <div className="form-group">
                  <label htmlFor="admin-username">Username</label>
                  <input type="text" id="admin-username" name="username" />
                </div>
                <div className="form-group">
                  <label htmlFor="admin-password">Password</label>
                  <input type="password" id="admin-password" name="password" />
                </div>
                <button type="submit" className="btn btn-primary">Login</button>
              </form>
              <div className="admin-links">
                <a href="#" className="link">Forgot Password?</a>
                <a href="#" className="link">Request Access</a>
                <button 
                  className="btn btn-secondary" 
                  style={{marginTop: '10px', width: '100%'}}
                  onClick={() => window.location.hash = '#emergency-dashboard'}
                >
                  🚨 Emergency Dashboard (Demo)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Admin;