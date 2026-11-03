/**
 * ZeroG Flames — Frontend Simulation API Client
 */
import {
  SimulationInput,
  SimulationResponse,
  EnvironmentPreset,
  FuelPreset,
  GravitySweepPoint,
  ExtinctionPoint,
  VentilationPoint,
} from '../types/simulation';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

export const simulationAPI = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  },

  async getPresets(): Promise<Record<string, EnvironmentPreset>> {
    const res = await fetch(`${API_BASE}/presets`);
    return await res.json();
  },

  async getFuels(): Promise<Record<string, FuelPreset>> {
    const res = await fetch(`${API_BASE}/fuels`);
    return await res.json();
  },

  async getMetadata() {
    const res = await fetch(`${API_BASE}/metadata`);
    return await res.json();
  },

  async simulate(params: SimulationInput): Promise<SimulationResponse> {
    const res = await fetch(`${API_BASE}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Simulation execution failed');
    }
    return await res.json();
  },

  async compare(conditionA: SimulationInput, conditionB: SimulationInput) {
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
      throw new Error(err.detail || 'Comparison execution failed');
    }
    return await res.json();
  },

  async gravitySweep(params: { oxygen_percent: number; pressure_kpa: number; fuel: string }): Promise<{ points: GravitySweepPoint[]; sweep_summary: string }> {
    const res = await fetch(`${API_BASE}/sweep`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Gravity sweep failed');
    }
    return await res.json();
  },

  async extinctionSweep(params: { gravity_g: number; pressure_kpa: number; fuel: string }): Promise<{ gravity_g: number; limiting_oxygen_index_percent: number | null; extinction_boundary_summary: string; points: ExtinctionPoint[] }> {
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

  async ventilationSweep(params: { gravity_g: number; pressure_kpa: number; fuel: string }): Promise<{ gravity_g: number; points: VentilationPoint[]; ventilation_summary: string }> {
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
