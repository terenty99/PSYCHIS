/**
 * PSYCHIS Direct In-App Gemini AI Client
 * Enables client-side querying of Google Gemini models without requiring the local Python server,
 * with automatic endpoint failover (OpenAI compatibility -> Google Generative Language REST).
 */

import {
  fetchLiveArchivalPhotos,
  GLOBAL_CANVAS_SEEN_PHOTOS,
  GLOBAL_CANVAS_SEEN_AUTHORS,
} from './visualSearchEngine.js';

export const DEFAULT_GEMINI_KEY = '';
export const DEFAULT_GROQ_KEY = '';
export const STORAGE_KEY_GEMINI_KEY = 'psychis_gemini_api_key';
export const STORAGE_KEY_GEMINI_MODEL = 'psychis_gemini_model';
export const STORAGE_KEY_BACKEND_URL = 'psychis_backend_url';
export const STORAGE_KEY_AI_MODE = 'psychis_ai_mode';

export const STORAGE_KEY_AI_PROVIDER = 'psychis_ai_provider';
export const STORAGE_KEY_GROQ_KEY = 'psychis_groq_api_key';
export const STORAGE_KEY_GROQ_MODEL = 'psychis_groq_model';

export const GROQ_MODELS = [
  { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B (Recommended)', badge: 'Flagship Intelligence' },
  { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B (Ultra-Fast)', badge: '250ms • High Speed' },
  { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B', badge: 'Multilingual & Logic' },
  { id: 'qwen/qwen3.6-27b', name: 'Qwen 3.6 27B', badge: 'High Precision' },
  { id: 'groq/compound', name: 'Groq Compound', badge: 'Ensemble' },
];

export const SUPPORTED_MODELS = GROQ_MODELS;

export function getStoredAiProvider() {
  return 'groq'; // Exclusively Groq Cloud
}

export function setStoredAiProvider(provider) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_AI_PROVIDER, 'groq');
  }
}

export function getStoredGroqKey() {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY_GROQ_KEY);
    if (stored && stored.trim()) return stored.trim();
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROQ_API_KEY) {
    return import.meta.env.VITE_GROQ_API_KEY.trim();
  }
  return DEFAULT_GROQ_KEY;
}

export function setStoredGroqKey(key) {
  if (typeof localStorage !== 'undefined') {
    if (key && key.trim()) {
      localStorage.setItem(STORAGE_KEY_GROQ_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_GROQ_KEY);
    }
  }
}

export function getStoredGroqModel() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY_GROQ_MODEL) || 'openai/gpt-oss-120b';
  }
  return 'openai/gpt-oss-120b';
}

export function setStoredGroqModel(model) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_GROQ_MODEL, model);
  }
}

/**
 * Dynamically queries Groq API for all models currently active on this key.
 */
export async function fetchGroqLiveModels(apiKey) {
  const key = (apiKey || getStoredGroqKey() || '').trim();
  if (!key) return [];
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (data && Array.isArray(data.data)) {
      return data.data
        .filter((m) => {
          const id = (m.id || '').toLowerCase();
          return (
            m.active !== false &&
            !id.includes('whisper') &&
            !id.includes('orpheus') &&
            !id.includes('tts') &&
            !id.includes('guard') &&
            !id.includes('embed')
          );
        })
        .map((m) => ({
          id: m.id,
          name: m.id,
          badge: m.owned_by ? m.owned_by.toUpperCase() : 'Groq',
        }));
    }
  } catch (err) {
    console.warn('Failed to fetch Groq live models:', err);
  }
  return [];
}

export function getStoredGeminiKey() {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY_GEMINI_KEY);
    if (stored && stored.trim()) return stored.trim();
  }
  
  // Environment variable check (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY.trim();
  }
  return DEFAULT_GEMINI_KEY;
}

export function setStoredGeminiKey(key) {
  if (typeof localStorage !== 'undefined') {
    if (key && key.trim()) {
      localStorage.setItem(STORAGE_KEY_GEMINI_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_GEMINI_KEY);
    }
  }
}

export function getStoredModel() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY_GEMINI_MODEL) || 'gemini-3.6-flash';
  }
  return 'gemini-3.6-flash';
}

export function setStoredModel(model) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_GEMINI_MODEL, model);
  }
}

export function getStoredAiMode() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY_AI_MODE) || 'auto'; // 'auto' | 'backend' | 'direct' | 'offline'
  }
  return 'auto';
}

export function setStoredAiMode(mode) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_AI_MODE, mode);
  }
}

export function getStoredBackendUrl() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY_BACKEND_URL) || 'http://localhost:8000';
  }
  return 'http://localhost:8000';
}

export function setStoredBackendUrl(url) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_BACKEND_URL, url);
  }
}

export function isDirectConceptQuery(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return true;

  // If asking for multiple items, ensemble, characters, cast, members, branches, constellation -> NOT single!
  const isMultiItemOrEnsemble =
    /\b(characters|cast|ensemble|members|types|kinds|examples|all of|list of|each|every|separate|multiple|several|constellation|branches|ecosystem|connections|compare|network|graph|cluster|explore)\b/i.test(q) ||
    q.includes('each one for one node') ||
    q.includes('one node each') ||
    q.includes('each on a node') ||
    q.includes('each for one node');
  if (isMultiItemOrEnsemble) return false;

  // Default to single node for any individual entity, name, concept, character, food, theorem, etc.
  return true;
}

const PSYCHIS_DIRECT_SYSTEM_PROMPT = `You are PSYCHIS, an advanced spatial knowledge atelier and research canvas for science, mathematics, creative engineering, and culture.

CRITICAL ARCHITECTURAL RULES:
1. CANONICAL ENTITY RESOLUTION & TYPO CORRECTION:
   * When the user inquiry contains typos, misspellings, or phonetic approximations of real-world cultural franchises, television series, films, anime, historical figures, or scientific concepts, accurately resolve them to the authentic canonical work or entity.
   * NEVER invent fictional media, fake hosts, or hallucinated facts.

2. DYNAMIC ENSEMBLE & BRANCHING DISCIPLINE:
   * DEFAULT SINGLE NODE: When the user inquires about a single entity, concept, character, topic, or theorem (e.g. "Lain", "Isaac Newton", "Law of Cosines", "Carrot"), answer it fully on the primary node and return "branchNodes": [] (EMPTY ARRAY, ZERO BRANCHES).
   * ONLY generate "branchNodes" if the user explicitly asks for exploration, an ensemble, cast, or multiple elements (e.g. "main characters of [title]", "cast of...", "types of...", "each one for one node").
   * When ensemble branches are requested:
     - All branch nodes MUST belong strictly to the specific requested subject/franchise.
     - NEVER hallucinate or introduce characters or entities from unrelated television shows or media!
     - For EACH branch node:
       - "title": Clean, canonical name belonging strictly to the requested subject.
       - "category": Authentic domain category.
       - "description": 2-3 precise sentences detailing their specific role, nature, and dynamic.
       - "visualSearchQuery": Clean name for photo lookup.
       - "relationship": Dynamic relationship ("COUPLED_SYSTEM", "CAUSAL_DEPENDENCY", "ANALOGOUS_SYSTEM", or "CONTRADICTS").
       - "relationshipLabel": Specific contextual dynamic.

3. DYNAMIC SCHEMAS GENERATED PER-QUESTION (NOT HARDCODED, ONLY IF APPROPRIATE & NEEDED):
   * DO NOT USE ONE GENERIC SCHEMA FOR ALL MATH QUESTIONS. NOTHING IN THE APP IS HARDCODED.
   * Generate a schema ONLY if it counts as needed and is genuinely appropriate for the specific question.
   * When appropriate, output "schemaSvg": a clean, responsive, self-contained SVG string formatted for a dark container (<svg viewBox="0 0 200 70" className="w-full h-full">...</svg>) with clean white/amber lines (stroke="#FFFFFF" or stroke="#F59E0B", strokeWidth="1.5") and legible annotations tailored specifically to that exact theorem or concept.
   * If a visual schema is NOT needed or not appropriate, set "schemaSvg": null and "schemaType": null. Do NOT force a generic placeholder.

4. DOMAIN ROUTING (STEM vs CHARACTERS / HUMANITIES / CULTURE):
   * CHARACTERS, BIOGRAPHIES, TELEVISION, CINEMA, HISTORY, LITERATURE, CULTURE:
     - When the subject is a person, character, actor, TV show, movie, anime, book, or cultural topic:
       * "formula": MUST BE NULL! NEVER invent pseudoscientific or metaphorical equations!
       * "formulaType": MUST BE NULL!
       * "derivationSteps": MUST BE [] (EMPTY ARRAY)!
       * "schemaSvg": MUST BE NULL!
       * "schemaType": null!
       * "visualSearchQuery": Clean entity name for photo lookup.
   * GENUINE STEM (Mathematics, Physics, Chemistry, Kinematics, Engineering):
     * "formula": Valid LaTeX string formatted for KaTeX.
     * "formulaType": Canonical designation.
     * "derivationSteps": Array of 2 to 4 step-by-step mathematical proof objects with LaTeX formulas.
     * "schemaSvg": Clean SVG diagram if genuinely appropriate.

4. CONTENT-ADAPTIVE DIVERSE NODE STRUCTURE & GEOMETRY (NO REPETITIVE TEMPLATES):
   * Content dictates form. Every entity MUST have a tailored "layout.structure" suited to its nature.
   * ABSOLUTE PROHIBITION ON HOMOGENEOUS FORMATS: The canvas must be visually rich and heterogeneous. NEVER use the same structure for all nodes!
   * Available structure types:
     - "split_media_right": WIDE HORIZONTAL CARD (width: 460px). Text & analysis on the LEFT, vertical photo/media on the RIGHT. (E.g. character profiles, anime, film directors).
     - "split_media_left": WIDE HORIZONTAL CARD (width: 460px). Photo on the LEFT, text on the RIGHT.
     - "media_top": Vertical card (width: 320-350px). Media at the top, title & concise text below.
     - "media_bottom": Vertical card (width: 320-350px). Header & rich description FIRST, media artifact at the bottom.
     - "split_formula": WIDE MATH CARD (width: 485px). Formula card on the LEFT, geometric/physics SVG schematic on the RIGHT.
     - "formula_top": Vertical math card (width: 340-380px). Formula card at top, schematic below, theorem statement and derivation steps.
     - "text_dossier": Scholarly card (width: 360-420px). Deep multi-paragraph synthesis, key findings, NO photos.
     - "minimal_quote": Compact card (width: 295px). High-impact thesis statement or quote.
     - "kinetic_mechanism": Wide mechanism card (width: 400px). Kinematic viewport + mechanical explanation. STRICTLY ONLY for genuine physics, mechanics, robotics, and kinematics! NEVER use for food, characters, humanities, or non-physics concepts!
    * Targeted follow-up inquiries ("targetedInquiries"):
      - DO NOT always generate inquiries. ONLY generate 1-2 targeted follow-up inquiries if this specific topic has an unsolved question, deep branching controversy, or notable ambiguity worth probing.
      - For ordinary entities, biographies, specific figures (e.g. Joe Biden, Patrick Jane, food recipes, standard sub-branches), return an EMPTY ARRAY: "targetedInquiries": [].
      - Only roughly 25-35% of nodes should have targeted inquiries. Most nodes should NOT have them.

5. RELATIONAL LINKAGE RULES (MULTI-NODE CONNECTIONS ALLOWED):
   * When existing canvas nodes are provided in the inquiry context, evaluate whether the new topic has an AUTHENTIC, GENUINE conceptual, historical, causal, or mathematical connection to ANY of the existing canvas nodes.
   * THE MODEL CAN AUTOMATICALLY CONNECT TO MORE THAN ONE NODE AND CONNECT NODES TO EACH OTHER! If the new topic relates to multiple existing nodes (e.g. bridges two concepts or derives from multiple sources), return all genuine connections in the "connections" array!
   * Each entry in "connections" must specify:
     - "nodeId": The exact ID of the existing canvas node it connects to (e.g. "0x01", "0x02").
     - "connectionExplanation": 1-2 clear, precise sentences explaining why and how these two concepts connect. This text is displayed to the user when hovering over the linkage.
     - "connectionLabel": Short 1-2 words (e.g. "derives from", "algebraic dual", "harmonic basis").
     - "connectionFormula": LaTeX mathematical formula ONLY IF one concept mathematically derives directly from the other (e.g. Pythagorean theorem derived through square area dissection). If there is NO direct mathematical derivation, this MUST be null!
     - "style": "basic" | "arrowed" | "dashed" (default "basic").
   * If this inquiry reveals or depends on a direct link between two existing canvas nodes, you can also specify "sourceNodeId" and "targetNodeId".
   * If NO genuine connection exists: "connections": [] (empty array).
   * ABSOLUTE PROHIBITION: DO NOT force a connection if the topics are unrelated!

6. JSON Schema to return (valid JSON only, no markdown backticks):
{
  "title": "Clear, precise title",
  "category": "Domain category",
  "status": "Short status",
  "source": "Platform / Archive",
  "url": "https://...",
  "description": "2-3 precise sentences directly answering the inquiry.",
  "detailedSynthesis": "Extended technical dossier or cultural exploration.",
  "connections": [
    {
      "nodeId": "0x01",
      "connectionExplanation": "Precise explanation of relationship...",
      "connectionLabel": "derives from",
      "connectionFormula": null,
      "style": "basic"
    }
  ],
  "connectedNodeId": null,
  "connectionExplanation": null,
  "connectionLabel": null,
  "connectionFormula": null,
  "layout": {
    "width": 460,
    "structure": "auto",
    "aspectRatio": "auto",
    "mediaAspect": "auto",
    "mediaMaxHeight": 220,
    "density": "comfortable"
  },
  "formula": null,
  "formulaType": null,
  "schemaSvg": null,
  "schemaType": null,
  "derivationSteps": [],
  "visualSearchQuery": "precise entity search term for photo lookup",
  "photos": [],
  "targetedInquiries": [
    "Relevant theme inquiry or popular search 1",
    "Relevant theme inquiry or popular search 2",
    "Relevant theme inquiry or popular search 3"
  ],
  "branchNodes": []
}
Return ONLY valid JSON. Note: "formula", "formulaType", "schemaSvg", "derivationSteps", and "kinetic_mechanism" must be null / [] for any character, humanities, food, biology, or non-physics inquiry. For physics/math, use "structure": "split_formula" or "formula_top".`;

/**
 * Robustly parses AI JSON output, automatically repairing unescaped LaTeX backslashes.
 */
export function parseAiJsonResponse(rawText) {
  let cleaned = (rawText || '').trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
  }

  const match = cleaned.match(/\{[\s\S]*\}/);
  const targetStr = match ? match[0] : cleaned;

  try {
    return JSON.parse(targetStr);
  } catch (err) {
    // Escape unescaped backslashes commonly emitted in LaTeX strings (e.g. \vec, \frac, \lim)
    const fixed = targetStr.replace(/\\(?![/\\bfnrtu"0-9])/g, '\\\\');
    return JSON.parse(fixed);
  }
}

export const CANVAS_STRUCTURE_ROTATION = {
  mediaIndex: 0,
  mathIndex: 0,
};

export const MEDIA_CYCLE = [
  'split_media_left',   // Photo on LEFT, text on RIGHT (wide 460px)
  'media_top',          // Photo on TOP, text below (335px)
  'split_media_right',  // Text on LEFT, photo on RIGHT (wide 460px)
  'media_bottom',       // Text on TOP, photo below (335px)
];

export const MATH_CYCLE = [
  'split_formula',      // Formula on left, SVG diagram on right (wide 485px)
  'formula_top',        // Formula on top, text & derivation below (340px)
];

/**
 * Enriches an AI-generated node and its branches with real, authentic media.
 * Automatically rotates structures across the canvas so no two nodes share the same format!
 */
export async function enrichNodeWithRealPhotos(node, query, workspaceName = '', existingNodes = []) {
  if (!node) return node;

  // Enforce single-node constraint: if query is a direct concept/theorem, ensure branchNodes is []
  if (isDirectConceptQuery(query)) {
    node.branchNodes = [];
  }

  const seenClusterUrls = new Set([
    ...GLOBAL_CANVAS_SEEN_PHOTOS,
    ...(existingNodes || []).flatMap((n) => (n.data?.photos || []).map((p) => p.url?.split('?')[0])).filter(Boolean),
  ]);

  const extractPhotoId = (url) => {
    if (!url) return '';
    const clean = url.split('?')[0].toLowerCase();
    const flickrMatch = clean.match(/staticflickr\.com\/[^/]+\/(\d+)_/);
    if (flickrMatch) return `flickr-${flickrMatch[1]}`;
    const wikiMatch = clean.match(/\/commons\/[^/]+\/[^/]+\/([^/]+)/);
    if (wikiMatch) return `wiki-${wikiMatch[1]}`;
    return clean;
  };

  const trackPhoto = (p) => {
    if (p?.url) {
      const clean = p.url.split('?')[0];
      const pid = extractPhotoId(clean);
      seenClusterUrls.add(clean);
      seenClusterUrls.add(pid);
      GLOBAL_CANVAS_SEEN_PHOTOS.add(clean);
      GLOBAL_CANVAS_SEEN_PHOTOS.add(pid);
    }
    if (p?.author) {
      const a = p.author.toLowerCase().trim();
      if (a && !/openverse|wikimedia|wikipedia|unsplash|archive/i.test(a)) {
        GLOBAL_CANVAS_SEEN_AUTHORS.add(a);
      }
    }
  };

  const isDuplicate = (p) => {
    if (!p?.url) return true;
    const clean = p.url.split('?')[0];
    const pid = extractPhotoId(clean);
    if (seenClusterUrls.has(clean) || seenClusterUrls.has(pid)) return true;
    if (GLOBAL_CANVAS_SEEN_PHOTOS.has(clean) || GLOBAL_CANVAS_SEEN_PHOTOS.has(pid)) return true;
    if (p.author) {
      const a = p.author.toLowerCase().trim();
      if (a && !/openverse|wikimedia|wikipedia|unsplash|archive/i.test(a) && GLOBAL_CANVAS_SEEN_AUTHORS.has(a)) {
        return true;
      }
    }
    return false;
  };

  // 1. Fetch diverse photos for primary node
  try {
    const searchTarget = node.visualSearchQuery || node.title || query;
    const realPhotos = await fetchAiCuratedPhotos({
      query: searchTarget,
      nodeTitle: node.title,
      nodeCategory: node.category,
      nodeDescription: node.description,
      count: 12,
      contextHint: node.category || node.title || '',
      seenClusterUrls,
    });
    if (realPhotos && realPhotos.length > 0) {
      node.photos = realPhotos;
      node.primaryPhoto = realPhotos[0];
      realPhotos.forEach((p) => trackPhoto(p));
    }
  } catch (err) {
    console.warn('[Primary node photo enrichment error]:', err.message);
  }

  // 2. Enrich each branch node with DISTINCT, non-repeating photos across the cluster
  if (Array.isArray(node.branchNodes) && node.branchNodes.length > 0) {
    for (const bn of node.branchNodes) {
      try {
        const branchTarget = bn.visualSearchQuery || bn.title;
        if (branchTarget) {
          const branchContext = bn.category || bn.title || '';
          const bPhotos = await fetchAiCuratedPhotos({
            query: branchTarget,
            nodeTitle: bn.title,
            nodeCategory: bn.category,
            nodeDescription: bn.description,
            count: 8,
            contextHint: branchContext,
            seenClusterUrls,
          });

          if (Array.isArray(bPhotos) && bPhotos.length > 0) {
            bn.photos = bPhotos;
            bn.primaryPhoto = bPhotos[0];
            bPhotos.forEach((p) => trackPhoto(p));
          } else {
            bn.photos = [];
            bn.primaryPhoto = null;
          }
        }
      } catch (e) {}
    }
  }

  // 3. ENFORCE TOTAL CANVAS STRUCTURAL DIVERSITY:
  // Rotate every single node (primary and branches) through distinct layout archetypes!
  const assignDiverseLayout = (n) => {
    if (!n.layout) n.layout = {};
    const isMath = Boolean(n.formula);
    const hasPhotos = Array.isArray(n.photos) && n.photos.length > 0;

    if (isMath) {
      const chosen = MATH_CYCLE[CANVAS_STRUCTURE_ROTATION.mathIndex++ % MATH_CYCLE.length];
      n.layout.structure = chosen;
      n.layout.width = chosen === 'split_formula' ? 485 : 340;
    } else if (hasPhotos) {
      const chosen = MEDIA_CYCLE[CANVAS_STRUCTURE_ROTATION.mediaIndex++ % MEDIA_CYCLE.length];
      n.layout.structure = chosen;
      n.layout.width = (chosen === 'split_media_right' || chosen === 'split_media_left') ? 460 : 335;
    } else {
      n.layout.structure = 'text_dossier';
      n.layout.width = 360;
    }
  };

  assignDiverseLayout(node);
  if (Array.isArray(node.branchNodes) && node.branchNodes.length > 0) {
    node.branchNodes.forEach((bn) => assignDiverseLayout(bn));
  }

  return node;
}

/**
 * Executes a direct query to Groq Cloud (Llama 3.3 70B, DeepSeek R1, etc.).
 * Ultra-fast inference with 14,400 free requests/day.
 */
export async function queryGroqDirect({ query, activeNodeContext = null, workspaceName = 'Applied Kinematics', existingNodes = [] }) {
  const apiKey = getStoredGroqKey();
  const model = getStoredGroqModel();

  if (!apiKey) {
    throw new Error('No Groq API Key found. Please enter your Groq API key (starts with gsk_...) in AI Settings.');
  }

  const isSingle = isDirectConceptQuery(query);

  let userContent = `PRIMARY RESEARCH TARGET: "${query}"\nWorkspace Context: "${workspaceName}"`;
  if (activeNodeContext) {
    userContent += `\nConnected Entity Context: "${activeNodeContext.title || ''}" (${activeNodeContext.category || ''})`;
  }

  if (Array.isArray(existingNodes) && existingNodes.length > 0) {
    const existingList = existingNodes
      .slice(0, 15)
      .map((n) => `Node [ID: "${n.id}"]: "${n.data?.title || n.title || 'Untitled'}" (${n.data?.category || ''})`)
      .join('; ');
    userContent += `\n\nEXISTING CANVAS NODES FOR POTENTIAL LINKAGE: [${existingList}]`;
    userContent += `\nRELATIONAL LINKAGE MANDATE: Check existing canvas nodes above. Does "${query}" have a GENUINE direct relationship, derivation, or causal link to one or more of them? The model can automatically connect to MORE THAN ONE node and connect nodes to each other! Populate the "connections" array with all genuine links (specifying "nodeId", "connectionExplanation", "connectionLabel", and "connectionFormula" only if mathematical derivation). If no genuine connection exists, return "connections": []. DO NOT FORCE UNRELATED CONNECTIONS.`;
  }

  userContent += `\n\nCRITICAL MANDATE: The generated node title, category, description, detailedSynthesis, and visualSearchQuery MUST FOCUS EXCLUSIVELY ON THE PRIMARY TARGET "${query}". Do NOT return the workspace name or another character as the title.`;

  const isMultiItemOrEnsemble =
    /\b(characters|cast|ensemble|members|types|kinds|examples|all of|list of|each|every|separate|multiple|several|constellation|branches|ecosystem)\b/i.test(query) ||
    query.includes('each one for one node') ||
    query.includes('one node each') ||
    query.includes('each on a node');

  if (isSingle) {
    userContent += '\n\nThis is a direct entity or concept inquiry. Answer it fully on the primary node. You MUST return "branchNodes": [] (empty array).';
  } else if (isMultiItemOrEnsemble) {
    userContent += `\n\nENSEMBLE MANDATE: The user explicitly requested multiple entities or individual member nodes ("each one for one node").
Generate:
1. Primary Node: The lead character, overarching franchise, or main concept.
2. "branchNodes": An array of 4 to 6 distinct nodes, ONE FOR EACH INDIVIDUAL CHARACTER OR MEMBER belonging strictly to "${query}".
For EACH branch node:
- "title": Real, canonical name belonging strictly to this subject.
- "category": Authentic category (e.g. "Anime / Character", "Physics / Particle", etc.).
- "description": 2-3 precise sentences detailing their specific role, psychology, and dynamic.
- "visualSearchQuery": Clean name for photo lookup.
- "relationship": "COUPLED_SYSTEM"
- "relationshipLabel": Specific dynamic or relationship to the primary subject.`;
  }

  const candidateModels = [model, 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b'].filter((m, i, arr) => arr.indexOf(m) === i && Boolean(m));
  let lastError = null;

  for (const currentModel of candidateModels) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: currentModel,
          messages: [
            { role: 'system', content: PSYCHIS_DIRECT_SYSTEM_PROMPT + '\nIMPORTANT: You must return valid JSON matching the schema.' },
            { role: 'user', content: userContent },
          ],
          temperature: 0.6,
          max_tokens: 4000,
          response_format: { type: 'json_object' },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 429) {
          console.warn(`[Groq 429 rate limit on ${currentModel} - failing over to next model]`);
          lastError = new Error(`Groq API rate limit on ${currentModel}: ${errText}`);
          continue;
        }
        throw new Error(`Groq API error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Groq API returned an empty response.');
      }

      const rawNode = parseAiJsonResponse(content);
      const node = await enrichNodeWithRealPhotos(rawNode, query, workspaceName, existingNodes);
      return { success: true, node, source: `groq-${currentModel}` };
    } catch (err) {
      lastError = err;
      if (err.message && err.message.includes('429')) continue;
      throw err;
    }
  }

  throw lastError || new Error('All Groq candidate models failed.');
}

/**
 * Unified direct AI query dispatcher.
 * Exclusively queries Groq Cloud API (Llama 3.3 70B, DeepSeek R1, etc.).
 */
export async function queryDirectAi({ query, activeNodeContext = null, workspaceName = 'Applied Kinematics', existingNodes = [] }) {
  return await queryGroqDirect({ query, activeNodeContext, workspaceName, existingNodes });
}

export const queryGeminiDirect = queryDirectAi;

/**
 * Tests Groq connectivity and returns roundtrip latency in milliseconds.
 */
export async function testGroqConnection(apiKey, modelName) {
  const keyToTest = (apiKey || getStoredGroqKey() || '').trim();
  const modelToTest = modelName || getStoredGroqModel();

  if (!keyToTest) {
    return { success: false, message: 'Groq API Key is empty (starts with gsk_...).', latencyMs: 0 };
  }

  const startTime = performance.now();
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keyToTest}`,
      },
      body: JSON.stringify({
        model: modelToTest,
        messages: [{ role: 'user', content: 'Ping' }],
        max_tokens: 10,
      }),
    });

    const latencyMs = Math.round(performance.now() - startTime);
    if (!res.ok) {
      const err = await res.text();
      let parsedErr = err;
      try {
        const jsonErr = JSON.parse(err);
        parsedErr = jsonErr.error?.message || err;
      } catch (e) {}

      // If model not found or deprecated, query live models and suggest alternatives
      if (res.status === 404) {
        const liveModels = await fetchGroqLiveModels(keyToTest);
        if (liveModels.length > 0) {
          const sampleNames = liveModels.slice(0, 3).map((m) => m.id).join(', ');
          return {
            success: false,
            message: `Model "${modelToTest}" was deprecated by Groq. Live models: ${sampleNames}`,
            suggestedModels: liveModels,
            latencyMs,
          };
        }
      }
      return { success: false, message: `Groq error (${res.status}): ${parsedErr}`, latencyMs };
    }
    return { success: true, message: `Connected to ${modelToTest}`, latencyMs };
  } catch (err) {
    return { success: false, message: `Connection failed: ${err.message}`, latencyMs: Math.round(performance.now() - startTime) };
  }
}

/**
 * Fetches real, high-resolution media across multi-provider open web indexes (Openverse, Commons, Wikipedia, Archives).
 * Prioritizes live multi-provider archival search with strict timeouts and cluster deduplication.
 */
export async function fetchAiCuratedPhotos({
  query,
  nodeTitle,
  nodeCategory,
  nodeDescription,
  count = 4,
  contextHint = '',
  seenClusterUrls = new Set()
}) {
  const searchTerm = (query || nodeTitle || '').trim();

  try {
    const nodeContext = {
      title: nodeTitle || '',
      category: nodeCategory || '',
      description: nodeDescription || '',
      visualSearchQuery: query || '',
    };
    const livePhotos = await fetchLiveArchivalPhotos(searchTerm, count, contextHint, seenClusterUrls, nodeContext);
    if (livePhotos && livePhotos.length > 0) {
      return livePhotos;
    }
  } catch (err) {
    console.warn('[Live photo lookup error]:', err.message);
  }

  return [];
}

/**
 * Tests Gemini connectivity and returns roundtrip latency in milliseconds.
 */
export async function testGeminiConnection(apiKey, modelName) {
  const keyToTest = (apiKey || getStoredGeminiKey() || '').trim();
  const modelToTest = modelName || getStoredModel();

  if (!keyToTest) {
    return { success: false, message: 'API Key is empty.', latencyMs: 0 };
  }

  const startTime = performance.now();

  try {
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keyToTest}`,
      },
      body: JSON.stringify({
        model: modelToTest,
        messages: [{ role: 'user', content: 'Say OK' }],
        max_tokens: 10,
      }),
    });

    const elapsed = Math.round(performance.now() - startTime);

    if (res.ok) {
      return {
        success: true,
        message: `Connected successfully (${modelToTest})`,
        latencyMs: elapsed,
      };
    } else {
      const errText = await res.text();
      return {
        success: false,
        message: `Error ${res.status}: ${errText.slice(0, 100)}`,
        latencyMs: elapsed,
      };
    }
  } catch (err) {
    // Try fallback native REST
    try {
      const nativeEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelToTest}:generateContent?key=${keyToTest}`;
      const nativeRes = await fetch(nativeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say OK' }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      });

      const elapsed = Math.round(performance.now() - startTime);

      if (nativeRes.ok) {
        return {
          success: true,
          message: `Connected successfully via REST (${modelToTest})`,
          latencyMs: elapsed,
        };
      }
      return {
        success: false,
        message: `Connection failed: ${err.message}`,
        latencyMs: elapsed,
      };
    } catch (e) {
      return {
        success: false,
        message: `Network error: ${e.message}`,
        latencyMs: Math.round(performance.now() - startTime),
      };
    }
  }
}
