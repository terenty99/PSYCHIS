/**
 * PSYCHIS AI Training JSONL Exporter
 * Converts spatial knowledge nodes, mathematical derivations, and relational edges
 * into structured { input, reasoning_steps, output } training pairs for local AI models.
 */

export function convertGraphToTrainingPairs(workspaceName, nodes, edges) {
  const trainingPairs = [];

  nodes.forEach((node) => {
    const data = node.data || {};
    const title = data.title || 'Untitled Node';
    const synthesis = data.detailedSynthesis || data.description || '';
    const formula = data.formula || '';
    const derivationSteps = data.derivationSteps || [];

    // Find incoming and outgoing linkages
    const incoming = (edges || []).filter(e => e.target === node.id);
    const outgoing = (edges || []).filter(e => e.source === node.id);

    // Pair 1: Knowledge Synthesis & Axiom Grounding
    trainingPairs.push({
      id: `psychis-${node.id}-synthesis`,
      workspace: workspaceName,
      input: `Analyze the theoretical physics and kinematic foundations of: ${title} (${node.type}).`,
      reasoning_steps: [
        `Identify node category: ${data.category || node.type}.`,
        `Extract canonical mathematical formulations: ${formula || 'N/A'}.`,
        `Evaluate empirical boundary conditions from ${data.institution || 'primary literature'}.`,
        ...derivationSteps.map((s, idx) => `Step ${idx + 1} (${s.title}): ${s.explanation} | Formulation: ${s.formula}`),
      ],
      output: synthesis,
    });

    // Pair 2: Mathematical Derivation & Proof Verification (if derivations exist)
    if (derivationSteps.length > 0) {
      trainingPairs.push({
        id: `psychis-${node.id}-proof`,
        workspace: workspaceName,
        input: `Derive the analytical proof and governing equations for ${title}.`,
        reasoning_steps: derivationSteps.map((s, idx) => `Derivation Phase ${idx + 1} [${s.title}]: ${s.explanation}`),
        output: derivationSteps.map(s => `[${s.title}]\nFormula: ${s.formula}\nExplanation: ${s.explanation}`).join('\n\n'),
      });
    }

    // Pair 3: Relational Inference & Dialectic (if linkages exist)
    if (incoming.length > 0 || outgoing.length > 0) {
      const relSummary = [
        ...incoming.map(e => `Coupled from ${e.source} with relationship ${e.relationshipType || 'DEFAULT'}`),
        ...outgoing.map(e => `Coupled to ${e.target} with relationship ${e.relationshipType || 'DEFAULT'}`)
      ].join('; ');

      trainingPairs.push({
        id: `psychis-${node.id}-linkage`,
        workspace: workspaceName,
        input: `What is the spatial and dialectical relationship of "${title}" in the knowledge graph?`,
        reasoning_steps: [
          `Inspect incoming and outgoing Bezier vectors: ${relSummary}.`,
          `Synthesize topological continuity and empirical counter-theses.`
        ],
        output: `Node "${title}" (${node.id}) occupies an interconnected coordinate position with relationships: ${relSummary}. Synthesis: ${synthesis}`,
      });
    }
  });

  return trainingPairs;
}

/**
 * Downloads the active graph as a training.jsonl file
 */
export function exportTrainingJsonlFile(workspaceName, nodes, edges) {
  const pairs = convertGraphToTrainingPairs(workspaceName, nodes, edges);
  const jsonlLines = pairs.map(p => JSON.stringify(p)).join('\n');
  const blob = new Blob([jsonlLines], { type: 'application/x-jsonlines;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const safeName = (workspaceName || 'psychis')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName}_training_dataset.jsonl`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
