import { useState, useEffect, useRef, useCallback } from 'react';
import { getStoredBackendUrl, getStoredAiMode } from '../utils/geminiClient';

/**
 * PSYCHIS — The Autonomous Semantic Loom
 * Ambient, continuous intelligence engine that monitors quiescent canvas states,
 * identifies emergent semantic constellations, and proposes non-disruptive Ghost Hulls.
 */
export function useSemanticLoom({
  nodes = [],
  edges = [],
  clusters = [],
  onAdoptCluster,
  isEnabled = true,
}) {
  const [ghostClusters, setGhostClusters] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const dismissedIdsRef = useRef(new Set());
  const lastStateHashRef = useRef('');

  // Dismiss a ghost suggestion permanently for this session
  const dismissGhost = useCallback((ghostId) => {
    dismissedIdsRef.current.add(ghostId);
    setGhostClusters((prev) => prev.filter((g) => g.id !== ghostId));
  }, []);

  // Adopt a ghost suggestion into permanent user clusters
  const adoptGhost = useCallback(
    (ghostCluster) => {
      dismissedIdsRef.current.add(ghostCluster.id);
      setGhostClusters((prev) => prev.filter((g) => g.id !== ghostCluster.id));
      if (onAdoptCluster) {
        onAdoptCluster({
          ...ghostCluster,
          id: `cluster-${Date.now()}`,
          isGhost: false,
          isCollapsed: false,
        });
      }
    },
    [onAdoptCluster]
  );

  // Quiescent Canvas Analyzer (4-second debounce)
  useEffect(() => {
    if (!isEnabled || !Array.isArray(nodes) || nodes.length < 3) {
      return;
    }

    // Hash of active unclustered nodes and positions to detect canvas changes
    const clusteredNodeIds = new Set();
    clusters.forEach((c) => (c.nodeIds || []).forEach((id) => clusteredNodeIds.add(id)));

    const unclustered = nodes.filter((n) => !n.hidden && !clusteredNodeIds.has(n.id));
    if (unclustered.length < 3) {
      if (ghostClusters.length > 0) setGhostClusters([]);
      return;
    }

    // Check if any existing ghost cluster nodes moved far apart; if so, dissolve hypothesis
    if (ghostClusters.length > 0) {
      const nodeMap = new Map();
      nodes.forEach((n) => nodeMap.set(n.id, n));

      let needsDecay = false;
      ghostClusters.forEach((ghost) => {
        const members = (ghost.nodeIds || []).map((id) => nodeMap.get(id)).filter(Boolean);
        if (members.length < 3) {
          needsDecay = true;
          return;
        }
        // Calculate max pairwise distance
        for (let i = 0; i < members.length; i++) {
          for (let j = i + 1; j < members.length; j++) {
            const dx = members[i].position.x - members[j].position.x;
            const dy = members[i].position.y - members[j].position.y;
            if (Math.hypot(dx, dy) > 850) {
              needsDecay = true;
            }
          }
        }
      });

      if (needsDecay) {
        setGhostClusters([]);
      }
    }

    const currentStateHash = unclustered
      .map((n) => `${n.id}:${Math.round(n.position.x / 40)}:${Math.round(n.position.y / 40)}:${n.data?.title || ''}`)
      .join('|');

    if (currentStateHash === lastStateHashRef.current) {
      return;
    }

    const timer = setTimeout(async () => {
      lastStateHashRef.current = currentStateHash;
      setIsAnalyzing(true);

      try {
        const backendUrl = getStoredBackendUrl() || 'http://localhost:8000';
        const aiMode = getStoredAiMode();

        const payload = {
          nodes: unclustered.map((n) => ({
            id: n.id,
            title: n.data?.title || n.id,
            category: n.data?.category || '',
            description: n.data?.description || '',
            formula: n.data?.formula || null,
          })),
          existing_clusters: clusters,
        };

        let proposedClusters = [];

        // Try backend API first if not strictly offline
        if (aiMode !== 'offline') {
          try {
            const res = await fetch(`${backendUrl}/api/cluster/analyze`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (res.ok) {
              const data = await res.json();
              if (data && Array.isArray(data.clusters)) {
                proposedClusters = data.clusters;
              }
            }
          } catch (err) {
            // Backend offline, fallback to client heuristic
          }
        }

        // Client-Side Fallback Heuristic: Spatial Proximity & Category Affinity
        if (proposedClusters.length === 0 && unclustered.length >= 3) {
          // Group by proximity: find closest 3 unclustered nodes
          const candidates = [...unclustered];
          let bestGroup = null;
          let minSpread = Infinity;

          for (let i = 0; i < candidates.length; i++) {
            const neighbors = [candidates[i]];
            for (let j = 0; j < candidates.length; j++) {
              if (i === j) continue;
              const d = Math.hypot(
                candidates[i].position.x - candidates[j].position.x,
                candidates[i].position.y - candidates[j].position.y
              );
              if (d < 500) {
                neighbors.push(candidates[j]);
              }
            }
            if (neighbors.length >= 3 && neighbors.length <= 5) {
              let spread = 0;
              for (let k = 1; k < neighbors.length; k++) {
                spread += Math.hypot(
                  neighbors[0].position.x - neighbors[k].position.x,
                  neighbors[0].position.y - neighbors[k].position.y
                );
              }
              if (spread < minSpread) {
                minSpread = spread;
                bestGroup = neighbors;
              }
            }
          }

          if (bestGroup && bestGroup.length >= 3) {
            const memberIds = bestGroup.map((n) => n.id);
            const mainCat = bestGroup[0].data?.category || 'General Invariants';
            const cleanTitle = bestGroup[0].data?.title || 'Emergent System';

            proposedClusters.push({
              id: `ghost-${memberIds.sort().join('-')}`,
              title: `${cleanTitle} Constellation`,
              category: mainCat,
              coherenceScore: 0.89,
              nodeIds: memberIds,
              aiSynthesizedSummary: `Emergent affinity island linking ${bestGroup.length} contiguous concepts.`,
            });
          }
        }

        // Filter out any dismissed ghost clusters
        const validGhosts = proposedClusters
          .filter((c) => !dismissedIdsRef.current.has(c.id))
          .map((c) => ({
            ...c,
            isGhost: true,
            isCollapsed: false,
          }));

        if (validGhosts.length > 0) {
          setGhostClusters(validGhosts.slice(0, 1)); // Show 1 gentle suggestion at a time
        }
      } catch (err) {
        console.warn('[SemanticLoom ambient analysis error]:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 4000); // 4-second idle debounce

    return () => clearTimeout(timer);
  }, [nodes, clusters, isEnabled, ghostClusters]);

  return {
    ghostClusters,
    isAnalyzing,
    adoptGhost,
    dismissGhost,
  };
}
