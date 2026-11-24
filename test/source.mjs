// The frontend sources the tests evaluate: src/<stem>/ assembled into one classic script as
// scripts/build-frontend.mjs does (scripts/bundle.mjs), so the tests need no build first.
import { bundle } from "../scripts/bundle.mjs";

export const cardSource = bundle("src/iptv-card/index.js");
export const panelSource = bundle("src/iptv-panel/index.js");
