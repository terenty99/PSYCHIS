import React, { useState, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import { SpatialCanvas } from './layout/SpatialCanvas';
import { TopNavDock } from './components/ui/TopNavDock';
import { EmbeddedBrowser } from './components/ui/EmbeddedBrowser';
import { NodeInspector } from './components/ui/NodeInspector';
import { SparkTerminal } from './components/ui/SparkTerminal';
import { CanvasControls } from './components/ui/CanvasControls';
import { KeyboardShortcutsModal } from './components/ui/KeyboardShortcutsModal';
import { NodeTemplateModal } from './components/ui/NodeTemplateModal';
import { DeleteNodeConfirmModal } from './components/ui/DeleteNodeConfirmModal';
import { OffScreenRadar } from './components/ui/OffScreenRadar';
import { CanvasMinimap } from './components/ui/CanvasMinimap';
import { synthesizeKnowledgeCluster } from './utils/intelligentSynthesizer';
import { useNodeInspector } from './hooks/useNodeInspector';
import { RELATIONSHIP_TYPES } from './utils/colorTokens';
import { createNodeFromTemplate, NODE_TEMPLATES } from './utils/nodeTemplates';
import { findCollisionFreePosition, findClusterPositions, getNodeDimensions } from './utils/canvasPlacement';
import { queryDirectAi, getStoredAiMode, getStoredBackendUrl } from './utils/geminiClient';
import {
  loadSavedWorkspaces,
  persistWorkspaces,
  exportPsychisFile,
  parsePsychisFile,
  STORAGE_KEY_ACTIVE_ID,
  STORAGE_KEY_AUTH,
} from './utils/workspaceStorage';
import { exportTrainingJsonlFile } from './utils/trainingJsonlExporter';
import { sanitizeNodeData } from './utils/nodeSanitizer';
import { useSemanticLoom } from './hooks/useSemanticLoom';
import { autoTidyNodes } from './utils/convexHull';
import { FileUp } from 'lucide-react';

const NewInvestigationModal = lazy(() =>
  import('./components/ui/NewInvestigationModal').then((m) => ({
    default: m.NewInvestigationModal,
  }))
);
const AISettingsModal = lazy(() =>
  import('./components/ui/AISettingsModal').then((m) => ({
    default: m.AISettingsModal,
  }))
);
const AccessKeyModal = lazy(() =>
  import('./components/ui/AccessKeyModal').then((m) => ({
    default: m.AccessKeyModal,
  }))
);

const INITIAL_NODES = [
  {
    id: '0x00',
    type: 'website',
    width: 270,
    height: 210,
    position: { x: 45, y: 180 },
    data: {
      ...NODE_TEMPLATES.website.defaultData,
      category: 'website // corpus',
      status: 'verified',
    },
  },
  {
    id: '0x01',
    type: 'mechanism',
    width: 280,
    height: 330,
    position: { x: 345, y: 125 },
    data: {
      ...NODE_TEMPLATES.mechanism.defaultData,
      category: 'mechanism // planar motion',
      status: 'peer reviewed',
    },
  },
  {
    id: '0x02',
    type: 'transport',
    width: 270,
    height: 290,
    position: { x: 655, y: 125 },
    data: {
      ...NODE_TEMPLATES.transport.defaultData,
      category: 'transport // solid state',
      status: '99.1% confidence',
    },
  },
  {
    id: '0x03',
    type: 'topological',
    width: 250,
    height: 210,
    position: { x: 420, y: 480 },
    data: {
      ...NODE_TEMPLATES.topological.defaultData,
      category: 'topological geometry',
      status: 'verified',
    },
  },
  {
    id: '0x04',
    type: 'contradiction',
    width: 280,
    height: 270,
    position: { x: 965, y: 125 },
    data: {
      ...NODE_TEMPLATES.contradiction.defaultData,
      category: 'refutation // counter-thesis',
      status: 'empirically proven',
    },
  },
  {
    id: '0x05',
    type: 'spawned',
    width: 270,
    height: 240,
    position: { x: 700, y: 440 },
    hidden: false,
    data: {
      ...NODE_TEMPLATES.spawned.defaultData,
      category: 'ai discovery // 2026',
      status: 'crawled live',
    },
  },
];

const INITIAL_EDGES = [
  {
    id: 'edge-web-1a',
    source: '0x00',
    target: '0x01',
    relationshipType: RELATIONSHIP_TYPES.ORIGIN_URL,
    label: 'origin',
    description: 'Primary web documentation origin anchoring Chebyshev kinematics analysis.',
    color: '#7A7570',
    style: 'basic',
  },
  {
    id: 'edge-1a-1b',
    source: '0x01',
    target: '0x02',
    relationshipType: RELATIONSHIP_TYPES.COUPLED_SYSTEM,
    label: 'coupled',
    description: 'Dynamic coupler linking continuous crank rotation with straight-line output motion.',
    color: '#7A7570',
    style: 'basic',
  },
  {
    id: 'edge-1a-1c',
    source: '0x01',
    target: '0x03',
    relationshipType: RELATIONSHIP_TYPES.COUPLED_SYSTEM,
    label: 'geometry',
    description: 'Geometric proof mapping the five-bar spherical constraint to Chebyshev coupler curves.',
    color: '#7A7570',
    style: 'basic',
  },
  {
    id: 'edge-1b-1d',
    source: '0x02',
    target: '0x04',
    relationshipType: RELATIONSHIP_TYPES.CONTRADICTS,
    label: 'contradicts',
    description: 'Physical friction contradiction: sliding linear bearings vs Chebyshev flexure pivots in ultra-high vacuum.',
    color: '#3A3530',
    style: 'dashed',
  },
  {
    id: 'edge-1a-spawned',
    source: '0x01',
    target: '0x05',
    relationshipType: RELATIONSHIP_TYPES.DEFAULT,
    label: 'ai probe',
    description: 'Analytical investigation extending coupler midpoint inflection circle equations.',
    color: '#7A7570',
    style: 'arrowed',
  },
];

export function App() {
  // Multi-Workspace Storage & Active Board State
  const [workspaces, setWorkspaces] = useState(() => loadSavedWorkspaces());
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || 'ws-kinematics';
  });

  const currentWorkspace = useMemo(() => {
    return workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  }, [workspaces, activeWorkspaceId]);

  // Client Auth / Access Key (Gatekeeper Secret Code: 2347)
  const [clientAuth, setClientAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUTH);
      return raw ? JSON.parse(raw) : { accessKey: '2347', handle: 'Researcher 01' };
    } catch {
      return { accessKey: '2347', handle: 'Researcher 01' };
    }
  });
  const isAuthenticated = Boolean(clientAuth && clientAuth.accessKey === '2347');

  const [nodes, setNodes] = useState(() => {
    return currentWorkspace?.nodes || INITIAL_NODES;
  });
  const [edges, setEdges] = useState(() => {
    return currentWorkspace?.edges || INITIAL_EDGES;
  });

  const [pan, setPan] = useState(() => currentWorkspace?.pan || { x: 0, y: 0 });
  const [zoom, setZoom] = useState(() => currentWorkspace?.zoom || 1);

  const [clusters, setClusters] = useState(() => {
    return (
      currentWorkspace?.clusters || [
        {
          id: 'cluster-kinematics-1',
          title: 'Analytical Mechanics & Coupler Invariants',
          nodeIds: ['0x01', '0x02', '0x03'],
          color: 'stone',
          isCollapsed: false,
          category: 'Domain: Kinematics // Invariants',
          epistemicStatus: 'peer reviewed',
          coherenceScore: 0.96,
          aiSynthesizedSummary:
            'Synthesis of planar kinematic translation, dynamic coupler curves, and topological invariant mappings across constrained manifolds.',
        },
      ]
    );
  });
  const [selectedNodeIds, setSelectedNodeIds] = useState(() => ['0x01']);
  const [toolMode, setToolMode] = useState('hand'); // 'hand' | 'select'
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);

  // Modals
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isNewNodeModalOpen, setIsNewNodeModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNewInvestigationOpen, setIsNewInvestigationOpen] = useState(false);
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const [isSparkGenerating, setIsSparkGenerating] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null); // { node, connectedEdges }
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [isMinimapOpen, setIsMinimapOpen] = useState(false);

  // Drag-and-drop .psychis protocol file state
  const [isDraggingFileOver, setIsDraggingFileOver] = useState(false);

  // Inspector & Browser State Machine Hook
  const {
    selectedNodeId,
    selectNode,
    viewMode,
    setViewMode,
    isInspectorOpen,
    setIsInspectorOpen,
    isBrowserOpen,
    browserUrl,
    setBrowserUrl,
    browserViewTab,
    setBrowserViewTab,
    openBrowserWithUrl,
    closeBrowser,
    closeInspector,
    isInvestigating,
    setIsInvestigating,
    investigationMessage,
    setInvestigationMessage,
  } = useNodeInspector('0x01');

  // Multi-Selection Sync Handlers
  const handleSelectNode = useCallback(
    (nodeId, isMulti = false, shouldOpenInspector = true) => {
      if (isMulti) {
        setSelectedNodeIds((prev) => {
          const next = prev.includes(nodeId)
            ? prev.filter((id) => id !== nodeId)
            : [...prev, nodeId];
          if (next.length > 0 && !next.includes(selectedNodeId)) {
            selectNode(next[0], false);
          }
          return next;
        });
        // Never open inspector when holding Ctrl/Shift to multi-select
        closeInspector();
      } else {
        setSelectedNodeIds(nodeId ? [nodeId] : []);
        if (nodeId) {
          selectNode(nodeId, shouldOpenInspector);
        } else {
          closeInspector();
        }
      }
    },
    [selectNode, selectedNodeId, closeInspector]
  );

  const handleSelectNodes = useCallback(
    (nodeIds) => {
      const ids = Array.isArray(nodeIds) ? nodeIds : [];
      setSelectedNodeIds(ids);
      if (ids.length > 0) {
        selectNode(ids[0], false);
      }
      // When tracing all nodes, NEVER open the inspector
      closeInspector();
    },
    [selectNode, closeInspector]
  );

  const handleClearSelection = useCallback(() => {
    setSelectedNodeIds([]);
    closeInspector();
  }, [closeInspector]);

  // Autonomous Semantic Loom Hook
  const {
    ghostClusters,
    isAnalyzing: isLoomAnalyzing,
    adoptGhost,
    dismissGhost,
  } = useSemanticLoom({
    nodes,
    edges,
    clusters,
    onAdoptCluster: (newCluster) => {
      setClusters((prev) => [...prev, newCluster]);
    },
    isEnabled: false,
  });

  // Currently Selected Node Data
  const selectedNodeData = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // Auto-persist active workspace continuously to localStorage whenever nodes, edges, clusters, pan, or zoom change
  useEffect(() => {
    if (!activeWorkspaceId) return;
    const timeoutId = setTimeout(() => {
      setWorkspaces((prevWorkspaces) => {
        const updated = prevWorkspaces.map((ws) =>
          ws.id === activeWorkspaceId
            ? {
                ...ws,
                updatedAt: new Date().toISOString(),
                nodes,
                edges,
                clusters,
                pan,
                zoom,
              }
            : ws
        );
        persistWorkspaces(updated);
        return updated;
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, clusters, pan, zoom, activeWorkspaceId]);

  // Synchronous flush on exit/reload so no changes are ever lost on exit
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!activeWorkspaceId) return;
      try {
        const saved = loadSavedWorkspaces();
        const updated = saved.map((ws) =>
          ws.id === activeWorkspaceId
            ? {
                ...ws,
                updatedAt: new Date().toISOString(),
                nodes,
                edges,
                clusters,
                pan,
                zoom,
              }
            : ws
        );
        persistWorkspaces(updated);
      } catch (e) {}
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [nodes, edges, clusters, pan, zoom, activeWorkspaceId]);

  // Switch Active Workspace
  const handleSelectWorkspace = (workspaceId) => {
    const target = workspaces.find((w) => w.id === workspaceId);
    if (!target) return;
    setActiveWorkspaceId(workspaceId);
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, workspaceId);
    setNodes(target.nodes || []);
    setEdges(target.edges || []);
    setClusters(target.clusters || []);
    setPan(target.pan || { x: 0, y: 0 });
    setZoom(target.zoom || 1);
  };

  // Create New Investigation (From Scratch / Topic Seed)
  const handleCreateInvestigation = async ({ name, seedTopic }) => {
    const newId = `ws-${Date.now()}`;
    let initialNodes = [];
    let initialEdges = [];

    if (seedTopic) {
      const cluster = synthesizeKnowledgeCluster(seedTopic);
      const rootId = '0x01';
      const branchList = cluster.branchNodes || [];
      const primaryDims = getNodeDimensions(cluster.primaryNode);

      // Calculate collision-free coordinates for the investigation cluster
      const { primaryPos, branchPositions } = findClusterPositions({
        centerPos: { x: 380, y: 160 },
        primaryWidth: primaryDims.width,
        primaryHeight: primaryDims.height,
        branchNodes: branchList,
        existingNodes: [],
      });

      const rootNode = {
        id: rootId,
        type: 'spawned',
        width: primaryDims.width,
        height: primaryDims.height,
        position: primaryPos,
        data: {
          ...cluster.primaryNode,
          status: cluster.primaryNode.status || 'synthesized root',
        },
      };

      initialNodes = [rootNode];

      // Add connected branch nodes from the knowledge cluster
      if (branchList.length > 0) {
        branchList.forEach((bn, idx) => {
          const branchId = `0x0${idx + 2}`;
          const branchPos = branchPositions[idx] || {
            x: primaryPos.x + 380,
            y: primaryPos.y + idx * 260,
          };
          const bDims = getNodeDimensions(bn);

          const branchRel = RELATIONSHIP_TYPES[bn.relationship] || (bn.relationship === 'CONTRADICTS' ? RELATIONSHIP_TYPES.CONTRADICTS : RELATIONSHIP_TYPES.COUPLED_SYSTEM);
          const branchEdge = {
            id: `edge-${rootId}-${branchId}`,
            source: rootId,
            target: branchId,
            relationshipType: branchRel,
            label: bn.relationshipLabel || (branchRel === RELATIONSHIP_TYPES.CONTRADICTS ? 'contradicts' : 'coupled dynamic'),
          };

          initialNodes.push({
            id: branchId,
            type: bn.relationship === 'CONTRADICTS' ? 'contradiction' : 'spawned',
            width: bDims.width,
            height: bDims.height,
            position: branchPos,
            data: {
              ...bn,
              title: bn.title,
              category: bn.category || 'dialectical counterpart',
              status: 'derived relation',
            },
          });
          initialEdges.push(branchEdge);
        });
      }

      // Live AI enrichment (tries local backend server first, then direct Groq API)
      const enrichWithLiveAi = async () => {
        try {
          const aiMode = getStoredAiMode();
          const backendUrl = getStoredBackendUrl();
          let liveNode = null;

          if (aiMode === 'auto' || aiMode === 'backend') {
            try {
              const res = await fetch(`${backendUrl}/api/spark`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  query: `Synthesize comprehensive spatial knowledge graph and historical/scientific dossier for: ${seedTopic}`,
                  workspace_name: name,
                }),
              });
              if (res.ok) {
                const result = await res.json();
                if (result.node) liveNode = result.node;
              }
            } catch (err) {}
          }

          if (!liveNode && (aiMode === 'auto' || aiMode === 'direct')) {
            try {
              const directRes = await queryDirectAi({
                query: `Synthesize comprehensive spatial knowledge graph and historical/scientific dossier for: ${seedTopic}`,
                workspaceName: name,
                existingNodes: initialNodes,
              });
              if (directRes.node) liveNode = directRes.node;
            } catch (err) {}
          }

          if (liveNode) {
            setNodes((prev) =>
              prev.map((n) =>
                n.id === rootId
                  ? {
                      ...n,
                      data: {
                        ...n.data,
                        ...liveNode,
                        title: liveNode.title || n.data.title,
                      },
                    }
                  : n
              )
            );
          }
        } catch (e) {}
      };

      enrichWithLiveAi();
    }

    const newWs = {
      id: newId,
      name: name || `Investigation ${workspaces.length + 1}`,
      clientHandle: clientAuth?.handle || 'Researcher 01',
      updatedAt: new Date().toISOString(),
      pan: { x: 0, y: 0 },
      zoom: 1,
      nodes: initialNodes,
      edges: initialEdges,
      clusters: initialNodes.length >= 2 ? [
        {
          id: `cluster-${Date.now()}`,
          title: `${name || 'Investigation'} — Constellation`,
          nodeIds: initialNodes.map((n) => n.id),
          isCollapsed: false,
          category: 'Investigation Cluster',
          epistemicStatus: 'synthesized root',
          coherenceScore: 0.95,
          aiSynthesizedSummary: `Primary investigation cluster seeded from topic: ${seedTopic || name || 'New Topic'}`,
        }
      ] : [],
    };

    setWorkspaces((prev) => {
      const next = [newWs, ...prev];
      persistWorkspaces(next);
      return next;
    });
    setActiveWorkspaceId(newId);
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, newId);
    setNodes(initialNodes);
    setEdges(initialEdges);
    setClusters(newWs.clusters);
    setPan({ x: 0, y: 0 });
    setZoom(1);

    closeInspector();
  };

  // Clear Canvas (Current Workspace)
  const handleClearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setClusters([]);
    setSelectedNodeIds([]);
    closeInspector();
    closeBrowser();
    setIsSparkGenerating(false);
    setIsInvestigating(false);
    setInvestigationMessage('');

    // Restore focus to window and main input so user can type immediately
    setTimeout(() => {
      window.focus();
      const sparkInput = document.getElementById('spark-input');
      if (sparkInput) {
        sparkInput.focus();
      }
    }, 50);
  };

  // Export .psychis File
  const handleExportPsychis = () => {
    exportPsychisFile(currentWorkspace, nodes, edges, pan, zoom, clusters);
  };

  // Import .psychis Text
  const handleImportPsychis = (fileText) => {
    const result = parsePsychisFile(fileText);
    if (!result.success) {
      alert(`Could not open .psychis file: ${result.error}`);
      return;
    }
    const newId = `ws-imp-${Date.now()}`;
    const newWs = {
      id: newId,
      name: result.workspaceName,
      clientHandle: clientAuth.handle,
      updatedAt: new Date().toISOString(),
      pan: result.viewport.pan,
      zoom: result.viewport.zoom,
      nodes: result.nodes,
      edges: result.edges,
      clusters: result.clusters || [],
    };
    setWorkspaces((prev) => {
      const next = [newWs, ...prev];
      persistWorkspaces(next);
      return next;
    });
    setActiveWorkspaceId(newId);
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, newId);
    setNodes(result.nodes);
    setEdges(result.edges);
    setClusters(result.clusters || []);
    setPan(result.viewport.pan);
    setZoom(result.viewport.zoom);
  };

  // Save Client Auth Credentials
  const handleSaveAuth = (newAuth) => {
    setClientAuth(newAuth);
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(newAuth));
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setClientAuth(null);
    localStorage.removeItem(STORAGE_KEY_AUTH);
    setIsAuthModalOpen(true);
  };

  const handleExportTrainingJsonl = () => {
    exportTrainingJsonlFile(currentWorkspace?.name || 'Workspace', nodes, edges);
  };

  // Delete a specific node and its connected edges
  const handleDeleteNode = useCallback(
    (nodeId) => {
      setNodes((prev) => prev.filter((n) => n.id !== nodeId));
      setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNodeIds((prev) => prev.filter((id) => id !== nodeId));
      setClusters((prev) =>
        prev
          .map((c) => ({
            ...c,
            nodeIds: c.nodeIds.filter((id) => id !== nodeId),
          }))
          .filter((c) => c.nodeIds.length >= 2)
      );
      if (selectedNodeId === nodeId) {
        closeInspector();
      }
      setHoveredNodeId((prev) => (prev === nodeId ? null : prev));
    },
    [selectedNodeId, closeInspector]
  );

  // Cluster & Multi-Selection Handlers
  const handleToggleClusterCollapse = useCallback((clusterId) => {
    setClusters((prev) =>
      prev.map((c) =>
        c.id === clusterId ? { ...c, isCollapsed: !c.isCollapsed } : c
      )
    );
  }, []);

  const handleCreateCluster = useCallback(
    (nodeIdsToCluster) => {
      const ids =
        nodeIdsToCluster && nodeIdsToCluster.length > 0
          ? nodeIdsToCluster
          : selectedNodeIds;
      if (!ids || ids.length < 2) return;

      const memberNodes = nodes.filter((n) => ids.includes(n.id));
      const categories = memberNodes.map((n) => n.data?.category || '').filter(Boolean);
      const defaultCategory = categories.length > 0 ? categories[0] : 'Knowledge Constellation';

      const paletteKeys = ['amber', 'emerald', 'blue', 'purple', 'rose', 'teal', 'orange', 'stone'];
      const chosenColor = paletteKeys[clusters.length % paletteKeys.length];

      const newCluster = {
        id: `cluster-${Date.now()}`,
        title: `Cluster ${clusters.length + 1}: ${defaultCategory.split('//')[0].trim() || 'Constellation'}`,
        nodeIds: [...ids],
        color: chosenColor,
        isCollapsed: false,
        category: defaultCategory,
        epistemicStatus: 'synthesized',
        coherenceScore: 0.94,
        aiSynthesizedSummary: `Constellation uniting ${ids.length} nodes across shared conceptual coordinates.`,
      };

      setClusters((prev) => [...prev, newCluster]);
    },
    [selectedNodeIds, nodes, clusters.length]
  );

  const handleDissolveCluster = useCallback((clusterId) => {
    setClusters((prev) => prev.filter((c) => c.id !== clusterId));
  }, []);

  const handleUpdateClusterTitle = useCallback((clusterId, title) => {
    setClusters((prev) =>
      prev.map((c) => (c.id === clusterId ? { ...c, title } : c))
    );
  }, []);

  const handleUpdateClusterColor = useCallback((clusterId, colorKey) => {
    setClusters((prev) =>
      prev.map((c) => (c.id === clusterId ? { ...c, color: colorKey } : c))
    );
  }, []);

  const handleAutoTidyCluster = useCallback(
    (clusterId) => {
      const cluster = clusters.find((c) => c.id === clusterId);
      if (!cluster) return;
      const clusterNodes = nodes.filter((n) => cluster.nodeIds.includes(n.id));
      const tidiedPositions = autoTidyNodes(clusterNodes);
      setNodes((prev) =>
        prev.map((n) =>
          tidiedPositions[n.id] ? { ...n, position: tidiedPositions[n.id] } : n
        )
      );
    },
    [clusters, nodes]
  );

  const handleAutoTidySelection = useCallback(
    (nodeIdsToTidy) => {
      const ids =
        nodeIdsToTidy && nodeIdsToTidy.length > 0 ? nodeIdsToTidy : selectedNodeIds;
      if (!ids || ids.length < 2) return;
      const targetNodes = nodes.filter((n) => ids.includes(n.id));
      const tidiedPositions = autoTidyNodes(targetNodes);
      setNodes((prev) =>
        prev.map((n) =>
          tidiedPositions[n.id] ? { ...n, position: tidiedPositions[n.id] } : n
        )
      );
    },
    [selectedNodeIds, nodes]
  );

  const handleChainNodes = useCallback(
    (nodeIdsToChain) => {
      const ids =
        nodeIdsToChain && nodeIdsToChain.length > 0 ? nodeIdsToChain : selectedNodeIds;
      if (!ids || ids.length < 2) return;
      const newEdges = [];
      for (let i = 0; i < ids.length - 1; i++) {
        const source = ids[i];
        const target = ids[i + 1];
        const exists = edges.some(
          (e) =>
            (e.source === source && e.target === target) ||
            (e.source === target && e.target === source)
        );
        if (!exists) {
          newEdges.push({
            id: `edge-${source}-${target}-${Date.now()}`,
            source,
            target,
            relationshipType: RELATIONSHIP_TYPES.COUPLED_SYSTEM,
            label: 'sequential chain',
            color: '#7A7570',
            style: 'basic',
          });
        }
      }
      if (newEdges.length > 0) {
        setEdges((prev) => [...prev, ...newEdges]);
      }
    },
    [selectedNodeIds, edges]
  );

  const handleDeleteSelectedNodes = useCallback(
    (nodeIdsToDelete) => {
      const ids =
        nodeIdsToDelete && nodeIdsToDelete.length > 0
          ? nodeIdsToDelete
          : selectedNodeIds;
      if (!ids || ids.length === 0) return;
      const idSet = new Set(ids);
      setNodes((prev) => prev.filter((n) => !idSet.has(n.id)));
      setEdges((prev) => prev.filter((e) => !idSet.has(e.source) && !idSet.has(e.target)));
      setClusters((prev) =>
        prev
          .map((c) => ({
            ...c,
            nodeIds: c.nodeIds.filter((id) => !idSet.has(id)),
          }))
          .filter((c) => c.nodeIds.length >= 2)
      );
      setSelectedNodeIds([]);
      closeInspector();
    },
    [selectedNodeIds, closeInspector]
  );

  const handleSynthesizeCluster = useCallback(
    async (clusterId, nodeIds) => {
      const targetCluster = clusters.find((c) => c.id === clusterId);
      const targetIds = nodeIds || targetCluster?.nodeIds || selectedNodeIds;
      const clusterNodes = nodes.filter((n) => targetIds.includes(n.id));
      if (clusterNodes.length < 2) return;

      const backendUrl = getStoredBackendUrl();
      try {
        const res = await fetch(`${backendUrl}/api/cluster/synthesize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cluster_id: clusterId || `cluster-${Date.now()}`,
            cluster_title: targetCluster?.title || 'Synthesized Constellation',
            nodes: clusterNodes.map((n) => ({
              id: n.id,
              type: n.type,
              title: n.data?.title || n.id,
              category: n.data?.category,
              description: n.data?.description,
              status: n.data?.status,
            })),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const synthesis = data.synthesis;
          if (synthesis) {
            setClusters((prev) =>
              prev.map((c) =>
                c.id === clusterId
                  ? {
                      ...c,
                      title: synthesis.macroTitle || c.title,
                      aiSynthesizedSummary:
                        synthesis.synthesisText || c.aiSynthesizedSummary,
                      coherenceScore:
                        synthesis.coherenceScore || c.coherenceScore,
                      category: synthesis.emergentCategory || c.category,
                      epistemicStatus: synthesis.epistemicStatus || 'synthesized',
                    }
                  : c
              )
            );
            return;
          }
        }
      } catch (err) {
        console.warn('[SynthesizeCluster API fallback]', err);
      }

      // Heuristic fallback if backend is offline
      const categories = clusterNodes.map((n) => n.data?.category).filter(Boolean);
      const synthesizedCat = categories[0] || 'Interdisciplinary Core';
      setClusters((prev) =>
        prev.map((c) =>
          c.id === clusterId
            ? {
                ...c,
                aiSynthesizedSummary: `Emergent synthesis uniting ${clusterNodes.length} nodes under ${synthesizedCat}. Coherence demonstrated across mathematical, mechanical, and topological boundaries.`,
                coherenceScore: 0.94,
                epistemicStatus: 'heuristic synthesis',
              }
            : c
        )
      );
    },
    [clusters, nodes, selectedNodeIds]
  );

  // Safeguarded node deletion: asks confirmation if node has >= 2 linkages
  const requestDeleteNode = useCallback(
    (nodeId) => {
      const targetNode = nodes.find((n) => n.id === nodeId);
      if (!targetNode) return;

      const connectedEdges = edges.filter(
        (e) => e.source === nodeId || e.target === nodeId
      );

      // If it has multiple linkages (>= 2), ask user for agreement
      if (connectedEdges.length >= 2) {
        setDeleteConfirmation({
          node: targetNode,
          connectedEdges,
        });
        return;
      }

      // Otherwise delete immediately
      handleDeleteNode(nodeId);
    },
    [nodes, edges, handleDeleteNode]
  );

  const handleConfirmDeleteNode = useCallback(() => {
    if (deleteConfirmation?.node) {
      handleDeleteNode(deleteConfirmation.node.id);
    }
    setDeleteConfirmation(null);
  }, [deleteConfirmation, handleDeleteNode]);

  const handleCancelDeleteNode = useCallback(() => {
    setDeleteConfirmation(null);
  }, []);

  // Single Node Drag Movement
  const handleNodeMove = useCallback((nodeId, newPos) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, position: newPos } : node))
    );
  }, []);

  // Edge CRUD Handlers
  const handleCreateEdge = useCallback((newEdge) => {
    setEdges((prev) => [...prev, newEdge]);
  }, []);

  const handleUpdateEdge = useCallback((edgeId, updates) => {
    setEdges((prev) =>
      prev.map((e) => (e.id === edgeId ? { ...e, ...updates } : e))
    );
  }, []);

  const handleDeleteEdge = useCallback((edgeId) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
  }, []);

  // Zoom Controls
  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.15, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z * 0.85, 0.35));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Fit to View: Automatically calculates bounding box of all canvas nodes and centers them with optimal zoom
  const handleFitView = useCallback(() => {
    if (!nodes || nodes.length === 0) {
      setPan({ x: 0, y: 0 });
      setZoom(1);
      return;
    }

    const visibleNodes = nodes.filter((n) => !n.hidden);
    if (visibleNodes.length === 0) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    visibleNodes.forEach((node) => {
      const x = node.position?.x ?? 0;
      const y = node.position?.y ?? 0;
      const w = node.width || 280;
      const h = node.height || 220;

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + w > maxX) maxX = x + w;
      if (y + h > maxY) maxY = y + h;
    });

    const boxWidth = maxX - minX;
    const boxHeight = maxY - minY;
    const boxCenterX = minX + boxWidth / 2;
    const boxCenterY = minY + boxHeight / 2;

    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const screenH = typeof window !== 'undefined' ? window.innerHeight : 1080;
    const paddingX = 140;
    const paddingY = 160;

    const availableW = Math.max(screenW - paddingX * 2, 240);
    const availableH = Math.max(screenH - paddingY * 2, 240);

    const zoomX = availableW / Math.max(boxWidth, 100);
    const zoomY = availableH / Math.max(boxHeight, 100);
    const targetZoom = Math.min(Math.max(Math.min(zoomX, zoomY), 0.45), 1.15);

    const targetPanX = screenW / 2 - boxCenterX * targetZoom;
    const targetPanY = screenH / 2 - boxCenterY * targetZoom;

    setZoom(targetZoom);
    setPan({ x: Math.round(targetPanX), y: Math.round(targetPanY) });
  }, [nodes]);

  // Window Drag & Drop File Handler for .psychis Files
  useEffect(() => {
    const handleDragOver = (e) => {
      const types = e.dataTransfer?.types;
      const isFileDrag =
        types &&
        (types.includes('Files') ||
          Array.from(types).includes('Files') ||
          types.includes('application/x-moz-file'));

      if (!isFileDrag) return;

      e.preventDefault();
      setIsDraggingFileOver(true);
    };

    const handleDragLeave = (e) => {
      if (e.relatedTarget === null) {
        setIsDraggingFileOver(false);
      }
    };

    const handleDrop = (e) => {
      const types = e.dataTransfer?.types;
      const isFileDrag =
        types &&
        (types.includes('Files') ||
          Array.from(types).includes('Files') ||
          types.includes('application/x-moz-file'));

      if (!isFileDrag) return;

      e.preventDefault();
      setIsDraggingFileOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          handleImportPsychis(event.target.result);
        };
        reader.readAsText(file);
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [clientAuth]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (deleteConfirmation) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setDeleteConfirmation(null);
        }
        return;
      }

      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable) {
        if (e.key === 'Escape') document.activeElement.blur();
        return;
      }

      // If embedded browser is active, do not hijack Space (video play/pause) or canvas keys
      if (isBrowserOpen) {
        if (e.key === 'Escape') {
          closeBrowser();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        if (e.shiftKey) {
          const targetCluster = clusters.find((c) =>
            c.nodeIds.some((id) => selectedNodeIds.includes(id))
          );
          if (targetCluster) {
            handleDissolveCluster(targetCluster.id);
          }
        } else {
          if (selectedNodeIds.length >= 2) {
            handleCreateCluster(selectedNodeIds);
          }
        }
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeIds.length > 1) {
          e.preventDefault();
          handleDeleteSelectedNodes(selectedNodeIds);
          return;
        }
        const targetNodeId = hoveredNodeId || selectedNodeId;
        if (targetNodeId) {
          e.preventDefault();
          requestDeleteNode(targetNodeId);
        }
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsAnimationPaused((prev) => !prev);
      } else if (e.key === 'Escape') {
        closeBrowser();
        closeInspector();
        setIsShortcutsOpen(false);
        setIsNewNodeModalOpen(false);
        setIsAuthModalOpen(false);
        setSelectedNodeIds([]);
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const targetNode = nodes[parseInt(e.key) - 1];
        if (targetNode) {
          selectNode(targetNode.id);
          setSelectedNodeIds([targetNode.id]);
        }
      } else if (e.key.toLowerCase() === 't' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        document.getElementById('spark-input')?.focus();
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNewNodeModalOpen(true);
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        setToolMode((prev) => (prev === 'select' ? 'hand' : 'select'));
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setToolMode('hand');
      } else if (e.key.toLowerCase() === 'b' && !isBrowserOpen) {
        e.preventDefault();
        openBrowserWithUrl(browserUrl || 'psychis://home');
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        handleFitView();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsMinimapOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    closeBrowser,
    closeInspector,
    selectNode,
    selectedNodeId,
    selectedNodeIds,
    requestDeleteNode,
    handleDeleteSelectedNodes,
    handleCreateCluster,
    handleDissolveCluster,
    clusters,
    hoveredNodeId,
    deleteConfirmation,
    nodes,
    isBrowserOpen,
    openBrowserWithUrl,
    browserUrl,
    handleFitView,
  ]);

  // Create Node from Template
  const handleCreateNodeFromTemplate = ({ templateKey, customData }) => {
    const newId = `0x0${nodes.length + 1}`;
    const centerPos = {
      x: (-pan.x + window.innerWidth / 2) / zoom - 140,
      y: (-pan.y + window.innerHeight / 2) / zoom - 120,
    };
    const newNode = createNodeFromTemplate(templateKey, newId, centerPos, customData);

    setNodes((prev) => [...prev, newNode]);

    if (selectedNodeId) {
      setEdges((prev) => [
        ...prev,
        {
          id: `edge-${selectedNodeId}-${newId}`,
          source: selectedNodeId,
          target: newId,
          relationshipType: RELATIONSHIP_TYPES.DEFAULT,
          label: 'associated',
        },
      ]);
    }
  };

  // AI Web Investigation Probe Handlers
  const handleLaunchProbe = (nodeId) => {
    const target = nodes.find((n) => n.id === nodeId) || selectedNodeData;
    const title = target?.data?.title || 'Advanced scientific frontiers';
    const query = `Frontier advancements and preprints in: ${title}`;

    if (nodeId && selectedNodeId !== nodeId) {
      setSelectedNodeId(nodeId);
    }

    setIsInvestigating(true);
    setInvestigationMessage(`Probing live preprints on "${title}"...`);
    handleExecuteSparkQuery(query, nodeId || selectedNodeId).finally(() => {
      setIsInvestigating(false);
      setInvestigationMessage('');
    });
  };

  const handleSpecificProbe = (inquiry, sourceNodeId = null) => {
    if (!inquiry) return;
    const parentId = sourceNodeId || selectedNodeId;
    if (parentId && selectedNodeId !== parentId) {
      setSelectedNodeId(parentId);
    }
    setIsInvestigating(true);
    setInvestigationMessage(`Synthesizing discovery node for "${inquiry}"...`);
    handleExecuteSparkQuery(inquiry, parentId).finally(() => {
      setIsInvestigating(false);
      setInvestigationMessage('');
    });
  };

  const handleExecuteSparkQuery = async (queryText, sourceNodeId = null) => {
    const text = queryText.trim();
    if (!text) return;

    setIsSparkGenerating(true);

    const isUrl = text.startsWith('http') || (text.includes('.') && !text.includes(' ') && text.length < 120);
    const cleanUrl = isUrl ? (text.startsWith('http') ? text : `https://${text}`) : null;
    let domainTitle = text;
    if (cleanUrl) {
      try { domainTitle = new URL(cleanUrl).hostname; } catch (e) { domainTitle = text; }
    }

    const effectiveSourceId = sourceNodeId || null;
    const effectiveSourceNode = sourceNodeId ? nodes.find((n) => n.id === sourceNodeId) : null;

    let nextNum = nodes.length + 1;
    while (nodes.some((n) => n.id === `0x${nextNum.toString(16).padStart(2, '0')}`)) {
      nextNum++;
    }
    const newId = `0x${nextNum.toString(16).padStart(2, '0')}`;

    const centerPos = {
      x: (-pan.x + window.innerWidth / 2) / zoom - 140,
      y: (-pan.y + window.innerHeight / 2) / zoom - 120,
    };

    let synthesizedData = null;
    const aiMode = getStoredAiMode(); // 'auto' | 'backend' | 'direct' | 'offline'
    const backendUrl = getStoredBackendUrl();

    try {
      // 1. Try local backend server if permitted
      if (aiMode === 'auto' || aiMode === 'backend') {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);

          const response = await fetch(`${backendUrl}/api/spark`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: isUrl ? `Analyze the platform, architecture, and network topology of ${text}` : text,
              active_node_id: effectiveSourceId,
              workspace_name: currentWorkspace?.name || 'Applied Kinematics',
              context_nodes: nodes.slice(0, 15).map((n) => ({
                id: n.id,
                title: n.data?.title,
                category: n.data?.category,
                description: n.data?.description,
              })),
            }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const result = await response.json();
            if (result.node) {
              synthesizedData = result.node;
            }
          }
        } catch (err) {
          console.log('[PSYCHIS Backend offline, attempting direct Groq or synthesizer]:', err.message);
        }
      }

      // 2. Try direct client-side AI (Groq Cloud) if backend didn't provide node and mode permits
      if (!synthesizedData && (aiMode === 'auto' || aiMode === 'direct')) {
        try {
          const result = await queryDirectAi({
            query: isUrl ? `Analyze the platform, architecture, and network topology of ${text}` : text,
            activeNodeContext: effectiveSourceNode?.data || null,
            workspaceName: currentWorkspace?.name || 'Applied Kinematics',
            existingNodes: nodes,
          });
          if (result?.node) {
            synthesizedData = result.node;
          }
        } catch (err) {
          console.warn('[Direct AI query failed, falling back to intelligent synthesizer]:', err.message);
        }
      }

      // 3. Fall back to offline intelligent synthesizer
      if (!synthesizedData) {
        const cluster = synthesizeKnowledgeCluster(text, nodes);
        synthesizedData = {
          ...cluster.primaryNode,
          branchNodes: cluster.branchNodes || [],
        };
      }

      // Calculate collision-free coordinates for the full cluster using dynamic dimensions
      const cleanSynthesized = sanitizeNodeData(synthesizedData);
      const branchList = (!isUrl && Array.isArray(cleanSynthesized.branchNodes)) ? cleanSynthesized.branchNodes : [];
      const primaryDims = getNodeDimensions(cleanSynthesized);

      const { primaryPos, branchPositions } = findClusterPositions({
        centerPos,
        primaryWidth: primaryDims.width,
        primaryHeight: primaryDims.height,
        branchNodes: branchList,
        existingNodes: nodes,
      });

      const safePrimaryPos = {
        x: typeof primaryPos?.x === 'number' && !isNaN(primaryPos.x) ? primaryPos.x : 300,
        y: typeof primaryPos?.y === 'number' && !isNaN(primaryPos.y) ? primaryPos.y : 200,
      };

      const primaryNode = {
        id: newId,
        type: isUrl ? 'website' : 'spawned',
        width: primaryDims.width,
        height: primaryDims.height,
        position: safePrimaryPos,
        data: {
          ...cleanSynthesized,
          title: isUrl ? domainTitle : (cleanSynthesized.title || domainTitle),
          url: cleanUrl || cleanSynthesized.url,
          sourceUrl: cleanUrl || cleanSynthesized.sourceUrl,
          source: cleanUrl ? domainTitle : (cleanSynthesized.source || 'AI Synthesis // 2026'),
          category: cleanSynthesized.category || (isUrl ? 'live web archive // origin' : 'ai synthesis // 2026'),
          status: cleanSynthesized.status || (isUrl ? 'live crawled' : 'synthesized node'),
        },
      };

      const createdNodes = [primaryNode];
      const createdEdges = [];

      // Relational Linkage Logic:
      // The AI model can automatically connect to MORE THAN ONE NODE and connect nodes to each other!
      const candidateConnections = [];

      // 1. Explicit user probe from a specific node
      if (sourceNodeId && nodes.some((n) => n.id === sourceNodeId)) {
        const srcNode = nodes.find((n) => n.id === sourceNodeId);
        candidateConnections.push({
          source: sourceNodeId,
          target: newId,
          label: cleanSynthesized.connectionLabel || 'probe',
          explanation:
            cleanSynthesized.connectionExplanation ||
            `Investigation inquiry extending directly from "${srcNode?.data?.title || 'active topic'}".`,
          formula: cleanSynthesized.connectionFormula || null,
          style: cleanSynthesized.connectionFormula ? 'arrowed' : 'basic',
          color: '#7A7570',
        });
      }

      // 2. Structured "connections" array returned by the AI model
      if (Array.isArray(cleanSynthesized.connections)) {
        cleanSynthesized.connections.forEach((conn) => {
          if (!conn) return;
          const target = conn.targetNodeId || conn.nodeId || conn.connectedNodeId || conn.id;
          const source = conn.sourceNodeId || newId;
          if (target && target !== source) {
            candidateConnections.push({
              source: source,
              target: target,
              label: conn.connectionLabel || conn.label || '',
              explanation: conn.connectionExplanation || conn.explanation || conn.description || 'Epistemic connection between concepts.',
              formula: conn.connectionFormula || conn.formula || conn.mathematics || null,
              style: conn.style || (conn.connectionFormula || conn.formula ? 'arrowed' : 'basic'),
              color: conn.color || '#7A7570',
            });
          }
        });
      }

      // 3. Array of string node IDs ("connectedNodeIds")
      if (Array.isArray(cleanSynthesized.connectedNodeIds)) {
        cleanSynthesized.connectedNodeIds.forEach((id) => {
          if (id && id !== newId) {
            candidateConnections.push({
              source: id,
              target: newId,
              label: cleanSynthesized.connectionLabel || '',
              explanation: cleanSynthesized.connectionExplanation || 'Epistemic connection between concepts.',
              formula: cleanSynthesized.connectionFormula || null,
              style: cleanSynthesized.connectionFormula ? 'arrowed' : 'basic',
              color: '#7A7570',
            });
          }
        });
      }

      // 4. Legacy single connectedNodeId
      if (cleanSynthesized.connectedNodeId && cleanSynthesized.connectedNodeId !== newId) {
        candidateConnections.push({
          source: cleanSynthesized.connectedNodeId,
          target: newId,
          label: cleanSynthesized.connectionLabel || '',
          explanation: cleanSynthesized.connectionExplanation || 'Epistemic connection between concepts.',
          formula: cleanSynthesized.connectionFormula || null,
          style: cleanSynthesized.connectionFormula ? 'arrowed' : 'basic',
          color: '#7A7570',
        });
      }

      // Deduplicate and validate candidate connections against existing edges
      const edgeKeySet = new Set();
      edges.forEach((e) => {
        edgeKeySet.add(`${e.source}->${e.target}`);
        edgeKeySet.add(`${e.target}->${e.source}`);
      });

      candidateConnections.forEach((conn) => {
        const s = conn.source;
        const t = conn.target;
        if (!s || !t || s === t) return;

        const pairKey = `${s}->${t}`;
        const revPairKey = `${t}->${s}`;
        if (edgeKeySet.has(pairKey) || edgeKeySet.has(revPairKey)) return;

        // Verify both endpoints exist on canvas (or in newly created primary node)
        const sValid = s === newId || nodes.some((n) => n.id === s);
        const tValid = t === newId || nodes.some((n) => n.id === t);
        if (!sValid || !tValid) return;

        edgeKeySet.add(pairKey);
        edgeKeySet.add(revPairKey);

        const edgeId = `edge-${s}-${t}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        createdEdges.push({
          id: edgeId,
          source: s,
          target: t,
          relationshipType: isUrl && (s === newId || t === newId) ? RELATIONSHIP_TYPES.ORIGIN_URL : RELATIONSHIP_TYPES.DEFAULT,
          color: conn.color || '#7A7570',
          style: conn.style || 'basic',
          label: conn.label || (isUrl && (s === newId || t === newId) ? 'origin url' : ''),
          name: conn.label ? `${conn.label} Linkage` : 'Relational Linkage',
          badge: isUrl && (s === newId || t === newId) ? 'ORIGIN // CORPUS' : 'CONCEPTUAL LINKAGE',
          description: conn.explanation || 'Epistemic connection between concepts.',
          mathematics: conn.formula || null,
          coupling: 'Direct Derivation',
        });
      });

      branchList.forEach((bn, idx) => {
        const cleanBn = sanitizeNodeData(bn);
        const bDims = getNodeDimensions(cleanBn);

        let branchNum = nextNum + 1 + idx;
        while (nodes.some((n) => n.id === `0x${branchNum.toString(16).padStart(2, '0')}`) || createdNodes.some((n) => n.id === `0x${branchNum.toString(16).padStart(2, '0')}`)) {
          branchNum++;
        }
        const branchId = `0x${branchNum.toString(16).padStart(2, '0')}`;
        const rawPos = branchPositions[idx];
        const branchPos = {
          x: typeof rawPos?.x === 'number' && !isNaN(rawPos.x) ? rawPos.x : safePrimaryPos.x + 380,
          y: typeof rawPos?.y === 'number' && !isNaN(rawPos.y) ? rawPos.y : safePrimaryPos.y + idx * 260,
        };

        const branchRel = RELATIONSHIP_TYPES[cleanBn.relationship] || (cleanBn.relationship === 'CONTRADICTS' ? RELATIONSHIP_TYPES.CONTRADICTS : RELATIONSHIP_TYPES.COUPLED_SYSTEM);
        const branchEdge = {
          id: `edge-${newId}-${branchId}-${Date.now()}`,
          source: newId,
          target: branchId,
          relationshipType: branchRel,
          color: branchRel === RELATIONSHIP_TYPES.CONTRADICTS ? '#3A3530' : '#7A7570',
          style: branchRel === RELATIONSHIP_TYPES.CONTRADICTS ? 'dashed' : 'basic',
          label: cleanBn.relationshipLabel || (branchRel === RELATIONSHIP_TYPES.CONTRADICTS ? 'contradicts' : ''),
          name: cleanBn.edgeName || cleanBn.relationshipLabel || `${cleanBn.title || 'Branch'} Linkage`,
          badge: cleanBn.edgeBadge || (branchRel === RELATIONSHIP_TYPES.CONTRADICTS ? 'COUNTER-THESIS // REFUTATION' : 'COUPLED DYNAMICS'),
          description: cleanBn.edgeDescription || cleanBn.description || `Direct epistemic relationship connecting "${primaryNode.data.title}" with "${cleanBn.title}".`,
          mathematics: cleanBn.edgeMathematics || null,
          coupling: cleanBn.edgeCoupling || (branchRel === RELATIONSHIP_TYPES.CONTRADICTS ? 'Strict Logical Contradiction' : 'Direct Invariant Coupling'),
        };

        createdNodes.push({
          id: branchId,
          type: cleanBn.relationship === 'CONTRADICTS' ? 'contradiction' : 'spawned',
          width: bDims.width,
          height: bDims.height,
          position: branchPos,
          data: {
            ...cleanBn,
            title: cleanBn.title || `Branch ${idx + 1}`,
            category: cleanBn.category || 'dialectical counterpart',
            status: cleanBn.status || 'derived relation',
          },
        });
        createdEdges.push(branchEdge);

        // Check if branch node has additional connections to existing nodes
        if (cleanBn.connectedNodeId && nodes.some((n) => n.id === cleanBn.connectedNodeId)) {
          const tgt = cleanBn.connectedNodeId;
          const pairKey = `${branchId}->${tgt}`;
          const revPairKey = `${tgt}->${branchId}`;
          if (!edgeKeySet.has(pairKey) && !edgeKeySet.has(revPairKey)) {
            edgeKeySet.add(pairKey);
            edgeKeySet.add(revPairKey);
            createdEdges.push({
              id: `edge-${branchId}-${tgt}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              source: branchId,
              target: tgt,
              relationshipType: RELATIONSHIP_TYPES.DEFAULT,
              color: '#7A7570',
              style: 'basic',
              label: cleanBn.connectionLabel || '',
              name: `${cleanBn.title || 'Branch'} Linkage`,
              badge: 'CONCEPTUAL LINKAGE',
              description: cleanBn.connectionExplanation || `Direct connection with ${cleanBn.title}.`,
              mathematics: cleanBn.connectionFormula || null,
              coupling: 'Direct Derivation',
            });
          }
        }

        if (Array.isArray(cleanBn.connections)) {
          cleanBn.connections.forEach((bConn) => {
            const bTgt = bConn.targetNodeId || bConn.nodeId || bConn.connectedNodeId;
            if (bTgt && bTgt !== branchId && (nodes.some((n) => n.id === bTgt) || createdNodes.some((n) => n.id === bTgt))) {
              const pairKey = `${branchId}->${bTgt}`;
              const revPairKey = `${bTgt}->${branchId}`;
              if (!edgeKeySet.has(pairKey) && !edgeKeySet.has(revPairKey)) {
                edgeKeySet.add(pairKey);
                edgeKeySet.add(revPairKey);
                createdEdges.push({
                  id: `edge-${branchId}-${bTgt}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                  source: branchId,
                  target: bTgt,
                  relationshipType: RELATIONSHIP_TYPES.DEFAULT,
                  color: bConn.color || '#7A7570',
                  style: bConn.style || 'basic',
                  label: bConn.connectionLabel || bConn.label || '',
                  name: `${cleanBn.title || 'Branch'} Linkage`,
                  badge: 'CONCEPTUAL LINKAGE',
                  description: bConn.connectionExplanation || bConn.explanation || `Connection between ${cleanBn.title} and Node ${bTgt}.`,
                  mathematics: bConn.connectionFormula || bConn.formula || null,
                  coupling: 'Direct Derivation',
                });
              }
            }
          });
        }
      });

      setNodes((prev) => [...prev, ...createdNodes]);
      setEdges((prev) => [...prev, ...createdEdges]);
    } catch (clusterErr) {
      console.error('[Error spawning cluster in handleExecuteSparkQuery]:', clusterErr);
    } finally {
      setIsSparkGenerating(false);
    }
  };

  const handleMapToGraph = (url) => {
    if (!url) return;
    const cleanUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    let domain = url;
    try { domain = new URL(cleanUrl).hostname; } catch (e) { domain = url; }

    const newId = `0x${(nodes.length + 1).toString(16).padStart(2, '0')}`;
    const newPos = {
      x: (-pan.x + window.innerWidth / 2) / zoom - 160,
      y: (-pan.y + window.innerHeight / 2) / zoom - 130,
    };

    const newWebsiteNode = {
      id: newId,
      type: 'website',
      width: 320,
      height: 260,
      position: newPos,
      data: {
        title: domain,
        url: cleanUrl,
        sourceUrl: cleanUrl,
        source: domain,
        institution: `Web Signal // ${domain}`,
        category: 'live web archive // origin',
        status: 'mapped signal',
        description: `Live scholarly and web intelligence mapped directly from ${cleanUrl}. Connects external literature to the spatial knowledge network.`,
        detailedSynthesis: `External web entry point captured from active research session. Serves as reference signal for dialectical cross-referencing and empirical evidence mapping.`,
        references: [
          {
            title: `${domain} Live Web Reference`,
            source: domain,
            url: cleanUrl,
          }
        ]
      },
    };

    const newEdge = {
      id: `edge-${selectedNodeId || '0x01'}-${newId}`,
      source: selectedNodeId || '0x01',
      target: newId,
      relationshipType: RELATIONSHIP_TYPES.ORIGIN_URL,
      label: 'origin url',
    };

    setNodes((prev) => [...prev, newWebsiteNode]);
    setEdges((prev) => [...prev, newEdge]);
    closeBrowser();
  };

  const handleClipToNode = useCallback(({ text, url, nodeId, title }) => {
    const targetId = nodeId || selectedNodeId;
    if (!targetId) return;

    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== targetId) return n;
        const currentRefs = Array.isArray(n.data?.references) ? n.data.references : [];
        let domain = url;
        try { domain = new URL(url).hostname; } catch (e) { domain = url; }
        const newRef = {
          title: title || `${domain} Web Citation`,
          source: domain,
          url: url,
        };
        const currentDesc = n.data?.description || '';
        const updatedDesc = currentDesc
          ? `${currentDesc}\n\n[Web Citation: ${url}]`
          : `[Web Citation: ${url}]`;

        return {
          ...n,
          data: {
            ...n.data,
            references: [...currentRefs, newRef],
            description: updatedDesc,
            sourceUrl: n.data?.sourceUrl || url,
          },
        };
      })
    );
  }, [selectedNodeId]);

  const handleUpdateNodeData = useCallback((nodeId, patchData) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                ...patchData,
              },
            }
          : n
      )
    );
  }, []);

  const handleDuplicateNode = (sourceNode) => {
    if (!sourceNode) return;
    const newId = `0x${(nodes.length + 1).toString(16).padStart(2, '0')}`;
    const duplicated = {
      ...sourceNode,
      id: newId,
      position: {
        x: sourceNode.position.x + 40,
        y: sourceNode.position.y + 40,
      },
      data: {
        ...sourceNode.data,
        title: `${sourceNode.data.title || 'Node'} (Copy)`,
      },
    };
    setNodes((prev) => [...prev, duplicated]);
  };

  const handleExportNodeCard = (nodeToExport) => {
    const target = nodeToExport || selectedNodeData;
    if (!target) return;
    const blob = new Blob([JSON.stringify(target, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `psychis_node_${target.id}.json`;
    a.click();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-grad-background">
      {/* Unified VisionOS Floating Top Dock */}
      <TopNavDock
        currentWorkspace={currentWorkspace}
        workspaces={workspaces}
        nodeCount={nodes.length}
        onSelectWorkspace={handleSelectWorkspace}
        onNewWorkspace={() => setIsNewInvestigationOpen(true)}
        onExportPsychis={handleExportPsychis}
        onImportPsychis={handleImportPsychis}
        onExportTrainingJsonl={handleExportTrainingJsonl}
        onClearCanvas={handleClearCanvas}
        clientAuth={clientAuth}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAISettings={() => setIsAISettingsOpen(true)}
        onLogout={handleLogout}
        onOpenBrowser={() => openBrowserWithUrl(browserUrl || 'https://en.wikipedia.org/wiki/Special:Search')}
        onFitView={handleFitView}
      />

      {/* Spatial Canvas Container with Touchpad Pan & Zoom */}
      <SpatialCanvas
        nodes={nodes}
        edges={edges}
        selectedNodeId={selectedNodeId}
        selectedNodeIds={selectedNodeIds}
        onSelectNode={handleSelectNode}
        onSelectNodes={handleSelectNodes}
        onClearSelection={handleClearSelection}
        onNodeMove={handleNodeMove}
        onCreateEdge={handleCreateEdge}
        onUpdateEdge={handleUpdateEdge}
        onDeleteEdge={handleDeleteEdge}
        onOpenBrowser={openBrowserWithUrl}
        onInspectNode={selectNode}
        onSpecificProbe={handleSpecificProbe}
        clusters={clusters}
        ghostClusters={ghostClusters}
        onToggleClusterCollapse={handleToggleClusterCollapse}
        onSynthesizeCluster={handleSynthesizeCluster}
        onAutoTidyCluster={handleAutoTidyCluster}
        onDissolveCluster={handleDissolveCluster}
        onUpdateClusterTitle={handleUpdateClusterTitle}
        onUpdateClusterColor={handleUpdateClusterColor}
        onAdoptGhostCluster={adoptGhost}
        onDismissGhostCluster={dismissGhost}
        onCreateCluster={handleCreateCluster}
        onChainNodes={handleChainNodes}
        onAutoTidySelection={handleAutoTidySelection}
        onDeleteSelectedNodes={handleDeleteSelectedNodes}
        toolMode={toolMode}
        onToolModeChange={setToolMode}
        isAnimationPaused={isAnimationPaused}
        pan={pan}
        zoom={zoom}
        onPanChange={setPan}
        onZoomChange={setZoom}
        onImportPsychis={handleImportPsychis}
        onHoverNodeChange={setHoveredNodeId}
      />

      {/* Off-Screen Radar: Directional pointer to nodes if user panned away */}
      <OffScreenRadar
        nodes={nodes}
        pan={pan}
        zoom={zoom}
        onFitView={handleFitView}
      />

      {/* Interactive Canvas Minimap (Spatial World View) */}
      <CanvasMinimap
        nodes={nodes}
        pan={pan}
        zoom={zoom}
        onPanChange={setPan}
        onFitView={handleFitView}
        isOpen={isMinimapOpen}
        onToggle={() => setIsMinimapOpen(false)}
      />

      {/* Floating Canvas Zoom & View Controls */}
      <CanvasControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onFitView={handleFitView}
        onToggleMinimap={() => setIsMinimapOpen((prev) => !prev)}
        isMinimapOpen={isMinimapOpen}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenNewNode={() => setIsNewNodeModalOpen(true)}
        toolMode={toolMode}
        onToolModeChange={setToolMode}
      />

      {/* Embedded Scholarly Browser Panel (z-70 layer) */}
      <EmbeddedBrowser
        isOpen={isBrowserOpen}
        url={browserUrl}
        viewMode={viewMode}
        onSwitchViewMode={setViewMode}
        activeNode={selectedNodeData}
        onClose={closeBrowser}
        onMapToGraph={handleMapToGraph}
        onClipToNode={handleClipToNode}
        isInspectorOpen={isInspectorOpen}
        onUpdateNodeData={handleUpdateNodeData}
        browserViewTab={browserViewTab}
        onSwitchBrowserViewTab={setBrowserViewTab}
      />

      {/* Right-Side Light Inspector Deck (z-70 layer) */}
      <NodeInspector
        isOpen={isInspectorOpen}
        nodeData={selectedNodeData}
        viewMode={viewMode}
        onSwitchViewMode={setViewMode}
        onClose={closeInspector}
        onLaunchProbe={handleLaunchProbe}
        onSpecificProbe={handleSpecificProbe}
        onDeleteNode={requestDeleteNode}
        onOpenBrowser={openBrowserWithUrl}
        onDuplicateNode={handleDuplicateNode}
        onExportNode={handleExportNodeCard}
        onUpdateNodeData={handleUpdateNodeData}
        isInvestigating={isInvestigating}
        investigationMessage={investigationMessage}
      />

      {/* Bottom Obsidian Spark Terminal */}
      <SparkTerminal
        onExecuteQuery={handleExecuteSparkQuery}
        isGenerating={isSparkGenerating}
        onOpenSettings={() => setIsAISettingsOpen(true)}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Node Template Creator Modal */}
      <NodeTemplateModal
        isOpen={isNewNodeModalOpen}
        onClose={() => setIsNewNodeModalOpen(false)}
        onCreateNode={handleCreateNodeFromTemplate}
      />

      {/* Secret Access Key Gatekeeper & Credentials Modal */}
      {(!isAuthenticated || isAuthModalOpen) && (
        <Suspense fallback={<div className="text-center py-8">Loading Access Key Modal...</div>}>
          <AccessKeyModal
            isOpen={!isAuthenticated || isAuthModalOpen}
            isGatekeeper={!isAuthenticated}
            onClose={() => setIsAuthModalOpen(false)}
            currentAuth={clientAuth}
            onSaveAuth={handleSaveAuth}
            onLogout={handleLogout}
          />
        </Suspense>
      )}

      {/* AI Engine & API Key Settings Modal */}
      {isAISettingsOpen && (
        <Suspense fallback={<div className="text-center py-8">Loading AI Settings Modal...</div>}>
          <AISettingsModal
            isOpen={isAISettingsOpen}
            onClose={() => setIsAISettingsOpen(false)}
          />
        </Suspense>
      )}

      {/* Start New Investigation Modal (From Scratch) */}
      {isNewInvestigationOpen && (
        <Suspense fallback={<div className="text-center py-8">Loading Investigation Modal...</div>}>
          <NewInvestigationModal
            isOpen={isNewInvestigationOpen}
            onClose={() => setIsNewInvestigationOpen(false)}
            onCreateInvestigation={handleCreateInvestigation}
          />
        </Suspense>
      )}

      {/* Safeguard Node Deletion Confirmation Modal */}
      <DeleteNodeConfirmModal
        isOpen={Boolean(deleteConfirmation)}
        node={deleteConfirmation?.node}
        connectedEdges={deleteConfirmation?.connectedEdges || []}
        allNodes={nodes}
        onConfirm={handleConfirmDeleteNode}
        onCancel={handleCancelDeleteNode}
      />

      {/* Drag & Drop .psychis File Drop-Zone Overlay */}
      {isDraggingFileOver && (
        <div className="fixed inset-0 z-[100] bg-white-warm/85 backdrop-blur-md border-4 border-dashed border-grey-strong flex flex-col items-center justify-center p-8 pointer-events-none animate-in fade-in duration-150 text-text-primary">
          <FileUp className="w-16 h-16 text-text-secondary mb-4 animate-bounce" />
          <h2 className="font-display text-2xl font-semibold mb-2">
            Drop .psychis file to open workspace
          </h2>
          <p className="font-mono text-xs text-text-muted">
            Release to instantly restore all nodes, mathematical models, and organic linkages.
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
