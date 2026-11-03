"""
API endpoint tests for ZeroG Flames backend.
"""
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_api_presets():
    response = client.get("/api/presets")
    assert response.status_code == 200
    data = response.json()
    assert "earth" in data
    assert "microgravity" in data


def test_api_fuels():
    response = client.get("/api/fuels")
    assert response.status_code == 200
    data = response.json()
    assert "methane" in data


def test_api_simulate():
    payload = {
        "gravity_g": 1.0,
        "oxygen_percent": 21.0,
        "pressure_kpa": 101.325,
        "airflow_ms": 0.0,
        "fuel": "methane",
        "duration_s": 0.5,
        "grid_size": 32,
    }
    response = client.post("/api/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "metrics" in data
    assert "fields" in data
    assert "temperature" in data["fields"]
    assert "oxygen" in data["fields"]
    assert "reaction" in data["fields"]
    assert "velocity_u" in data["fields"]
    assert "velocity_v" in data["fields"]


def test_api_invalid_input_rejected():
    payload = {
        "gravity_g": 1.0,
        "oxygen_percent": 21.0,
        "pressure_kpa": -50.0,
        "fuel": "methane",
    }
    response = client.post("/api/simulate", json=payload)
    assert response.status_code == 422  # Unprocessable Entity


def test_api_metadata():
    response = client.get("/api/metadata")
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert "assumptions" in data
    assert "citations" in data


def test_api_compare():
    payload = {
        "condition_a": {
            "gravity_g": 1.0,
            "oxygen_percent": 21.0,
            "fuel": "methane",
            "duration_s": 0.3,
            "grid_size": 32,
        },
        "condition_b": {
            "gravity_g": 0.0001,
            "oxygen_percent": 21.0,
            "fuel": "methane",
            "duration_s": 0.3,
            "grid_size": 32,
        }
    }
    response = client.post("/api/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "condition_a" in data
    assert "condition_b" in data
    assert "comparison_summary" in data
    assert data["condition_a"]["metrics"]["buoyancy_strength_ms2"] > data["condition_b"]["metrics"]["buoyancy_strength_ms2"]


def test_api_sweep():
    payload = {
        "gravity_steps": [1.0, 0.5, 0.0001],
        "oxygen_percent": 21.0,
        "fuel": "methane",
    }
    response = client.post("/api/sweep", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "points" in data
    assert len(data["points"]) == 3
    assert "sweep_summary" in data


def test_api_extinction():
    payload = {
        "gravity_g": 0.0001,
        "oxygen_steps": [2.0, 10.0, 21.0],
        "fuel": "methane",
    }
    response = client.post("/api/extinction", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "points" in data
    assert len(data["points"]) == 3
    assert "extinction_boundary_summary" in data


def test_api_static_assets_and_spa():
    res_root = client.get("/")
    assert res_root.status_code == 200
    assert "ZeroG FLAMES" in res_root.text

    res_css = client.get("/static/css/styles.css")
    assert res_css.status_code == 200

    res_js = client.get("/static/js/app.js")
    assert res_js.status_code == 200

    res_logo = client.get("/static/assets/zerog-team-logo.jpg")
    assert res_logo.status_code == 200


def test_api_ventilation():
    payload = {
        "gravity_g": 0.0001,
        "airflow_steps": [-0.5, 0.0, 0.5],
        "fuel": "methane",
    }
    response = client.post("/api/ventilation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "points" in data
    assert len(data["points"]) == 3
    assert "ventilation_summary" in data


