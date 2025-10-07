import { useState, useEffect } from 'react';

function App() {
  const [logs, setLogs] = useState(['App component mounted']);
  const [error, setError] = useState(null);

  const addLog = (message) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('useEffect running');

    // Test API connection
    fetch('http://localhost:5000/api/health')
      .then(r => {
        addLog('Backend response status: ' + r.status);
        return r.json();
      })
      .then(data => {
        addLog('Backend health: ' + JSON.stringify(data));
      })
      .catch(err => {
        addLog('ERROR fetching backend: ' + err.message);
        setError(err.message);
      });

    // Test videos endpoint
    fetch('http://localhost:5000/api/videos')
      .then(r => r.json())
      .then(data => {
        addLog('Videos found: ' + data.count);
        addLog('Video IDs: ' + data.videos.map(v => v.video_id).join(', '));
      })
      .catch(err => {
        addLog('ERROR fetching videos: ' + err.message);
      });
  }, []);

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#000',
      color: '#0f0',
      fontFamily: 'monospace',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#f00' }}>🔍 Dashboard Debug Mode</h1>

      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#400',
          border: '2px solid #f00',
          marginBottom: '20px'
        }}>
          <strong>ERROR:</strong> {error}
        </div>
      )}

      <div style={{
        backgroundColor: '#111',
        padding: '20px',
        borderRadius: '8px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2 style={{ color: '#0af' }}>Console Logs:</h2>
        {logs.map((log, i) => (
          <div key={i} style={{ marginBottom: '5px' }}>
            {log}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', color: '#ff0' }}>
        <p>If you see this, React is working!</p>
        <p>Backend: http://localhost:5000</p>
        <p>Frontend: http://localhost:5173</p>
      </div>
    </div>
  );
}

export default App;
