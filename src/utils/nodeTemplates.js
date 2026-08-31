import { RELATIONSHIP_TYPES } from './colorTokens';

export const NODE_TEMPLATES = {
  website: {
    type: 'website',
    category: 'website // corpus',
    status: 'verified',
    width: 270,
    height: 210,
    defaultData: {
      title: 'arXiv: Chebyshev Kinematics',
      domain: 'arxiv.org',
      url: 'https://arxiv.org/abs/2307.12008',
      source: 'arXiv Repository (Cornell University)',
      institution: 'Cornell University Library & CS.RO',
      description:
        'Living web anchor node linking to Cornell arXiv preprint repository. Serves as primary topological origin for kinematic four-bar formulas and closed-form inflection circle derivations.',
      detailedSynthesis:
        'The living web anchor node maintains verified cryptographic signal provenance to the Cornell arXiv preprint server. It extracts structural kinematic constraints, parameter bounds, and closed-form inflection circle derivations for planar straight-line guidance mechanisms without mechanical sliding friction.',
      formula: '\\text{arXiv:2307.12008}\\;[\\text{cs.RO}]',
      formulaType: 'Canonical Archive Identifier',
      vitalStats: [
        { label: 'Corpus ID', value: 'arXiv:2307.12008' },
        { label: 'Domain', value: 'arxiv.org' },
        { label: 'Citation Index', value: 'h-14 / 84 citations' },
        { label: 'Verification', value: 'Cryptographic SHA-256' },
      ],
      formulas: [
        {
          id: 'f0',
          title: 'Primary Canonical Identifier',
          formula: '\\text{arXiv:2307.12008}\\;[\\text{cs.RO}]',
          type: 'Canonical Archive DOI',
          desc: 'Cornell preprint archive indexing under Robotics and Kinematic Optimization.',
        },
        {
          id: 'f1',
          title: 'Signal Extraction Entropy',
          formula: 'H(X) = -\\sum_{i=1}^n P(x_i)\\log_2 P(x_i)',
          type: 'Shannon Information Metric',
          desc: 'Measures high-confidence signal extraction density from raw HTML preprints.',
        },
      ],
      derivationSteps: [
        {
          step: 1,
          title: 'Preprint Signal Ingestion',
          formula: '\\mathcal{D}_{\\text{raw}} \\xrightarrow{\\text{Trafilatura}} \\mathcal{T}_{\\text{markdown}}',
          explanation: 'Clean extraction of title, abstract, mathematical notation, and DOI.',
        },
        {
          step: 2,
          title: 'Topological Parsing',
          formula: '\\mathcal{T}_{\\text{markdown}} \\to \\{N_{\\text{mechanism}}, E_{\\text{origin}}\\}',
          explanation: 'Extraction of four-bar link length ratios and boundary constraint equations.',
        },
      ],
      media: [
        {
          type: 'diagram',
          title: 'arXiv Preprint Header Card',
          caption: 'Verified cryptographic preprint signal anchor with instant extraction metadata.',
          visualType: 'website_preview',
        },
      ],
      targetedInquiries: [
        'Latest 2026 Chebyshev revisions',
        'Cross-reference with IEEE Robotics',
        'Topological parameter extraction',
      ],
      references: [
        {
          title: 'Chebyshev Kinematic Linkage in Ultra-High Vacuum Applications',
          source: 'Cornell arXiv Preprint Archive',
          url: 'https://arxiv.org/abs/2307.12008',
          year: '2023',
          doi: '10.48550/arXiv.2307.12008',
        },
      ],
    },
  },
  mechanism: {
    type: 'mechanism',
    category: 'mechanism // planar motion',
    status: 'peer reviewed',
    width: 280,
    height: 330,
    defaultData: {
      title: 'Chebyshev Kinematic Linkage',
      source: 'Applied Mechanics Lab // arXiv:2307.12008',
      institution: 'Applied Mechanics Laboratory (ETH Zürich)',
      url: 'https://arxiv.org/abs/2307.12008',
      description:
        'Four-bar linkage converting continuous rotary input into an approximate straight-line trajectory without sliding bearings.',
      detailedSynthesis:
        'The Chebyshev four-bar linkage converts continuous 360° rotary input into an approximate straight-line trajectory. By setting geometric link proportions to L₁ = L₂ = 2.5a, L₃ = a, and ground link L₄ = 2.0a, the mechanism eliminates sliding contact bearings entirely. This eradicates stick-slip hysteresis, particle shedding, and tribological wear in ultra-high vacuum semiconductor fabrication and cryogenic stages.',
      formula: 'F = \\frac{\\mu_0 \\cdot I_1 \\cdot I_2 \\cdot L}{2\\pi d}',
      formulaType: 'Electrodynamic & Kinematic Actuation Law',
      ratio: 'L / d = 2.50',
      tolerance: 'Δx ≤ 0.042%',
      vitalStats: [
        { label: 'Link Proportions', value: '2.5a : 1.0a : 2.5a : 2.0a' },
        { label: 'Straightness Deviation', value: 'Δx ≤ 0.042%' },
        { label: 'Kinematic Efficiency', value: '99.4% (Zero Sliding Friction)' },
        { label: 'Operating Mode', value: 'Planar Grashof Crank-Rocker' },
      ],
      formulas: [
        {
          id: 'f0',
          title: 'Planar Guidance Force Model',
          formula: 'F = \\frac{\\mu_0 \\cdot I_1 \\cdot I_2 \\cdot L}{2\\pi d}',
          type: 'Electrodynamic Drive Law',
          desc: 'Calculates magnetic drive force across parallel conductors in frictionless vacuum transport.',
        },
        {
          id: 'f1',
          title: 'Euler-Savary Inflection Condition',
          formula: '\\left(\\frac{1}{r}-\\frac{1}{r_0}\\right)\\sin(\\psi)=\\frac{1}{R}',
          type: 'Inflection Circle Equation',
          desc: 'Defines the exact locus of coupler points with zero instantaneous path curvature.',
        },
        {
          id: 'f2',
          title: 'Straight-Line Deviation Bound',
          formula: '\\max |y(x) - y_0| \\le 0.00042 \\cdot L_{\\text{coupler}}',
          type: 'Tolerance Envelope Invariant',
          desc: 'Upper bound on deviation from a perfect Euclidean line over the linear horizontal stroke.',
        },
        {
          id: 'f3',
          title: 'Coupler Angular Velocity Ratio',
          formula: '\\omega_c(\\theta) = \\omega_0 \\cdot \\frac{r_1 \\sin(\\theta - \\theta_4)}{r_3 \\sin(\\theta_3 - \\theta_4)}',
          type: 'Velocity Transfer Function',
          desc: 'Transmission ratio between input crank rotation and coupler plane motion.',
        },
      ],
      derivationSteps: [
        {
          step: 1,
          title: 'Grashof Planar Mobility Condition',
          formula: 'L_{\\min} + L_{\\max} \\le L_p + L_q \\implies a + 2.5a \\le 2a + 2.5a',
          explanation: 'Verifies the mechanism satisfies the Grashof criterion for continuous 360° input crank rotation.',
        },
        {
          step: 2,
          title: 'Coupler Midpoint Trajectory Loop Closure',
          formula: 'x(t) = a \\cos(\\omega t) + \\frac{L_3}{2}\\cos(\\phi(t)), \\quad y(t) = a \\sin(\\omega t) + \\frac{L_3}{2}\\sin(\\phi(t))',
          explanation: 'Expresses moving midpoint coordinates through the kinematic vector loop closure equation.',
        },
        {
          step: 3,
          title: 'Third-Order Curvature Vanishing at Symmetry Position',
          formula: '\\left.\\frac{d^3 y}{dx^3}\\right|_{x=0} = 0 \\implies y(x) = y_0 + \\mathcal{O}(x^5)',
          explanation: 'Symmetric link lengths eliminate 1st, 2nd, and 3rd order vertical trajectory deviations at the central stroke position.',
        },
      ],
      media: [
        {
          type: 'mechanism_simulation',
          title: 'Chebyshev 4-Bar Crank Animation',
          caption: 'Live 60fps kinematic linkage simulation showing approximate straight-line coupler trajectory without sliding bearings.',
          visualType: 'mechanism',
        },
        {
          type: 'diagram',
          title: 'Link Length Geometric Schema',
          caption: 'Proportional layout: L1 = L2 = 2.5a, L3 = a, Ground L4 = 2a.',
          visualType: 'schematic',
        },
        {
          type: 'diagram',
          title: 'Inflection Circle Osculating Locus',
          caption: 'Euler-Savary inflection circle contact locus with zero-curvature path.',
          visualType: 'inflection_geometry',
        },
      ],
      targetedInquiries: [
        'Cryogenic wear rates (2024–2026)',
        'Singularity bifurcations & limits',
        'Beryllium-copper flexure substitutions',
      ],
      references: [
        {
          title: 'Analytical Kinematics of Chebyshev Linkages in Semiconductor Vacuum Stages',
          source: 'Applied Mechanics Letters // arXiv',
          url: 'https://arxiv.org/abs/2307.12008',
          year: '2023',
          doi: '10.48550/arXiv.2307.12008',
        },
        {
          title: 'Kinematic Geometry of Planar Mechanisms',
          source: 'Oxford University Press',
          url: 'https://arxiv.org/abs/2307.12008',
          year: '2021',
          doi: '10.1093/acprof:oso/9780198562412.001.0001',
        },
      ],
    },
  },
  transport: {
    type: 'transport',
    category: 'transport // solid state',
    status: '99.1% confidence',
    width: 270,
    height: 290,
    defaultData: {
      title: 'Drude-Lorentz Conductivity',
      source: 'Condensed Matter Physics Institute',
      institution: 'Max Planck Institute & Condensed Matter Physics Lab',
      url: 'https://arxiv.org/abs/2307.12008',
      description:
        'Frequency-dependent optical transport across 1D crystalline lattice channels. Spectroscopic ellipsometry suppression.',
      detailedSynthesis:
        'Frequency-dependent optical transport across one-dimensional crystalline lattice channels. Spectroscopic ellipsometry demonstrates Drude peak suppression below 100 cm⁻¹ due to strong correlation effects and localization gaps, ruling out free-electron carrier transport at low excitation frequencies.',
      formula: '\\sigma(\\omega)=\\frac{\\sigma_0}{1+\\omega^2\\tau^2}+i\\frac{\\sigma_0\\omega\\tau}{1+\\omega^2\\tau^2}',
      formulaType: 'Complex Optical Conductivity Tensor',
      vitalStats: [
        { label: 'Drude Peak Cutoff', value: '100 cm⁻¹' },
        { label: 'Scattering Lifetime (τ)', value: '4.2 × 10⁻¹⁴ s' },
        { label: 'DC Conductivity (σ₀)', value: '1.24 × 10⁵ S/m' },
        { label: 'Spectral Confidence', value: '99.1% (Ellipsometry verified)' },
      ],
      formulas: [
        {
          id: 'f0',
          title: 'Complex Optical Conductivity Tensor',
          formula: '\\sigma(\\omega)=\\frac{\\sigma_0}{1+\\omega^2\\tau^2}+i\\frac{\\sigma_0\\omega\\tau}{1+\\omega^2\\tau^2}',
          type: 'Drude Dispersion Relation',
          desc: 'Real and imaginary components of frequency-dependent dynamic conductivity.',
        },
        {
          id: 'f1',
          title: 'Plasma Frequency Relation',
          formula: '\\omega_p^2 = \\frac{n e^2}{\\varepsilon_0 m^*}',
          type: 'Carrier Density Relation',
          desc: 'Relates collective electron oscillation frequency to effective carrier mass and density.',
        },
        {
          id: 'f2',
          title: 'Spectral Weight Sum Rule',
          formula: '\\int_0^\\infty \\text{Re}\\,\\sigma(\\omega)\\,d\\omega = \\frac{\\pi n e^2}{2 m^*}',
          type: 'f-Sum Conservation Law',
          desc: 'Total integrated optical conductivity conservation invariant across all spectral bands.',
        },
      ],
      derivationSteps: [
        {
          step: 1,
          title: 'Langevin Momentum Transport Balance',
          formula: 'm^* \\frac{d\\vec{v}}{dt} + \\frac{m^*}{\\tau}\\vec{v} = -e\\vec{E}_0 e^{-i\\omega t}',
          explanation: 'Formulates Newton-Lorentz carrier momentum balance with viscous damping constant γ = 1/τ.',
        },
        {
          step: 2,
          title: 'Harmonic Velocity Response',
          formula: '\\vec{v}(\\omega) = \\frac{-e/m^*}{1/\\tau - i\\omega}\\vec{E}',
          explanation: 'Solves the linear differential response under harmonic oscillating electric excitation.',
        },
        {
          step: 3,
          title: 'Current Density Tensor Separation',
          formula: '\\vec{J} = -n e \\vec{v} = \\sigma(\\omega)\\vec{E} \\implies \\sigma(\\omega) = \\frac{n e^2\\tau / m^*}{1 - i\\omega\\tau}',
          explanation: 'Separates into real dissipative conductivity and imaginary reactive permittivity.',
        },
      ],
      media: [
        {
          type: 'chart',
          title: 'Optical Conductivity vs Frequency',
          caption: 'Spectroscopic response showing Drude peak suppression below the 100 cm⁻¹ cutoff threshold.',
          visualType: 'spectral_chart',
        },
      ],
      targetedInquiries: [
        'Spectroscopic ellipsometry below 10 K',
        'Correlation gap vs Drude weight',
        'Dielectric function tensor invariants',
      ],
      references: [
        {
          title: 'Optical Conductivity and Correlation Gaps in Low-Dimensional Crystals',
          source: 'Physical Review B',
          url: 'https://arxiv.org/abs/2307.12008',
          year: '2024',
          doi: '10.1103/PhysRevB.109.155102',
        },
      ],
    },
  },
  topological: {
    type: 'topological',
    category: 'topological geometry',
    status: 'verified',
    width: 250,
    height: 210,
    defaultData: {
      title: 'Coupler Curve Curvature',
      source: 'Kinematic Geometry (Oxford)',
      institution: 'Oxford Mathematical Institute & Kinematics Group',
      url: 'https://arxiv.org/abs/2307.12008',
      description:
        'Closed-form Euler-Savary formulation of inflection circle curvature in planar guidance mechanics.',
      detailedSynthesis:
        'Closed-form derivation of the inflection circle via the Euler-Savary equation. Third-order derivatives vanish at the central symmetry position, producing planar guidance deviation under 0.042% across the entire linear stroke.',
      formula: '\\left(\\frac{1}{r}-\\frac{1}{r_0}\\right)\\sin(\\psi)=\\frac{1}{R}',
      formulaType: 'Euler-Savary Invariant Equation',
      vitalStats: [
        { label: 'Inflection Radius (R)', value: '1.414 · a' },
        { label: 'Singularity Invariant', value: 'ψ = 90° (Zero Curvature Point)' },
        { label: 'Order of Contact', value: '4-point osculation (3rd-order zero)' },
        { label: 'Geometry Class', value: 'Planar Kinematic Centrodes' },
      ],
      formulas: [
        {
          id: 'f0',
          title: 'Euler-Savary Invariant Relation',
          formula: '\\left(\\frac{1}{r}-\\frac{1}{r_0}\\right)\\sin(\\psi)=\\frac{1}{R}',
          type: 'Closed-Form Inflection Equation',
          desc: 'Relates moving plane coordinates to fixed centrode radius of curvature.',
        },
        {
          id: 'f1',
          title: 'Bobillier Construction Invariant',
          formula: '\\tan(\\gamma) = \\frac{\\tan(\\alpha) - \\tan(\\beta)}{1 + \\tan(\\alpha)\\tan(\\beta)}',
          type: 'Geometric Collineation Axis',
          desc: 'Determines the instantaneous inflection pole axis from link directions.',
        },
      ],
      derivationSteps: [
        {
          step: 1,
          title: 'Instantaneous Velocity Centrode',
          formula: '\\vec{v}_P = \\vec{\\omega} \\times \\vec{r}_{P/I}',
          explanation: 'Establishes the instantaneous center of rotation I for the coupler body.',
        },
        {
          step: 2,
          title: 'Acceleration Vector Decomposition',
          formula: '\\vec{a}_P = \\vec{\\alpha} \\times \\vec{r}_{P/I} - \\omega^2 \\vec{r}_{P/I} + 2\\vec{\\omega}\\times\\vec{u}',
          explanation: 'Decomposes normal and tangential accelerations along the centrode tangent.',
        },
        {
          step: 3,
          title: 'Zero Normal Curvature Locus',
          formula: 'a_n = 0 \\implies \\left(\\frac{1}{r}-\\frac{1}{r_0}\\right)\\sin\\psi = \\frac{1}{R}',
          explanation: 'Isolates the inflection circle of points whose path curvature radius is infinite.',
        },
      ],
      media: [
        {
          type: 'geometry',
          title: 'Inflection Circle & Centrode Diagram',
          caption: 'Osculating circle geometry with 4th-order straightness contact point.',
          visualType: 'topological_geometry',
        },
      ],
      targetedInquiries: [
        'Higher-order Ball points in 6-bar linkages',
        'Symplectic geometry of coupler manifolds',
      ],
      references: [
        {
          title: 'Geometric Foundations of Mechanism Curvature Theory',
          source: 'Oxford University Press',
          url: 'https://arxiv.org/abs/2307.12008',
          year: '2022',
          doi: '10.1093/acprof:oso/9780198562412.001.0001',
        },
      ],
    },
  },
  contradiction: {
    type: 'contradiction',
    category: 'refutation // counter-thesis',
    status: 'empirically proven',
    width: 280,
    height: 270,
    defaultData: {
      title: 'Phase Transition Impedance',
      source: 'Max Planck Institute for Solid State',
      institution: 'Max Planck Institute for Solid State Research (Stuttgart)',
      url: 'https://arxiv.org/abs/2307.12008',
      description:
        'Single-crystal synthesis proves the sharp resistivity drop is a copper sulfide structural phase transition artifact.',
      detailedSynthesis:
        'Single-crystal synthesis proves the sharp resistivity drop at 104°C is an artifact of Cu2S structural phase transition, establishing an insulating ground state rather than ambient superconductivity. Pure single crystals demonstrate insulating semiconductor behavior with bandgap Eg ≈ 1.2 eV and zero Meissner diamagnetism.',
      formula: '\\rho(T)=\\rho_0\\cdot\\exp\\!\\left(\\frac{E_g}{2k_BT}\\right)',
      conclusionFormula: '\\rho > 10^8\\,\\Omega{\\cdot}\\text{cm}',
      formulaType: 'Thermally Activated Semiconductor Resistivity Law',
      vitalStats: [
        { label: 'Artifact Phase', value: 'Cu₂S (104°C / 377 K Transition)' },
        { label: 'Ground State', value: 'Insulating Semiconductor' },
        { label: 'Bandgap (Eg)', value: '1.2 eV' },
        { label: 'Zero Resistance', value: 'Disproven (Artifact Isolated)' },
      ],
      formulas: [
        {
          id: 'f0',
          title: 'Thermally Activated Semiconductor Resistivity',
          formula: '\\rho(T)=\\rho_0\\cdot\\exp\\!\\left(\\frac{E_g}{2k_BT}\\right)',
          type: 'Arrhenius Transport Relation',
          desc: 'Predicts exponential resistivity rise at lower temperatures, characteristic of an insulator.',
        },
        {
          id: 'f1',
          title: 'Disproven Meissner Condition',
          formula: '\\chi_v \\ne -1 \\implies \\chi_v \\approx +1.2 \\times 10^{-4}',
          type: 'Paramagnetic Susceptibility Invariant',
          desc: 'Absence of bulk diamagnetic flux expulsion across all crystalline orientations.',
        },
      ],
      derivationSteps: [
        {
          step: 1,
          title: 'Single Crystal Growth vs Polycrystalline Sintering',
          formula: '\\text{Pb}_{10-x}\\text{Cu}_x(\\text{PO}_4)_6\\text{O} + \\text{Cu}_2\\text{S}_{\\text{impurity}} \\xrightarrow{\\text{Floating Zone}} \\text{Single Phase Crystal}',
          explanation: 'Eliminates copper sulfide secondary phases by optical floating zone crystal purification.',
        },
        {
          step: 2,
          title: 'Isolated 104°C First-Order Phase Jump',
          formula: '\\Delta\\rho_{\\text{Cu}_2\\text{S}} \\text{ at } T=377\\,\\text{K} \\implies \\text{First-Order Structural Change}',
          explanation: 'Isolates the 3 to 4 order of magnitude resistivity drop exclusively to Cu2S crystallization.',
        },
        {
          step: 3,
          title: 'Insulating Ground State Confirmation',
          formula: '\\lim_{T\\to 0} \\rho(T) = \\infty \\;(\\text{Bandgap } E_g = 1.2\\,\\text{eV})',
          explanation: 'Conclusively demonstrates pure crystals are insulators at room temperature and cryogenic temperatures.',
        },
      ],
      media: [
        {
          type: 'chart',
          title: 'Resistivity vs Temperature Phase Transition',
          caption: 'Measured single crystal resistivity vs Cu2S contaminated sample showing 104°C jump.',
          visualType: 'refutation_plot',
        },
      ],
      targetedInquiries: [
        'Single crystal optical floating zone data',
        'Cu2S stoichiometry phase boundary',
        'Paramagnetic susceptibility measurements',
      ],
      references: [
        {
          title: 'Absence of Superconductivity in Pure Single-Crystal LK-99',
          source: 'Nature Materials // Max Planck',
          url: 'https://arxiv.org/abs/2307.12008',
          year: '2023',
          doi: '10.48550/arXiv.2307.12008',
        },
      ],
    },
  },
  spawned: {
    type: 'spawned',
    category: 'ai discovery // 2026',
    status: 'crawled live',
    width: 270,
    height: 240,
    defaultData: {
      year: '2026',
      title: 'Cryogenic Flexure Stability',
      source: 'IEEE Trans. Robotics (2026)',
      institution: 'IEEE Robotics & Automation Society (2026 Corpus)',
      url: 'https://arxiv.org/abs/2307.12008',
      description:
        'Sub-micron excursion maintained to 4.2 K with zero stick-slip hysteresis on beryllium-copper flexures.',
      detailedSynthesis:
        'Sub-micron straight-line excursion maintained down to 4.2 K with zero stick-slip hysteresis on beryllium-copper flexure prototype for orbital cryo-interferometry. Validates continuous elastic deformation kinetics under ultra-low thermal dissipation.',
      formula: '\\Delta x_{\\text{err}}\\le 0.042\\%',
      formulaType: 'Precision Excursion Tolerance Bound',
      vitalStats: [
        { label: 'Thermal Limit', value: '4.2 K (Liquid Helium)' },
        { label: 'Excursion Precision', value: 'Δx ≤ 0.042%' },
        { label: 'Substrate Material', value: 'Beryllium-Copper (BeCu C17200)' },
        { label: 'Discovery Timestamp', value: 'August 2026 Live Crawl' },
      ],
      formulas: [
        {
          id: 'f0',
          title: 'Cryogenic Flexure Excursion Tolerance',
          formula: '\\Delta x_{\\text{err}}\\le 0.042\\%',
          type: 'Precision Bound',
          desc: 'Maximum allowable thermal contraction drift along the active guidance vector.',
        },
        {
          id: 'f1',
          title: 'Elastic Bending Energy at Cryo-T',
          formula: 'U = \\frac{1}{2}\\int_0^L E(T) I \\left(\\frac{d^2 w}{dx^2}\\right)^2 dx',
          type: 'Continuum Elastic Strain Energy',
          desc: 'Temperature-dependent Young modulus integration across flexure beam geometry.',
        },
      ],
      derivationSteps: [
        {
          step: 1,
          title: 'Thermal Contraction Invariant',
          formula: '\\Delta L = L_0 \\int_{4.2\\,\\text{K}}^{293\\,\\text{K}} \\alpha(T)\\,dT',
          explanation: 'Calculates differential contraction between flexure arm and monolithic ground mounting.',
        },
        {
          step: 2,
          title: 'Zero Hysteresis Elastic Return',
          formula: '\\oint \\sigma\\,d\\epsilon = 0 \\implies \\eta_{\\text{dissipation}} < 10^{-6}',
          explanation: 'Elimination of micro-slip boundaries at liquid helium temperature.',
        },
      ],
      media: [
        {
          type: 'diagram',
          title: 'Cryogenic Flexure Prototype Geometry',
          caption: 'Monolithic beryllium-copper guidance stage tested in 4.2K cryostat.',
          visualType: 'cryo_flexure',
        },
      ],
      targetedInquiries: [
        'Orbital interferometry vacuum deployment',
        'BeCu fatigue life under 10^7 cycles',
        'Thermal conduction isolation paths',
      ],
      references: [
        {
          title: 'Sub-Micron Cryogenic Flexure Guidance for Spaceborne Optical Interferometers',
          source: 'IEEE Transactions on Robotics (Early Access)',
          url: 'https://arxiv.org/abs/2307.12008',
          year: '2026',
          doi: '10.1109/TRO.2026.3389102',
        },
      ],
    },
  },
};

/**
 * Creates a new node inheriting all structural styling from its template
 */
export function createNodeFromTemplate(templateKey, id, position, customData = {}) {
  const template = NODE_TEMPLATES[templateKey] || NODE_TEMPLATES.spawned;
  return {
    id: id || `node_${Date.now().toString(36)}`,
    type: template.type,
    width: template.width,
    height: template.height,
    position: position || { x: 300, y: 250 },
    data: {
      category: template.category,
      status: template.status,
      ...template.defaultData,
      ...customData,
    },
  };
}

export const LINKAGE_DEFINITIONS = {
  ORIGIN_URL: {
    name: 'Origin Source Linkage',
    type: 'ORIGIN_URL',
    badge: 'ORIGIN // URL',
    coupling: '100% Top-Level Derivation',
    description:
      'Primary source grounding connection. Extracts structured ontology directly from verified scholarly preprints or living web domains.',
    mathematics: '\\vec{S} \\to \\mathcal{M}_{\\text{kinematic}}',
  },
  COUPLED_SYSTEM: {
    name: 'Coupled Kinematic Linkage',
    type: 'COUPLED_SYSTEM',
    badge: 'COUPLED DYNAMICS',
    coupling: '94.8% Mathematical Coupling',
    description:
      'Direct kinematic and energy transfer coupling. Changes in rotary crank input strictly govern optical and topological states.',
    mathematics: '\\Delta\\theta(t) \\implies \\nabla \\sigma(\\omega)',
  },
  CONTRADICTS: {
    name: 'Empirical Refutation Linkage',
    type: 'CONTRADICTS',
    badge: 'COUNTER-THESIS // REFUTATION',
    coupling: 'Strict Logical Contradiction',
    description:
      'Rigorous empirical contradiction. Disproves ambient superconductivity hypotheses by identifying phase-transition artifact ground states.',
    mathematics: '\\mathcal{H}_0 \\cap \\mathcal{H}_{\\text{artifact}} = \\emptyset',
  },
  DEFAULT: {
    name: 'Semantic Discovery Linkage',
    type: 'DEFAULT',
    badge: 'AI INFERENCE',
    coupling: '88.2% Semantic Association',
    description:
      'Machine-synthesized associative bridge linking theoretical mechanics with orbital cryogenic micro-manipulator research.',
    mathematics: '\\mathcal{L}_{\\text{graph}} = \\arg\\max P(k_j | k_i)',
  },
};

