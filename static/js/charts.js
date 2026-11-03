/**
 * ZeroG Flames — Interactive Scientific Charts
 * Canvas-based plotting engine for Gravity Sweeps, Extinction Boundaries, and Comparison metrics.
 */

export class ScientificChart {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  renderGravitySweep(points) {
    if (!points || points.length === 0) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const padL = 55, padR = 40, padT = 35, padB = 45;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    ctx.clearRect(0, 0, w, h);

    // Background grid
    ctx.fillStyle = '#060a14';
    ctx.fillRect(padL, padT, plotW, plotH);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    for (let k = 0; k <= 4; k++) {
      const y = padT + (plotH / 4) * k;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
    }

    // Min/Max bounds
    const maxG = Math.max(...points.map(p => p.gravity_g), 1.0);
    const maxVel = Math.max(...points.map(p => p.max_velocity_ms), 0.5) * 1.15;
    const maxTemp = Math.max(...points.map(p => p.peak_temperature_k), 2200);

    // Plot Line 1: Buoyancy Velocity (Cyan line)
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    points.forEach((p, idx) => {
      const x = padL + (p.gravity_g / maxG) * plotW;
      const y = padT + plotH - (p.max_velocity_ms / maxVel) * plotH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Plot Points for Velocity
    points.forEach(p => {
      const x = padL + (p.gravity_g / maxG) * plotW;
      const y = padT + plotH - (p.max_velocity_ms / maxVel) * plotH;
      ctx.fillStyle = '#00d2ff';
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Plot Line 2: Peak Temperature (Orange line)
    ctx.strokeStyle = '#ff8c38';
    ctx.lineWidth = 2.0;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    points.forEach((p, idx) => {
      const x = padL + (p.gravity_g / maxG) * plotW;
      const y = padT + plotH - ((p.peak_temperature_k - 300) / (maxTemp - 300)) * plotH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Axes and Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Gravity (g)', padL + plotW / 2, h - 10);

    ctx.textAlign = 'right';
    ctx.fillText('0 g', padL - 6, padT + plotH);
    ctx.fillText(`${maxG.toFixed(1)} g`, padL + plotW, padT + plotH + 18);
    ctx.fillText(`${maxVel.toFixed(2)} m/s`, padL - 6, padT + 10);

    // Title / Legend
    ctx.textAlign = 'left';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#00d2ff';
    ctx.fillText('— Buoyant Velocity (m/s)', padL + 10, 20);
    ctx.fillStyle = '#ff8c38';
    ctx.fillText('--- Peak Temp (K)', padL + 160, 20);
  }

  renderExtinctionCurve(points) {
    if (!points || points.length === 0) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const padL = 55, padR = 40, padT = 35, padB = 45;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    ctx.clearRect(0, 0, w, h);

    // Plot background
    ctx.fillStyle = '#060a14';
    ctx.fillRect(padL, padT, plotW, plotH);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    for (let k = 0; k <= 4; k++) {
      const y = padT + (plotH / 4) * k;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
    }

    const maxO2 = Math.max(...points.map(p => p.oxygen_percent), 30.0);
    const maxRate = Math.max(...points.map(p => p.total_reaction_rate), 10.0) * 1.1;

    // Reaction Rate curve
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    points.forEach((p, idx) => {
      const x = padL + (p.oxygen_percent / maxO2) * plotW;
      const y = padT + plotH - (p.total_reaction_rate / maxRate) * plotH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Data points with color based on sustained vs extinguished
    points.forEach(p => {
      const x = padL + (p.oxygen_percent / maxO2) * plotW;
      const y = padT + plotH - (p.total_reaction_rate / maxRate) * plotH;
      ctx.fillStyle = p.is_sustained ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Extinction boundary threshold line
    const loiPoint = points.find(p => p.is_sustained);
    if (loiPoint) {
      const xLoi = padL + (loiPoint.oxygen_percent / maxO2) * plotW;
      ctx.strokeStyle = '#ef4444';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(xLoi, padT);
      ctx.lineTo(xLoi, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ef4444';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`LOI Threshold ~${loiPoint.oxygen_percent}% O₂`, xLoi + 6, padT + 20);
    }

    // Axes
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Oxygen Concentration (% vol)', padL + plotW / 2, h - 10);

    ctx.textAlign = 'left';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText('— Total Reaction Rate vs O₂', padL + 10, 20);
  }

  renderVentilationCurve(points) {
    if (!points || points.length === 0) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const padL = 55, padR = 40, padT = 35, padB = 45;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    ctx.clearRect(0, 0, w, h);

    // Plot background
    ctx.fillStyle = '#060a14';
    ctx.fillRect(padL, padT, plotW, plotH);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    for (let k = 0; k <= 4; k++) {
      const y = padT + (plotH / 4) * k;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
    }

    const minFlow = Math.min(...points.map(p => p.airflow_ms), -1.0);
    const maxFlow = Math.max(...points.map(p => p.airflow_ms), 1.0);
    const flowRange = maxFlow - minFlow || 1.0;

    const maxRate = Math.max(...points.map(p => p.total_reaction_rate), 5.0) * 1.15;
    const maxVel = Math.max(...points.map(p => p.max_velocity_ms), 1.2) * 1.15;

    // Zero-airflow center line
    const xZero = padL + ((0.0 - minFlow) / flowRange) * plotW;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(xZero, padT);
    ctx.lineTo(xZero, padT + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Curve 1: Peak Flow Velocity (Cyan)
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    points.forEach((p, idx) => {
      const x = padL + ((p.airflow_ms - minFlow) / flowRange) * plotW;
      const y = padT + plotH - (p.max_velocity_ms / maxVel) * plotH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Curve 2: Total Reaction Rate (Orange)
    ctx.strokeStyle = '#ff8c38';
    ctx.lineWidth = 2.0;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    points.forEach((p, idx) => {
      const x = padL + ((p.airflow_ms - minFlow) / flowRange) * plotW;
      const y = padT + plotH - (p.total_reaction_rate / maxRate) * plotH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Points
    points.forEach(p => {
      const x = padL + ((p.airflow_ms - minFlow) / flowRange) * plotW;
      const y = padT + plotH - (p.max_velocity_ms / maxVel) * plotH;
      ctx.fillStyle = '#00d2ff';
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Forced Cross-Ventilation Airflow (m/s)', padL + plotW / 2, h - 10);
    ctx.fillText('0.0 (Quiescent)', xZero, padT + plotH + 18);

    ctx.textAlign = 'left';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#00d2ff';
    ctx.fillText('— Flow Velocity (m/s)', padL + 10, 20);
    ctx.fillStyle = '#ff8c38';
    ctx.fillText('--- Total Reaction Rate', padL + 160, 20);
  }
}

