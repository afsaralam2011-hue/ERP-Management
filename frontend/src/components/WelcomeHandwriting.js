import React from 'react';
import './WelcomeHandwriting.css';

const WelcomeHandwriting = () => {
  const text = "Pakistan Wire Industries  |  Welcome to ERP System  |  Welcome to Control Cable Division";

  return (
    <div className="welcome-handwriting-wrapper">
      <div className="paper-background">
        <div className="paper-lines"></div>
        
        <div className="continuous-loop-container">
          <div className="text-track">
            <span className="loop-text">
              {text}
            </span>
            <span className="loop-text duplicate">
              {text}
            </span>
            <span className="loop-text duplicate">
              {text}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHandwriting;