import React from 'react';
import UnifiedMap from './components/UnifiedMap';
import './MapStyle.css';

function App() {
  return (
    <div>
      <h2 style={{ textAlign: 'center', marginTop: '10px' }}>
        🎣 Fishing Route Optimizer
      </h2>
      <UnifiedMap />
    </div>
  );
}

export default App;
