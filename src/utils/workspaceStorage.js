/**
 * PSYCHIS Workspace & .psychis File Serialization Engine
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
    zoom: 1,
    nodes: null, // Will use default initial nodes if null
    edges: null,
  },
  {
    id: 'ws-cryo',
    name: 'Cryogenic Flexures (Draft)',
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
          description:
            'Sub-micron straight-line excursion maintained down to 4.2 K with zero stick-slip hysteresis on beryllium-copper flexure prototype.',
          formula: '\\Delta x_{\\text{err}}\\le 0.042\\%',
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
 * Export a workspace to a .psychis file and trigger download
 */
export function exportPsychisFile(workspace, nodes, edges, pan, zoom) {
  const psychisPayload = {
    psychis_version: '1.0',
    app: 'PSYCHIS — Spatial Knowledge Engine',
    exported_at: new Date().toISOString(),
    workspace: {
      id: workspace.id,
      name: workspace.name,
      clientHandle: workspace.clientHandle || 'Anonymous',
    },
    viewport: { pan, zoom },
    nodes,
    edges,
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
 * Parse and validate a .psychis file text
 */
export function parsePsychisFile(fileText) {
  try {
    const parsed = JSON.parse(fileText);
    if (!parsed || !Array.isArray(parsed.nodes)) {
      throw new Error('Invalid .psychis file: missing nodes array');
    }
    return {
      success: true,
      workspaceName: parsed.workspace?.name || 'Imported Workspace',
      viewport: parsed.viewport || { pan: { x: 0, y: 0 }, zoom: 1 },
      nodes: parsed.nodes,
      edges: Array.isArray(parsed.edges) ? parsed.edges : [],
    };
  } catch (e) {
    return {
      success: false,
      error: e.message || 'Malformed .psychis file',
    };
  }
}
