import React, { useState } from 'react';
import { SimulationResponse } from '../types/simulation';
import { GravitySlider } from '../components/GravitySlider';
import { OxygenSlider } from '../components/OxygenSlider';
import { PressureControl } from '../components/PressureControl';
import { AirflowControl } from '../components/AirflowControl';
import { FuelSelector } from '../components/FuelSelector';
import { FlameViewer } from '../components/FlameViewer';
import { FieldViewer } from '../components/FieldViewer';
import { MetricCard } from '../components/MetricCard';
import { SimulationControls } from '../components/SimulationControls';
import { ExperimentExplanation } from '../components/ExperimentExplanation';

interface LaboratoryProps {
  simulationData: SimulationResponse | null;
  isLoading: boolean;
  onRunSimulation: () => void;
  gravity: number;
  setGravity: (g: number) => void;
  oxygen: number;
  setOxygen: (o2: number) => void;
  pressure: number;
  setPressure: (p: number) => void;
  airflow: number;
  setAirflow: (u: number) => void;
  fuel: string;
  setFuel: (f: string) => void;
  onPreset: (g: number, o2?: number, p?: number) => void;
}

export const Laboratory: React.FC<LaboratoryProps> = ({
  simulationData,
  isLoading,
  onRunSimulation,
  gravity,
  setGravity,
  oxygen,
  setOxygen,
  pressure,
  setPressure,
  airflow,
  setAirflow,
  fuel,
  setFuel,
  onPreset,
}) => {
  const [fieldMode, setFieldMode] = useState<string>('flame');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentFrameIdx, setCurrentFrameIdx] = useState<number>(0);

  const frames = simulationData?.frames || [];
  const metrics = simulationData?.metrics;

  const handleExportJSON = () => {
    if (!simulationData) return;
    const blob = new Blob([JSON.stringify(simulationData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zerog_flames_${gravity}g.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!simulationData) return;
    const m = simulationData.metrics;
    const rows = [
      ['Metric', 'Value', 'Units'],
      ['Gravity', gravity, 'g'],
      ['Oxygen', oxygen, '%'],
      ['Pressure', pressure, 'kPa'],
      ['Airflow', airflow, 'm/s'],
      ['Peak Temperature', m.peak_temperature_k, 'K'],
      ['Gas Velocity', m.max_velocity_ms, 'm/s'],
      ['Total Reaction', m.total_reaction_rate, 'kg/s'],
      ['Flame Area', m.estimated_flame_area_cm2, 'cm2'],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zerog_flames_${gravity}g.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="page-view active">
      <div className="lab-grid">
        {/* Controls Column */}
        <aside className="sci-card">
          <div className="card-header">
            <span className="card-title">⚙️ Chamber Controls</span>
            <span className="card-badge">INPUTS</span>
          </div>

          <GravitySlider value={gravity} onChange={setGravity} onSelectPreset={onPreset} />
          <OxygenSlider value={oxygen} onChange={setOxygen} />
          <PressureControl value={pressure} onChange={setPressure} />
          <AirflowControl value={airflow} onChange={setAirflow} />
          <FuelSelector value={fuel} onChange={setFuel} />

          <button
            className="btn-control btn-run"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.8rem' }}
            onClick={onRunSimulation}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Computing 2D Field...' : '⚡ Run Simulation'}
          </button>
        </aside>

        {/* Chamber Viewport */}
        <section className="chamber-container">
          <div className="canvas-wrapper">
            <div className="canvas-overlay-badges">
              <span className="status-badge" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid var(--border-orange)', color: 'var(--orange-bright)' }}>
                {metrics?.transport_regime || 'Buoyancy-Dominated Convection'}
              </span>
            </div>

            <FlameViewer simulationData={simulationData} fieldMode={fieldMode} />

            <FieldViewer currentField={fieldMode} onFieldChange={setFieldMode} />
          </div>

          <SimulationControls
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onReset={() => { setIsPlaying(false); setCurrentFrameIdx(0); }}
            currentTime={frames[currentFrameIdx]?.time_s || simulationData?.metadata?.simulation_time_s || 2.5}
            currentFrame={currentFrameIdx}
            totalFrames={frames.length}
            onSeekFrame={setCurrentFrameIdx}
          />
        </section>

        {/* Live Diagnostics */}
        <aside className="sci-card">
          <div className="card-header">
            <span className="card-title">📊 Live Diagnostics</span>
            <span className={`status-badge status-${metrics?.flame_status || 'STABLE'}`}>
              {metrics?.flame_status || 'STABLE'}
            </span>
          </div>

          <div className="metrics-grid">
            <MetricCard title="Peak Temp" value={metrics?.peak_temperature_k || 2180.4} unit="K" tooltip="Peak flame temperature from energy equation" />
            <MetricCard title="Max Gas Velocity" value={metrics?.max_velocity_ms || 0.542} unit="m/s" tooltip="Peak buoyancy + forced gas velocity magnitude" />
            <MetricCard title="Total Reaction" value={metrics?.total_reaction_rate || 148.2} unit="kg/s" tooltip="Integrated volumetric Arrhenius reaction rate" />
            <MetricCard title="O₂ Consumption" value={metrics?.oxygen_consumption_rate || 592.8} unit="kg/s" tooltip="Total stoichiometric oxygen consumption rate" />
            <MetricCard title="Buoyant Force" value={metrics?.buoyancy_strength_ms2 || 68.2} unit="m/s²" tooltip="Peak buoyant body force acceleration" />
            <MetricCard title="Flame Area" value={metrics?.estimated_flame_area_cm2 || 12.4} unit="cm²" tooltip="Estimated active reaction zone area" />
          </div>

          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '0.4rem 0.6rem' }} onClick={handleExportJSON}>
              💾 Export Data (JSON)
            </button>
            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '0.4rem 0.6rem' }} onClick={handleExportCSV}>
              📄 Export CSV
            </button>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <ExperimentExplanation
              summary={metrics?.scientific_summary || 'Strong buoyancy forces generate natural convection, pulling oxygen toward the flame base.'}
              regime={metrics?.transport_regime}
              status={metrics?.flame_status}
            />
          </div>
        </aside>
      </div>
    </main>
  );
};
