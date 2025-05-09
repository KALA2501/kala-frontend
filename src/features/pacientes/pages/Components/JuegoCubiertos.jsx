import React from 'react';

const JuegoCubiertos = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        src="http://localhost:9094/Cubiertos"
        title="Juego Cubiertos"
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
};

export default JuegoCubiertos;
