"""
Unit tests for Arrhenius kinetics and combustion conditions.
"""
import numpy as np
from backend.app.physics.reaction import compute_reaction_rate


def test_no_oxygen_yields_zero_reaction():
    fuel = np.full((10, 10), 0.5)
    o2 = np.zeros((10, 10))
    temp = np.full((10, 10), 1600.0)
    
    rate = compute_reaction_rate(fuel, o2, temp)
    assert np.all(rate == 0.0)


def test_no_fuel_yields_zero_reaction():
    fuel = np.zeros((10, 10))
    o2 = np.full((10, 10), 0.23)
    temp = np.full((10, 10), 1600.0)
    
    rate = compute_reaction_rate(fuel, o2, temp)
    assert np.all(rate == 0.0)


def test_cold_temperature_prevents_reaction():
    fuel = np.full((10, 10), 0.5)
    o2 = np.full((10, 10), 0.23)
    temp = np.full((10, 10), 295.0)  # Room temperature without ignition
    
    rate = compute_reaction_rate(fuel, o2, temp)
    assert np.all(rate == 0.0)


def test_reaction_rate_scales_with_temperature():
    fuel = np.full((10, 10), 0.5)
    o2 = np.full((10, 10), 0.23)
    
    rate_1000k = compute_reaction_rate(fuel, o2, np.full((10, 10), 1000.0))
    rate_1600k = compute_reaction_rate(fuel, o2, np.full((10, 10), 1600.0))
    rate_2000k = compute_reaction_rate(fuel, o2, np.full((10, 10), 2000.0))
    
    assert np.max(rate_1000k) < np.max(rate_1600k) < np.max(rate_2000k)
