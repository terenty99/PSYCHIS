# Security and prototype limitations

## Provider credentials

Distributed source must not contain provider keys or Spotify client secrets.
Previously bundled Groq, Tavily, YouTube/Google API, and Spotify credentials must
be revoked or rotated manually at their providers. Removal from this working tree
does not remove historical commits, previously downloaded builds, or saved browser
settings. No Git history was rewritten.

Use AI Settings for personal local configuration. Optional root `VITE_*` variables
are public build-time configuration: Vite embeds them in browser JavaScript.
Never distribute a build containing personal keys. Keep server-side Groq/Tavily
credentials in ignored `backend/.env`; frontend settings do not populate it.
Spotify's current browser integration handles a client secret locally and is
appropriate only for a personal prototype, not a public multi-user deployment.
The smallest future fix is a server-side token exchange without shipping the secret.

## Electron desktop

The shell preserves `nodeIntegration: false` and `contextIsolation: true`.
Automatic camera/microphone, screen capture, and clipboard-read grants have been
removed: no first-party feature uses them. Media playback, fullscreen, and
clipboard-write permissions remain for current player and copy controls.

The following legacy compatibility settings remain **insecure**:

| Setting | Existing dependency / reason | Smallest future fix |
| --- | --- | --- |
| `webSecurity: false` | Cross-origin source viewing, direct provider and media requests | Inventory actual requests, add narrowly scoped backend proxies, then test with web security enabled. |
| `allowRunningInsecureContent: true` | HTTP backend/source/media paths | Migrate required paths to HTTPS or explicit local-only routes and verify embeds. |
| `ignore-certificate-errors` | Global legacy compatibility workaround; no verified per-host need | Audit required HTTPS endpoints and certificate chains, remove the switch, then verify desktop research/media flows. |
| Response security headers stripped | Framing external source pages in the embedded browser | Preserve headers; fall back to opening framing-restricted sources externally. Verify this workflow first. |
| Broad fullscreen/autoplay/clipboard-write grants | Existing player/embed and copy behavior | Scope to tested origins and user gestures once desktop coverage exists. |

Restoring these settings without testing provider requests, embeds, and desktop
navigation could break current workflows. This task does not claim they are safe
or that retaining them is technically necessary for every site. Avoid entering
sensitive information into the embedded browser. Prefer the normal system browser
for authentication and sensitive browsing. The prototype is not a hardened browser.

## Backend and interaction recording

Use the documented loopback binding (`127.0.0.1`), not a public-facing deployment.
The backend has permissive CORS, unauthenticated dataset routes, and a URL-based
image proxy. A public deployment needs authentication, origin restrictions, proxy
destination validation, and request limits.

Research actions can record prompts, context, and generated results in JSONL.
Frontend telemetry also tries configured and legacy remote endpoints and may queue
records in browser storage. Offline generation is not network isolation. This
behavior was retained to avoid changing existing flows; an explicit consent and
local-only destination setting is the smallest future privacy improvement.

## Content provenance

Example cards are illustrative. Generated text, suggested clusters, and links are
not verified findings. Legacy coherence fields may remain in saved/exported files
for compatibility, but the UI does not display them as measured confidence.
