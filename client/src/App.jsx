import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [serverMessage, setServerMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch from backend to confirm connectivity
    axios
      .get('http://localhost:5000/')
      .then((response) => {
        setServerMessage(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to connect to backend:', err);
        setError(err.message || 'Could not connect to backend');
        setLoading(false);
      });
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-badge">🚜 AgriRent</div>
        <span className="phase-pill">Phase 0: Boilerplate</span>
      </header>

      <main className="main-content">
        <h1>Agri-Equipment Rental Platform</h1>
        <p className="subtitle">
          Full-Stack MERN setup verification & connectivity test
        </p>

        <div className="status-card">
          <div className="card-header">
            <h3>Backend Server Connection</h3>
            <span
              className={`badge ${
                loading ? 'badge-loading' : error ? 'badge-error' : 'badge-success'
              }`}
            >
              {loading ? 'Connecting...' : error ? 'Disconnected' : 'Connected'}
            </span>
          </div>

          <div className="card-body">
            <p className="endpoint-label">
              Target endpoint: <code>GET http://localhost:5000/</code>
            </p>

            <div className="response-box">
              <span className="box-title">Backend Response:</span>
              {loading && <p className="status-text loading-text">Pinging backend...</p>}
              {error && (
                <div className="error-box">
                  <p className="status-text error-text">⚠️ {error}</p>
                  <p className="hint-text">
                    Ensure your backend is running on port 5000 (<code>npm run dev</code> in the <code>server</code> directory).
                  </p>
                </div>
              )}
              {!loading && !error && (
                <p className="status-text success-text" id="backend-response">
                  {serverMessage}
                </p>
              )}
            </div>
          </div>

          <div className="card-footer">
            <div className="meta-item">
              <span className="meta-label">Client:</span> Vite + React
            </div>
            <div className="meta-item">
              <span className="meta-label">Server:</span> Node.js + Express
            </div>
            <div className="meta-item">
              <span className="meta-label">Database:</span> MongoDB (Mongoose)
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
