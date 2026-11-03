"""
Pydantic output models for ZeroG Flames API.
"""
from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class SimulationMetadata(BaseModel):
    model: str
    grid_size: List[int]
    domain_size_m: List[float]
    simulation_time_s: float
    dt_s: float
    total_timesteps: int
    fuel: str
    gravity_g: float
    oxygen_percent: float
    pressure_kpa: float
    airflow_ms: float


class SimulationMetricsModel(BaseModel):
    peak_temperature_k: float
    mean_temperature_k: float
    max_reaction_rate: float
    total_reaction_rate: float
    oxygen_consumption_rate: float
    estimated_flame_area_cm2: float
    max_velocity_ms: float
    buoyancy_strength_ms2: float
    flame_status: str
    transport_regime: str
    scientific_summary: str


class SimulationFieldsModel(BaseModel):
    temperature: List[List[float]]
    oxygen: List[List[float]]
    fuel: List[List[float]]
    reaction: List[List[float]]
    velocity_u: List[List[float]]
    velocity_v: List[List[float]]


class SimulationFrameModel(BaseModel):
    time_s: float
    step: int
    peak_temperature_k: float
    total_reaction_rate: float
    max_velocity_ms: float
    flame_status: str
    temperature: List[List[float]]
    oxygen: List[List[float]]
    reaction: List[List[float]]


class SimulationResponse(BaseModel):
    metadata: SimulationMetadata
    metrics: SimulationMetricsModel
    fields: SimulationFieldsModel
    frames: List[SimulationFrameModel]


class CompareResponse(BaseModel):
    condition_a: SimulationResponse
    condition_b: SimulationResponse
    comparison_summary: str


class GravitySweepDataPoint(BaseModel):
    gravity_g: float
    gravity_ms2: float
    peak_temperature_k: float
    total_reaction_rate: float
    max_velocity_ms: float
    buoyancy_strength_ms2: float
    flame_area_cm2: float
    status: str
    transport_regime: str


class GravitySweepResponse(BaseModel):
    points: List[GravitySweepDataPoint]
    sweep_summary: str


class ExtinctionDataPoint(BaseModel):
    oxygen_percent: float
    peak_temperature_k: float
    total_reaction_rate: float
    status: str
    is_sustained: bool


class ExtinctionSweepResponse(BaseModel):
    gravity_g: float
    limiting_oxygen_index_percent: Optional[float]
    extinction_boundary_summary: str
    points: List[ExtinctionDataPoint]


class VentilationDataPoint(BaseModel):
    airflow_ms: float
    peak_temperature_k: float
    total_reaction_rate: float
    max_velocity_ms: float
    flame_area_cm2: float
    transport_regime: str
    status: str


class VentilationSweepResponse(BaseModel):
    gravity_g: float
    points: List[VentilationDataPoint]
    ventilation_summary: str

