// Checks the palette against WCAG 2.1 AA, reading the real tokens from
// src/app/globals.css (so it can't drift from what ships).
//
//   npm run contrast        exits 1 if any text pair is below 4.5:1
//
// Non-text pairs (focus ring, icon dots) are held to 3:1.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const css = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/app/globals.css"),
  "utf8"
);

const tokens = (block) => Object.fromEntries([...block.matchAll(/--x-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));
const lightBlock = css.slice(css.indexOf(":root {"), css.indexOf(':root[data-theme="dark"]'));
const darkBlock = css.slice(css.indexOf(':root[data-theme="dark"]'), css.indexOf("/* Respect system preference"));
const light = tokens(lightBlock);
const dark = { ...light, ...tokens(darkBlock) }; // dark overrides only what it redefines

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
// `fg` drawn at `alpha` over `bg` (badges use accent/15 tints).
const over = (fg, bg, alpha) =>
  "#" + [1, 3, 5].map((i) => Math.round(parseInt(fg.slice(i, i + 2), 16) * alpha + parseInt(bg.slice(i, i + 2), 16) * (1 - alpha)).toString(16).padStart(2, "0")).join("");

const textPairs = (t) => [
  ["text-900 on background", t["text-900"], t.background],
  ["text-700 on surface", t["text-700"], t.surface],
  ["text-500 on background", t["text-500"], t.background],
  ["text-500 on surface-2", t["text-500"], t["surface-2"]],
  ["primary button", t["text-on-primary"], t.primary],
  ["primary button (hover)", t["text-on-primary"], t["primary-hover"]],
  ["blue text on surface", t["blue-600"], t.surface],
  ["blue text on blue-100", t["blue-600"], t["blue-100"]],
  ["text-900 on blue-100", t["text-900"], t["blue-100"]],
  ["navy button text (white on navy)", "#ffffff", t["navy-900"]],
  ["navy on yellow", t["navy-900"], t["yellow-400"]],
  ...["mint-500", "red-500", "orange-500", "cyan-500"].flatMap((k) => [
    [`${k} on surface`, t[k], t.surface],
    [`${k} on its 15% tint`, t[k], over(t[k], t.surface, 0.15)],
  ]),
];
const nonText = (t) => [
  ["primary button vs surface (shape)", t.primary, t.surface],
  ["focus ring (blue-600) vs background", t["blue-600"], t.background],
  ["border vs background", t.border, t.background, 1.0], // decorative: informational only
];

let failed = 0;
for (const [name, t] of [["light", light], ["dark", dark]]) {
  console.log(`\n${name}`);
  for (const [label, fg, bg] of textPairs(t)) {
    const r = ratio(fg, bg);
    const ok = r >= 4.5;
    if (!ok) failed++;
    console.log(`  ${ok ? "ok  " : "FAIL"} ${r.toFixed(2).padStart(5)}  ${label}`);
  }
  for (const [label, fg, bg, min = 3] of nonText(t)) {
    const r = ratio(fg, bg);
    const ok = r >= min;
    if (!ok && min >= 3) failed++;
    console.log(`  ${ok ? "ok  " : min >= 3 ? "FAIL" : "info"} ${r.toFixed(2).padStart(5)}  ${label} (non-text)`);
  }
}
console.log(failed ? `\n${failed} pair(s) below AA` : "\nAll pairs pass AA");
process.exit(failed ? 1 : 0);
