// Serbian checks shared by the card and panel tests: the Latin table is the Cyrillic one letter for letter,
// and neither script leaks into the other (names, brands, units and placeholders aside).
import assert from 'node:assert/strict';

// Serbian Cyrillic letter by letter, then its Latin spelling (љ, њ and џ take two letters)
const SERBIAN = 'аaбbвvгgдdђđеeжžзzиiјjкkлlљljмmнnњnjоoпpрrсsтtћćуuфfхhцcчčџdžшš';
const TO_LATIN = new Map([...SERBIAN.matchAll(/([а-џ])([^а-џ]+)/g)].map((m) => [m[1], m[2]]));
for (const [c, lat] of [...TO_LATIN]) TO_LATIN.set(c.toUpperCase(), lat[0].toUpperCase() + lat.slice(1));

export const toLatin = (text) => [...text].map((c) => TO_LATIN.get(c) ?? c).join('');

// Latin words allowed in Cyrillic text: brands, acronyms and the provider types
const NAMES = /\b(IPTV|URL|MAC|FR|VOD|M3U|EPG|XMLTV|Xtream|Codes|Stalker|Ministra|Home Assistant)\b/g;

export function checkSerbianTables(tables) {
  const cyrillic = tables.sr;
  const latin = tables['sr-Latn'];
  assert.deepEqual(Object.keys(latin), Object.keys(cyrillic));
  for (const [key, text] of Object.entries(cyrillic)) {
    assert.equal(toLatin(text), latin[key], `sr-Latn.${key} is not sr.${key} in Latin script`);
    assert.doesNotMatch(text.replace(NAMES, '').replace(/\{\w+\}/g, ''), /[A-Za-z]/, `Latin letters in sr.${key}`);
    assert.doesNotMatch(latin[key], /[\u0400-\u04FF]/, `Cyrillic letters in sr-Latn.${key}`);
  }
}
