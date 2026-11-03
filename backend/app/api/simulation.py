"""
API endpoints for running 2D microgravity combustion simulations, comparisons, sweeps, and extinction analysis.
"""
from fastapi import APIRouter, HTTPException
from typing import List

from backend.app.models.inputs import (
    SimulationRequest,
    CompareRequest,
    GravitySweepRequest,
    ExtinctionSweepRequest,
    VentilationSweepRequest,
)
from backend.app.models.outputs import (
    SimulationResponse,
    CompareResponse,
    GravitySweepResponse,
    GravitySweepDataPoint,
    ExtinctionSweepResponse,
    ExtinctionDataPoint,
    VentilationSweepResponse,
    VentilationDataPoint,
)
from backend.app.physics.solver import CombustionSolver

router = APIRouter()


@router.post("/simulate", response_model=SimulationResponse)
async def simulate(req: SimulationRequest):
    """
    Run 2D coupled microgravity combustion simulation.
    """
    try:
        solver = CombustionSolver(grid_size=req.grid_size)
        result = solver.run_simulation(
            gravity_g=req.gravity_g,
            oxygen_percent=req.oxygen_percent,
            pressure_kpa=req.pressure_kpa,
            airflow_ms=req.airflow_ms,
            fuel_key=req.fuel,
            ambient_temp_k=req.ambient_temperature_k,
            duration_s=req.duration_s,
            num_frames=15,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")


@router.post("/compare", response_model=CompareResponse)
async def compare_simulations(req: CompareRequest):
    """
    Run two conditions side-by-side to isolate physical variables (e.g. Earth vs Microgravity).
    """
    try:
        solver_a = CombustionSolver(grid_size=req.condition_a.grid_size)
        res_a = solver_a.run_simulation(
            gravity_g=req.condition_a.gravity_g,
            oxygen_percent=req.condition_a.oxygen_percent,
            pressure_kpa=req.condition_a.pressure_kpa,
            airflow_ms=req.condition_a.airflow_ms,
            fuel_key=req.condition_a.fuel,
            ambient_temp_k=req.condition_a.ambient_temperature_k,
            duration_s=req.condition_a.duration_s,
        )
        
        solver_b = CombustionSolver(grid_size=req.condition_b.grid_size)
        res_b = solver_b.run_simulation(
            gravity_g=req.condition_b.gravity_g,
            oxygen_percent=req.condition_b.oxygen_percent,
            pressure_kpa=req.condition_b.pressure_kpa,
            airflow_ms=req.condition_b.airflow_ms,
            fuel_key=req.condition_b.fuel,
            ambient_temp_k=req.condition_b.ambient_temperature_k,
            duration_s=req.condition_b.duration_s,
        )
        
        # Build comparative summary
        vel_a = res_a["metrics"]["max_velocity_ms"]
        vel_b = res_b["metrics"]["max_velocity_ms"]
        temp_a = res_a["metrics"]["peak_temperature_k"]
        temp_b = res_b["metrics"]["peak_temperature_k"]
        
        summary = (
            f"Condition A ({req.condition_a.gravity_g:.2f}g) exhibits peak flow velocity of {vel_a:.2f} m/s and peak temp of {temp_a:.1f} K. "
            f"Condition B ({req.condition_b.gravity_g:.4f}g) exhibits peak velocity of {vel_b:.2f} m/s and peak temp of {temp_b:.1f} K. "
            "Reducing gravity removes the buoyancy-driven natural convection column, shifting oxygen delivery to pure molecular diffusion or forced airflow."
        )
        
        return {
            "condition_a": res_a,
            "condition_b": res_b,
            "comparison_summary": summary,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison error: {str(e)}")


@router.post("/sweep", response_model=GravitySweepResponse)
async def gravity_sweep(req: GravitySweepRequest):
    """
    Automated parameter sweep across gravitational accelerations.
    """
    try:
        points: List[GravitySweepDataPoint] = []
        solver = CombustionSolver(grid_size=40)  # Lightweight grid for fast multi-point sweep
        
        for g in (req.gravity_steps or [1.0, 0.75, 0.5, 0.38, 0.165, 0.1, 0.05, 0.01, 0.0001]):
            res = solver.run_simulation(
                gravity_g=g,
                oxygen_percent=req.oxygen_percent,
                pressure_kpa=req.pressure_kpa,
                airflow_ms=req.airflow_ms,
                fuel_key=req.fuel,
                duration_s=1.2,
                num_frames=1,
            )
            m = res["metrics"]
            points.append(
                GravitySweepDataPoint(
                    gravity_g=g,
                    gravity_ms2=round(g * 9.80665, 3),
                    peak_temperature_k=m["peak_temperature_k"],
                    total_reaction_rate=m["total_reaction_rate"],
                    max_velocity_ms=m["max_velocity_ms"],
                    buoyancy_strength_ms2=m["buoyancy_strength_ms2"],
                    flame_area_cm2=m["estimated_flame_area_cm2"],
                    status=m["flame_status"],
                    transport_regime=m["transport_regime"],
                )
            )
            
        summary = (
            "Gravity sweep illustrates that peak buoyant velocity scales with sqrt(g), "
            "causing buoyant convective transport to drop precipitously below 0.1 g. "
            "In near-zero gravity, flame area expands into a spherical diffusion envelope."
        )
        
        return GravitySweepResponse(points=points, sweep_summary=summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sweep error: {str(e)}")


@router.post("/extinction", response_model=ExtinctionSweepResponse)
async def extinction_sweep(req: ExtinctionSweepRequest):
    """
    Map the model-predicted extinction boundary across oxygen concentrations.
    """
    try:
        points: List[ExtinctionDataPoint] = []
        solver = CombustionSolver(grid_size=40)
        
        limiting_o2 = None
        for o2 in (req.oxygen_steps or [2.0, 5.0, 8.0, 10.0, 12.0, 15.0, 18.0, 21.0, 25.0, 30.0]):
            res = solver.run_simulation(
                gravity_g=req.gravity_g,
                oxygen_percent=o2,
                pressure_kpa=req.pressure_kpa,
                airflow_ms=req.airflow_ms,
                fuel_key=req.fuel,
                duration_s=1.0,
                num_frames=1,
            )
            m = res["metrics"]
            is_sustained = m["flame_status"] == "STABLE"
            
            if is_sustained and limiting_o2 is None:
                limiting_o2 = o2
                
            points.append(
                ExtinctionDataPoint(
                    oxygen_percent=o2,
                    peak_temperature_k=m["peak_temperature_k"],
                    total_reaction_rate=m["total_reaction_rate"],
                    status=m["flame_status"],
                    is_sustained=is_sustained,
                )
            )
            
        summary = (
            f"Under {req.gravity_g:.4f} g gravity, the model predicts self-sustaining combustion requires "
            f"an oxygen concentration >= {limiting_o2 or 'N/A'}% by volume. Below this threshold, chemical heat release "
            "is insufficient to overcome thermal radiation and conduction losses, resulting in flame extinguishment."
        )
        
        return ExtinctionSweepResponse(
            gravity_g=req.gravity_g,
            limiting_oxygen_index_percent=limiting_o2,
            extinction_boundary_summary=summary,
            points=points,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extinction sweep error: {str(e)}")


@router.post("/ventilation", response_model=VentilationSweepResponse)
async def ventilation_sweep(req: VentilationSweepRequest):
    """
    Evaluate microgravity flame behavior across forced cross-ventilation velocities.
    Demonstrates that forced airflow dominates transport when natural buoyancy vanishes.
    """
    try:
        points: List[VentilationDataPoint] = []
        solver = CombustionSolver(grid_size=40)
        
        steps = req.airflow_steps or [-1.0, -0.5, -0.2, 0.0, 0.2, 0.5, 1.0]
        for flow in steps:
            res = solver.run_simulation(
                gravity_g=req.gravity_g,
                oxygen_percent=req.oxygen_percent,
                pressure_kpa=req.pressure_kpa,
                airflow_ms=flow,
                fuel_key=req.fuel,
                duration_s=1.0,
                num_frames=1,
            )
            m = res["metrics"]
            points.append(
                VentilationDataPoint(
                    airflow_ms=flow,
                    peak_temperature_k=m["peak_temperature_k"],
                    total_reaction_rate=m["total_reaction_rate"],
                    max_velocity_ms=m["max_velocity_ms"],
                    flame_area_cm2=m["estimated_flame_area_cm2"],
                    transport_regime=m["transport_regime"],
                    status=m["flame_status"],
                )
            )
            
        summary = (
            f"Under microgravity ({req.gravity_g:.4f} g), natural buoyancy convection is absent. "
            "Imposing forced cross-ventilation generates directional species transport, "
            "stretching the reaction zone downstream into an asymmetric flame and modulating local oxygen replenishment."
        )
        
        return VentilationSweepResponse(
            gravity_g=req.gravity_g,
            points=points,
            ventilation_summary=summary,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ventilation sweep error: {str(e)}")

