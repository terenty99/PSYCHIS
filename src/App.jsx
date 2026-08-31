import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { SpatialCanvas } from './layout/SpatialCanvas';
import { ClockTimerWidget } from './components/ui/ClockTimerWidget';
import { EmbeddedBrowser } from './components/ui/EmbeddedBrowser';
import { NodeInspector } from './components/ui/NodeInspector';
import { SparkTerminal } from './components/ui/SparkTerminal';
import { CanvasControls } from './components/ui/CanvasControls';
import { KeyboardShortcutsModal } from './components/ui/KeyboardShortcutsModal';
import { NodeTemplateModal } from './components/ui/NodeTemplateModal';
import { WorkspaceSwitcher } from './components/ui/WorkspaceSwitcher';
import { AccessKeyModal } from './components/ui/AccessKeyModal';
import { useNodeInspector } from './hooks/useNodeInspector';
import { RELATIONSHIP_TYPES } from './utils/colorTokens';
import { createNodeFromTemplate, NODE_TEMPLATES } from './utils/nodeTemplates';
import {
  loadSavedWorkspaces,
  persistWorkspaces,
  exportPsychisFile,
  parsePsychisFile,
  STORAGE_KEY_ACTIVE_ID,
  STORAGE_KEY_AUTH,
} from './utils/workspaceStorage';
import { FileUp } from 'lucide-react';

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
  },
  {
    id: 'edge-1a-1b',
    source: '0x01',
    target: '0x02',
    relationshipType: RELATIONSHIP_TYPES.COUPLED_SYSTEM,
    label: 'coupled',
  },
  {
    id: 'edge-1a-1c',
    source: '0x01',
    target: '0x03',
    relationshipType: RELATIONSHIP_TYPES.COUPLED_SYSTEM,
    label: 'geometry',
  },
  {
    id: 'edge-1b-1d',
    source: '0x02',
    target: '0x04',
    relationshipType: RELATIONSHIP_TYPES.CONTRADICTS,
    label: 'contradicts',
  },
  {
    id: 'edge-1a-spawned',
    source: '0x01',
    target: '0x05',
    relationshipType: RELATIONSHIP_TYPES.DEFAULT,
    label: 'ai probe',
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

  // Client Auth / Access Key
  const [clientAuth, setClientAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUTH);
      return raw ? JSON.parse(raw) : { accessKey: 'psychis-alpha-2026', handle: 'Researcher 01' };
    } catch {
      return { accessKey: '', handle: 'Guest Session' };
    }
  });

  const [nodes, setNodes] = useState(() => {
    return currentWorkspace?.nodes || INITIAL_NODES;
  });
  const [edges, setEdges] = useState(() => {
    return currentWorkspace?.edges || INITIAL_EDGES;
  });

  const [pan, setPan] = useState(() => currentWorkspace?.pan || { x: 0, y: 0 });
  const [zoom, setZoom] = useState(() => currentWorkspace?.zoom || 1);

  const [isClusterCollapsed, setIsClusterCollapsed] = useState(false);
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);

  // Modals
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isNewNodeModalOpen, setIsNewNodeModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Drag & Drop .psychis File Visual Indicator
  const [isDraggingFileOver, setIsDraggingFileOver] = useState(false);

  const {
    selectedNodeId,
    selectNode,
    viewMode,
    setViewMode,
    isInspectorOpen,
    closeInspector,
    isBrowserOpen,
    browserUrl,
    openBrowserWithUrl,
    closeBrowser,
    isInvestigating,
    setIsInvestigating,
    investigationMessage,
    setInvestigationMessage,
  } = useNodeInspector('0x01');

  // Auto-Save Canvas State to Active Workspace
  useEffect(() => {
    setWorkspaces((prev) => {
      const next = prev.map((w) =>
        w.id === activeWorkspaceId
          ? {
              ...w,
              nodes,
              edges,
              pan,
              zoom,
              updatedAt: new Date().toISOString(),
            }
          : w
      );
      persistWorkspaces(next);
      return next;
    });
  }, [nodes, edges, pan, zoom, activeWorkspaceId]);

  // Switch Active Workspace
  const handleSelectWorkspace = (wsId) => {
    const target = workspaces.find((w) => w.id === wsId);
    if (!target) return;
    setActiveWorkspaceId(wsId);
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, wsId);
    setNodes(target.nodes || INITIAL_NODES);
    setEdges(target.edges || INITIAL_EDGES);
    setPan(target.pan || { x: 0, y: 0 });
    setZoom(target.zoom || 1);
  };

  // Create New Blank Canvas
  const handleNewWorkspace = () => {
    const newId = `ws-${Date.now()}`;
    const newWs = {
      id: newId,
      name: `Untitled Board ${workspaces.length + 1}`,
      clientHandle: clientAuth.handle,
      updatedAt: new Date().toISOString(),
      pan: { x: 0, y: 0 },
      zoom: 1,
      nodes: [],
      edges: [],
    };
    setWorkspaces((prev) => {
      const next = [newWs, ...prev];
      persistWorkspaces(next);
      return next;
    });
    setActiveWorkspaceId(newId);
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, newId);
    setNodes([]);
    setEdges([]);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  // Clear Canvas (Current Workspace)
  const handleClearCanvas = () => {
    setNodes([]);
    setEdges([]);
  };

  // Export .psychis File
  const handleExportPsychis = () => {
    exportPsychisFile(currentWorkspace, nodes, edges, pan, zoom);
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
    setPan(result.viewport.pan);
    setZoom(result.viewport.zoom);
  };

  // Save Client Auth Credentials
  const handleSaveAuth = (newAuth) => {
    setClientAuth(newAuth);
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(newAuth));
  };

  // Delete a specific node and its connected edges
  const handleDeleteNode = useCallback(
    (nodeId) => {
      setNodes((prev) => prev.filter((n) => n.id !== nodeId));
      setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
      if (selectedNodeId === nodeId) {
        closeInspector();
      }
    },
    [selectedNodeId, closeInspector]
  );

  // Single Node Drag Movement
  const handleNodeMove = useCallback((nodeId, newPos) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, position: newPos } : node))
    );
  }, []);

  // Zoom Controls
  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.15, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z * 0.85, 0.35));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Window Drag & Drop File Handler for .psychis Files
  useEffect(() => {
    const handleDragOver = (e) => {
      e.preventDefault();
      setIsDraggingFileOver(true);
    };
    const handleDragLeave = (e) => {
      if (e.relatedTarget === null) {
        setIsDraggingFileOver(false);
      }
    };
    const handleDrop = (e) => {
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
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        if (e.key === 'Escape') document.activeElement.blur();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          e.preventDefault();
          handleDeleteNode(selectedNodeId);
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
        if (targetNode) selectNode(targetNode.id);
      } else if (e.key.toLowerCase() === 't' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        document.getElementById('spark-input')?.focus();
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNewNodeModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeBrowser, closeInspector, selectNode, selectedNodeId, handleDeleteNode, nodes]);

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
    selectNode(newId);
  };

  // Dynamic Cluster Bounding Box
  const clusterBounds = useMemo(() => {
    if (isClusterCollapsed) {
      const n1a = nodes.find((n) => n.id === '0x01');
      if (!n1a) return null;
      return {
        x: n1a.position.x - 20,
        y: n1a.position.y - 20,
        width: 320,
        height: 370,
      };
    }

    const clusterNodeIds = ['0x01', '0x02', '0x03'];
    const clusterNodes = nodes.filter((n) => clusterNodeIds.includes(n.id) && !n.hidden);
    if (clusterNodes.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    clusterNodes.forEach((n) => {
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + (n.width || 270));
      maxY = Math.max(maxY, n.position.y + (n.height || 220));
    });

    const padding = 24;
    return {
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    };
  }, [nodes, isClusterCollapsed]);

  const handleToggleClusterCollapse = () => {
    const nextState = !isClusterCollapsed;
    setIsClusterCollapsed(nextState);
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === '0x02' || n.id === '0x03') return { ...n, hidden: nextState };
        if (n.id === '0x01' && nextState) return { ...n, position: { x: 440, y: 140 } };
        if (n.id === '0x01' && !nextState) return { ...n, position: { x: 345, y: 125 } };
        return n;
      })
    );
  };

  // AI Web Investigation Probe Simulation
  const handleLaunchProbe = (nodeId) => {
    setIsInvestigating(true);
    setInvestigationMessage('Searching arXiv & IEEE repositories...');

    setTimeout(() => {
      setInvestigationMessage('Synthesizing kinematic proof...');
    }, 800);

    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === '0x05' ? { ...n, hidden: false, position: { x: 710, y: 440 } } : n
        )
      );
      setInvestigationMessage('✓ New discovery node mapped');

      setTimeout(() => {
        setIsInvestigating(false);
        setInvestigationMessage('');
        selectNode('0x05');
      }, 700);
    }, 1600);
  };

  const handleSpecificProbe = (topic) => {
    setIsInvestigating(true);
    setInvestigationMessage(`Querying "${topic}"...`);
    setTimeout(() => handleLaunchProbe('0x01'), 400);
  };

  const handleExecuteSparkQuery = (queryText) => {
    selectNode('0x01');
    handleLaunchProbe('0x01');
  };

  const handleMapToGraph = (url) => {
    selectNode('0x00');
    closeBrowser();
  };

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
    selectNode(newId);
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

  const handleClipToNode = ({ text, url, nodeId }) => {
    if (!nodeId) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              detailedSynthesis: `${n.data.detailedSynthesis || n.data.description || ''}\n\n[Extracted Clip]: ${text}`,
            },
          };
        }
        return n;
      })
    );
  };

  const selectedNodeData = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-grad-background">
      {/* Top-Left Floating Workspace Switcher */}
      <WorkspaceSwitcher
        currentWorkspace={currentWorkspace}
        workspaces={workspaces}
        nodeCount={nodes.length}
        onSelectWorkspace={handleSelectWorkspace}
        onNewWorkspace={handleNewWorkspace}
        onExportPsychis={handleExportPsychis}
        onImportPsychis={handleImportPsychis}
        onClearCanvas={handleClearCanvas}
        clientAuth={clientAuth}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Top-Right Floating Clock & Research Timer Widget */}
      <ClockTimerWidget />

      {/* Spatial Canvas Container with Touchpad Pan & Zoom */}
      <SpatialCanvas
        nodes={nodes}
        edges={edges}
        selectedNodeId={selectedNodeId}
        onSelectNode={selectNode}
        onNodeMove={handleNodeMove}
        onOpenBrowser={openBrowserWithUrl}
        onInspectNode={selectNode}
        clusterBounds={clusterBounds}
        isClusterCollapsed={isClusterCollapsed}
        onToggleClusterCollapse={handleToggleClusterCollapse}
        isAnimationPaused={isAnimationPaused}
        pan={pan}
        zoom={zoom}
        onPanChange={setPan}
        onZoomChange={setZoom}
      />

      {/* Floating Canvas Zoom & View Controls */}
      <CanvasControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenNewNode={() => setIsNewNodeModalOpen(true)}
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
        onDeleteNode={handleDeleteNode}
        onOpenBrowser={openBrowserWithUrl}
        onDuplicateNode={handleDuplicateNode}
        onExportNode={handleExportNodeCard}
        isInvestigating={isInvestigating}
        investigationMessage={investigationMessage}
      />

      {/* Bottom Obsidian Spark Terminal */}
      <SparkTerminal onExecuteQuery={handleExecuteSparkQuery} />

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

      {/* Secret Access Key Credentials Modal */}
      <AccessKeyModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentAuth={clientAuth}
        onSaveAuth={handleSaveAuth}
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
