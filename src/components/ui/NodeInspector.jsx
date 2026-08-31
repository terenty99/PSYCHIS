import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Image,
  Plus,
  Search,
  Sparkles,
  Pin,
  PinOff,
  Compass,
  ArrowUpRight,
  Trash2,
  Globe,
  Settings,
  Zap,
  Triangle,
  Layers,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Download,
  BookOpen,
  FileText,
  Sliders,
  Maximize2,
  Play,
  Pause,
  RotateCcw,
  GitBranch,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Paperclip,
  Film,
  Sigma,
  Microscope,
  Columns,
  Eye,
  Video,
} from 'lucide-react';
import { MathFormula } from '../../utils/mathRenderer';


const DEFAULT_NODE_PHOTOS = {
  website: [
    {
      id: 'img-web-1',
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
      title: 'JWST Stellar Survey // Deep Sky Photometry',
      caption: 'Near-infrared spectroscopy and star cluster photometry from the James Webb Space Telescope.',
      source: 'web archive @esa_jwst // NASA ADS',
      platform: 'web',
      tag: 'JWST NIRCam'
    },
    {
      id: 'img-web-2',
      url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop',
      title: 'Astrophotography Stellar Baseline // Star Vega',
      caption: 'Stellar reference field and optical baseline for precision kinematic calibration.',
      source: 'web archive @astrophotography_hub',
      platform: 'web',
      tag: 'Optical 4K'
    }
  ],
  mechanism: [
    {
      id: 'img-mech-1',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
      title: 'Machined Titanium Chebyshev 4-Bar Prototype',
      caption: 'Monolithic flexure linkage milled for ultra-high vacuum wafer stage with zero sliding bearings.',
      source: 'Applied Mechanics Laboratory (ETH Zürich)',
      platform: 'laboratory',
      tag: 'Titanium Grade 5'
    },
    {
      id: 'img-mech-2',
      url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=800&auto=format&fit=crop',
      title: 'High-Speed 60fps Laser Stroboscopy',
      caption: 'Experimental validation of straight-line trajectory error Δx ≤ 0.042% across continuous crank rotation.',
      source: 'web archive @engineering_physics',
      platform: 'web',
      tag: 'Laser Stroboscopy'
    }
  ],
  transport: [
    {
      id: 'img-trans-1',
      url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=800&auto=format&fit=crop',
      title: 'Optical Transport Laser Spectroscopy Core',
      caption: 'Drude-Lorentz optical conductivity measurement in 1D crystal lattice channel.',
      source: 'Max Planck Institute for Solid State Research',
      platform: 'laboratory',
      tag: 'THz Spectrometer'
    },
    {
      id: 'img-trans-2',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
      title: 'ALMA Submillimeter Stellar Array',
      caption: 'High-altitude submillimeter array capturing far-infrared interstellar transport channels.',
      source: 'web archive @alma.observatory',
      platform: 'web',
      tag: 'ALMA Band 7'
    }
  ],
  topological: [
    {
      id: 'img-topo-1',
      url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop',
      title: 'Laser Holographic Curvature Interferometry',
      caption: 'Optical fringe pattern visualizing Euler-Savary inflection circle contact curvature vanishing invariant.',
      source: 'Institute of Topological Mechanics',
      platform: 'laboratory',
      tag: 'HeNe Laser Fringe'
    }
  ],
  contradiction: [
    {
      id: 'img-contra-1',
      url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=800&auto=format&fit=crop',
      title: 'Scanning Electron Micrograph of Cu₂S Crystal',
      caption: 'Crystalline grain boundary structure exhibiting the 104°C first-order structural phase transition.',
      source: 'Materials Characterization Center',
      platform: 'laboratory',
      tag: 'SEM 50,000x'
    }
  ],
  spawned: [
    {
      id: 'img-spawn-1',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
      title: 'Cryogenic Dilution Stage at 4.2 Kelvin',
      caption: 'Autonomous discovery testbed verifying zero stick-slip hysteresis in sub-micron flexures at cryogenic temperatures.',
      source: 'web archive @quantum_cryogenics',
      platform: 'web',
      tag: 'Liquid Helium 4.2 K'
    }
  ]
};

// Type icon and badge helper
const getNodeTypeConfig = (type) => {
  switch (type) {
    case 'website':
      return {
        icon: Globe,
        label: 'Website // Corpus',
        badge: 'CORPUS',
      };
    case 'mechanism':
      return {
        icon: Settings,
        label: 'Mechanism // Planar Motion',
        badge: 'MECHANISM',
      };
    case 'transport':
      return {
        icon: Zap,
        label: 'Transport // Solid State',
        badge: 'TRANSPORT',
      };
    case 'topological':
      return {
        icon: Triangle,
        label: 'Topological Geometry',
        badge: 'TOPOLOGY',
      };
    case 'contradiction':
      return {
        icon: Layers,
        label: 'Refutation // Counter-Thesis',
        badge: 'REFUTATION',
      };
    case 'spawned':
      return {
        icon: Sparkles,
        label: 'Parametric Discovery // 2026',
        badge: 'AI DISCOVERY',
      };
    default:
      return {
        icon: FileText,
        label: 'Knowledge Artifact',
        badge: 'NODE',
      };
  }
};

export const NodeInspector = ({
  isOpen = false,
  nodeData,
  viewMode = 'inspector',
  onSwitchViewMode,
  onClose,
  onLaunchProbe,
  onSpecificProbe,
  onDeleteNode,
  onOpenBrowser,
  onDuplicateNode,
  onExportNode,
  isInvestigating = false,
  investigationMessage = '',
}) => {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState('study'); // 'study' | 'proofs' | 'visuals' | 'research'
  const [isPinned, setIsPinned] = useState(false);
  const [currentDerivationStep, setCurrentDerivationStep] = useState(0);
  const [selectedFormulaIndex, setSelectedFormulaIndex] = useState(0);
  const [mediaSliderIndex, setMediaSliderIndex] = useState(0);
  const [lightboxItem, setLightboxItem] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // AI Kinetic Simulation & Motion GIF States
  const [isSimRunning, setIsSimRunning] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1); // 0.5x | 1x | 2x
  const [scrubAngle, setScrubAngle] = useState(0); // 0 to 360 degrees
  const [showVelocityVectors, setShowVelocityVectors] = useState(true);
  const [aiGifPrompt, setAiGifPrompt] = useState('Synthesize 60fps kinetic motion loop with velocity vectors and inflection osculation');
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  const [gifGenStatus, setGifGenStatus] = useState('');
  const [synthesizedGifs, setSynthesizedGifs] = useState([]);
  const [nodePhotos, setNodePhotos] = useState([]);
  const [photoSearchQuery, setPhotoSearchQuery] = useState('Betelgeuse Star JWST Infrared');
  const [isSearchingPhotos, setIsSearchingPhotos] = useState(false);
  const [photoSearchStatus, setPhotoSearchStatus] = useState('');
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [customPhotoCaption, setCustomPhotoCaption] = useState('');
  const [showAddPhotoForm, setShowAddPhotoForm] = useState(false);

  useEffect(() => {
    if (nodeData) {
      const existing = nodeData.data?.photos || nodeData.data?.images || DEFAULT_NODE_PHOTOS[nodeData.type] || [];
      setNodePhotos(existing);
    }
  }, [nodeData?.id, nodeData?.type]);

  const handleCrawlPhotos = (query) => {
    setIsSearchingPhotos(true);
    setPhotoSearchStatus('Connecting to scholarly image registries...');
    
    setTimeout(() => {
      setPhotoSearchStatus('Ingesting high-resolution imagery for "' + (query || 'Star Target') + '"...');
      
      setTimeout(() => {
        const newPhoto = {
          id: 'photo-' + Date.now(),
          url: query.toLowerCase().includes('star') || query.toLowerCase().includes('betelgeuse') || query.toLowerCase().includes('jwst')
            ? 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop'
            : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
          title: (query || 'Star Survey') + ' // Optical Ingestion',
          caption: 'Archived from scientific image repository & observatory archives with calibrated spectral resolution.',
          source: 'Web Image Archive // ESO & Space Telescope',
          platform: 'web',
          tag: 'Crawled 4K'
        };
        
        setNodePhotos((prev) => [newPhoto, ...prev]);
        setIsSearchingPhotos(false);
        setPhotoSearchStatus('✓ Attached 1 high-resolution photo to study description!');
        setTimeout(() => setPhotoSearchStatus(''), 3000);
      }, 1000);
    }, 800);
  };

  const handleAddCustomPhoto = (e) => {
    e.preventDefault();
    if (!customPhotoUrl.trim()) return;
    const newPhoto = {
      id: 'photo-' + Date.now(),
      url: customPhotoUrl.trim(),
      title: customPhotoCaption.trim() || 'Attached Visual Artifact',
      caption: 'Directly linked photo artifact in node study.',
      source: 'User Attached // Web Origin',
      platform: 'web',
      tag: 'Custom Photo'
    };
    setNodePhotos((prev) => [newPhoto, ...prev]);
    setCustomPhotoUrl('');
    setCustomPhotoCaption('');
    setShowAddPhotoForm(false);
  };


  // Animation frame loop for mechanism scrub angle
  const animRef = useRef(null);
  useEffect(() => {
    if (!isSimRunning) return;
    const interval = setInterval(() => {
      setScrubAngle((prev) => (prev + 2.5 * simSpeed) % 360);
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [isSimRunning, simSpeed]);

  if (!nodeData) return null;

  const typeConfig = getNodeTypeConfig(nodeData.type);
  const TypeIcon = typeConfig.icon;

  const data = nodeData.data || {};
  const hasSource = Boolean(data.url || data.source);
  const hasVisuals = true; // All nodes support visualizer / kinetic GIFs
  const hasFormulas = Boolean(data.formula || (data.formulas && data.formulas.length > 0));
  const hasInvestigation = Boolean(data.targetedInquiries || onLaunchProbe);

  const vitalStats = data.vitalStats || [
    { label: 'Classification', value: data.category || 'Theoretical Model' },
    { label: 'Status', value: data.status || 'Verified' },
    { label: 'Precision', value: data.tolerance || 'High Confidence' },
    { label: 'Corpus ID', value: nodeData.id },
  ];

  const formulasList = data.formulas || (data.formula ? [
    {
      id: 'f0',
      title: 'Primary Formulation',
      formula: data.formula,
      type: data.formulaType || 'Defining Relation',
      desc: data.description || 'Core mathematical formulation governing node dynamics.',
    },
  ] : []);

  const derivationSteps = data.derivationSteps || [
    {
      step: 1,
      title: 'Fundamental Postulate',
      formula: data.formula || 'F = ma',
      explanation: 'Initial boundary condition setup and parameter mapping.',
    },
    {
      step: 2,
      title: 'Euler-Savary Transform',
      formula: '\\left(\\frac{1}{r}-\\frac{1}{r_0}\\right)\\sin\\psi = \\frac{1}{R}',
      explanation: 'Symmetry constraint reduction and velocity vector alignment.',
    },
    {
      step: 3,
      title: 'Closed-Form Invariant',
      formula: '\\lim_{x\\to 0} \\frac{d^3 y}{dx^3} = 0 \\implies y(x) = y_0 + \\mathcal{O}(x^5)',
      explanation: 'Third-order derivative vanishing at the inflection center.',
    },
  ];

  const mediaItems = data.media || [
    {
      type: 'visualization',
      title: `${data.title || 'Concept'} Kinetic Visualizer`,
      caption: 'Continuous 60fps kinetic state evolution in spatial canvas.',
      visualType: nodeData.type,
    },
  ];

  const references = data.references || [
    {
      title: `${data.title || 'Kinematic Model'} Reference Document`,
      source: data.source || 'Applied Mechanics Laboratory',
      url: data.url || 'https://arxiv.org/abs/2307.12008',
      year: '2024',
      doi: '10.48550/arXiv.2307.12008',
    },
  ];

  const targetedInquiries = data.targetedInquiries || [
    'Cryogenic wear rates (2024–2026)',
    'Singularity bifurcations & limits',
    'Beryllium-copper flexure substitutions',
  ];

  const handleCopyId = () => {
    navigator.clipboard?.writeText(nodeData.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1500);
  };

  const handleOpenSourceInBrowser = (urlToOpen) => {
    const targetUrl = urlToOpen || data.url || 'https://arxiv.org/abs/2307.12008';
    if (onOpenBrowser) {
      onOpenBrowser(targetUrl, 'split');
    }
  };

  const handleExportCard = () => {
    if (onExportNode) {
      onExportNode(nodeData);
    } else {
      const blob = new Blob([JSON.stringify(nodeData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `psychis_node_${nodeData.id}.json`;
      a.click();
    }
  };

  // AI Kinetic Motion GIF Synthesizer Trigger
  const handleGenerateAiGif = () => {
    setIsGeneratingGif(true);
    setGifGenStatus('Synthesizing parametric equations & kinematic vectors...');

    setTimeout(() => {
      setGifGenStatus('Rendering 60fps continuous simulation frames...');
    }, 800);

    setTimeout(() => {
      const newGifItem = {
        id: `gif_${Date.now()}`,
        title: `AI Kinetic Loop (${nodeData.id})`,
        caption: aiGifPrompt,
        prompt: aiGifPrompt,
        timestamp: new Date().toLocaleTimeString(),
        speed: simSpeed,
      };
      setSynthesizedGifs((prev) => [newGifItem, ...prev]);
      setIsGeneratingGif(false);
      setGifGenStatus('✓ Kinetic visualization loop synthesized and attached to node');
      setActiveTab('visuals');
    }, 1800);
  };

  // Calculated mechanism crank geometry for scrub angle
  const rad = (scrubAngle * Math.PI) / 180;
  const crankR = 24;
  const crank1X = 75 + crankR * Math.cos(rad);
  const crank1Y = 75 - crankR * Math.sin(rad);
  const crank2X = 205 - crankR * Math.cos(rad);
  const crank2Y = 75 - crankR * Math.sin(rad);
  const couplerMidX = (crank1X + crank2X) / 2;
  const couplerMidY = (crank1Y + crank2Y) / 2 - 22;

  return (
    <>
      <aside
        id="node-inspector"
        onWheel={(e) => e.stopPropagation()}
        className={`fixed inset-y-0 right-0 z-[70] flex flex-col w-[520px] max-w-[94vw] bg-white-pure/98 backdrop-blur-2xl border-l border-grey-medium shadow-[-20px_0_50px_rgba(0,0,0,0.12)] transition-transform duration-350 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] select-text ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Node knowledge study deck"
      >
        {/* 1. NODE IDENTITY & CONTEXT BAR (Persistent Header) */}
        <header className="p-4 px-5 border-b border-grey-medium bg-white-warm/95 backdrop-blur-md select-none shadow-2xs shrink-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-grey-soft border border-grey-medium flex items-center justify-center text-text-primary shadow-2xs">
                <TypeIcon className="w-3.5 h-3.5" />
              </div>
              <button
                onClick={handleCopyId}
                className="font-mono text-[10px] font-semibold text-text-secondary bg-grey-soft hover:bg-grey-medium border border-grey-medium px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                title="Click to copy Node ID"
              >
                <span>{nodeData.id}</span>
                {copiedId ? <Check className="w-2.5 h-2.5 text-green-600" /> : <Copy className="w-2.5 h-2.5 text-text-muted" />}
              </button>
              <span className="font-mono text-[9.5px] font-semibold tracking-wider text-text-secondary uppercase bg-white-pure px-2 py-0.5 rounded-md border border-grey-medium/80">
                {typeConfig.badge}
              </span>
            </div>

            {/* View Mode Toggle (Inspector / Split / Browser) */}
            <div className="flex items-center bg-white-pure border border-grey-medium rounded-lg p-0.5 gap-0.5 shadow-2xs">
              <button
                onClick={() => onSwitchViewMode?.('inspector')}
                className={`px-2 py-0.5 rounded font-mono text-[10px] flex items-center gap-1 transition-colors ${
                  viewMode === 'inspector' ? 'bg-text-primary text-white-pure font-semibold' : 'text-text-muted hover:text-text-primary'
                }`}
                title="Study-Focused Mode"
              >
                <FileText className="w-3 h-3" />
                <span className="hidden sm:inline">Study</span>
              </button>

              <button
                onClick={() => onSwitchViewMode?.('split')}
                className={`px-2 py-0.5 rounded font-mono text-[10px] flex items-center gap-1 transition-colors ${
                  viewMode === 'split' ? 'bg-text-primary text-white-pure font-semibold' : 'text-text-muted hover:text-text-primary'
                }`}
                title="Split View (Side-by-side with Source Browser)"
              >
                <Columns className="w-3 h-3" />
                <span className="hidden sm:inline">Split</span>
              </button>

              <button
                onClick={() => onSwitchViewMode?.('browser')}
                className={`px-2 py-0.5 rounded font-mono text-[10px] flex items-center gap-1 transition-colors ${
                  viewMode === 'browser' ? 'bg-text-primary text-white-pure font-semibold' : 'text-text-muted hover:text-text-primary'
                }`}
                title="Source Browser Mode"
              >
                <BookOpen className="w-3 h-3" />
                <span className="hidden sm:inline">Source</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsPinned(!isPinned)}
                className={`btn-contemplative !w-6 !h-6 !p-0 rounded-md text-[10px] ${
                  isPinned ? '!bg-grey-medium !border-text-primary/30 text-text-primary' : 'text-text-muted'
                }`}
                title={isPinned ? 'Pinned to canvas' : 'Pin node'}
              >
                {isPinned ? <PinOff className="w-3 h-3 text-text-primary" /> : <Pin className="w-3 h-3 text-text-secondary" />}
              </button>

              {onDuplicateNode && (
                <button
                  onClick={() => onDuplicateNode(nodeData)}
                  className="btn-contemplative !w-6 !h-6 !p-0 rounded-md text-[10px] text-text-muted hover:text-text-primary"
                  title="Duplicate Node"
                >
                  <Copy className="w-3 h-3" />
                </button>
              )}

              <button
                onClick={handleExportCard}
                className="btn-contemplative !w-6 !h-6 !p-0 rounded-md text-[10px] text-text-muted hover:text-text-primary"
                title="Export Node Card (.json)"
              >
                <Download className="w-3 h-3" />
              </button>

              {onDeleteNode && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-contemplative !w-6 !h-6 !p-0 rounded-md text-[10px] hover:!bg-red-50 hover:!text-red-600 text-text-muted"
                  title="Delete node (Del / Backspace)"
                >
                  <Trash2 className="w-3 h-3 hover:text-red-600" />
                </button>
              )}

              <button
                onClick={onClose}
                className="btn-contemplative !w-6 !h-6 !p-0 rounded-md text-[10px] ml-1"
                aria-label="Close inspector"
              >
                <X className="w-3.5 h-3.5 text-text-secondary" />
              </button>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h1 className="font-display text-[17px] font-medium text-text-primary leading-snug">
              {data.title || 'Untitled Knowledge Node'}
            </h1>
            <p className="font-mono text-[11px] text-text-muted mt-0.5">
              {typeConfig.label} &bull; {data.status || 'Verified State'}
            </p>
          </div>

          {/* Section Tabs Bar */}
          <nav className="flex items-center gap-1 mt-2.5 pt-2 border-t border-grey-medium/70 select-none overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('study')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[10.5px] font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                activeTab === 'study'
                  ? 'bg-text-primary text-white-pure shadow-2xs'
                  : 'bg-white-pure/80 hover:bg-grey-soft text-text-secondary border border-grey-medium/80'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('visuals')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[10.5px] font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                activeTab === 'visuals'
                  ? 'bg-text-primary text-white-pure shadow-2xs'
                  : 'bg-white-pure/80 hover:bg-grey-soft text-text-secondary border border-grey-medium/80'
              }`}
            >
              <Film className="w-3 h-3" />
              <span>Kinetic Visuals &amp; GIFs</span>
            </button>

            <button
              onClick={() => setActiveTab('proofs')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[10.5px] font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                activeTab === 'proofs'
                  ? 'bg-text-primary text-white-pure shadow-2xs'
                  : 'bg-white-pure/80 hover:bg-grey-soft text-text-secondary border border-grey-medium/80'
              }`}
            >
              <GitBranch className="w-3 h-3" />
              <span>Proofs ({derivationSteps.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('research')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[10.5px] font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                activeTab === 'research'
                  ? 'bg-text-primary text-white-pure shadow-2xs'
                  : 'bg-white-pure/80 hover:bg-grey-soft text-text-secondary border border-grey-medium/80'
              }`}
            >
              <Sparkles className="w-3 h-3 text-text-secondary" />
              <span>Deep Probe</span>
            </button>
          </nav>
        </header>

        {/* Delete Confirmation Modal / Scrim */}
        {showDeleteConfirm && (
          <div className="p-3 bg-red-50/90 border-b border-red-200 flex items-center justify-between text-xs text-red-800">
            <span>Permanently prune node <b>{nodeData.id}</b> and linkages?</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onDeleteNode(nodeData.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white-pure rounded-md font-mono text-[10px] font-semibold cursor-pointer"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 bg-white-pure border border-grey-medium text-text-secondary rounded-md font-mono text-[10px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* MAIN BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 scrollbar-thin">
          {/* TAB 1: OVERVIEW & SYNTHESIS */}
          {activeTab === 'study' && (
            <div className="flex flex-col gap-5">
              {/* SOURCE ATTRIBUTION & VITAL PROPERTIES */}
              <section className="bg-white-warm border border-grey-medium rounded-2xl p-4 shadow-2xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-text-muted" />
                    Source Provenance &amp; Literature Link
                  </span>
                  <span className="font-mono text-[9.5px] text-text-muted bg-grey-soft px-2 py-0.5 rounded border border-grey-medium/70">
                    verified signal
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[13px] font-medium text-text-primary">
                    {data.institution || data.source || 'Applied Mechanics Laboratory'}
                  </span>

                  {/* Actionable URL */}
                  <button
                    onClick={() => handleOpenSourceInBrowser(data.url)}
                    className="group flex items-center gap-1.5 font-mono text-xs text-text-primary hover:text-text-secondary cursor-pointer transition-colors text-left mt-0.5"
                    title="Open paper side-by-side in Embedded Browser"
                  >
                    <span className="text-text-muted">Source:</span>
                    <span className="underline underline-offset-3 decoration-grey-strong group-hover:decoration-text-primary font-medium">
                      {data.url ? data.url.replace(/^https?:\/\//, '') : 'arxiv.org/abs/2307.12008'}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>

                {/* Vital Properties Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-grey-soft/80">
                  {vitalStats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="bg-grey-soft/70 border border-grey-medium/70 rounded-xl p-2 flex flex-col gap-0.5"
                    >
                      <span className="font-mono text-[9px] text-text-muted uppercase tracking-wider">
                        {stat.label}
                      </span>
                      <span className="font-mono text-[11.5px] font-semibold text-text-primary truncate">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* DETAILED SYNTHESIS */}
              <section className="flex flex-col gap-2">
                <span className="font-mono text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  Conceptual Synthesis &amp; Analysis
                </span>
                <div className="bg-grey-soft/80 border border-grey-medium rounded-2xl p-4 shadow-2xs">
                  <p className="text-[12.5px] leading-[1.75] text-text-primary font-normal">
                    {data.detailedSynthesis || data.description}
                  </p>
                </div>
              </section>

              
              {/* ATTACHED PHOTOGRAPHY & web archive VISUAL FEED */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-text-primary" />
                    <span className="font-mono text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                      Photography &amp; web archive Visuals ({nodePhotos.length})
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAddPhotoForm(!showAddPhotoForm)}
                    className="font-mono text-[9.5px] font-semibold text-text-secondary bg-white-pure hover:bg-grey-soft border border-grey-medium px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Add Photo</span>
                  </button>
                </div>

                {/* AI Photo & web archive Search Tool */}
                <div className="bg-white-warm border border-grey-medium rounded-2xl p-3.5 shadow-2xs flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9.5px] font-bold text-text-primary flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-text-secondary" />
                      <span>AI Photo &amp; Visual Discovery</span>
                    </span>
                    <span className="font-mono text-[8.5px] text-text-muted">Live Ingestion</span>
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={photoSearchQuery}
                      onChange={(e) => setPhotoSearchQuery(e.target.value)}
                      placeholder="e.g. Star Betelgeuse, Pillars of Creation, Titanium Linkage..."
                      className="flex-1 bg-white-pure border border-grey-medium rounded-xl px-3 py-1.5 text-xs text-text-primary font-mono outline-none focus:border-text-primary/60 transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCrawlPhotos(photoSearchQuery);
                      }}
                    />
                    <button
                      onClick={() => handleCrawlPhotos(photoSearchQuery)}
                      disabled={isSearchingPhotos}
                      className="btn-contemplative btn-dark !py-1.5 !px-3 text-[10.5px] whitespace-nowrap flex items-center gap-1"
                    >
                      {isSearchingPhotos ? (
                        <span>Crawling...</span>
                      ) : (
                        <>
                          <Search className="w-3 h-3" />
                          <span>Fetch Photos</span>
                        </>
                      )}
                    </button>
                  </div>

                  {photoSearchStatus && (
                    <div className="font-mono text-[10px] text-text-muted text-center animate-pulse">
                      {photoSearchStatus}
                    </div>
                  )}

                  {/* Suggestion Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-grey-soft/80">
                    <span className="font-mono text-[8.5px] text-text-muted">QUICK TARGETS:</span>
                    {['Betelgeuse Star', 'JWST Pillars of Creation', 'Titanium Mechanism', 'Cryo Dilution Core'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setPhotoSearchQuery(tag);
                          handleCrawlPhotos(tag);
                        }}
                        className="font-mono text-[8.5px] text-text-secondary hover:text-text-primary bg-white-pure hover:bg-grey-soft border border-grey-medium px-1.5 py-0.5 rounded transition-colors"
                      >
                        ✦ {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Photo URL Form */}
                {showAddPhotoForm && (
                  <form onSubmit={handleAddCustomPhoto} className="bg-white-pure border border-grey-medium rounded-xl p-3 flex flex-col gap-2 shadow-2xs">
                    <div className="font-mono text-[9.5px] font-semibold text-text-primary">Attach Photo by URL</div>
                    <input
                      type="url"
                      value={customPhotoUrl}
                      onChange={(e) => setCustomPhotoUrl(e.target.value)}
                      placeholder="https://example.com/photo.jpg or web archive media link"
                      required
                      className="bg-grey-soft/70 border border-grey-medium rounded-lg px-2.5 py-1 text-xs font-mono outline-none"
                    />
                    <input
                      type="text"
                      value={customPhotoCaption}
                      onChange={(e) => setCustomPhotoCaption(e.target.value)}
                      placeholder="Photo title / caption (e.g. Star Cluster 4K)"
                      className="bg-grey-soft/70 border border-grey-medium rounded-lg px-2.5 py-1 text-xs font-mono outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddPhotoForm(false)}
                        className="px-2 py-0.5 text-xs text-text-muted hover:text-text-primary font-mono"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-contemplative btn-dark !py-1 !px-2.5 text-xs font-mono"
                      >
                        Attach Photo
                      </button>
                    </div>
                  </form>
                )}

                {/* Photo Cards Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {nodePhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setLightboxItem({ title: photo.title, caption: photo.caption, url: photo.url, tag: photo.tag })}
                      className="group bg-white-pure border border-grey-medium hover:border-text-primary/40 rounded-xl overflow-hidden shadow-2xs cursor-pointer transition-all duration-200 flex flex-col"
                    >
                      <div className="relative aspect-video w-full bg-grey-soft overflow-hidden">
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-text-primary/85 backdrop-blur-sm text-white-pure text-[8px] font-mono font-semibold px-1.5 py-0.5 rounded">
                          {photo.tag || (photo.platform === 'web' ? '📷 web archive' : 'Photo')}
                        </div>
                        <div className="absolute inset-0 bg-text-primary/0 group-hover:bg-text-primary/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Maximize2 className="w-4 h-4 text-white-pure drop-shadow" />
                        </div>
                      </div>
                      <div className="p-2 flex flex-col gap-0.5">
                        <div className="font-mono text-[10.5px] font-semibold text-text-primary truncate">
                          {photo.title}
                        </div>
                        <p className="font-sans text-[9.5px] text-text-muted line-clamp-2 leading-snug">
                          {photo.caption}
                        </p>
                        {photo.source && (
                          <div className="font-mono text-[8px] text-text-faint mt-1 truncate">
                            {photo.source}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>


              {/* PRIMARY MATHEMATICAL FORMULATION */}
              <section className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Mathematical Model ({formulasList.length})
                  </span>
                  <span className="font-mono text-[9.5px] text-text-muted">KaTeX validated</span>
                </div>

                {formulasList[0] && (
                  <div className="bg-white-warm border border-grey-medium rounded-2xl p-4 shadow-xs flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[11px] font-semibold text-text-primary">
                        {formulasList[selectedFormulaIndex]?.title || formulasList[0].title}
                      </span>
                      <span className="font-mono text-[9px] font-semibold text-text-secondary bg-grey-soft border border-grey-medium px-2 py-0.5 rounded">
                        {formulasList[selectedFormulaIndex]?.type || formulasList[0].type}
                      </span>
                    </div>

                    <div className="py-3 text-center bg-white-pure rounded-xl border border-grey-medium/50 my-1 overflow-x-auto">
                      <MathFormula math={formulasList[selectedFormulaIndex]?.formula || formulasList[0].formula} />
                    </div>

                    <p className="font-sans text-[11.5px] text-text-muted leading-relaxed">
                      {formulasList[selectedFormulaIndex]?.desc || formulasList[0].desc}
                    </p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 2: AI KINETIC VISUALS & MOTION GIF SYNTHESIZER */}
          {activeTab === 'visuals' && (
            <div className="flex flex-col gap-5">
              {/* PRIMARY KINETIC SIMULATION STAGE */}
              <section className="bg-white-warm border border-grey-medium rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-text-primary" />
                    <span className="font-mono text-[11px] font-bold text-text-primary uppercase tracking-wider">
                      Kinetic Motion Visualizer (60fps)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSimSpeed(simSpeed === 1 ? 2 : simSpeed === 2 ? 0.5 : 1)}
                      className="font-mono text-[9.5px] font-semibold text-text-secondary bg-white-pure hover:bg-grey-soft border border-grey-medium px-2 py-0.5 rounded cursor-pointer transition-colors"
                    >
                      {simSpeed}x speed
                    </button>
                    <button
                      onClick={() => setIsSimRunning(!isSimRunning)}
                      className="w-6 h-6 rounded bg-white-pure border border-grey-medium flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
                      title={isSimRunning ? 'Pause motion simulation' : 'Play motion simulation'}
                    >
                      {isSimRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => setLightboxItem(mediaItems[0])}
                      className="w-6 h-6 rounded bg-white-pure border border-grey-medium flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
                      title="Full Screen Lightbox"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 60fps Interactive Animated SVG Stage for ALL node types */}
                <div className="border border-grey-medium rounded-xl bg-white-pure p-4 flex flex-col items-center justify-center shadow-2xs relative overflow-hidden">
                  {/* MECHANISM SIMULATION (0x01) */}
                  {nodeData.type === 'mechanism' && (
                    <svg viewBox="0 0 280 140" className="w-full max-w-[340px] h-[130px] overflow-visible">
                      <line x1="45" y1="110" x2="235" y2="110" stroke="#C5C2BC" strokeWidth="1.5" strokeDasharray="3 3" />
                      <circle cx="75" cy="110" r="4.5" fill="#4A4540" />
                      <circle cx="205" cy="110" r="4.5" fill="#4A4540" />

                      {/* Crank 1 */}
                      <line x1="75" y1="110" x2={crank1X} y2={crank1Y} stroke="#4A4540" strokeWidth="2.5" />
                      <circle cx={crank1X} cy={crank1Y} r="3.5" fill="#FFFFFF" stroke="#4A4540" strokeWidth="2" />

                      {/* Crank 2 */}
                      <line x1="205" y1="110" x2={crank2X} y2={crank2Y} stroke="#4A4540" strokeWidth="2.5" />
                      <circle cx={crank2X} cy={crank2Y} r="3.5" fill="#FFFFFF" stroke="#4A4540" strokeWidth="2" />

                      {/* Coupler Bar */}
                      <line x1={crank1X} y1={crank1Y} x2={crank2X} y2={crank2Y} stroke="#6B655A" strokeWidth="2.5" />

                      {/* Moving Coupler Midpoint & Straight Line Tracer */}
                      <circle cx={couplerMidX} cy={couplerMidY} r="5" fill="#4A4540" />
                      <line x1="45" y1="42" x2="235" y2="42" stroke="#8A8782" strokeWidth="1" strokeDasharray="2 2" />

                      {/* Velocity Vector Overlays */}
                      {showVelocityVectors && (
                        <g>
                          <line
                            x1={couplerMidX}
                            y1={couplerMidY}
                            x2={couplerMidX + 22 * Math.cos(rad)}
                            y2={couplerMidY}
                            stroke="#2563EB"
                            strokeWidth="1.8"
                          />
                          <text x={couplerMidX + 8} y={couplerMidY - 8} fill="#2563EB" fontSize="8.5" fontFamily="monospace">
                            v(t)
                          </text>
                        </g>
                      )}
                    </svg>
                  )}

                  {/* TRANSPORT SIMULATION (0x02) */}
                  {nodeData.type === 'transport' && (
                    <svg viewBox="0 0 280 140" className="w-full max-w-[340px] h-[130px] overflow-visible">
                      <line x1="30" y1="115" x2="260" y2="115" stroke="#C5C2BC" strokeWidth="1.5" />
                      <line x1="30" y1="20" x2="30" y2="115" stroke="#C5C2BC" strokeWidth="1.5" />

                      {/* Dynamic Drude frequency curve modulated by scrubAngle */}
                      {(() => {
                        const cutoffX = 40 + (scrubAngle / 360) * 180;
                        const d = `M 30 35 Q ${cutoffX * 0.7} 40, ${cutoffX} 90 T 260 112`;
                        return (
                          <>
                            <path d={d} fill="none" stroke="#4A4540" strokeWidth="2.5" />
                            <path d={`${d} L 260 115 L 30 115 Z`} fill="rgba(74,69,64,0.08)" />
                            <line x1={cutoffX} y1="20" x2={cutoffX} y2="115" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="3 3" />
                            <circle cx={cutoffX} cy={90} r="4" fill="#2563EB" />
                            <text x={cutoffX + 4} y="32" fill="#2563EB" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                              ω_c = {Math.round(50 + (scrubAngle / 360) * 350)} cm⁻¹
                            </text>
                          </>
                        );
                      })()}

                      <text x="230" y="130" fill="#8A8782" fontSize="8" fontFamily="monospace">ω (cm⁻¹)</text>
                      <text x="35" y="28" fill="#8A8782" fontSize="8" fontFamily="monospace">σ(ω)</text>
                    </svg>
                  )}

                  {/* TOPOLOGICAL SIMULATION (0x03) */}
                  {nodeData.type === 'topological' && (
                    <svg viewBox="0 0 280 140" className="w-full max-w-[340px] h-[130px] overflow-visible">
                      <circle cx="140" cy="70" r="45" fill="none" stroke="#C5C2BC" strokeWidth="1.5" strokeDasharray="3 3" />
                      <circle cx="140" cy="70" r="2.5" fill="#4A4540" />

                      {/* Moving Inflection Pole P on Circle */}
                      {(() => {
                        const poleX = 140 + 45 * Math.cos(rad);
                        const poleY = 70 - 45 * Math.sin(rad);
                        return (
                          <>
                            <line x1="140" y1="70" x2={poleX} y2={poleY} stroke="#2563EB" strokeWidth="1.5" strokeDasharray="2 2" />
                            <circle cx={poleX} cy={poleY} r="5" fill="#2563EB" />
                            <path d={`M 50 ${poleY + 30} Q ${poleX} ${poleY - 30}, 230 ${poleY + 30}`} fill="none" stroke="#4A4540" strokeWidth="2.2" />
                            <text x={poleX + 8} y={poleY - 6} fill="#2563EB" fontSize="9" fontFamily="monospace" fontWeight="bold">
                              P(ψ = {Math.round(scrubAngle)}°)
                            </text>
                          </>
                        );
                      })()}
                    </svg>
                  )}

                  {/* CONTRADICTION SIMULATION (0x04) */}
                  {nodeData.type === 'contradiction' && (
                    <svg viewBox="0 0 280 140" className="w-full max-w-[340px] h-[130px] overflow-visible">
                      <line x1="35" y1="115" x2="260" y2="115" stroke="#C5C2BC" strokeWidth="1.5" />
                      <line x1="35" y1="20" x2="35" y2="115" stroke="#C5C2BC" strokeWidth="1.5" />

                      {/* Jump transition at 104 C (377 K) */}
                      {(() => {
                        const tempK = 200 + (scrubAngle / 360) * 300;
                        const jumpX = 145;
                        const isAboveTransition = tempK >= 377;
                        const cursorX = 35 + ((tempK - 200) / 300) * 220;

                        return (
                          <>
                            <path d="M 35 105 L 145 105 L 145 35 L 260 35" fill="none" stroke="#4A4540" strokeWidth="2.5" />
                            <line x1={jumpX} y1="20" x2={jumpX} y2="115" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="3 3" />
                            <line x1={cursorX} y1="20" x2={cursorX} y2="115" stroke="#2563EB" strokeWidth="1.5" />
                            <circle cx={cursorX} cy={isAboveTransition ? 35 : 105} r="4.5" fill="#2563EB" />
                            <text x={jumpX + 5} y="30" fill="#DC2626" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                              104°C Cu₂S Phase Jump
                            </text>
                            <text x={cursorX - 25} y="15" fill="#2563EB" fontSize="8.5" fontFamily="monospace">
                              T = {Math.round(tempK)} K
                            </text>
                          </>
                        );
                      })()}

                      <text x="240" y="130" fill="#8A8782" fontSize="8" fontFamily="monospace">T (K)</text>
                      <text x="40" y="25" fill="#8A8782" fontSize="8" fontFamily="monospace">ρ (Ω·cm)</text>
                    </svg>
                  )}

                  {/* WEBSITE SIMULATION (0x00) */}
                  {nodeData.type === 'website' && (
                    <svg viewBox="0 0 280 140" className="w-full max-w-[340px] h-[130px] overflow-visible">
                      <circle cx="140" cy="70" r="50" fill="none" stroke="#C5C2BC" strokeWidth="1" strokeDasharray="3 3" />
                      <circle cx="140" cy="70" r="28" fill="none" stroke="#C5C2BC" strokeWidth="1" strokeDasharray="2 2" />

                      {/* Central Corpus Hub */}
                      <circle cx="140" cy="70" r="14" fill="#4A4540" />
                      <text x="140" y="73" fill="#FFFFFF" fontSize="8" fontFamily="monospace" textAnchor="middle">arXiv</text>

                      {/* Orbiting Satellite Citations */}
                      {(() => {
                        const sat1X = 140 + 50 * Math.cos(rad);
                        const sat1Y = 70 + 50 * Math.sin(rad);
                        const sat2X = 140 + 28 * Math.cos(rad + Math.PI);
                        const sat2Y = 70 + 28 * Math.sin(rad + Math.PI);
                        return (
                          <>
                            <line x1="140" y1="70" x2={sat1X} y2={sat1Y} stroke="#2563EB" strokeWidth="1.2" />
                            <circle cx={sat1X} cy={sat1Y} r="5" fill="#2563EB" />
                            <line x1="140" y1="70" x2={sat2X} y2={sat2Y} stroke="#4A4540" strokeWidth="1.2" />
                            <circle cx={sat2X} cy={sat2Y} r="4" fill="#4A4540" />
                            <text x={sat1X + 8} y={sat1Y + 4} fill="#2563EB" fontSize="8" fontFamily="monospace">
                              cs.RO:2307.12008
                            </text>
                          </>
                        );
                      })()}
                    </svg>
                  )}

                  {/* SPAWNED / CRYOGENIC SIMULATION (0x05) & CUSTOM NODES */}
                  {(nodeData.type === 'spawned' || (!['mechanism', 'transport', 'topological', 'contradiction', 'website'].includes(nodeData.type))) && (
                    <svg viewBox="0 0 280 140" className="w-full max-w-[340px] h-[130px] overflow-visible">
                      <line x1="30" y1="70" x2="250" y2="70" stroke="#C5C2BC" strokeWidth="1.5" strokeDasharray="3 3" />
                      <circle cx="50" cy="70" r="5" fill="#4A4540" />

                      {/* Oscillating Flexure Beam */}
                      {(() => {
                        const osc = 26 * Math.sin(rad);
                        const tipX = 210;
                        const tipY = 70 + osc;
                        return (
                          <>
                            <path d={`M 50 70 Q 130 ${70 + osc * 0.45}, ${tipX} ${tipY}`} fill="none" stroke="#4A4540" strokeWidth="3" />
                            <circle cx={tipX} cy={tipY} r="6" fill="#2563EB" />
                            <line x1={tipX} y1={70} x2={tipX} y2={tipY} stroke="#2563EB" strokeWidth="1" strokeDasharray="2 2" />
                            <text x={tipX + 8} y={tipY + 4} fill="#2563EB" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                              4.2 K Flexure (Δx ≤ 0.042%)
                            </text>
                          </>
                        );
                      })()}
                    </svg>
                  )}

                  {/* Scrub Timeline Slider */}
                  <div className="w-full flex items-center gap-2 mt-2 pt-2 border-t border-grey-soft/80">
                    <span className="font-mono text-[9px] text-text-muted">
                      {nodeData.type === 'mechanism' ? `θ: ${Math.round(scrubAngle)}°` :
                       nodeData.type === 'transport' ? `ω: ${Math.round(50 + (scrubAngle / 360) * 350)} cm⁻¹` :
                       nodeData.type === 'contradiction' ? `T: ${Math.round(200 + (scrubAngle / 360) * 300)} K` :
                       nodeData.type === 'topological' ? `ψ: ${Math.round(scrubAngle)}°` :
                       `t: ${Math.round(scrubAngle)}°`}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={Math.round(scrubAngle)}
                      onChange={(e) => {
                        setIsSimRunning(false);
                        setScrubAngle(Number(e.target.value));
                      }}
                      className="flex-1 accent-text-primary h-1.5 bg-grey-soft rounded-lg cursor-pointer"
                    />
                    <button
                      onClick={() => setShowVelocityVectors(!showVelocityVectors)}
                      className={`font-mono text-[9px] px-2 py-0.5 rounded border transition-colors ${
                        showVelocityVectors
                          ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
                          : 'bg-grey-soft text-text-muted border-grey-medium'
                      }`}
                    >
                      Vectors
                    </button>
                  </div>
                </div>

                {/* Telemetry Metrics specific to node type */}
                <div className="grid grid-cols-3 gap-2 font-mono text-[10.5px]">
                  <div className="bg-grey-soft/80 p-2 rounded-lg border border-grey-medium/70 text-center">
                    <div className="text-[8.5px] text-text-muted">
                      {nodeData.type === 'transport' ? 'CUTOFF FREQ' : nodeData.type === 'contradiction' ? 'PHASE TEMP' : 'CONTROL PARAM'}
                    </div>
                    <div className="font-semibold text-text-primary">
                      {nodeData.type === 'transport' ? `${Math.round(50 + (scrubAngle / 360) * 350)} cm⁻¹` :
                       nodeData.type === 'contradiction' ? `${Math.round(200 + (scrubAngle / 360) * 300)} K` :
                       `${Math.round(scrubAngle)}°`}
                    </div>
                  </div>
                  <div className="bg-grey-soft/80 p-2 rounded-lg border border-grey-medium/70 text-center">
                    <div className="text-[8.5px] text-text-muted">PRECISION / TOL</div>
                    <div className="font-semibold text-text-primary">Δx ≤ 0.042%</div>
                  </div>
                  <div className="bg-grey-soft/80 p-2 rounded-lg border border-grey-medium/70 text-center">
                    <div className="text-[8.5px] text-text-muted">STATE CONFIDENCE</div>
                    <div className="font-semibold text-text-primary">{data.status || 'Verified'}</div>
                  </div>
                </div>
              </section>

              {/* AI KINETIC GIF & ANIMATION SYNTHESIZER */}
              <section className="bg-white-warm border border-grey-medium rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-text-primary" />
                    <span className="font-mono text-[11px] font-bold text-text-primary uppercase tracking-wider">
                      AI Kinetic GIF Synthesizer
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-text-secondary bg-grey-soft px-2 py-0.5 rounded border border-grey-medium">
                    in-app AI engine
                  </span>
                </div>

                <p className="font-sans text-[11.5px] text-text-muted leading-relaxed">
                  Prompt the AI to construct customized 60fps kinetic simulation loops, phase diagrams, or harmonic motion GIFs for this node.
                </p>

                {/* Synthesis Input */}
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={aiGifPrompt}
                    onChange={(e) => setAiGifPrompt(e.target.value)}
                    placeholder="Specify motion parameters or trajectory..."
                    className="w-full bg-white-pure border border-grey-strong rounded-xl px-3 py-2 text-xs font-mono text-text-primary outline-none select-text"
                  />

                  <button
                    onClick={handleGenerateAiGif}
                    disabled={isGeneratingGif}
                    className="w-full py-2.5 px-4 bg-grad-panel hover:bg-grad-panel-hover border border-grey-strong rounded-xl font-mono text-[11.5px] font-semibold text-text-primary flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingGif ? (
                      <>
                        <Compass className="w-3.5 h-3.5 animate-spin" />
                        <span>Synthesizing Kinetic Simulation...</span>
                      </>
                    ) : (
                      <>
                        <Film className="w-3.5 h-3.5 text-text-secondary" />
                        <span>Synthesize Kinetic Motion GIF</span>
                      </>
                    )}
                  </button>
                </div>

                {gifGenStatus && (
                  <div className="font-mono text-[10.5px] text-center p-2 bg-grey-soft rounded-lg text-text-secondary border border-grey-medium/70">
                    {gifGenStatus}
                  </div>
                )}

                {/* Synthesized GIF Gallery List */}
                {synthesizedGifs.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-grey-soft">
                    <span className="font-mono text-[9.5px] text-text-muted uppercase tracking-wider">
                      Generated Kinetic Visuals ({synthesizedGifs.length}):
                    </span>
                    {synthesizedGifs.map((gif) => (
                      <div
                        key={gif.id}
                        className="bg-white-pure border border-grey-medium rounded-xl p-3 flex items-center justify-between"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-[11px] font-semibold text-text-primary flex items-center gap-1">
                            <Video className="w-3 h-3 text-text-secondary" /> {gif.title}
                          </span>
                          <span className="font-mono text-[9.5px] text-text-muted truncate max-w-[280px]">
                            {gif.caption}
                          </span>
                        </div>
                        <button
                          onClick={() => setLightboxItem({ title: gif.title, caption: gif.caption })}
                          className="btn-contemplative text-[10px] !py-1"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 3: PROOFS & DERIVATION JOURNEY */}
          {activeTab === 'proofs' && (
            <div className="flex flex-col gap-5">
              <section className="bg-white-warm border border-grey-medium rounded-2xl p-4 shadow-xs flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-text-primary" />
                    <span className="font-mono text-[11px] font-bold text-text-primary uppercase tracking-wider">
                      Derivation Journey
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-text-secondary">
                    Step {currentDerivationStep + 1} of {derivationSteps.length}
                  </span>
                </div>

                {/* Stepper Dots & Connector */}
                <div className="flex items-center justify-between px-2 relative my-1">
                  <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-[2px] bg-grey-medium z-0" />
                  {derivationSteps.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentDerivationStep(idx)}
                      className={`relative z-10 w-7 h-7 rounded-full font-mono text-[10.5px] font-semibold flex items-center justify-center transition-all cursor-pointer ${
                        currentDerivationStep === idx
                          ? 'bg-text-primary text-white-pure shadow-xs scale-110'
                          : idx < currentDerivationStep
                          ? 'bg-grey-strong text-white-pure'
                          : 'bg-white-pure border border-grey-medium text-text-muted hover:bg-grey-soft'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                {/* Active Step Card */}
                {derivationSteps[currentDerivationStep] && (
                  <div className="bg-white-pure border border-grey-medium rounded-xl p-4 flex flex-col gap-2 shadow-2xs animate-fade-in">
                    <span className="font-mono text-[11px] font-semibold text-text-primary">
                      {derivationSteps[currentDerivationStep].title}
                    </span>

                    <div className="py-2.5 text-center bg-grey-soft/50 rounded-lg border border-grey-medium/50 my-1 overflow-x-auto">
                      <MathFormula math={derivationSteps[currentDerivationStep].formula} />
                    </div>

                    <p className="text-[12px] text-text-secondary leading-relaxed font-sans">
                      {derivationSteps[currentDerivationStep].explanation}
                    </p>
                  </div>
                )}

                {/* Step Controls */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setCurrentDerivationStep(Math.max(0, currentDerivationStep - 1))}
                    disabled={currentDerivationStep === 0}
                    className="btn-contemplative text-[11px] !py-1.5 px-3 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-3 h-3" /> Previous Step
                  </button>
                  <button
                    onClick={() =>
                      setCurrentDerivationStep(
                        Math.min(derivationSteps.length - 1, currentDerivationStep + 1)
                      )
                    }
                    disabled={currentDerivationStep === derivationSteps.length - 1}
                    className="btn-contemplative text-[11px] !py-1.5 px-3 disabled:opacity-30"
                  >
                    Next Step <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </section>

              {/* Formula Relationships Map */}
              <section className="bg-white-warm border border-grey-medium rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                <span className="font-mono text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  Parameter Couplings &amp; Manifold Lineage
                </span>

                <div className="bg-white-pure border border-grey-medium/80 rounded-xl p-3.5 flex flex-col gap-2.5 text-xs">
                  <div className="flex items-center justify-between font-mono text-[10.5px] p-2 bg-grey-soft/60 rounded-lg border border-grey-medium/50">
                    <span className="font-semibold text-text-primary">Input Crank Velocity ω₀</span>
                    <ArrowRight className="w-3 h-3 text-text-muted" />
                    <span className="text-text-secondary">Euler-Savary Inflection (R=1.414a)</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[10.5px] p-2 bg-grey-soft/60 rounded-lg border border-grey-medium/50">
                    <span className="font-semibold text-text-primary">Curvature Radius R</span>
                    <ArrowRight className="w-3 h-3 text-text-muted" />
                    <span className="text-text-secondary">Straightness Bounds (Δx ≤ 0.042%)</span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 4: RESEARCH, AI PROBING & REFERENCES */}
          {activeTab === 'research' && (
            <div className="flex flex-col gap-5">
              <section className="bg-white-warm border border-grey-medium rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-text-primary" />
                    <span className="font-mono text-[11px] font-bold text-text-primary uppercase tracking-wider">
                      AI Literature Probe
                    </span>
                  </div>
                  <span className="font-mono text-[9.5px] text-text-secondary bg-grey-soft border border-grey-medium px-2 py-0.5 rounded">
                    arXiv / IEEE Live
                  </span>
                </div>

                <button
                  onClick={() => onLaunchProbe?.(nodeData.id)}
                  disabled={isInvestigating}
                  className="w-full py-3.5 px-4 bg-grad-panel hover:bg-grad-panel-hover border border-grey-strong rounded-2xl font-display text-[13px] font-medium text-text-primary flex items-center justify-center gap-2 transition-all duration-300 shadow-2xs cursor-pointer disabled:opacity-50"
                  aria-label="Launch deep AI investigation on the web"
                >
                  {isInvestigating ? (
                    <>
                      <Compass className="w-4 h-4 text-text-primary animate-spin" />
                      <span>{investigationMessage || 'Investigating live literature...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-text-secondary" />
                      <span>Investigate Deeper on the Web</span>
                    </>
                  )}
                </button>

                <p className="font-sans text-[11px] text-text-muted text-center leading-relaxed">
                  Crawls 2026 preprint literature to discover connected theorems and spawn verified topological nodes.
                </p>

                {/* Targeted Inquiries */}
                <div className="flex flex-col gap-1.5 mt-1 pt-2 border-t border-grey-soft">
                  <span className="font-mono text-[10px] text-text-faint font-semibold uppercase tracking-wider">
                    Targeted Discovery Inquiries:
                  </span>

                  {targetedInquiries.map((inquiry, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSpecificProbe?.(inquiry)}
                      className="btn-contemplative !justify-between !rounded-xl !p-2.5 !px-3 text-[11px] font-sans text-left"
                    >
                      <span className="flex items-center gap-1.5 text-text-primary font-medium truncate">
                        <Search className="w-3 h-3 text-text-muted shrink-0" />
                        {inquiry}
                      </span>
                      <span className="font-mono text-[9.5px] text-text-secondary flex items-center gap-0.5 shrink-0">
                        spawn <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Reference Manager */}
              <section className="bg-white-warm border border-grey-medium rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                <span className="font-mono text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-text-muted" />
                  Scholarly References ({references.length})
                </span>

                <div className="flex flex-col gap-2">
                  {references.map((ref, idx) => (
                    <div
                      key={idx}
                      className="bg-white-pure border border-grey-medium/80 rounded-xl p-3 flex flex-col gap-1.5 shadow-2xs"
                    >
                      <span className="font-sans text-[12px] font-medium text-text-primary leading-snug">
                        {ref.title}
                      </span>
                      <div className="flex items-center justify-between font-mono text-[10px] text-text-muted">
                        <span>{ref.source} ({ref.year})</span>
                        <button
                          onClick={() => handleOpenSourceInBrowser(ref.url)}
                          className="text-text-primary hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                        >
                          Open Paper <ArrowUpRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>

        {/* CONTEMPLATIVE FOOTER CONTROLS */}
        <footer className="p-3.5 px-5 border-t border-grey-medium bg-grey-soft/90 backdrop-blur-md flex items-center justify-between font-mono select-none shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-text-primary animate-pulse" />
            <span className="text-[11px] text-text-secondary font-medium">study: active</span>
          </div>

          <div className="flex items-center gap-2">
            {onDeleteNode && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-contemplative text-[10.5px] !py-1 text-red-600 hover:bg-red-50 hover:border-red-200"
                aria-label="Delete node"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            )}

            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`btn-contemplative text-[10.5px] !py-1 ${
                isPinned ? '!bg-grey-medium text-text-primary' : 'text-text-secondary'
              }`}
              aria-label="Pin node to canvas"
            >
              <Pin className="w-3 h-3" /> {isPinned ? 'Pinned' : 'Pin'}
            </button>
          </div>
        </footer>
      </aside>

      {/* LIGHTBOX MODAL */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="bg-white-pure border border-grey-medium rounded-3xl p-6 max-w-2xl w-full shadow-2xl flex flex-col gap-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-grey-soft pb-3">
              <span className="font-mono text-xs font-bold text-text-primary uppercase tracking-wider">
                {lightboxItem.title || 'Technical Diagram'}
              </span>
              <button
                onClick={() => setLightboxItem(null)}
                className="btn-contemplative !w-7 !h-7 !p-0 rounded-lg text-xs"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            <div className="h-64 bg-grad-panel rounded-2xl flex items-center justify-center p-6 border border-grey-medium/50 overflow-hidden">
              <span className="font-mono text-sm text-text-primary font-medium text-center">
                {lightboxItem.title}
              </span>
            </div>

            <p className="font-mono text-xs text-text-muted leading-relaxed">
              {lightboxItem.caption || 'Detailed high-resolution spatial schematic visualization.'}
            </p>
          </div>
        </div>
      )}
    </>
  );
};


