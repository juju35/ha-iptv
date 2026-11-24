// Entry point: the modules in their original order. scripts/build-frontend.mjs (scripts/bundle.mjs) concatenates them
// in this order into the single classic script the integration serves.
import "./version.js";
import "./i18n/iptvpaneli18n.js";
import "./core.js";
import "./fold-css.js";
import "./fold.js";
import "./panel.js";
