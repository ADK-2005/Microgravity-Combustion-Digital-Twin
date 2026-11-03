"""
ZeroG Flames coupled 2D advection-diffusion-reaction combustion solver.
"""
from typing import Dict, Any, List, Optional
import numpy as np
import json
from pathlib import Path

from .grid import SimulationGrid
from .buoyancy import compute_buoyancy_velocity_field
from .oxygen import solve_oxygen_transport
from .fuel import solve_fuel_transport
from .heat import solve_heat_transport
from .reaction import compute_reaction_rate
from .metrics import compute_simulation_metrics, SimulationMetrics


# Load default fuel data
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
with open(DATA_DIR / "fuels.json", "r", encoding="utf-8") as f:
    FUELS_DB = json.load(f)


class CombustionSolver:
    def __init__(
        self,
        grid_size: int = 64,
        lx: float = 0.08,
        ly: float = 0.08,
    ):
        self.grid = SimulationGrid(nx=grid_size, ny=grid_size, lx=lx, ly=ly)
        
    def run_simulation(
        self,
        gravity_g: float = 1.0,
        oxygen_percent: float = 20.95,
        pressure_kpa: float = 101.325,
        airflow_ms: float = 0.0,
        fuel_key: str = "methane",
        ambient_temp_k: float = 293.15,
        duration_s: float = 2.5,
        num_frames: int = 15,
        custom_dt: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Run the 2D microgravity combustion simulation and return fields, metrics, and frames.
        """
        fuel_info = FUELS_DB.get(fuel_key, FUELS_DB["methane"])
        heat_of_combustion = fuel_info["heat_of_combustion_j_kg"]
        stoich_ratio = fuel_info["stoich_o2_ratio"]
        activation_energy = fuel_info["activation_energy_j_mol"]
        pre_exponential = fuel_info["pre_exponential"]
        diffusivity_fuel = fuel_info["diffusion_coeff"]
        
        # Oxygen diffusivity and thermal diffusivity
        diffusivity_o2 = 2.1e-5 * (101.325 / max(10.0, pressure_kpa))
        thermal_diffusivity = 2.2e-5 * (101.325 / max(10.0, pressure_kpa))
        
        # Convert volume/mole % to mass fraction approximation
        # Dry air is ~21% O2 vol -> ~0.232 mass fraction
        ambient_o2_mass_frac = np.clip((oxygen_percent / 100.0) * (32.0 / 28.8), 0.0, 1.0)
        
        # Stability: adaptive dt based on CFL and diffusion limits
        dx = self.grid.dx
        max_expected_vel = max(0.5, abs(airflow_ms) + 1.5 * np.sqrt(max(0.01, gravity_g)))
        cfl_dt = 0.35 * dx / max_expected_vel
        diff_dt = 0.20 * (dx * dx) / max(diffusivity_o2, thermal_diffusivity, diffusivity_fuel)
        
        dt = custom_dt or min(0.0015, cfl_dt, diff_dt)
        total_steps = max(20, int(duration_s / dt))
        frame_interval = max(1, total_steps // num_frames)
        
        # 1. Initialize Fields
        temp_field = np.full((self.grid.ny, self.grid.nx), ambient_temp_k, dtype=np.float64)
        o2_field = np.full((self.grid.ny, self.grid.nx), ambient_o2_mass_frac, dtype=np.float64)
        fuel_field = np.zeros((self.grid.ny, self.grid.nx), dtype=np.float64)
        
        # Burner fuel presence
        fuel_field[self.grid.burner_mask] = 1.0
        
        # Ignition kernel: annular spark at the fuel-oxygen shear layer / mixing rim
        r_inner = self.grid.burner_radius_cells * self.grid.dx * 0.8
        r_outer = (self.grid.burner_radius_cells + 3) * self.grid.dx
        ign_mask = (self.grid.dist_from_burner >= r_inner) & (self.grid.dist_from_burner <= r_outer)
        temp_field[ign_mask] = np.maximum(temp_field[ign_mask], 1650.0)
        
        saved_frames: List[Dict[str, Any]] = []
        u_field = np.zeros_like(temp_field)
        v_field = np.zeros_like(temp_field)
        reaction_field = np.zeros_like(temp_field)
        buoyancy_strength = 0.0
        
        # Time-stepping integration loop
        for step in range(total_steps):
            current_time = step * dt
            
            # Step 1: Compute Buoyancy & Flow Field
            u_field, v_field, buoyancy_strength = compute_buoyancy_velocity_field(
                temperature_field=temp_field,
                grid=self.grid,
                gravity_g=gravity_g,
                ambient_temp_k=ambient_temp_k,
                forced_airflow_ms=airflow_ms,
            )
            
            # Step 2: Compute Reaction Rate with species availability limiter
            raw_reaction = compute_reaction_rate(
                fuel_field=fuel_field,
                oxygen_field=o2_field,
                temperature_field=temp_field,
                pre_exponential=pre_exponential,
                activation_energy=activation_energy,
                pressure_kpa=pressure_kpa,
            )
            # Cannot consume more fuel or oxygen than physically available in current timestep
            max_reaction_fuel = fuel_field / (dt * 1.5)
            max_reaction_o2 = o2_field / (stoich_ratio * dt * 1.5)
            reaction_field = np.minimum(raw_reaction, np.minimum(max_reaction_fuel, max_reaction_o2))
            
            # Step 3: Advance Oxygen Transport
            o2_field = solve_oxygen_transport(
                o2_field=o2_field,
                u_field=u_field,
                v_field=v_field,
                reaction_rate=reaction_field,
                stoich_ratio=stoich_ratio,
                diffusivity=diffusivity_o2,
                ambient_o2_frac=ambient_o2_mass_frac,
                dt=dt,
                grid=self.grid,
            )
            
            # Step 4: Advance Fuel Transport
            fuel_field = solve_fuel_transport(
                fuel_field=fuel_field,
                u_field=u_field,
                v_field=v_field,
                reaction_rate=reaction_field,
                diffusivity=diffusivity_fuel,
                dt=dt,
                grid=self.grid,
            )
            
            # Step 5: Advance Heat Transport
            temp_field = solve_heat_transport(
                temp_field=temp_field,
                u_field=u_field,
                v_field=v_field,
                reaction_rate=reaction_field,
                heat_of_combustion=heat_of_combustion,
                thermal_diffusivity=thermal_diffusivity,
                ambient_temp_k=ambient_temp_k,
                pressure_kpa=pressure_kpa,
                dt=dt,
                grid=self.grid,
            )
            
            # Store timeline frames periodically for scrubbing
            if step % frame_interval == 0 or step == total_steps - 1:
                frame_metrics = compute_simulation_metrics(
                    temp_field=temp_field,
                    o2_field=o2_field,
                    fuel_field=fuel_field,
                    reaction_field=reaction_field,
                    u_field=u_field,
                    v_field=v_field,
                    buoyancy_strength=buoyancy_strength,
                    grid=self.grid,
                    gravity_g=gravity_g,
                    forced_airflow_ms=airflow_ms,
                    stoich_ratio=stoich_ratio,
                    simulation_step=step,
                    total_steps=total_steps,
                )
                saved_frames.append({
                    "time_s": round(current_time, 3),
                    "step": step,
                    "peak_temperature_k": frame_metrics.peak_temperature_k,
                    "total_reaction_rate": frame_metrics.total_reaction_rate,
                    "max_velocity_ms": frame_metrics.max_velocity_ms,
                    "flame_status": frame_metrics.flame_status,
                    # Downsampled or full fields for keyframes
                    "temperature": np.round(temp_field, 1).tolist(),
                    "oxygen": np.round(o2_field, 4).tolist(),
                    "reaction": np.round(reaction_field, 4).tolist(),
                })
        
        # Final summary metrics
        final_metrics = compute_simulation_metrics(
            temp_field=temp_field,
            o2_field=o2_field,
            fuel_field=fuel_field,
            reaction_field=reaction_field,
            u_field=u_field,
            v_field=v_field,
            buoyancy_strength=buoyancy_strength,
            grid=self.grid,
            gravity_g=gravity_g,
            forced_airflow_ms=airflow_ms,
            stoich_ratio=stoich_ratio,
            simulation_step=total_steps,
            total_steps=total_steps,
        )
        
        return {
            "metadata": {
                "model": "ZeroG Reduced-Order Combustion Model v1.0.0",
                "grid_size": [self.grid.nx, self.grid.ny],
                "domain_size_m": [self.grid.lx, self.grid.ly],
                "simulation_time_s": duration_s,
                "dt_s": round(dt, 6),
                "total_timesteps": total_steps,
                "fuel": fuel_info["name"],
                "gravity_g": gravity_g,
                "oxygen_percent": oxygen_percent,
                "pressure_kpa": pressure_kpa,
                "airflow_ms": airflow_ms,
            },
            "metrics": {
                "peak_temperature_k": final_metrics.peak_temperature_k,
                "mean_temperature_k": final_metrics.mean_temperature_k,
                "max_reaction_rate": final_metrics.max_reaction_rate,
                "total_reaction_rate": final_metrics.total_reaction_rate,
                "oxygen_consumption_rate": final_metrics.oxygen_consumption_rate,
                "estimated_flame_area_cm2": final_metrics.estimated_flame_area_cm2,
                "max_velocity_ms": final_metrics.max_velocity_ms,
                "buoyancy_strength_ms2": final_metrics.buoyancy_strength_ms2,
                "flame_status": final_metrics.flame_status,
                "transport_regime": final_metrics.transport_regime,
                "scientific_summary": final_metrics.scientific_summary,
            },
            "fields": {
                "temperature": np.round(temp_field, 1).tolist(),
                "oxygen": np.round(o2_field, 4).tolist(),
                "fuel": np.round(fuel_field, 4).tolist(),
                "reaction": np.round(reaction_field, 4).tolist(),
                "velocity_u": np.round(u_field, 3).tolist(),
                "velocity_v": np.round(v_field, 3).tolist(),
            },
            "frames": saved_frames,
        }
