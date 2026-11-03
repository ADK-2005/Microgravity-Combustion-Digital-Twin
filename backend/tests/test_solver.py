"""
Full integration tests for the coupled ZeroG combustion solver.
"""
import numpy as np
from backend.app.physics.solver import CombustionSolver


def test_solver_earth_vs_zerog_case():
    solver = CombustionSolver(grid_size=32)
    
    res_earth = solver.run_simulation(
        gravity_g=1.0,
        oxygen_percent=21.0,
        pressure_kpa=101.325,
        airflow_ms=0.0,
        fuel_key="methane",
        duration_s=0.5,
        num_frames=5,
    )
    
    res_zerog = solver.run_simulation(
        gravity_g=0.0001,
        oxygen_percent=21.0,
        pressure_kpa=101.325,
        airflow_ms=0.0,
        fuel_key="methane",
        duration_s=0.5,
        num_frames=5,
    )
    
    temp_earth = np.array(res_earth["fields"]["temperature"])
    temp_zerog = np.array(res_zerog["fields"]["temperature"])
    assert not np.isnan(temp_earth).any()
    assert not np.isnan(temp_zerog).any()
    
    assert res_earth["metrics"]["max_velocity_ms"] > res_zerog["metrics"]["max_velocity_ms"]
    assert res_earth["metrics"]["buoyancy_strength_ms2"] > res_zerog["metrics"]["buoyancy_strength_ms2"]
    
    assert len(res_earth["frames"]) > 0
    assert len(res_zerog["frames"]) > 0


def test_solver_extinction_low_oxygen():
    solver = CombustionSolver(grid_size=32)
    
    res_quench = solver.run_simulation(
        gravity_g=1.0,
        oxygen_percent=2.0,
        pressure_kpa=101.325,
        airflow_ms=0.0,
        fuel_key="methane",
        duration_s=0.5,
    )
    
    assert res_quench["metrics"]["flame_status"] in ["EXTINGUISHED", "WEAKENING"]


def test_solver_all_fuels():
    solver = CombustionSolver(grid_size=32)
    for fuel_key in ["methane", "hydrocarbon", "ethanol_vapor"]:
        res = solver.run_simulation(fuel_key=fuel_key, duration_s=0.3, num_frames=2)
        temp = np.array(res["fields"]["temperature"])
        assert not np.isnan(temp).any(), f"NaN detected for fuel {fuel_key}"
        assert res["metadata"]["fuel"] is not None
        assert res["metrics"]["peak_temperature_k"] > 300.0


def test_solver_bidirectional_forced_airflow():
    solver = CombustionSolver(grid_size=32)
    res_pos = solver.run_simulation(airflow_ms=0.5, duration_s=0.3)
    res_neg = solver.run_simulation(airflow_ms=-0.5, duration_s=0.3)
    
    u_pos = np.array(res_pos["fields"]["velocity_u"])
    u_neg = np.array(res_neg["fields"]["velocity_u"])
    
    assert not np.isnan(u_pos).any()
    assert not np.isnan(u_neg).any()
    assert np.mean(u_pos) > 0.0
    assert np.mean(u_neg) < 0.0


def test_solver_pressure_variations():
    solver = CombustionSolver(grid_size=32)
    res_low_p = solver.run_simulation(pressure_kpa=56.0, oxygen_percent=34.0, duration_s=0.3)
    res_norm_p = solver.run_simulation(pressure_kpa=101.325, oxygen_percent=21.0, duration_s=0.3)
    
    assert not np.isnan(np.array(res_low_p["fields"]["temperature"])).any()
    assert not np.isnan(np.array(res_norm_p["fields"]["temperature"])).any()
    assert res_low_p["metrics"]["flame_status"] in ["STABLE", "IGNITING", "WEAKENING"]


def test_solver_bounds_and_conservation():
    solver = CombustionSolver(grid_size=32)
    res = solver.run_simulation(gravity_g=0.5, oxygen_percent=25.0, duration_s=0.4)
    
    temp = np.array(res["fields"]["temperature"])
    o2 = np.array(res["fields"]["oxygen"])
    fuel = np.array(res["fields"]["fuel"])
    reaction = np.array(res["fields"]["reaction"])
    
    assert np.all(temp >= 290.0)
    assert np.all(temp <= 2400.0)
    assert np.all(o2 >= 0.0) and np.all(o2 <= 1.0)
    assert np.all(fuel >= 0.0) and np.all(fuel <= 1.0)
    assert np.all(reaction >= 0.0)

