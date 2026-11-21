[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Aldo1q/gta6-cover-art-01-v5/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Aldo1q/gta6-cover-art-01-v5/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Neon Coast Cover Studio

A GTA-style cover art maker for the [gta6-cover-art-01 bounty](https://make.fun/bounty/gta6-cover-art-01). Upload your own photo (or try one of the built-in Vice City-style sunset scenes), pick one of three cover layouts, write the headline, choose a colour grade, and export a share-ready PNG.

## What it makes

- **Cover Grid** — the multi-panel poster look: your photo cropped eight different ways into an 8-panel grid, with a bold Anton headline band and a Pacifico tagline.
- **Snapshots** — a tilted polaroid stack over a sunset sky, each print showing a different crop of your photo.
- **Full Bleed** — one hero shot of your photo edge to edge, with the headline low over the grade.

## Features

- Your photo, cropped and positioned per panel (zoom + pan sliders); one photo fills all 8 grid panels, each with its own crop.
- Editable headline and tagline, set in Anton and Pacifico (shipped under `app/fonts/` under the SIL Open Font License).
- Three colour grades: Sunset, Neon, and Vice Pink.
- Live preview — what you see is exactly what the PNG will be.
- One-click PNG export at 1080 × 1080, 1080 × 1350, and 1920 × 1080.
- Fully offline: the app is static files under `app/` and loads nothing over the network. Your photo never leaves your machine. All artwork is original, drawn procedurally on canvas — no Rockstar logos, artwork, or fonts.

## How to run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Pick a layout, upload a photo (or use a built-in scene), type your headline, choose a grade, and hit an export button.

## How to hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` to the output directory and writes `dossier.json` there.

## Bounty

https://make.fun/bounty/gta6-cover-art-01
