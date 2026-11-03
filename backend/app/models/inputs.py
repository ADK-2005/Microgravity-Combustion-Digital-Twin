"""
Pydantic input models for ZeroG Flames API.
"""
from pydantic import BaseModel, Field
from typing import Optional, List


class SimulationRequest(BaseModel):
    gravity_g: float = Field(default=1.0, ge=0.0, le=10.0, description="Gravitational acceleration relative to Earth (1.0 = 9.81 m/s²)")
    oxygen_percent: float = Field(default=20.95, ge=0.0, le=100.0, description="Oxygen concentration percentage by volume")
    pressure_kpa: float = Field(default=101.325, ge=10.0, le=500.0, description="Ambient pressure in kilopascals")
    airflow_ms: float = Field(default=0.0, ge=-5.0, le=5.0, description="Forced cross-ventilation velocity in m/s")
    fuel: str = Field(default="methane", description="Fuel key (methane, hydrocarbon, ethanol_vapor)")
    ambient_temperature_k: float = Field(default=293.15, ge=200.0, le=500.0, description="Chamber ambient temperature in Kelvin")
    duration_s: float = Field(default=2.0, ge=0.2, le=10.0, description="Simulation physical duration in seconds")
    grid_size: int = Field(default=64, ge=32, le=96, description="Computational grid dimension NxN")


class CompareRequest(BaseModel):
    condition_a: SimulationRequest
    condition_b: SimulationRequest


class GravitySweepRequest(BaseModel):
    gravity_steps: Optional[List[float]] = Field(
        default=[1.0, 0.75, 0.50, 0.38, 0.165, 0.10, 0.05, 0.01, 0.0001],
        description="List of gravity levels to evaluate"
    )
    oxygen_percent: float = Field(default=20.95, ge=0.0, le=100.0)
    pressure_kpa: float = Field(default=101.325, ge=10.0, le=500.0)
    airflow_ms: float = Field(default=0.0, ge=-5.0, le=5.0)
    fuel: str = Field(default="methane")


class ExtinctionSweepRequest(BaseModel):
    gravity_g: float = Field(default=0.0001, ge=0.0, le=10.0)
    oxygen_steps: Optional[List[float]] = Field(
        default=[2.0, 5.0, 8.0, 10.0, 12.0, 15.0, 18.0, 21.0, 25.0, 30.0],
        description="Oxygen percentages to test for extinction mapping"
    )
    pressure_kpa: float = Field(default=101.325, ge=10.0, le=500.0)
    airflow_ms: float = Field(default=0.0, ge=-5.0, le=5.0)
    fuel: str = Field(default="methane")


class VentilationSweepRequest(BaseModel):
    gravity_g: float = Field(default=0.0001, ge=0.0, le=10.0, description="Background gravitational acceleration (defaults to microgravity)")
    airflow_steps: Optional[List[float]] = Field(
        default=[-1.0, -0.5, -0.2, 0.0, 0.2, 0.5, 1.0],
        description="Airflow velocities (m/s) to evaluate cross-ventilation asymmetry"
    )
    oxygen_percent: float = Field(default=20.95, ge=0.0, le=100.0)
    pressure_kpa: float = Field(default=101.325, ge=10.0, le=500.0)
    fuel: str = Field(default="methane")

