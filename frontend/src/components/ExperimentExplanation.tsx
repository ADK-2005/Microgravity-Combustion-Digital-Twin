import React from 'react';

interface ExperimentExplanationProps {
  summary: string;
  regime?: string;
  status?: string;
}

export const ExperimentExplanation: React.FC<ExperimentExplanationProps> = ({ summary, regime, status }) => {
  return (
    <div className="interpretation-box">
      <div className="interpretation-header">
        <span>🔬 MODEL INTERPRETATION</span>
        {status && <span className={`status-badge status-${status}`}>{status}</span>}
      </div>
      {regime && (
        <div style={{ fontSize: '0.75rem', color: 'var(--cyan-glow)', marginBottom: '0.4rem', fontWeight: 600 }}>
          Regime: {regime}
        </div>
      )}
      <p style={{ margin: 0 }}>{summary}</p>
    </div>
  );
};
