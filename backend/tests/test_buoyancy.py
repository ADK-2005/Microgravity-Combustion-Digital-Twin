"""
Unit tests for buoyancy scaling, gravity dependence, and forced airflow superposition.
"""
import numpy as np
from backend.app.physics.grid import SimulationGrid
from backend.app.physics.buoyancy import compute_buoyancy_velocity_field


def test_buoyancy_zero_at_zero_gravity():
    grid = SimulationGrid(nx=32, ny=32)
    temp = np.full((32, 32), 300.0)
    temp[10:20, 14:18] = 1600.0  
    
    u, v, b_strength = compute_buoyancy_velocity_field(
        temperature_field=temp,
        grid=grid,
        gravity_g=0.0,
        ambient_temp_k=300.0,
        forced_airflow_ms=0.0,
    )
    
    assert b_strength == 0.0
    assert np.allclose(v, 0.0)
    assert np.allclose(u, 0.0)


def test_buoyancy_monotonic_with_gravity():
    grid = SimulationGrid(nx=32, ny=32)
    temp = np.full((32, 32), 300.0)
    temp[10:20, 14:18] = 1600.0
    
    _, v_moon, b_moon = compute_buoyancy_velocity_field(temp, grid, gravity_g=0.165, ambient_temp_k=300.0)
    _, v_mars, b_mars = compute_buoyancy_velocity_field(temp, grid, gravity_g=0.38, ambient_temp_k=300.0)
    _, v_earth, b_earth = compute_buoyancy_velocity_field(temp, grid, gravity_g=1.0, ambient_temp_k=300.0)
    
    assert b_moon < b_mars < b_earth
    assert np.max(v_moon) < np.max(v_mars) < np.max(v_earth)


def test_forced_airflow_remains_active_at_zero_gravity():
    grid = SimulationGrid(nx=32, ny=32)
    temp = np.full((32, 32), 300.0)
    temp[10:20, 14:18] = 1600.0
    
    u, v, b_strength = compute_buoyancy_velocity_field(
        temperature_field=temp,
        grid=grid,
        gravity_g=0.0,
        ambient_temp_k=300.0,
        forced_airflow_ms=0.5,
    )
    
    assert b_strength == 0.0
    assert np.allclose(v, 0.0)
    assert np.allclose(u, 0.5)
