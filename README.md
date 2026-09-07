# PSYCHIS — Spatial Knowledge Engine & Cognitive Research Atelier

> **An exploratory spatial computing manifold designed for non-linear ideation, multi-domain scientific synthesis, and interactive epistemic modeling.**

[![Status](https://img.shields.io/badge/Status-Active%20Research%20Prototype-blue.svg)](#)
[![Stack](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20TailwindCSS-61dafb.svg)](#)
[![Runtime](https://img.shields.io/badge/Platform-Desktop%20(Electron)%20%7C%20Web-478568.svg)](#)
[![AI Backend](https://img.shields.io/badge/AI%20Engine-FastAPI%20%7C%20Groq%20%2F%20Llama%203%20%7C%20Shadow%20Dataset-ff69b4.svg)](#)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AAA%20Contrast-success.svg)](#)

---

## 1. Executive Summary & Abstract

Traditional digital research tools force human thought into rigid, linear paradigms: sequential text documents, hierarchical file systems, and fragmented browser tabs. When tackling high-dimensional problems—such as mechanical kinematic derivations, solid-state physics, cross-disciplinary literature reviews, or complex character psychology—these linear tools cause cognitive fragmentation.

**PSYCHIS** is an open, high-performance **Spatial Knowledge Engine** and **Cognitive Research Atelier**. It replaces traditional fragmented productivity suites with an infinite, gesture-driven 2D coordinate manifold where nodes are not static cards, but **living, interactive computational artifacts**. Integrating step-by-step LaTeX mathematical derivations, live 60 FPS kinematic mechanism simulations, semantic Bézier linkage physics, an embedded scholarly reader, and a self-curating AI "Shadow Dataset" logging engine, PSYCHIS provides an interconnected environment for synthesized discovery.

---

## 2. Motivation & Problem Statement

Modern knowledge work faces three critical bottlenecks:

1. **The Representation Gap**: Complex mental models are multidimensional graphs, but existing tools (Notion, Obsidian, Google Docs) force them into flat hierarchies or rigid Markdown lists.
2. **The "Static Information" Fallacy**: In conventional knowledge bases, mathematical equations, mechanical diagrams, and data plots are dead images or plain text. They cannot be manipulated, simulated, or linked by epistemological causal relationships.
3. **AI Disconnection & Data Waste**: Standard AI chat interfaces treat every inquiry as a throwaway conversation. The contextual links, user-corrected derivations, and conceptual associations made during research are never captured to refine or train domain-specific models.

**PSYCHIS solves this** by treating knowledge as an interactive geometric topology, pairing deep AI conceptual generation with an automated data capture pipeline that turns research workflows into training datasets for local machine learning models.

---

## 3. Core Philosophy & Design System

### 3.1 Contemplative "Atelier" Aesthetics vs. Sensory Noise
Unlike the ubiquitous dark-mode "cyberpunk" or clinical SaaS aesthetics that cause eye fatigue during prolonged intellectual work, PSYCHIS implements a **warm, contemplative white-grey architectural palette** inspired by sunlit concrete studios and the Japanese aesthetic of *Ma* (intentional negative space):
- **Base Canvas**: Natural paper/concrete tones (`#F8F7F5`, `#E8E6E3`, `#4A4540`) engineered to exceed **WCAG 2.1 AAA** contrast standards.
- **Micro-Texture**: Subtly rendered architectural topographic isolines that provide spatial depth and scale reference without visual distraction.
- **Typography**: Dual typographic rhythm using *Inter* and *Space Grotesk* for human-scale synthesis alongside *JetBrains Mono* for exact mathematical and computational metrics.

### 3.2 Content-Adaptive Heterogeneous Topology
Form strictly follows semantic function. Nodes within PSYCHIS dynamically determine their geometric aspect ratio and internal interface based on their domain:
- **STEM & Physics**: Renders formal KaTeX equations, rigorous proof derivation chains, and vector-based SVG schematics.
- **Kinematic Systems**: Embeds live 60 FPS interactive mechanical simulations (such as a 4-bar Chebyshev straight-line linkage).
- **Humanities, Culture & Dossiers**: Adapts into asymmetric horizontal split cards with authentic historical/visual archives and structured biographical profiles.
- **Dialectical & Contradiction Nodes**: Visualizes opposing epistemic arguments and counter-theses connected by tension-weighted vectors.

---

## 4. Key Architectural Features

### 4.1 Infinite Coordinate Manifold & Gestural Kinematics
- **Fluid Gesture Engine**: Native two-finger canvas panning and focal-point pinch-to-zoom scaling from $35\%$ to $250\%$, preserving sub-pixel cursor alignment.
- **Autonomous Collision-Free Layout**: Algorithmic node placement (`findCollisionFreePosition`) computes bounding box intersections and cluster forces to position newly spawned knowledge constellations organically without overlapping existing work.
- **Dynamic Convex Hulls**: Visual grouping envelopes automatically enclose related conceptual clusters, rendering boundary paths in real time.

### 4.2 High-Visibility Organic Bézier Linkage Layer
Connections in PSYCHIS are not static lines; they are semantically typed, dynamic cubic Bézier vectors:
- **Semantic Classification**: Supports epistemological types including `COUPLED_SYSTEM`, `CONTRADICTS`, `ORIGIN_URL`, and `AXIOMATIC_DERIVATION`.
- **Directional Bias & Vector Physics**: Linkages curve dynamically according to spatial relationship biases and port orientations, with interactive hover states displaying coupling percentages, mathematical invariants, and rationale notes.

### 4.3 Domain-Specific Interactive Viewports
- **Live 60 FPS Kinematic Simulator**: Mathematical four-bar mechanism rendered via dynamic SVG trigonometry with adjustable crank velocities and live trajectory tracking.
- **KaTeX Step-by-Step Derivation Deck**: Interactive mathematical proofs displaying boundary postulates, intermediate transformations, and closed-form solutions with screen-reader accessible mathML fallbacks.
- **Drude-Lorentz Optical Spectroscopy Viewport**: Interactive solid-state physics charts displaying plasma frequency response curves and complex dielectric functions.
- **Integrated Scholarly Reader**: In-app research drawer enabling researchers to browse arXiv preprints and documentation, with one-click entity extraction directly into the canvas.

### 4.4 The Spark AI Engine & Shadow Dataset Pipeline
At the core of PSYCHIS is an autonomous intelligence layer powered by a high-throughput FastAPI backend interfacing with ultra-fast LLM inference (Groq / Llama 3 / open weights):
- **Domain-Aware Heuristic Routing**: Intelligently distinguishes rigorous mathematical/engineering theorems from cultural or biographical queries, preventing pseudoscientific hallucinations (e.g., generating proofs only for genuine STEM concepts).
- **Offline Synthetic Mode**: Operates fully offline without external API access using an internal parametric invariant heuristic model.
- **Continuous "Shadow Dataset" Collection**: Every structured synthesis, user adjustment, and inquiry is automatically logged to an asynchronous `training_dataset.jsonl` pipeline. This transforms natural user research sessions into cleanly labeled instruction-tuning datasets ready for local LoRA / fine-tuning of private models.

---

## 5. Technical Architecture & Tech Stack

```
PSYCHIS Architecture
├── Frontend (Client / Presentation Layer)
│   ├── React 18 & Vite (High-throughput reactive virtual DOM)
│   ├── TailwindCSS (Contemplative architectural styling & design tokens)
│   ├── Lucide Icons & KaTeX (Mathematical typesetting and scientific iconography)
│   ├── Spatial Canvas Engine (Custom coordinate transform, gesture tracking, SVG link layer)
│   └── Offline Knowledge Synthesizer (Built-in deterministic concept clustering)
│
├── Desktop Runtime
│   └── Electron (Native hardware acceleration, filesystem persistence, local window framing)
│
├── Backend (AI Synthesis & Data Pipeline)
│   ├── FastAPI (Asynchronous Python microservice)
│   ├── Groq / Cloud LLM API Client (Sub-second structured JSON reasoning)
│   ├── Robust JSON & LaTeX Sanitizer (Regex-based raw escape and syntax correction)
│   └── Shadow Dataset Engine (Background training pair stream logger)
│
└── Deployment & Standalone Distribution
    ├── Electron Desktop Binary (PSYCHIS.exe)
    ├── Static Web App (Vite build / GitHub Pages)
    └── Zero-Dependency Single-File Preview (prototype_preview.html)
```

---

## 6. Academic & Real-World Significance

PSYCHIS represents an interdisciplinary intersection of:
1. **Human-Computer Interaction (HCI)**: Pioneering non-intrusive spatial interfaces for complex cognitive tasks, prioritizing focus, tactile feedback, and reduction of cognitive load.
2. **Knowledge Representation & Epistemology**: Moving beyond relational databases to spatial hypergraphs that represent not just "what" something is, but "how" and "why" it relates to adjacent concepts through mathematical coupling or dialectical opposition.
3. **Applied Machine Learning & Data Curation**: Bridging the gap between knowledge retrieval and model training by making the user's research process itself the generative curation loop for future artificial intelligence.

---

## 7. About the Author & Project Context

Developed as an independent research exploration in human-centered software engineering, spatial user interfaces, and generative knowledge architecture. 

*Repository and live demonstrations are maintained for scholarly review, academic applications, and open-source research.*
