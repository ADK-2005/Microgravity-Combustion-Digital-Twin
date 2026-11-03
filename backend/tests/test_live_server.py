"""
Live server and asset integration test.
"""
import urllib.request
import json

def test_live():
    endpoints = [
        ('GET', 'http://127.0.0.1:8000/', 'HTML Root SPA'),
        ('GET', 'http://127.0.0.1:8000/static/assets/zerog-team-logo.jpg', 'ZeroG Team Logo Asset'),
        ('GET', 'http://127.0.0.1:8000/static/assets/nasa-space-apps-logo.svg', 'NASA Space Apps Challenge Logo Asset'),
        ('GET', 'http://127.0.0.1:8000/api/health', 'API Health'),
        ('GET', 'http://127.0.0.1:8000/api/presets', 'Presets Database'),
        ('GET', 'http://127.0.0.1:8000/api/fuels', 'Fuels Database'),
    ]

    for method, url, name in endpoints:
        req = urllib.request.Request(url, method=method)
        with urllib.request.urlopen(req) as resp:
            content = resp.read()
            assert resp.status == 200
            print(f"[PASS] {name}: {resp.status} OK ({len(content)} bytes)")

    sim_payload = json.dumps({'gravity_g': 1.0, 'oxygen_percent': 21.0, 'fuel': 'methane'}).encode('utf-8')
    sim_req = urllib.request.Request(
        'http://127.0.0.1:8000/api/simulate',
        data=sim_payload,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(sim_req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        assert resp.status == 200
        print(f"[PASS] POST /api/simulate: Peak Temp = {data['metrics']['peak_temperature_k']} K, Status = {data['metrics']['flame_status']}, Frames = {len(data['frames'])}")

    comp_payload = json.dumps({
        'condition_a': {'gravity_g': 1.0},
        'condition_b': {'gravity_g': 0.0001}
    }).encode('utf-8')
    comp_req = urllib.request.Request(
        'http://127.0.0.1:8000/api/compare',
        data=comp_payload,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(comp_req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        assert resp.status == 200
        print(f"[PASS] POST /api/compare: Earth vs Micro-g comparison successful")

    sweep_payload = json.dumps({'fuel': 'methane'}).encode('utf-8')
    sweep_req = urllib.request.Request(
        'http://127.0.0.1:8000/api/sweep',
        data=sweep_payload,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(sweep_req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        assert resp.status == 200
        print(f"[PASS] POST /api/sweep: {len(data['points'])} gravity points evaluated")

    ext_payload = json.dumps({'gravity_g': 0.0001, 'fuel': 'methane'}).encode('utf-8')
    ext_req = urllib.request.Request(
        'http://127.0.0.1:8000/api/extinction',
        data=ext_payload,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(ext_req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        assert resp.status == 200
        print(f"[PASS] POST /api/extinction: LOI mapped = {data['limiting_oxygen_index_percent']}% O2")

    vent_payload = json.dumps({'gravity_g': 0.0001, 'airflow_steps': [-0.5, 0.0, 0.5], 'fuel': 'methane'}).encode('utf-8')
    vent_req = urllib.request.Request(
        'http://127.0.0.1:8000/api/ventilation',
        data=vent_payload,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(vent_req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        assert resp.status == 200
        print(f"[PASS] POST /api/ventilation: {len(data['points'])} airflow points evaluated")

if __name__ == '__main__':
    test_live()

