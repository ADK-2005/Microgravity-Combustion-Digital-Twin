"""
API endpoints for environment presets, fuel databases, and model metadata.
"""
from fastapi import APIRouter
from pathlib import Path
import json

router = APIRouter()

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

with open(DATA_DIR / "environments.json", "r", encoding="utf-8") as f:
    ENVIRONMENTS_DB = json.load(f)

with open(DATA_DIR / "fuels.json", "r", encoding="utf-8") as f:
    FUELS_DB = json.load(f)


@router.get("/presets")
async def get_presets():
    """Retrieve pre-configured planetary and mission environment presets."""
    return ENVIRONMENTS_DB


@router.get("/fuels")
async def get_fuels():
    """Retrieve database of gaseous fuels and kinetic parameters."""
    return FUELS_DB


@router.get("/metadata")
async def get_metadata():
    """Retrieve model constants, assumptions, and version information."""
    return {
        "model_name": "ZeroG Reduced-Order Combustion Model",
        "version": "1.0.0",
        "architecture": "FastAPI + NumPy 2D Advection-Diffusion-Reaction + Boussinesq Buoyancy Approximation",
        "assumptions": [
            "2D Cartesian domain with simplified boundary conditions",
            "Single-step global Arrhenius kinetics (Fuel + s O2 -> Products + Heat)",
            "Boussinesq-inspired buoyancy acceleration coupled with lateral continuity entrainment",
            "Linear thermal and species diffusion with temperature-scaled conductivities",
            "Optically thin radiative cooling and ambient convective heat dissipation",
            "Reduced-order representation designed for interactive exploration rather than full 3D CFD certification"
        ],
        "citations": [
            "NASA ACME (Advanced Combustion via Microgravity Experiments) Project Overview",
            "NASA FLEX (Flame Extinguishment Experiment) - Spacecraft Fire Safety Research",
            "Williams, F. A., Combustion Theory, 2nd Edition",
            "Glassman, I. & Yetter, R. A., Combustion, 4th Edition"
        ]
    }
