// Genera public/email/header.png (titular + tira Bauhaus de la landing) con Chrome headless.
// Uso: node scripts/build-email-assets.mjs   (necesita google-chrome y conexión para bajar Inter Tight)
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ink = "oklch(0.2 0.02 130)", deep = "oklch(0.5 0.14 133)", lime = "#639922";
const mist = "oklch(0.88 0.06 128)", paper = "oklch(0.97 0.02 125)";

// Mismos tiles que ShapeStrip en src/components/bauhaus.tsx
const tiles = [
  [ink, `<circle cx="50" cy="50" r="34" fill="${lime}"/>`],
  [lime, `<path d="M10 90a40 40 0 0 1 80 0z M10 10h40v40z" fill="${ink}"/>`],
  [mist, `<path d="M50 12l40 76H10z" fill="${deep}"/>`],
  [deep, `<rect x="14" y="14" width="72" height="72" fill="none" stroke="${paper}" stroke-width="8"/><circle cx="50" cy="50" r="14" fill="${lime}"/>`],
  [paper, `<path d="M0 100V0a100 100 0 0 1 100 100z" fill="${deep}"/><circle cx="68" cy="68" r="12" fill="${paper}"/>`],
  [ink, [0, 1, 2, 3].map((i) => `<rect x="${14 + i * 20}" y="14" width="12" height="72" fill="${i % 2 ? paper : lime}"/>`).join("")],
  [lime, `<circle cx="50" cy="50" r="38" fill="${paper}"/><path d="M12 50a38 38 0 0 1 76 0z" fill="${ink}"/>`],
  [deep, `<path d="M50 8l42 42-42 42-42-42z" fill="${mist}"/>`],
];
const strip = Array.from({ length: 20 }, (_, i) => tiles[(i * 3) % tiles.length])
  .map(([bg, s]) => `<svg viewBox="0 0 100 100" width="30" height="30" style="display:block;background:${bg}">${s}</svg>`)
  .join("");

const html = `<!DOCTYPE html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@800&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;background:${deep}}
  .hero{position:relative;width:600px;height:250px;box-sizing:border-box;padding:26px 36px;background:${deep};overflow:hidden;color:#fff}
  .top{display:flex;justify-content:space-between;align-items:center;font-family:'IBM Plex Mono',monospace;font-weight:500;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.85)}
  .word{font-family:'Inter Tight',sans-serif;font-weight:800;font-size:24px;letter-spacing:-.03em;text-transform:lowercase;color:#fff}
  h1{margin:30px 0 0;font-family:'Inter Tight',sans-serif;font-weight:800;font-size:42px;line-height:.98;letter-spacing:-.045em;text-transform:uppercase;position:relative;z-index:2}
  h1 span{color:${mist}}
  .s{position:absolute;z-index:1}
  .dots{inset:0;background-image:radial-gradient(rgba(255,255,255,.2) 1px,transparent 1.3px);background-size:24px 24px}
  .strip{display:flex;width:600px;height:30px}
</style>
<div class="hero">
  <div class="s dots"></div>
  <!-- Fondo de la sección verde de la landing (Geo "green") -->
  <div class="s" style="right:-90px;top:-100px;width:330px;height:330px;border-radius:50%;border:1px solid rgba(255,255,255,.25)"></div>
  <div class="s" style="right:-40px;top:-50px;width:230px;height:230px;border-radius:50%;border:1px solid rgba(255,255,255,.25)"></div>
  <div class="s" style="right:0;top:0;width:135px;height:135px;border-radius:50%;background:rgba(255,255,255,.1)"></div>
  <div class="s" style="left:48%;bottom:-24px;width:70px;height:70px;border:1px solid rgba(255,255,255,.3);transform:rotate(22deg)"></div>
  <!-- Composición Bauhaus "statement" (paleta onDeep) -->
  <svg class="s" style="right:14px;bottom:12px" width="215" height="215" viewBox="0 0 400 400"><path d="M40 220a160 160 0 0 1 320 0z" fill="${lime}"/><circle cx="270" cy="120" r="56" fill="${paper}"/><path d="M60 220h200l-100 150z" fill="${ink}"/><rect x="260" y="250" width="100" height="100" fill="none" stroke="${paper}" stroke-width="6"/><circle cx="310" cy="300" r="22" fill="${paper}"/><path d="M40 390h320" stroke="${paper}" stroke-width="6" stroke-dasharray="2 12" stroke-linecap="round"/></svg>
  <div class="top"><span class="word">tacuara</span><span>Misiones, Argentina</span></div>
  <h1>Un solo equipo.<br>Tu proyecto,<br><span>bien sostenido.</span></h1>
</div>
<div class="strip">${strip}</div>`;

const dir = mkdtempSync(join(tmpdir(), "tacuara-email-"));
const file = join(dir, "header.html");
writeFileSync(file, html);
execFileSync("google-chrome", [
  "--headless", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  "--force-device-scale-factor=2", "--window-size=600,280", "--virtual-time-budget=8000",
  `--screenshot=${new URL("../public/email/header.png", import.meta.url).pathname}`, `file://${file}`,
], { stdio: "inherit" });
