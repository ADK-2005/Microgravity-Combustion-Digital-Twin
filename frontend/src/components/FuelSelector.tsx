import React from 'react';

interface FuelSelectorProps {
  value: string;
  onChange: (fuel: string) => void;
}

export const FuelSelector: React.FC<FuelSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="control-group">
      <div className="control-label-row">
        <span className="control-label">Fuel Reactant</span>
      </div>
      <select className="select-control" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="methane">Methane (CH₄) — Clean Baseline</option>
        <option value="hydrocarbon">Generic Hydrocarbon (C₃H₈-like)</option>
        <option value="ethanol_vapor">Ethanol Vapor (C₂H₅OH)</option>
      </select>
    </div>
  );
};
