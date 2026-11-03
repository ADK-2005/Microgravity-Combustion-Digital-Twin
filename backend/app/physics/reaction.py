"""
Arrhenius chemical kinetics model for single-step gaseous fuel oxidation.
Fuel + s * O2 -> Products + Heat
"""
import numpy as np


R_UNIVERSAL = 8.31446261815324  # J / (mol * K)


def compute_reaction_rate(
    fuel_field: np.ndarray,
    oxygen_field: np.ndarray,
    temperature_field: np.ndarray,
    pre_exponential: float = 1.2e7,
    activation_energy: float = 85000.0,
    pressure_kpa: float = 101.325,
    reference_pressure_kpa: float = 101.325,
) -> np.ndarray:
    """
    Calculate volumetric reaction rate omega (kg_fuel / (m^3 * s)) using
    single-step Arrhenius kinetics with pressure scaling.
    """
    # Pressure scaling factor (p / p_ref)^n where n ~ 1.0 for global bimolecular reactions
    pressure_factor = np.clip(pressure_kpa / reference_pressure_kpa, 0.1, 5.0)
    
    # Safe temperature clamping for Arrhenius exponent
    safe_temp = np.maximum(temperature_field, 150.0)
    exponent = -activation_energy / (R_UNIVERSAL * safe_temp)
    exponent = np.clip(exponent, -60.0, 0.0)  # Prevent underflow / overflow
    
    arrhenius_factor = np.exp(exponent)
    
    # Limiting Oxygen Index (LOI) flammability cutoff
    # Hydrocarbons quench when oxygen drops below the critical flammability threshold (~9-11% O2 vol, ~0.10 mass fraction)
    o2_limit = 0.09
    flammability_factor = np.clip((oxygen_field - o2_limit) / 0.05, 0.0, 1.0)
    
    # Effective mass fraction reaction rate
    raw_rate = pre_exponential * pressure_factor * np.maximum(0.0, fuel_field) * np.maximum(0.0, oxygen_field) * arrhenius_factor * flammability_factor
    
    # Zero out reaction in cold unignited zones below ignition temperature threshold (~580 K)
    raw_rate[temperature_field < 580.0] = 0.0
    
    return raw_rate
