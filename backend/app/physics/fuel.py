"""
Fuel transport module for ZeroG Flames.
Solves advection-diffusion-reaction for fuel mass fraction Y_F.
"""
import numpy as np
from .grid import SimulationGrid


def solve_fuel_transport(
    fuel_field: np.ndarray,
    u_field: np.ndarray,
    v_field: np.ndarray,
    reaction_rate: np.ndarray,
    diffusivity: float,
    dt: float,
    grid: SimulationGrid,
    burner_fuel_fraction: float = 1.0,
) -> np.ndarray:
    """
    Advance fuel field by one time step dt:
    dY_F/dt + u * dY_F/dx + v * dY_F/dy = D_F * (d^2 Y_F / dx^2 + d^2 Y_F / dy^2) - omega
    """
    ny, nx = fuel_field.shape
    dx, dy = grid.dx, grid.dy
    
    # 1. Molecular Diffusion
    d2_dx2 = np.zeros_like(fuel_field)
    d2_dy2 = np.zeros_like(fuel_field)
    
    d2_dx2[:, 1:-1] = (fuel_field[:, 2:] - 2.0 * fuel_field[:, 1:-1] + fuel_field[:, :-2]) / (dx * dx)
    d2_dx2[:, 0] = (fuel_field[:, 1] - fuel_field[:, 0]) / (dx * dx)
    d2_dx2[:, -1] = (fuel_field[:, -2] - fuel_field[:, -1]) / (dx * dx)
    
    d2_dy2[1:-1, :] = (fuel_field[2:, :] - 2.0 * fuel_field[1:-1, :] + fuel_field[:-2, :]) / (dy * dy)
    d2_dy2[0, :] = (fuel_field[1, :] - fuel_field[0, :]) / (dy * dy)
    d2_dy2[-1, :] = (fuel_field[-2, :] - fuel_field[-1, :]) / (dy * dy)
    
    diffusion_term = diffusivity * (d2_dx2 + d2_dy2)
    
    # 2. Upwind Advection
    advection_x = np.zeros_like(fuel_field)
    u_pos = np.maximum(0.0, u_field)
    u_neg = np.minimum(0.0, u_field)
    
    advection_x[:, 1:] += u_pos[:, 1:] * (fuel_field[:, 1:] - fuel_field[:, :-1]) / dx
    advection_x[:, :-1] += u_neg[:, :-1] * (fuel_field[:, 1:] - fuel_field[:, :-1]) / dx
    
    advection_y = np.zeros_like(fuel_field)
    v_pos = np.maximum(0.0, v_field)
    v_neg = np.minimum(0.0, v_field)
    
    advection_y[1:, :] += v_pos[1:, :] * (fuel_field[1:, :] - fuel_field[:-1, :]) / dy
    advection_y[:-1, :] += v_neg[:-1, :] * (fuel_field[1:, :] - fuel_field[:-1, :]) / dy
    
    advection_term = -(advection_x + advection_y)
    
    # 3. Chemical Sink (Fuel consumption)
    consumption_term = -reaction_rate
    
    # 4. Explicit update with timestep
    new_fuel = fuel_field + dt * (diffusion_term + advection_term + consumption_term)
    
    # 5. Boundary conditions
    # Fuel inlet at burner maintains continuous gaseous supply
    new_fuel[grid.burner_mask] = burner_fuel_fraction
    
    # Open / zero fuel at chamber outer boundaries
    new_fuel[0, ~grid.burner_mask[0, :]] = 0.0
    new_fuel[-1, :] = np.maximum(0.0, new_fuel[-2, :] * 0.95)  # Outflow top
    new_fuel[:, 0] = 0.0
    new_fuel[:, -1] = 0.0
    
    return np.clip(new_fuel, 0.0, 1.0)
