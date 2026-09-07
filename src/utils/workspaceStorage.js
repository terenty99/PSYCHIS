/**
 * PSYCHIS Workspace & .psychis Spatial Protocol Serialization Engine
 * Version: 2026.1
 */

export const STORAGE_KEY_WORKSPACES = 'psychis_workspaces_v1';
export const STORAGE_KEY_ACTIVE_ID = 'psychis_active_workspace_id_v1';
export const STORAGE_KEY_AUTH = 'psychis_client_auth_v1';

export const DEFAULT_WORKSPACES = [
  {
    id: 'ws-kinematics',
    name: 'Applied Kinematics & Transport',
    clientHandle: 'Researcher 01',
    updatedAt: new Date().toISOString(),
    pan: { x: 0, y: 0 },
    zoom: 1.0,
    nodes: null, // hydrated with default nodes
    edges: null,
  },
  {
    id: 'ws-cryo',
    name: 'Cryogenic Orbital Flexures',
    clientHandle: 'Researcher 01',
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    pan: { x: -80, y: -20 },
    zoom: 0.95,
    nodes: [
      {
        id: '0x05',
        type: 'spawned',
        width: 280,
        height: 240,
        position: { x: 420, y: 220 },
        data: {
          category: 'ai discovery // 2026',
          status: 'crawled live',
          year: '2026',
          title: 'Cryogenic Flexure Stability',
          source: 'IEEE Trans. Robotics (2026)',
          institution: 'IEEE Robotics & Automation Society (2026 Corpus)',
          url: 'https://arxiv.org/abs/2307.12008',
          description:
            'Sub-micron straight-line excursion maintained down to 4.2 K with zero stick-slip hysteresis on beryllium-copper flexure prototype.',
          detailedSynthesis:
            'Sub-micron straight-line excursion maintained down to 4.2 K with zero stick-slip hysteresis on beryllium-copper flexure prototype for orbital cryo-interferometry. Validates continuous elastic deformation kinetics under ultra-low thermal dissipation.',
          formula: '\\Delta x_{\\text{err}}\\le 0.042\\%',
          formulaType: 'Precision Excursion Bound',
          vitalStats: [
            { label: 'Thermal Limit', value: '4.2 K' },
            { label: 'Excursion Precision', value: 'Δx ≤ 0.042%' },
            { label: 'Substrate Material', value: 'Beryllium-Copper' },
            { label: 'Discovery Timestamp', value: 'August 2026' },
          ],
          formulas: [
            {
              id: 'f0',
              title: 'Precision Excursion Tolerance',
              formula: '\\Delta x_{\\text{err}}\\le 0.042\\%',
              type: 'Excursion Bound',
              desc: 'Maximum allowable thermal contraction drift along the active guidance vector.',
            }
          ],
          derivationSteps: [
            {
              step: 1,
              title: 'Thermal Contraction Invariant',
              formula: '\\Delta L = L_0 \\int_{4.2\\,\\text{K}}^{293\\,\\text{K}} \\alpha(T)\\,dT',
              explanation: 'Calculates differential contraction between flexure arm and monolithic ground mounting.',
            }
          ]
        },
      },
    ],
    edges: [],
  },
];

/**
 * Load all workspaces from localStorage
 */
export function loadSavedWorkspaces() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WORKSPACES);
    if (!raw) return DEFAULT_WORKSPACES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_WORKSPACES;
  } catch (e) {
    console.error('Failed to load workspaces from localStorage:', e);
    return DEFAULT_WORKSPACES;
  }
}

/**
 * Save all workspaces to localStorage
 */
export function persistWorkspaces(workspaces) {
  try {
    localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(workspaces));
  } catch (e) {
    console.error('Failed to persist workspaces to localStorage:', e);
  }
}

/**
 * Export a workspace to a .psychis file conforming to the official spatial protocol schema
 */
export function exportPsychisFile(workspace, nodes, edges, pan, zoom) {
  const psychisPayload = {
    format: 'psychis-spatial-protocol',
    version: '2026.1',
    workspaceName: workspace.name || 'Applied Kinematics & Transport',
    clientHandle: workspace.clientHandle || 'Researcher 01',
    exportedAt: new Date().toISOString(),
    viewport: {
      pan: pan || { x: 0, y: 0 },
      zoom: zoom || 1.0,
    },
    nodes: nodes || [],
    edges: edges || [],
  };

  const jsonStr = JSON.stringify(psychisPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const safeName = (workspace.name || 'workspace')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName}.psychis`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse and validate a .psychis file text conforming to the official schema
 */
export function parsePsychisFile(fileText) {
  try {
    const parsed = JSON.parse(fileText);
    if (!parsed || !Array.isArray(parsed.nodes)) {
      throw new Error('Invalid .psychis file: missing nodes array');
    }

    const workspaceName = parsed.workspaceName || parsed.workspace?.name || 'Imported Universe';
    const clientHandle = parsed.clientHandle || parsed.workspace?.clientHandle || 'Researcher 01';
    const viewport = parsed.viewport || { pan: { x: 0, y: 0 }, zoom: 1.0 };
    const nodes = parsed.nodes;
    const edges = Array.isArray(parsed.edges) ? parsed.edges : [];

    return {
      success: true,
      workspaceName,
      clientHandle,
      viewport,
      nodes,
      edges,
    };
  } catch (e) {
    return {
      success: false,
      error: e.message || 'Malformed .psychis file',
    };
  }
}
