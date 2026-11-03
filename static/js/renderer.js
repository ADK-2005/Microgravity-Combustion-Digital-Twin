/**
 * ZeroG Flames — 2D Scientific Field & Flame Renderer
 * High-performance HTML5 Canvas rendering for temperature, species, reaction rate,
 * velocity vectors, and emissive physical flame morphology.
 */

export class SimulationRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.currentMode = 'flame'; // 'flame' | 'temperature' | 'oxygen' | 'fuel' | 'reaction' | 'flow'
    this.animationPhase = 0;
  }

  setFieldMode(mode) {
    this.currentMode = mode;
  }

  render(simulationData, options = {}) {
    if (!simulationData || !simulationData.fields) return;

    const { fields, metadata, metrics } = simulationData;
    const { temperature, oxygen, fuel, reaction, velocity_u, velocity_v } = fields;
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    const ny = temperature.length;
    const nx = temperature[0].length;
    const cellW = width / nx;
    const cellH = height / ny;

    this.ctx.clearRect(0, 0, width, height);

    // Render based on selected field mode
    switch (this.currentMode) {
      case 'temperature':
        this.renderHeatmap(temperature, 293, Math.max(1800, metrics?.peak_temperature_k || 2000), this.getThermalColor);
        break;
      case 'oxygen':
        this.renderHeatmap(oxygen, 0.0, 0.25, this.getOxygenColor);
        break;
      case 'fuel':
        this.renderHeatmap(fuel, 0.0, 1.0, this.getFuelColor);
        break;
      case 'reaction':
        this.renderHeatmap(reaction, 0.0, Math.max(1.0, metrics?.max_reaction_rate || 5.0), this.getReactionColor);
        break;
      case 'flow':
        // Render base thermal background lightly then overlay velocity vectors
        this.renderHeatmap(temperature, 293, 2000, (v) => this.getThermalColor(v, 0.45));
        this.renderVelocityVectors(velocity_u, velocity_v);
        break;
      case 'flame':
      default:
        this.renderPhotorealisticFlame(temperature, reaction, velocity_u, velocity_v, metadata?.gravity_g ?? 1.0);
        break;
    }

    // Burner base hardware indicator at bottom center
    this.renderBurnerHardware(nx, ny, cellW, cellH);

    // Scientific grid overlay & axis ticks
    if (options.showGrid !== false) {
      this.renderGridOverlay(width, height);
    }
  }

  renderHeatmap(field2D, minVal, maxVal, colorFn) {
    const ny = field2D.length;
    const nx = field2D[0].length;
    const cellW = this.canvas.width / nx;
    const cellH = this.canvas.height / ny;

    for (let j = 0; j < ny; j++) {
      // Invert Y so j=0 is bottom
      const y = this.canvas.height - (j + 1) * cellH;
      for (let i = 0; i < nx; i++) {
        const x = i * cellW;
        const val = field2D[j][i];
        const norm = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal || 1)));
        this.ctx.fillStyle = colorFn(norm);
        this.ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(cellW), Math.ceil(cellH));
      }
    }
  }

  renderPhotorealisticFlame(tempField, reactionField, uField, vField, gravityG) {
    const ny = tempField.length;
    const nx = tempField[0].length;
    const cellW = this.canvas.width / nx;
    const cellH = this.canvas.height / ny;
    const ctx = this.ctx;

    // Dark space-grade combustion chamber background
    ctx.fillStyle = '#03060e';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Step 1: Render outer glowing thermal aura
    const imgData = ctx.createImageData(this.canvas.width, this.canvas.height);
    const data = imgData.data;

    for (let j = 0; j < ny; j++) {
      const screenY = ny - 1 - j;
      for (let i = 0; i < nx; i++) {
        const t = tempField[j][i];
        const r = reactionField[j][i];
        
        if (t <= 320 && r <= 0.001) continue;

        // Map reaction and temp into emissive RGB channels
        const tNorm = Math.min(1, Math.max(0, (t - 300) / 1800));
        const rNorm = Math.min(1, Math.max(0, r / 15.0));

        let red = 0, green = 0, blue = 0, alpha = 0;

        if (gravityG >= 0.3) {
          // Earth/Mars buoyant flame: yellow/orange soot tip + blue chemiluminescence base
          if (rNorm > 0.05) {
            // Reaction zone
            red = Math.floor(255 * Math.min(1, rNorm * 1.8 + tNorm));
            green = Math.floor(160 * Math.min(1, rNorm * 1.2 + tNorm * 0.7));
            blue = Math.floor(255 * (1.0 - tNorm * 0.8) * rNorm + 40);
            alpha = Math.floor(255 * Math.min(1, rNorm * 2.0 + tNorm * 0.8));
          } else if (tNorm > 0.1) {
            // Hot plume
            red = Math.floor(220 * tNorm);
            green = Math.floor(90 * (tNorm * tNorm));
            blue = Math.floor(30 * tNorm);
            alpha = Math.floor(180 * tNorm);
          }
        } else {
          // Microgravity flame: uniform spherical pale blue chemiluminescent shell with soft orange soot glow
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

        // Fill pixel block for cell
        const startX = Math.floor(i * cellW);
        const endX = Math.floor((i + 1) * cellW);
        const startY = Math.floor(screenY * cellH);
        const endY = Math.floor((screenY + 1) * cellH);

        for (let py = startY; py < endY; py++) {
          for (let px = startX; px < endX; px++) {
            const idx = (py * this.canvas.width + px) * 4;
            data[idx] = red;
            data[idx + 1] = green;
            data[idx + 2] = blue;
            data[idx + 3] = alpha;
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Apply high-quality emissive bloom blur pass
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.filter = 'blur(6px)';
    ctx.drawImage(this.canvas, 0, 0);
    ctx.restore();
  }

  renderVelocityVectors(uField, vField) {
    const ny = uField.length;
    const nx = uField[0].length;
    const step = Math.max(3, Math.floor(nx / 16)); // Subsample vectors for clean display
    const cellW = this.canvas.width / nx;
    const cellH = this.canvas.height / ny;
    const ctx = this.ctx;

    ctx.save();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#00e5ff';
    ctx.fillStyle = '#00e5ff';

    for (let j = 1; j < ny; j += step) {
      const y = this.canvas.height - (j + 0.5) * cellH;
      for (let i = 1; i < nx; i += step) {
        const x = (i + 0.5) * cellW;
        const u = uField[j][i];
        const v = vField[j][i];
        const mag = Math.sqrt(u * u + v * v);

        if (mag < 0.01) continue;

        const arrowScale = 22.0;
        const dx = u * arrowScale;
        const dy = -v * arrowScale; // Canvas inverted Y

        // Draw line
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx, y + dy);
        ctx.stroke();

        // Draw arrow head
        const angle = Math.atan2(dy, dx);
        const headLen = Math.min(5, Math.max(2.5, mag * 8));
        ctx.beginPath();
        ctx.moveTo(x + dx, y + dy);
        ctx.lineTo(
          x + dx - headLen * Math.cos(angle - Math.PI / 6),
          y + dy - headLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          x + dx - headLen * Math.cos(angle + Math.PI / 6),
          y + dy - headLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }

  renderBurnerHardware(nx, ny, cellW, cellH) {
    const ctx = this.ctx;
    const burnerCenterX = (nx / 2) * cellW;
    const burnerCenterY = this.canvas.height - (ny / 10) * cellH;
    const burnerRadius = (nx / 24) * cellW;

    ctx.save();
    // Metal burner nozzle body
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#ff6320';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(burnerCenterX, burnerCenterY, Math.max(4, burnerRadius), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Fuel inlet orifice
    ctx.fillStyle = '#ff6b00';
    ctx.beginPath();
    ctx.arc(burnerCenterX, burnerCenterY, Math.max(2, burnerRadius * 0.5), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderGridOverlay(width, height) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;

    // Outer frame
    ctx.strokeRect(0, 0, width, height);

    // 4x4 coordinate divisions
    for (let k = 1; k < 4; k++) {
      const gx = (width / 4) * k;
      const gy = (height / 4) * k;
      ctx.beginPath();
      ctx.moveTo(gx, 0); ctx.lineTo(gx, height);
      ctx.moveTo(0, gy); ctx.lineTo(width, gy);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Colormaps
  getThermalColor(norm, alpha = 1.0) {
    // 0.0 -> Deep Blue (293K) -> Cyan -> Green -> Yellow -> Fiery Orange -> White (2200K+)
    let r, g, b;
    if (norm < 0.2) {
      const t = norm / 0.2;
      r = Math.floor(10 + 20 * t);
      g = Math.floor(30 + 100 * t);
      b = Math.floor(120 + 135 * t);
    } else if (norm < 0.45) {
      const t = (norm - 0.2) / 0.25;
      r = Math.floor(30 + 50 * t);
      g = Math.floor(130 + 95 * t);
      b = Math.floor(255 * (1 - t));
    } else if (norm < 0.7) {
      const t = (norm - 0.45) / 0.25;
      r = Math.floor(80 + 175 * t);
      g = Math.floor(225 - 65 * t);
      b = 0;
    } else if (norm < 0.9) {
      const t = (norm - 0.7) / 0.2;
      r = 255;
      g = Math.floor(160 + 75 * t);
      b = Math.floor(120 * t);
    } else {
      const t = (norm - 0.9) / 0.1;
      r = 255;
      g = Math.floor(235 + 20 * t);
      b = Math.floor(120 + 135 * t);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  getOxygenColor(norm) {
    // 0.0 -> Depleted (Dark Navy / Black) -> Cyan / Azure (21% Ambient)
    const r = Math.floor(10 + 20 * norm);
    const g = Math.floor(20 + 200 * norm);
    const b = Math.floor(60 + 195 * norm);
    return `rgb(${r}, ${g}, ${b})`;
  }

  getFuelColor(norm) {
    // 0.0 -> Dark Background -> Amber Gold Fuel Core (1.0)
    const r = Math.floor(255 * Math.min(1, norm * 1.4));
    const g = Math.floor(180 * norm);
    const b = Math.floor(30 * norm);
    return `rgb(${r}, ${g}, ${b})`;
  }

  getReactionColor(norm) {
    // 0.0 -> Dark -> Intense Crimson / Magenta Flame Front
    const r = Math.floor(255 * norm);
    const g = Math.floor(40 * norm + 200 * (norm * norm));
    const b = Math.floor(180 * (1 - norm) * norm * 4);
    return `rgb(${r}, ${g}, ${b})`;
  }
}
