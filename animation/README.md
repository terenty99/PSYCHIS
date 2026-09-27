# PSYCHIS README animation

An editable, silent, 15-second composition. The application itself is unchanged.

## Deliverables

- `../docs/media/psychis-readme-master.mp4` — 1920 × 1080, 30 fps, H.264.
- `../docs/media/psychis-readme.gif` — 960 × 540, 20 fps, infinite loop.
- `../docs/media/psychis-final.png` — final 1920 × 1080 composition.
- `output/close-up.png` — first three node types, checked before the full render.

Use this in the repository-root README:

```markdown
![PSYCHIS — a space to think in connections](docs/media/psychis-readme.gif)
```

## Render

Requires the repository's installed Node/Electron dependencies and FFmpeg on PATH. From the repository root, start Vite:

```powershell
rtk proxy node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5188
```

In another terminal:

```powershell
rtk proxy node_modules/.bin/electron.cmd animation/render.cjs --checks
rtk proxy node_modules/.bin/electron.cmd animation/render.cjs
rtk proxy powershell -NoProfile -File animation/encode.ps1
```

Open `/animation/index.html?play` through Vite for looping playback, or omit `?play` to inspect the final composition. In the browser console, `renderFrame(seconds)` seeks to an exact time; `play()` and `pause()` control playback. `composition` exposes the node positions, count, edge count and output settings. Font loading uses the same Google Fonts families as the application; an internet connection is needed on a fresh machine.

## Art direction and implementation

`catalog.js` defines the 49 distinct subjects and their positions. `composition.jsx` defines growth, camera and brand timing. It imports the application's `SpawnedNode`, `WebsiteNode`, `MusicNode`, `VideoNode`, `ContradictionNode`, `ConvexHull`, `PsychisLogo`, global CSS, KaTeX styles and atmospheric canvas component. The website preview is a local editorial reading note referencing OpenStax, not a captured external publication.

Four separate diagrams move from absolute frame time: an undamped spring, a wave packet, a simple pendulum and a rotating phasor. The first two use the app's kinetic generator; the latter two use SVGs captured from live Spark results with explicit frame-time motion. Ambient background effects are frozen by `preload.cjs`. Native CSS transitions are disabled for deterministic capture. The third card starts at 3.5 seconds and settles at 4.3 seconds, when the camera retreat begins. The camera goes from 1.35× to 0.20×, retaining larger cards in the overview. All three opening cards remain fully inside the frame.

The graph contains 49 unique titles, 48 links and 12 topic clusters using the app's actual convex-hull renderer and pastel palettes. It suggests an abstract figure with an empty face, upper arms near the torso and outward palm groups. It uses fewer, larger cards than the initial version. The final layout audit checks duplicate titles and overlapping card bounds, including an 8-pixel gap. See `PROVENANCE.md` for live app captures and editorial corrections.

The icon and wordmark reuse `PsychisLogo` at a larger presentation size, with only its percentage padding corrected in this isolated composition. The brand fades in at 11.5 seconds, holds through 14.3, then all foreground content fades to the unchanged opening background. The master has exactly 450 frames and no audio. The GIF reduces frame rate to 20 fps to keep README weight practical.
