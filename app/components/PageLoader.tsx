'use client'

import React from 'react'

export default function PageLoader() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      background: '#111110', // Глубокий темный фон
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999999, // Поверх всего
      overflow: 'hidden',
      pointerEvents: 'all'
    }}>
      <style>{`
        @keyframes driveBackwards {
          0% { transform: translateX(120vw); }
          100% { transform: translateX(-120vw); }
        }

        @keyframes bumpyRide {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2.5px); }
        }

        @keyframes roadMoving {
          from { transform: translateX(-150px); opacity: 0; }
          50% { opacity: 0.3; }
          to { transform: translateX(150px); opacity: 0; }
        }

        .car-wrapper {
          position: absolute;
          width: 100%;
          display: flex;
          justifyContent: center;
          align-items: center;
          animation: driveBackwards 4.2s infinite linear; /* Твоя скорость 4.2с */
          will-change: transform;
        }

        .monjaro-img {
          width: 280px; 
          height: auto;
          filter: drop-shadow(0 12px 25px rgba(255, 107, 0, 0.4));
          animation: bumpyRide 0.2s infinite ease-in-out;
          transform: scaleX(-1); /* Едет лицом вперед */
        }

        .road-line-container {
          position: absolute;
          top: calc(50% + 55px);
          width: 220px;
          height: 3px;
          display: flex;
          gap: 25px;
          transform: scaleX(-1);
        }

        .road-seg {
          flex: 1;
          background: #ff6b00;
          border-radius: 4px;
          animation: roadMoving 0.7s infinite linear;
        }
      `}</style>

      <div className="car-wrapper">
        <div style={{ position: 'relative' }}>
          <img 
            src="/car-icon.png" 
            alt="Monjaro" 
            className="monjaro-img"
            style={{ display: 'block' }}
          />
          <div className="road-line-container">
            <div className="road-seg" style={{ animationDelay: '0s' }}></div>
            <div className="road-seg" style={{ animationDelay: '0.2s' }}></div>
            <div className="road-seg" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>

      <p style={{ 
        position: 'absolute',
        bottom: '10%',
        fontSize: '11px', 
        color: '#333', 
        fontWeight: 800, 
        letterSpacing: '12px',
        textTransform: 'uppercase',
        opacity: 0.6
      }}>
        AUTOMATE
      </p>
    </div>
  )
}