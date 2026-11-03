"""
ZeroG Flames — Main FastAPI Backend Application.
Serves simulation API and static frontend web application.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from backend.app.api.simulation import router as simulation_router
from backend.app.api.presets import router as presets_router

app = FastAPI(
    title="ZeroG Flames API",
    description="Interactive Scientific Microgravity Combustion Simulator for NASA Space Apps Challenge",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulation_router, prefix="/api", tags=["Simulation"])
app.include_router(presets_router, prefix="/api", tags=["Presets & Data"])


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "ZeroG Flames Microgravity Combustion Engine",
        "version": "1.0.0"
    }


STATIC_DIR = Path(__file__).resolve().parent.parent.parent / "static"

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Serve static file if exists, otherwise fallback to index.html for SPA routing
        target_file = STATIC_DIR / full_path
        if full_path and target_file.is_file():
            return FileResponse(target_file)
        index_file = STATIC_DIR / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"message": "ZeroG Flames API is active. Static frontend not yet compiled."}
