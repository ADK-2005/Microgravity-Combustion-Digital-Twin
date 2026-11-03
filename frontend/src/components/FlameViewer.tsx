import React, { useRef, useEffect } from 'react';
import { SimulationResponse } from '../types/simulation';

interface FlameViewerProps {
  simulationData: SimulationResponse | null;
  fieldMode: string;
  width?: number;
  height?: number;
}

export const FlameViewer: React.FC<FlameViewerProps> = ({
  simulationData,
  fieldMode,
  width = 480,
  height = 480,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !simulationData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { fields, metadata, metrics } = simulationData;
    const { temperature, oxygen, fuel, reaction, velocity_u, velocity_v } = fields;
    const ny = temperature.length;
    const nx = temperature[0].length;
    const cellW = width / nx;
    const cellH = height / ny;

    ctx.clearRect(0, 0, width, height);

    if (fieldMode === 'temperature') {
      renderHeatmap(ctx, temperature, 293, Math.max(1800, metrics?.peak_temperature_k || 2000), getThermalColor, width, height);
    } else if (fieldMode === 'oxygen') {
      renderHeatmap(ctx, oxygen, 0.0, 0.25, getOxygenColor, width, height);
    } else if (fieldMode === 'fuel') {
      renderHeatmap(ctx, fuel, 0.0, 1.0, getFuelColor, width, height);
    } else if (fieldMode === 'reaction') {
      renderHeatmap(ctx, reaction, 0.0, Math.max(1.0, metrics?.max_reaction_rate || 5.0), getReactionColor, width, height);
    } else if (fieldMode === 'flow') {
      renderHeatmap(ctx, temperature, 293, 2000, (v) => getThermalColor(v, 0.45), width, height);
      renderVelocityVectors(ctx, velocity_u, velocity_v, width, height);
    } else {
      renderPhotorealisticFlame(ctx, temperature, reaction, metadata.gravity_g, width, height);
    }

    // Burner hardware
    renderBurner(ctx, nx, ny, cellW, cellH, height);
  }, [simulationData, fieldMode, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }} />;
};

function renderHeatmap(ctx: CanvasRenderingContext2D, field2D: number[][], minVal: number, maxVal: number, colorFn: (v: number) => string, w: number, h: number) {
  const ny = field2D.length;
  const nx = field2D[0].length;
  const cellW = w / nx;
  const cellH = h / ny;

  for (let j = 0; j < ny; j++) {
    const y = h - (j + 1) * cellH;
    for (let i = 0; i < nx; i++) {
      const x = i * cellW;
      const val = field2D[j][i];
      const norm = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal || 1)));
      ctx.fillStyle = colorFn(norm);
      ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(cellW), Math.ceil(cellH));
    }
  }
}

function renderPhotorealisticFlame(ctx: CanvasRenderingContext2D, tempField: number[][], reactionField: number[][], gravityG: number, w: number, h: number) {
  const ny = tempField.length;
  const nx = tempField[0].length;
  const cellW = w / nx;
  const cellH = h / ny;

  ctx.fillStyle = '#03060e';
  ctx.fillRect(0, 0, w, h);

  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;

  for (let j = 0; j < ny; j++) {
    const screenY = ny - 1 - j;
    for (let i = 0; i < nx; i++) {
      const t = tempField[j][i];
      const r = reactionField[j][i];
      if (t <= 320 && r <= 0.001) continue;

      const tNorm = Math.min(1, Math.max(0, (t - 300) / 1800));
      const rNorm = Math.min(1, Math.max(0, r / 15.0));

      let red = 0, green = 0, blue = 0, alpha = 0;
      if (gravityG >= 0.3) {
        if (rNorm > 0.05) {
          red = Math.floor(255 * Math.min(1, rNorm * 1.8 + tNorm));
          green = Math.floor(160 * Math.min(1, rNorm * 1.2 + tNorm * 0.7));
          blue = Math.floor(255 * (1.0 - tNorm * 0.8) * rNorm + 40);
          alpha = Math.floor(255 * Math.min(1, rNorm * 2.0 + tNorm * 0.8));
        } else if (tNorm > 0.1) {
          red = Math.floor(220 * tNorm);
          green = Math.floor(90 * (tNorm * tNorm));
          blue = Math.floor(30 * tNorm);
          alpha = Math.floor(180 * tNorm);
        }
      } else {
        if (rNorm > 0.02) {
          red = Math.floor(80 * rNorm + 160 * tNorm);
          green = Math.floor(180 * rNorm + 100 * tNorm);
          blue = Math.floor(255 * (1.0 - tNorm * 0.4));
          alpha = Math.floor(240 * Math.min(1, rNorm * 2.5 + tNorm * 0.6));
        } else if (tNorm > 0.08) {
          red = Math.floor(140 * tNorm);
          green = Math.floor(100 * tNorm);
          blue = Math.floor(220 * tNorm);
          alpha = Math.floor(140 * tNorm);
        }
      }

      const startX = Math.floor(i * cellW);
      const endX = Math.floor((i + 1) * cellW);
      const startY = Math.floor(screenY * cellH);
      const endY = Math.floor((screenY + 1) * cellH);

      for (let py = startY; py < endY; py++) {
        for (let px = startX; px < endX; px++) {
          const idx = (py * w + px) * 4;
          data[idx] = red;
          data[idx + 1] = green;
          data[idx + 2] = blue;
          data[idx + 3] = alpha;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

function renderVelocityVectors(ctx: CanvasRenderingContext2D, uField: number[][], vField: number[][], w: number, h: number) {
  const ny = uField.length;
  const nx = uField[0].length;
  const step = Math.max(3, Math.floor(nx / 16));
  const cellW = w / nx;
  const cellH = h / ny;

  ctx.save();
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 1.2;
  for (let j = 1; j < ny; j += step) {
    const y = h - (j + 0.5) * cellH;
    for (let i = 1; i < nx; i += step) {
      const u = uField[j][i];
      const v = vField[j][i];
      const mag = Math.sqrt(u * u + v * v);
      if (mag < 0.01) continue;
      const dx = u * 20;
      const dy = -v * 20;
      ctx.beginPath();
      ctx.moveTo((i + 0.5) * cellW, y);
      ctx.lineTo((i + 0.5) * cellW + dx, y + dy);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function renderBurner(ctx: CanvasRenderingContext2D, nx: number, ny: number, cellW: number, cellH: number, h: number) {
  const cx = (nx / 2) * cellW;
  const cy = h - (ny / 10) * cellH;
  ctx.save();
  ctx.fillStyle = '#181818';
  ctx.strokeStyle = '#ff6320';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, (nx / 24) * cellW, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function getThermalColor(norm: number, alpha = 1.0): string {
  const r = Math.floor(255 * Math.min(1, norm * 1.5));
  const g = Math.floor(255 * Math.sin(norm * Math.PI));
  const b = Math.floor(255 * Math.max(0, 1 - norm * 2));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getOxygenColor(norm: number): string {
  const b = Math.floor(100 + 155 * norm);
  const g = Math.floor(50 + 150 * norm);
  return `rgb(20, ${g}, ${b})`;
}

function getFuelColor(norm: number): string {
  const r = Math.floor(255 * norm);
  const g = Math.floor(180 * norm);
  return `rgb(${r}, ${g}, 20)`;
}

function getReactionColor(norm: number): string {
  const r = Math.floor(255 * norm);
  const g = Math.floor(50 * (1 - norm));
  const b = Math.floor(150 * norm);
  return `rgb(${r}, ${g}, ${b})`;
}
