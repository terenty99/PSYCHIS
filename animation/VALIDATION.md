# Revised render verification

- MP4: H.264, 1920 × 1080, 30 fps, 450 frames, 15.000 seconds, no audio; 5,109,298 bytes.
- GIF: 960 × 540, 300 frames, 20 fps, 15.000 seconds, infinite loop; 9,815,154 bytes.
- Final PNG: 1920 × 1080.
- 49 distinct node titles, five imported card components, four different moving diagrams, 48 connections and 12 native topic clusters.
- Measured final card bounds have no overlaps, with an additional 8-pixel spacing margin.
- All four diagram regions change between the 12.0- and 12.5-second rendered frames: spring, wave packet, simple pendulum and phasor.
- First and last uncompressed frames differ by at most 1/255 per RGB channel. The background remains visually unchanged at the seam.
- Inspected the opening, all three opening cards, the expansion, final composition and decoded GIF at its actual README dimensions. The first three cards remain fully in frame; individual card shapes and cluster separation remain visible in the overview.
- Third card settles at 4.3 seconds; camera retreat begins then. Brand reveal starts at 11.5 seconds, followed by a calm hold and fade to the opening canvas.
- App source and the repository's existing README were not modified. Animation source and outputs are isolated in `animation/` and `docs/media/`.

Content was curated around oscillations, waves and sound. Live-generated source material and semantic corrections are documented in `PROVENANCE.md`. The final figure remains an abstract visual impression, with empty facial space and broad outer palm groups.

Run `verify.py` after rendering and encoding, using a Python environment with Pillow. The compact machine-readable result is retained in `output/verification.json`; large intermediate frame files may be removed after validation.
