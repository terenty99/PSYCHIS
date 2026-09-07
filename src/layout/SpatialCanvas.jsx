import React, { useRef, useState, useCallback, useEffect } from 'react';
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

export const SpatialCanvas = ({
  nodes = [],
  edges = [],
  selectedNodeId,
  onSelectNode,
  onNodeMove,
  onCreateEdge,
  onUpdateEdge,
  onDeleteEdge,
  onOpenBrowser,
  onInspectNode,
  onSpecificProbe,
  clusterBounds,
  clusterLabel,
  isClusterCollapsed,
  onToggleClusterCollapse,
  isAnimationPaused = false,
  pan = { x: 0, y: 0 },
  zoom = 1,
  onPanChange,
  onZoomChange,
  onHoverNodeChange,
}) => {
  const containerRef = useRef(null);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [isPanningCanvas, setIsPanningCanvas] = useState(false);
  const dragStartRef = useRef({
    startX: 0,
    startY: 0,
    nodeX: 0,
    nodeY: 0,
    hasMoved: false,
    startTime: 0,
  });
  const panStartRef = useRef({ startX: 0, startY: 0, panX: 0, panY: 0 });

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

  // Live measure exact DOM dimensions of rendered nodes for pixel-perfect linkage endpoints
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
          if (!measuredDims[id] || Math.abs(measuredDims[id].width - w) > 1 || Math.abs(measuredDims[id].height - h) > 1) {
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

  const { resolveFluidRepulsion } = useFluidPhysics();
  const { calculatedEdges } = useOrganicLinkages(nodes, edges, measuredDims);

  const suppressClickRef = useRef(false);

  // Track Ctrl / Meta key state for tactile hover shaking and cut gestures
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Control' || e.key === 'Meta' || e.ctrlKey || e.metaKey) {
        setIsCtrlDown(true);
      }
      if (e.key === 'Escape') {
        if (!editingEdgeIdRef.current) {
          setLinkSourceNodeId(null);
        }
      }
    };
    const handleKeyUp = (e) => {
      if (!e.ctrlKey && !e.metaKey) {
        setIsCtrlDown(false);
        // Release Ctrl deselects the chosen node immediately
        if (!editingEdgeIdRef.current) {
          setLinkSourceNodeId(null);
        }
      }
    };
    const handleBlur = () => {
      setIsCtrlDown(false);
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
  }, [onHoverNodeChange]);

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
        // Pinch-to-zoom gesture on touchpad or Ctrl+Wheel
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
        // Two-finger touchpad pan
        onPanChange({
          x: pan.x - e.deltaX * 1.2,
          y: pan.y - e.deltaY * 1.2,
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [pan, zoom, onPanChange, onZoomChange]);

  // Pointer Down for Nodes or Canvas Panning
  const handlePointerDown = useCallback(
    (e, nodeId = null) => {
      if (e.target.closest('button, input, a, textarea, #spark-terminal, aside, footer, [role="search"], [role="dialog"]')) return;

      if (nodeId) {
        e.stopPropagation();

        const isCtrl = e.ctrlKey || e.metaKey || isCtrlDown;
        // When holding Ctrl or when selecting a second node to link, do NOT drag the node!
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

        // Grabbing a specific node to move
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;

        dragStartRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          nodeX: node.position?.x || 0,
          nodeY: node.position?.y || 0,
          hasMoved: false,
          startTime: Date.now(),
        };
        suppressClickRef.current = false;

        setDraggingNodeId(nodeId);
        e.currentTarget.setPointerCapture(e.pointerId);
      } else {
        // Clicking on canvas background
        setEditingEdgeId(null);
        setLinkSourceNodeId(null);

        // Drag-panning the canvas background
        panStartRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          panX: pan.x,
          panY: pan.y,
        };
        setIsPanningCanvas(true);
      }
    },
    [nodes, pan, isCtrlDown, linkSourceNodeId]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (draggingNodeId) {
        const dx = (e.clientX - dragStartRef.current.startX) / zoom;
        const dy = (e.clientY - dragStartRef.current.startY) / zoom;

        if (Math.hypot(dx, dy) > 4) {
          dragStartRef.current.hasMoved = true;
          suppressClickRef.current = true;
        }

        const newPos = {
          x: dragStartRef.current.nodeX + dx,
          y: dragStartRef.current.nodeY + dy,
        };

        onNodeMove(draggingNodeId, newPos);
        resolveFluidRepulsion(draggingNodeId, newPos, nodes, onNodeMove);
      } else if (isPanningCanvas) {
        const dx = e.clientX - panStartRef.current.startX;
        const dy = e.clientY - panStartRef.current.startY;
        onPanChange({
          x: panStartRef.current.panX + dx,
          y: panStartRef.current.panY + dy,
        });
      }
    },
    [draggingNodeId, isPanningCanvas, zoom, nodes, onNodeMove, onPanChange, resolveFluidRepulsion]
  );

  const handlePointerUp = useCallback(
    (e) => {
      if (draggingNodeId) {
        if (dragStartRef.current.hasMoved) {
          suppressClickRef.current = true;
          setTimeout(() => {
            suppressClickRef.current = false;
          }, 120);
        }
        setDraggingNodeId(null);
      }
      if (isPanningCanvas) setIsPanningCanvas(false);
    },
    [draggingNodeId, isPanningCanvas]
  );

  // Link creation, multi-node chaining, and inspection handling
  const handleNodeClick = useCallback(
    (nodeId, e) => {
      if (suppressClickRef.current || dragStartRef.current.hasMoved) {
        return;
      }

      const isCtrl = e?.ctrlKey || e?.metaKey || isCtrlDown;

      // Case 1: Link source node is ALREADY selected, and user clicks another node!
      // This immediately generates the linkage between them!
      if (linkSourceNodeId && linkSourceNodeId !== nodeId) {
        // Retrieve settings from currently open editing edge if batch-linking
        const activeEditingEdge = edges.find((ed) => ed.id === editingEdgeId);
        const newEdgeId = `edge-${linkSourceNodeId}-${nodeId}-${Date.now()}`;

        const newEdge = {
          id: newEdgeId,
          source: linkSourceNodeId,
          target: nodeId,
          relationshipType: 'USER_DEFINED',
          color: activeEditingEdge?.color || '#7A7570', // Default color is gray
          style: activeEditingEdge?.style || 'basic',
          label: activeEditingEdge?.label || '',
          description: activeEditingEdge?.description || '',
          mathematics: null,
        };

        onCreateEdge?.(newEdge);
        setEditingEdgeId(newEdgeId);
        // Keep linkSourceNodeId active so user can click a 3rd node to multi-link with same options!
        return;
      }

      // Case 2: Holding Ctrl and clicking the active source node again -> deselect
      if (isCtrl && linkSourceNodeId === nodeId) {
        setLinkSourceNodeId(null);
        setEditingEdgeId(null);
        return;
      }

      // Case 3: Holding Ctrl and clicking node with no source selected -> select as source (frame around)
      if (isCtrl && !linkSourceNodeId) {
        setLinkSourceNodeId(nodeId);
        setEditingEdgeId(null);
        return;
      }

      // Case 4: Normal click (no linking active) -> select node
      if (!isCtrl && !linkSourceNodeId) {
        onSelectNode(nodeId);
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

    const isSelected = selectedNodeId === node.id;
    const isDragging = draggingNodeId === node.id;
    const isLinkSelected = linkSourceNodeId === node.id;
    const isLinkShaking = isCtrlDown && hoveredNodeId === node.id;

    const commonProps = {
      key: node.id,
      node,
      isSelected,
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
      onInspect: () => onInspectNode(node.id),
      onSpecificProbe: (inquiry, nodeId) => onSpecificProbe?.(inquiry, nodeId || node.id),
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
    ? calculatedEdges.find((e) => e.id === editingEdgeId) || edges.find((e) => e.id === editingEdgeId)
    : null;

  const editingSourceNode = currentEditingEdge
    ? nodes.find((n) => n.id === currentEditingEdge.source)
    : (linkSourceNodeId ? nodes.find((n) => n.id === linkSourceNodeId) : null);
  const editingTargetNode = currentEditingEdge
    ? nodes.find((n) => n.id === currentEditingEdge.target)
    : null;

  let popoverScreenPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  if (currentEditingEdge?.midpoint) {
    popoverScreenPos = {
      x: currentEditingEdge.midpoint.x * zoom + pan.x,
      y: currentEditingEdge.midpoint.y * zoom + pan.y,
    };
  } else if (editingSourceNode && editingTargetNode) {
    const sPos = editingSourceNode.position || { x: 0, y: 0 };
    const tPos = editingTargetNode.position || { x: 0, y: 0 };
    const sW = editingSourceNode.width || 300;
    const sH = editingSourceNode.height || 200;
    const tW = editingTargetNode.width || 300;
    const tH = editingTargetNode.height || 200;
    popoverScreenPos = {
      x: ((sPos.x + sW / 2 + tPos.x + tW / 2) / 2) * zoom + pan.x,
      y: ((sPos.y + sH / 2 + tPos.y + tH / 2) / 2) * zoom + pan.y,
    };
  }

  return (
    <main
      ref={containerRef}
      className={`relative w-screen h-screen overflow-hidden select-none ${
        isPanningCanvas ? 'cursor-grabbing' : 'cursor-grab'
      }`}
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
          transition: isPanningCanvas || draggingNodeId ? 'none' : 'transform 0.05s linear',
        }}
      >
        {/* Dynamic Cluster Convex Hull */}
        <ConvexHull
          bounds={clusterBounds}
          label={clusterLabel || 'Exploration Cluster'}
          isCollapsed={isClusterCollapsed}
          onToggleCollapse={onToggleClusterCollapse}
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
      </div>

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