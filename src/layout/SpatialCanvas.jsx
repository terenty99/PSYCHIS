import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { WebsiteNode } from '../components/nodes/WebsiteNode';
import { MechanismNode } from '../components/nodes/MechanismNode';
import { TransportNode } from '../components/nodes/TransportNode';
import { TopologicalNode } from '../components/nodes/TopologicalNode';
import { ContradictionNode } from '../components/nodes/ContradictionNode';
import { SpawnedNode } from '../components/nodes/SpawnedNode';
import { OrganicLinkageLayer } from '../components/ui/OrganicLinkageLayer';
import { LinkageOptionsPopover } from '../components/ui/LinkageOptionsPopover';
import { ConvexHull } from '../components/ui/ConvexHull';
import { DynamicAtmosphericBackground } from '../components/ui/DynamicAtmosphericBackground';
import { useOrganicLinkages } from '../hooks/useOrganicLinkages';
import { useFluidPhysics } from '../hooks/useFluidPhysics';
import { getNodeDimensions } from '../utils/canvasPlacement';
import {
  FolderPlus,
  Sparkles,
  Link as LinkIcon,
  Grid,
  Trash2,
  Layers,
  X,
  Check,
} from 'lucide-react';

export const SpatialCanvas = ({
  nodes = [],
  edges = [],
  selectedNodeId,
  selectedNodeIds = [],
  onSelectNode,
  onSelectNodes,
  onClearSelection,
  onNodeMove,
  onCreateEdge,
  onUpdateEdge,
  onDeleteEdge,
  onOpenBrowser,
  onInspectNode,
  onSpecificProbe,
  // Modern cluster props
  clusters = [],
  ghostClusters = [],
  onToggleClusterCollapse,
  onSynthesizeCluster,
  onAutoTidyCluster,
  onDissolveCluster,
  onUpdateClusterTitle,
  onAdoptGhostCluster,
  onDismissGhostCluster,
  onCreateCluster,
  onChainNodes,
  onAutoTidySelection,
  onDeleteSelectedNodes,
  // Tool mode: 'hand' vs 'select'
  toolMode = 'hand',
  onToolModeChange,
  // Fallbacks for legacy props
  clusterBounds,
  clusterLabel,
  isClusterCollapsed,
  isAnimationPaused = false,
  pan = { x: 0, y: 0 },
  zoom = 1,
  onPanChange,
  onZoomChange,
  onHoverNodeChange,
}) => {
  const containerRef = useRef(null);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [isDraggingConstellation, setIsDraggingConstellation] = useState(false);
  const [isPanningCanvas, setIsPanningCanvas] = useState(false);
  const [isSpaceDown, setIsSpaceDown] = useState(false);

  // Marquee Selection State
  const [isMarqueeActive, setIsMarqueeActive] = useState(false);
  const [marqueeBox, setMarqueeBox] = useState(null); // { x, y, width, height, screenX, screenY, screenW, screenH }
  const [anticipatingNodeIds, setAnticipatingNodeIds] = useState(new Set());
  const marqueeStartRef = useRef({ x: 0, y: 0, screenX: 0, screenY: 0 });

  const dragStartRef = useRef({
    startX: 0,
    startY: 0,
    nodeX: 0,
    nodeY: 0,
    hasMoved: false,
    startTime: 0,
  });
  const constellationStartsRef = useRef({});
  const panStartRef = useRef({ startX: 0, startY: 0, panX: 0, panY: 0 });

  // Effective multi-selection set
  const effectiveSelectedIds = useMemo(() => {
    if (Array.isArray(selectedNodeIds) && selectedNodeIds.length > 0) {
      return selectedNodeIds;
    }
    return selectedNodeId ? [selectedNodeId] : [];
  }, [selectedNodeIds, selectedNodeId]);

  const selectedSet = useMemo(() => new Set(effectiveSelectedIds), [effectiveSelectedIds]);

  // Tactile Linkage Creation State
  const [isCtrlDown, setIsCtrlDown] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [linkSourceNodeId, setLinkSourceNodeId] = useState(null);
  const [editingEdgeId, setEditingEdgeId] = useState(null);
  const [measuredDims, setMeasuredDims] = useState({});
  const nodesContainerRef = useRef(null);

  const editingEdgeIdRef = useRef(editingEdgeId);
  useEffect(() => {
    editingEdgeIdRef.current = editingEdgeId;
  }, [editingEdgeId]);

  // Live measure DOM dimensions of nodes
  useEffect(() => {
    const container = nodesContainerRef.current;
    if (!container) return;

    let rafId = null;

    const measureAll = () => {
      const articles = container.querySelectorAll('article[data-node-id]');
      if (!articles || articles.length === 0) return;

      const updates = {};
      let hasChanges = false;

      articles.forEach((art) => {
        const id = art.getAttribute('data-node-id');
        if (!id) return;
        const w = art.offsetWidth;
        const h = art.offsetHeight;
        if (w > 0 && h > 0) {
          updates[id] = { width: w, height: h };
          if (
            !measuredDims[id] ||
            Math.abs(measuredDims[id].width - w) > 1 ||
            Math.abs(measuredDims[id].height - h) > 1
          ) {
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        setMeasuredDims((prev) => ({ ...prev, ...updates }));
      }
    };

    measureAll();

    const resizeObserver = new ResizeObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measureAll);
    });

    const articles = container.querySelectorAll('article[data-node-id]');
    articles.forEach((art) => resizeObserver.observe(art));

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [nodes]);

  const { resolveFluidRepulsion, resolveSemanticGravitation } = useFluidPhysics();
  const { calculatedEdges } = useOrganicLinkages(nodes, edges, measuredDims, clusters);

  const suppressClickRef = useRef(false);

  // Keyboard shortcut listener for V (select), H (hand), Space (pan), Ctrl (link), Esc (clear)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in inputs or textareas
      if (
        e.target.closest('input, textarea, [contenteditable="true"], select, #spark-terminal')
      ) {
        return;
      }

      if (e.key === 'Control' || e.key === 'Meta' || e.ctrlKey || e.metaKey) {
        setIsCtrlDown(true);
      }

      if (e.code === 'Space' && !isSpaceDown) {
        setIsSpaceDown(true);
      }

      if (e.key === 'v' || e.key === 'V') {
        onToolModeChange?.('select');
      } else if (e.key === 'h' || e.key === 'H') {
        onToolModeChange?.('hand');
      } else if (e.key === 'Escape') {
        if (!editingEdgeIdRef.current) {
          setLinkSourceNodeId(null);
        }
        onClearSelection?.();
        setAnticipatingNodeIds(new Set());
        setIsMarqueeActive(false);
        setMarqueeBox(null);
      }
    };

    const handleKeyUp = (e) => {
      if (!e.ctrlKey && !e.metaKey) {
        setIsCtrlDown(false);
        if (!editingEdgeIdRef.current) {
          setLinkSourceNodeId(null);
        }
      }
      if (e.code === 'Space') {
        setIsSpaceDown(false);
      }
    };

    const handleBlur = () => {
      setIsCtrlDown(false);
      setIsSpaceDown(false);
      if (!editingEdgeIdRef.current) {
        setLinkSourceNodeId(null);
      }
      setHoveredNodeId(null);
      onHoverNodeChange?.(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isSpaceDown, onToolModeChange, onClearSelection, onHoverNodeChange]);

  // Touchpad / Trackpad Gesture Handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (
        e.target.closest(
          'aside, #node-inspector, #embedded-browser, #spark-terminal, [role="dialog"], .overflow-y-auto, .overflow-auto, input, textarea, select'
        )
      ) {
        return;
      }

      e.preventDefault();

      if (e.ctrlKey || Math.abs(e.deltaZ) > 0) {
        const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
        const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.35), 2.5);

        const rect = container.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;

        const newPanX = cursorX - ((cursorX - pan.x) * newZoom) / zoom;
        const newPanY = cursorY - ((cursorY - pan.y) * newZoom) / zoom;

        onZoomChange(newZoom);
        onPanChange({ x: newPanX, y: newPanY });
      } else {
        onPanChange({
          x: pan.x - e.deltaX * 1.2,
          y: pan.y - e.deltaY * 1.2,
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [pan, zoom, onPanChange, onZoomChange]);

  // Pointer Down for Nodes or Canvas Background
  const handlePointerDown = useCallback(
    (e, nodeId = null) => {
      if (
        e.target.closest(
          'button, input, a, textarea, #spark-terminal, aside, footer, [role="search"], [role="dialog"], #atelier-action-dock'
        )
      ) {
        return;
      }

      if (nodeId) {
        e.stopPropagation();

        const isCtrl = e.ctrlKey || e.metaKey || isCtrlDown;
        const isShift = e.shiftKey;

        // Holding Ctrl: Tactile Link Creation
        if (isCtrl || linkSourceNodeId) {
          dragStartRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            nodeX: 0,
            nodeY: 0,
            hasMoved: false,
            startTime: Date.now(),
          };
          suppressClickRef.current = false;
          return;
        }

        // Shift-click toggles selection without dragging
        if (isShift) {
          onSelectNode?.(nodeId, true);
          return;
        }

        // Grabbing node to move: determine if constellation move or single
        const targetNode = nodes.find((n) => n.id === nodeId);
        if (!targetNode) return;

        const isAlreadySelected = selectedSet.has(nodeId);
        const shouldDragConstellation = isAlreadySelected && effectiveSelectedIds.length > 1;

        if (!isAlreadySelected) {
          // If clicking an unselected node without shift, select it as primary
          onSelectNode?.(nodeId, false);
        }

        dragStartRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          nodeX: targetNode.position?.x || 0,
          nodeY: targetNode.position?.y || 0,
          hasMoved: false,
          startTime: Date.now(),
        };

        if (shouldDragConstellation) {
          setIsDraggingConstellation(true);
          const startMap = {};
          effectiveSelectedIds.forEach((id) => {
            const n = nodes.find((x) => x.id === id);
            if (n) {
              startMap[id] = { x: n.position?.x || 0, y: n.position?.y || 0 };
            }
          });
          constellationStartsRef.current = startMap;
        } else {
          setIsDraggingConstellation(false);
          constellationStartsRef.current = {};
        }

        suppressClickRef.current = false;
        setDraggingNodeId(nodeId);
        e.currentTarget.setPointerCapture(e.pointerId);
      } else {
        // Clicking on canvas background
        setEditingEdgeId(null);
        setLinkSourceNodeId(null);

        // Disambiguate Pan vs Marquee
        const shouldMarquee = (toolMode === 'select' && !isSpaceDown) || e.shiftKey;

        if (shouldMarquee) {
          // Initiates Architectural Drafting Marquee Selection
          const rect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
          const canvasX = (e.clientX - rect.left - pan.x) / zoom;
          const canvasY = (e.clientY - rect.top - pan.y) / zoom;

          marqueeStartRef.current = {
            x: canvasX,
            y: canvasY,
            screenX: e.clientX,
            screenY: e.clientY,
          };
          setIsMarqueeActive(true);
          setMarqueeBox({
            x: canvasX,
            y: canvasY,
            width: 0,
            height: 0,
            screenX: e.clientX,
            screenY: e.clientY,
            screenW: 0,
            screenH: 0,
          });
          setAnticipatingNodeIds(new Set());
        } else {
          // Drag-panning the canvas background
          panStartRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            panX: pan.x,
            panY: pan.y,
          };
          setIsPanningCanvas(true);
        }
      }
    },
    [
      nodes,
      pan,
      zoom,
      toolMode,
      isSpaceDown,
      isCtrlDown,
      linkSourceNodeId,
      selectedSet,
      effectiveSelectedIds,
      onSelectNode,
    ]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (isMarqueeActive) {
        // Update Marquee Selection in real time
        const rect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
        const currCanvasX = (e.clientX - rect.left - pan.x) / zoom;
        const currCanvasY = (e.clientY - rect.top - pan.y) / zoom;

        const boxX = Math.min(marqueeStartRef.current.x, currCanvasX);
        const boxY = Math.min(marqueeStartRef.current.y, currCanvasY);
        const boxW = Math.abs(currCanvasX - marqueeStartRef.current.x);
        const boxH = Math.abs(currCanvasY - marqueeStartRef.current.y);

        const screenMinX = Math.min(marqueeStartRef.current.screenX, e.clientX);
        const screenMinY = Math.min(marqueeStartRef.current.screenY, e.clientY);
        const screenW = Math.abs(e.clientX - marqueeStartRef.current.screenX);
        const screenH = Math.abs(e.clientY - marqueeStartRef.current.screenY);

        setMarqueeBox({
          x: boxX,
          y: boxY,
          width: boxW,
          height: boxH,
          screenX: screenMinX,
          screenY: screenMinY,
          screenW,
          screenH,
        });

        // Compute AABB intersection with all visible nodes
        const intersecting = new Set();
        nodes.forEach((n) => {
          if (n.hidden) return;
          const dims = measuredDims[n.id] || getNodeDimensions(n);
          const nx = n.position?.x || 0;
          const ny = n.position?.y || 0;
          const nw = dims.width || 280;
          const nh = dims.height || 220;

          const isOverlapping = !(
            nx + nw < boxX ||
            nx > boxX + boxW ||
            ny + nh < boxY ||
            ny > boxY + boxH
          );

          if (isOverlapping) {
            intersecting.add(n.id);
          }
        });

        setAnticipatingNodeIds(intersecting);
      } else if (draggingNodeId) {
        const dx = (e.clientX - dragStartRef.current.startX) / zoom;
        const dy = (e.clientY - dragStartRef.current.startY) / zoom;

        if (Math.hypot(dx, dy) > 4) {
          dragStartRef.current.hasMoved = true;
          suppressClickRef.current = true;
        }

        if (isDraggingConstellation) {
          // Rigid Constellation Movement: Translate all selected nodes simultaneously
          const newPosMap = {};
          effectiveSelectedIds.forEach((id) => {
            const start = constellationStartsRef.current[id];
            if (start) {
              const updated = {
                x: Math.round(start.x + dx),
                y: Math.round(start.y + dy),
              };
              newPosMap[id] = updated;
              onNodeMove?.(id, updated);
            }
          });

          // Resolve collision repulsion against external non-selected nodes
          resolveFluidRepulsion(effectiveSelectedIds, newPosMap, nodes, onNodeMove);
        } else {
          // Single Node Movement
          const newPos = {
            x: Math.round(dragStartRef.current.nodeX + dx),
            y: Math.round(dragStartRef.current.nodeY + dy),
          };

          onNodeMove?.(draggingNodeId, newPos);
          resolveFluidRepulsion(draggingNodeId, newPos, nodes, onNodeMove);
        }
      } else if (isPanningCanvas) {
        const dx = e.clientX - panStartRef.current.startX;
        const dy = e.clientY - panStartRef.current.startY;
        onPanChange?.({
          x: panStartRef.current.panX + dx,
          y: panStartRef.current.panY + dy,
        });
      }
    },
    [
      isMarqueeActive,
      draggingNodeId,
      isDraggingConstellation,
      isPanningCanvas,
      zoom,
      pan,
      nodes,
      measuredDims,
      effectiveSelectedIds,
      onNodeMove,
      onPanChange,
      resolveFluidRepulsion,
    ]
  );

  const handlePointerUp = useCallback(
    (e) => {
      if (isMarqueeActive) {
        setIsMarqueeActive(false);
        const count = anticipatingNodeIds.size;
        if (count > 0) {
          onSelectNodes?.(Array.from(anticipatingNodeIds));
        } else {
          // Clicked empty canvas without drag -> clear selection
          const dragDist = Math.hypot(
            e.clientX - marqueeStartRef.current.screenX,
            e.clientY - marqueeStartRef.current.screenY
          );
          if (dragDist < 6) {
            onClearSelection?.();
          }
        }
        setMarqueeBox(null);
        setAnticipatingNodeIds(new Set());
      }

      if (draggingNodeId) {
        if (dragStartRef.current.hasMoved) {
          suppressClickRef.current = true;
          setTimeout(() => {
            suppressClickRef.current = false;
          }, 120);
        }
        setDraggingNodeId(null);
        setIsDraggingConstellation(false);
      }

      if (isPanningCanvas) {
        // If single click on canvas with minimal pan movement -> clear selection
        const panDist = Math.hypot(
          e.clientX - panStartRef.current.startX,
          e.clientY - panStartRef.current.startY
        );
        if (panDist < 4) {
          onClearSelection?.();
        }
        setIsPanningCanvas(false);
      }
    },
    [
      isMarqueeActive,
      anticipatingNodeIds,
      draggingNodeId,
      isPanningCanvas,
      onSelectNodes,
      onClearSelection,
    ]
  );

  // Link creation, multi-node chaining, and inspection handling
  const handleNodeClick = useCallback(
    (nodeId, e) => {
      if (suppressClickRef.current || dragStartRef.current.hasMoved) {
        return;
      }

      const isCtrl = e?.ctrlKey || e?.metaKey || isCtrlDown;
      const isShift = e?.shiftKey;

      if (isShift) {
        onSelectNode?.(nodeId, true);
        return;
      }

      // Case 1: Link source node is ALREADY selected, and user clicks another node
      if (linkSourceNodeId && linkSourceNodeId !== nodeId) {
        const activeEditingEdge = edges.find((ed) => ed.id === editingEdgeId);
        const newEdgeId = `edge-${linkSourceNodeId}-${nodeId}-${Date.now()}`;

        const newEdge = {
          id: newEdgeId,
          source: linkSourceNodeId,
          target: nodeId,
          relationshipType: 'USER_DEFINED',
          color: activeEditingEdge?.color || '#7A7570',
          style: activeEditingEdge?.style || 'basic',
          label: activeEditingEdge?.label || '',
          description: activeEditingEdge?.description || '',
          mathematics: null,
        };

        onCreateEdge?.(newEdge);
        setEditingEdgeId(newEdgeId);
        return;
      }

      // Case 2: Holding Ctrl and clicking the active source node again -> deselect
      if (isCtrl && linkSourceNodeId === nodeId) {
        setLinkSourceNodeId(null);
        setEditingEdgeId(null);
        return;
      }

      // Case 3: Holding Ctrl and clicking node with no source selected -> select as source
      if (isCtrl && !linkSourceNodeId) {
        setLinkSourceNodeId(nodeId);
        setEditingEdgeId(null);
        return;
      }

      // Case 4: Normal click -> select node
      if (!isCtrl && !linkSourceNodeId) {
        onSelectNode?.(nodeId, false);
      }
    },
    [isCtrlDown, linkSourceNodeId, editingEdgeId, edges, onCreateEdge, onSelectNode]
  );

  // Cut linkage with Ctrl + Click
  const handleCutEdge = useCallback(
    (edgeId) => {
      onDeleteEdge?.(edgeId);
      if (editingEdgeId === edgeId) {
        setEditingEdgeId(null);
        setLinkSourceNodeId(null);
      }
    },
    [onDeleteEdge, editingEdgeId]
  );

  // Click linkage (no Ctrl) -> edit options popover
  const handleEditEdge = useCallback((edge) => {
    setEditingEdgeId(edge.id);
    setLinkSourceNodeId(edge.source);
  }, []);

  const renderNode = (node) => {
    if (node.hidden) return null;

    const isSelected = selectedSet.has(node.id);
    const isAnticipating = anticipatingNodeIds.has(node.id);
    const isDragging = draggingNodeId === node.id;
    const isLinkSelected = linkSourceNodeId === node.id;
    const isLinkShaking = isCtrlDown && hoveredNodeId === node.id;

    const commonProps = {
      key: node.id,
      node,
      isSelected,
      isAnticipating,
      isDragging,
      isLinkSelected,
      isLinkShaking,
      isAnimationPaused,
      onPointerDown: (e) => {
        e.stopPropagation();
        handlePointerDown(e, node.id);
      },
      onPointerUp: (e) => {
        e.stopPropagation();
        handlePointerUp(e, node.id);
      },
      onPointerEnter: () => {
        setHoveredNodeId(node.id);
        onHoverNodeChange?.(node.id);
      },
      onPointerLeave: () => {
        setHoveredNodeId(null);
        onHoverNodeChange?.(null);
      },
      onClick: (e) => {
        e.stopPropagation();
        handleNodeClick(node.id, e);
      },
      onInspect: () => onInspectNode?.(node.id),
      onSpecificProbe: (inquiry, nId) => onSpecificProbe?.(inquiry, nId || node.id),
      onOpenBrowser: (url) => {
        const targetUrl =
          url ||
          node.data?.url ||
          node.data?.sourceUrl ||
          `https://en.wikipedia.org/wiki/${encodeURIComponent(node.data?.title || 'Physics')}`;
        onOpenBrowser?.(targetUrl);
      },
    };

    switch (node.type) {
      case 'website':
        return <WebsiteNode {...commonProps} />;
      case 'mechanism':
        return <MechanismNode {...commonProps} />;
      case 'transport':
        return <TransportNode {...commonProps} />;
      case 'topological':
        return <TopologicalNode {...commonProps} />;
      case 'contradiction':
        return <ContradictionNode {...commonProps} />;
      case 'spawned':
        return <SpawnedNode {...commonProps} />;
      default:
        return <MechanismNode {...commonProps} />;
    }
  };

  // Find active editing edge and calculate screen coordinates for popover
  const currentEditingEdge = editingEdgeId
    ? calculatedEdges.find((e) => e.id === editingEdgeId) ||
      edges.find((e) => e.id === editingEdgeId)
    : null;

  const editingSourceNode = currentEditingEdge
    ? nodes.find((n) => n.id === currentEditingEdge.source)
    : linkSourceNodeId
    ? nodes.find((n) => n.id === linkSourceNodeId)
    : null;
  const editingTargetNode = currentEditingEdge
    ? nodes.find((n) => n.id === currentEditingEdge.target)
    : null;

  let popoverScreenPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  if (currentEditingEdge?.midpoint) {
    popoverScreenPos = {
      x: currentEditingEdge.midpoint.x * zoom + pan.x,
      y: currentEditingEdge.midpoint.y * zoom + pan.y,
    };
  }

  // Floating Atelier Selection Dock Envelope Calculation (when >= 2 nodes selected)
  const selectionEnvelope = useMemo(() => {
    if (effectiveSelectedIds.length < 2) return null;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    effectiveSelectedIds.forEach((id) => {
      const n = nodes.find((x) => x.id === id);
      if (n && !n.hidden) {
        const dims = measuredDims[id] || getNodeDimensions(n);
        const px = n.position?.x ?? 0;
        const py = n.position?.y ?? 0;
        minX = Math.min(minX, px);
        minY = Math.min(minY, py);
        maxX = Math.max(maxX, px + (dims.width || 280));
        maxY = Math.max(maxY, py + (dims.height || 220));
      }
    });

    if (minX === Infinity) return null;

    const centerX = (minX + maxX) / 2;
    const screenX = centerX * zoom + pan.x;
    const screenY = minY * zoom + pan.y - 18;

    return {
      screenX: Math.max(120, Math.min(screenX, window.innerWidth - 120)),
      screenY: Math.max(70, screenY),
      nodeCount: effectiveSelectedIds.length,
    };
  }, [effectiveSelectedIds, nodes, measuredDims, pan, zoom]);

  // Cursor style calculation
  const canvasCursorClass = useMemo(() => {
    if (isSpaceDown) return isPanningCanvas ? 'cursor-grabbing' : 'cursor-grab';
    if (toolMode === 'select' || isMarqueeActive) return 'cursor-crosshair';
    return isPanningCanvas ? 'cursor-grabbing' : 'cursor-grab';
  }, [isSpaceDown, isPanningCanvas, toolMode, isMarqueeActive]);

  return (
    <main
      ref={containerRef}
      className={`relative w-screen h-screen overflow-hidden select-none ${canvasCursorClass}`}
      onPointerDown={(e) => handlePointerDown(e, null)}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        setHoveredNodeId(null);
        onHoverNodeChange?.(null);
      }}
    >
      {/* Living Atmospheric Reactive Background with Dots, Parallax & Ambient Daylight */}
      <DynamicAtmosphericBackground pan={pan} zoom={zoom} />

      {/* Spatial Transformed Viewport */}
      <div
        className="absolute inset-0 origin-top-left will-change-transform"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition:
            isPanningCanvas || draggingNodeId || isMarqueeActive ? 'none' : 'transform 0.05s linear',
        }}
      >
        {/* Dynamic Multi-Cluster Organic Convex Hulls */}
        <ConvexHull
          clusters={clusters}
          ghostClusters={ghostClusters}
          nodes={nodes}
          measuredDims={measuredDims}
          onToggleCollapse={onToggleClusterCollapse}
          onSynthesize={onSynthesizeCluster}
          onAutoTidy={onAutoTidyCluster}
          onDissolve={onDissolveCluster}
          onUpdateTitle={onUpdateClusterTitle}
          onAdoptGhost={onAdoptGhostCluster}
          onDismissGhost={onDismissGhostCluster}
          // Legacy fallbacks:
          bounds={clusterBounds}
          label={clusterLabel}
          isCollapsed={isClusterCollapsed}
        />

        {/* High-Visibility Organic Bézier Linkage Layer */}
        <OrganicLinkageLayer
          edges={calculatedEdges}
          isCtrlDown={isCtrlDown}
          onCutEdge={handleCutEdge}
          onEdgeClick={handleEditEdge}
        />

        {/* Spatial Nodes */}
        <div ref={nodesContainerRef} className="absolute inset-0 z-20 pointer-events-none">
          {nodes.map((node) => renderNode(node))}
        </div>

        {/* Dynamic Architectural Drafting Marquee Box */}
        {marqueeBox && marqueeBox.width > 2 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible">
            <rect
              x={marqueeBox.x}
              y={marqueeBox.y}
              width={marqueeBox.width}
              height={marqueeBox.height}
              rx="4"
              fill="rgba(74, 69, 64, 0.05)"
              stroke="var(--grey-strong, #6B655A)"
              strokeWidth="1.2"
              strokeDasharray="5 4"
            />
          </svg>
        )}
      </div>

      {/* Ephemeral Floating Marquee Dimension Badge */}
      {marqueeBox && marqueeBox.width > 12 && (
        <div
          className="fixed z-40 pointer-events-none font-mono text-[10px] text-text-primary bg-white-pure/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-grey-strong shadow-md"
          style={{
            left: `${marqueeBox.screenX + marqueeBox.screenW + 12}px`,
            top: `${marqueeBox.screenY + marqueeBox.screenH + 12}px`,
          }}
        >
          W: {Math.round(marqueeBox.width)}px · H: {Math.round(marqueeBox.height)}px ·{' '}
          <strong className="font-bold">{anticipatingNodeIds.size}</strong> Selected
        </div>
      )}

      {/* Floating Atelier Action Dock ("The Atelier Action Bar") docked above selection */}
      {selectionEnvelope && !isMarqueeActive && !draggingNodeId && (
        <div
          id="atelier-action-dock"
          style={{
            left: `${selectionEnvelope.screenX}px`,
            top: `${selectionEnvelope.screenY}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="fixed z-45 bg-white-pure/95 backdrop-blur-xl border border-grey-strong/80 rounded-2xl px-3 py-1.5 shadow-[0_16px_36px_-6px_rgba(74,69,64,0.18),0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-2 select-none pointer-events-auto font-mono text-xs animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Node Count Badge */}
          <span className="flex items-center gap-1.5 font-bold text-text-primary pr-2 border-r border-grey-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{selectionEnvelope.nodeCount} Selected</span>
          </span>

          {/* [⊞ Form Cluster] (Ctrl+G) */}
          <button
            type="button"
            onClick={() => onCreateCluster?.(effectiveSelectedIds)}
            className="h-7 px-2.5 rounded-xl bg-white-warm hover:bg-grey-soft border border-grey-medium/70 text-text-primary font-medium flex items-center gap-1.5 transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer"
            title="Form Cluster (Ctrl+G)"
          >
            <FolderPlus className="w-3.5 h-3.5 text-text-secondary" />
            <span>Form Cluster</span>
          </button>

          {/* [✦ AI Synthesize] */}
          <button
            type="button"
            onClick={() => onSynthesizeCluster?.(null, effectiveSelectedIds)}
            className="h-7 px-2.5 rounded-xl bg-amber-50/90 hover:bg-amber-100 border border-amber-300/80 text-amber-900 font-medium flex items-center gap-1.5 transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer"
            title="AI Cluster Deep Dive"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Synthesize</span>
          </button>

          {/* [☍ Chain / Link] */}
          <button
            type="button"
            onClick={() => onChainNodes?.(effectiveSelectedIds)}
            className="h-7 px-2 rounded-xl bg-white-warm hover:bg-grey-soft border border-grey-medium/70 text-text-secondary hover:text-text-primary flex items-center gap-1 transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer"
            title="Chain / Link sequentially"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Chain</span>
          </button>

          {/* [⇄ Auto-Tidy] */}
          <button
            type="button"
            onClick={() => onAutoTidySelection?.(effectiveSelectedIds)}
            className="h-7 px-2 rounded-xl bg-white-warm hover:bg-grey-soft border border-grey-medium/70 text-text-secondary hover:text-text-primary flex items-center gap-1 transition-all duration-150 active:scale-95 shadow-3xs cursor-pointer"
            title="Auto-Tidy Golden-Ratio Layout"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Tidy</span>
          </button>

          {/* [🗑 Delete] */}
          <button
            type="button"
            onClick={() => onDeleteSelectedNodes?.(effectiveSelectedIds)}
            className="h-7 px-2 rounded-xl hover:bg-red-50 text-text-muted hover:text-red-600 border border-transparent hover:border-red-200 flex items-center transition-all duration-150 active:scale-95 cursor-pointer ml-0.5"
            title="Delete Selected Nodes"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Clear Selection [×] */}
          <button
            type="button"
            onClick={onClearSelection}
            className="w-5 h-5 rounded-md hover:bg-grey-soft text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
            title="Clear Selection (Esc)"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating Linkage Options Popover */}
      {currentEditingEdge && (
        <LinkageOptionsPopover
          edge={currentEditingEdge}
          sourceNode={editingSourceNode}
          targetNode={editingTargetNode}
          position={popoverScreenPos}
          onChange={(updates) => onUpdateEdge?.(currentEditingEdge.id, updates)}
          onClose={() => {
            setEditingEdgeId(null);
            setLinkSourceNodeId(null);
          }}
          onDelete={(id) => {
            onDeleteEdge?.(id);
            setEditingEdgeId(null);
            setLinkSourceNodeId(null);
          }}
        />
      )}
    </main>
  );
};