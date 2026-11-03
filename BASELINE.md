# ZeroG Flames — Antigravity Master Build Prompt

## Full-Stack Microgravity Combustion Simulator

You are an expert full-stack software engineer, scientific-computing developer, UI/UX designer, and computational-physics engineer.

Your task is to design and build a polished, functional web application called:

# ZeroG Flames

ZeroG Flames is an interactive scientific visualization and educational simulation exploring how reduced gravity affects combustion, especially through changes in buoyancy, convection, oxygen transport, heat transfer, flame behavior, and extinction.

This project is intended for a NASA Space Apps Challenge project.

The application must prioritize:

1. Scientific credibility
2. Interactive visualization
3. Clear educational storytelling
4. Excellent UI/UX
5. A working simulation rather than a purely decorative animation
6. Clear distinction between calculated quantities, qualitative visualization, and experimental observations
7. Spacecraft fire-safety relevance

Do **not** create only a landing page with an animated flame.

The centerpiece must be an interactive scientific laboratory backed by a simplified numerical model.

---

## 1. Core Project Question

The project investigates:

> **How does reduced gravity affect oxygen transport and combustion, and what could this mean for spacecraft fire safety?**

The central scientific chain is:

```text
Gravity
→ Buoyancy
→ Natural convection
→ Oxygen / fuel / heat transport
→ Combustion
→ Flame behavior
→ Fire safety implications
```

On Earth, gravity produces buoyancy because hot combustion gases are less dense than cooler surrounding gases.

This generates natural convection.

Natural convection moves hot products away from the flame and transports surrounding oxygen toward the reaction region.

In microgravity, buoyancy-driven convection becomes very weak.

Transport becomes much more dependent on molecular diffusion and any externally imposed airflow.

Therefore, the application must **not** imply that gravity directly “pulls oxygen toward the flame.”

Instead communicate:

```text
Gravity
→ buoyancy
→ natural convection
→ altered species/heat transport
```

---

## 2. Scientific Positioning

This project is **not** intended to be a full CFD solver.

Do not claim that the application reproduces NASA experiments quantitatively unless actual validation data are added and a comparison supports that statement.

Describe the model as:

> **A reduced-order educational combustion model designed to visualize the transition between buoyancy-dominated and diffusion-dominated transport.**

The simulation should be physically motivated while remaining computationally inexpensive enough for an interactive web application.

Keep three categories clearly separated throughout the UI:

- Model prediction
- Qualitative visualization
- Published experimental observation

Never display invented scientific measurements as though they came from NASA.

Never hard-code fake extinction limits or fake NASA results.

---

## 3. Application Architecture

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- HTML Canvas initially
- Plotly.js or another lightweight scientific charting solution for graphs and heatmaps

Do not introduce Three.js unless there is a genuine need after the core 2D application works.

### Backend

- Python
- FastAPI
- Pydantic
- NumPy
- SciPy
- Numba optionally if simulation performance requires acceleration

### Database

Do not add a database for the initial MVP.

Use local JSON files for:

- Fuel properties
- Environment presets
- Explanatory content
- Model constants where appropriate

Design the code so persistent experiment storage could later be added using PostgreSQL/Supabase, but do not make it a dependency for the MVP.

---

## 4. Repository Structure

Create a clean monorepo:

```text
zerog-flames/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── GravitySlider.tsx
│   │   │   ├── OxygenSlider.tsx
│   │   │   ├── PressureControl.tsx
│   │   │   ├── AirflowControl.tsx
│   │   │   ├── FuelSelector.tsx
│   │   │   ├── FlameViewer.tsx
│   │   │   ├── FieldViewer.tsx
│   │   │   ├── VelocityField.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   ├── ComparisonChart.tsx
│   │   │   ├── SimulationControls.tsx
│   │   │   └── ExperimentExplanation.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Laboratory.tsx
│   │   │   ├── Compare.tsx
│   │   │   ├── Science.tsx
│   │   │   └── Safety.tsx
│   │   ├── services/
│   │   │   └── simulationAPI.ts
│   │   ├── types/
│   │   │   └── simulation.ts
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── simulation.py
│   │   │   └── presets.py
│   │   ├── physics/
│   │   │   ├── grid.py
│   │   │   ├── oxygen.py
│   │   │   ├── fuel.py
│   │   │   ├── heat.py
│   │   │   ├── buoyancy.py
│   │   │   ├── reaction.py
│   │   │   ├── solver.py
│   │   │   └── metrics.py
│   │   ├── models/
│   │   │   ├── inputs.py
│   │   │   └── outputs.py
│   │   └── data/
│   │       ├── fuels.json
│   │       └── environments.json
│   ├── tests/
│   │   ├── test_diffusion.py
│   │   ├── test_buoyancy.py
│   │   ├── test_reaction.py
│   │   ├── test_solver.py
│   │   └── test_api.py
│   └── requirements.txt
└── README.md
```

Use modular, readable code.

Do not place the entire simulation inside one Python file.

---

## 5. Main User Experience

The application should contain five major sections/pages:

1. Home
2. Zero-G Laboratory
3. Compare
4. Science
5. Spacecraft Safety

The primary experience is the **Zero-G Laboratory**.

---

## 6. Home Page

Create a cinematic but professional landing page.

### Hero title

**ZERO-G FLAMES**

### Primary statement

> **Fire without gravity.**

### Supporting text

> Explore how gravity changes oxygen transport, heat transfer and combustion — from Earth to microgravity.

### Primary CTA

**ENTER THE ZERO-G LAB**

### Secondary CTA

**EXPLORE THE SCIENCE**

The visual design should communicate:

- Space
- Combustion
- Engineering
- NASA-inspired scientific visualization

Avoid making the interface look like a generic SaaS dashboard.

Use a dark space-oriented background with restrained blue/cyan/orange highlights.

Do not overload the screen with gradients, glassmorphism, or unnecessary animations.

The visual identity should feel like a mission-control/scientific instrument interface.

---

## 7. Zero-G Laboratory

This is the core page.

Create a layout approximately like:

- **Left:** Environmental controls
- **Center:** Combustion chamber / simulation visualization
- **Right:** Live metrics and scientific interpretation
- **Bottom:** Graphs / field selectors / timeline

The user should be able to modify:

- Gravity
- Oxygen concentration
- Pressure
- Airflow
- Fuel type
- Initial/ambient temperature where scientifically appropriate

The application should then run or update the numerical simulation.

---

## 8. Gravity Control

Gravity is the hero parameter.

Provide a continuous slider.

Represent gravity both as normalized Earth gravity and acceleration.

Example:

```text
1.00 g
9.81 m/s²
```

Provide environment presets:

| Preset | Gravity |
|---|---:|
| Earth | 1.00 g / 9.81 m/s² |
| Mars | ~0.38 g / 3.71 m/s² |
| Moon | ~0.165 g / 1.62 m/s² |
| Microgravity | Near-zero model value |

Clearly label the microgravity value as an approximation for visualization/modeling.

Do not claim that the ISS simply has “zero gravity.”

Explain that orbiting spacecraft experience microgravity and that forced ventilation can remain important even when natural buoyancy is greatly reduced.

---

## 9. Airflow Control

Airflow must be independent from gravity.

This is scientifically important.

Allow:

- No forced airflow
- Low airflow
- Moderate airflow

Or preferably a continuous velocity control with appropriate units.

This demonstrates that:

> **Microgravity ≠ no gas movement.**

Forced ventilation can transport oxygen and combustion products even when buoyancy is weak.

---

## 10. Oxygen Control

Provide an oxygen concentration control.

Default Earth-like value:

**Approximately 21% by volume for the UI preset.**

Use internally consistent units in the simulation.

Do not confuse volume fraction with mass fraction.

If the solver uses mass fraction, explicitly convert inputs or document the simplification.

The oxygen visualization should show spatial depletion around the reaction zone.

---

## 11. Pressure

Allow pressure to be modified.

Default:

**101.325 kPa**

If pressure is not yet fully coupled into every transport coefficient or reaction parameter, clearly label this limitation.

Never allow a UI control to imply a physical dependency that the backend does not actually calculate.

---

## 12. Fuel

For the initial scientifically controlled version, support:

- Methane
- Generic gaseous hydrocarbon

Optionally later:

- Ethanol vapor
- Generic hydrocarbon vapor

Do not simulate solid wood initially.

Solid fuels require pyrolysis, surface heat transfer, gasification and additional physics.

If wood is ever added, explicitly model it as a later advanced feature.

---

## 13. Computational Domain

Use a 2D rectangular computational domain.

Start with a grid around:

```text
64 × 64
```

or:

```text
96 × 96
```

Increase to `128 × 128` only if performance remains good.

Each cell should track fields such as:

- Temperature `T(x,y)`
- Oxygen concentration `Y_O2(x,y)`
- Fuel concentration `Y_F(x,y)`
- Reaction rate `ω(x,y)`
- Horizontal velocity `u(x,y)`
- Vertical velocity `v(x,y)`
- Optionally product concentration

Do not attempt unnecessary 3D CFD.

---

## 14. Oxygen Transport Model

Implement a simplified advection-diffusion-reaction equation:

$$
\frac{\partial Y_{O_2}}{\partial t}
+
\mathbf{u}\cdot\nabla Y_{O_2}
=
D_{O_2}\nabla^2Y_{O_2}
-
S_{O_2}
$$

Interpretation:

- **Advection:** gas flow transports oxygen.
- **Diffusion:** molecular diffusion redistributes oxygen.
- **Reaction:** combustion consumes oxygen.

Use stable finite-difference discretization.

Document the numerical method.

Respect timestep stability constraints.

Avoid NaNs, negative species concentrations and numerical blow-up.

Clamp numerical values only where physically/numerically justified and document it.

---

## 15. Fuel Transport

Use a corresponding equation:

$$
\frac{\partial Y_F}{\partial t}
+
\mathbf{u}\cdot\nabla Y_F
=
D_F\nabla^2Y_F
-
S_F
$$

Create a fuel source near the lower-central region of the computational chamber.

The exact source geometry should be configurable.

For example:

- Small circular gaseous fuel source
- Short burner inlet

Fuel should diffuse and/or advect into the domain.

---

## 16. Temperature Model

Use a simplified energy equation:

$$
\frac{\partial T}{\partial t}
+
\mathbf{u}\cdot\nabla T
=
\alpha\nabla^2T
+
\frac{Q\omega}{\rho c_p}
-
L
$$

Where:

- `α` = thermal diffusivity
- `Q` = effective heat release
- `ω` = reaction rate
- `ρ` = density approximation
- `cp` = heat capacity
- `L` = simplified heat-loss term

Heat should:

- Be generated in reacting cells
- Diffuse through the domain
- Be transported by flow
- Lose energy through a controlled simplified mechanism

Clearly document simplifications.

---

## 17. Combustion Reaction Model

Do not implement a detailed chemical mechanism for the MVP.

Use a simplified single-step global reaction:

```text
Fuel + Oxygen → Products + Heat
```

Use an Arrhenius-like rate:

$$
\omega =
A Y_F Y_{O_2}
\exp\left(-\frac{E_a}{RT}\right)
$$

Use safe numerical limits.

Prevent overflow/underflow.

The reaction should require:

- Fuel
- Oxygen
- Sufficient temperature

Do not allow spontaneous unrealistic combustion everywhere.

Implement an ignition region or ignition temperature.

---

## 18. Buoyancy Model

Gravity must enter the model through buoyancy.

Use a simplified Boussinesq-inspired relationship such as:

$$
F_b \propto g\beta(T-T_{ref})
$$

The exact implementation may be reduced-order rather than solving full Navier-Stokes.

The purpose is to generate a physically motivated velocity field that becomes stronger when:

- Temperature differences increase
- Gravity increases

As gravity approaches zero, the natural-convection component should approach zero.

Forced airflow must remain independently active.

The total approximate velocity field should therefore conceptually be:

$$
\mathbf{u}_{total}
=
\mathbf{u}_{forced}
+
\mathbf{u}_{buoyancy}
$$

This distinction is critical.

---

## 19. Do Not Fake CFD

Do not pretend the velocity field is a full Navier-Stokes CFD solution unless full fluid equations are actually implemented.

Call it:

> **Reduced-order flow field**

or:

> **Simplified buoyancy-driven velocity approximation**

The UI should include a **Model Assumptions** section.

---

## 20. Boundary Conditions

Implement sensible boundary conditions.

Possible starting model:

- **Oxygen:** ambient concentration at outer boundaries
- **Temperature:** ambient temperature or controlled heat-loss boundary
- **Fuel:** localized source near bottom center
- **Velocity:** appropriate simplified open or constrained boundaries

Document all choices.

Boundary conditions should be centralized in configuration rather than scattered throughout the solver.

---

## 21. Time Stepping

The simulation should advance through discrete timesteps.

Pipeline per timestep:

1. Calculate buoyancy contribution.
2. Add forced airflow.
3. Advect oxygen.
4. Diffuse oxygen.
5. Advect fuel.
6. Diffuse fuel.
7. Calculate reaction rate.
8. Consume fuel.
9. Consume oxygen.
10. Generate heat.
11. Advect heat.
12. Diffuse heat.
13. Apply heat losses.
14. Enforce valid numerical bounds.
15. Calculate diagnostic metrics.

Keep the timestep small enough for numerical stability.

Provide comments explaining the stability strategy.

---

## 22. Output Fields

Backend should return at least:

- `temperature_field`
- `oxygen_field`
- `fuel_field`
- `reaction_field`
- `velocity_u`
- `velocity_v`

And summary metrics such as:

- `peak_temperature`
- `mean_temperature`
- `maximum_reaction_rate`
- `total_reaction_rate`
- `oxygen_consumption`
- `estimated_flame_area`
- `maximum_velocity`
- `buoyancy_strength`
- `simulation_time`
- `flame_status`

Do not call a metric scientifically validated if it is merely a model-derived indicator.

---

## 23. Flame Status

Implement model-based states such as:

- `IGNITING`
- `STABLE`
- `WEAKENING`
- `EXTINGUISHED`

Determine these from reaction-rate behavior over time rather than arbitrary visual conditions.

Document the criteria.

Do not claim that the threshold equals a real spacecraft extinction limit unless validated against published experiments.

---

## 24. Backend API

Create:

```text
POST /api/simulate
```

Example request:

```json
{
  "gravity_g": 1.0,
  "oxygen_percent": 21.0,
  "pressure_kpa": 101.325,
  "airflow_ms": 0.0,
  "fuel": "methane",
  "ambient_temperature_k": 293.15,
  "duration_s": 5.0
}
```

Validate all inputs using Pydantic.

Reject physically nonsensical values gracefully.

Example response:

```json
{
  "metadata": {
    "model": "ZeroG Reduced-Order Combustion Model",
    "grid_size": [64, 64],
    "simulation_time_s": 5.0
  },
  "metrics": {
    "peak_temperature_k": 0,
    "oxygen_consumption": 0,
    "estimated_flame_area": 0,
    "max_velocity_ms": 0,
    "total_reaction_rate": 0,
    "status": "STABLE"
  },
  "fields": {
    "temperature": [],
    "oxygen": [],
    "fuel": [],
    "reaction": [],
    "velocity_u": [],
    "velocity_v": []
  }
}
```

Also add:

```text
GET /api/presets
GET /api/health
```

Potentially add:

```text
POST /api/compare
```

although comparison can also call `/simulate` twice.

---

## 25. Performance

The simulation should feel interactive.

Do not send unnecessarily massive arrays.

Possible optimizations:

- Downsample visualization arrays
- Run a smaller computational grid
- Return every Nth timestep
- Use NumPy vectorization
- Use Numba only if profiling shows it is necessary

Do not prematurely optimize.

---

## 26. Frontend Simulation State

Create TypeScript interfaces matching backend schemas.

Example concepts:

- `SimulationInput`
- `SimulationMetrics`
- `SimulationFields`
- `SimulationResponse`
- `EnvironmentPreset`
- `FuelPreset`

Maintain a clear distinction between:

- User controls
- Active simulation request
- Returned simulation result
- Visualization state

---

## 27. Field Visualization

Allow users to switch between:

- Flame
- Temperature
- Oxygen
- Fuel
- Reaction Rate
- Flow

For **Temperature**, show a heatmap with a Kelvin scale.

For **Oxygen**, show concentration spatially.

For **Fuel**, show fuel distribution.

For **Reaction**, show reaction intensity.

For **Flow**, show vector arrows or streamlines over the chamber.

Avoid misleading color scales.

Always show:

- Legend
- Units
- Minimum
- Maximum

when appropriate.

---

## 28. Flame Visualization

The flame visual should be derived primarily from the reaction-rate and temperature fields.

Do not create a completely unrelated looping flame animation.

Map:

```text
reaction intensity
+
temperature
↓
flame visualization
```

The visualization may be artistically enhanced, but it must be labelled as a visualization if visual effects go beyond the computed field.

A separate scientific heatmap must always be available.

---

## 29. Earth vs Microgravity Comparison

Create a dedicated **Compare** page.

Allow two simulations side-by-side.

Default comparison:

### Left

Earth — `1.0 g`

### Right

Microgravity — near `0 g`

Keep the following identical by default:

- Fuel
- Oxygen
- Pressure
- Initial temperature

This isolates gravity as the experimental variable.

Display side-by-side:

- Temperature field
- Oxygen field
- Reaction field
- Flow field
- Metrics

Explain the observed difference.

Example interpretation:

> Reducing gravity weakens the model's buoyancy-driven flow contribution. Oxygen and heat transport therefore become relatively more diffusion-dominated unless forced airflow is present.

Do not automatically claim:

- Microgravity flames are always colder
- Microgravity flames are always spherical
- Microgravity flames are always weaker

Actual behavior depends on fuel, oxygen, pressure, geometry and flow.

---

## 30. Gravity Sweep Mode

Create a special interactive experiment:

# Gravity Sweep

Automatically simulate:

```text
1.00 g
0.75 g
0.50 g
0.38 g
0.165 g
0.10 g
0.05 g
0.01 g
near-zero g
```

Plot metrics against gravity.

Possible plots:

- Peak temperature vs gravity
- Total reaction rate vs gravity
- Maximum buoyancy velocity vs gravity
- Estimated flame area vs gravity
- Oxygen consumption vs gravity

This is one of the strongest scientific features of the project.

---

## 31. Earth / Mars / Moon / Microgravity Presets

Add visually accessible preset buttons:

- Earth
- Mars
- Moon
- Microgravity

When selected, update gravity automatically.

Explain:

> These presets primarily change gravitational acceleration. They do not automatically represent the real atmosphere of each planetary body.

For example, selecting Mars gravity should not silently replace the atmosphere with Mars' CO₂-rich atmosphere.

If planetary atmospheric simulation is later implemented, make it a separate explicit setting.

---

## 32. Extinction Experiment

Create an experiment mode called:

# Find the Extinction Region

The user can vary oxygen concentration while holding other variables fixed.

The model runs successive simulations.

Display when the model transitions from sustained reaction to extinguished behavior.

Present the result as:

> **MODEL-PREDICTED EXTINCTION REGION**

Not:

> “NASA extinction limit”

unless validated data are being directly shown.

Display all relevant conditions:

- Gravity
- Oxygen
- Fuel
- Pressure
- Airflow
- Temperature
- Model version

This makes the result reproducible.

---

## 33. Forced Airflow Experiment

Create another experiment:

# Microgravity + Ventilation

Run near-zero gravity while changing airflow.

This teaches an important spacecraft concept:

> Even when natural convection is weak, ventilation-driven flow can strongly influence combustion and smoke transport.

Visualize the resulting asymmetry.

---

## 34. Science Page

Create an educational Science page with sections:

- What is microgravity combustion?
- Why does gravity matter?
- Buoyancy
- Convection
- Diffusion
- Oxygen transport
- Heat transfer
- Chemical reaction
- Flame extinction
- Cool flames
- Model equations
- Model assumptions
- Model limitations

Core conceptual comparison:

### Earth

```text
Gravity
→ Buoyancy
→ Natural convection
→ Oxygen/product transport
```

### Microgravity

```text
Weak gravity
→ Weak buoyancy
→ Weak natural convection
→ Diffusion and forced airflow become relatively more important
```

---

## 35. Flame Color Explanation

Include an educational section about flame color.

Explain:

- Yellow/orange luminosity can result from incandescent soot particles.
- Blue flame emission can involve excited chemical species and generally lower soot luminosity.

Do not claim:

- Yellow = always incomplete combustion
- Blue = always complete combustion

Explain that flame color depends on:

- Fuel chemistry
- Temperature
- Mixture
- Soot formation
- Pressure
- Oxygen concentration
- Flow
- Optical conditions

Do not make flame color the primary scientific output of the simulator unless a validated radiation/soot model is implemented.

---

## 36. Wood Combustion Note

If discussing wood, explain that solid fuel combustion requires pyrolysis.

Wood first heats and releases volatile gases.

Those gases then burn.

Therefore solid-fuel combustion requires additional physics beyond the MVP gaseous-fuel model.

Do not pretend the methane solver accurately simulates burning wood.

---

## 37. NASA Research Context

Create a section discussing real microgravity combustion research.

Include NASA's **Flame Extinguishment Experiment (FLEX)** as contextual inspiration.

Discuss concepts such as:

- Flame extinction
- Fuel droplets
- Oxygen concentration
- Microgravity flame behavior
- Cool flames

Do not fabricate NASA numerical results.

Design the content architecture so real citations and datasets can be added.

Every NASA-derived quantitative statement should eventually include a source.

---

## 38. Spacecraft Safety Page

Connect the science to spacecraft safety.

Explain why microgravity combustion matters for:

- Fire detection
- Smoke transport
- Ventilation
- Oxygen transport
- Flame spread
- Suppression
- Crew safety
- Future long-duration missions

Show the chain:

```text
MICROGRAVITY
↓
ALTERED TRANSPORT
↓
ALTERED COMBUSTION / SMOKE BEHAVIOR
↓
DETECTION + SUPPRESSION CHALLENGES
↓
SPACECRAFT FIRE SAFETY
```

Do not overstate the simulator's ability to design actual spacecraft safety systems.

The simulator is educational and exploratory.

---

## 39. Live Scientific Interpretation

The right side of the Laboratory should contain a dynamic explanation.

### At high gravity

> Buoyancy-driven flow is significant in the current model. Hot gases rise and natural convection contributes to oxygen transport.

### At near-zero gravity

> The buoyancy contribution is very small. Transport is increasingly governed by molecular diffusion and the imposed airflow.

### If airflow is increased

> Forced airflow is now the dominant modeled transport mechanism despite low gravity.

Generate these statements from actual simulation parameters.

Do not use an LLM for this.

Use deterministic rules.

---

## 40. Metrics Panel

Display cards such as:

- Gravity
- Peak Temperature
- Total Reaction Rate
- Oxygen Consumption
- Max Flow Velocity
- Estimated Flame Area
- Flame Status

Each metric must have units.

Add tooltips explaining exactly what each metric means.

If it is a derived model quantity, say so.

---

## 41. Simulation Timeline

Provide:

- Play
- Pause
- Reset
- Time

Optionally allow scrubbing through saved simulation frames.

The user should be able to watch oxygen, heat and reaction fields evolve.

If storing every frame is too expensive, store a reasonable subset.

---

## 42. UI Design

Visual direction:

**Dark scientific interface.**

Space-inspired but restrained.

Suggested visual language:

- Deep navy/black backgrounds
- Cyan/blue for oxygen/science
- Orange for heat/combustion
- White/off-white typography

Use orange sparingly for flame/heat information.

Use cyan/blue for oxygen/flow information.

Maintain high contrast.

Avoid excessive neon.

Avoid generic glass cards everywhere.

Avoid unnecessary animated stars.

The interface should look like:

```text
mission control
+
scientific visualization software
+
modern educational web application
```

---

## 43. Responsive Design

Desktop is the primary presentation environment.

However, make the site usable on tablets and mobile.

On mobile:

- Stack controls
- Place visualization prominently
- Collapse advanced settings
- Keep essential metrics visible

Do not simply shrink the desktop interface.

---

## 44. Accessibility

Use:

- Semantic HTML
- Keyboard-accessible controls
- Labels
- ARIA attributes where appropriate
- Sufficient contrast

Do not encode scientific information solely through color.

Use labels, numbers or patterns where needed.

---

## 45. Error Handling

Handle:

- Backend unavailable
- Simulation timeout
- Invalid parameter
- Numerical instability
- NaN result
- Network failure
- Unsupported fuel

Show meaningful user messages.

Never silently display fabricated fallback simulation values.

If simulation fails, say that the simulation failed.

---

## 46. Testing

Write backend unit tests.

At minimum test:

- Diffusion smooths concentration gradients.
- Zero gravity removes/reduces the buoyancy component.
- Increasing gravity increases the buoyancy contribution under otherwise identical conditions.
- Forced airflow remains active at zero gravity.
- Species remain within valid bounds.
- Temperature remains finite.
- Reaction requires fuel + oxygen + ignition conditions.
- No NaNs occur in standard presets.
- API rejects invalid values.

Add frontend tests for critical controls if time permits.

---

## 47. Physics Sanity Tests

Before polishing the interface, verify qualitative physical behavior.

### Test A

```text
Gravity = 1g
Airflow = 0
```

Expected:

> Nonzero upward buoyancy contribution.

### Test B

```text
Gravity ≈ 0
Airflow = 0
```

Expected:

> Very small natural-convection contribution.

### Test C

```text
Gravity ≈ 0
Airflow > 0
```

Expected:

> Flow remains due to forced ventilation.

### Test D

No oxygen.

Expected:

> Reaction cannot remain sustained.

### Test E

No fuel.

Expected:

> Reaction = zero.

### Test F

Temperature below ignition condition with no ignition source.

Expected:

> No significant combustion.

### Test G

Higher gravity with otherwise identical heated field.

Expected:

> Stronger buoyancy term.

These tests are more important than visual polish.

---

## 48. Model Assumptions Panel

The application must contain an easily accessible section listing assumptions.

Example:

- 2D domain
- Reduced-order flow model
- Single-step chemistry
- Simplified gaseous fuel
- Constant or simplified transport properties
- No detailed soot chemistry
- No radiation model initially
- No detailed turbulence
- No detailed spacecraft geometry
- No detailed solid-fuel pyrolysis
- Educational rather than engineering-certification model

This transparency increases scientific credibility.

---

## 49. Model Version

Display a model version somewhere subtle.

Example:

```text
ZeroG Reduced-Order Combustion Model v0.1
```

Every saved/exported experiment should include the model version.

---

## 50. README

Create an excellent README.

Include:

- ZeroG Flames overview
- Research question
- Scientific background
- Architecture
- Equations
- Assumptions
- Installation
- Frontend setup
- Backend setup
- Running locally
- API documentation
- Testing
- Known limitations
- Future work
- NASA Space Apps context

Do not claim NASA endorsement.

---

## 51. Local Development

The application should be easy to run.

### Backend

```bash
python -m venv .venv
```

Install requirements and run FastAPI/Uvicorn.

### Frontend

```bash
npm install
npm run dev
```

Configure API base URL through environment variables.

Provide:

```text
.env.example
```

Do not hard-code localhost URLs throughout components.

---

## 52. Development Priority

Build in this exact order.

### Phase 1 — Physics Core

Create:

- Grid
- Diffusion
- Fuel field
- Oxygen field
- Temperature field
- Reaction model
- Buoyancy approximation
- Forced airflow
- Time stepping
- Metrics

Run standalone tests.

Do not begin with visual polish.

### Phase 2 — Backend

Create FastAPI.

Expose `/api/simulate`.

Validate inputs.

Return simulation fields.

Test endpoints.

### Phase 3 — Basic Frontend

Create Laboratory page.

Add controls.

Connect API.

Render basic heatmaps.

### Phase 4 — Scientific Visualization

Implement:

- Temperature
- Oxygen
- Fuel
- Reaction
- Flow
- Metrics

### Phase 5 — Comparison

Implement Earth vs microgravity.

### Phase 6 — Experiments

Implement:

- Gravity sweep
- Extinction experiment
- Ventilation experiment

### Phase 7 — Educational Content

Implement:

- Science page
- Safety page
- NASA research context

### Phase 8 — Visual Polish

Improve:

- Flame rendering
- Animations
- Responsive design
- Transitions
- Branding

Only polish after the scientific workflow works.

---

## 53. MVP Definition

The MVP is complete when a user can:

1. Open ZeroG Flames.
2. Enter the Zero-G Laboratory.
3. Select Earth gravity.
4. Run a combustion simulation.
5. View temperature, oxygen, reaction and flow fields.
6. Change gravity toward zero.
7. Run the same simulation again.
8. Observe the reduction in buoyancy-driven transport.
9. Compare Earth and microgravity side-by-side.
10. Read an explanation of why the behavior changed.

Everything beyond this is secondary.

---

## 54. Important Scientific Rules

Never implement:

```text
gravity → oxygen directly moves upward/downward
```

Correct relationship:

```text
gravity
→ density-driven buoyancy
→ flow
→ species transport
```

Never imply:

- Microgravity means absolutely no gas flow.
- Microgravity flames are always spherical.
- Microgravity flames are always blue.
- Microgravity flames are always colder.
- Yellow automatically means incomplete combustion.
- Mars preset represents the Martian atmosphere unless atmosphere is explicitly modeled.
- Arbitrary simulation thresholds are NASA measurements.
- This is full CFD unless full governing fluid equations are actually implemented.

Never hide assumptions.

---

## 55. Product Story

The final application should communicate this story naturally.

### On Earth

```text
GRAVITY
↓
BUOYANCY
↓
NATURAL CONVECTION
↓
OXYGEN + HEAT + PRODUCT TRANSPORT
↓
COMBUSTION BEHAVIOR
```

### As gravity decreases

```text
GRAVITY ↓
↓
BUOYANCY ↓
↓
NATURAL CONVECTION ↓
↓
RELATIVE IMPORTANCE OF DIFFUSION ↑
↓
FLAME ENVIRONMENT CHANGES
```

### In spacecraft

```text
MICROGRAVITY
+
FORCED VENTILATION
+
OXYGEN ENVIRONMENT
+
FUEL
↓
SPACECRAFT FIRE BEHAVIOR
↓
FIRE SAFETY
```

---

## 56. Demo Experience

Optimize the project for a **2–3 minute competition demonstration**.

### Step 1

Open the site.

> **Fire behaves differently when gravity disappears.**

### Step 2

Enter Laboratory.

Show Earth at `1g`.

### Step 3

Show:

- Temperature
- Oxygen
- Reaction
- Flow

### Step 4

Move gravity toward zero.

Run again.

### Step 5

Show weakening buoyancy and increasing relative importance of diffusion.

### Step 6

Turn on forced airflow.

Show that microgravity does not mean stationary gas.

### Step 7

Open Compare.

Show Earth and microgravity side-by-side.

### Step 8

Open spacecraft-safety section.

Explain why transport differences matter for detecting and suppressing fires in spacecraft.

This entire path should be obvious without requiring technical instructions.

---

## 57. Visual Branding

Brand name:

# ZeroG Flames

Possible tagline:

> **Fire Without Gravity**

Secondary line:

> Exploring combustion from Earth to microgravity.

Logo concept:

```text
flame
+
orbit
+
space
```

Use the branding consistently.

Do not use NASA's official logo as though this application were an official NASA product.

---

## 58. Future Extensions

Design architecture that could later support:

- Real NASA experimental datasets
- FLEX comparison
- Droplet combustion
- Solid-fuel pyrolysis
- Smoke transport
- CO/CO₂ fields
- Soot modeling
- Radiative heat transfer
- Different spacecraft ventilation configurations
- 3D visualization
- Saved experiments
- Experiment sharing
- Data export
- CSV export
- Mission scenarios
- Educational challenges

Do not implement all of these now.

Architect the application so they can be added later.

---

## 59. Code Quality

Use:

- Clear variable names
- Type hints in Python
- TypeScript types
- Docstrings
- Small modules
- Centralized constants
- Configuration objects
- Meaningful error handling
- Tests

Avoid:

- Giant components
- Magic numbers
- Duplicated equations
- Hard-coded scientific values scattered across files
- Unused dependencies
- Unnecessary abstraction
- Premature microservices

---

## 60. Critical Implementation Philosophy

Prioritize:

> **CORRECT CONCEPT over COMPLEX PHYSICS**

Prioritize:

> **WORKING SIMULATION over DECORATIVE ANIMATION**

Prioritize:

> **SCIENTIFIC TRANSPARENCY over IMPRESSIVE-SOUNDING CLAIMS**

Prioritize:

> **CLEAR VISUALIZATION over UNNECESSARY 3D**

Prioritize:

> **ONE EXCELLENT INTERACTIVE EXPERIMENT over TWENTY HALF-FINISHED FEATURES**

---

## 61. First Implementation Task

Start by implementing **only the physics prototype and tests**.

Before building the polished website, create a standalone Python simulation capable of producing:

```text
T(x,y)
Y_O2(x,y)
Y_F(x,y)
ω(x,y)
u(x,y)
v(x,y)
```

for:

### Case A

Earth gravity:

```text
1.0 g
```

### Case B

Near-zero gravity.

Use identical:

- Oxygen
- Fuel
- Pressure
- Initial temperature
- Geometry

Generate diagnostic plots for:

- Temperature
- Oxygen
- Fuel
- Reaction rate
- Velocity field

Compare both cases.

Verify that reducing gravity reduces the modeled buoyancy contribution.

Then proceed to FastAPI.

Then proceed to React.

**Do not skip this verification step.**

---

## 62. Final Deliverable

Produce a complete, runnable repository for:

# ZERO-G FLAMES

with:

- Functional Python physics engine
- Automated physics sanity tests
- FastAPI backend
- React/TypeScript frontend
- Interactive Zero-G Laboratory
- Gravity control
- Oxygen control
- Airflow control
- Pressure control
- Fuel selection
- Temperature visualization
- Oxygen visualization
- Fuel visualization
- Reaction-rate visualization
- Velocity-field visualization
- Earth vs microgravity comparison
- Gravity sweep
- Extinction experiment if time permits
- Science page
- Spacecraft Safety page
- Model assumptions
- README
- Clean professional UI
- Responsive layout
- Robust error handling

The final product should make a judge understand within seconds:

> **Gravity doesn't directly deliver oxygen to a flame. Gravity creates buoyancy, buoyancy drives natural convection, and convection changes how oxygen, heat and combustion products are transported.**

Then allow the judge to interactively explore what happens as that buoyancy-driven transport disappears.

The central message of ZeroG Flames is:

> **Fire behaves differently when gravity stops dominating transport.**

Build the project around that scientific story.

Begin with the physics engine.

Do not start by generating a decorative landing page.

Do not fake scientific outputs.

Make the simplest scientifically defensible model work first, test it, expose it through an API, and only then build the polished interactive experience around it.
