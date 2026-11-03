import React from 'react';

interface VelocityFieldProps {
  maxVelocity: number;
  buoyancyStrength: number;
  airflow: number;
}

export const VelocityField: React.FC<VelocityFieldProps> = ({ maxVelocity, buoyancyStrength, airflow }) => {
  return (
    <div style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid var(--border-subtle)', marginTop: '0.5rem' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cyan-glow)', marginBottom: '0.25rem' }}>
        VELOCITY VECTOR SUPERPOSITION
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        <div><strong>u_total:</strong> u_forced ({airflow.toFixed(2)} m/s) + u_entrain</div>
        <div><strong>v_total:</strong> v_buoyant (a_b = {buoyancyStrength.toFixed(2)} m/s²)</div>
        <div><strong>Max Mag:</strong> {maxVelocity.toFixed(3)} m/s</div>
      </div>
    </div>
  );
};
