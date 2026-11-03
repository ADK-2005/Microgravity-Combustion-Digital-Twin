import React, { useState, useEffect } from 'react';
import { SimulationResponse } from '../types/simulation';
import { simulationAPI } from '../services/simulationAPI';
import { FlameViewer } from '../components/FlameViewer';
import { ComparisonChart } from '../components/ComparisonChart';

export const Compare: React.FC = () => {
  const [condA, setCondA] = useState<SimulationResponse | null>(null);
  const [condB, setCondB] = useState<SimulationResponse | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const runComparison = async () => {
    try {
      setLoading(true);
      const res = await simulationAPI.compare(
        { gravity_g: 1.0, oxygen_percent: 20.95, pressure_kpa: 101.325, airflow_ms: 0.0, fuel: 'methane', duration_s: 2.0 },
        { gravity_g: 0.0001, oxygen_percent: 20.95, pressure_kpa: 101.325, airflow_ms: 0.0, fuel: 'methane', duration_s: 2.0 }
      );
      setCondA(res.condition_a);
      setCondB(res.condition_b);
      setSummary(res.comparison_summary);
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runComparison();
  }, []);

  return (
    <main className="page-view active">
      <div className="content-section" style={{ maxWidth: '1400px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2>Earth vs. Microgravity Comparison</h2>
            <p>Isolating gravity as the single experimental variable while maintaining identical fuel, oxygen, pressure, and ambient temperature.</p>
          </div>
          <button className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }} onClick={runComparison} disabled={loading}>
            {loading ? '⏳ Computing...' : '🔄 Re-run Comparison'}
          </button>
        </div>

        <div className="compare-container">
          <div className="compare-card">
            <div className="card-header">
              <span className="card-title" style={{ color: 'var(--orange-bright)' }}>🌍 Terrestrial Gravity (1.00 g)</span>
              <span className="card-badge">BUOYANCY DOMINATED</span>
            </div>
            <FlameViewer simulationData={condA} fieldMode="flame" width={400} height={400} />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
              <strong>Mechanism:</strong> Rapid buoyant upward flow draws ambient oxygen into the flame base, stretching the flame into a high-intensity vertical plume.
            </div>
          </div>

          <div className="compare-card">
            <div className="card-header">
              <span className="card-title" style={{ color: 'var(--text-secondary)' }}>🛰️ Orbital Microgravity (0.00 g)</span>
              <span className="card-badge">DIFFUSION DOMINATED</span>
            </div>
            <FlameViewer simulationData={condB} fieldMode="flame" width={400} height={400} />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
              <strong>Mechanism:</strong> Zero buoyancy natural convection. Fuel and oxygen transport rely on molecular diffusion, producing a wider, spherical reaction envelope.
            </div>
          </div>
        </div>

        <ComparisonChart conditionA={condA} conditionB={condB} />

        <div className="interpretation-box" style={{ marginTop: '1.5rem' }}>
          <div className="interpretation-header">🔬 COMPARATIVE SYNTHESIS</div>
          <p>{summary || "Reducing gravity weakens the model's buoyancy-driven flow contribution. Oxygen and heat transport therefore become relatively more diffusion-dominated unless forced airflow is present."}</p>
        </div>
      </div>
    </main>
  );
};
