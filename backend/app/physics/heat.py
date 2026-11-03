"""
Energy and heat transport module for ZeroG Flames.
Solves advection-conduction-heat release-heat loss equation for temperature T(x,y).
"""
import numpy as np
from .grid import SimulationGrid


SIGMA_SB = 5.670374419e-8  # Stefan-Boltzmann constant (W / (m^2 * K^4))


def solve_heat_transport(
    temp_field: np.ndarray,
    u_field: np.ndarray,
    v_field: np.ndarray,
    reaction_rate: np.ndarray,
    heat_of_combustion: float,
    thermal_diffusivity: float,
    ambient_temp_k: float,
    pressure_kpa: float,
    dt: float,
    grid: SimulationGrid,
    soot_emissivity_factor: float = 1.0,
) -> np.ndarray:
    """
    Advance temperature field by one time step dt:
    dT/dt + u * dT/dx + v * dT/dy = alpha * (d^2 T/dx^2 + d^2 T/dy^2) + (Q * omega)/(rho * cp) - L_loss
    """
    ny, nx = temp_field.shape
    dx, dy = grid.dx, grid.dy
    
    # Thermodynamic properties of air / combustion mixture
    # rho = P / (R_specific * T)
    rho_eff = (pressure_kpa * 1e3) / (287.05 * np.maximum(temp_field, 200.0))
    cp_eff = 1100.0  # J / (kg * K)
    rho_cp = np.maximum(100.0, rho_eff * cp_eff)
    
    # 1. Thermal Conduction (Diffusion of heat)
    d2_dx2 = np.zeros_like(temp_field)
    d2_dy2 = np.zeros_like(temp_field)
    
    d2_dx2[:, 1:-1] = (temp_field[:, 2:] - 2.0 * temp_field[:, 1:-1] + temp_field[:, :-2]) / (dx * dx)
    d2_dx2[:, 0] = (temp_field[:, 1] - temp_field[:, 0]) / (dx * dx)
    d2_dx2[:, -1] = (temp_field[:, -2] - temp_field[:, -1]) / (dx * dx)
    
    d2_dy2[1:-1, :] = (temp_field[2:, :] - 2.0 * temp_field[1:-1, :] + temp_field[:-2, :]) / (dy * dy)
    d2_dy2[0, :] = (temp_field[1, :] - temp_field[0, :]) / (dy * dy)
    d2_dy2[-1, :] = (temp_field[-2, :] - temp_field[-1, :]) / (dy * dy)
    
    conduction_term = thermal_diffusivity * (d2_dx2 + d2_dy2)
    
    # 2. Upwind Advection
    advection_x = np.zeros_like(temp_field)
    u_pos = np.maximum(0.0, u_field)
    u_neg = np.minimum(0.0, u_field)
    
    advection_x[:, 1:] += u_pos[:, 1:] * (temp_field[:, 1:] - temp_field[:, :-1]) / dx
    advection_x[:, :-1] += u_neg[:, :-1] * (temp_field[:, 1:] - temp_field[:, :-1]) / dx
    
    advection_y = np.zeros_like(temp_field)
    v_pos = np.maximum(0.0, v_field)
    v_neg = np.minimum(0.0, v_field)
    
    advection_y[1:, :] += v_pos[1:, :] * (temp_field[1:, :] - temp_field[:-1, :]) / dy
    advection_y[:-1, :] += v_neg[:-1, :] * (temp_field[1:, :] - temp_field[:-1, :]) / dy
    
    advection_term = -(advection_x + advection_y)
    
    # 3. Chemical Heat Release: (Q * omega) / (rho * cp)
    heat_source = (heat_of_combustion * reaction_rate) / rho_cp
    
    # 4. Heat Losses:
    # a. Linear ambient cooling (convective / boundary dissipation)
    convective_loss = 4.0 * (temp_field - ambient_temp_k)
    # b. Radiative emission (optically thin Planck radiation): 4 * a_p * sigma * (T^4 - T_amb^4) / (rho * cp)
    safe_t = np.clip(temp_field, ambient_temp_k, 2500.0)
    a_planck = 0.25 * soot_emissivity_factor  # Planck mean absorption coefficient (1/m)
    rad_loss = (4.0 * a_planck * SIGMA_SB * (safe_t**4 - ambient_temp_k**4)) / rho_cp
    
    total_loss = convective_loss + rad_loss
    
    # 5. Explicit update
    new_temp = temp_field + dt * (conduction_term + advection_term + heat_source - total_loss)
    
    # 6. Boundary conditions
    new_temp[0, :] = ambient_temp_k   # Bottom boundary
    new_temp[:, 0] = ambient_temp_k   # Left boundary
    new_temp[:, -1] = ambient_temp_k  # Right boundary
    new_temp[-1, :] = np.maximum(ambient_temp_k, new_temp[-2, :] * 0.96)  # Outflow top
    
    # Physical temperature bounds [ambient, adiabatic limit]
    return np.clip(new_temp, ambient_temp_k, 2400.0)
