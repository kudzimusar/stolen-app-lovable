import { useEffect } from 'react';

export function TestApp() {
  useEffect(() => {
    console.log('[v0] React App mounted successfully');
  }, []);

  return (
    <div className="TestApp" style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🎉 App is working!</h1>
      <p>React is successfully mounting and rendering.</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <strong>Status:</strong> ✅ Application loaded successfully
      </div>
    </div>
  );
}
