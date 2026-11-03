import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  tooltip?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, tooltip }) => {
  return (
    <div className="metric-card" title={tooltip}>
      <div className="metric-title">{title} {tooltip ? 'ℹ️' : ''}</div>
      <div className="metric-val">
        {value} {unit ? <span className="metric-unit">{unit}</span> : null}
      </div>
    </div>
  );
};
