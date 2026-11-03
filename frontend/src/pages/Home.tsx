import React from 'react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <main className="page-view active">
      <section className="hero-section">
        <div className="hero-badge">
          <span>🚀 NASA SPACE APPS CHALLENGE 2026</span>
          <span>•</span>
          <span>MICROGRAVITY PHYSICS</span>
        </div>
        <h1 className="hero-title">ZERO-G FLAMES</h1>
        <h2 className="hero-subtitle">Fire without gravity.</h2>
        <p className="hero-desc">
          Explore how reduced gravity alters buoyancy, natural convection, oxygen transport, and flame morphology — from Earth surface to orbital microgravity and spacecraft habitats.
        </p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={() => onNavigate('lab')}>
            <span>🔬 ENTER THE ZERO-G LAB</span>
            <span>→</span>
          </button>
          <button className="btn-secondary" onClick={() => onNavigate('science')}>
            <span>📚 EXPLORE THE SCIENCE</span>
          </button>
          <button className="btn-secondary" onClick={() => onNavigate('compare')}>
            <span>⚖️ EARTH VS MICROGRAVITY</span>
          </button>
        </div>

        <div className="science-chain">
          <div className="chain-step">Gravity (g)</div>
          <div className="chain-arrow">→</div>
          <div className="chain-step">Buoyancy Force (F_b)</div>
          <div className="chain-arrow">→</div>
          <div className="chain-step">Natural Convection</div>
          <div className="chain-arrow">→</div>
          <div className="chain-step">Oxygen & Heat Transport</div>
          <div className="chain-arrow">→</div>
          <div className="chain-step">Combustion Behavior</div>
          <div className="chain-arrow">→</div>
          <div className="chain-step">Spacecraft Fire Safety</div>
        </div>
      </section>

      <div className="experiments-grid" style={{ marginTop: '2rem' }}>
        <div className="sci-card">
          <div className="card-header">
            <span className="card-title">🔥 Buoyancy vs. Diffusion</span>
            <span className="card-badge">PHYSICS</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            On Earth, hot gases rise due to density differences, creating vigorous natural convection. In microgravity, this upward draft vanishes. Oxygen transport shifts entirely to slow molecular diffusion or forced spacecraft ventilation.
          </p>
        </div>

        <div className="sci-card">
          <div className="card-header">
            <span className="card-title">🌐 Spherical Reaction Shells</span>
            <span className="card-badge">OBSERVATION</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Without buoyant elongation, stationary flames in microgravity form calm, symmetrical spherical envelopes. Chemical reaction rates decrease, soot aggregates in outer boundaries, and cool flames can emerge.
          </p>
        </div>

        <div className="sci-card">
          <div className="card-header">
            <span className="card-title">🛡️ Spacecraft Mission Safety</span>
            <span className="card-badge">SAFETY</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Smoke does not rise to ceiling detectors in space. Fires can quietly smolder undetected in hidden equipment racks until forced ventilation currents suddenly deliver fresh oxygen.
          </p>
        </div>
      </div>
    </main>
  );
};
