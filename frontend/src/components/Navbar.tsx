import React from 'react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAssumptions: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onOpenAssumptions }) => {
  return (
    <header className="header-nav">
      <div className="brand-container">
        <img src="/static/assets/zerog-team-logo.jpg" alt="ZeroG Flames Logo" className="team-logo-img" />
        <div className="brand-text">
          <h1>ZeroG FLAMES</h1>
          <div className="brand-badge">
            <span>NASA SPACE APPS CHALLENGE</span>
            <span>•</span>
            <span>MICROGRAVITY COMBUSTION</span>
          </div>
        </div>
      </div>

      <nav className="nav-links">
        <button className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => onTabChange('home')}>🏠 Home</button>
        <button className={`nav-tab ${activeTab === 'lab' ? 'active' : ''}`} onClick={() => onTabChange('lab')}>🔬 Zero-G Lab</button>
        <button className={`nav-tab ${activeTab === 'compare' ? 'active' : ''}`} onClick={() => onTabChange('compare')}>⚖️ Compare (1g vs 0g)</button>
        <button className={`nav-tab ${activeTab === 'experiments' ? 'active' : ''}`} onClick={() => onTabChange('experiments')}>📊 Experiments</button>
        <button className={`nav-tab ${activeTab === 'science' ? 'active' : ''}`} onClick={() => onTabChange('science')}>📚 Science Hub</button>
        <button className={`nav-tab ${activeTab === 'safety' ? 'active' : ''}`} onClick={() => onTabChange('safety')}>🛡️ Spacecraft Safety</button>
      </nav>

      <div className="header-meta">
        <button className="btn-secondary" onClick={onOpenAssumptions} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
          📋 Assumptions
        </button>
        <span className="model-badge">v1.0.0 Reduced-Order</span>
        <img src="/static/assets/nasa-space-apps-logo.svg" alt="NASA Space Apps Logo" className="nasa-logo-img" />
      </div>
    </header>
  );
};
