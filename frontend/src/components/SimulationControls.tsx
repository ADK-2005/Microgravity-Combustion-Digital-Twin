import React from 'react';

interface SimulationControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  currentTime: number;
  currentFrame: number;
  totalFrames: number;
  onSeekFrame: (frame: number) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onReset,
  currentTime,
  currentFrame,
  totalFrames,
  onSeekFrame,
}) => {
  return (
    <div className="sim-controls-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button className="btn-control" onClick={onTogglePlay}>
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button className="btn-control" onClick={onReset}>
          🔄 Reset
        </button>
      </div>

      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Timeline:</span>
        <input
          type="range"
          className="control-slider"
          min="0"
          max={Math.max(0, totalFrames - 1)}
          value={currentFrame}
          onChange={(e) => onSeekFrame(parseInt(e.target.value, 10))}
        />
      </div>

      <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan-glow)' }}>
        {currentTime.toFixed(2)} s
      </div>
    </div>
  );
};
