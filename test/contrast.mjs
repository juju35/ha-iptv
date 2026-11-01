// WCAG 2.x contrast of the state colours used for text, shared by the card and panel tests.
import assert from 'node:assert/strict';

const hex = (h) => [1, 3, 5].map((i) => Number.parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, p) => a.map((v, i) => v * p + b[i] * (1 - p));
const lum = (c) => {
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
// Home Assistant's default state colours and the light / dark card background and text colours
const STATE = ['#43a047', '#ffa600', '#db4437'];
const THEMES = { light: ['#ffffff', '#212121'], dark: ['#1c1c1c', '#e1e1e1'] };

export function checkTextContrast(css, name, tint) {
  const share = Number(css.match(new RegExp(`${name}: color-mix\\(in srgb, var\\(--[\\w-]+\\) (\\d+)%, var\\(--primary-text-color\\)\\)`))?.[1]);
  assert.ok(share > 0 && share < 100, `${name} mixes the state colour with the text colour`);
  for (const [theme, [bg, fg]] of Object.entries(THEMES)) {
    for (const state of STATE) {
      const text = mix(hex(state), hex(fg), share / 100);
      const back = mix(hex(state), hex(bg), tint);
      const ratio = contrast(text, back);
      assert.ok(ratio >= 4.5, `${state} text in ${theme}: ${ratio.toFixed(2)}:1`);
    }
  }
}
