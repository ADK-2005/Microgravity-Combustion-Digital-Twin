"""
Reduced-order buoyancy and fluid velocity model for ZeroG Flames.
Calculates flow field from Boussinesq buoyancy acceleration + forced ventilation.
u_total = u_forced + u_buoyancy
"""
import numpy as np
from .grid import SimulationGrid


def compute_buoyancy_velocity_field(
    temperature_field: np.ndarray,
    grid: SimulationGrid,
    gravity_g: float = 1.0,
    ambient_temp_k: float = 293.15,
    forced_airflow_ms: float = 0.0,
) -> tuple[np.ndarray, np.ndarray, float]:
    """
    Compute 2D velocity components u(x,y) [m/s] and v(x,y) [m/s].
    
    Returns:
        u: horizontal velocity field (m/s)
        v: vertical velocity field (m/s)
        max_buoyancy_strength: peak upward buoyancy acceleration (m/s^2)
    """
    g_acc = max(0.0, gravity_g) * 9.80665  # m/s^2
    beta = 1.0 / ambient_temp_k  # Volumetric thermal expansion coefficient for ideal gas (1/K)
    
    # Temperature difference relative to ambient
    delta_t = np.maximum(0.0, temperature_field - ambient_temp_k)
    
    # Local buoyancy force / acceleration: F_b / rho = g * beta * (T - T_amb)
    buoyancy_acc = g_acc * beta * delta_t
    max_buoyancy_strength = float(np.max(buoyancy_acc))
    
    # Buoyancy-driven upward vertical velocity v_buoy:
    # Based on fluid dynamics scaling v ~ sqrt(2 * g * beta * Delta_T * delta_y)
    y_rel = np.maximum(0.0, grid.yy - grid.y[grid.burner_iy])
    v_buoy_scale = np.sqrt(2.0 * buoyancy_acc * np.maximum(y_rel, grid.dy * 2))
    
    # Smooth vertical profile to represent viscous shear and momentum transfer
    # Flame column accelerates upward as it rises
    v_buoy = v_buoy_scale * 0.45
    
    # Lateral entrainment (continuity: div(u) ~ 0)
    # Rising plume draws air laterally from sides into the center line
    center_x = grid.x[grid.burner_ix]
    x_rel = grid.xx - center_x
    
    # Lateral entrainment velocity draws inward towards the rising hot column
    # Magnitude scales with vertical acceleration gradient
    dv_dy = np.gradient(v_buoy, grid.dy, axis=0)
    entrain_strength = -0.5 * np.sign(x_rel) * np.abs(dv_dy) * grid.dx * 1.5
    u_entrain = np.clip(entrain_strength, -0.6, 0.6)
    
    # Base forced airflow (horizontal ventilation in spacecraft duct)
    u_forced = np.full_like(temperature_field, forced_airflow_ms)
    
    # Total combined flow field
    u_total = u_forced + u_entrain
    v_total = v_buoy
    
    # Boundary wall dampening (no-slip at bottom burner wall)
    v_total[0:2, :] *= 0.1
    
    return u_total, v_total, max_buoyancy_strength
