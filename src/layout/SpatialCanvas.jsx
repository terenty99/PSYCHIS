import React, { useRef, useState, useCallback, useEffect } from 'react';
import { WebsiteNode } from '../components/nodes/WebsiteNode';
import { MechanismNode } from '../components/nodes/MechanismNode';
import { TransportNode } from '../components/nodes/TransportNode';
import { TopologicalNode } from '../components/nodes/TopologicalNode';
import { ContradictionNode } from '../components/nodes/ContradictionNode';
import { SpawnedNode } from '../components/nodes/SpawnedNode';
import { OrganicLinkageLayer } from '../components/ui/OrganicLinkageLayer';
import { ConvexHull } from '../components/ui/ConvexHull';
import { DynamicAtmosphericBackground } from '../components/ui/DynamicAtmosphericBackground';
import { useOrganicLinkages } from '../hooks/useOrganicLinkages';
import { useFluidPhysics } from '../hooks/useFluidPhysics';

export const SpatialCanvas = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onNodeMove,
  onOpenBrowser,
  onInspectNode,
  clusterBounds,
  isClusterCollapsed,
  onToggleClusterCollapse,
  isAnimationPaused = false,
  pan = { x: 0, y: 0 },
  zoom = 1,
  onPanChange,
  onZoomChange,
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

  const { resolveFluidRepulsion } = useFluidPhysics();
  const { calculatedEdges } = useOrganicLinkages(nodes, edges);

  const suppressClickRef = useRef(false);

  // Touchpad / Trackpad Gesture Handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      // If hovering over inspector, browser, terminal, dialog or scrollable panels, allow natural element scrolling
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

        // Zoom centered around cursor position
        const rect = container.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;

        const newPanX = cursorX - ((cursorX - pan.x) * newZoom) / zoom;
        const newPanY = cursorY - ((cursorY - pan.y) * newZoom) / zoom;

        onZoomChange(newZoom);
        onPanChange({ x: newPanX, y: newPanY });
      } else {
        // Two-finger touchpad pan / travel across interface
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
      if (e.target.closest('button, input, a, textarea')) return;

      if (nodeId) {
        // Grabbing a specific node to move
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;

        dragStartRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          nodeX: node.position.x,
          nodeY: node.position.y,
          hasMoved: false,
          startTime: Date.now(),
        };
        suppressClickRef.current = false;

        setDraggingNodeId(nodeId);
        e.currentTarget.setPointerCapture(e.pointerId);
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
    },
    [nodes, pan]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (draggingNodeId) {
        // Move dragging node in zoom-compensated coordinate space
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
        // Canvas drag panning
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

  const handleNodeClick = useCallback(
    (nodeId) => {
      // ONLY inspect on static click, NEVER after dragging
      if (suppressClickRef.current || dragStartRef.current.hasMoved) {
        return;
      }
      onSelectNode(nodeId);
    },
    [onSelectNode]
  );

  const renderNode = (node) => {
    if (node.hidden) return null;

    const isSelected = selectedNodeId === node.id;
    const isDragging = draggingNodeId === node.id;

    const commonProps = {
      key: node.id,
      node,
      isSelected,
      isDragging,
      isAnimationPaused,
      onPointerDown: (e) => handlePointerDown(e, node.id),
      onPointerUp: (e) => handlePointerUp(e, node.id),
      onClick: (e) => {
        e.stopPropagation();
        handleNodeClick(node.id);
      },
      onInspect: () => onInspectNode(node.id),
    };

    switch (node.type) {
      case 'website':
        return <WebsiteNode {...commonProps} onOpenBrowser={onOpenBrowser} />;
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

  return (
    <main
      ref={containerRef}
      className={`relative w-screen h-screen overflow-hidden select-none ${
        isPanningCanvas ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onPointerDown={(e) => handlePointerDown(e, null)}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
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
          label="Applied Kinematics & Transport"
          isCollapsed={isClusterCollapsed}
          onToggleCollapse={onToggleClusterCollapse}
        />

        {/* High-Visibility Organic Bézier Linkage Layer */}
        <OrganicLinkageLayer edges={calculatedEdges} />

        {/* Spatial Nodes */}
        <div className="absolute inset-0 z-20 pointer-events-auto">
          {nodes.map((node) => renderNode(node))}
        </div>
      </div>
    </main>
  );
};