// OG-Bild erzeugen (1200 × 630) → public/og.png
// Aufruf in site/: node scripts/og.mjs   (Dev-Server muss auf Port 3200 laufen)
//
// Slogan wie im Start: „Wir stellen die KI auf, / du *gewinnst* die Zeit.“ (Schreibschrift-Wort „gewinnst“).
// Wortmarke: /logo/svh-wort-96.webp (737 × 96 px, bei 262 px Anzeige und 2-facher Aufnahme scharf).
//
// Die Schriften (Inter Tight, Inter, Mr Dafoe) kommen aus der laufenden Seite:
// Das Skript liest die @font-face-Regeln, die next/font ausliefert, und setzt
// sie in eine kleine HTML-Vorlage. Aufgenommen wird doppelt so groß (2400 × 1260)
// und danach mit sharp verkleinert, damit Kanten und Schrift gestochen scharf sind.
import { chromium } from "playwright";
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ORIGIN = process.env.OG_ORIGIN || "http://localhost:3200";
const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, "..", "public", "og.png");

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });

// 1) Schriften der Seite einsammeln
const src = await ctx.newPage();
await src.goto(`${ORIGIN}/impressum`, { waitUntil: "networkidle" });
const fonts = await src.evaluate(() => {
  const rules = [];
  for (const sheet of document.styleSheets) {
    let list;
    try {
      list = sheet.cssRules;
    } catch {
      continue;
    }
    for (const r of list) {
      if (r.constructor.name !== "CSSFontFaceRule") continue;
      // relative Pfade gegen die Stylesheet-Adresse auflösen
      const base = sheet.href || location.href;
      rules.push(r.cssText.replace(/url\(["']?([^"')]+)["']?\)/g, (_, u) => `url("${new URL(u, base).href}")`));
    }
  }
  const cs = getComputedStyle(document.documentElement);
  return {
    css: rules.join("\n"),
    display: cs.getPropertyValue("--font-inter-tight").trim(),
    sans: cs.getPropertyValue("--font-inter").trim(),
    script: cs.getPropertyValue("--font-script-face").trim(),
  };
});
await src.close();
if (!fonts.display || !fonts.script) throw new Error("Schriften der Seite nicht gefunden (läuft der Dev-Server?)");

// 2) Vorlage
const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><style>
${fonts.css}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1200px;height:630px;background:#050507;overflow:hidden}
body{position:relative;font-family:${fonts.sans};color:#f4f4f6;-webkit-font-smoothing:antialiased}
.veil{position:absolute;right:-260px;top:-300px;width:1100px;height:900px;border-radius:50%;
  background:radial-gradient(closest-side,rgba(124,106,255,.20),rgba(91,140,255,.06) 55%,transparent 100%)}
.veil2{position:absolute;left:-320px;bottom:-420px;width:900px;height:700px;border-radius:50%;
  background:radial-gradient(closest-side,rgba(185,165,255,.08),transparent 100%)}
.dots{position:absolute;inset:0;background-image:radial-gradient(circle at center,rgba(185,165,255,.42) .8px,transparent 1.2px);
  background-size:22px 22px;-webkit-mask-image:radial-gradient(ellipse 42% 62% at 89% 50%,#000 0%,transparent 72%);opacity:.45}
svg.pitch{position:absolute;left:0;top:0;width:1200px;height:630px}
.pitch .l{fill:none;stroke-width:1.1;vector-effect:non-scaling-stroke}
.mark{position:absolute;left:84px;top:70px;width:262px;height:auto}
.eyebrow{position:absolute;left:84px;top:212px;display:flex;align-items:center;gap:14px;
  font-size:15px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#b9a5ff}
.eyebrow::before{content:"";width:26px;height:1px;background:linear-gradient(92deg,#5b8cff,#7c6aff 48%,#b9a5ff)}
h1{position:absolute;left:80px;top:252px;font-family:${fonts.display};font-weight:600;font-size:80px;
  line-height:1.04;letter-spacing:-.04em;white-space:nowrap}
h1 span.line{display:block}
.script{position:relative;display:inline-block;line-height:.8}
.script-text{display:inline-block;font-family:${fonts.script};font-weight:400;font-size:1.34em;letter-spacing:0;line-height:.8;
  padding:.06em .16em .14em .24em;margin:-.06em -.08em -.14em -.18em;
  background:linear-gradient(96deg,#6d95ff 0%,#8a77ff 45%,#c4b3ff 100%);-webkit-background-clip:text;background-clip:text;
  color:transparent;-webkit-text-fill-color:transparent}
.swoosh{position:absolute;left:2%;bottom:-.2em;width:102%;height:.34em;overflow:visible}
.swoosh path{fill:none;stroke-linecap:round}
.foot{position:absolute;left:84px;right:84px;bottom:58px;display:flex;justify-content:space-between;align-items:center;
  font-size:17px;color:rgba(244,244,246,.56);letter-spacing:.01em}
.foot b{font-weight:500;color:rgba(244,244,246,.8)}
.rule{position:absolute;left:84px;right:84px;bottom:100px;height:1px;background:rgba(244,244,246,.08)}
</style></head><body>
<div class="veil"></div><div class="veil2"></div><div class="dots"></div>
<svg class="pitch" viewBox="0 0 1200 630" aria-hidden="true">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#5b8cff"/><stop offset=".55" stop-color="#7c6aff"/><stop offset="1" stop-color="#9d8cff"/>
    </linearGradient>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#6b78ff" stop-opacity="0"/><stop offset=".25" stop-color="#6b78ff" stop-opacity=".55"/>
      <stop offset=".6" stop-color="#8a7bff" stop-opacity=".5"/><stop offset=".8" stop-color="#8a7bff" stop-opacity="0"/>
    </linearGradient>
    <filter id="glow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <linearGradient id="sw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7c6aff"/><stop offset="1" stop-color="#b9a5ff"/></linearGradient>
  </defs>
  <g filter="url(#glow)" opacity=".55">
    <circle class="l" cx="1072" cy="298" r="200" stroke="url(#g)"/>
    <path class="l" d="M1072 0 V 630" stroke="url(#v)"/>
  </g>
  <circle cx="1072" cy="298" r="3.6" fill="#b9a5ff"/>
</svg>
<img class="mark" src="${ORIGIN}/logo/svh-wort-96.webp" alt="">
<p class="eyebrow">KI-Automatisierung für den Mittelstand</p>
<h1><span class="line">Wir stellen die KI auf,</span><span class="line">du <span class="script"><span class="script-text">gewinnst</span>
<svg class="swoosh" viewBox="0 0 300 40" preserveAspectRatio="none"><path d="M6 30 C 70 21, 150 15, 226 16 C 262 16.5, 284 20, 296 9" stroke="url(#sw)" stroke-width="3.4"/>
<path d="M34 37 C 104 30, 176 27, 250 30" stroke="url(#sw)" stroke-width="1.5" opacity=".7"/></svg></span> die Zeit.</span></h1>
<div class="rule"></div>
<div class="foot"><span><b>SvH Consulting</b> · Kostenloser KI-Workshop</span><span>svh-consult.de</span></div>
</body></html>`;

// 3) Aufnahme auf derselben Adresse (Schriften laden ohne CORS-Probleme)
const p = await ctx.newPage();
await p.goto(`${ORIGIN}/robots.txt`);
await p.setContent(html, { waitUntil: "networkidle" });
await p.evaluate(async (f) => {
  await Promise.all([document.fonts.load(`600 80px ${f.display}`), document.fonts.load(`400 110px ${f.script}`), document.fonts.load(`500 17px ${f.sans}`)]);
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => (i.onload = i.onerror = r)))));
}, fonts);
// fehlende Wortmarke (z. B. umbenannte Datei) nicht stillschweigend weglassen
const broken = await p.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.src));
if (broken.length) throw new Error(`Bild nicht geladen: ${broken.join(", ")}`);
await p.waitForTimeout(300);
const buf = await p.screenshot({ type: "png" });
await b.close();

await sharp(buf).resize(1200, 630, { kernel: "lanczos3" }).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(OUT);
const meta = await sharp(OUT).metadata();
console.log(`og.png geschrieben: ${meta.width} × ${meta.height} → ${OUT}`);
