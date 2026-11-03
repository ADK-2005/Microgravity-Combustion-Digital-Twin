"""
Oxygen transport module for ZeroG Flames.
Solves advection-diffusion-reaction for oxygen mass fraction Y_O2.
"""
import numpy as np
from .grid import SimulationGrid


def solve_oxygen_transport(
    o2_field: np.ndarray,
    u_field: np.ndarray,
    v_field: np.ndarray,
    reaction_rate: np.ndarray,
    stoich_ratio: float,
    diffusivity: float,
    ambient_o2_frac: float,
    dt: float,
    grid: SimulationGrid,
) -> np.ndarray:
    """
    Advance oxygen field by one time step dt:
    dY_O2/dt + u * dY_O2/dx + v * dY_O2/dy = D_O2 * (d^2 Y_O2 / dx^2 + d^2 Y_O2 / dy^2) - s * omega
    """
    ny, nx = o2_field.shape
    dx, dy = grid.dx, grid.dy
    
    # 1. Molecular Diffusion (Central Difference Laplacian)
    # d2Y/dx2 + d2Y/dy2
    d2_dx2 = np.zeros_like(o2_field)
    d2_dy2 = np.zeros_like(o2_field)
    
    d2_dx2[:, 1:-1] = (o2_field[:, 2:] - 2.0 * o2_field[:, 1:-1] + o2_field[:, :-2]) / (dx * dx)
    d2_dx2[:, 0] = (o2_field[:, 1] - o2_field[:, 0]) / (dx * dx)
    d2_dx2[:, -1] = (o2_field[:, -2] - o2_field[:, -1]) / (dx * dx)
    
    d2_dy2[1:-1, :] = (o2_field[2:, :] - 2.0 * o2_field[1:-1, :] + o2_field[:-2, :]) / (dy * dy)
    d2_dy2[0, :] = (o2_field[1, :] - o2_field[0, :]) / (dy * dy)
    d2_dy2[-1, :] = (o2_field[-2, :] - o2_field[-1, :]) / (dy * dy)
    
    diffusion_term = diffusivity * (d2_dx2 + d2_dy2)
    
    # 2. Upwind Advection for numerical stability
    # u * dY/dx
    advection_x = np.zeros_like(o2_field)
    u_pos = np.maximum(0.0, u_field)
    u_neg = np.minimum(0.0, u_field)
    
    # For positive u (flow to right): backward difference
    advection_x[:, 1:] += u_pos[:, 1:] * (o2_field[:, 1:] - o2_field[:, :-1]) / dx
    # For negative u (flow to left): forward difference
    advection_x[:, :-1] += u_neg[:, :-1] * (o2_field[:, 1:] - o2_field[:, :-1]) / dx
    
    # v * dY/dy
    advection_y = np.zeros_like(o2_field)
    v_pos = np.maximum(0.0, v_field)
    v_neg = np.minimum(0.0, v_field)
    
    # For positive v (flow upward): backward difference
    advection_y[1:, :] += v_pos[1:, :] * (o2_field[1:, :] - o2_field[:-1, :]) / dy
    # For negative v (flow downward): forward difference
    advection_y[:-1, :] += v_neg[:-1, :] * (o2_field[1:, :] - o2_field[:-1, :]) / dy
    
    advection_term = -(advection_x + advection_y)
    
    # 3. Chemical Sink (Reaction consumption)
    consumption_term = -stoich_ratio * reaction_rate
    
    # 4. Explicit update with timestep
    new_o2 = o2_field + dt * (diffusion_term + advection_term + consumption_term)
    
    # 5. Boundary conditions: replenishment from ambient surroundings
    # Top, left, and right chamber open boundaries
    new_o2[0, :] = ambient_o2_frac  # Bottom wall ambient
    new_o2[-1, :] = ambient_o2_frac  # Top ceiling ambient
    new_o2[:, 0] = ambient_o2_frac  # Left wall ambient
    new_o2[:, -1] = ambient_o2_frac  # Right wall ambient
    
    # Near burner center: fuel displaces oxygen
    burner_core = grid.dist_from_burner <= (grid.burner_radius_cells * 0.7 * dx)
    new_o2[burner_core] = np.minimum(new_o2[burner_core], ambient_o2_frac * 0.1)
    
    # Enforce physical mass fraction bounds [0.0, 1.0]
    return np.clip(new_o2, 0.0, 1.0)
