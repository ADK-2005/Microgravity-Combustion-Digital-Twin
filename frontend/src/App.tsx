import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Laboratory } from './pages/Laboratory';
import { Compare } from './pages/Compare';
import { Science } from './pages/Science';
import { Safety } from './pages/Safety';
import { simulationAPI } from './services/simulationAPI';
import { SimulationResponse } from './types/simulation';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showAssumptions, setShowAssumptions] = useState<boolean>(false);

  // Simulation parameters
  const [gravity, setGravity] = useState<number>(1.0);
  const [oxygen, setOxygen] = useState<number>(20.95);
  const [pressure, setPressure] = useState<number>(101.325);
  const [airflow, setAirflow] = useState<number>(0.0);
  const [fuel, setFuel] = useState<string>('methane');

  const [simulationData, setSimulationData] = useState<SimulationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const runSimulation = async () => {
    try {
      setIsLoading(true);
      const res = await simulationAPI.simulate({
        gravity_g: gravity,
        oxygen_percent: oxygen,
        pressure_kpa: pressure,
        airflow_ms: airflow,
        fuel: fuel,
        duration_s: 2.5,
        grid_size: 64,
      });
      setSimulationData(res);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreset = (g: number, o2 = 20.95, p = 101.325) => {
    setGravity(g);
    setOxygen(o2);
    setPressure(p);
  };

  useEffect(() => {
    runSimulation();
  }, [gravity, fuel]);

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAssumptions={() => setShowAssumptions(true)}
      />

      {activeTab === 'home' && <Home onNavigate={setActiveTab} />}
      {activeTab === 'lab' && (
        <Laboratory
          simulationData={simulationData}
          isLoading={isLoading}
          onRunSimulation={runSimulation}
          gravity={gravity}
          setGravity={setGravity}
          oxygen={oxygen}
          setOxygen={setOxygen}
          pressure={pressure}
          setPressure={setPressure}
          airflow={airflow}
          setAirflow={setAirflow}
          fuel={fuel}
          setFuel={setFuel}
          onPreset={handlePreset}
        />
      )}
      {activeTab === 'compare' && <Compare />}
      {activeTab === 'science' && <Science />}
      {activeTab === 'safety' && <Safety />}

      {/* Assumptions Modal */}
      {showAssumptions && (
        <div className="modal-backdrop active">
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#ffffff', fontSize: '1.2rem', margin: 0 }}>📋 Model Assumptions & Disclaimers</h3>
              <button className="btn-control" onClick={() => setShowAssumptions(false)}>✕</button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              ZeroG Flames is a <strong>reduced-order educational combustion model</strong> designed to visualize the transition between buoyancy-dominated and diffusion-dominated transport.
            </p>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '1.25rem', marginBottom: '1rem', lineHeight: 1.6 }}>
              <li>2D Cartesian finite-difference computational grid (64×64).</li>
              <li>Reduced-order flow field combining Boussinesq buoyancy acceleration and forced cross-ventilation.</li>
              <li>Single-step global Arrhenius chemical kinetics for gaseous fuels.</li>
              <li>Linear species diffusion with pressure and temperature scaling.</li>
              <li>Optically thin radiation loss approximation and ambient cooling.</li>
              <li>Model predictions are educational and not certified CFD engineering standards.</li>
            </ul>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan-glow)' }}>
              Model Version: ZeroG Reduced-Order Combustion Model v1.0.0
            </div>
          </div>
        </div>
      )}

      <footer className="site-footer">
        <div className="footer-logos">
          <img src="/static/assets/zerog-team-logo.jpg" alt="ZeroG Flames Logo" style={{ height: '50px', borderRadius: '50%', border: '2px solid var(--cyan-glow)' }} />
          <img src="/static/assets/nasa-space-apps-logo.svg" alt="NASA Space Apps Challenge Logo" style={{ height: '44px' }} />
        </div>
        <p className="footer-text">
          <strong>ZeroG Flames</strong> — NASA Space Apps Challenge Project.<br />
          Exploring how gravity changes combustion. Fueling safer journeys to space.<br />
          Developed with FastAPI, NumPy, and modern scientific Canvas visualization.
        </p>
      </footer>
    </div>
  );
};
