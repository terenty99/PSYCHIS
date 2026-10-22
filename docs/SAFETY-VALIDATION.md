# Conservative safety fixes — 17 October 2026

## Baseline

- Branch: `main`.
- HEAD: `f8cb9ed8783872793ea14a69a2479a5a5c602b95` (also remote main at inspection).
- Offline tests: 4 passed, 0 failed.
- Production build: passed; existing warning for the main chunk exceeding 500 kB.
- Existing changes: `.gitignore`, `src/utils/pathGenerator.js`, `dist/index.html`,
  deleted old dist assets and new untracked dist assets. Preserved rather than reset.
- Initial diff and copies of user-modified files were backed up outside the repo.
- Builds used temporary output directories rather than overwriting `dist`.

## Changes and risk

| File | Change and purpose | Risk |
| --- | --- | --- |
| `.gitignore` | Ignore additional local environment variants; retain example files and prior user rules. | LOW |
| `.env.example` | List optional frontend variable names with blank values and public-build warning. | LOW |
| `src/utils/providerConfig.js` | Central empty-by-default build configuration for existing providers. | LOW |
| `src/utils/engineClient.js` | Remove Groq/YouTube/Spotify defaults; retain settings getters and integrations. | MEDIUM |
| `src/utils/tavilyClient.js` | Remove bundled Tavily key; retain Settings/env and no-key handling. | LOW |
| `src/utils/visualSearchEngine.js` | Remove Spotify/YouTube defaults and retain configured access and existing fallback routes. | MEDIUM |
| `docs/assets/index-CSRHxZq8.js` | Scrub exact credential copies only; no application rebuild. | LOW |
| `docs/assets/index-CaWttRI5.js` | Scrub exact credential copies only; no application rebuild. | LOW |
| `dist/assets/index-BG0gw-SO.js` | Scrub exact credential copies in the pre-existing untracked user build; retain unrelated edits. | LOW |
| `src/utils/nodeSanitizer.js` | Safely resolve nested text, arrays and malformed/cyclic input; preserve optional null sentinel and primitive behavior. | LOW |
| `src/utils/workspaceStorage.js` | Validate imports against actual export structure; label illustrative demo statuses. | MEDIUM |
| `src/utils/nodeTemplates.js` | Replace unsupported verification/confidence labels with illustrative labels. | LOW |
| `src/App.jsx` | Only change static demo status strings; no orchestration or architecture edits. | LOW |
| `src/utils/researchStatus.js` | Presentation-only handling of unsupported legacy verification labels. | LOW |
| `src/components/nodes/ContradictionNode.jsx` | Use honest status presentation, including saved legacy data. | LOW |
| `src/components/nodes/SpawnedNode.jsx` | Use honest status presentation, including saved legacy data. | LOW |
| `src/components/nodes/MusicNode.jsx` | Use safe status presentation. | LOW |
| `src/components/nodes/VideoNode.jsx` | Use safe status presentation. | LOW |
| `src/components/ui/NodeInspector.jsx` | Remove implicit verified-state fallback; use status presentation helper. | LOW |
| `src/components/ui/ConvexHull.jsx` | Replace numeric coherence badges with Research group / Suggested cluster. | LOW |
| `backend/server.py` | Remove requested model coherence scores and fixed backend fallback scores. | LOW |
| `electron_main.cjs` | Stop automatically granting media capture, display capture and clipboard read; keep playback/fullscreen/copy and existing compatibility settings. | MEDIUM |
| `SECURITY.md` | Explain remaining desktop/network/privacy limitations, credential rotation and smallest future fixes. | LOW |
| `README.md` | Correct stale seeding instructions; add feature status, DOM/SVG/JS wording, provider setup and verification limits. | LOW |
| `docs/SAFETY-VALIDATION.md` | Record baseline, per-file risks, observed behavior and verification limits. | LOW |
| `tests/provider-config.test.mjs` | Unconfigured paths and personal Settings override regressions without real credentials/network. | LOW |
| `tests/research-status.test.mjs` | Legacy unsupported labels and ordinary metadata presentation. | LOW |
| `tests/sanitizer.test.mjs` | Primitive, nested, malformed, array and cyclic input regressions. | LOW |
| `tests/workspace-import.test.mjs` | Actual exporter round-trip, compatibility and malformed payload regressions. | LOW |

Pre-existing changes to `src/utils/pathGenerator.js`, `dist/index.html`, and other
dist asset additions/deletions are not new implementation changes from this task.
Both named user-modified files were verified byte-for-byte against the backup.

## Verification

- `node --test tests/*.test.mjs`: **13 tests passed**, including all original tests.
- Production build: **PASS** after each implementation group; dependency versions unchanged.
- `node --check electron_main.cjs`: **PASS**.
- Backend Python AST parsing: **PASS**.
- Syntax checks for existing dist/docs JavaScript after exact secret replacement: **PASS**.
- `git diff --check`: no whitespace errors.
- Exact-value scan of current tracked files for previously embedded credentials:
  **no matches**. Credential-prefix/encoded-array text scan also found no matches.
- `public/files.zip` inspected: four entries; no credential-prefix matches.
- `.env`, `.env.local`, `.env.production`, and `.env.test` ignore checks passed;
  `.env.example` and `backend/.env.example` remain trackable.

The isolated out-of-tree build reports an additional output-directory notice;
this comes from the audit command, not a product change. The original bundle-size
warning remains. No bundle optimization was attempted.

## Browser smoke test

Using the local development server without entering any credentials:

1. Created `Safety regression check` as a blank investigation.
2. Verified zoom changes from 100% to 115%.
3. Created two template cards; both showed Illustrative example.
4. Dragged a card and selected both cards.
5. Created a sequential-chain connection and a manual group.
6. Collapsed the group; the badge showed Research group, without a score.
7. Reloaded: cards, connection, collapsed group and zoom survived.
8. Exported a real `.psychis` file: parser accepted 2 nodes, 1 edge, 1 cluster.
9. Imported that file through the actual browser file chooser; expanded the group
   and observed both cards and the sequential-chain link again.
10. Panned the workspace; DOM transform reflected the new translation and zoom.

The test workspaces remain in this local browser profile; existing workspaces
were not deleted. Browser logs included pre-existing React key-spread warnings
from unchanged SpatialCanvas code. A restricted external source iframe refused
embedding during inspection; no claim is made that every external host embeds.
The first dev-server attempt encountered an EBUSY watcher on a temporary build
artifact; removing audit directories from the project resolved it without a code change.

## Unverified and intentionally deferred

- Live provider success requires personal credentials and was not exercised.
  Configuration and no-key behavior were regression-tested.
- `backend/test_connection.py` is a live credentialed probe, not an offline test;
  it was not run. Backend endpoints were not integration-tested against providers.
- Electron configuration syntax was checked; a packaged desktop build was not
  launched or certified. The three removed automatic grants have no first-party
  capture/read callers; arbitrary external sites may no longer use those APIs.
- Global certificate bypass, disabled web security, insecure content and header
  stripping remain documented compatibility risks. They need desktop-specific
  request/embed coverage before changing safely.
- Telemetry routing, backend public-deployment hardening and the browser-side
  Spotify secret flow were documented, not redesigned.
- Existing coherence fields remain in frontend data for compatibility, but are
  no longer displayed as measured metrics.
- Generated dist/docs assets received secret scrubbing only, not new feature/UI
  builds. Run the normal production build before testing current source through
  Electron. No packaged binaries, release uploads or Git history were rewritten.
- Historical/downloaded builds and saved settings can still contain old credentials.
  Manually rotate/revoke Groq, Tavily, Spotify and YouTube/Google API credentials.

## Final comparison

- Tests: **PASS** (4 baseline → 13 final).
- Production build: **PASS**.
- Observed regression in exercised flows relative to baseline: **NO**.
- Complete proof of all provider/desktop behavior: **not established**.
