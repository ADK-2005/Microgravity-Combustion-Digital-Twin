import React from 'react';

interface FieldViewerProps {
  currentField: string;
  onFieldChange: (field: string) => void;
}

export const FieldViewer: React.FC<FieldViewerProps> = ({ currentField, onFieldChange }) => {
  const fields = [
    { id: 'flame', label: '🔥 Flame Glow' },
    { id: 'temperature', label: '🌡️ Temperature (T)' },
    { id: 'oxygen', label: '🔵 Oxygen (Y_O₂)' },
    { id: 'fuel', label: '🟡 Fuel (Y_F)' },
    { id: 'reaction', label: '⚡ Reaction Rate (ω)' },
    { id: 'flow', label: '💨 Velocity Field (u, v)' },
  ];

  return (
    <div className="field-selector-bar">
      {fields.map((f) => (
        <button
          key={f.id}
          className={`field-btn ${currentField === f.id ? 'active' : ''}`}
          onClick={() => onFieldChange(f.id)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
};
