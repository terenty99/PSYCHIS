"""Validate the rendered delivery; run with a Python environment containing Pillow."""
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageChops, ImageStat

root = Path(__file__).resolve().parent
media = root.parent / 'docs' / 'media'
frames = root / 'output' / 'frames'
assert all((frames / f'{i:04d}.png').exists() for i in range(450))
audit = json.loads((root / 'output' / 'layout-audit.json').read_text())
assert audit['count'] == 49 and not audit['overlaps'] and not audit['duplicateTitles']
probe = json.loads(subprocess.check_output([
    'ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json',
    str(media / 'psychis-readme-master.mp4')
]))
assert len(probe['streams']) == 1
stream = probe['streams'][0]
assert (stream['width'], stream['height'], stream['r_frame_rate'], stream['nb_frames']) == (1920, 1080, '30/1', '450')
assert float(probe['format']['duration']) == 15
gif = Image.open(media / 'psychis-readme.gif')
assert gif.size == (960, 540) and gif.info['loop'] == 0
duration = 0
for i in range(gif.n_frames):
    gif.seek(i)
    duration += gif.info['duration']
assert duration == 15000
first = Image.open(frames / '0000.png').convert('RGB')
last = Image.open(frames / '0449.png').convert('RGB')
seam = max(hi for lo, hi in ImageChops.difference(first, last).getextrema())
assert seam <= 1, seam
a = Image.open(frames / '0360.png').convert('RGB')
b = Image.open(frames / '0375.png').convert('RGB')
motion = {}
for name, box in {'spring': (834, 452, 906, 522), 'packet': (1109, 366, 1181, 435), 'pendulum': (739, 371, 811, 429), 'phasor': (1114, 477, 1186, 534)}.items():
    change = sum(ImageStat.Stat(ImageChops.difference(a.crop(box), b.crop(box))).sum)
    motion[name] = change
    assert change > 0, name
assert Image.open(media / 'psychis-final.png').size == (1920, 1080)
report = {'duration_seconds': 15, 'master_frames': 450, 'gif_frames': gif.n_frames,
          'gif_bytes': (media / 'psychis-readme.gif').stat().st_size,
          'mp4_bytes': (media / 'psychis-readme-master.mp4').stat().st_size,
          'nodes': audit['count'], 'overlaps': audit['overlaps'], 'duplicate_titles': audit['duplicateTitles'],
          'loop_max_channel_delta': seam, 'diagram_motion_pixel_change': motion}
(root / 'output' / 'verification.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
