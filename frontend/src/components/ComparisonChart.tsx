import React from 'react';
import { SimulationResponse } from '../types/simulation';

interface ComparisonChartProps {
  conditionA: SimulationResponse | null;
  conditionB: SimulationResponse | null;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ conditionA, conditionB }) => {
  if (!conditionA || !conditionB) return null;
  const mA = conditionA.metrics;
  const mB = conditionB.metrics;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '0.75rem' }}>Comparative Delta Breakdown</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', background: 'var(--bg-secondary)', borderRadius: '10px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: 'rgba(15, 23, 42, 0.9)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem 1rem' }}>Metric</th>
            <th style={{ padding: '0.75rem 1rem', color: '#ff8c38' }}>Earth (1.0 g)</th>
            <th style={{ padding: '0.75rem 1rem', color: '#00d2ff' }}>Microgravity (0.0 g)</th>
            <th style={{ padding: '0.75rem 1rem' }}>Delta (Δ)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Peak Buoyant Flow Velocity</td><td>{mA.max_velocity_ms} m/s</td><td>{mB.max_velocity_ms} m/s</td><td className="text-cyan">{(mB.max_velocity_ms - mA.max_velocity_ms).toFixed(3)} m/s</td></tr>
          <tr><td>Buoyancy Acceleration</td><td>{mA.buoyancy_strength_ms2} m/s²</td><td>{mB.buoyancy_strength_ms2} m/s²</td><td className="text-cyan">-{mA.buoyancy_strength_ms2.toFixed(2)} m/s²</td></tr>
          <tr><td>Peak Flame Temperature</td><td>{mA.peak_temperature_k} K</td><td>{mB.peak_temperature_k} K</td><td>{(mB.peak_temperature_k - mA.peak_temperature_k).toFixed(1)} K</td></tr>
          <tr><td>Estimated Flame Area</td><td>{mA.estimated_flame_area_cm2} cm²</td><td>{mB.estimated_flame_area_cm2} cm²</td><td className="text-orange">+{(mB.estimated_flame_area_cm2 - mA.estimated_flame_area_cm2).toFixed(2)} cm²</td></tr>
          <tr><td>Dominant Transport Mechanism</td><td>Natural Convection</td><td>Molecular Diffusion</td><td>Convective Quench Shift</td></tr>
        </tbody>
      </table>
    </div>
  );
};
