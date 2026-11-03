"""
Metrics extraction, diagnostic computations, and status evaluation for ZeroG Flames.
"""
from dataclasses import dataclass
import numpy as np
from .grid import SimulationGrid


@dataclass
class SimulationMetrics:
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


def compute_simulation_metrics(
    temp_field: np.ndarray,
    o2_field: np.ndarray,
    fuel_field: np.ndarray,
    reaction_field: np.ndarray,
    u_field: np.ndarray,
    v_field: np.ndarray,
    buoyancy_strength: float,
    grid: SimulationGrid,
    gravity_g: float,
    forced_airflow_ms: float,
    stoich_ratio: float,
    simulation_step: int,
    total_steps: int,
) -> SimulationMetrics:
    """
    Extract scalar metrics and classify physical state.
    """
    cell_area_cm2 = (grid.dx * 100.0) * (grid.dy * 100.0)
    
    peak_temp = float(np.max(temp_field))
    mean_temp = float(np.mean(temp_field))
    max_reaction = float(np.max(reaction_field))
    total_reaction = float(np.sum(reaction_field))
    o2_consumption = float(total_reaction * stoich_ratio)
    
    vel_mag = np.sqrt(u_field**2 + v_field**2)
    max_vel = float(np.max(vel_mag))
    
    # Flame area: cells where reaction rate exceeds significant threshold
    reaction_threshold = 0.05 * max_reaction if max_reaction > 1e-4 else 0.01
    active_flame_cells = int(np.sum(reaction_field > reaction_threshold))
    estimated_area = float(active_flame_cells * cell_area_cm2)
    
    # Classify flame status
    if max_reaction < 1e-4 or peak_temp < 450.0:
        flame_status = "EXTINGUISHED"
    elif simulation_step < (total_steps * 0.2):
        flame_status = "IGNITING"
    elif max_reaction > 0.05 and peak_temp > 900.0:
        flame_status = "STABLE"
    else:
        flame_status = "WEAKENING"
        
    # Determine dominant transport regime
    if flame_status == "EXTINGUISHED":
        transport_regime = "Extinguished (Sub-critical reaction)"
    elif gravity_g >= 0.5:
        if forced_airflow_ms > 0.3:
            transport_regime = "Mixed Buoyant Convection & Forced Cross-flow"
        else:
            transport_regime = "Buoyancy-Dominated Natural Convection (Elongated Plume)"
    elif 0.05 <= gravity_g < 0.5:
        if forced_airflow_ms > 0.3:
            transport_regime = "Reduced-G Forced Ventilation Dominated"
        else:
            transport_regime = "Reduced Gravity Transition (Broadened Convective Plume)"
    else:  # Near-zero gravity
        if forced_airflow_ms > 0.05:
            transport_regime = "Microgravity Forced Ventilation (Asymmetric Diffusion Flame)"
        else:
            transport_regime = "Microgravity Diffusion-Dominated (Spherical Reaction Shell)"
            
    # Generate deterministic scientific interpretation based on parameter regimes
    if flame_status == "EXTINGUISHED":
        scientific_summary = (
            "The reaction cannot be sustained under current conditions (insufficient oxygen or excessive thermal loss). "
            "Combustion has quenched."
        )
    elif gravity_g >= 0.7:
        scientific_summary = (
            f"At Earth-like gravity ({gravity_g:.2f} g), strong buoyant forces generate vigorous natural convection "
            f"(peak buoyant acceleration: {buoyancy_strength:.2f} m/s²). Hot combustion products rise rapidly, pulling fresh "
            f"oxygen inward toward the flame base to sustain a high-intensity, elongated plume."
        )
    elif 0.05 <= gravity_g < 0.7:
        scientific_summary = (
            f"At partial gravity ({gravity_g:.2f} g), natural buoyancy is noticeably subdued. The upward gas velocity "
            f"decreases, broadening the reaction zone and shifting transport toward a mixed convection-diffusion regime."
        )
    else:  # Near zero g
        if forced_airflow_ms > 0.05:
            scientific_summary = (
                f"In microgravity ({gravity_g:.4f} g) with forced ventilation ({forced_airflow_ms:.2f} m/s), natural buoyancy "
                f"is negligible. Forced airflow becomes the sole bulk transport mechanism, delivering oxygen downstream and "
                f"elongating the flame horizontally along the ventilation axis."
            )
        else:
            scientific_summary = (
                f"In quiescent microgravity ({gravity_g:.4f} g, 0.0 m/s airflow), buoyancy-driven convection vanishes. "
                f"Oxygen and fuel transport rely entirely on slow molecular diffusion, creating a calm, spherical flame shell "
                f"with reduced peak reaction intensity and longer residence times."
            )

    return SimulationMetrics(
        peak_temperature_k=round(peak_temp, 2),
        mean_temperature_k=round(mean_temp, 2),
        max_reaction_rate=round(max_reaction, 4),
        total_reaction_rate=round(total_reaction, 4),
        oxygen_consumption_rate=round(o2_consumption, 4),
        estimated_flame_area_cm2=round(estimated_area, 2),
        max_velocity_ms=round(max_vel, 3),
        buoyancy_strength_ms2=round(buoyancy_strength, 3),
        flame_status=flame_status,
        transport_regime=transport_regime,
        scientific_summary=scientific_summary,
    )
