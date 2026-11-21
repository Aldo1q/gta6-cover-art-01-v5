// Neon Coast Cover Studio — the entry program (Node 22, standard library only).
//
// The app itself is plain static files under app/ (app/index.html plus its ES
// modules, styles and fonts; it loads nothing over the network), and the
// screenshots are in screenshots/. This program hands both in: it copies them
// into the output directory and writes /output/dossier.json with the vendored
// make.fun library, exactly as the bounty requires.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the app locally with `node serve.ts` (http://localhost:8080).

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

// Say what landed, so a failed copy or an empty screenshots/ folder is
// noticed at once instead of at grading time.
const shots = existsSync(join(out, 'screenshots'))
  ? readdirSync(join(out, 'screenshots')).filter((f) => !f.startsWith('.'))
  : [];
if (!existsSync(join(out, 'app', 'index.html'))) throw new Error('output is missing app/index.html');
if (shots.length < 3) throw new Error(`output holds ${shots.length} screenshots, expected 3 or 4`);
console.log(`Neon Coast Cover Studio handed in to ${out}: app/ + ${shots.length} screenshots + dossier.json`);
