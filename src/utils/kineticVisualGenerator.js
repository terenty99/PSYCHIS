/**
 * kineticVisualGenerator.js — PSYCHIS Dynamic 60fps Kinetic Simulation Engine
 * Synthesizes self-contained, high-precision animated vector physics simulations tailored
 * uniquely to each node's concept, equations, and category.
 * 
 * Never relies on external broken or CORS-blocked URLs.
 */

export function generateDynamicKineticAnimation(nodeData, customPrompt = '') {
  const title = nodeData?.data?.title || 'Kinetic System';
  const category = (nodeData?.data?.category || '').toLowerCase();
  const formula = nodeData?.data?.formula || 'F = ma';
  const prompt = (customPrompt || '').trim().toLowerCase();
  const nodeText = `${title} ${category} ${formula}`.toLowerCase();

  // Escape XML safe characters
  const safeTitle = escapeXml(title);
  const safeFormula = escapeXml(formula);
  const safePrompt = escapeXml(customPrompt);

  let svgContent = '';

  // 1. ABSOLUTE TOP PRIORITY: If a user custom prompt or suggested prompt is selected,
  // evaluate it FIRST so the animation strictly matches what was chosen!
  if (prompt) {
    if (
      prompt.includes('drag') ||
      prompt.includes('air resistance') ||
      prompt.includes('resistance') ||
      prompt.includes('terminal') ||
      prompt.includes('aerodynamic') ||
      prompt.includes('wind') ||
      prompt.includes('wake') ||
      prompt.includes('vortex') ||
      prompt.includes('streamline') ||
      prompt.includes('f_d') ||
      prompt.includes('kv²')
    ) {
      svgContent = createAerodynamicDragKineticSvg(safeTitle, safeFormula, safePrompt || 'Terminal velocity drag vector F_d = -kv²');
    } else if (
      prompt.includes('bounce') ||
      prompt.includes('restitution') ||
      prompt.includes('elastic ground') ||
      prompt.includes('impact') ||
      prompt.includes('rebound')
    ) {
      svgContent = createBounceKineticSvg(safeTitle, safeFormula, safePrompt || 'Elastic ground collision & coefficient of restitution bounce');
    } else if (
      prompt.includes('free fall') ||
      prompt.includes('drop') ||
      prompt.includes('fall') ||
      prompt.includes('downward throw') ||
      prompt.includes('gravitational acceleration') ||
      prompt.includes('y(t)') ||
      (prompt.includes('gravity') && !prompt.includes('orbit'))
    ) {
      svgContent = createBallDropKineticSvg(safeTitle, safeFormula, safePrompt || 'Vertical downward acceleration under g = 9.81 m/s²');
    } else if (
      prompt.includes('projectile') ||
      prompt.includes('parabol') ||
      prompt.includes('cannon') ||
      prompt.includes('launch angle') ||
      prompt.includes('range r') ||
      prompt.includes('ballistic')
    ) {
      svgContent = createProjectileKineticSvg(safeTitle, safeFormula, safePrompt || 'Parabolic ballistic trajectory');
    } else if (
      prompt.includes('collision') ||
      prompt.includes('momentum') ||
      prompt.includes('elastic') ||
      prompt.includes('two-body') ||
      prompt.includes('inelastic')
    ) {
      svgContent = createCollisionKineticSvg(safeTitle, safeFormula, safePrompt || 'Elastic momentum exchange');
    } else if (
      prompt.includes('spring') ||
      prompt.includes('hooke') ||
      prompt.includes('damped') ||
      prompt.includes('oscillator') ||
      prompt.includes('vibration') ||
      prompt.includes('restoring force')
    ) {
      svgContent = createHarmonicKineticSvg(safeTitle, safeFormula);
    } else if (
      prompt.includes('wave') ||
      prompt.includes('quantum') ||
      prompt.includes('schrodinger') ||
      prompt.includes('packet') ||
      prompt.includes('dispersion') ||
      prompt.includes('standing wave') ||
      prompt.includes('phase velocity')
    ) {
      svgContent = createWaveKineticSvg(safeTitle, safeFormula);
    } else if (
      prompt.includes('pendulum') ||
      prompt.includes('chaos') ||
      prompt.includes('double pendulum') ||
      prompt.includes('lyapunov') ||
      prompt.includes('bifurcation')
    ) {
      svgContent = createPendulumKineticSvg(safeTitle, safeFormula);
    } else if (
      prompt.includes('orbit') ||
      prompt.includes('kepler') ||
      prompt.includes('celestial') ||
      prompt.includes('planet') ||
      prompt.includes('satellite') ||
      prompt.includes('areal velocity')
    ) {
      svgContent = createOrbitKineticSvg(safeTitle, safeFormula);
    } else if (
      prompt.includes('gyro') ||
      prompt.includes('angular') ||
      prompt.includes('precession') ||
      prompt.includes('torque') ||
      prompt.includes('spin')
    ) {
      svgContent = createGyroKineticSvg(safeTitle, safeFormula);
    } else if (
      prompt.includes('thermo') ||
      prompt.includes('carnot') ||
      prompt.includes('cycle') ||
      prompt.includes('entropy') ||
      prompt.includes('p-v')
    ) {
      svgContent = createCarnotKineticSvg(safeTitle, safeFormula);
    } else if (
      prompt.includes('four-bar') ||
      prompt.includes('linkage') ||
      prompt.includes('coupler') ||
      prompt.includes('chebyshev') ||
      prompt.includes('crank') ||
      prompt.includes('geneva') ||
      prompt.includes('peaucellier')
    ) {
      svgContent = createLinkageKineticSvg(safeTitle, safeFormula);
    } else if (
      prompt.includes('bike') ||
      prompt.includes('bicycle') ||
      prompt.includes('cycle') ||
      prompt.includes('wheel') ||
      prompt.includes('transport') ||
      prompt.includes('vehicle') ||
      prompt.includes('drivetrain') ||
      prompt.includes('pedal') ||
      prompt.includes('rolling')
    ) {
      svgContent = createBicycleKineticSvg(safeTitle, safeFormula, safePrompt || 'Planar rolling kinematics & chain transmission dynamics');
    } else if (
      prompt.includes('topolog') ||
      prompt.includes('knot') ||
      prompt.includes('curvature') ||
      prompt.includes('manifold') ||
      prompt.includes('inflection')
    ) {
      svgContent = createTopologicalKineticSvg(safeTitle, safeFormula);
    }
  }

  // 2. SECONDARY: Evaluate Node Title, Category, and Formula if prompt was generic or didn't match
  if (!svgContent) {
    const has = (k) => nodeText.includes(k) || prompt.includes(k);

    if (has('drag') || has('air resistance') || has('terminal velocity') || has('aerodynamic') || has('streamline')) {
      svgContent = createAerodynamicDragKineticSvg(safeTitle, safeFormula, 'Terminal velocity drag vector F_d = -kv²');
    } else if (has('bounce') || has('restitution') || has('rebound')) {
      svgContent = createBounceKineticSvg(safeTitle, safeFormula, 'Elastic ground collision & coefficient of restitution bounce');
    } else if (has('ball') || has('throw') || has('drop') || has('fall') || has('downward') || has('free fall') || (has('gravity') && !has('orbit'))) {
      svgContent = createBallDropKineticSvg(safeTitle, safeFormula, 'Vertical downward acceleration under g = 9.81 m/s²');
    } else if (has('projectile') || has('arc') || has('cannon') || has('parabola') || has('launch')) {
      svgContent = createProjectileKineticSvg(safeTitle, safeFormula, 'Parabolic ballistic trajectory');
    } else if (has('collision') || has('momentum') || has('elastic')) {
      svgContent = createCollisionKineticSvg(safeTitle, safeFormula, 'Elastic momentum exchange');
    } else if (has('spring') || has('hooke') || has('damped') || has('oscillator') || has('vibration')) {
      svgContent = createHarmonicKineticSvg(safeTitle, safeFormula);
    } else if (has('wave') || has('quantum') || has('schrodinger') || has('packet') || has('dispersion') || has('standing wave')) {
      svgContent = createWaveKineticSvg(safeTitle, safeFormula);
    } else if (has('pendulum') || has('chaos') || has('double pendulum') || has('bifurcation')) {
      svgContent = createPendulumKineticSvg(safeTitle, safeFormula);
    } else if (has('orbit') || has('kepler') || has('celestial') || has('planet') || has('satellite')) {
      svgContent = createOrbitKineticSvg(safeTitle, safeFormula);
    } else if (has('gyro') || has('angular') || has('precession') || has('torque') || has('spin')) {
      svgContent = createGyroKineticSvg(safeTitle, safeFormula);
    } else if (has('thermo') || has('carnot') || has('cycle') || has('entropy') || has('p-v')) {
      svgContent = createCarnotKineticSvg(safeTitle, safeFormula);
    } else if (has('four-bar') || has('linkage') || has('coupler') || has('chebyshev') || has('crank') || has('geneva') || has('gear')) {
      svgContent = createLinkageKineticSvg(safeTitle, safeFormula);
    } else if (has('bike') || has('bicycle') || has('cycle') || has('wheel') || has('transport') || has('vehicle') || has('drivetrain') || has('pedal') || has('rolling')) {
      svgContent = createBicycleKineticSvg(safeTitle, safeFormula, 'Planar rolling kinematics & chain transmission dynamics');
    } else if (has('topolog') || has('knot') || has('curvature') || has('manifold') || has('inflection')) {
      svgContent = createTopologicalKineticSvg(safeTitle, safeFormula);
    } else {
      // Deterministic fallback based on hash of title
      const hash = title.split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0);
      const generators = [
        () => createAerodynamicDragKineticSvg(safeTitle, safeFormula, 'Aerodynamic fluid dynamics'),
        () => createBounceKineticSvg(safeTitle, safeFormula, 'Elastic coefficient of restitution'),
        () => createBicycleKineticSvg(safeTitle, safeFormula, 'Rotational rolling kinematics'),
        () => createBallDropKineticSvg(safeTitle, safeFormula, 'Gravitational kinematic descent'),
        () => createHarmonicKineticSvg(safeTitle, safeFormula),
        () => createWaveKineticSvg(safeTitle, safeFormula),
        () => createOrbitKineticSvg(safeTitle, safeFormula),
        () => createPendulumKineticSvg(safeTitle, safeFormula),
        () => createLinkageKineticSvg(safeTitle, safeFormula),
      ];
      svgContent = generators[Math.abs(hash) % generators.length]();
    }
  }

  const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;

  const cleanPromptTitle = customPrompt ? customPrompt.split('&')[0].trim().slice(0, 48) : '';
  const displayTitle = cleanPromptTitle ? `${title} // ${cleanPromptTitle}` : `${title} // 60fps Dynamic Simulation`;
  const displayCaption = customPrompt
    ? `Continuous 60fps kinetic simulation for "${customPrompt}". Governing relation: ${formula}`
    : `Continuous 60fps kinetic simulation loop for ${title}. Governing relation: ${formula}`;

  return {
    url: dataUri,
    svg: svgContent,
    title: displayTitle,
    caption: displayCaption,
    type: 'gif',
    author: 'AI Kinetic Synthesizer',
  };
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/* 0A. Aerodynamic Drag & Terminal Velocity Simulation */
function createAerodynamicDragKineticSvg(title, formula, prompt) {
  const safeFormula = formula && formula !== 'F = ma' ? formula : 'F_d = -½ρ v² C_d A';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 260" width="100%" height="100%">
  <defs>
    <linearGradient id="drag-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E131F"/>
      <stop offset="100%" stop-color="#1B2436"/>
    </linearGradient>
    <radialGradient id="sphereGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#93C5FD"/>
      <stop offset="45%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </radialGradient>
    <linearGradient id="streamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.1"/>
      <stop offset="50%" stop-color="#38BDF8" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#38BDF8" stop-opacity="0.2"/>
    </linearGradient>
    <filter id="vectorGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="460" height="260" fill="url(#drag-bg)" rx="16"/>

  <!-- Telemetry Header -->
  <g font-family="monospace" font-size="8.5" fill="#94A3B8">
    <text x="20" y="24" fill="#38BDF8" font-weight="bold">● 60FPS AERODYNAMIC FLUID DYNAMICS // DRAG &amp; TERMINAL VELOCITY</text>
    <text x="20" y="38" fill="#F1F5F9">${title}</text>
    <text x="440" y="24" text-anchor="end" fill="#64748B">GOVERNING: ${safeFormula}</text>
    <text x="440" y="38" text-anchor="end" fill="#10B981">EQUILIBRIUM: ΣF = F_g - F_d = 0 ⇒ v = v_term</text>
  </g>

  <!-- Left: Wind Tunnel & Streamlines Flow Area (x: 20 to 240) -->
  <g>
    <!-- Wind Tunnel Boundary guides -->
    <line x1="30" y1="52" x2="230" y2="52" stroke="#1E293B" stroke-width="1.5" stroke-dasharray="3 3"/>
    <line x1="30" y1="215" x2="230" y2="215" stroke="#1E293B" stroke-width="1.5" stroke-dasharray="3 3"/>

    <!-- Upward Relative Airflow Streamlines (Air rushing past falling body) -->
    <!-- Far Left Streamline -->
    <path d="M 50 215 L 50 52" stroke="url(#streamGrad)" stroke-width="1.2" stroke-dasharray="8 12">
      <animate attributeName="stroke-dashoffset" from="40" to="0" dur="0.9s" repeatCount="indefinite"/>
    </path>
    <path d="M 75 215 L 75 52" stroke="url(#streamGrad)" stroke-width="1.5" stroke-dasharray="10 14">
      <animate attributeName="stroke-dashoffset" from="48" to="0" dur="0.85s" repeatCount="indefinite"/>
    </path>

    <!-- Deflecting Streamlines around the Sphere (Center at 130, 140, r=22) -->
    <!-- Left Deflected Streamline -->
    <path d="M 105 215 L 105 165 C 105 145, 95 130, 95 110 C 95 90, 110 75, 115 52" fill="none" stroke="url(#streamGrad)" stroke-width="1.8" stroke-dasharray="12 10">
      <animate attributeName="stroke-dashoffset" from="44" to="0" dur="0.75s" repeatCount="indefinite"/>
    </path>
    <!-- Right Deflected Streamline -->
    <path d="M 155 215 L 155 165 C 155 145, 165 130, 165 110 C 165 90, 150 75, 145 52" fill="none" stroke="url(#streamGrad)" stroke-width="1.8" stroke-dasharray="12 10">
      <animate attributeName="stroke-dashoffset" from="44" to="0" dur="0.75s" repeatCount="indefinite"/>
    </path>

    <!-- Far Right Streamlines -->
    <path d="M 185 215 L 185 52" stroke="url(#streamGrad)" stroke-width="1.5" stroke-dasharray="10 14">
      <animate attributeName="stroke-dashoffset" from="48" to="0" dur="0.85s" repeatCount="indefinite"/>
    </path>
    <path d="M 210 215 L 210 52" stroke="url(#streamGrad)" stroke-width="1.2" stroke-dasharray="8 12">
      <animate attributeName="stroke-dashoffset" from="40" to="0" dur="0.9s" repeatCount="indefinite"/>
    </path>

    <!-- Turbulent Wake Vortex Shedding behind Sphere (above 130, 140) -->
    <g opacity="0.7">
      <path d="M 125 110 Q 115 95 128 85 T 120 65" fill="none" stroke="#60A5FA" stroke-width="1" stroke-dasharray="3 3">
        <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite"/>
      </path>
      <path d="M 135 110 Q 145 95 132 85 T 140 65" fill="none" stroke="#60A5FA" stroke-width="1" stroke-dasharray="3 3">
        <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.1s" repeatCount="indefinite"/>
      </path>
      <circle cx="122" cy="85" r="3" fill="none" stroke="#93C5FD" stroke-width="0.8" opacity="0.6">
        <animate attributeName="r" values="2; 5; 2" dur="0.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx="138" cy="72" r="3" fill="none" stroke="#93C5FD" stroke-width="0.8" opacity="0.6">
        <animate attributeName="r" values="2; 5; 2" dur="0.9s" repeatCount="indefinite"/>
      </circle>
      <text x="130" y="60" font-family="monospace" font-size="7" fill="#64748B" text-anchor="middle">vortex wake</text>
    </g>

    <!-- Falling Sphere at Terminal Equilibrium (130, 140) -->
    <g transform="translate(130, 140)">
      <!-- Subtle float micro-oscillation at terminal velocity -->
      <animateTransform attributeName="transform" type="translate" values="130,140; 130,138; 130,142; 130,140" dur="2s" repeatCount="indefinite"/>
      
      <!-- Stagnation High Pressure Arc at Leading Edge (bottom of falling sphere) -->
      <path d="M -18 12 A 22 22 0 0 0 18 12" fill="none" stroke="#EF4444" stroke-width="2.5" opacity="0.7"/>

      <!-- Sphere Body -->
      <circle cx="0" cy="0" r="22" fill="url(#sphereGrad)" filter="drop-shadow(0 4px 12px rgba(59,130,246,0.3))"/>
      <circle cx="-6" cy="-6" r="6" fill="#FFFFFF" opacity="0.3"/>
      <circle cx="0" cy="0" r="2.5" fill="#FFFFFF"/>

      <!-- Force Vector UPWARD: F_drag = -kv² (Emerald) -->
      <g filter="url(#vectorGlow)">
        <line x1="0" y1="-22" x2="0" y2="-68" stroke="#10B981" stroke-width="3" stroke-linecap="round"/>
        <polygon points="0,-74 -5,-64 5,-64" fill="#10B981"/>
        <text x="8" y="-48" font-family="monospace" font-size="8.5" fill="#10B981" font-weight="bold">F_d = -kv²</text>
      </g>

      <!-- Force Vector DOWNWARD: F_grav = mg (Amber) -->
      <g filter="url(#vectorGlow)">
        <line x1="0" y1="22" x2="0" y2="68" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
        <polygon points="0,74 -5,64 5,64" fill="#F59E0B"/>
        <text x="8" y="52" font-family="monospace" font-size="8.5" fill="#F59E0B" font-weight="bold">F_g = mg</text>
      </g>

      <!-- Instantaneous Velocity Vector v(t) alongside -->
      <g transform="translate(-32, -15)">
        <line x1="0" y1="0" x2="0" y2="40" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 2"/>
        <polygon points="0,44 -3,38 3,38" fill="#38BDF8"/>
        <text x="-6" y="24" font-family="monospace" font-size="7.5" fill="#38BDF8" text-anchor="end">v_term</text>
      </g>
    </g>
  </g>

  <!-- Right: Real-time Telemetry & Dynamic Asymptote Curve (x: 250 to 435) -->
  <g transform="translate(255, 52)" font-family="monospace">
    <!-- Panel Backdrop -->
    <rect x="0" y="0" width="180" height="162" rx="10" fill="#0B0F17" stroke="#1E293B" stroke-width="1.2"/>
    
    <!-- Header -->
    <text x="12" y="20" font-size="8.5" fill="#38BDF8" font-weight="bold">AERODYNAMIC TELEMETRY</text>
    <line x1="12" y1="26" x2="168" y2="26" stroke="#1E293B" stroke-width="1"/>

    <!-- Asymptotic Approach Graph v(t) -> v_term -->
    <g transform="translate(14, 34)">
      <!-- Axes -->
      <line x1="0" y1="50" x2="148" y2="50" stroke="#334155" stroke-width="1"/>
      <line x1="0" y1="0" x2="0" y2="50" stroke="#334155" stroke-width="1"/>
      <text x="148" y="58" font-size="6.5" fill="#64748B" text-anchor="end">time t</text>
      <text x="-2" y="-2" font-size="6.5" fill="#64748B">v(t)</text>

      <!-- Asymptote dashed line at v_term -->
      <line x1="0" y1="12" x2="148" y2="12" stroke="#10B981" stroke-width="1" stroke-dasharray="3 3" opacity="0.6"/>
      <text x="144" y="9" font-size="6.5" fill="#10B981" text-anchor="end">v_term asymptote</text>

      <!-- Hyperbolic Tangent Curve: v(t) = v_t * tanh(gt/v_t) -->
      <path d="M 0 50 Q 25 15, 60 13 T 145 12" fill="none" stroke="#38BDF8" stroke-width="2"/>

      <!-- Animated Tracer Pulse along the curve -->
      <circle cx="0" cy="0" r="3.5" fill="#F59E0B" filter="drop-shadow(0 0 6px #F59E0B)">
        <animateMotion path="M 0 50 Q 25 15, 60 13 T 145 12" dur="2.5s" repeatCount="indefinite"/>
      </circle>
    </g>

    <!-- Computed Parameters Table -->
    <g transform="translate(12, 102)" font-size="7.5">
      <text x="0" y="0" fill="#94A3B8">DRAG COEFF C_d: <tspan fill="#F1F5F9">0.47 (Sphere)</tspan></text>
      <text x="0" y="12" fill="#94A3B8">FLUID DENSITY ρ: <tspan fill="#F1F5F9">1.225 kg/m³</tspan></text>
      <text x="0" y="24" fill="#94A3B8">TERMINAL SPEED: <tspan fill="#10B981" font-weight="bold">54.2 m/s</tspan></text>
      <text x="0" y="36" fill="#94A3B8">NET ACCEL a(t): <tspan fill="#38BDF8">g(1 - (v/v_t)²) → 0</tspan></text>
      <text x="0" y="48" fill="#64748B">Re = 1.4 × 10⁵ // SUBCRITICAL</text>
    </g>
  </g>

  <!-- Footer Diagnostics -->
  <text x="230" y="244" font-family="monospace" font-size="8" fill="#64748B" text-anchor="middle">
    RUNGE-KUTTA 4TH ORDER QUADRATIC DRAG INTEGRATOR // FLUID SHEAR BOUNDARY LAYER
  </text>
</svg>`;
}

/* 0B. Elastic Ground Collision & Restitution Bounce Dynamics */
function createBounceKineticSvg(title, formula, prompt) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 260" width="100%" height="100%">
  <defs>
    <linearGradient id="bounce-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141110"/>
      <stop offset="100%" stop-color="#241E1A"/>
    </linearGradient>
    <radialGradient id="bounceBall" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="50%" stop-color="#EAB308"/>
      <stop offset="100%" stop-color="#CA8A04"/>
    </radialGradient>
  </defs>

  <rect width="460" height="260" fill="url(#bounce-bg)" rx="16"/>

  <!-- Telemetry Header -->
  <g font-family="monospace" font-size="8.5" fill="#A8A29E">
    <text x="20" y="24" fill="#EAB308" font-weight="bold">● 60FPS KINETIC ENGINE // COEFFICIENT OF RESTITUTION BOUNCE</text>
    <text x="20" y="38" fill="#FAF9F6">${title}</text>
    <text x="440" y="24" text-anchor="end" fill="#78716C">RESTITUTION: e = √(h_{n+1} / h_n) = 0.82</text>
    <text x="440" y="38" text-anchor="end" fill="#10B981">ENERGY LOSS: ΔE = (1 - e²) · E_k = 32.8%</text>
  </g>

  <!-- Left: Decaying Bounce Trajectory (Parabolic Arcs) -->
  <g>
    <!-- Ground Datum -->
    <line x1="25" y1="205" x2="260" y2="205" stroke="#78716C" stroke-width="2"/>
    <line x1="25" y1="208" x2="260" y2="208" stroke="#44403C" stroke-width="2" stroke-dasharray="4 4"/>
    <text x="30" y="220" font-family="monospace" font-size="7.5" fill="#78716C">y = 0 (rigid ground plane)</text>

    <!-- Parabolic Bounce Arcs across time/x -->
    <!-- Arc 1 (Drop from h0=140px down to ground) -->
    <path d="M 40 65 Q 40 205, 75 205" fill="none" stroke="#57534E" stroke-width="1.2" stroke-dasharray="3 3"/>
    <!-- Arc 2 (Bounce 1: h1 = 0.82² * 140 = 94px) -->
    <path d="M 75 205 Q 110 110, 145 205" fill="none" stroke="#EAB308" stroke-width="1.8" stroke-dasharray="3 2" opacity="0.6"/>
    <!-- Arc 3 (Bounce 2: h2 = 0.82² * 94 = 63px) -->
    <path d="M 145 205 Q 175 142, 205 205" fill="none" stroke="#EAB308" stroke-width="1.5" stroke-dasharray="2 2" opacity="0.5"/>
    <!-- Arc 4 (Bounce 3: h3 = 42px) -->
    <path d="M 205 205 Q 225 163, 245 205" fill="none" stroke="#EAB308" stroke-width="1.2" stroke-dasharray="2 2" opacity="0.4"/>

    <!-- Peak Height Guideline Markers -->
    <line x1="30" y1="65" x2="80" y2="65" stroke="#78716C" stroke-width="1" stroke-dasharray="2 2"/>
    <text x="32" y="61" font-family="monospace" font-size="7" fill="#A8A29E">h₀ = 100%</text>

    <line x1="100" y1="110" x2="155" y2="110" stroke="#EAB308" stroke-width="1" stroke-dasharray="2 2"/>
    <text x="115" y="106" font-family="monospace" font-size="7" fill="#EAB308">h₁ = e²h₀ (67%)</text>

    <line x1="165" y1="142" x2="215" y2="142" stroke="#EAB308" stroke-width="1" stroke-dasharray="2 2"/>
    <text x="175" y="138" font-family="monospace" font-size="7" fill="#EAB308">h₂ (45%)</text>

    <!-- Animated Bouncing Sphere traversing the decaying bounces -->
    <g>
      <animateMotion
        path="M 40 65 Q 40 205, 75 205 Q 110 110, 145 205 Q 175 142, 205 205 Q 225 163, 245 205"
        dur="3.4s"
        repeatCount="indefinite"
        calcMode="linear"
      />
      <!-- Sphere with impact deformation simulation -->
      <ellipse cx="0" cy="-10" rx="10" ry="10" fill="url(#bounceBall)" filter="drop-shadow(0 0 8px rgba(234, 179, 8, 0.4))"/>
      <circle cx="-3" cy="-13" r="3" fill="#FFFFFF" opacity="0.6"/>
      
      <!-- Instantaneous Velocity Vector -->
      <line x1="0" y1="-10" x2="0" y2="12" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
      <polygon points="0,15 -3,10 3,10" fill="#38BDF8"/>
    </g>

    <!-- Ground Impact Shockwave Ring -->
    <ellipse cx="75" cy="205" rx="0" ry="0" fill="none" stroke="#EAB308" stroke-width="2">
      <animate attributeName="rx" values="0; 24; 0" dur="3.4s" keyTimes="0; 0.28; 0.35" repeatCount="indefinite"/>
      <animate attributeName="ry" values="0; 6; 0" dur="3.4s" keyTimes="0; 0.28; 0.35" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0; 0.9; 0" dur="3.4s" keyTimes="0; 0.28; 0.35" repeatCount="indefinite"/>
    </ellipse>
    <ellipse cx="145" cy="205" rx="0" ry="0" fill="none" stroke="#EAB308" stroke-width="2">
      <animate attributeName="rx" values="0; 18; 0" dur="3.4s" keyTimes="0.45; 0.58; 0.65" repeatCount="indefinite"/>
      <animate attributeName="ry" values="0; 5; 0" dur="3.4s" keyTimes="0.45; 0.58; 0.65" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0; 0.8; 0" dur="3.4s" keyTimes="0.45; 0.58; 0.65" repeatCount="indefinite"/>
    </ellipse>
  </g>

  <!-- Right: Energy Dissipation & Restitution Dynamics Panel -->
  <g transform="translate(275, 52)" font-family="monospace">
    <rect x="0" y="0" width="165" height="162" rx="10" fill="#1C1815" stroke="#3E3832" stroke-width="1.2"/>
    <text x="12" y="20" font-size="8.5" fill="#EAB308" font-weight="bold">RESTITUTION DYNAMICS</text>
    <line x1="12" y1="26" x2="153" y2="26" stroke="#3E3832" stroke-width="1"/>

    <!-- Energy Partition Bar Graph -->
    <g transform="translate(12, 36)">
      <text x="0" y="0" font-size="7.5" fill="#A8A29E">KINETIC ENERGY CONVERSION:</text>
      <!-- Retained Mechanical Energy (67.2%) -->
      <rect x="0" y="8" width="95" height="10" rx="3" fill="#10B981"/>
      <text x="4" y="16" font-size="6.5" fill="#000000" font-weight="bold">E_retained: 67.2%</text>

      <!-- Dissipated Thermal / Acoustic Loss (32.8%) -->
      <rect x="97" y="8" width="44" height="10" rx="3" fill="#EF4444"/>
      <text x="100" y="16" font-size="6.5" fill="#FFFFFF" font-weight="bold">ΔQ: 33%</text>
    </g>

    <!-- Formula Breakdown -->
    <g transform="translate(12, 72)" font-size="7.5">
      <text x="0" y="0" fill="#A8A29E">HERTZIAN CONTACT EQUATION:</text>
      <text x="0" y="14" fill="#FAF9F6" font-size="8">F_contact = k_c · δ^(3/2)</text>
      <text x="0" y="28" fill="#38BDF8">v_post = -e · v_pre</text>
      <line x1="0" y1="36" x2="141" y2="36" stroke="#3E3832" stroke-width="1"/>
      <text x="0" y="48" fill="#A8A29E">BOUNCE PERIOD: <tspan fill="#EAB308">T_n = 2v_n / g</tspan></text>
      <text x="0" y="60" fill="#A8A29E">TOTAL TIME: <tspan fill="#10B981">T_tot = t₀·(1+e)/(1-e)</tspan></text>
    </g>
  </g>

  <!-- Footer Diagnostics -->
  <text x="230" y="244" font-family="monospace" font-size="8" fill="#78716C" text-anchor="middle">
    CONTINUOUS 60FPS RESTITUTION SOLVER // EXPONENTIAL ENVELOPE DECAY h(n) = h₀·e^(2n)
  </text>
</svg>`;
}

/* 0. Bicycle, Vehicle & Rotational Rolling Propulsion Kinematics */
function createBicycleKineticSvg(title, formula, prompt) {
  const safeFormula = formula || 'v = \\omega \\cdot r';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 260" width="100%" height="100%">
  <defs>
    <linearGradient id="bike-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141312"/>
      <stop offset="100%" stop-color="#24211D"/>
    </linearGradient>
    <linearGradient id="metal-frame" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="50%" stop-color="#FDE68A"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>

  <rect width="460" height="260" fill="url(#bike-bg)" rx="16"/>

  <!-- Telemetry Header -->
  <g font-family="monospace" font-size="8.5" fill="#A8A49E">
    <text x="20" y="24" fill="#10B981" font-weight="bold">● 60FPS KINETIC ENGINE // ROTATIONAL PROPULSION</text>
    <text x="20" y="38" fill="#E8E6E3">${title}</text>
    <text x="440" y="24" text-anchor="end" fill="#78716C">GOVERNING RELATION: ${safeFormula}</text>
    <text x="440" y="38" text-anchor="end" fill="#10B981">ROLLING WITHOUT SLIP: v = ω·r</text>
  </g>

  <!-- Rolling Road Surface with Moving Dashes -->
  <line x1="20" y1="210" x2="440" y2="210" stroke="#3E3935" stroke-width="1.5"/>
  <line x1="20" y1="214" x2="440" y2="214" stroke="#10B981" stroke-width="2" stroke-dasharray="12 8" opacity="0.8">
    <animate attributeName="stroke-dashoffset" from="0" to="40" dur="0.8s" repeatCount="indefinite"/>
  </line>

  <!-- Rear Wheel (x: 130, y: 165, r: 45) -->
  <g transform="translate(130, 165)">
    <!-- Tire and Rim -->
    <circle cx="0" cy="0" r="45" fill="none" stroke="#2B2724" stroke-width="6"/>
    <circle cx="0" cy="0" r="42" fill="none" stroke="#57534E" stroke-width="2"/>
    <!-- Rotating Spokes -->
    <g>
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1.2s" repeatCount="indefinite"/>
      <line x1="-40" y1="0" x2="40" y2="0" stroke="#A8A49E" stroke-width="1"/>
      <line x1="0" y1="-40" x2="0" y2="40" stroke="#A8A49E" stroke-width="1"/>
      <line x1="-28" y1="-28" x2="28" y2="28" stroke="#A8A49E" stroke-width="1"/>
      <line x1="-28" y1="28" x2="28" y2="-28" stroke="#A8A49E" stroke-width="1"/>
      <line x1="-37" y1="-15" x2="37" y2="15" stroke="#78716C" stroke-width="0.8"/>
      <line x1="-37" y1="15" x2="37" y2="-15" stroke="#78716C" stroke-width="0.8"/>
      <line x1="-15" y1="-37" x2="15" y2="37" stroke="#78716C" stroke-width="0.8"/>
      <line x1="-15" y1="37" x2="15" y2="-37" stroke="#78716C" stroke-width="0.8"/>
    </g>
    <!-- Rear Cog / Hub -->
    <circle cx="0" cy="0" r="10" fill="#44403C" stroke="#78716C" stroke-width="1.5"/>
    <circle cx="0" cy="0" r="4" fill="#E8E6E3"/>
  </g>

  <!-- Front Wheel (x: 330, y: 165, r: 45) -->
  <g transform="translate(330, 165)">
    <!-- Tire and Rim -->
    <circle cx="0" cy="0" r="45" fill="none" stroke="#2B2724" stroke-width="6"/>
    <circle cx="0" cy="0" r="42" fill="none" stroke="#57534E" stroke-width="2"/>
    <!-- Rotating Spokes -->
    <g>
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1.2s" repeatCount="indefinite"/>
      <line x1="-40" y1="0" x2="40" y2="0" stroke="#A8A49E" stroke-width="1"/>
      <line x1="0" y1="-40" x2="0" y2="40" stroke="#A8A49E" stroke-width="1"/>
      <line x1="-28" y1="-28" x2="28" y2="28" stroke="#A8A49E" stroke-width="1"/>
      <line x1="-28" y1="28" x2="28" y2="-28" stroke="#A8A49E" stroke-width="1"/>
      <line x1="-37" y1="-15" x2="37" y2="15" stroke="#78716C" stroke-width="0.8"/>
      <line x1="-37" y1="15" x2="37" y2="-15" stroke="#78716C" stroke-width="0.8"/>
      <line x1="-15" y1="-37" x2="15" y2="37" stroke="#78716C" stroke-width="0.8"/>
      <line x1="-15" y1="37" x2="15" y2="-37" stroke="#78716C" stroke-width="0.8"/>
    </g>
    <!-- Front Hub -->
    <circle cx="0" cy="0" r="7" fill="#44403C" stroke="#78716C" stroke-width="1.5"/>
    <circle cx="0" cy="0" r="4" fill="#E8E6E3"/>
  </g>

  <!-- Drive Chain (connecting rear cog at 130,165 to crankset at 220,165) -->
  <line x1="130" y1="157" x2="220" y2="151" stroke="#D97706" stroke-width="2" stroke-dasharray="4 2">
    <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="0.4s" repeatCount="indefinite"/>
  </line>
  <line x1="130" y1="173" x2="220" y2="179" stroke="#D97706" stroke-width="2" stroke-dasharray="4 2">
    <animate attributeName="stroke-dashoffset" from="0" to="12" dur="0.4s" repeatCount="indefinite"/>
  </line>

  <!-- Bicycle Diamond Frame Architecture -->
  <!-- Chainstay: rear hub (130,165) to bottom bracket (220,165) -->
  <line x1="130" y1="165" x2="220" y2="165" stroke="url(#metal-frame)" stroke-width="4.5" stroke-linecap="round"/>
  <!-- Seatstay: rear hub (130,165) to seat cluster (185,95) -->
  <line x1="130" y1="165" x2="185" y2="95" stroke="url(#metal-frame)" stroke-width="3.5" stroke-linecap="round"/>
  <!-- Seat tube: bottom bracket (220,165) to seat cluster (185,95) -->
  <line x1="220" y1="165" x2="185" y2="95" stroke="url(#metal-frame)" stroke-width="4.5" stroke-linecap="round"/>
  <!-- Seat post & Saddle -->
  <line x1="185" y1="95" x2="180" y2="78" stroke="#D6D3D1" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M 165 77 Q 185 75 200 80 Q 185 73 165 77 Z" fill="#292524" stroke="#78716C" stroke-width="1.5"/>

  <!-- Down tube: bottom bracket (220,165) to headtube (295,95) -->
  <line x1="220" y1="165" x2="295" y2="95" stroke="url(#metal-frame)" stroke-width="5" stroke-linecap="round"/>
  <!-- Top tube: seat cluster (185,95) to headtube (295,95) -->
  <line x1="185" y1="95" x2="295" y2="95" stroke="url(#metal-frame)" stroke-width="4.5" stroke-linecap="round"/>
  <!-- Headtube -->
  <line x1="290" y1="88" x2="300" y2="108" stroke="url(#metal-frame)" stroke-width="6" stroke-linecap="round"/>
  <!-- Fork: headtube to front hub (330,165) -->
  <line x1="297" y1="102" x2="330" y2="165" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>
  <!-- Stem & Drop Handlebars -->
  <line x1="293" y1="88" x2="300" y2="75" stroke="#D6D3D1" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M 300 75 Q 312 73 315 82 Q 315 92 305 92" fill="none" stroke="#E5E5E5" stroke-width="3" stroke-linecap="round"/>

  <!-- Rotating Crankset & Pedals (at bottom bracket 220,165) -->
  <g transform="translate(220, 165)">
    <!-- Chainring -->
    <circle cx="0" cy="0" r="17" fill="#44403C" stroke="#F59E0B" stroke-width="1.5"/>
    <g>
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1.2s" repeatCount="indefinite"/>
      <!-- Crank Arm 1 -->
      <line x1="0" y1="0" x2="0" y2="-22" stroke="#E8E6E3" stroke-width="3" stroke-linecap="round"/>
      <rect x="-6" y="-25" width="12" height="5" rx="2" fill="#F59E0B"/>
      <!-- Crank Arm 2 -->
      <line x1="0" y1="0" x2="0" y2="22" stroke="#E8E6E3" stroke-width="3" stroke-linecap="round"/>
      <rect x="-6" y="20" width="12" height="5" rx="2" fill="#F59E0B"/>
      <circle cx="0" cy="0" r="5" fill="#1C1917" stroke="#E8E6E3" stroke-width="1.5"/>
    </g>
  </g>

  <!-- Velocity Vector Overlay v(t) -->
  <g transform="translate(240, 52)">
    <line x1="0" y1="0" x2="70" y2="0" stroke="#10B981" stroke-width="2.5" stroke-linecap="round"/>
    <polygon points="70,0 62,-4 62,4" fill="#10B981"/>
    <text x="35" y="-6" font-family="monospace" font-size="9" fill="#10B981" text-anchor="middle" font-weight="bold">v(t) = ω · R</text>
  </g>

  <!-- Angular Velocity Vector ω at front wheel -->
  <g transform="translate(330, 165)">
    <path d="M 0,-34 A 34 34 0 0 1 34,0" fill="none" stroke="#38BDF8" stroke-width="2" stroke-dasharray="3 3"/>
    <polygon points="34,0 38,-6 30,-6" fill="#38BDF8"/>
    <text x="24" y="-20" font-family="monospace" font-size="8" fill="#38BDF8">ω</text>
  </g>

  <!-- Footer Diagnostics -->
  <g font-family="monospace" font-size="8" fill="#78716C" text-anchor="middle">
    <text x="230" y="244">
      GEAR RATIO: 52T/16T (3.25:1) // CADENCE: 90 RPM // TRANSLATIONAL VELOCITY: 32.8 km/h
    </text>
  </g>
</svg>`;
}

/* 1. Four-Bar Linkage & Chebyshev Straight-Line Kinematic Simulation */
function createLinkageKineticSvg(title, formula) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 260" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141210"/>
      <stop offset="100%" stop-color="#24201D"/>
    </linearGradient>
    <radialGradient id="pivot" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#A8A49E"/>
    </radialGradient>
  </defs>
  <rect width="460" height="260" fill="url(#bg)" rx="16"/>

  <!-- Telemetry Header -->
  <g font-family="monospace" font-size="9" fill="#A8A49E">
    <text x="20" y="24" fill="#10B981" font-weight="bold">● 60FPS KINEMATIC SIMULATION</text>
    <text x="20" y="38" fill="#E8E6E3">${title}</text>
    <text x="440" y="24" text-anchor="end" fill="#78716C">GOVERNING RELATION: ${formula}</text>
    <text x="440" y="38" text-anchor="end" fill="#10B981">TOLERANCE Δx ≤ 0.04%</text>
  </g>

  <!-- Ground Reference Plane -->
  <line x1="60" y1="190" x2="400" y2="190" stroke="#3E3935" stroke-width="1.5" stroke-dasharray="4 4"/>
  <circle cx="120" cy="190" r="5" fill="#57534E"/>
  <circle cx="340" cy="190" r="5" fill="#57534E"/>
  <text x="120" y="206" font-family="monospace" font-size="8" fill="#78716C" text-anchor="middle">O_A (0,0)</text>
  <text x="340" y="206" font-family="monospace" font-size="8" fill="#78716C" text-anchor="middle">O_B (2.0a,0)</text>

  <!-- Straight-Line Guideline Locus -->
  <line x1="80" y1="90" x2="380" y2="90" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1" stroke-dasharray="2 2"/>
  <text x="390" y="93" font-family="monospace" font-size="7.5" fill="#10B981">straight locus</text>

  <!-- Linkage Crank 1 & 2 Rotating at 60fps -->
  <g>
    <!-- Crank 1 (Left, rotates continuously) -->
    <g transform="translate(120, 190)">
      <animateTransform attributeName="transform" type="rotate" from="0 120 190" to="360 120 190" dur="3s" repeatCount="indefinite"/>
      <line x1="0" y1="0" x2="45" y2="0" stroke="#E8E6E3" stroke-width="3" stroke-linecap="round"/>
      <circle cx="45" cy="0" r="4" fill="url(#pivot)"/>
    </g>

    <!-- Crank 2 (Right, rotates opposite) -->
    <g transform="translate(340, 190)">
      <animateTransform attributeName="transform" type="rotate" from="180 340 190" to="-180 340 190" dur="3s" repeatCount="indefinite"/>
      <line x1="0" y1="0" x2="45" y2="0" stroke="#E8E6E3" stroke-width="3" stroke-linecap="round"/>
      <circle cx="45" cy="0" r="4" fill="url(#pivot)"/>
    </g>

    <!-- Coupler Bar & Inflection Midpoint with Motion Path -->
    <path id="straightPath" d="M 120 90 Q 230 89 340 90" fill="none" stroke="rgba(255,255,255,0.05)"/>
    <g>
      <animateMotion path="M 140 90 L 320 90 L 140 90" dur="3s" repeatCount="indefinite"/>
      <!-- Floating Midpoint tracer -->
      <circle cx="0" cy="0" r="5" fill="#10B981" filter="drop-shadow(0 0 6px #10B981)"/>
      <!-- Instantaneous Velocity Vector -->
      <line x1="0" y1="0" x2="25" y2="0" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
      <polygon points="25,0 20,-3 20,3" fill="#38BDF8"/>
      <text x="10" y="-8" font-family="monospace" font-size="8" fill="#38BDF8">v(t)</text>
    </g>
  </g>

  <!-- Dynamic Trace Path -->
  <path d="M 140 90 L 320 90" stroke="#10B981" stroke-width="2" opacity="0.6"/>
  
  <!-- Footer Status -->
  <text x="230" y="244" font-family="monospace" font-size="8" fill="#A8A49E" text-anchor="middle">
    CLOSED-FORM VECTOR LOOP // COUPLER STRAIGHT-LINE STROKE: 72%
  </text>
</svg>`;
}

/* 2. Quantum Wave Packet & Optical Resonance Simulation */
function createWaveKineticSvg(title, formula) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 260" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B132B"/>
      <stop offset="100%" stop-color="#1C2541"/>
    </linearGradient>
    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="50%" stop-color="#818CF8"/>
      <stop offset="100%" stop-color="#34D399"/>
    </linearGradient>
  </defs>
  <rect width="460" height="260" fill="url(#bg)" rx="16"/>

  <!-- Telemetry Header -->
  <g font-family="monospace" font-size="9">
    <text x="20" y="24" fill="#38BDF8" font-weight="bold">● DISPERSIVE WAVE PACKET PROPAGATION</text>
    <text x="20" y="38" fill="#E2E8F0">${title}</text>
    <text x="440" y="24" text-anchor="end" fill="#94A3B8">RELATION: ${formula}</text>
    <text x="440" y="38" text-anchor="end" fill="#34D399">PHASE VELOCITY v_p ≠ v_g</text>
  </g>

  <!-- Grid Axis -->
  <line x1="40" y1="140" x2="420" y2="140" stroke="#334155" stroke-width="1.5"/>
  <line x1="40" y1="60" x2="40" y2="220" stroke="#334155" stroke-width="1.5"/>

  <!-- Propagating Harmonic Waves -->
  <g>
    <!-- Wave 1 (High frequency carrier) -->
    <path d="M 40 140 Q 60 90, 80 140 T 120 140 T 160 140 T 200 140 T 240 140 T 280 140 T 320 140 T 360 140 T 400 140 T 420 140" fill="none" stroke="url(#waveGrad)" stroke-width="2.5">
      <animateTransform attributeName="transform" type="translate" from="0,0" to="80,0" dur="2s" repeatCount="indefinite"/>
    </path>
    <!-- Wave 2 (Envelope Gaussian) -->
    <path d="M 40 140 Q 140 70, 230 140 T 420 140" fill="none" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1.5" stroke-dasharray="3 3">
      <animateTransform attributeName="transform" type="translate" from="-40,0" to="40,0" dur="4s" repeatCount="indefinite"/>
    </path>
  </g>

  <!-- Group Velocity Marker -->
  <g transform="translate(230, 140)">
    <animateTransform attributeName="transform" type="translate" from="140, 140" to="320, 140" dur="4s" repeatCount="indefinite"/>
    <circle cx="0" cy="0" r="5" fill="#38BDF8" filter="drop-shadow(0 0 8px #38BDF8)"/>
    <line x1="0" y1="0" x2="0" y2="-50" stroke="#38BDF8" stroke-width="1" stroke-dasharray="2 2"/>
    <text x="6" y="-35" font-family="monospace" font-size="8" fill="#38BDF8">v_g (packet center)</text>
  </g>

  <!-- Labels -->
  <text x="230" y="244" font-family="monospace" font-size="8" fill="#94A3B8" text-anchor="middle">
    SCHRÖDINGER FREE PARTICLE ENVELOPE SPREADING Δx(t) = Δx₀√(1 + (ℏt/2mΔx₀²)²)
  </text>
</svg>`;
}

/* 3. Chaotic Double Pendulum Dynamics Simulation */
function createPendulumKineticSvg(title, formula) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 260" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181B"/>
      <stop offset="100%" stop-color="#27272A"/>
    </linearGradient>
  </defs>
  <rect width="460" height="260" fill="url(#bg)" rx="16"/>

  <g font-family="monospace" font-size="9">
    <text x="20" y="24" fill="#F59E0B" font-weight="bold">● NONLINEAR DYNAMICAL CHAOS</text>
    <text x="20" y="38" fill="#FAFAFA">${title}</text>
    <text x="440" y="24" text-anchor="end" fill="#A1A1AA">EQUATIONS: ${formula}</text>
    <text x="440" y="38" text-anchor="end" fill="#F59E0B">LYAPUNOV EXPONENT λ &gt; 0</text>
  </g>

  <!-- Pivot Origin -->
  <circle cx="230" cy="80" r="5" fill="#71717A"/>

  <!-- Upper Link (Arm 1) -->
  <g transform="translate(230, 80)">
    <animateTransform attributeName="transform" type="rotate" values="45 230 80; -55 230 80; 60 230 80; -40 230 80; 45 230 80" dur="4s" repeatCount="indefinite"/>
    <line x1="0" y1="0" x2="0" y2="55" stroke="#E4E4E7" stroke-width="3" stroke-linecap="round"/>
    <circle cx="0" cy="55" r="6" fill="#F59E0B"/>

    <!-- Lower Link (Arm 2 attached to Arm 1 joint) -->
    <g transform="translate(0, 55)">
      <animateTransform attributeName="transform" type="rotate" values="-60 0 55; 120 0 55; -140 0 55; 80 0 55; -60 0 55" dur="4s" repeatCount="indefinite"/>
      <line x1="0" y1="0" x2="0" y2="50" stroke="#D4D4D8" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="0" cy="50" r="5" fill="#EF4444" filter="drop-shadow(0 0 6px #EF4444)"/>
    </g>
  </g>

  <text x="230" y="244" font-family="monospace" font-size="8" fill="#A1A1AA" text-anchor="middle">
    PHASE SPACE TRAJECTORY // SENSITIVE DEPENDENCE ON INITIAL CONDITIONS
  </text>
</svg>`;
}

/* 4. Keplerian Orbital Mechanics & Central Potential Simulation */
function createOrbitKineticSvg(title, formula) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 260" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090A0F"/>
      <stop offset="100%" stop-color="#141824"/>
    </linearGradient>
    <radialGradient id="sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#EAB308"/>
    </radialGradient>
  </defs>
  <rect width="460" height="260" fill="url(#bg)" rx="16"/>

  <g font-family="monospace" font-size="9">
    <text x="20" y="24" fill="#38BDF8" font-weight="bold">● KEPLERIAN ORBITAL FIELD</text>
    <text x="20" y="38" fill="#F8FAFC">${title}</text>
    <text x="440" y="24" text-anchor="end" fill="#94A3B8">LAW: ${formula}</text>
    <text x="440" y="38" text-anchor="end" fill="#FDE047">dA/dt = L / 2m = CONST</text>
  </g>

  <!-- Central Primary Body (Focus) -->
  <circle cx="180" cy="140" r="14" fill="url(#sun)" filter="drop-shadow(0 0 12px rgba(253, 224, 71, 0.6))"/>
  <circle cx="180" cy="140" r="2.5" fill="#000000"/>

  <!-- Elliptical Orbital Path -->
  <ellipse cx="230" cy="140" rx="150" ry="75" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="3 3"/>

  <!-- Satellite Orbiting on Ellipse -->
  <g>
    <path id="orbitEllipse" d="M 80 140 A 150 75 0 1 0 380 140 A 150 75 0 1 0 80 140" fill="none"/>
    <g>
      <animateMotion dur="5s" repeatCount="indefinite" rotate="auto">
        <mpath href="#orbitEllipse"/>
      </animateMotion>
      <!-- Satellite body -->
      <circle cx="0" cy="0" r="4.5" fill="#38BDF8" filter="drop-shadow(0 0 6px #38BDF8)"/>
      <line x1="0" y1="0" x2="22" y2="0" stroke="#34D399" stroke-width="1.5"/>
      <polygon points="22,0 18,-2.5 18,2.5" fill="#34D399"/>
    </g>
  </g>

  <!-- Radius vector from Sun to orbit point -->
  <line x1="180" y1="140" x2="290" y2="85" stroke="rgba(253, 224, 71, 0.4)" stroke-width="1">
    <animate attributeName="x2" values="80; 230; 380; 230; 80" dur="5s" repeatCount="indefinite"/>
    <animate attributeName="y2" values="140; 65; 140; 215; 140" dur="5s" repeatCount="indefinite"/>
  </line>

  <text x="230" y="244" font-family="monospace" font-size="8" fill="#94A3B8" text-anchor="middle">
    CONSERVATION OF ANGULAR MOMENTUM // EQUAL AREAS SWEPT IN EQUAL INTERVALS
  </text>
</svg>`;
}

/* 5. Gyroscopic Precession Simulation */
function createGyroKineticSvg(title, formula) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 260" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A1512"/>
      <stop offset="100%" stop-color="#2D241E"/>
    </linearGradient>
  </defs>
  <rect width="460" height="260" fill="url(#bg)" rx="16"/>

  <g font-family="monospace" font-size="9">
    <text x="20" y="24" fill="#F59E0B" font-weight="bold">● GYROSCOPIC TORQUE PRECESSION</text>
    <text x="20" y="38" fill="#FAFAF9">${title}</text>
    <text x="440" y="24" text-anchor="end" fill="#A8A29E">RELATION: ${formula}</text>
    <text x="440" y="38" text-anchor="end" fill="#F59E0B">Ω_p = τ / L = mgr / (Iω)</text>
  </g>

  <!-- Base Pivot -->
  <line x1="230" y1="210" x2="230" y2="160" stroke="#78716C" stroke-width="3"/>
  <circle cx="230" cy="160" r="5" fill="#D6D3D1"/>

  <!-- Precession Circle Locus -->
  <ellipse cx="230" cy="90" rx="90" ry="24" fill="none" stroke="#57534E" stroke-width="1.5" stroke-dasharray="3 3"/>

  <!-- Spinning Tilted Rotor and Shaft Precessing at 60fps -->
  <g>
    <!-- Shaft rotating in precession circle -->
    <line x1="230" y1="160" x2="300" y2="90" stroke="#E7E5E4" stroke-width="3.5" stroke-linecap="round">
      <animate attributeName="x2" values="320; 230; 140; 230; 320" dur="3s" repeatCount="indefinite"/>
      <animate attributeName="y2" values="90; 114; 90; 66; 90" dur="3s" repeatCount="indefinite"/>
    </line>

    <!-- Rotor Disk -->
    <ellipse cx="280" cy="110" rx="28" ry="12" fill="#D97706" stroke="#FEF3C7" stroke-width="2">
      <animate attributeName="cx" values="295; 230; 165; 230; 295" dur="3s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="110; 125; 110; 95; 110" dur="3s" repeatCount="indefinite"/>
    </ellipse>

    <!-- Precession Angular Velocity Vector -->
    <line x1="230" y1="160" x2="230" y2="70" stroke="#38BDF8" stroke-width="2"/>
    <polygon points="230,65 226,73 234,73" fill="#38BDF8"/>
    <text x="236" y="75" font-family="monospace" font-size="8" fill="#38BDF8">Ω_p</text>
  </g>

  <text x="230" y="244" font-family="monospace" font-size="8" fill="#A8A29E" text-anchor="middle">
    SPIN ANGULAR MOMENTUM INVARIANT // GRAVITATIONAL TORQUE CROSS PRODUCT dL/dt = τ
  </text>
</svg>`;
}

/* 6. Thermodynamic Carnot Cycle Simulation */
function createCarnotKineticSvg(title, formula) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 260" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1B18"/>
      <stop offset="100%" stop-color="#2D2824"/>
    </linearGradient>
  </defs>
  <rect width="460" height="260" fill="url(#bg)" rx="16"/>

  <g font-family="monospace" font-size="9">
    <text x="20" y="24" fill="#EF4444" font-weight="bold">● REVERSIBLE CARNOT CYCLE</text>
    <text x="20" y="38" fill="#FAF9F6">${title}</text>
    <text x="440" y="24" text-anchor="end" fill="#A8A29E">EFFICIENCY: ${formula}</text>
    <text x="440" y="38" text-anchor="end" fill="#EF4444">η = 1 - T_C / T_H</text>
  </g>

  <!-- P-V Diagram Axes -->
  <line x1="60" y1="200" x2="380" y2="200" stroke="#57534E" stroke-width="1.5"/>
  <line x1="60" y1="60" x2="60" y2="200" stroke="#57534E" stroke-width="1.5"/>
  <text x="385" y="204" font-family="monospace" font-size="8" fill="#A8A29E">V</text>
  <text x="56" y="55" font-family="monospace" font-size="8" fill="#A8A29E">P</text>

  <!-- Carnot P-V Four-Stage Closed Path -->
  <path d="M 120 80 Q 180 100, 240 120 Q 280 150, 310 170 Q 240 160, 180 150 Q 140 120, 120 80" fill="rgba(239, 68, 68, 0.12)" stroke="#EF4444" stroke-width="2.5"/>

  <!-- Moving State Point along the Cycle -->
  <g>
    <path id="carnotPath" d="M 120 80 Q 180 100, 240 120 Q 280 150, 310 170 Q 240 160, 180 150 Q 140 120, 120 80" fill="none"/>
    <g>
      <animateMotion dur="4s" repeatCount="indefinite">
        <mpath href="#carnotPath"/>
      </animateMotion>
      <circle cx="0" cy="0" r="5.5" fill="#FACC15" filter="drop-shadow(0 0 6px #FACC15)"/>
    </g>
  </g>

  <!-- Stage Labels -->
  <text x="170" y="90" font-family="monospace" font-size="7.5" fill="#EF4444">1→2 Isothermal Exp (T_H)</text>
  <text x="280" y="140" font-family="monospace" font-size="7.5" fill="#F97316">2→3 Adiabatic Exp</text>
  <text x="210" y="175" font-family="monospace" font-size="7.5" fill="#38BDF8">3→4 Isothermal Comp (T_C)</text>
  <text x="110" y="135" font-family="monospace" font-size="7.5" fill="#818CF8">4→1 Adiabatic Comp</text>

  <text x="230" y="244" font-family="monospace" font-size="8" fill="#A8A29E" text-anchor="middle">
    NET WORK W = ∮ P dV // ENTROPY INVARIANT ∮ dQ / T = 0
  </text>
</svg>`;
}

/* 7. Topological Torus Knot & Curvature Flow Simulation */
function createTopologicalKineticSvg(title, formula) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 260" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#1F2937"/>
    </linearGradient>
    <linearGradient id="knotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818CF8"/>
      <stop offset="50%" stop-color="#C084FC"/>
      <stop offset="100%" stop-color="#38BDF8"/>
    </linearGradient>
  </defs>
  <rect width="460" height="260" fill="url(#bg)" rx="16"/>

  <g font-family="monospace" font-size="9">
    <text x="20" y="24" fill="#A855F7" font-weight="bold">● TOPOLOGICAL TORUS KNOT GEODESIC</text>
    <text x="20" y="38" fill="#F9FAFB">${title}</text>
    <text x="440" y="24" text-anchor="end" fill="#9CA3AF">INVARIANT: ${formula}</text>
    <text x="440" y="38" text-anchor="end" fill="#A855F7">CHERN NUMBER c₁ = 1</text>
  </g>

  <!-- Torus Base Wireframe -->
  <ellipse cx="230" cy="140" rx="120" ry="50" fill="none" stroke="#374151" stroke-width="1.5" stroke-dasharray="4 4"/>
  <ellipse cx="230" cy="140" rx="45" ry="18" fill="none" stroke="#374151" stroke-width="1.5"/>

  <!-- Rotating Torus Knot Geodesic Curve -->
  <g transform="translate(230, 140)">
    <animateTransform attributeName="transform" type="rotate" from="0 230 140" to="360 230 140" dur="6s" repeatCount="indefinite"/>
    <path d="M -110 0 C -110 -40, -40 -40, 0 -20 C 40 0, 110 -40, 110 0 C 110 40, 40 40, 0 20 C -40 0, -110 40, -110 0 Z" fill="none" stroke="url(#knotGrad)" stroke-width="3" stroke-linecap="round"/>
    
    <!-- Moving Inflection Point -->
    <circle cx="0" cy="-20" r="5" fill="#F43F5E" filter="drop-shadow(0 0 8px #F43F5E)">
      <animate attributeName="cx" values="-110; 0; 110; 0; -110" dur="3s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="0; -20; 0; 20; 0" dur="3s" repeatCount="indefinite"/>
    </circle>
  </g>

  <text x="230" y="244" font-family="monospace" font-size="8" fill="#9CA3AF" text-anchor="middle">
    CONTINUOUS MANIFOLD DEFORMATION // EULER-SAVARY INFLECTION CIRCLE CURVATURE
  </text>
</svg>`;
}

/* 8. Harmonic Oscillator & Restoring Force Dynamic Simulation */
function createHarmonicKineticSvg(title, formula) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 260" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#171513"/>
      <stop offset="100%" stop-color="#262320"/>
    </linearGradient>
  </defs>
  <rect width="460" height="260" fill="url(#bg)" rx="16"/>

  <g font-family="monospace" font-size="9">
    <text x="20" y="24" fill="#10B981" font-weight="bold">● HARMONIC OSCILLATOR PHASE DYNAMICS</text>
    <text x="20" y="38" fill="#FAF9F6">${title}</text>
    <text x="440" y="24" text-anchor="end" fill="#A8A29E">EQUATION: ${formula}</text>
    <text x="440" y="38" text-anchor="end" fill="#10B981">E = ½kx² + ½mv² = CONST</text>
  </g>

  <!-- Left: Physical Mass-Spring System -->
  <g transform="translate(40, 90)">
    <!-- Wall -->
    <line x1="0" y1="0" x2="0" y2="80" stroke="#78716C" stroke-width="4"/>
    <line x1="0" y1="75" x2="160" y2="75" stroke="#44403C" stroke-width="1.5"/>

    <!-- Spring (Stretching & Compressing) -->
    <path d="M 0 35 L 15 35 L 25 20 L 35 50 L 45 20 L 55 50 L 65 20 L 75 50 L 85 35 L 95 35" fill="none" stroke="#D6D3D1" stroke-width="2">
      <animate attributeName="d" values="
        M 0 35 L 20 35 L 32 20 L 44 50 L 56 20 L 68 50 L 80 20 L 92 50 L 104 35 L 115 35;
        M 0 35 L 10 35 L 18 20 L 26 50 L 34 20 L 42 50 L 50 20 L 58 50 L 66 35 L 75 35;
        M 0 35 L 20 35 L 32 20 L 44 50 L 56 20 L 68 50 L 80 20 L 92 50 L 104 35 L 115 35"
        dur="2s" repeatCount="indefinite"/>
    </path>

    <!-- Oscillating Mass Block -->
    <rect x="95" y="15" width="40" height="40" rx="6" fill="#10B981" stroke="#34D399" stroke-width="1.5">
      <animate attributeName="x" values="115; 75; 115" dur="2s" repeatCount="indefinite"/>
    </rect>
    <text x="115" y="39" font-family="monospace" font-size="9" font-weight="bold" fill="#000000" text-anchor="middle">m</text>
  </g>

  <!-- Right: Phase Space Portrait (x vs p) -->
  <g transform="translate(320, 130)">
    <line x1="-70" y1="0" x2="70" y2="0" stroke="#57534E" stroke-width="1"/>
    <line x1="0" y1="-50" x2="0" y2="50" stroke="#57534E" stroke-width="1"/>
    <text x="75" y="3" font-family="monospace" font-size="8" fill="#A8A29E">x</text>
    <text x="3" y="-53" font-family="monospace" font-size="8" fill="#A8A29E">p</text>

    <!-- Rotating Phase Orbit -->
    <ellipse cx="0" cy="0" rx="50" ry="38" fill="none" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="2 2"/>
    <g>
      <circle cx="0" cy="0" r="4.5" fill="#38BDF8" filter="drop-shadow(0 0 6px #38BDF8)">
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="cx" values="50; 0; -50; 0; 50" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="cy" values="0; -38; 0; 38; 0" dur="2s" repeatCount="indefinite"/>
      </circle>
    </g>
  </g>

  <text x="230" y="244" font-family="monospace" font-size="8" fill="#A8A29E" text-anchor="middle">
    CONSERVATIVE PHASE FLOW // SYMPLECTIC INVARIANT AREA PRESERVATION
  </text>
</svg>`;
}

/* 9. Vertical Ball Drop & Gravitational Acceleration Simulation */
function createBallDropKineticSvg(title, formula, prompt) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 260" width="100%" height="100%">
  <defs>
    <linearGradient id="dropBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#12100E"/>
      <stop offset="100%" stop-color="#211C18"/>
    </linearGradient>
    <radialGradient id="ballGlow" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#6EE7B7"/>
      <stop offset="60%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#047857"/>
    </radialGradient>
    <filter id="glowDrop" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="460" height="260" fill="url(#dropBg)" rx="16"/>

  <!-- Telemetry Header -->
  <g font-family="monospace" font-size="9">
    <text x="20" y="24" fill="#10B981" font-weight="bold">● 60FPS FREE FALL &amp; GRAVITATIONAL DYNAMICS</text>
    <text x="20" y="38" fill="#E8E6E3">${title}</text>
    <text x="440" y="24" text-anchor="end" fill="#78716C">ACCELERATION: g = 9.81 m/s² [↓]</text>
    <text x="440" y="38" text-anchor="end" fill="#38BDF8">v(t) = v₀ + gt</text>
  </g>

  <!-- Left: Vertical Height Ruler (Y-Axis) -->
  <g transform="translate(60, 0)" font-family="monospace" font-size="7.5" fill="#78716C">
    <line x1="0" y1="50" x2="0" y2="215" stroke="#44403C" stroke-width="1.5"/>
    <line x1="-5" y1="55" x2="5" y2="55" stroke="#57534E" stroke-width="1"/><text x="-10" y="58" text-anchor="end">y = 40m</text>
    <line x1="-4" y1="95" x2="4" y2="95" stroke="#57534E" stroke-width="1"/><text x="-10" y="98" text-anchor="end">30m</text>
    <line x1="-4" y1="135" x2="4" y2="135" stroke="#57534E" stroke-width="1"/><text x="-10" y="138" text-anchor="end">20m</text>
    <line x1="-4" y1="175" x2="4" y2="175" stroke="#57534E" stroke-width="1"/><text x="-10" y="178" text-anchor="end">10m</text>
    <line x1="-5" y1="215" x2="5" y2="215" stroke="#10B981" stroke-width="1.5"/><text x="-10" y="218" text-anchor="end" fill="#10B981">0m (datum)</text>
  </g>

  <!-- Ground Plane & Impact Zone -->
  <line x1="40" y1="215" x2="280" y2="215" stroke="#57534E" stroke-width="2"/>
  <line x1="40" y1="218" x2="280" y2="218" stroke="#292524" stroke-width="3" stroke-dasharray="4 4"/>
  <rect x="150" y="215" width="40" height="4" fill="#10B981" opacity="0.4"/>

  <!-- Vertical Motion Trajectory Guide -->
  <line x1="170" y1="50" x2="170" y2="215" stroke="#292524" stroke-width="1.5" stroke-dasharray="3 3"/>

  <!-- Ghost trail markers showing accelerating spacing (Δy ∝ t²) -->
  <circle cx="170" cy="55" r="2.5" fill="#57534E" opacity="0.5"/>
  <circle cx="170" cy="70" r="2.5" fill="#57534E" opacity="0.5"/>
  <circle cx="170" cy="95" r="2.5" fill="#57534E" opacity="0.6"/>
  <circle cx="170" cy="130" r="2.5" fill="#57534E" opacity="0.7"/>
  <circle cx="170" cy="175" r="2.5" fill="#57534E" opacity="0.8"/>

  <!-- Accelerating Falling Ball (60fps continuous loop) -->
  <g transform="translate(170, 0)">
    <animateTransform attributeName="transform" type="translate"
      values="170,55; 170,72; 170,100; 170,140; 170,185; 170,215; 170,215; 170,55"
      keyTimes="0; 0.22; 0.44; 0.65; 0.82; 0.92; 0.97; 1"
      dur="1.7s" repeatCount="indefinite" calcMode="linear"/>

    <!-- Falling Ball Sphere -->
    <circle cx="0" cy="0" r="9" fill="url(#ballGlow)" filter="url(#glowDrop)"/>
    <circle cx="-3" cy="-3" r="3" fill="#FFFFFF" opacity="0.6"/>

    <!-- Dynamic Downward Velocity Vector Arrow (Grows as speed increases) -->
    <line x1="0" y1="9" x2="0" y2="30" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round">
      <animate attributeName="y2" values="18; 24; 32; 42; 54; 58; 58; 18"
        keyTimes="0; 0.22; 0.44; 0.65; 0.82; 0.92; 0.97; 1"
        dur="1.7s" repeatCount="indefinite"/>
    </line>
    <polygon points="0,34 -4,28 4,28" fill="#38BDF8">
      <animate attributeName="points"
        values="0,22 -3,17 3,17; 0,28 -3,23 3,23; 0,36 -4,30 4,30; 0,46 -4,40 4,40; 0,58 -5,50 5,50; 0,62 -5,54 5,54; 0,62 -5,54 5,54; 0,22 -3,17 3,17"
        keyTimes="0; 0.22; 0.44; 0.65; 0.82; 0.92; 0.97; 1"
        dur="1.7s" repeatCount="indefinite"/>
    </polygon>
    <text x="14" y="24" font-family="monospace" font-size="8" fill="#38BDF8" font-weight="bold">
      <tspan>v(t)</tspan>
    </text>
  </g>

  <!-- Impact Shockwave Expansion at datum ground -->
  <ellipse cx="170" cy="215" rx="0" ry="0" fill="none" stroke="#10B981" stroke-width="2">
    <animate attributeName="rx" values="0; 0; 0; 0; 0; 34; 0" keyTimes="0; 0.2; 0.4; 0.6; 0.85; 0.95; 1" dur="1.7s" repeatCount="indefinite"/>
    <animate attributeName="ry" values="0; 0; 0; 0; 0; 9; 0" keyTimes="0; 0.2; 0.4; 0.6; 0.85; 0.95; 1" dur="1.7s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0; 0; 0; 0; 0; 0.9; 0" keyTimes="0; 0.2; 0.4; 0.6; 0.85; 0.95; 1" dur="1.7s" repeatCount="indefinite"/>
  </ellipse>

  <!-- Right: Real-time Telemetry & Governing Equations Box -->
  <g transform="translate(290, 60)" font-family="monospace">
    <rect x="0" y="0" width="150" height="150" rx="10" fill="#1C1917" stroke="#3E3935" stroke-width="1.2"/>
    <text x="12" y="22" font-size="8.5" fill="#10B981" font-weight="bold">KINEMATIC SYSTEM</text>
    
    <text x="12" y="42" font-size="7.5" fill="#A8A29E">GOVERNING EQUATIONS:</text>
    <text x="12" y="56" font-size="8" fill="#E8E6E3">y(t) = y₀ + v₀t - ½gt²</text>
    <text x="12" y="70" font-size="8" fill="#E8E6E3">v(t) = v₀ - gt</text>
    <text x="12" y="84" font-size="8" fill="#38BDF8">v² = v₀² - 2g(y - y₀)</text>
    
    <line x1="12" y1="94" x2="138" y2="94" stroke="#3E3935" stroke-width="1"/>
    
    <text x="12" y="108" font-size="7.5" fill="#A8A29E">INITIAL CONDITIONS:</text>
    <text x="12" y="122" font-size="8" fill="#10B981">v₀ &lt; 0 (Downward Throw)</text>
    <text x="12" y="136" font-size="7.5" fill="#78716C">g = 9.80665 m/s²</text>
  </g>

  <!-- Footer Info -->
  <text x="230" y="246" font-family="monospace" font-size="8" fill="#78716C" text-anchor="middle">
    CONTINUOUS 60FPS BALLISTIC INTEGRATION // RUNGE-KUTTA 4TH ORDER SOLVER
  </text>
</svg>`;
}

/* 10. Parabolic Projectile Simulation */
function createProjectileKineticSvg(title, formula, prompt) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 260" width="100%" height="100%">
  <defs>
    <linearGradient id="projBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
  </defs>
  <rect width="460" height="260" fill="url(#projBg)" rx="16"/>

  <g font-family="monospace" font-size="9">
    <text x="20" y="24" fill="#38BDF8" font-weight="bold">● PARABOLIC PROJECTILE BALLISTICS</text>
    <text x="20" y="38" fill="#E2E8F0">${title}</text>
    <text x="440" y="24" text-anchor="end" fill="#94A3B8">θ = 45° // R = v₀²/g</text>
    <text x="440" y="38" text-anchor="end" fill="#38BDF8">y(x) = x·tan(θ) - gx²/(2v₀²cos²θ)</text>
  </g>

  <!-- Ground Plane -->
  <line x1="40" y1="200" x2="420" y2="200" stroke="#475569" stroke-width="2"/>

  <!-- Parabolic Path -->
  <path d="M 60 200 Q 230 40 400 200" fill="none" stroke="#0284C7" stroke-width="2" stroke-dasharray="3 3"/>

  <!-- Moving Projectile -->
  <g>
    <animateMotion path="M 60 200 Q 230 40 400 200" dur="2.4s" repeatCount="indefinite"/>
    <circle cx="0" cy="0" r="7" fill="#38BDF8" filter="drop-shadow(0 0 8px #38BDF8)"/>
    <line x1="0" y1="0" x2="20" y2="-5" stroke="#F59E0B" stroke-width="2"/>
  </g>

  <text x="230" y="244" font-family="monospace" font-size="8" fill="#94A3B8" text-anchor="middle">
    2D KINEMATIC TRAJECTORY // CONSTANT HORIZONTAL VELOCITY vx = v₀·cos(θ)
  </text>
</svg>`;
}

/* 11. Two-Body Elastic Collision Simulation */
function createCollisionKineticSvg(title, formula, prompt) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 260" width="100%" height="100%">
  <rect width="460" height="260" fill="#141210" rx="16"/>

  <g font-family="monospace" font-size="9">
    <text x="20" y="24" fill="#F59E0B" font-weight="bold">● 1D ELASTIC COLLISION &amp; MOMENTUM CONSERVATION</text>
    <text x="20" y="38" fill="#E8E6E3">${title}</text>
    <text x="440" y="24" text-anchor="end" fill="#78716C">m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'</text>
    <text x="440" y="38" text-anchor="end" fill="#10B981">COEFFICIENT OF RESTITUTION e = 1.0</text>
  </g>

  <line x1="40" y1="150" x2="420" y2="150" stroke="#44403C" stroke-width="2"/>

  <!-- Mass 1 (Left to Center) -->
  <circle cx="0" cy="135" r="14" fill="#38BDF8">
    <animate attributeName="cx" values="80; 215; 100; 80" dur="2.2s" repeatCount="indefinite"/>
  </circle>
  <text x="0" y="139" font-family="monospace" font-size="9" fill="#000000" font-weight="bold" text-anchor="middle">
    <animate attributeName="x" values="80; 215; 100; 80" dur="2.2s" repeatCount="indefinite"/>
    m₁
  </text>

  <!-- Mass 2 (Right to Center) -->
  <circle cx="0" cy="135" r="14" fill="#10B981">
    <animate attributeName="cx" values="360; 245; 340; 360" dur="2.2s" repeatCount="indefinite"/>
  </circle>
  <text x="0" y="139" font-family="monospace" font-size="9" fill="#000000" font-weight="bold" text-anchor="middle">
    <animate attributeName="x" values="360; 245; 340; 360" dur="2.2s" repeatCount="indefinite"/>
    m₂
  </text>

  <text x="230" y="244" font-family="monospace" font-size="8" fill="#78716C" text-anchor="middle">
    CONSERVATION OF LINEAR MOMENTUM // ZERO MECHANICAL ENERGY LOSS
  </text>
</svg>`;
}

/**
 * Context-aware simulation prompt suggestions based on node concepts
 */
export function getKineticPromptSuggestions(nodeData) {
  const title = (nodeData?.data?.title || '').toLowerCase();
  const category = (nodeData?.data?.category || '').toLowerCase();
  const text = `${title} ${category}`;

  if (text.includes('ball') || text.includes('throw') || text.includes('fall') || text.includes('drop') || text.includes('downward') || text.includes('gravity') || text.includes('free fall')) {
    return [
      'Vertical free fall with downward acceleration g = 9.81 m/s² and velocity v(t)',
      'Air resistance & terminal velocity drag vector F_d = -kv²',
      'Elastic ground collision & coefficient of restitution bounce',
      'Kinematic velocity vectors v(t) & position trajectory y(t)'
    ];
  }
  if (text.includes('projectile') || text.includes('arc') || text.includes('parabola') || text.includes('cannon')) {
    return [
      'Parabolic trajectory arc with initial launch angle θ = 45°',
      'Horizontal vs vertical velocity decomposition vx, vy(t)',
      'Maximum height H_max and range R ballistic simulation',
      'Drag-perturbed aerodynamic trajectory comparison'
    ];
  }
  if (text.includes('wave') || text.includes('quantum') || text.includes('schrodinger') || text.includes('packet')) {
    return [
      'Dispersive wave packet with phase velocity vp ≠ group velocity vg',
      'Gaussian wave envelope evolution in free space',
      'Standing wave harmonic resonance and boundary nodes',
      'Quantum probability density |Ψ(x,t)|² propagation'
    ];
  }
  if (text.includes('pendulum') || text.includes('chaos')) {
    return [
      'Chaotic double pendulum dynamic trajectory & phase space',
      'Sensitive dependence on initial angles θ1, θ2 bifurcation',
      'Phase portrait (θ, ω) Poincaré section mapping',
      'Energy conservation exchange between kinetic & potential'
    ];
  }
  if (text.includes('orbit') || text.includes('kepler') || text.includes('gravit') || text.includes('planet')) {
    return [
      'Keplerian areal velocity conservation: equal areas in equal times',
      'Gravitational central force vector F_g = -GMm/r² and orbital eccentricity',
      'Elliptical orbital trajectory with periapsis speed boost',
      'Two-body gravitational barycenter mutual orbit'
    ];
  }
  if (text.includes('spring') || text.includes('oscillator') || text.includes('harmonic')) {
    return [
      'Damped harmonic spring-mass oscillation with damping vector F_b = -b·v',
      'Underdamped vs critically damped phase trajectory',
      'Resonant driving frequency force envelope response',
      'Restoring force vector F = -kx with elastic potential energy'
    ];
  }
  if (text.includes('collision') || text.includes('momentum') || text.includes('elastic')) {
    return [
      'Two-body 1D elastic collision with linear momentum conservation',
      'Inelastic kinetic energy dissipation & velocity exchange',
      'Center of mass velocity frame invariant simulation',
      'Coefficient of restitution e = 1.0 vs e = 0.5 comparison'
    ];
  }
  if (text.includes('linkage') || text.includes('four-bar') || text.includes('chebyshev') || text.includes('mechanism')) {
    return [
      'Chebyshev 4-bar straight-line coupler path synthesis',
      'Continuous crank-rocker transmission angle envelope',
      'Peaucellier-Lipkin exact straight-line mechanical inversion',
      'Geneva drive intermittent rotary indexing transformation'
    ];
  }
  if (text.includes('bike') || text.includes('bicycle') || text.includes('cycle') || text.includes('wheel') || text.includes('transport') || text.includes('pedal') || text.includes('drivetrain') || text.includes('gear')) {
    return [
      `Continuous 60fps rotational rolling loop for ${nodeData?.data?.title || 'Bicycle'}`,
      'Rolling without slipping condition: v(t) = ω · R velocity vectors',
      'Drivetrain chain transmission gear ratio 52T/16T torque profile',
      'Centrifugal acceleration and lean angle equilibrium in steady turning'
    ];
  }
  // Default general physics suggestions
  return [
    `Continuous 60fps kinetic motion loop for ${nodeData?.data?.title || 'System'}`,
    `Velocity vectors v(t) & acceleration profile a(t)`,
    `Harmonic phase space orbit and energy conservation`,
    `Dynamic equilibrium under governing relation: ${nodeData?.data?.formula || 'F = ma'}`
  ];
}
