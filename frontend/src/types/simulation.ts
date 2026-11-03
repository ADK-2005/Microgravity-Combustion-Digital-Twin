/**
 * ZeroG Flames — TypeScript Simulation Types
 * Matches backend FastAPI Pydantic models.
 */

export interface SimulationMetadata {
  model: string;
  grid_size: [number, number];
  domain_size_m: [number, number];
  simulation_time_s: number;
  dt_s: number;
  total_timesteps: number;
  fuel: string;
  gravity_g: number;
  oxygen_percent: number;
  pressure_kpa: number;
  airflow_ms: number;
}

export interface SimulationMetrics {
  peak_temperature_k: number;
  mean_temperature_k: number;
  max_reaction_rate: number;
  total_reaction_rate: number;
  oxygen_consumption_rate: number;
  estimated_flame_area_cm2: number;
  max_velocity_ms: number;
  buoyancy_strength_ms2: number;
  flame_status: 'IGNITING' | 'STABLE' | 'WEAKENING' | 'EXTINGUISHED';
  transport_regime: string;
  scientific_summary: string;
}

export interface SimulationFields {
  temperature: number[][];
  oxygen: number[][];
  fuel: number[][];
  reaction: number[][];
  velocity_u: number[][];
  velocity_v: number[][];
}

export interface SimulationFrame {
  time_s: number;
  step: number;
  peak_temperature_k: number;
  total_reaction_rate: number;
  max_velocity_ms: number;
  flame_status: string;
  temperature: number[][];
  oxygen: number[][];
  reaction: number[][];
}

export interface SimulationResponse {
  metadata: SimulationMetadata;
  metrics: SimulationMetrics;
  fields: SimulationFields;
  frames: SimulationFrame[];
}

export interface SimulationInput {
  gravity_g: number;
  oxygen_percent: number;
  pressure_kpa: number;
  airflow_ms: number;
  fuel: string;
  ambient_temperature_k?: number;
  duration_s?: number;
  grid_size?: number;
}

export interface EnvironmentPreset {
  id: string;
  name: string;
  gravity_g: number;
  gravity_ms2: number;
  default_o2_percent: number;
  default_pressure_kpa: number;
  description: string;
  dominant_regime: string;
}

export interface FuelPreset {
  name: string;
  description: string;
  molecular_weight: number;
  heat_of_combustion_j_kg: number;
  stoich_o2_ratio: number;
  activation_energy_j_mol: number;
  pre_exponential: number;
  diffusion_coeff: number;
  flame_temp_nominal_k: number;
  soot_propensity: string;
  typical_color_earth: string;
  typical_color_zerog: string;
}

export interface GravitySweepPoint {
  gravity_g: number;
  gravity_ms2: number;
  peak_temperature_k: number;
  total_reaction_rate: number;
  max_velocity_ms: number;
  buoyancy_strength_ms2: number;
  flame_area_cm2: number;
  status: string;
  transport_regime: string;
}

export interface ExtinctionPoint {
  oxygen_percent: number;
  peak_temperature_k: number;
  total_reaction_rate: number;
  status: string;
  is_sustained: boolean;
}

export interface VentilationPoint {
  airflow_ms: number;
  peak_temperature_k: number;
  total_reaction_rate: number;
  max_velocity_ms: number;
  flame_area_cm2: number;
  transport_regime: string;
  status: string;
}
