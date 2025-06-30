import React from 'react';
import '../assets/styles/Loading.css';

function LoadingPage() {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">Loading... Please wait</p>
    </div>
  );
}

export default LoadingPage;
