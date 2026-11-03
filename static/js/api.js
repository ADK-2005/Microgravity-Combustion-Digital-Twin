/**
 * ZeroG Flames — API Client
 * Facilitates asynchronous communication with FastAPI simulation backend.
 */

const API_BASE = '/api';

export const API = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  },

  async getPresets() {
    const res = await fetch(`${API_BASE}/presets`);
    return await res.json();
  },

  async getFuels() {
    const res = await fetch(`${API_BASE}/fuels`);
    return await res.json();
  },

  async getMetadata() {
    const res = await fetch(`${API_BASE}/metadata`);
    return await res.json();
  },

  async simulate(params) {
    const res = await fetch(`${API_BASE}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Simulation failed');
    }
    return await res.json();
  },

  async compare(conditionA, conditionB) {
    const res = await fetch(`${API_BASE}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        condition_a: conditionA,
        condition_b: conditionB,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Comparison failed');
    }
    return await res.json();
  },

  async gravitySweep(params) {
    const res = await fetch(`${API_BASE}/sweep`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Sweep failed');
    }
    return await res.json();
  },

  async extinctionSweep(params) {
    const res = await fetch(`${API_BASE}/extinction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Extinction sweep failed');
    }
    return await res.json();
  },

  async ventilationSweep(params) {
    const res = await fetch(`${API_BASE}/ventilation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Ventilation sweep failed');
    }
    return await res.json();
  },
};

