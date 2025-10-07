import { useState, useEffect } from 'react';

function App() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    console.log('App mounted');
    setStatus('App is working! ✓');

    // Test API
    fetch('http://localhost:5000/api/videos')
      .then(r => r.json())
      .then(data => {
        console.log('API Response:', data);
        setStatus(`Found ${data.count} video(s): ${data.videos.map(v => v.video_id).join(', ')}`);
      })
      .catch(err => {
        console.error('API Error:', err);
        setStatus('Error: ' + err.message);
      });
  }, []);

  return (
    <div style={{
      padding: '40px',
      backgroundColor: '#000',
      color: '#fff',
      minHeight: '100vh',
      fontFamily: 'system-ui'
    }}>
      <h1 style={{ color: '#ff0000', marginBottom: '20px' }}>
        🎬 Video Analytics Dashboard
      </h1>
      <div style={{
        padding: '20px',
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        border: '2px solid #333'
      }}>
        <p style={{ fontSize: '18px', marginBottom: '10px' }}>
          Status: {status}
        </p>
        <div style={{ marginTop: '20px', color: '#666' }}>
          <p>✓ React is working</p>
          <p>✓ State management is working</p>
          <p>✓ Checking API connection...</p>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
        <h2 style={{ color: '#ff0000', marginBottom: '15px' }}>Next Step:</h2>
        <p>If you see this, the basic app is working. Now we need to add components one by one to find which one is causing the black screen.</p>
      </div>
    </div>
  );
}

export default App;
