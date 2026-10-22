import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePsychisFile, exportPsychisFile, DEFAULT_WORKSPACES } from '../src/utils/workspaceStorage.js';

const node = (id) => ({ id, type: 'spawned', position: { x: -20, y: 50 }, data: { title: 'Example' } });
const parse = (value) => parsePsychisFile(JSON.stringify(value));

test('current exporter round-trips real node/edge/cluster payloads unchanged', async () => {
  const nodes = [node('a'), node('b')];
  const edges = [{ id: 'ab', source: 'a', target: 'b', data: { label: 'related' } }];
  const clusters = [{ id: 'group', nodeIds: ['a', 'b'], isCollapsed: true }];
  let exported;
  const originalDocument = globalThis.document;
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;
  try {
    globalThis.document = { createElement: () => ({ click() {} }), body: { appendChild() {}, removeChild() {} } };
    URL.createObjectURL = (blob) => { exported = blob; return 'blob:test'; };
    URL.revokeObjectURL = () => {};
    exportPsychisFile({ name: 'Test', clientHandle: 'Researcher' }, nodes, edges, { x: 5, y: -8 }, 0.75, clusters);
    const result = parsePsychisFile(await exported.text());
    assert.equal(result.success, true);
    assert.deepEqual(result.nodes, nodes);
    assert.deepEqual(result.edges, edges);
    assert.deepEqual(result.clusters, clusters);
    assert.deepEqual(result.viewport, { pan: { x: 5, y: -8 }, zoom: 0.75 });
  } finally {
    globalThis.document = originalDocument;
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  }
});

test('legacy minimal files, empty workspaces and existing populated demo are accepted', () => {
  assert.equal(parse({ nodes: [node('a')], workspace: { name: 'Legacy' } }).success, true);
  assert.equal(parse({ nodes: [], viewport: {} }).success, true);
  const demo = DEFAULT_WORKSPACES.find((w) => Array.isArray(w.nodes) && w.nodes.length);
  assert.equal(parse({ nodes: demo.nodes, edges: demo.edges }).success, true);
});

test('rejects null nodes, missing IDs, duplicate IDs and malformed positions', () => {
  for (const nodes of [[null], [{}], [node('')], [node('a'), node('a')],
    [{ ...node('a'), position: null }], [{ ...node('a'), position: { x: '1', y: 0 } }],
    [{ ...node('a'), position: { x: Infinity, y: 0 } }]]) {
    assert.equal(parse({ nodes }).success, false);
  }
  assert.equal(parse({ nodes: {} }).success, false);
});

test('rejects malformed edges, dangling references, clusters and viewport values', () => {
  for (const extra of [
    { edges: {} }, { edges: [null] }, { edges: [{ source: 'a', target: 'missing' }] },
    { edges: [{ source: {}, target: 'a' }] },
    { edges: [{ id: 'e', source: 'a', target: 'a' }, { id: 'e', source: 'a', target: 'a' }] },
    { clusters: [null] }, { clusters: [{ id: 'c', nodeIds: ['missing'] }] },
    { viewport: { pan: { x: 'bad', y: 0 }, zoom: 1 } }, { viewport: { zoom: 0 } },
  ]) assert.equal(parse({ nodes: [node('a')], ...extra }).success, false);
});
