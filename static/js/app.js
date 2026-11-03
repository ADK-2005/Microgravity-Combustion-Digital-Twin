/**
 * ZeroG Flames — Main Application Controller
 * Handles interactive controls, simulation execution, timeline animation,
 * comparison mode, experimental sweeps, and educational views.
 */

import { API } from './api.js';
import { SimulationRenderer } from './renderer.js';
import { ScientificChart } from './charts.js';

class ZeroGApp {
  constructor() {
    this.currentSimulation = null;
    this.currentFrames = [];
    this.animationTimer = null;
    this.currentFrameIdx = 0;
    this.isPlaying = false;

    // Simulation Parameters State
    this.state = {
      gravity_g: 1.0,
      oxygen_percent: 20.95,
      pressure_kpa: 101.325,
      airflow_ms: 0.0,
      fuel: 'methane',
      ambient_temperature_k: 293.15,
      duration_s: 2.5,
      grid_size: 64,
    };

    this.initDOM();
    this.initRenderers();
    this.attachEventListeners();
    this.loadInitialData();
  }

  initDOM() {
    // Canvas elements
    this.simCanvas = document.getElementById('simulationCanvas');
    this.compareCanvasA = document.getElementById('compareCanvasA');
    this.compareCanvasB = document.getElementById('compareCanvasB');
    this.sweepChartCanvas = document.getElementById('sweepChartCanvas');
    this.extinctionChartCanvas = document.getElementById('extinctionChartCanvas');
    this.ventilationChartCanvas = document.getElementById('ventilationChartCanvas');
    this.exportDataBtn = document.getElementById('exportDataBtn');
    this.exportCsvBtn = document.getElementById('exportCsvBtn');

    // Controls
    this.gravitySlider = document.getElementById('gravitySlider');
    this.gravityVal = document.getElementById('gravityVal');
    this.gravityMs2Val = document.getElementById('gravityMs2Val');

    this.oxygenSlider = document.getElementById('oxygenSlider');
    this.oxygenVal = document.getElementById('oxygenVal');

    this.pressureSlider = document.getElementById('pressureSlider');
    this.pressureVal = document.getElementById('pressureVal');

    this.airflowSlider = document.getElementById('airflowSlider');
    this.airflowVal = document.getElementById('airflowVal');

    this.fuelSelector = document.getElementById('fuelSelector');
    this.runSimBtn = document.getElementById('runSimBtn');
    this.playPauseBtn = document.getElementById('playPauseBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.timelineSlider = document.getElementById('timelineSlider');
    this.timeDisplay = document.getElementById('timeDisplay');

    // Metric Badges
    this.metricPeakTemp = document.getElementById('metricPeakTemp');
    this.metricReaction = document.getElementById('metricReaction');
    this.metricO2Cons = document.getElementById('metricO2Cons');
    this.metricVelocity = document.getElementById('metricVelocity');
    this.metricBuoyancy = document.getElementById('metricBuoyancy');
    this.metricArea = document.getElementById('metricArea');
    this.statusBadge = document.getElementById('statusBadge');
    this.interpretationText = document.getElementById('interpretationText');
    this.transportRegimeBadge = document.getElementById('transportRegimeBadge');
  }

  initRenderers() {
    if (this.simCanvas) {
      this.simCanvas.width = 480;
      this.simCanvas.height = 480;
      this.mainRenderer = new SimulationRenderer(this.simCanvas);
    }

    if (this.compareCanvasA && this.compareCanvasB) {
      this.compareCanvasA.width = 400;
      this.compareCanvasA.height = 400;
      this.compareCanvasB.width = 400;
      this.compareCanvasB.height = 400;
      this.compareRendererA = new SimulationRenderer(this.compareCanvasA);
      this.compareRendererB = new SimulationRenderer(this.compareCanvasB);
    }

    if (this.sweepChartCanvas) {
      this.sweepChartCanvas.width = 600;
      this.sweepChartCanvas.height = 280;
      this.sweepChart = new ScientificChart(this.sweepChartCanvas);
    }

    if (this.extinctionChartCanvas) {
      this.extinctionChartCanvas.width = 600;
      this.extinctionChartCanvas.height = 280;
      this.extinctionChart = new ScientificChart(this.extinctionChartCanvas);
    }

    if (this.ventilationChartCanvas) {
      this.ventilationChartCanvas.width = 600;
      this.ventilationChartCanvas.height = 280;
      this.ventilationChart = new ScientificChart(this.ventilationChartCanvas);
    }
  }

  attachEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = tab.dataset.target;
        this.switchPage(target);
      });
    });

    // Preset Buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const g = parseFloat(btn.dataset.gravity);
        const o2 = btn.dataset.o2 ? parseFloat(btn.dataset.o2) : 20.95;
        const p = btn.dataset.pressure ? parseFloat(btn.dataset.pressure) : 101.325;
        
        this.updateParam('gravity_g', g);
        this.updateParam('oxygen_percent', o2);
        this.updateParam('pressure_kpa', p);
        this.syncInputs();
        this.executeSimulation();
      });
    });

    // Sliders
    this.gravitySlider?.addEventListener('input', (e) => {
      this.updateParam('gravity_g', parseFloat(e.target.value));
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    });

    this.oxygenSlider?.addEventListener('input', (e) => {
      this.updateParam('oxygen_percent', parseFloat(e.target.value));
    });

    this.pressureSlider?.addEventListener('input', (e) => {
      this.updateParam('pressure_kpa', parseFloat(e.target.value));
    });

    this.airflowSlider?.addEventListener('input', (e) => {
      this.updateParam('airflow_ms', parseFloat(e.target.value));
    });

    this.fuelSelector?.addEventListener('change', (e) => {
      this.updateParam('fuel', e.target.value);
      this.executeSimulation();
    });

    // Field Selector Buttons (Flame, Temperature, Oxygen, Fuel, Reaction, Flow)
    document.querySelectorAll('.field-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.field-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.field;
        this.mainRenderer.setFieldMode(mode);
        this.updateColorbar(mode);
        if (this.currentSimulation) {
          this.mainRenderer.render(this.currentSimulation);
        }
      });
    });

    // Run Simulation Button
    this.runSimBtn?.addEventListener('click', () => this.executeSimulation());

    // Timeline playback
    this.playPauseBtn?.addEventListener('click', () => this.togglePlayPause());
    this.resetBtn?.addEventListener('click', () => this.resetSimulation());
    this.timelineSlider?.addEventListener('input', (e) => {
      const idx = parseInt(e.target.value, 10);
      this.showFrame(idx);
    });

    // Compare Page Action
    document.getElementById('runCompareBtn')?.addEventListener('click', () => this.executeComparison());

    // Experiments Actions
    document.getElementById('runSweepBtn')?.addEventListener('click', () => this.executeGravitySweep());
    document.getElementById('runExtinctionBtn')?.addEventListener('click', () => this.executeExtinctionSweep());
    document.getElementById('runVentilationBtn')?.addEventListener('click', () => this.executeVentilationSweep());

    // Export Data Actions
    this.exportDataBtn?.addEventListener('click', () => this.exportJSON());
    this.exportCsvBtn?.addEventListener('click', () => this.exportCSV());

    // Assumptions Modal Toggle
    document.getElementById('assumptionsBtn')?.addEventListener('click', () => {
      document.getElementById('assumptionsModal')?.classList.add('active');
    });
    document.getElementById('closeAssumptionsBtn')?.addEventListener('click', () => {
      document.getElementById('assumptionsModal')?.classList.remove('active');
    });
  }

  updateParam(key, val) {
    this.state[key] = val;
    this.syncDisplay();
  }

  syncInputs() {
    if (this.gravitySlider) this.gravitySlider.value = this.state.gravity_g;
    if (this.oxygenSlider) this.oxygenSlider.value = this.state.oxygen_percent;
    if (this.pressureSlider) this.pressureSlider.value = this.state.pressure_kpa;
    if (this.airflowSlider) this.airflowSlider.value = this.state.airflow_ms;
    if (this.fuelSelector) this.fuelSelector.value = this.state.fuel;
    this.syncDisplay();
  }

  syncDisplay() {
    if (this.gravityVal) this.gravityVal.textContent = `${this.state.gravity_g.toFixed(2)} g`;
    if (this.gravityMs2Val) this.gravityMs2Val.textContent = `${(this.state.gravity_g * 9.80665).toFixed(2)} m/s²`;
    if (this.oxygenVal) this.oxygenVal.textContent = `${this.state.oxygen_percent.toFixed(1)}%`;
    if (this.pressureVal) this.pressureVal.textContent = `${this.state.pressure_kpa.toFixed(1)} kPa`;
    if (this.airflowVal) this.airflowVal.textContent = `${this.state.airflow_ms.toFixed(2)} m/s`;
  }

  switchPage(pageId) {
    document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

    const page = document.getElementById(pageId);
    if (page) page.classList.add('active');

    const tab = document.querySelector(`.nav-tab[data-target="${pageId}"]`);
    if (tab) tab.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (pageId === 'comparePage' && !this.comparisonLoaded) {
      this.executeComparison();
      this.comparisonLoaded = true;
    } else if (pageId === 'experimentsPage' && !this.experimentsLoaded) {
      this.executeGravitySweep();
      this.executeExtinctionSweep();
      this.executeVentilationSweep();
      this.experimentsLoaded = true;
    }
  }

  async loadInitialData() {
    this.syncInputs();
    await this.executeSimulation();
  }

  async executeSimulation() {
    try {
      this.setLoading(true);
      const data = await API.simulate(this.state);
      this.currentSimulation = data;
      this.currentFrames = data.frames || [];

      // Update metrics & scientific interpretation
      this.updateMetrics(data.metrics);
      
      // Setup timeline
      if (this.timelineSlider) {
        this.timelineSlider.max = Math.max(0, this.currentFrames.length - 1);
        this.timelineSlider.value = this.timelineSlider.max;
      }
      this.currentFrameIdx = this.currentFrames.length - 1;
      if (this.timeDisplay) {
        this.timeDisplay.textContent = `${data.metadata.simulation_time_s.toFixed(2)} s`;
      }

      // Render field
      this.mainRenderer.render(data);
    } catch (err) {
      console.error('Simulation execution failed:', err);
      alert('Simulation error: ' + err.message);
    } finally {
      this.setLoading(false);
    }
  }

  updateMetrics(metrics) {
    if (!metrics) return;
    if (this.metricPeakTemp) this.metricPeakTemp.textContent = `${metrics.peak_temperature_k} K`;
    if (this.metricReaction) this.metricReaction.textContent = `${metrics.total_reaction_rate}`;
    if (this.metricO2Cons) this.metricO2Cons.textContent = `${metrics.oxygen_consumption_rate}`;
    if (this.metricVelocity) this.metricVelocity.textContent = `${metrics.max_velocity_ms} m/s`;
    if (this.metricBuoyancy) this.metricBuoyancy.textContent = `${metrics.buoyancy_strength_ms2} m/s²`;
    if (this.metricArea) this.metricArea.textContent = `${metrics.estimated_flame_area_cm2} cm²`;

    if (this.statusBadge) {
      this.statusBadge.textContent = metrics.flame_status;
      this.statusBadge.className = `status-badge status-${metrics.flame_status}`;
    }

    if (this.transportRegimeBadge) {
      this.transportRegimeBadge.textContent = metrics.transport_regime;
    }

    if (this.interpretationText) {
      this.interpretationText.textContent = metrics.scientific_summary;
    }
  }

  updateColorbar(mode) {
    const minLabel = document.getElementById('cbMin');
    const maxLabel = document.getElementById('cbMax');
    const gradient = document.getElementById('cbGradient');

    if (!minLabel || !maxLabel || !gradient) return;

    if (mode === 'temperature') {
      minLabel.textContent = '293 K';
      maxLabel.textContent = '2200 K';
      gradient.style.background = 'linear-gradient(to right, #0a1e78, #00d2ff, #10b981, #facc15, #ff6b00, #ffffff)';
    } else if (mode === 'oxygen') {
      minLabel.textContent = '0.0 %';
      maxLabel.textContent = `${this.state.oxygen_percent.toFixed(1)} %`;
      gradient.style.background = 'linear-gradient(to right, #040814, #0088cc, #00d2ff)';
    } else if (mode === 'fuel') {
      minLabel.textContent = '0.0';
      maxLabel.textContent = '1.0';
      gradient.style.background = 'linear-gradient(to right, #040814, #d97706, #fde047)';
    } else if (mode === 'reaction') {
      minLabel.textContent = '0.0';
      maxLabel.textContent = 'Max Rate';
      gradient.style.background = 'linear-gradient(to right, #040814, #ec4899, #f97316)';
    } else {
      minLabel.textContent = 'Quiescent';
      maxLabel.textContent = 'High Activity';
      gradient.style.background = 'linear-gradient(to right, #03060e, #00d2ff, #ff6b00)';
    }
  }

  showFrame(idx) {
    if (!this.currentFrames || idx >= this.currentFrames.length) return;
    const frame = this.currentFrames[idx];
    this.currentFrameIdx = idx;
    if (this.timelineSlider) this.timelineSlider.value = idx;
    if (this.timeDisplay) this.timeDisplay.textContent = `${frame.time_s.toFixed(2)} s`;

    // Overlay frame fields onto main renderer
    const frameData = {
      ...this.currentSimulation,
      fields: {
        ...this.currentSimulation.fields,
        temperature: frame.temperature,
        oxygen: frame.oxygen,
        reaction: frame.reaction,
      },
    };
    this.mainRenderer.render(frameData);
  }

  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    if (this.playPauseBtn) {
      this.playPauseBtn.textContent = this.isPlaying ? '⏸ Pause' : '▶ Play';
    }

    if (this.isPlaying) {
      this.animationTimer = setInterval(() => {
        let nextIdx = this.currentFrameIdx + 1;
        if (nextIdx >= this.currentFrames.length) nextIdx = 0;
        this.showFrame(nextIdx);
      }, 150);
    } else {
      clearInterval(this.animationTimer);
    }
  }

  resetSimulation() {
    clearInterval(this.animationTimer);
    this.isPlaying = false;
    if (this.playPauseBtn) this.playPauseBtn.textContent = '▶ Play';
    this.showFrame(0);
  }

  setLoading(isLoading) {
    if (this.runSimBtn) {
      this.runSimBtn.disabled = isLoading;
      this.runSimBtn.textContent = isLoading ? '⏳ Computing 2D Field...' : '⚡ Run Simulation';
    }
  }

  // Side-by-Side Comparison
  async executeComparison() {
    try {
      const condA = { ...this.state, gravity_g: 1.0, duration_s: 2.0 };
      const condB = { ...this.state, gravity_g: 0.0001, duration_s: 2.0 };

      const comp = await API.compare(condA, condB);

      this.compareRendererA.render(comp.condition_a);
      this.compareRendererB.render(comp.condition_b);

      const summaryBox = document.getElementById('compareSummaryText');
      if (summaryBox) {
        summaryBox.textContent = comp.comparison_summary;
      }

      // Fill delta table
      const deltaTable = document.getElementById('compareDeltaTable');
      if (deltaTable) {
        const mA = comp.condition_a.metrics;
        const mB = comp.condition_b.metrics;
        deltaTable.innerHTML = `
          <tr><td>Peak Buoyant Flow Velocity</td><td>${mA.max_velocity_ms} m/s</td><td>${mB.max_velocity_ms} m/s</td><td class="text-cyan">${(mB.max_velocity_ms - mA.max_velocity_ms).toFixed(3)} m/s</td></tr>
          <tr><td>Buoyancy Acceleration</td><td>${mA.buoyancy_strength_ms2} m/s²</td><td>${mB.buoyancy_strength_ms2} m/s²</td><td class="text-cyan">-${mA.buoyancy_strength_ms2.toFixed(2)} m/s²</td></tr>
          <tr><td>Peak Flame Temperature</td><td>${mA.peak_temperature_k} K</td><td>${mB.peak_temperature_k} K</td><td>${(mB.peak_temperature_k - mA.peak_temperature_k).toFixed(1)} K</td></tr>
          <tr><td>Estimated Flame Area</td><td>${mA.estimated_flame_area_cm2} cm²</td><td>${mB.estimated_flame_area_cm2} cm²</td><td class="text-orange">+${(mB.estimated_flame_area_cm2 - mA.estimated_flame_area_cm2).toFixed(2)} cm²</td></tr>
          <tr><td>Dominant Transport Mechanism</td><td>Natural Convection</td><td>Molecular Diffusion</td><td>Convective Quench Shift</td></tr>
        `;
      }
    } catch (err) {
      console.error('Comparison error:', err);
    }
  }

  // Experiments: Gravity Sweep
  async executeGravitySweep() {
    try {
      const data = await API.gravitySweep({
        oxygen_percent: this.state.oxygen_percent,
        pressure_kpa: this.state.pressure_kpa,
        fuel: this.state.fuel,
      });
      this.sweepChart.renderGravitySweep(data.points);
      const sweepSummary = document.getElementById('sweepSummaryText');
      if (sweepSummary) sweepSummary.textContent = data.sweep_summary;
    } catch (err) {
      console.error('Gravity sweep error:', err);
    }
  }

  // Experiments: Extinction Boundary Sweep
  async executeExtinctionSweep() {
    try {
      const data = await API.extinctionSweep({
        gravity_g: 0.0001,
        pressure_kpa: this.state.pressure_kpa,
        fuel: this.state.fuel,
      });
      this.extinctionChart.renderExtinctionCurve(data.points);
      const extSummary = document.getElementById('extinctionSummaryText');
      if (extSummary) extSummary.textContent = data.extinction_boundary_summary;
    } catch (err) {
      console.error('Extinction sweep error:', err);
    }
  }

  // Experiments: Ventilation Sweep
  async executeVentilationSweep() {
    try {
      const data = await API.ventilationSweep({
        gravity_g: 0.0001,
        pressure_kpa: this.state.pressure_kpa,
        fuel: this.state.fuel,
      });
      this.ventilationChart.renderVentilationCurve(data.points);
      const ventSummary = document.getElementById('ventilationSummaryText');
      if (ventSummary) ventSummary.textContent = data.ventilation_summary;
    } catch (err) {
      console.error('Ventilation sweep error:', err);
    }
  }

  // Data Export (JSON)
  exportJSON() {
    if (!this.currentSimulation) return;
    const exportBlob = new Blob([JSON.stringify(this.currentSimulation, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(exportBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zerog_flames_sim_${this.state.gravity_g}g_${this.state.fuel}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Data Export (CSV summary)
  exportCSV() {
    if (!this.currentSimulation) return;
    const m = this.currentSimulation.metrics;
    const meta = this.currentSimulation.metadata;
    const rows = [
      ['ZeroG Flames Simulation Output', 'Model: ' + meta.model],
      ['Parameter', 'Value', 'Units'],
      ['Gravity', meta.gravity_g, 'g'],
      ['Oxygen Concentration', meta.oxygen_percent, '%'],
      ['Ambient Pressure', meta.pressure_kpa, 'kPa'],
      ['Forced Airflow', meta.airflow_ms, 'm/s'],
      ['Fuel', meta.fuel, ''],
      ['Peak Temperature', m.peak_temperature_k, 'K'],
      ['Max Gas Velocity', m.max_velocity_ms, 'm/s'],
      ['Total Reaction Rate', m.total_reaction_rate, 'kg/s'],
      ['Oxygen Consumption', m.oxygen_consumption_rate, 'kg/s'],
      ['Buoyant Acceleration', m.buoyancy_strength_ms2, 'm/s^2'],
      ['Estimated Flame Area', m.estimated_flame_area_cm2, 'cm^2'],
      ['Flame Status', m.flame_status, ''],
      ['Dominant Transport Regime', `"${m.transport_regime}"`, ''],
    ];

    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zerog_flames_summary_${this.state.gravity_g}g.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Initialize Application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ZeroGApp();
});
