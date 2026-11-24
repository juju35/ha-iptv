// Assembles the frontend's ES modules: every src/<stem>/index.js becomes custom_components/<domain>/frontend/<stem>.js,
// the classic script Home Assistant serves (scripts/bundle.mjs: modules concatenated in the order of the entry file,
// import lines removed, `export` keywords dropped, translation tables rebuilt as one literal). The assembled files are
// not committed: run this before the Python tests, the screenshots, scripts/split-frontend.mjs and the release zip.
// Usage: node scripts/build-frontend.mjs (needs acorn: npm install --no-save --no-package-lock acorn@8.19.0)
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "./bundle.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const [domain] = readdirSync(`${root}custom_components`);
const out = `custom_components/${domain}/frontend`;

for (const stem of readdirSync(`${root}src`).sort()) {
  if (!existsSync(`${root}src/${stem}/index.js`)) continue;
  const code = bundle(`src/${stem}/index.js`);
  writeFileSync(`${root}${out}/${stem}.js`, code);
  console.log(`src/${stem}/ → ${out}/${stem}.js (${(code.length / 1024).toFixed(1)} KB)`);
}
