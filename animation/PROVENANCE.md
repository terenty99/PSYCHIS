# Content and app provenance

The revised film follows one coherent research thread: **oscillations, waves and sound**. All 49 titles are distinct. Supporting explanations are curated research notes, not claims that all 49 nodes were generated automatically.

## Live application work

Spark was used in the running local application to generate music, video, Fourier, pendulum, cochlea, damped-oscillator and wave-packet cards. Its native multi-selection, Form Cluster, cluster renaming, Tidy cluster and Center All Nodes actions were exercised. A live cluster was named “Motion, waves & analysis.” The film uses the same real card components and `ConvexHull` cluster component, with a presentation layout and twelve thematic groupings.

Captured items used in the film:

- `0x01`: Beethoven's Moonlight Sonata, first movement, arranged for string orchestra. `assets/moonlight.jpg` is the album image returned by the app ([source image](https://i.scdn.co/image/ab67616d0000b273b0b3cb1031e85679bdc435e9)).
- `0x03`: [Wave Reflection and Standing Waves 2.mp4](https://www.youtube.com/watch?v=-n1d1rycvj4). `assets/standing-waves-video.jpg` is its app-returned thumbnail. The film does not play the video.
- `0x04`: Fourier-transform result; `assets/app-fourier.svg` is the captured phasor illustration. The film animates a single vector and describes it as one frequency component, not a complete Fourier reconstruction.
- `0x06`: simple-pendulum result; `assets/app-pendulum.svg` is its captured schema. The film animates the bob and restoring-motion geometry; the period formula explicitly assumes small angles.
- `0x07`: cochlea and tonotopy result, summarized as a text node.
- `0x08`: damped spring–mass equation. A separate native spring animation is explicitly labeled **undamped**, matching its conserved-energy display.
- `0x09`: phase/group velocity result, paired with the app's wave-packet animation and the group-velocity definition.

Supporting source: [OpenStax, University Physics Volume 1, Chapter 16](https://openstax.org/books/university-physics-volume-1/pages/16-introduction). `source.html` is an original reading-note preview referencing that chapter, not a reproduction of the publisher's page.

## Corrections made during curation

- Excluded an unrelated music result returned for a standing-wave request.
- Excluded an incorrect double-pendulum animation offered for a simple-pendulum card.
- Kept undamped and damped oscillator claims separate.
- Removed an unsuitable/broken image from the wave-packet result.
- Replaced overly broad media titles with descriptions of the actual recording/demonstration.
- Avoided reusing the same animation across unrelated nodes.

`silent.wav` is a local silent placeholder for the paused music-card component; the exported film has no audio. Album art and video thumbnails retain their respective owners' rights. No full music or video recording is included.
