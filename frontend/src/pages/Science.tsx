import React from 'react';

export const Science: React.FC = () => {
  return (
    <main className="page-view active">
      <div className="content-section">
        <h2>Scientific Principles of Microgravity Combustion</h2>

        <h3>1. What is Microgravity Combustion?</h3>
        <p>
          Combustion is a coupled thermo-chemical process governed by fluid motion, molecular diffusion, and chemical kinetics. On Earth, gravity produces buoyancy because hot combustion gases are significantly less dense than cold surrounding air. In microgravity, this buoyancy-driven convective draft vanishes, allowing fundamental molecular diffusion and chemistry to be observed without gravity-induced distortions.
        </p>

        <div className="info-alert">
          <strong>The Scientific Chain:</strong> Gravity → Density-difference Buoyancy → Natural Convection → Altered Oxygen/Heat Transport → Flame Geometry & Extinction.
        </div>

        <h3>2. Why Gravity Doesn't "Pull Oxygen"</h3>
        <p>
          Gravity does not directly attract oxygen molecules to a flame. Instead, gravity exerts a downward body force on all gas molecules proportional to density (ρg). Hot gases expanded by combustion have lower density than cold ambient air, resulting in a net upward buoyancy force that carries hot exhaust away and entrains fresh oxygen-rich air into the flame base.
        </p>

        <h3>3. Governing Transport Equations</h3>
        <p>
          ZeroG Flames models combustion using coupled 2D advection-diffusion-reaction conservation equations:
        </p>

        <div className="equation-box">
          <strong>Oxygen Transport:</strong><br />
          ∂Y_O2/∂t + <b>u</b> · ∇Y_O2 = D_O2 ∇²Y_O2 - s_O2 · ω<br /><br />
          <strong>Fuel Transport:</strong><br />
          ∂Y_F/∂t + <b>u</b> · ∇Y_F = D_F ∇²Y_F - ω<br /><br />
          <strong>Energy Conservation:</strong><br />
          ∂T/∂t + <b>u</b> · ∇T = α ∇²T + (Q · ω) / (ρ c_p) - L_loss<br /><br />
          <strong>Arrhenius Kinetics:</strong><br />
          ω = A · Y_F · Y_O2 · exp(-E_a / (R · T))<br /><br />
          <strong>Boussinesq Buoyancy Flow:</strong><br />
          <b>u</b>_total = <b>u</b>_forced + <b>u</b>_buoyancy, where F_b ∝ g · β · (T - T_amb)
        </div>

        <h3>4. Flame Color & Chemiluminescence</h3>
        <p>Flame colors are determined by two distinct physical mechanisms:</p>
        <ul style={{ marginLeft: '1.5rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          <li><strong>Blue Emission:</strong> Chemiluminescence from electronically excited radical species (CH* and C₂*) emitting discrete wavelengths (~431 nm and ~516 nm) during intense oxidation.</li>
          <li><strong>Yellow/Orange Luminosity:</strong> Continuum thermal radiation from incandescent microscopic soot particles heated to high temperatures (1500–2000 K).</li>
        </ul>

        <h3>5. NASA Research Heritage</h3>
        <ul style={{ marginLeft: '1.5rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          <li><strong>FLEX (Flame Extinguishment Experiment):</strong> Studied droplet combustion and discovered self-sustaining low-temperature cool flames.</li>
          <li><strong>ACME (Advanced Combustion via Microgravity Experiments):</strong> Investigated gaseous flame structure and soot formation on the ISS.</li>
          <li><strong>SoFIE (Solid Fuel Ignition and Extinction):</strong> Evaluates material flammability for exploration spacecraft cabins.</li>
        </ul>

        <h3>6. Solid Fuel Pyrolysis & Wood Combustion Note</h3>
        <p>
          Solid fuels such as wood, composite polymers, or wiring insulation do not burn directly in their condensed solid phase. Instead, heat transfer from an ignition source drives an endothermic chemical decomposition process called <strong>pyrolysis</strong>:
        </p>
        <div className="info-alert" style={{ marginBottom: '1rem' }}>
          <strong>Pyrolysis Mechanism:</strong> Solid Material + Thermal Radiation → Char Residue + Tar + Combustible Volatiles (CO, H₂, Hydrocarbon Gases).
        </div>
        <p>
          These released volatiles then mix with ambient oxygen in the gas phase where combustion actually occurs. Consequently, solid fuels require coupled phase-change, condensed-phase energy balances, and gasification physics beyond our present gaseous-fuel model. We explicitly model gaseous reactants (CH₄, C₃H₈-like, C₂H₅OH) rather than pretending gaseous kinetics can represent solid wood burning.
        </p>

        <h3>7. The Cool Flame Phenomenon & Droplet Studies (FLEX)</h3>
        <p>
          During NASA's FLEX experiments on the ISS, scientists observed liquid fuel droplets apparently "extinguishing," only for combustion to continue invisibly at significantly lower temperatures (600–900 K vs. typical 1800–2200 K).
        </p>
        <p>
          These <strong>cool flames</strong> are sustained by low-temperature hydrocarbon reaction pathways involving peroxide radical chemistry. Without buoyant convection carrying away heat and reactants, these low-temperature reaction regimes can persist quietly in microgravity, posing unique detection challenges for spacecraft fire safety.
        </p>

        <h3>8. Model Assumptions & Explicit Limitations</h3>
        <ul style={{ marginLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <li><strong>2D Cartesian Grid:</strong> Simulates a vertical cross-section of a 8 cm × 8 cm combustion chamber.</li>
          <li><strong>Reduced-Order Fluid Dynamics:</strong> Implements a Boussinesq buoyancy body force coupled with lateral mass entrainment, rather than full 3D Navier-Stokes CFD.</li>
          <li><strong>Single-Step Global Arrhenius Kinetics:</strong> Solves <code>Fuel + s·O₂ → Products + Heat</code> with flammability cutoff rather than hundreds of elementary radical elementary steps.</li>
          <li><strong>Optically Thin Radiation:</strong> Radiation loss is approximated via Planck mean emission rather than full spectral radiative transfer equation (RTE) solving.</li>
          <li><strong>Educational Purpose:</strong> Built to illustrate fundamental physical mechanisms and qualitative transitions between buoyancy-dominated and diffusion-dominated regimes; not certified for aerospace flight hardware signoff.</li>
        </ul>
      </div>
    </main>
  );
};
