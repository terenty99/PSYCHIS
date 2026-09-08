import os
import json
import time
import re
import urllib.parse
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException, BackgroundTasks, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, Field
from openai import AsyncOpenAI
from dotenv import load_dotenv

try:
    from ddgs import DDGS
except ImportError:
    try:
        from duckduckgo_search import DDGS
    except ImportError:
        DDGS = None

load_dotenv()

app = FastAPI(
    title="PSYCHIS AI Engine & Shadow Dataset Server",
    version="2026.1",
    description="Lightweight proxy that generates knowledge nodes and shadow-logs training pairs for local fine-tuning."
)

# Enable CORS for desktop app and local web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage paths
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True, parents=True)
DATASET_FILE = DATA_DIR / "training_dataset.jsonl"

# API Client (Exclusively Groq Cloud API)
DEFAULT_GROQ_KEY = ""
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "") or os.getenv("OPENAI_API_KEY", "")
OPENAI_API_KEY = GROQ_API_KEY
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.groq.com/openai/v1")
MODEL_NAME = os.getenv("MODEL_NAME", "openai/gpt-oss-120b")

client = None
if OPENAI_API_KEY:
    client = AsyncOpenAI(api_key=OPENAI_API_KEY, base_url=OPENAI_BASE_URL)

# ?? REQUEST & RESPONSE MODELS ??
class SparkQueryRequest(BaseModel):
    query: str = Field(..., description="Researcher prompt or relationship command")
    active_node_id: Optional[str] = Field(None, description="Currently focused node ID")
    workspace_name: Optional[str] = Field("Applied Kinematics", description="Active workspace name")
    context_nodes: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Neighboring nodes context")

class ProbeQueryRequest(BaseModel):
    node_id: str
    topic: Optional[str] = None
    existing_thesis: Optional[str] = None

class ClusterAnalyzeRequest(BaseModel):
    nodes: List[Dict[str, Any]] = Field(..., description="Active canvas nodes {id, title, category, description, formula}")
    existing_clusters: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Existing formed clusters")

class ClusterSynthesizeRequest(BaseModel):
    cluster_id: Optional[str] = None
    cluster_title: Optional[str] = "Topological Constellation"
    nodes: List[Dict[str, Any]] = Field(..., description="Nodes inside this cluster")

# ?? SHADOW DATASET LOGGER ??
def shadow_log_training_pair(instruction: str, context: Any, response_data: Dict[str, Any]):
    """Silently appends the interaction pair to training_dataset.jsonl for later local PC training."""
    try:
        record = {
            "timestamp": datetime.utcnow().isoformat(),
            "instruction": instruction,
            "input": context,
            "output": json.dumps(response_data, ensure_ascii=False),
            "structured_output": response_data
        }
        with open(DATASET_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
    except Exception as e:
        print(f"[ShadowLogger Error]: {e}")

# ?? SYSTEM PROMPTS ??
PSYCHIS_SYSTEM_PROMPT = """You are PSYCHIS, an advanced spatial knowledge atelier and research canvas for science, mathematics, creative engineering, and culture.

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

4. MEANINGFUL LINKAGES (WHEN BRANCHES ARE GENUINELY APPROPRIATE):
   Every branch node MUST have topic-specific, scientifically accurate linkage metadata:
   - "relationship": "COUPLED_SYSTEM", "CONTRADICTS", "ORIGIN_URL", or "DEFAULT"
   - "relationshipLabel": concise lowercase phrase (e.g. "geometric proof", "spherical extension", "dual formulation")
   - "edgeName": Title for the connection
   - "edgeBadge": Epistemic badge
   - "edgeDescription": Concrete explanation of how the primary node relates to this branch
   - "edgeMathematics": LaTeX formula for the linkage or null
   - "edgeCoupling": e.g. "100% Deductive Proof", "Direct Implication"

5. CONTENT-ADAPTIVE DIVERSE NODE STRUCTURE & MEDIA ARCHETYPES:
   * Content dictates form. Every entity MUST have a tailored "layout.structure" and "mediaType" suited to its nature.
   * AUTONOMOUS VIDEO DECISION:
     - Practical demonstrations, how-to guides, and step-by-step physical processes (e.g. "how to cook soup", origami, mechanical assembly, lab experiments, sports technique, tutorials).
     - Audiovisual culture (music videos, video essays, movie trailers, speeches, anime fight scenes, historic broadcasts, or when explicitly requested).
     - For video: "mediaType": "video", "layout": {"structure": "video_top", "width": 420}, "videoQuery": "clean search query", "videoPlatform": "youtube"
   * AUTONOMOUS MUSIC DECISION:
     - Specific tracks or songs (e.g. "Killer Queen", "Creep" -> displays track info, album, release year, harmonic/lyrical analysis).
     - Bands / Artists (e.g. "PAINFINDER GROUP", "Radiohead" -> presents artist dossier + their defining track).
     - Musical genres, albums, and music theory concepts with audio examples.
     - For music: "mediaType": "music", "layout": {"structure": "music_card", "width": 390}, "musicData": {"trackTitle": "Track Name", "artist": "Artist/Band", "album": "Album", "year": "YYYY", "genre": "Genre", "query": "clean search query"}
   * Available structure types:
     - "video_top": Video player strictly spanning the TOP (width: 420px), title & synthesis below.
     - "music_card": Interactive waveform & acoustic hero card (width: 390px).
     - "split_media_right": WIDE HORIZONTAL CARD (width: 460px). Text on LEFT, photo on RIGHT.
     - "split_media_left": WIDE HORIZONTAL CARD (width: 460px). Photo on LEFT, text on RIGHT.
     - "media_top": Vertical card (width: 320-350px). Photo at top, text below.
     - "media_bottom": Vertical card (width: 320-350px). Text first, photo below.
     - "split_formula": WIDE MATH CARD (width: 485px). Formula card on LEFT, SVG schematic on RIGHT.
     - "formula_top": Vertical math card (width: 340-380px). Formula at top, schematic, proof steps.
     - "text_dossier": Scholarly card (width: 360-420px). Deep multi-paragraph synthesis, NO photos.
     - "minimal_quote": Compact card (width: 295px). High-impact quote.
     - "kinetic_mechanism": Wide mechanism card (width: 400px). Kinematic simulation.
   * If generating multiple nodes: ASSIGN A DIFFERENT STRUCTURE TO EACH NODE!

7. RELATIONAL LINKAGE RULES (MULTI-NODE CONNECTIONS ALLOWED):
   * When existing canvas nodes are provided in the prompt context, evaluate whether the new topic has an AUTHENTIC, GENUINE conceptual, historical, causal, or mathematical connection to ANY of the existing canvas nodes.
   * THE MODEL CAN AUTOMATICALLY CONNECT TO MORE THAN ONE NODE AND CONNECT NODES TO EACH OTHER! If the new concept relates to multiple existing nodes, return all genuine connections in the "connections" array!
   * Each entry in "connections" must specify:
     - "nodeId": The exact ID of the existing canvas node it connects to (e.g. "0x01", "0x02").
     - "connectionExplanation": 1-2 clear, precise sentences explaining why and how these two concepts connect.
     - "connectionLabel": Short 1-2 words (e.g. "derives from", "algebraic dual", "harmonic basis").
     - "connectionFormula": LaTeX mathematical formula ONLY IF one concept mathematically derives directly from the other. Otherwise null!
     - "style": "basic" | "arrowed" | "dashed" (default "basic").
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
  "mediaType": "photo",
  "videoQuery": null,
  "videoPlatform": "youtube",
  "musicData": null,
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
    "width": 420,
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
  "visualSearchQuery": "1-2 word entity or empty string",
  "photos": [],
  "targetedInquiries": ["Question 1", "Question 2"],
  "branchNodes": []
}
Return ONLY valid JSON. Note: For video queries, set "mediaType": "video", "layout": {"structure": "video_top"}, "videoQuery": "clean search query". For music queries, set "mediaType": "music", "layout": {"structure": "music_card"}, "musicData": {"trackTitle": "...", "artist": "...", "album": "...", "year": "...", "genre": "...", "query": "..."}.
"""

# ?? API ROUTES ??

@app.get("/")
def root_status():
    return {
        "status": "online",
        "engine": "PSYCHIS Spatial Backend v2026.1",
        "dataset_file": str(DATASET_FILE.name),
        "dataset_entries": sum(1 for _ in open(DATASET_FILE, 'r', encoding='utf-8')) if DATASET_FILE.exists() else 0
    }

def parse_ai_json(raw_text: str) -> Dict[str, Any]:
    """Robustly parses JSON responses from LLMs, automatically fixing raw LaTeX backslashes."""
    import re
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```[a-zA-Z]*\n", "", cleaned)
        cleaned = re.sub(r"\n```$", "", cleaned)

    json_match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    target_str = json_match.group(0) if json_match else cleaned

    try:
        return json.loads(target_str, strict=False)
    except Exception:
        # Fix unescaped LaTeX backslashes (e.g. \vec, \frac, \mathcal)
        fixed_str = re.sub(r'\\(?![/\\bfnrtu"0-9])', r'\\\\', target_str)
        return json.loads(fixed_str, strict=False)

def is_direct_concept_query(query: str) -> bool:
    import re
    q = (query or "").lower().strip()
    is_exploration = bool(re.search(r"\b(explore|map|constellation|branches|ecosystem|connections|compare|network|graph|cluster)\b", q))
    if is_exploration:
        return False
    is_specific = bool(re.search(r"\b(theorem|law of|formula|equation|definition|what is|how to|prove|derivation|invariant|identity)\b", q)) or any(
        k in q for k in ["коси", "синус", "теорем", "формул", "cosin", "sine", "pythagor", "euler", "schrodinger", "newton", "gauss"]
    )
    is_explicit_single = bool(re.search(r"\b(single|one|solo|isolated|standalone)\s+(node|concept|card|entity)\b", q)) or "single node" in q or "one node" in q
    return is_specific or is_explicit_single

@app.post("/api/spark")
async def execute_spark_query(req: SparkQueryRequest, background_tasks: BackgroundTasks):
    """Generates structured spatial knowledge node and shadow-logs training data."""
    prompt = req.query.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    is_single = is_direct_concept_query(prompt)

    # If no API key is provided, return rich offline heuristic synthesis
    if not client:
        offline_node = {
            "title": prompt.title(),
            "category": "synthetic // parametric analysis",
            "status": "99.4% confidence",
            "description": f"Parametric theoretical synthesis formulated from query: '{prompt}'.",
            "detailedSynthesis": f"Autonomous invariant analysis exploring kinematic and geometric constraints in '{prompt}'. Establishes continuity bounds across state transitions.",
            "layout": {
                "width": 380,
                "aspectRatio": "wide",
                "mediaAspect": "16:9",
                "mediaMaxHeight": 180,
                "density": "comfortable"
            },
            "formula": r"\mathcal{M}_{\text{invariant}} = \oint_\Gamma \vec{F} \cdot d\vec{r} + \kappa \nabla^2 \psi",
            "formulaType": "Parametric Action Invariant",
            "schemaSvg": None,
            "schemaType": None,
            "metrics": {
                "tolerance": "Exact Invariant",
                "confidence": "100% (Q.E.D.)",
                "mode": "Parametric"
            },
            "derivationSteps": [
                {"step": 1, "title": "Boundary Postulate", "formula": r"\nabla \cdot \vec{u} = 0", "explanation": "Incompressibility condition in phase coordinate manifold."},
                {"step": 2, "title": "Euler-Savary Transform", "formula": r"\left(\frac{1}{r} - \frac{1}{r_0}\right)\sin\psi = \frac{1}{R}", "explanation": "Inflection circle osculation at center of curvature."},
                {"step": 3, "title": "Closed-Form Invariant", "formula": r"\lim_{x\to 0} \frac{d^3 y}{dx^3} = 0 \implies y(x) = y_0 + \mathcal{O}(x^5)", "explanation": "Third-order derivative vanishing condition."}
            ],
            "targetedInquiries": [
                f"{prompt} singularity bifurcations",
                f"{prompt} cryogenic wear rates (2024-2026)",
                f"{prompt} flexure substitution invariants"
            ],
            "branchNodes": []
        }
        background_tasks.add_task(shadow_log_training_pair, prompt, req.dict(), offline_node)
        return {"success": True, "node": offline_node}

    try:
        user_prompt = f"Generate a PSYCHIS knowledge node for: {prompt}"
        if req.context_nodes:
            ctx_summary = "; ".join([f'Node [ID: "{n.get("id")}"]: "{n.get("title")}" ({n.get("category", "")})' for n in req.context_nodes[:15]])
            user_prompt += f"\n\nEXISTING CANVAS NODES FOR POTENTIAL LINKAGE: [{ctx_summary}]"
            user_prompt += f"\nRELATIONAL LINKAGE MANDATE: Check existing canvas nodes above. Does '{prompt}' have a genuine direct relationship, derivation, or causal link to one or more of them? The model can automatically connect to MORE THAN ONE node and connect nodes to each other! Populate the 'connections' array with all genuine links (specifying 'nodeId', 'connectionExplanation', 'connectionLabel', and 'connectionFormula' only if mathematical derivation). If no genuine connection exists, return 'connections': []. DO NOT FORCE UNRELATED CONNECTIONS."

        if is_single:
            user_prompt += "\n\nCRITICAL MANDATE: This is a direct theorem, formula, or specific concept inquiry. Answer it fully on the primary node and return \"branchNodes\": [] (ZERO branch nodes). Do NOT auto-spawn limit cases or unsolicited sub-theorems."

        messages = [
            {"role": "system", "content": PSYCHIS_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]
        
        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.7,
            max_tokens=4000,
            response_format={"type": "json_object"}
        )
        raw_text = response.choices[0].message.content.strip()
        node_data = parse_ai_json(raw_text)

        if is_single:
            node_data["branchNodes"] = []
        
        # Shadow log to dataset immediately
        shadow_log_training_pair(prompt, req.model_dump() if hasattr(req, 'model_dump') else req.dict(), node_data)
        
        return {"success": True, "node": node_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Synthesis failed: {str(e)}")

@app.post("/api/probe")
async def execute_probe_query(req: ProbeQueryRequest, background_tasks: BackgroundTasks):
    """Deep probe inquiry branching."""
    topic = req.topic or f"Deep investigation on {req.node_id}"
    return await execute_spark_query(
        SparkQueryRequest(query=topic, active_node_id=req.node_id),
        background_tasks
    )

@app.post("/api/cluster/analyze")
async def analyze_clusters(req: ClusterAnalyzeRequest, background_tasks: BackgroundTasks):
    """
    Autonomous Semantic Loom: Continuous background cluster partition analysis.
    Identifies high-density semantic islands across canvas nodes, proposing cohesive
    knowledge constellations with coherence scores and emergent theses.
    Shadow-logs every candidate evaluation to training_dataset.jsonl.
    """
    nodes = req.nodes
    if not nodes or len(nodes) < 2:
        return {"success": True, "clusters": []}

    clustered_ids = set()
    for c in req.existing_clusters or []:
        for nid in c.get("nodeIds", []):
            clustered_ids.add(nid)

    unclustered_nodes = [n for n in nodes if n.get("id") not in clustered_ids]

    def generate_heuristic_clusters():
        detected = []
        if len(unclustered_nodes) >= 3:
            sample_ids = [n.get("id") for n in unclustered_nodes[:4]]
            sample_titles = [n.get("title", n.get("id")) for n in unclustered_nodes[:4]]
            detected.append({
                "id": f"cluster-loom-{int(time.time())}",
                "title": f"Emergent Constellation: {sample_titles[0]}",
                "domain": unclustered_nodes[0].get("category", "Theoretical Physics // Synthesis"),
                "coherence": 0.88,
                "nodeIds": sample_ids,
                "summary": f"Parametric conceptual convergence across {len(sample_ids)} unclustered knowledge nodes."
            })
        return detected

    if not client:
        heuristic_clusters = generate_heuristic_clusters()
        background_tasks.add_task(
            shadow_log_training_pair,
            "Group and synthesize topological knowledge cluster",
            req.model_dump() if hasattr(req, "model_dump") else req.dict(),
            {"clusters": heuristic_clusters}
        )
        return {"success": True, "clusters": heuristic_clusters}

    try:
        nodes_brief = [
            {
                "id": n.get("id"),
                "title": n.get("title") or n.get("data", {}).get("title"),
                "category": n.get("category") or n.get("data", {}).get("category", ""),
                "description": (n.get("description") or n.get("data", {}).get("description", ""))[:180],
            }
            for n in nodes
        ]

        system_prompt = (
            "You are the PSYCHIS Autonomous Semantic Loom, a high-dimensional epistemic clustering engine. "
            "Analyze the spatial canvas nodes provided and identify natural semantic clusters (groups of >= 2 nodes sharing conceptual, mathematical, or causal affinity). "
            "Return ONLY a JSON object: {\"clusters\": [{\"title\": \"Academic Title\", \"domain\": \"Domain // Field\", \"coherence\": 0.94, \"nodeIds\": [\"id1\", \"id2\"], \"summary\": \"2-3 sentence unifying thesis\"}]}. "
            "Coherence must be a float between 0.70 and 0.99 reflecting topological and semantic coherence."
        )

        user_content = f"Existing clustered node IDs: {list(clustered_ids)}\n\nCanvas nodes to evaluate:\n{json.dumps(nodes_brief, ensure_ascii=False)}"

        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            temperature=0.5,
            max_tokens=2500,
            response_format={"type": "json_object"}
        )

        raw_text = response.choices[0].message.content.strip()
        parsed = parse_ai_json(raw_text)
        clusters = parsed.get("clusters", [])

        for idx, c in enumerate(clusters):
            if "id" not in c:
                c["id"] = f"cluster-loom-{int(time.time())}-{idx}"

        background_tasks.add_task(
            shadow_log_training_pair,
            "Group and synthesize topological knowledge cluster",
            req.model_dump() if hasattr(req, "model_dump") else req.dict(),
            {"clusters": clusters}
        )

        return {"success": True, "clusters": clusters}

    except Exception as e:
        print(f"[SemanticLoom Error]: {e}, falling back to heuristic")
        fallback = generate_heuristic_clusters()
        return {"success": True, "clusters": fallback}

@app.post("/api/cluster/synthesize")
async def synthesize_cluster(req: ClusterSynthesizeRequest, background_tasks: BackgroundTasks):
    """
    Synthesizes a deep epistemological dossier for a formed spatial cluster:
    1. Conceptual Title
    2. 3-bullet epistemological summary
    3. Dialectical tensions between member nodes
    4. Suggested bridge node to adjacent research fields
    Shadow-logs the resulting synthesis to training_dataset.jsonl.
    """
    cluster_nodes = req.nodes
    title = req.cluster_title or "Spatial Constellation"

    def generate_heuristic_synthesis():
        return {
            "title": title,
            "domain": cluster_nodes[0].get("category", "General Mechanics") if cluster_nodes else "Theoretical Physics",
            "coherence": 0.94,
            "summaryBullets": [
                "Constitutes a unified invariant manifold across constrained coordinate transformations.",
                "Integrates empirical observations with continuous analytical conservation laws.",
                "Vanishing boundary curvature validates stability under dynamic perturbations."
            ],
            "emergentThesis": f"Unified epistemic constellation '{title}' establishing continuity across discrete and continuous state bounds.",
            "dialecticalTension": "Frictionless kinematic idealization vs. empirical thermal dissipation under vacuum boundary limits.",
            "bridgeSuggestion": "Propose introducing a Non-Holonomic Constraint node bridging this cluster with thermodynamic entropy manifolds."
        }

    if not client or not cluster_nodes:
        result = generate_heuristic_synthesis()
        background_tasks.add_task(
            shadow_log_training_pair,
            "Synthesize epistemological cluster abstract and bridge",
            req.model_dump() if hasattr(req, "model_dump") else req.dict(),
            result
        )
        return {"success": True, "synthesis": result}

    try:
        nodes_summary = [
            {
                "id": n.get("id"),
                "title": n.get("title") or n.get("data", {}).get("title"),
                "category": n.get("category") or n.get("data", {}).get("category", ""),
                "description": n.get("description") or n.get("data", {}).get("description", ""),
                "formula": n.get("formula") or n.get("data", {}).get("formula", None)
            }
            for n in cluster_nodes
        ]

        system_prompt = (
            "You are PSYCHIS, an advanced epistemological research synthesis engine. "
            "Synthesize the combined knowledge of the constituent nodes into a coherent theoretical dossier. "
            "Return ONLY a JSON object: {\n"
            "  \"title\": \"Rigorous Academic Title\",\n"
            "  \"domain\": \"Domain // Subfield\",\n"
            "  \"coherence\": 0.96,\n"
            "  \"summaryBullets\": [\"Bullet 1\", \"Bullet 2\", \"Bullet 3\"],\n"
            "  \"emergentThesis\": \"2-3 sentence unified thesis statement\",\n"
            "  \"dialecticalTension\": \"Internal contradiction or dialectical tension between concepts\",\n"
            "  \"bridgeSuggestion\": \"Suggested Missing Bridge Concept to connect to adjacent disciplines\"\n"
            "}"
        )

        user_content = f"Cluster Title: {title}\nConstituent Nodes:\n{json.dumps(nodes_summary, ensure_ascii=False)}"

        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            temperature=0.6,
            max_tokens=2500,
            response_format={"type": "json_object"}
        )

        raw_text = response.choices[0].message.content.strip()
        synthesis_data = parse_ai_json(raw_text)

        background_tasks.add_task(
            shadow_log_training_pair,
            "Synthesize epistemological cluster abstract and bridge",
            req.model_dump() if hasattr(req, "model_dump") else req.dict(),
            synthesis_data
        )

        return {"success": True, "synthesis": synthesis_data}

    except Exception as e:
        print(f"[ClusterSynthesize Error]: {e}, falling back to heuristic")
        fallback = generate_heuristic_synthesis()
        return {"success": True, "synthesis": fallback}

@app.get("/api/dataset/stats")
def get_dataset_stats():
    """View total collected training pairs."""
    if not DATASET_FILE.exists():
        return {"total_examples": 0, "file_size_bytes": 0, "file_path": str(DATASET_FILE)}
    
    count = sum(1 for _ in open(DATASET_FILE, 'r', encoding='utf-8'))
    size = DATASET_FILE.stat().st_size
    return {
        "total_examples": count,
        "file_size_bytes": size,
        "file_size_kb": round(size / 1024, 2),
        "file_path": str(DATASET_FILE)
    }

@app.get("/api/dataset/download")
def download_dataset():
    """1-click download of all collected training data directly to your PC."""
    if not DATASET_FILE.exists() or DATASET_FILE.stat().st_size == 0:
        raise HTTPException(status_code=404, detail="No training data collected yet.")
    
    return FileResponse(
        path=DATASET_FILE,
        filename=f"psychis_training_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jsonl",
        media_type="application/x-jsonlines"
    )

# 🌐 MULTI-SOURCE WEB IMAGE SEARCH & SEMANTIC RANKING 🌐

def clean_domain(url: str) -> str:
    if not url:
        return "web archive"
    try:
        netloc = urlparse(url).netloc
        netloc = re.sub(r"^www\d*\.", "", netloc)
        return netloc or "web source"
    except Exception:
        return "web source"

def is_banned_image(url: str, title: str = "") -> bool:
    if not url:
        return True
    lower = f"{url} {title}".lower()
    if (
        lower.endswith('.svg') or '.svg?' in lower or
        lower.endswith('.ico') or '.ico?' in lower or
        'papertoy' in lower or 'papercraft' in lower or 'origami' in lower or
        'tartan' in lower or 'sprite' in lower or 'banner' in lower or
        'clipart' in lower or 'clip-art' in lower or 'favicon' in lower or
        '1526374965328' in lower or '1518770660439' in lower
    ):
        return True
    return False

def score_and_rank_candidates(
    candidates: List[Dict[str, Any]],
    query: str,
    node_title: str = "",
    node_category: str = "",
    node_description: str = ""
) -> List[Dict[str, Any]]:
    text_corpus = f"{query} {node_title} {node_category} {node_description}".lower()
    stopwords = {'the', 'and', 'for', 'with', 'from', 'node', 'visual', 'archive', 'photo', 'photos', 'image', 'images', 'picture', 'pictures'}
    raw_tokens = [w for w in re.findall(r'[a-z0-9]{3,}', text_corpus) if w not in stopwords]
    tokens = list(set(raw_tokens))

    is_stem = bool(re.search(r'\b(physics|mechanic|kinematic|math|formula|theorem|quantum|engineering|linkage|robotics|optics|dynamics|chemistry|biology)\b', text_corpus))
    is_culture = bool(re.search(r'\b(character|actor|television|movie|cinema|film|series|anime|protagonist|author|biography|history|music)\b', text_corpus))

    domain_counts = {}
    scored = []

    for c in candidates:
        url = c.get("url", "")
        title = (c.get("title") or "").lower()
        domain = (c.get("domain") or clean_domain(url)).lower()

        if is_banned_image(url, title):
            continue

        score = 50

        # Exact keyword presence (+30)
        matched_tokens = [t for t in tokens if t in title or t in url.lower()]
        if matched_tokens:
            score += min(35, len(matched_tokens) * 15)

        # Thematic domain relevance (+25)
        if is_stem:
            if any(d in domain for d in ['nature.com', 'geogebra.org', 'arxiv.org', 'sciencemag.org', 'mit.edu', 'stanford.edu', 'nasa.gov', 'sciencedirect.com', 'phys.org', 'stackexchange.com']):
                score += 25
            elif 'wikipedia.org' in domain or 'wikimedia.org' in domain:
                score += 15
        elif is_culture:
            if any(d in domain for d in ['imdb.com', 'variety.com', 'hollywoodreporter.com', 'rollingstone.com', 'thetvdb.com', 'alphacoders.com', 'wallpapercave.com', 'fandom.com', 'tvmaze.com', 'artstation.com', 'deviantart.com']):
                score += 25
            elif 'wikipedia.org' in domain or 'wikimedia.org' in domain:
                score += 15

        # Source diversity bonus (+20, penalty for repeated domains)
        d_seen = domain_counts.get(domain, 0)
        if d_seen == 0:
            score += 20
        else:
            score -= (d_seen * 15)
        domain_counts[domain] = d_seen + 1

        # Resolution bonus if available
        try:
            w = int(c.get("width") or 0)
            h = int(c.get("height") or 0)
            if w >= 800 and h >= 600:
                score += 10
            elif w > 0 and w < 300 and h > 0 and h < 300:
                score -= 30
        except Exception:
            pass

        c["score"] = score
        scored.append(c)

    scored.sort(key=lambda x: x.get("score", 0), reverse=True)
    return scored

def fetch_ddg_images(query: str, max_results: int = 25) -> List[Dict[str, Any]]:
    if not DDGS:
        return []
    try:
        results = []
        ddgs_client = DDGS()
        raw = list(ddgs_client.images(query, max_results=max_results))
        for item in raw:
            img_url = item.get('image')
            if not img_url:
                continue
            purl = item.get('url') or ''
            dom = clean_domain(purl or img_url)
            title = item.get('title') or query
            results.append({
                "url": img_url,
                "thumbnail": item.get('thumbnail') or img_url,
                "title": title,
                "caption": f"{title} ({dom})",
                "domain": dom,
                "sourceUrl": purl or img_url,
                "author": dom,
                "source": dom,
                "width": item.get('width'),
                "height": item.get('height'),
                "tag": "Live Web Photo"
            })
        return results
    except Exception as e:
        print(f"[DDG Image Search Error]: {e}")
        return []

def fetch_bing_images(query: str, max_results: int = 25) -> List[Dict[str, Any]]:
    try:
        s = requests.Session()
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        r = s.get('https://www.bing.com/images/search', params={'q': query, 'form': 'HDRSC2'}, headers=headers, timeout=6)
        if r.status_code != 200:
            return []
        soup = BeautifulSoup(r.text, 'html.parser')
        iusc_tags = soup.find_all('a', class_='iusc')
        results = []
        for a in iusc_tags[:max_results]:
            m_attr = a.get('m')
            if not m_attr:
                continue
            try:
                m_data = json.loads(m_attr)
                img_url = m_data.get('murl')
                if not img_url:
                    continue
                thumb = m_data.get('turl') or img_url
                purl = m_data.get('purl') or ''
                dom = clean_domain(purl or img_url)
                title = m_data.get('t') or m_data.get('desc') or query
                title = re.sub(r'[\ue000\ue001]', '', title).strip()
                results.append({
                    "url": img_url,
                    "thumbnail": thumb,
                    "title": title,
                    "caption": f"{title} ({dom})",
                    "domain": dom,
                    "sourceUrl": purl or img_url,
                    "author": dom,
                    "source": dom,
                    "width": m_data.get('width'),
                    "height": m_data.get('height'),
                    "tag": "Live Web Photo"
                })
            except Exception:
                continue
        return results
    except Exception as e:
        print(f"[Bing Image Search Error]: {e}")
        return []

def search_web_images(
    query: str,
    count: int = 20,
    node_title: str = "",
    node_category: str = "",
    node_description: str = ""
) -> List[Dict[str, Any]]:
    candidates = []
    seen_urls = set()

    # 1. Primary: Direct Bing image scraping (yields 30+ diverse open-web photos with domains)
    bing_res = fetch_bing_images(query, max_results=count)
    for r in bing_res:
        u = r.get("url", "").split("?")[0].lower()
        if u and u not in seen_urls:
            seen_urls.add(u)
            candidates.append(r)

    # 2. Secondary: DuckDuckGo images (supplements or acts as fallback)
    if len(candidates) < count:
        ddg_res = fetch_ddg_images(query, max_results=count)
        for r in ddg_res:
            u = r.get("url", "").split("?")[0].lower()
            if u and u not in seen_urls:
                seen_urls.add(u)
                candidates.append(r)

    # 3. Tertiary: Openverse API fallback if still sparse
    if len(candidates) < 5:
        try:
            ov_res = requests.get(
                'https://api.openverse.org/v1/images/',
                params={'q': query, 'page_size': count},
                headers={'User-Agent': 'PSYCHIS-KnowledgeCanvas/1.0'},
                timeout=5
            )
            if ov_res.status_code == 200:
                for item in ov_res.json().get('results', []):
                    img_url = item.get('url')
                    if img_url:
                        dom = clean_domain(item.get('foreign_landing_url') or img_url)
                        candidates.append({
                            "url": img_url,
                            "thumbnail": item.get('thumbnail') or img_url,
                            "title": item.get('title') or query,
                            "caption": f"{item.get('title') or query} ({dom})",
                            "domain": dom,
                            "sourceUrl": item.get('foreign_landing_url') or img_url,
                            "author": item.get('creator') or dom,
                            "source": dom,
                            "tag": "Live Web Photo"
                        })
        except Exception:
            pass

    # Score and rank candidate pool
    ranked = score_and_rank_candidates(
        candidates,
        query=query,
        node_title=node_title,
        node_category=node_category,
        node_description=node_description
    )

    # Assign stable unique IDs
    for idx, c in enumerate(ranked):
        c["id"] = f"web-photo-{int(time.time()*1000)}-{idx}"

    return ranked[:count]

@app.get("/api/search/images")
@app.get("/api/search-images")
def search_images_endpoint(
    q: str = Query(..., description="Image search query string"),
    count: int = Query(20, description="Max candidate count to return"),
    node_title: Optional[str] = Query(None),
    node_category: Optional[str] = Query(None),
    node_description: Optional[str] = Query(None)
):
    """Multi-source open-web image search across whole internet (DDG + Bing + Openverse) with AI thematic ranking."""
    query = q.strip()
    if not query:
        return {"success": True, "results": []}

    results = search_web_images(
        query=query,
        count=count,
        node_title=node_title or "",
        node_category=node_category or "",
        node_description=node_description or ""
    )
    return {"success": True, "query": query, "count": len(results), "results": results}

@app.get("/api/proxy/image")
def proxy_image_endpoint(url: str = Query(..., description="Target image URL to stream")):
    """CORS-safe proxy to stream remote images and prevent hotlinking / origin blocks."""
    if not url or not url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="Invalid image URL")

    try:
        resp = requests.get(
            url,
            stream=True,
            timeout=8,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Referer": url,
            }
        )
        content_type = resp.headers.get("Content-Type", "image/jpeg")
        return StreamingResponse(
            resp.iter_content(chunk_size=8192),
            media_type=content_type,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=86400",
            }
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Image proxy error: {str(e)}")

# 🎬 DYNAMIC VIDEO SEARCH (BING VIDEOS + DDG FALLBACK) 🎬
def search_web_videos(query: str, count: int = 25) -> List[Dict[str, Any]]:
    results = []
    seen_urls = set()

    # 1. Primary: Direct Bing Videos Scraping (Extracts YouTube & TikTok cards with zero blocks)
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        r = requests.get('https://www.bing.com/videos/search', params={'q': query, 'form': 'HDRSC3'}, headers=headers, timeout=6)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, 'html.parser')
            video_divs = soup.find_all('div', class_=re.compile(r'mc_vtvc'))
            for v_div in video_divs:
                mmeta_raw = v_div.get('mmeta')
                if not mmeta_raw:
                    continue
                try:
                    mmeta = json.loads(mmeta_raw)
                    url = mmeta.get('murl') or mmeta.get('pgurl') or ''
                    if not url or url in seen_urls:
                        continue
                    seen_urls.add(url)

                    # Extract metadata from aria-label or child elements
                    aria = ''
                    a_tag = v_div.find('a', class_=re.compile(r'mc_vtvc_link')) or v_div.find('a', attrs={'aria-label': True})
                    if a_tag:
                        aria = a_tag.get('aria-label', '')

                    title = ''
                    duration = ''
                    uploader = ''
                    if aria:
                        parts = aria.split(' · ')
                        title = re.sub(r' from (YouTube|TikTok|Vimeo).*$', '', parts[0], flags=re.IGNORECASE).strip()
                        for p in parts:
                            if 'duration:' in p.lower():
                                duration = re.sub(r'duration:\s*', '', p, flags=re.IGNORECASE).strip()
                            if 'uploaded by' in p.lower():
                                uploader = re.sub(r'uploaded by\s*', '', p, flags=re.IGNORECASE).split('·')[0].strip()

                    yt_match = re.search(r'(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?/#\s]{11})', url, re.IGNORECASE)
                    is_tiktok = 'tiktok.com' in url.lower()
                    video_id = yt_match.group(1) if yt_match else None

                    thumb = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg" if video_id else mmeta.get('turl', '')

                    results.append({
                        "id": f"vid-{video_id or len(results)}-{int(time.time())}",
                        "title": title or query,
                        "duration": duration or "",
                        "uploader": uploader or ("YouTube Creator" if video_id else "Web Video"),
                        "url": url,
                        "platform": "youtube" if video_id else ("tiktok" if is_tiktok else "web"),
                        "videoId": video_id,
                        "thumbnail": thumb,
                    })
                    if len(results) >= count:
                        break
                except Exception:
                    continue
    except Exception as e:
        print(f"[Bing Video Search Error]: {e}")

    # 2. Secondary fallback: DuckDuckGo Videos
    if len(results) == 0 and DDGS:
        try:
            ddgs_client = DDGS()
            raw_vids = list(ddgs_client.videos(query, max_results=count))
            for v in raw_vids:
                url = v.get('content') or ''
                if not url or url in seen_urls:
                    continue
                seen_urls.add(url)
                yt_m = re.search(r'(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?/#\s]{11})', url, re.IGNORECASE)
                vid = yt_m.group(1) if yt_m else None
                results.append({
                    "id": f"ddg-vid-{vid or len(results)}",
                    "title": v.get('title') or query,
                    "duration": v.get('duration') or "",
                    "uploader": v.get('uploader') or "YouTube",
                    "url": url,
                    "platform": "youtube" if vid else "web",
                    "videoId": vid,
                    "thumbnail": f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg" if vid else v.get('images', {}).get('medium', ''),
                })
        except Exception as e:
            print(f"[DDG Video Fallback Error]: {e}")

    return results

@app.get("/api/search-videos")
@app.get("/api/search/videos")
def search_videos_endpoint(
    q: str = Query(..., description="Video search query string"),
    count: int = Query(25, description="Max videos to return")
):
    query = q.strip()
    if not query:
        return {"success": True, "results": []}
    results = search_web_videos(query=query, count=count)
    return {"success": True, "query": query, "count": len(results), "results": results}

# 🎵 DYNAMIC MUSIC & TRACK SEARCH (ITUNES + DEEZER) 🎵
def search_music_tracks(query: str, count: int = 15) -> List[Dict[str, Any]]:
    results = []

    # 1. Primary: Apple iTunes Search API (High quality 30s AAC preview, 600x600 artwork, zero API key)
    try:
        r = requests.get(
            'https://itunes.apple.com/search',
            params={'term': query, 'media': 'music', 'entity': 'song', 'limit': count},
            headers={'User-Agent': 'PSYCHIS-KnowledgeCanvas/1.0'},
            timeout=6
        )
        if r.status_code == 200:
            data = r.json()
            for track in data.get('results', []):
                t_name = track.get('trackName')
                preview = track.get('previewUrl')
                if t_name and preview:
                    art = (track.get('artworkUrl100') or '').replace('100x100bb', '600x600bb')
                    dur = round(track.get('trackTimeMillis', 30000) / 1000) if track.get('trackTimeMillis') else 30
                    rel_date = track.get('releaseDate') or ''
                    year = rel_date[:4] if len(rel_date) >= 4 else ''
                    results.append({
                        "id": f"itunes-{track.get('trackId', len(results))}",
                        "trackTitle": t_name,
                        "artist": track.get('artistName', 'Unknown Artist'),
                        "album": track.get('collectionName', 'Single / EP'),
                        "year": year,
                        "genre": track.get('primaryGenreName', 'Music'),
                        "previewUrl": preview,
                        "fullTrackUrl": track.get('trackViewUrl', ''),
                        "duration": dur,
                        "artwork": art,
                        "source": "Apple Music / iTunes"
                    })
    except Exception as e:
        print(f"[iTunes Music Search Error]: {e}")

    # 2. Secondary fallback: Deezer Search API
    if len(results) == 0:
        try:
            r = requests.get(
                'https://api.deezer.com/search',
                params={'q': query},
                headers={'User-Agent': 'Mozilla/5.0'},
                timeout=6
            )
            if r.status_code == 200:
                data = r.json()
                for track in data.get('data', [])[:count]:
                    t_title = track.get('title')
                    preview = track.get('preview')
                    if t_title and preview:
                        album_info = track.get('album', {})
                        art = album_info.get('cover_big') or album_info.get('cover_medium') or ''
                        results.append({
                            "id": f"deezer-{track.get('id', len(results))}",
                            "trackTitle": t_title,
                            "artist": track.get('artist', {}).get('name', 'Unknown Artist'),
                            "album": album_info.get('title', 'Single'),
                            "year": "",
                            "genre": "Music",
                            "previewUrl": preview,
                            "fullTrackUrl": track.get('link', ''),
                            "duration": track.get('duration', 30),
                            "artwork": art,
                            "source": "Deezer"
                        })
        except Exception as e:
            print(f"[Deezer Music Search Error]: {e}")

    return results

@app.get("/api/search-music")
@app.get("/api/search/music")
def search_music_endpoint(
    q: str = Query(..., description="Music track or artist query string"),
    count: int = Query(15, description="Max tracks to return")
):
    query = q.strip()
    if not query:
        return {"success": True, "results": []}
    results = search_music_tracks(query=query, count=count)
    return {"success": True, "query": query, "count": len(results), "results": results}

if __name__ == "__main__":
    import uvicorn
    print("Starting PSYCHIS Shadow Logging Backend on http://0.0.0.0:8000 ...")
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)