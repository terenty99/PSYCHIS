<p align="center">
  <img src="public/favicon.svg" width="220" alt="PSYCHIS — two nodes joined by a curved connection, with the project wordmark">
</p>

<p align="center"><strong>No matter where you are. Everyone is always connected.</strong></p>

PSYCHIS is a spatial workspace for researching the web. Start with a question, develop it with Spark, and arrange sources, explanations, formulas, moving diagrams, and media as connected objects on a persistent canvas.

Research often leaves behind a trail of tabs, disconnected notes, and conversations that are easier to continue than to revisit. PSYCHIS gives that investigation a visible structure: what you found, where it came from, how it relates to another idea, and what you want to explore next.

![Animated tour of PSYCHIS showing research cards, connections, and clusters on a spatial canvas](public/psychis-readme.gif)

## Research that keeps its context

A useful finding rarely stands alone. An explanation belongs beside its source. A formula becomes easier to discuss beside a moving diagram. A competing idea matters because of the claim it challenges.

In PSYCHIS, these can occupy the same workspace. Open a card to investigate its details, follow a source in the built-in browser, ask a question from that card, then zoom out to see the wider investigation. Connections record relationships; clusters gather a line of inquiry into a group you can name, arrange, and collapse.

The aim is to let research grow into **an evolving structure**. AI can suggest an explanation or open another line of inquiry while you organize the material and judge its value. Today, PSYCHIS brings this approach to a local canvas with external research services; establishing the evidence behind each claim remains part of the work.

## From a question to a workspace

Try an investigation into mechanical motion:

1. **Start a workspace.** Choose **New Investigation**, name it “Linkage motion,” and leave automatic seeding unchecked for a blank canvas.
2. **Ask Spark:** “How does a four-bar linkage work? Compare crank-rocker and double-crank mechanisms.” Spark creates research cards; their contents and number depend on the response and available services.
3. **Investigate a card.** Open **view +** to inspect its explanation, source, and formulas. In **Deep Probe**, choose a suggested inquiry—or ask a follow-up from the selected node—to create a connected discovery. A question about transmission angle can become a branch of the original investigation.
4. **Bring another representation alongside it.** Use **Kinetic Visuals & GIFs** on an applicable physics card to attach an animated diagram. Ask Spark for a video demonstration, or open a web source in the built-in browser and use **Map** to create a canvas card. Check the source against the generated explanation.
5. **Give the investigation shape.** Shift-click related cards and choose **Form Cluster**. Rename the group, tidy its layout, and collapse it when you want to focus elsewhere. Add labels to connections to explain why the cards belong together.
6. **Return to it later.** Workspaces save automatically in the current browser profile. Use the workspace menu to export a `.psychis` file and import it elsewhere.

When you return, the source, explanation, follow-up question, and demonstration are still together. You can pick up the investigation where it became interesting.

## What you can do

### Follow a question further

Spark accepts questions and URLs, generates cards, and can add related branches. Follow-up inquiries carry context from a selected node and create visible connections back to it. The inspector brings together an overview, available references, mathematical expressions, derivation steps, and further questions.

The node palette also provides website, mechanism, transport, topology, contradiction, and general discovery templates. These contain illustrative starting content; they are not newly retrieved research. Music and video have dedicated card interfaces.

### Read, watch, and work through an idea

- **Web sources:** URL cards, website previews, a tabbed built-in browser, and controls to map a page onto the canvas or clip its reference to a selected node. External opening is available when an embedded page cannot load.
- **Mathematics and motion:** KaTeX formula rendering, step-through derivations when supplied, and animated diagrams that can be assigned to physics cards. The kinetic visual generator uses predefined SVG animations selected by topic and prompt; it is an illustration tool, not a general numerical simulation or proof engine.
- **Images, music, and video:** image discovery, music cards with playback and a shared audio player, and embedded video cards with an expanded theater view. Search results and playback depend on the source service, permissions, and media availability; full tracks are not guaranteed.

### Make relationships visible

Drag cards to arrange them, create links between nodes, and edit a connection's label, explanation, color, and line style. Generated links can express origins, follow-ups, related systems, or contradictions. These describe the investigation; a line between two cards is not evidence by itself.

Select several cards to form a cluster. Rename or recolor it, tidy its members, collapse it into an overview card, or expand it again. Pan, zoom, fit the canvas, and use the minimap to move between details and the larger structure. The **?** shortcut opens the in-app controls guide.

### Pick up where you left off

Switch between separate investigations from the workspace menu. Nodes, connections, clusters, and viewport state are saved in `localStorage`. Export/import uses the JSON-based `.psychis` format to carry that structure between workspaces or browser profiles.

This is local persistence, with no implemented account-based sync or simultaneous collaboration. Clearing browser storage can remove saved work; export investigations you want to keep. External pages and media remain dependent on their hosts.

## Run locally

Use **Node.js 22** with npm, matching the repository's release workflow. For the optional Python service, **Python 3.11** is the version used by the backend Dockerfile. A desktop-sized browser is the most practical way to use the canvas.

### 1. Install and start the frontend

From the repository root:

```sh
npm ci
npm run dev
```

Open the address printed by Vite, normally [http://localhost:3000](http://localhost:3000). If that port is occupied, use the port Vite reports. The frontend can run independently of Python for canvas work and direct cloud requests.

### 2. Configure research services

Open the workspace menu → **AI Engine & API Settings**, or click the status/settings control in Spark.

| Service | Purpose | Configuration |
| --- | --- | --- |
| Groq | Generate explanations and structured research cards | Your Groq API key and a model available to your account in AI Settings; use **Test Groq Connection**. |
| Tavily | Retrieve web results and source context | Your Tavily API key in AI Settings; use **Test Tavily**. The Python route has its own environment setting below. |
| YouTube | Optional API-backed video search | YouTube API key in AI Settings. Other search paths also exist. |
| Spotify | Optional music catalog search | Spotify client ID and client secret in AI Settings. iTunes/Deezer search and preview fallbacks are also implemented. |

Use your own credentials; bundled defaults may be unavailable or exhausted. Settings entered in the frontend are stored in the browser profile. The frontend uses Groq. The Python service accepts an OpenAI-compatible base URL, although its model fallbacks are also written for Groq.

Choose the routing mode deliberately:

- **Auto:** tries the configured Python backend, then direct Groq, then retrieval/template fallbacks.
- **Direct Cloud AI Only:** selects the direct Groq generation path; Python is not required for that path.
- **Local Python Server Only:** selects the backend generation path. Set **Backend Port / URL** to `http://localhost:8000` for the service below.
- **Offline Synthesizer (No API):** selects local template synthesis for generation. This is not a network-isolation switch: retrieval, media enrichment, and logging paths can still make requests.

The “Only” labels select a generation route; failure handling can still produce retrieved or template content. An online status label alone does not confirm that a provider has accepted a request.

### 3. Start the Python backend, if needed

The backend handles Spark generation, cluster analysis/synthesis, media search, and research-interaction recording. In a second terminal, from the repository root:

```sh
python -m venv .venv
```

If your system names the Python 3 executable `python3`, use `python3 -m venv .venv` instead.

Activate it on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Or on macOS/Linux:

```sh
source .venv/bin/activate
```

Then install dependencies:

```sh
python -m pip install -r backend/requirements.txt
```

Copy [`backend/.env.example`](backend/.env.example) to `backend/.env` without overwriting an existing configuration. Replace its placeholders:

| Variable | Meaning |
| --- | --- |
| `GROQ_API_KEY` | Your server-side Groq key. The backend also accepts `OPENAI_API_KEY` as a fallback name. |
| `OPENAI_BASE_URL` | API base URL; the supplied example uses `https://api.groq.com/openai/v1`. |
| `MODEL_NAME` | A model available to your provider account. The example names `openai/gpt-oss-120b`; availability is service-dependent. |
| `TAVILY_API_KEY` | Your server-side Tavily key for web retrieval. |

Frontend settings do not populate `backend/.env`, and editing that file does not configure direct browser requests. Keep the file private; `.env` is ignored by Git.

Start the service from its directory:

```sh
cd backend
python -m uvicorn server:app --host 127.0.0.1 --port 8000
```

Check [http://localhost:8000/api/health](http://localhost:8000/api/health) for `"status": "ok"`, then select the local backend in AI Settings. Health confirms the server is running, not that its external credentials work. Restart the backend after changing its environment.

### Desktop and production builds

The Electron shell loads the built frontend. From the repository root:

```sh
npm run build
npm run app
```

Keep the Python backend running separately if you use it; it is not bundled into the desktop package. `npm run preview` serves the frontend build for inspection. The image-search middleware in `vite.config.js` belongs to the development server and is not a production API server.

To package the desktop app, use `npm run dist:win` on Windows or `npm run dist:mac` on macOS. The release workflow builds these two targets. Prefer the explicit startup commands above to the older launch wrappers, which differ in how they start the backend and report the frontend port.

## Inside the repository

| Area | Responsibility |
| --- | --- |
| [`src/App.jsx`](src/App.jsx) | Workspace state, research actions, node creation, and integration of the main UI. |
| [`src/layout/SpatialCanvas.jsx`](src/layout/SpatialCanvas.jsx) | Canvas interaction, selection, dragging, links, and cluster rendering. |
| [`src/components/`](src/components/) | Research and media cards, inspector, browser, Spark, and workspace controls. |
| [`src/utils/`](src/utils/) and [`src/hooks/`](src/hooks/) | AI/search clients, template synthesis, media retrieval, math and kinetic visuals, geometry, persistence, and audio state. |
| [`backend/server.py`](backend/server.py) | FastAPI endpoints, model requests, retrieval, cluster operations, and JSONL interaction recording. |
| [`electron_main.cjs`](electron_main.cjs) | Desktop window, navigation, and embedded browser handling. |
| [`public/`](public/) and [`docs/media/`](docs/media/) | Application branding and README demonstration assets. |

The frontend uses React 18, Vite, Tailwind CSS, and KaTeX. The backend uses FastAPI/Uvicorn, the OpenAI Python client, and web retrieval/parsing libraries. Workspace storage lives in the client; the backend's dataset is a separate record of research interactions.


PSYCHIS is licensed under the [MIT License](LICENSE), copyright © 2026 terenty99.
