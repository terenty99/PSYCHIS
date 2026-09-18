# PSYCHIS

An interactive spatial research canvas for synthesizing and exploring linked knowledge nodes, mathematical derivations, kinematic simulations, and media.

[![Platform](https://img.shields.io/badge/Platform-Desktop%20(Electron)%20%7C%20Web-478568.svg)](#)
[![Stack](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20TailwindCSS-61dafb.svg)](#)
[![Math](https://img.shields.io/badge/Typesetting-KaTeX-3178c6.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)

---

## Overview

**PSYCHIS** is an infinite-canvas workspace designed for research, note-taking, and visual ideation. Rather than organizing ideas into rigid lists or hierarchical folders, PSYCHIS treats knowledge as an interactive 2D spatial graph with customizable cards, typed mathematical and semantic linkages, live simulations, and integrated search and synthesis capabilities.

The interface implements a clean architectural palette engineered for long research sessions with high-contrast typography, clear hierarchy, and smooth gestural navigation.

---

## Key Features

### 1. Infinite Canvas & Spatial Navigation
- **Fluid Gestures**: Pan across an infinite coordinate space with focal-point zooming from 35% to 250%.
- **Marquee Selection**: Multi-select nodes using `Shift + Drag` to move constellations of ideas together.
- **Collision-Free Placement**: Automatically computes coordinate intersections to position newly spawned knowledge cards cleanly without overlapping existing work.

### 2. Specialized Knowledge Node Types
- **STEM & Physics**: In-place KaTeX mathematical formatting with step-by-step analytical proof decks and closed-form solutions.
- **Kinematic Mechanisms**: Live 60 FPS interactive mechanical simulations (including a Chebyshev straight-line linkage) rendered in dynamic SVG trigonometry.
- **Media & Visual Dossiers**: Embedded high-resolution images, streaming audio with Spotify Web API integration, and YouTube video embeds.
- **Dialectical & Contradiction Cards**: Explicitly model opposing arguments and competing hypotheses linked with tension vectors.

### 3. Dynamic Bézier Linkages
- **Typed Semantics**: Connect cards with explicit relationship types (`COUPLED_SYSTEM`, `CONTRADICTS`, `ORIGIN_URL`, `AXIOMATIC_DERIVATION`).
- **Interactive Routing**: Curvature and direction adapt dynamically to node positions, displaying coupling metrics and relationship notes on hover.

### 4. Clustering & Macro-Nodes
- **Organic Convex Hulls**: Group related cards into visual clusters bounded by smoothed polygon hulls.
- **Collapsible Macro-Nodes**: Collapse complex node clusters into compact summary cards with preview thumbnails to reduce visual clutter while preserving graph connections.

### 5. Research & Synthesis Integrations
- **Live Search & Grounding**: Ingest web citations, reference papers, and multimedia via integrated Tavily, YouTube, and Spotify APIs.
- **Neural Synthesis**: Connect to Groq / OpenAI-compatible endpoints to generate structured research cards, formula derivations, and concept relationships directly on the canvas.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React
- **Typesetting & Math**: KaTeX
- **Desktop Runtime**: Electron
- **Backend Service (Optional)**: Python 3.10+, FastAPI, Uvicorn

---

## Getting Started

### Prerequisites
- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher
- **Python**: 3.10 or higher *(only required if running the local backend service)*

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/terenty99/PSYCHIS.git
   cd PSYCHIS
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Web Application

To run the local Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Running the Desktop Application

To launch PSYCHIS in Electron:
```bash
npm run app
```

On Windows, you can also double-click `Launch_PSYCHIS.bat`. On macOS, run `./launch_mac.sh`.

### Running the Backend Service (Optional)

The backend provides additional proxying and server-side utilities for web queries:
```bash
cd backend
pip install -r requirements.txt
python server.py
```
The server starts at `http://localhost:8000` (or `http://psychis.site:8000`).

---

## Desktop Releases (Windows & macOS)

Precompiled native desktop releases are built and released automatically via GitHub Actions:

- **Windows**: `PSYCHIS Setup 1.0.1.exe` (NSIS installer) & `PSYCHIS 1.0.1.exe` (portable)
- **macOS**: `PSYCHIS-1.0.1.dmg` (Disk Image installer) & `PSYCHIS-1.0.1-mac.zip` (.app bundle) supporting both **Apple Silicon (arm64)** and **Intel (x64)** architectures.

### macOS Installation
1. Download the `.dmg` or `.zip` file from the [Releases](https://github.com/terenty99/PSYCHIS/releases) tab.
2. Open the `.dmg` and drag `PSYCHIS.app` to your `/Applications` folder (or extract `PSYCHIS.app` from `.zip`).
3. If macOS displays an alert regarding an unidentified developer, right-click (or Control-click) `PSYCHIS.app`, select **Open**, and click **Open** (or in Terminal run: `xattr -cr /Applications/PSYCHIS.app`).

---

## Dataset Collection & Local Model Training

PSYCHIS includes an autonomous telemetry pipeline designed for fine-tuning open-weights models (e.g. Qwen, Llama) locally on your PC:
- **Shadow Dataset Logging**: Every prompt sent to Spark, every web/visual search query, and every synthesized knowledge node is formatted into an instruction-tuning pair and streamed to the server.
- **Remote Server Collection**: Beta test users seamlessly stream interactions to `psychis.site` without requiring a local Python backend.
- **1-Click Dataset Export**: You can download all accumulated training data at any time from:
  ```
  http://psychis.site:8000/api/dataset/download
  ```
  or directly within the in-app Spark Terminal.

---

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Space` / `H` + Drag | Pan canvas |
| `V` | Switch to selection tool |
| `Shift` + Click | Toggle node selection |
| `Shift` + Drag | Box / Marquee multi-selection |
| `Ctrl` / `Cmd` + `G` | Group selected nodes into cluster |
| `Ctrl` / `Cmd` + `Shift` + `G` | Ungroup focused cluster |
| `Ctrl` / `Cmd` + `K` | Focus quick search / spawn prompt |
| `Escape` | Deselect all / close open modal |
| `+` / `-` | Zoom in / Zoom out |

---

## Project Structure

```
PSYCHIS/
├── src/
│   ├── components/
│   │   ├── nodes/         # Specialized card components (Math, Mechanism, Media, etc.)
│   │   └── ui/            # Canvas controls, minimap, modals, and toolbars
│   ├── hooks/             # Custom React hooks (physics, audio, linkages, selection)
│   ├── layout/            # SpatialCanvas and coordinate manifold viewport
│   ├── styles/            # Global Tailwind and font styles
│   └── utils/             # Coordinate math, convex hulls, color tokens, and API clients
├── backend/               # FastAPI microservice for server-side tools
├── dist/                  # Production web build bundle
├── docs/                  # GitHub Pages distribution
├── electron_main.cjs      # Electron desktop runtime entry point
└── package.json           # Node.js project manifest
```

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
