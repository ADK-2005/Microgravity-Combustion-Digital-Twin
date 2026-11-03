"""
Test runner script for ZeroG Flames physics tests.
"""
import sys
import traceback
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.tests.test_diffusion import test_oxygen_diffusion_smooths_gradient, test_thermal_conduction_cools_hotspot
from backend.tests.test_buoyancy import test_buoyancy_zero_at_zero_gravity, test_buoyancy_monotonic_with_gravity, test_forced_airflow_remains_active_at_zero_gravity
from backend.tests.test_reaction import test_no_oxygen_yields_zero_reaction, test_no_fuel_yields_zero_reaction, test_cold_temperature_prevents_reaction, test_reaction_rate_scales_with_temperature
from backend.tests.test_solver import (
    test_solver_earth_vs_zerog_case,
    test_solver_extinction_low_oxygen,
    test_solver_all_fuels,
    test_solver_bidirectional_forced_airflow,
    test_solver_pressure_variations,
    test_solver_bounds_and_conservation,
)
from backend.tests.test_api import (
    test_api_health,
    test_api_presets,
    test_api_fuels,
    test_api_simulate,
    test_api_invalid_input_rejected,
    test_api_metadata,
    test_api_compare,
    test_api_sweep,
    test_api_extinction,
    test_api_ventilation,
    test_api_static_assets_and_spa,
)

def run_tests():
    tests = [
        ("Diffusion: Oxygen Gradient Smoothing", test_oxygen_diffusion_smooths_gradient),
        ("Diffusion: Thermal Conduction Cooling", test_thermal_conduction_cools_hotspot),
        ("Buoyancy: Zero at 0g", test_buoyancy_zero_at_zero_gravity),
        ("Buoyancy: Monotonic Scaling with Gravity", test_buoyancy_monotonic_with_gravity),
        ("Buoyancy: Forced Airflow Active at 0g", test_forced_airflow_remains_active_at_zero_gravity),
        ("Reaction: Zero without Oxygen", test_no_oxygen_yields_zero_reaction),
        ("Reaction: Zero without Fuel", test_no_fuel_yields_zero_reaction),
        ("Reaction: Suppressed at Cold Temp", test_cold_temperature_prevents_reaction),
        ("Reaction: Arrhenius Temperature Scaling", test_reaction_rate_scales_with_temperature),
        ("Coupled Solver: Earth vs Microgravity Case", test_solver_earth_vs_zerog_case),
        ("Coupled Solver: Extinction at Subcritical O2", test_solver_extinction_low_oxygen),
        ("Coupled Solver: All Reactant Fuels Support", test_solver_all_fuels),
        ("Coupled Solver: Bidirectional Forced Cross-Flow", test_solver_bidirectional_forced_airflow),
        ("Coupled Solver: Low & High Pressure Variations", test_solver_pressure_variations),
        ("Coupled Solver: Physical Bounds & Conservation", test_solver_bounds_and_conservation),
        ("API: Health Endpoint", test_api_health),
        ("API: Presets Endpoint", test_api_presets),
        ("API: Fuels Database", test_api_fuels),
        ("API: Metadata & Citations", test_api_metadata),
        ("API: Simulation Execution", test_api_simulate),
        ("API: Comparison Execution (1g vs 0g)", test_api_compare),
        ("API: Gravity Parameter Sweep", test_api_sweep),
        ("API: Extinction Mapping Sweep", test_api_extinction),
        ("API: Microgravity Ventilation Sweep", test_api_ventilation),
        ("API: Input Schema Rejection", test_api_invalid_input_rejected),
        ("API: Static Assets & SPA Fallback Serving", test_api_static_assets_and_spa),
    ]

    
    passed = 0
    failed = 0
    print("==================================================")
    print(">> ZERO-G FLAMES: PHYSICS SANITY & UNIT TESTS")
    print("==================================================")
    for name, fn in tests:
        try:
            fn()
            print(f" [PASS] {name}")
            passed += 1
        except Exception as e:
            print(f" [FAIL] {name}: {e}")
            traceback.print_exc()
            failed += 1
            
    print("==================================================")
    print(f"Summary: {passed} passed, {failed} failed out of {len(tests)} tests.")
    print("==================================================")
    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
