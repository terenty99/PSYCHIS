$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
$mediaPath = Join-Path $repoRoot 'docs/media'
New-Item -ItemType Directory -Force -Path $mediaPath | Out-Null
$framesPath = Join-Path $PSScriptRoot 'output/frames/%04d.png'
& ffmpeg -y -v warning -framerate 30 -i $framesPath -frames:v 450 -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart -an (Join-Path $mediaPath 'psychis-readme-master.mp4')
if ($LASTEXITCODE -ne 0) { throw 'MP4 encoding failed' }
& ffmpeg -y -v warning -framerate 30 -i $framesPath -filter_complex 'fps=20,scale=960:540:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle' -loop 0 (Join-Path $mediaPath 'psychis-readme.gif')
if ($LASTEXITCODE -ne 0) { throw 'GIF encoding failed' }
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'output/final.png') -Destination (Join-Path $mediaPath 'psychis-final.png') -Force
