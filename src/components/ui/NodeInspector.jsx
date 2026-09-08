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
  Music,
  Disc,
  Volume2,
  Radio,
  Tv,
} from 'lucide-react';
import { MathFormula } from '../../utils/mathRenderer';
import { fetchLiveArchivalPhotos, fetchWebImageCandidates, cleanDomainFromUrl, searchWebVideos, searchMusicTracks } from '../../utils/visualSearchEngine';
import { generateDynamicKineticAnimation, getKineticPromptSuggestions } from '../../utils/kineticVisualGenerator';
import { useGlobalAudio } from '../../hooks/useGlobalAudio';

export function isPhysicsApplicable(nodeData) {
  if (!nodeData) return false;
  if (nodeData.type === 'mechanism') return true;
  if (nodeData.data?.isPhysics === true || nodeData.data?.hasKinetic === true) return true;
  if (nodeData.data?.isPhysics === false) return false;

  const category = (nodeData.data?.category || '').toLowerCase();
  const title = (nodeData.data?.title || '').toLowerCase();
  const desc = (nodeData.data?.description || '').toLowerCase();
  const formulaType = (nodeData.data?.formulaType || '').toLowerCase();
  const fullText = `${category} ${title} ${desc} ${formulaType}`;

  // Non-physics exclusions (e.g. food, character, biology, history, movies, etc.)
  const nonPhysicsKeywords = [
    'food', 'culinary', 'meat', 'pork', 'beef', 'vegetable', 'carrot', 'fruit', 'recipe', 'cooking',
    'character', 'protagonist', 'antagonist', 'actor', 'actress', 'television', 'tv show', 'series',
    'movie', 'film', 'biography', 'fictional', 'novel', 'literature', 'history', 'philosophy',
    'sociology', 'psychology', 'mythology', 'music', 'botany', 'plant', 'herb', 'animal', 'folklore'
  ];

  // Specific physics keywords
  const physicsKeywords = [
    'physics', 'kinematics', 'dynamics', 'mechanics', 'quantum', 'thermodynamics',
    'fluid dynamics', 'electromagnetism', 'astrophysics', 'gravitation', 'optics',
    'oscillation', 'wave mechanics', 'aerodynamics', 'biomechanics', 'linkage',
    'robotics', 'angular momentum', 'centripetal', 'kinetic', 'rotational',
    'classical mechanics', 'newtonian', 'relativity', 'harmonic motion', 'pendulum',
    'flexure', 'chebyshev'
  ];

  const hasNonPhysics = nonPhysicsKeywords.some((kw) => category.includes(kw) || title.includes(kw));
  const hasPhysics = physicsKeywords.some((kw) => fullText.includes(kw));

  if (hasNonPhysics && !category.includes('physics') && !category.includes('mechanic')) {
    return false;
  }

  return hasPhysics;
}

export function getPhotoQuickTargets(nodeData) {
  if (!nodeData) return ['High Resolution Archive', 'Historical Document', 'Scientific Diagram'];
  
  if (Array.isArray(nodeData.data?.photosQuickTargets) && nodeData.data.photosQuickTargets.length > 0) {
    return nodeData.data.photosQuickTargets;
  }

  const title = nodeData.data?.title || 'Concept';
  const category = (nodeData.data?.category || '').toLowerCase();

  if (category.includes('character') || category.includes('protagonist') || category.includes('person') || category.includes('actor')) {
    return [
      `${title} portrait`,
      `${title} scene capture`,
      `${title} archive photo`,
      `Official appearance ${title}`
    ];
  }

  if (category.includes('food') || category.includes('culinary') || category.includes('meat') || category.includes('vegetable') || category.includes('botan')) {
    return [
      `${title} harvest & produce`,
      `${title} culinary preparation`,
      `${title} macro close-up`,
      `Botanical archive ${title}`
    ];
  }

  if (category.includes('physics') || category.includes('mechanic') || category.includes('kinematic')) {
    return [
      `${title} apparatus setup`,
      `${title} technical schematic`,
      `${title} motion analysis`,
      `Laboratory experiment ${title}`
    ];
  }

  return [
    `${title} archival photography`,
    `${title} macro detail`,
    `${title} field documentation`,
    `Historical overview ${title}`
  ];
}

export function getTopicInquiries(nodeData) {
  if (!nodeData) return ['Frontier advancements & preprints', 'Key principles & dynamics', 'Historical origins'];

  const existing = Array.isArray(nodeData.data?.targetedInquiries)
    ? nodeData.data.targetedInquiries.filter(Boolean)
    : [];

  if (existing.length > 0) {
    return existing;
  }

  const title = nodeData.data?.title || 'Subject';
  const category = (nodeData.data?.category || '').toLowerCase();

  if (category.includes('character') || category.includes('protagonist') || category.includes('actor') || category.includes('fictional')) {
    return [
      `Key storylines & lore regarding ${title}`,
      `Psychological profile & character dynamics of ${title}`,
      `Behind-the-scenes & casting history of ${title}`,
      `Cultural impact & critical reception of ${title}`
    ];
  }

  if (category.includes('food') || category.includes('culinary') || category.includes('meat') || category.includes('vegetable')) {
    return [
      `Nutritional science and health impacts of ${title}`,
      `Global culinary traditions & preparation of ${title}`,
      `Agricultural cultivation & supply chains of ${title}`,
      `Flavor pairing & biochemical composition of ${title}`
    ];
  }

  if (category.includes('physics') || category.includes('mechanic') || category.includes('kinematic')) {
    return [
      `Experimental verification & tests of ${title}`,
      `Mathematical formulations & governing laws of ${title}`,
      `Modern engineering applications of ${title}`,
      `Open frontiers & unsolved anomalies in ${title}`
    ];
  }

  return [
    `Foundational principles & concepts in ${title}`,
    `Latest 2026 developments & preprints on ${title}`,
    `Historical evolution & key milestones of ${title}`,
    `Cross-disciplinary connections with ${title}`
  ];
}


export function getSpecificKineticGifForNode(nodeData, customPrompt = '') {
  return generateDynamicKineticAnimation(nodeData, customPrompt);
}

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
    case 'video':
      return {
        icon: Tv,
        label: 'Audiovisual Masterclass // Video Node',
        badge: 'VIDEO',
      };
    case 'music':
      return {
        icon: Music,
        label: 'Acoustic Synthesis // Music Node',
        badge: 'MUSIC',
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
  onUpdateNodeData,
  isInvestigating = false,
  investigationMessage = '',
}) => {
  // Global Audio Controller
  const {
    currentTrack,
    isPlaying: isGlobalAudioPlaying,
    playTrack,
    togglePlayPause,
  } = useGlobalAudio();

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
  const kineticSuggestions = getKineticPromptSuggestions(nodeData);
  const [aiGifPrompt, setAiGifPrompt] = useState(() => {
    const sugs = getKineticPromptSuggestions(nodeData);
    return sugs[0] || 'Synthesize 60fps kinetic motion loop with velocity vectors';
  });
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  const [gifGenStatus, setGifGenStatus] = useState('');
  const [synthesizedGifs, setSynthesizedGifs] = useState([]);
  const [nodePhotos, setNodePhotos] = useState([]);
  const [photoSearchQuery, setPhotoSearchQuery] = useState('');
  const [isSearchingPhotos, setIsSearchingPhotos] = useState(false);
  const [photoSearchStatus, setPhotoSearchStatus] = useState('');
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [customPhotoCaption, setCustomPhotoCaption] = useState('');
  const [showAddPhotoForm, setShowAddPhotoForm] = useState(false);

  // Dedicated Video & Music Inspector Playback States
  const [inspectorPlayingVideo, setInspectorPlayingVideo] = useState(false);
  const [resolvedInspectorVideoId, setResolvedInspectorVideoId] = useState(null);
  const [resolvedInspectorMusicPreview, setResolvedInspectorMusicPreview] = useState(null);
  const [resolvedInspectorMusicArtwork, setResolvedInspectorMusicArtwork] = useState(null);

  useEffect(() => {
    if (nodeData) {
      setInspectorPlayingVideo(false);

      // Resolve Video ID
      const vData = nodeData.data?.videoData || {};
      const directVidId =
        vData.videoId ||
        (vData.url?.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?/#\s]{11})/i)?.[1]) ||
        (nodeData.data?.url?.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?/#\s]{11})/i)?.[1]) ||
        null;
      setResolvedInspectorVideoId(directVidId);

      if (!directVidId && (nodeData.type === 'video' || nodeData.data?.mediaType === 'video' || Boolean(nodeData.data?.videoData) || Boolean(nodeData.data?.videoQuery))) {
        const vq = vData.videoQuery || nodeData.data?.videoQuery || nodeData.data?.title || '';
        if (vq) {
          searchWebVideos(vq).then((vids) => {
            if (Array.isArray(vids) && vids.length > 0 && vids[0].videoId) {
              setResolvedInspectorVideoId(vids[0].videoId);
            }
          }).catch(() => {});
        }
      }

      // Resolve Music Preview
      const mData = nodeData.data?.musicData || {};
      setResolvedInspectorMusicPreview(mData.previewUrl || null);
      setResolvedInspectorMusicArtwork(mData.artwork || nodeData.data?.primaryPhoto?.url || null);

      if (!mData.previewUrl && (nodeData.type === 'music' || nodeData.data?.mediaType === 'music' || Boolean(nodeData.data?.musicData) || Boolean(nodeData.data?.tracks))) {
        const mq = `${mData.artist || ''} ${mData.trackTitle || nodeData.data?.title || ''}`.trim();
        if (mq) {
          searchMusicTracks(mq).then((tracks) => {
            if (Array.isArray(tracks) && tracks.length > 0) {
              if (tracks[0].previewUrl) setResolvedInspectorMusicPreview(tracks[0].previewUrl);
              if (tracks[0].artwork) setResolvedInspectorMusicArtwork(tracks[0].artwork);
            }
          }).catch(() => {});
        }
      }

      const existing = nodeData.data?.photos || nodeData.data?.images || DEFAULT_NODE_PHOTOS[nodeData.type] || [];
      setNodePhotos(existing);
      const defaultQuery = nodeData.data?.visualSearchQuery || nodeData.data?.title || '';
      setPhotoSearchQuery(defaultQuery);

      const sugs = getKineticPromptSuggestions(nodeData);
      if (sugs && sugs.length > 0) {
        setAiGifPrompt(sugs[0]);
      }

      // Populate synthesized kinetic visuals from node if present
      const existingGifs = [];
      if (nodeData.data?.gifUrl) {
        existingGifs.push({
          id: `gif_active_${nodeData.id}`,
          url: nodeData.data.gifUrl,
          svg: nodeData.data.gifSvg || null,
          title: nodeData.data.gifTitle || `${nodeData.data.title || 'Kinetic'} // 60fps Dynamic Simulation`,
          caption: nodeData.data.gifCaption || `Continuous 60fps kinetic simulation loop for ${nodeData.data.title || 'node'}.`,
          type: 'gif',
          timestamp: 'Active on Card',
        });
      }
      if (Array.isArray(nodeData.data?.photos)) {
        nodeData.data.photos.forEach((p) => {
          if (p.type === 'gif' && p.url && !existingGifs.some((g) => g.url === p.url)) {
            existingGifs.push(p);
          }
        });
      }
      if (existingGifs.length > 0) {
        setSynthesizedGifs(existingGifs);
      }
    }
  }, [nodeData?.id, nodeData?.type, nodeData?.data?.title, nodeData?.data?.visualSearchQuery, nodeData?.data?.gifUrl]);

  const handleCrawlPhotos = async (query) => {
    const q = (query || photoSearchQuery || nodeData?.data?.title || 'Visual target').trim();
    if (!q) return;
    setIsSearchingPhotos(true);
    setPhotoSearchStatus(`Searching multi-source web archives for "${q}"...`);
    
    try {
      const live = await fetchWebImageCandidates(q, 10, nodeData?.data);
      if (live && live.length > 0) {
        setNodePhotos((prev) => {
          const existingUrls = new Set(prev.map((p) => (typeof p === 'string' ? p : p.url)));
          const fresh = live.filter((p) => !existingUrls.has(p.url));
          const combined = [...fresh, ...prev];
          onUpdateNodeData?.(nodeData.id, { photos: combined });
          return combined;
        });
        setPhotoSearchStatus(`✓ Attached ${live.length} authentic web photo(s)!`);
      } else {
        const fallback = {
          id: 'photo-' + Date.now(),
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
          title: `${q} // Visual Reference`,
          caption: `Archival photographic document for ${nodeData?.data?.title || q}.`,
          source: 'Open Web Visual Archive',
          platform: 'web',
          tag: 'Archival Reference',
        };
        setNodePhotos((prev) => [fallback, ...prev]);
        setPhotoSearchStatus(`✓ Attached 1 photographic reference for "${q}"!`);
      }
    } catch (err) {
      console.warn('Visual search error:', err);
      setPhotoSearchStatus('Search completed.');
    } finally {
      setIsSearchingPhotos(false);
      setTimeout(() => setPhotoSearchStatus(''), 3000);
    }
  };

  const handleSetAsPrimary = (photo) => {
    if (!nodeData?.id || !photo?.url) return;
    const rest = nodePhotos.filter((p) => (typeof p === 'string' ? p : p.url) !== photo.url);
    const updatedPhotos = [photo, ...rest];
    setNodePhotos(updatedPhotos);
    onUpdateNodeData?.(nodeData.id, {
      primaryPhoto: photo,
      photos: updatedPhotos,
      gifUrl: null, // Clear kinetic gif so primary photo immediately displays on card!
      gifSvg: null,
      isKinetic: false,
      hasKinetic: false,
      layout: {
        ...(nodeData.data?.layout || {}),
        structure: 'media_top',
      },
    });
    setGifGenStatus(`✓ Assigned "${photo.title || 'Photo'}" as primary visual artifact!`);
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

  const isPhysics = isPhysicsApplicable(nodeData);

  useEffect(() => {
    if (!isPhysics && activeTab === 'visuals') {
      setActiveTab('study');
    }
  }, [isPhysics, activeTab]);

  if (!nodeData) return null;

  const typeConfig = getNodeTypeConfig(nodeData.type);
  const TypeIcon = typeConfig.icon;

  const data = nodeData.data || {};

  const effectiveInspectorVideoId =
    resolvedInspectorVideoId ||
    data.videoData?.videoId ||
    (data.videoData?.url?.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?/#\s]{11})/i)?.[1]) ||
    (data.url?.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?/#\s]{11})/i)?.[1]) ||
    null;

  const effectiveInspectorMusicPreview = resolvedInspectorMusicPreview || data.musicData?.previewUrl || '';
  const effectiveInspectorMusicArtwork =
    resolvedInspectorMusicArtwork ||
    data.musicData?.artwork ||
    data.primaryPhoto?.url ||
    data.photos?.[0]?.url ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop';

  const isMusicInspectorPlaying =
    Boolean(currentTrack) &&
    ((effectiveInspectorMusicPreview && currentTrack.previewUrl === effectiveInspectorMusicPreview) ||
      (currentTrack.trackTitle === (data.musicData?.trackTitle || data.title) &&
        currentTrack.artist === (data.musicData?.artist || '')));

  const hasSource = Boolean(data.url || data.source);
  const hasVisuals = isPhysics;
  const hasFormulas = Boolean(data.formula || (data.formulas && data.formulas.length > 0));
  const hasInvestigation = Boolean(data.targetedInquiries || onLaunchProbe);

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
      formula: 'J = \\oint p \\, dq = \\text{const}',
      explanation: 'Action integral conservation across cyclic trajectory limits.',
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

  const targetedInquiries = getTopicInquiries(nodeData);

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

  const handleAssignSpecificGif = (gifItem) => {
    if (!onUpdateNodeData || !nodeData?.id) return;
    onUpdateNodeData(nodeData.id, {
      gifUrl: gifItem.url,
      gifSvg: gifItem.svg || null,
      gifTitle: gifItem.title,
      gifCaption: gifItem.caption,
      isKinetic: true,
      hasKinetic: true,
      media: [
        {
          url: gifItem.url,
          svg: gifItem.svg || null,
          type: 'gif',
          title: gifItem.title,
          caption: gifItem.caption,
          author: 'AI Kinetic Synthesizer',
        },
        ...(Array.isArray(nodeData.data?.media) ? nodeData.data.media.filter((m) => m.type !== 'gif') : []),
      ],
      photos: [
        {
          id: gifItem.id || `gif_${Date.now()}`,
          url: gifItem.url,
          svg: gifItem.svg || null,
          type: 'gif',
          title: gifItem.title,
          caption: gifItem.caption,
          author: 'AI Kinetic Synthesizer',
          tag: '60fps Kinetic',
        },
        ...(Array.isArray(nodeData.data?.photos) ? nodeData.data.photos.filter((p) => p.type !== 'gif') : []),
      ],
      layout: {
        ...(nodeData.data?.layout || {}),
        structure: 'kinetic_mechanism',
        width: Math.max(400, nodeData.data?.layout?.width || 0),
      },
    });
    setGifGenStatus(`✓ Kinetic movement assigned to node card: "${gifItem.title}"!`);
  };

  const handleDetachKineticGif = () => {
    if (!onUpdateNodeData || !nodeData?.id) return;
    onUpdateNodeData(nodeData.id, {
      gifUrl: null,
      gifSvg: null,
      isKinetic: false,
      hasKinetic: false,
      layout: {
        ...(nodeData.data?.layout || {}),
        structure: 'media_top',
      },
    });
    setGifGenStatus('✓ Kinetic loop detached — restored original node photography.');
  };

  // AI Kinetic Motion GIF Synthesizer Trigger
  const handleGenerateAiGif = () => {
    setIsGeneratingGif(true);
    setGifGenStatus('Synthesizing kinetic equations & motion vectors for this node...');

    setTimeout(() => {
      setGifGenStatus('Rendering 60fps continuous simulation frames...');
    }, 600);

    setTimeout(() => {
      const specificGif = getSpecificKineticGifForNode(nodeData, aiGifPrompt);
      const newGifItem = {
        id: `gif_${Date.now()}`,
        url: specificGif.url,
        svg: specificGif.svg,
        title: specificGif.title,
        caption: specificGif.caption,
        prompt: aiGifPrompt,
        timestamp: new Date().toLocaleTimeString(),
        speed: simSpeed,
        type: 'gif',
      };
      setSynthesizedGifs((prev) => [newGifItem, ...prev.filter((g) => g.url !== newGifItem.url)]);

      // Assign movement directly to the node!
      handleAssignSpecificGif(newGifItem);

      setIsGeneratingGif(false);
      setGifGenStatus(`✓ 60fps kinetic loop synthesized and assigned to node: "${specificGif.title}"!`);
      setActiveTab('visuals');
    }, 1200);
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
        className={`fixed inset-y-0 right-0 z-[70] flex flex-col w-[520px] max-w-[94vw] bg-white-pure/98 backdrop-blur-2xl border-l border-grey-medium shadow-[-20px_0_50px_rgba(0,0,0,0.12)] transition-all duration-350 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] overflow-hidden select-text ${
          isOpen ? 'translate-x-0 opacity-100 pointer-events-auto visible' : 'translate-x-full opacity-0 pointer-events-none invisible'
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
            <div className="flex items-center bg-grey-soft/70 border border-grey-medium/60 rounded-xl p-0.5 gap-0.5 shadow-3xs">
              <button
                onClick={() => onSwitchViewMode?.('inspector')}
                className={`px-2.5 py-1 rounded-lg font-sans text-[11px] font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                  viewMode === 'inspector'
                    ? 'bg-white-pure text-text-primary font-semibold shadow-xs border border-grey-medium/70 ring-1 ring-black/[0.02]'
                    : 'text-text-muted hover:text-text-primary hover:bg-white-pure/40'
                }`}
                title="Study-Focused Mode"
              >
                <FileText className="w-3 h-3" />
                <span className="hidden sm:inline">Study</span>
              </button>

              <button
                onClick={() => onSwitchViewMode?.('split')}
                className={`px-2.5 py-1 rounded-lg font-sans text-[11px] font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-white-pure text-text-primary font-semibold shadow-xs border border-grey-medium/70 ring-1 ring-black/[0.02]'
                    : 'text-text-muted hover:text-text-primary hover:bg-white-pure/40'
                }`}
                title="Split View (Side-by-side with Source Browser)"
              >
                <Columns className="w-3 h-3" />
                <span className="hidden sm:inline">Split</span>
              </button>

              <button
                onClick={() => onSwitchViewMode?.('browser')}
                className={`px-2.5 py-1 rounded-lg font-sans text-[11px] font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                  viewMode === 'browser'
                    ? 'bg-white-pure text-text-primary font-semibold shadow-xs border border-grey-medium/70 ring-1 ring-black/[0.02]'
                    : 'text-text-muted hover:text-text-primary hover:bg-white-pure/40'
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
                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer ${
                  isPinned
                    ? 'bg-grey-medium border-text-primary/30 text-text-primary'
                    : 'border-grey-medium/60 bg-white-pure/80 hover:bg-grey-soft text-text-secondary hover:text-text-primary'
                }`}
                title={isPinned ? 'Pinned to canvas' : 'Pin node'}
              >
                {isPinned ? <PinOff className="w-3.5 h-3.5 text-text-primary" /> : <Pin className="w-3.5 h-3.5 text-text-secondary" />}
              </button>

              {onDuplicateNode && (
                <button
                  onClick={() => onDuplicateNode(nodeData)}
                  className="w-7 h-7 rounded-lg border border-grey-medium/60 bg-white-pure/80 hover:bg-grey-soft text-text-secondary hover:text-text-primary flex items-center justify-center transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer"
                  title="Duplicate Node"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Direct In-App Browser Button */}
              <button
                onClick={() => handleOpenSourceInBrowser(data.url)}
                className="h-7 px-2 rounded-lg border border-grey-medium/70 bg-white-pure hover:bg-grey-soft text-text-primary flex items-center gap-1 transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer font-sans text-[11px] font-medium"
                title="Open in In-App Research Browser"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Browser</span>
              </button>

              <button
                onClick={handleExportCard}
                className="w-7 h-7 rounded-lg border border-grey-medium/60 bg-white-pure/80 hover:bg-grey-soft text-text-secondary hover:text-text-primary flex items-center justify-center transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer"
                title="Export Node Card (.json)"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              {onDeleteNode && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-7 h-7 rounded-lg border border-grey-medium/60 bg-white-pure/80 hover:bg-red-50 hover:border-red-200 text-text-secondary hover:text-red-600 flex items-center justify-center transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer"
                  title="Delete node (Del / Backspace)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg border border-grey-medium/60 bg-white-pure/80 hover:bg-grey-soft text-text-secondary hover:text-text-primary flex items-center justify-center transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer ml-1"
                aria-label="Close inspector"
              >
                <X className="w-3.5 h-3.5" />
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
          <nav className="flex items-center gap-1 p-1 bg-grey-soft/80 border border-grey-medium/60 rounded-xl mt-3 select-none overflow-x-auto scrollbar-none shadow-3xs">
            <button
              onClick={() => setActiveTab('study')}
              className={`px-3 py-1.5 rounded-lg font-sans text-[11.5px] font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                activeTab === 'study'
                  ? 'bg-white-pure text-text-primary shadow-xs border border-grey-medium/70 font-semibold ring-1 ring-black/[0.02]'
                  : 'text-text-muted hover:text-text-primary hover:bg-white-pure/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-text-secondary" />
              <span>Overview</span>
            </button>

            {isPhysics && (
              <button
                onClick={() => setActiveTab('visuals')}
                className={`px-3 py-1.5 rounded-lg font-sans text-[11.5px] font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                  activeTab === 'visuals'
                    ? 'bg-white-pure text-text-primary shadow-xs border border-grey-medium/70 font-semibold ring-1 ring-black/[0.02]'
                    : 'text-text-muted hover:text-text-primary hover:bg-white-pure/60'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kinetic Visuals &amp; GIFs</span>
              </button>
            )}

            {hasFormulas && (
              <button
                onClick={() => setActiveTab('proofs')}
                className={`px-3 py-1.5 rounded-lg font-sans text-[11.5px] font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                  activeTab === 'proofs'
                    ? 'bg-white-pure text-text-primary shadow-xs border border-grey-medium/70 font-semibold ring-1 ring-black/[0.02]'
                    : 'text-text-muted hover:text-text-primary hover:bg-white-pure/60'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5 text-text-secondary" />
                <span>Proofs ({derivationSteps.length})</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('research')}
              className={`px-3 py-1.5 rounded-lg font-sans text-[11.5px] font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                activeTab === 'research'
                  ? 'bg-white-pure text-text-primary shadow-xs border border-grey-medium/70 font-semibold ring-1 ring-black/[0.02]'
                  : 'text-text-muted hover:text-text-primary hover:bg-white-pure/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
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

              {/* KINETIC DYNAMICS ACTION BUTTON (PHYSICS NODES ONLY) */}
              {isPhysics && (
                <section className="bg-gradient-to-br from-emerald-500/[0.06] via-white-warm to-transparent border border-emerald-500/25 rounded-2xl p-4 shadow-2xs flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-emerald-950 uppercase tracking-wider">
                      <Film className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kinetic Movement &amp; 60fps Simulation</span>
                    </div>
                    <span className="font-mono text-[8.5px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300/60">
                      physics applicable
                    </span>
                  </div>

                  <p className="font-sans text-[11.5px] text-text-secondary leading-relaxed">
                    Synthesize a continuous 60fps kinetic simulation loop specifically calculated for <b className="text-text-primary">{data.title || 'this system'}</b> and assign it directly to the canvas card.
                  </p>

                  <button
                    onClick={handleGenerateAiGif}
                    disabled={isGeneratingGif}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-[#2A2623] to-[#3D3732] hover:from-[#1E1B18] hover:to-[#2B2724] active:scale-[0.98] text-white-pure rounded-xl font-sans text-[12px] font-medium flex items-center justify-center gap-2 transition-all duration-150 shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingGif ? (
                      <>
                        <Compass className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        <span>Synthesizing &amp; Assigning to Node...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-emerald-400 font-bold">⚡</span>
                        <span>Synthesize &amp; Assign 60fps Kinetic Loop</span>
                      </>
                    )}
                  </button>

                  {gifGenStatus && (
                    <div className="font-sans text-[11px] text-center p-2.5 bg-emerald-500/[0.08] rounded-xl text-emerald-900 border border-emerald-500/20 font-medium">
                      {gifGenStatus}
                    </div>
                  )}
                </section>
              )}

              
              {/* 🎵 DEEP MUSIC & FULL TRACK INSPECTION PANEL */}
              {(nodeData?.type === 'music' || data.mediaType === 'music' || Boolean(data.musicData) || Boolean(data.tracks)) && (
                <section className="bg-gradient-to-br from-[#181920] via-[#111218] to-[#0A0B0E] border border-amber-500/30 rounded-2xl p-4 shadow-md text-white flex flex-col gap-4 select-none">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-amber-400" />
                      <span className="font-mono text-[11px] font-bold text-white uppercase tracking-wider">
                        Acoustic Inspection &amp; Master Stream
                      </span>
                    </div>
                    <span className="font-mono text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                      {data.musicData?.genre || 'Music'}
                    </span>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-white/15 bg-black/60 shadow-md flex items-center justify-center">
                      {effectiveInspectorMusicArtwork ? (
                        <img
                          src={effectiveInspectorMusicArtwork}
                          alt={data.musicData?.trackTitle || data.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Disc className="w-10 h-10 text-amber-400" />
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1 leading-snug">
                      <span className="text-[10px] font-mono text-amber-300/80 uppercase tracking-wider">Master Track</span>
                      <h4 className="font-display text-[15px] font-bold text-white truncate" title={data.musicData?.trackTitle || data.title}>
                        {data.musicData?.trackTitle || data.title}
                      </h4>
                      <span className="text-[12px] text-white/80 font-medium truncate mt-0.5">
                        {data.musicData?.artist || 'Unknown Artist'}
                      </span>
                      <span className="text-[10px] text-white/50 font-mono truncate mt-1">
                        Album: {data.musicData?.album || 'Single Release'} {data.musicData?.year ? `(${data.musicData.year})` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Playback Actions */}
                  <div className="flex flex-col gap-2 pt-1 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-2">
                      {/* 1. Play in Global Audio Queue */}
                      <button
                        type="button"
                        onClick={() => {
                          const previewToPlay = effectiveInspectorMusicPreview || data.musicData?.previewUrl || '';
                          if (isMusicInspectorPlaying) {
                            togglePlayPause();
                          } else {
                            playTrack({
                              id: nodeData.id,
                              trackTitle: data.musicData?.trackTitle || data.title,
                              artist: data.musicData?.artist || 'Artist',
                              album: data.musicData?.album || '',
                              year: data.musicData?.year || '',
                              genre: data.musicData?.genre || 'Music',
                              previewUrl: previewToPlay,
                              fullTrackUrl: data.musicData?.fullTrackUrl || data.url,
                              duration: data.musicData?.duration || 30,
                              artwork: effectiveInspectorMusicArtwork,
                              source: data.musicData?.source || 'Public Audio Engine',
                            });
                          }
                        }}
                        className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-mono text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        {isMusicInspectorPlaying && isGlobalAudioPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>Pause Preview</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            <span>Play in Queue</span>
                          </>
                        )}
                      </button>

                      {/* 2. Listen to Entire Full Track */}
                      <button
                        type="button"
                        onClick={() => {
                          const fullUrl =
                            data.musicData?.fullTrackUrl ||
                            data.url ||
                            `https://www.youtube.com/results?search_query=${encodeURIComponent((data.musicData?.artist || '') + ' ' + (data.musicData?.trackTitle || data.title))}`;
                          onOpenBrowser?.(fullUrl, 'split');
                        }}
                        className="py-2.5 px-3 bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white font-mono text-[11px] font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all border border-white/15 cursor-pointer"
                        title="Listen to the complete full-length track via external stream"
                      >
                        <Radio className="w-3.5 h-3.5 text-amber-400" />
                        <span>Listen Full Track</span>
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* 🎬 DEEP VIDEO MASTERCLASS INSPECTION PANEL */}
              {(nodeData?.type === 'video' || data.mediaType === 'video' || Boolean(data.videoData) || Boolean(data.videoQuery)) && (
                <section className="bg-gradient-to-br from-[#16171E] via-[#0F1015] to-[#0A0B0E] border border-red-500/30 rounded-2xl p-4 shadow-md text-white flex flex-col gap-3 select-none">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Tv className="w-4 h-4 text-red-500" />
                      <span className="font-mono text-[11px] font-bold text-white uppercase tracking-wider">
                        Audiovisual Stream &amp; Masterclass
                      </span>
                    </div>
                    {data.videoData?.duration && (
                      <span className="font-mono text-[9px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                        {data.videoData.duration}
                      </span>
                    )}
                  </div>

                  {/* 16:9 Video Viewport */}
                  <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 relative group/insp-video">
                    {effectiveInspectorVideoId && inspectorPlayingVideo ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${effectiveInspectorVideoId}?autoplay=1&enablejsapi=1&rel=0&playsinline=1`}
                        title={data.videoData?.title || data.title || 'Video Masterclass'}
                        className="w-full h-full border-0 pointer-events-auto"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (data.videoData?.url && data.videoData.url.endsWith('.mp4') && inspectorPlayingVideo) ? (
                      <video
                        src={data.videoData.url}
                        autoPlay
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div
                        onClick={() => {
                          if (!effectiveInspectorVideoId) {
                            const vq = data.videoData?.videoQuery || data.videoQuery || data.title || '';
                            if (vq) {
                              searchWebVideos(vq).then((vids) => {
                                if (Array.isArray(vids) && vids.length > 0 && vids[0].videoId) {
                                  setResolvedInspectorVideoId(vids[0].videoId);
                                  setInspectorPlayingVideo(true);
                                }
                              }).catch(() => {});
                            }
                          } else {
                            setInspectorPlayingVideo(true);
                          }
                        }}
                        className="w-full h-full relative cursor-pointer group/insp-cover"
                        title="Click to play video inside inspector"
                      >
                        <img
                          src={
                            effectiveInspectorVideoId
                              ? `https://i.ytimg.com/vi/${effectiveInspectorVideoId}/hqdefault.jpg`
                              : (data.videoData?.thumbnail || data.primaryPhoto?.url || 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800&auto=format&fit=crop')
                          }
                          alt={data.title}
                          className="w-full h-full object-cover group-hover/insp-cover:scale-102 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 group-hover/insp-cover:from-black/60 transition-colors" />

                        {/* Large Play Beacon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-red-600 group-hover/insp-cover:bg-red-500 text-white flex items-center justify-center shadow-[0_8px_30px_rgba(239,68,68,0.5)] transition-transform group-hover/insp-cover:scale-110 active:scale-95">
                            <Play className="w-6 h-6 fill-current ml-0.5 text-white" />
                          </div>
                        </div>

                        {/* Overlay Caption & Click indicator */}
                        <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between text-[10px] font-mono text-white/90">
                          <span className="truncate max-w-[280px] font-medium">{data.videoData?.title || data.title}</span>
                          <span className="bg-black/80 px-2 py-0.5 rounded text-[8.5px] border border-white/10 font-bold text-amber-300">CLICK TO PLAY</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-white/70">
                    <span className="truncate max-w-[200px]">Uploader: {data.videoData?.uploader || 'YouTube Creator'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const vidUrl = data.videoData?.url || (effectiveInspectorVideoId ? `https://www.youtube.com/watch?v=${effectiveInspectorVideoId}` : data.url);
                        if (vidUrl) onOpenBrowser?.(vidUrl, 'split');
                      }}
                      className="text-amber-400 hover:text-amber-300 underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open in Split Browser</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </section>
              )}

              {/* ATTACHED PHOTOGRAPHY & web archive VISUAL FEED */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-text-primary" />
                    <span className="font-mono text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                      Photography &amp; Web Visuals ({nodePhotos.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowAddPhotoForm(!showAddPhotoForm)}
                      className="font-mono text-[9.5px] font-semibold text-text-secondary bg-white-pure hover:bg-grey-soft border border-grey-medium px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>Add Photo</span>
                    </button>
                  </div>
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
                      placeholder={`e.g. Search photography archives for "${data.title || 'this topic'}"...`}
                      className="flex-1 bg-white-pure border border-grey-medium/80 rounded-xl px-3 py-1.5 text-xs text-text-primary font-sans outline-none focus:border-text-primary/60 transition-colors shadow-3xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCrawlPhotos(photoSearchQuery);
                      }}
                    />
                    <button
                      onClick={() => handleCrawlPhotos(photoSearchQuery)}
                      disabled={isSearchingPhotos}
                      className="px-3.5 py-1.5 rounded-xl bg-text-primary hover:bg-[#3d3833] active:scale-[0.98] text-white-pure font-sans text-[11px] font-medium transition-all duration-150 shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
                    {getPhotoQuickTargets(nodeData).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setPhotoSearchQuery(tag);
                          handleCrawlPhotos(tag);
                        }}
                        className="font-sans text-[10px] font-medium text-text-secondary hover:text-text-primary bg-white-pure hover:bg-grey-soft border border-grey-medium/80 hover:border-text-primary/40 px-2 py-0.5 rounded-lg transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer"
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
                  {nodePhotos.map((photo, idx) => {
                    const photoUrl = typeof photo === 'string' ? photo : photo.url;
                    const domain = photo.domain || cleanDomainFromUrl(photoUrl || '');
                    const isPrimary =
                      (nodeData?.data?.primaryPhoto?.url ||
                        nodeData?.data?.photos?.[0]?.url ||
                        (typeof nodeData?.data?.photos?.[0] === 'string'
                          ? nodeData?.data?.photos?.[0]
                          : '')) === photoUrl;

                    return (
                      <div
                        key={photo.id || `insp-photo-${idx}-${photoUrl}`}
                        onClick={() =>
                          setLightboxItem({
                            title: photo.title || 'Visual Artifact',
                            caption: photo.caption || domain,
                            url: photoUrl,
                            tag: photo.tag || domain,
                          })
                        }
                        className={`group bg-white-pure border rounded-xl overflow-hidden shadow-2xs cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                          isPrimary
                            ? 'border-emerald-500 ring-1 ring-emerald-500/20'
                            : 'border-grey-medium hover:border-amber-400/80'
                        }`}
                      >
                        <div className="relative aspect-video w-full bg-grey-soft overflow-hidden">
                          <img
                            src={photo.thumbnail || photoUrl}
                            alt={photo.title || 'Visual Reference'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              if (!e.target.dataset.proxied && photoUrl) {
                                e.target.dataset.proxied = 'true';
                                e.target.src = `/api/proxy/image?url=${encodeURIComponent(photoUrl)}`;
                              }
                            }}
                          />
                          {/* Domain attribution badge */}
                          <div className="absolute top-1.5 left-1.5 bg-black/80 backdrop-blur-xs text-white-pure text-[8px] font-mono font-medium px-1.5 py-0.5 rounded flex items-center gap-1 shadow-xs">
                            <Globe className="w-2 h-2 text-amber-400" />
                            <span className="truncate max-w-[85px]">{domain}</span>
                          </div>

                          {/* Primary indicator */}
                          {isPrimary && (
                            <div className="absolute top-1.5 right-1.5 bg-emerald-600 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-xs">
                              <CheckCircle2 className="w-2 h-2" />
                              <span>PRIMARY</span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-text-primary/0 group-hover:bg-text-primary/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Maximize2 className="w-4 h-4 text-white-pure drop-shadow" />
                          </div>
                        </div>

                        <div className="p-2 flex flex-col gap-1.5 flex-1 justify-between">
                          <div className="flex flex-col gap-0.5">
                            <div className="font-mono text-[10px] font-semibold text-text-primary truncate" title={photo.title || domain}>
                              {photo.title || 'Archival Reference'}
                            </div>
                            <p className="font-sans text-[9px] text-text-muted line-clamp-2 leading-snug">
                              {photo.caption || `Origin: ${domain}`}
                            </p>
                          </div>

                          {/* 1-Click Primary Assignment Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetAsPrimary(photo);
                            }}
                            className={`w-full py-1 px-2 rounded-lg text-[9.5px] font-mono font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                              isPrimary
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold'
                                : 'bg-grey-soft hover:bg-amber-500 hover:text-white text-text-secondary border border-grey-medium/70 shadow-3xs'
                            }`}
                            title={isPrimary ? 'Currently set as primary photo' : 'Set as primary photo for this node'}
                          >
                            {isPrimary ? (
                              <>
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Active Primary</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-2.5 h-2.5 text-amber-500 group-hover:text-white" />
                                <span>Set as Primary</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
              {/* CURRENT ACTIVE CARD SIMULATION (IF ASSIGNED) */}
              {nodeData.data?.gifUrl && (
                <section className="bg-white-warm border border-grey-medium rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-mono text-[11px] font-bold text-text-primary uppercase tracking-wider">
                        Active Card Kinetic Loop (60fps)
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setLightboxItem({
                          title: (nodeData.data?.title || 'System') + ' // 60fps Dynamic Loop',
                          url: nodeData.data.gifUrl,
                          caption: `Governing relation: ${nodeData.data?.formula || 'Kinematic dynamic equations'}`,
                        })
                      }
                      className="p-1.5 rounded-lg bg-white-pure hover:bg-grey-soft text-text-primary transition-all shadow-3xs cursor-pointer flex items-center gap-1 text-[11px] font-mono border border-grey-medium"
                      title="View Fullscreen Lightbox"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-text-secondary" />
                      <span>Expand</span>
                    </button>
                  </div>
                  <div className="h-44 bg-[#12100E] rounded-xl overflow-hidden flex items-center justify-center p-2 border border-grey-medium/50 relative">
                    <img
                      src={nodeData.data.gifUrl}
                      alt={nodeData.data?.title || 'Kinetic Simulation'}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </section>
              )}

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
                  Generate continuous 60fps kinetic simulation loops specifically tailored to this physics node and assign them to the canvas card.
                </p>

                {/* AI Prompt Suggestions for this node */}
                {kineticSuggestions && kineticSuggestions.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="font-mono text-[9.5px] text-text-muted uppercase tracking-wider">
                      Suggested Physics Simulation Prompts:
                    </span>
                    <div className="flex flex-col gap-1">
                      {kineticSuggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAiGifPrompt(sug)}
                          className={`text-left font-mono text-[10px] px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                            aiGifPrompt === sug
                              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-900 font-semibold'
                              : 'bg-white-pure hover:bg-grey-soft border-grey-medium/80 text-text-secondary hover:text-text-primary'
                          }`}
                          title={`Select prompt: "${sug}"`}
                        >
                          <span className="text-emerald-600 font-bold shrink-0">⚡</span>
                          <span className="truncate">{sug}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Synthesis Input */}
                <div className="flex flex-col gap-2 pt-1">
                  <input
                    type="text"
                    value={aiGifPrompt}
                    onChange={(e) => setAiGifPrompt(e.target.value)}
                    placeholder={`e.g. 60fps continuous ${nodeData.data?.title || 'motion'} loop...`}
                    className="w-full bg-white-pure border border-grey-medium/80 rounded-xl px-3 py-2 text-xs font-sans text-text-primary outline-none focus:border-text-primary/60 shadow-3xs"
                  />

                  <button
                    onClick={handleGenerateAiGif}
                    disabled={isGeneratingGif}
                    className="w-full py-2.5 px-4 bg-text-primary hover:bg-[#3d3833] active:scale-[0.98] text-white-pure rounded-xl font-sans text-[12px] font-medium flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingGif ? (
                      <>
                        <Compass className="w-3.5 h-3.5 animate-spin" />
                        <span>Synthesizing &amp; Assigning to Node...</span>
                      </>
                    ) : (
                      <>
                        <Film className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Synthesize &amp; Assign Kinetic Loop to Node</span>
                      </>
                    )}
                  </button>
                </div>

                {gifGenStatus && (
                  <div className="font-sans text-[11px] text-center p-2.5 bg-emerald-500/[0.08] rounded-xl text-emerald-900 border border-emerald-500/20 font-medium">
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
                        className="bg-white-pure border border-grey-medium rounded-xl p-3 flex items-center justify-between gap-2 shadow-3xs"
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="font-sans text-[11.5px] font-semibold text-text-primary flex items-center gap-1 truncate">
                            <Video className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {gif.title}
                          </span>
                          <span className="font-sans text-[10px] text-text-muted truncate max-w-[240px]">
                            {gif.caption}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {nodeData?.data?.gifUrl === gif.url ? (
                            <div className="flex items-center gap-1">
                              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 font-sans text-[10px] font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                              </span>
                              <button
                                onClick={handleDetachKineticGif}
                                className="px-2 py-0.5 rounded-lg bg-grey-soft hover:bg-grey-medium text-text-muted hover:text-text-primary font-sans text-[9.5px] transition-all cursor-pointer"
                                title="Detach kinetic loop and restore photo"
                              >
                                Revert Photo
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAssignSpecificGif(gif)}
                              className="px-2.5 py-1 rounded-lg bg-text-primary hover:bg-[#3d3833] active:scale-95 text-white-pure font-sans text-[10px] font-medium transition-all shadow-3xs cursor-pointer flex items-center gap-1"
                              title="Assign this kinetic movement to the node card on canvas"
                            >
                              <span>Assign to Card</span>
                            </button>
                          )}
                          <button
                            onClick={() => setLightboxItem({ title: gif.title, caption: gif.caption, url: gif.url, svg: gif.svg })}
                            className="p-1 rounded-lg bg-grey-soft hover:bg-grey-medium text-text-primary transition-all shadow-3xs cursor-pointer"
                            title="View fullscreen"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
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

                {/* Recommended Theme Inquiries & Popular Explorations */}
                <div className="flex flex-col gap-2 mt-1 pt-2 border-t border-grey-soft">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[11px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Recommended Inquiries &amp; Popular Explorations
                    </span>
                    <span className="font-mono text-[9px] text-text-muted">
                      click to spawn
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {targetedInquiries.map((inquiry, idx) => (
                      <button
                        key={idx}
                        onClick={() => onSpecificProbe?.(inquiry)}
                        className="w-full text-left p-2.5 px-3 rounded-xl bg-white-pure hover:bg-amber-500/[0.04] border border-grey-medium/80 hover:border-amber-500/40 transition-all duration-150 active:scale-[0.99] flex items-center justify-between gap-2 shadow-3xs group cursor-pointer"
                        title={`Spawn connected node: "${inquiry}"`}
                      >
                        <span className="flex items-center gap-2 text-text-primary font-sans text-[11.5px] font-medium leading-snug truncate">
                          <Search className="w-3.5 h-3.5 text-amber-600/80 group-hover:scale-110 transition-transform shrink-0" />
                          <span className="truncate">{inquiry}</span>
                        </span>
                        <span className="font-mono text-[9px] font-semibold text-text-muted group-hover:text-amber-700 bg-grey-soft group-hover:bg-amber-100/80 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 transition-colors">
                          spawn <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
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

            <div className="h-80 bg-[#121110] rounded-2xl flex items-center justify-center p-3 border border-grey-medium/50 overflow-hidden relative">
              {lightboxItem.svg ? (
                <div
                  className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full pointer-events-none select-none"
                  dangerouslySetInnerHTML={{ __html: lightboxItem.svg }}
                />
              ) : lightboxItem.url ? (
                <img
                  src={lightboxItem.url}
                  alt={lightboxItem.title || 'Visual Simulation'}
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <span className="font-mono text-sm text-text-primary font-medium text-center">
                  {lightboxItem.title}
                </span>
              )}
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


