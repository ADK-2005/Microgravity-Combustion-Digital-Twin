import React from 'react';

export const Safety: React.FC = () => {
  return (
    <main className="page-view active">
      <div className="content-section">
        <h2>Spacecraft Fire Safety & Mission Architecture</h2>

        <div className="info-alert">
          <strong>Mission-Critical Reality:</strong> Fire in a sealed spacecraft represents one of the most hazardous catastrophic mission risks. The absence of gravity fundamentally alters how fires start, spread, and can be detected or extinguished.
        </div>

        <h3>1. The Detection Dilemma: Smoke Without Buoyancy</h3>
        <p>
          On Earth, smoke rises straight toward ceiling-mounted ionization and optical smoke detectors. In microgravity, smoke has no upward buoyant force. Particulate matter remains suspended and follows internal cabin ventilation air currents. Consequently, spacecraft smoke detectors must be installed directly inside air return ducts, where airflow filters and monitors the entire cabin volume.
        </p>

        <h3>2. Quiescent Smoldering & Ventilation Shock</h3>
        <p>
          In unventilated spacecraft compartments, an accidental ignition may consume local oxygen and appear to extinguish, while silently smoldering at high temperature. If an astronaut or automated system activates cabin fans, the sudden influx of forced oxygen can cause explosive flame reactivation.
        </p>

        <h3>3. Artemis Exploration Atmospheres</h3>
        <p>
          Future lunar and deep-space missions (such as NASA's Artemis program) utilize Exploration Atmospheres (e.g. <strong>34% O₂ at 56 kPa / 8.2 psi</strong>) to minimize pre-breathe time before Extravehicular Activities (EVAs). Elevated oxygen fractions significantly widen the flammability envelope of polymers and electrical components, making microgravity combustion modeling crucial for spacecraft material selection.
        </p>
      </div>
    </main>
  );
};
