"""
Unit tests for species and thermal diffusion behavior.
Verifies that diffusion smooths gradients and conserves mass bounds.
"""
import numpy as np
from backend.app.physics.grid import SimulationGrid
from backend.app.physics.oxygen import solve_oxygen_transport
from backend.app.physics.fuel import solve_fuel_transport
from backend.app.physics.heat import solve_heat_transport


def test_oxygen_diffusion_smooths_gradient():
    grid = SimulationGrid(nx=32, ny=32)
    o2 = np.full((32, 32), 0.23)
    o2[14:18, 14:18] = 0.05
    initial_peak_diff = np.max(o2) - np.min(o2)
    
    u = np.zeros_like(o2)
    v = np.zeros_like(o2)
    reaction = np.zeros_like(o2)
    
    o2_next = o2.copy()
    for _ in range(30):
        o2_next = solve_oxygen_transport(
            o2_field=o2_next,
            u_field=u,
            v_field=v,
            reaction_rate=reaction,
            stoich_ratio=4.0,
            diffusivity=2.0e-5,
            ambient_o2_frac=0.23,
            dt=0.001,
            grid=grid,
        )
    
    final_peak_diff = np.max(o2_next[10:22, 10:22]) - np.min(o2_next[10:22, 10:22])
    assert final_peak_diff < initial_peak_diff
    assert np.all(o2_next >= 0.0)
    assert np.all(o2_next <= 1.0)
    assert not np.isnan(o2_next).any()


def test_thermal_conduction_cools_hotspot():
    grid = SimulationGrid(nx=32, ny=32)
    temp = np.full((32, 32), 300.0)
    temp[14:18, 14:18] = 1800.0
    
    u = np.zeros_like(temp)
    v = np.zeros_like(temp)
    reaction = np.zeros_like(temp)
    
    temp_next = temp.copy()
    for _ in range(50):
        temp_next = solve_heat_transport(
            temp_field=temp_next,
            u_field=u,
            v_field=v,
            reaction_rate=reaction,
            heat_of_combustion=50e6,
            thermal_diffusivity=2.2e-5,
            ambient_temp_k=300.0,
            pressure_kpa=101.325,
            dt=0.001,
            grid=grid,
        )
        
    assert np.max(temp_next) < 1800.0
    assert np.min(temp_next) >= 300.0
    assert not np.isnan(temp_next).any()
