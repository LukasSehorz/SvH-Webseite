#!/usr/bin/env node
// Holt die Medien aus ../assets und ../assets-ki (nur lesen!) nach public/
// und schreibt app/generated/media.ts mit dem, was tatsächlich da ist.
// Aufruf: npm run assets   (erneut ausführen, sobald neue KI-Medien da sind)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SITE = path.resolve(import.meta.dirname, "..");
const ROOT = path.resolve(SITE, "..");
const A = path.join(ROOT, "assets");
const K = path.join(ROOT, "assets-ki");
const PUB = path.join(SITE, "public");

const exists = (p) => fs.existsSync(p);
const mk = (p) => fs.mkdirSync(p, { recursive: true });
const log = (...a) => console.log("·", ...a);

function copy(src, dst) {
  mk(path.dirname(dst));
  fs.copyFileSync(src, dst);
}

async function webp(src, dst, width, quality = 78, extract) {
  mk(path.dirname(dst));
  let img = sharp(src);
  if (extract) img = img.extract(extract);
  const info = await img.resize({ width, withoutEnlargement: true, kernel: "lanczos3" }).webp({ quality, effort: 6 }).toFile(dst);
  return info;
}


// ---------- Logo ----------
mk(path.join(PUB, "logo"));
for (const f of ["svh-wort-96.webp", "svh-bild-160.webp"]) {
  copy(path.join(A, "logo", f), path.join(PUB, "logo", f));
}
copy(path.join(A, "logo", "icon.png"), path.join(SITE, "app", "icon.png"));
// Monogramm groß (Siegel, nie hochskaliert: 3x der größten Anzeige)
await sharp(path.join(A, "logo", "svh-bild.png")).resize({ width: 480 }).webp({ quality: 90 }).toFile(path.join(PUB, "logo", "svh-bild-480.webp"));
// Favicons in kleinen Größen (32/48 px) aus dem App-Icon
await sharp(path.join(A, "logo", "icon.png")).resize(32, 32).png().toFile(path.join(SITE, "app", "icon1.png"));
await sharp(path.join(A, "logo", "icon.png")).resize(48, 48).png().toFile(path.join(SITE, "app", "icon2.png"));
copy(path.join(A, "logo", "apple-icon.png"), path.join(SITE, "app", "apple-icon.png"));
// Nur das Wort CONSULTING aus der Wortmarke (für die große Marke am Fuß)
{
  const src = path.join(A, "logo", "svh-wort.png");
  const meta = await sharp(src).metadata();
  const left = Math.round(meta.width * 0.355);
  const top = Math.round(meta.height * 0.36);
  const height = Math.round(meta.height * 0.36);
  const cut = await sharp(src).extract({ left, top, width: meta.width - left, height }).png().toBuffer();
  const trimmed = await sharp(cut).trim({ threshold: 1 }).png().toBuffer();
  await sharp(trimmed)
    .resize({ width: 2400 })
    .webp({ quality: 90 })
    .toFile(path.join(PUB, "logo", "consulting-2400.webp"));
  log("Logo + CONSULTING-Schnitt");
}

// ---------- Aktuelles ----------
mk(path.join(PUB, "aktuelles"));
for (const f of fs.readdirSync(path.join(A, "aktuelles")).filter((f) => f.endsWith(".webp"))) {
  copy(path.join(A, "aktuelles", f), path.join(PUB, "aktuelles", f));
}
log("Aktuelles-Vorschaubilder");

// ---------- Referenzen ----------
for (const n of ["estera", "fuchs"]) {
  const src = path.join(A, "referenzen", `${n}-hero-2x.png`);
  if (!exists(src)) continue;
  await webp(src, path.join(PUB, "referenzen", `${n}-1600.webp`), 1600, 80);
  log(`Referenz ${n}`);
}

// Bier-Motiv: laut Auftraggeber nicht auf der Landingpage (nur LinkedIn)

// Flutlicht-Bilder: derzeit nirgends verwendet, deshalb nicht mehr kopiert

// Bildfolge „Vom Chaos zur Ruhe“: entfällt, die Szene ist jetzt DOM/SVG (Agent F)

// ---------- Herkunft ----------
fs.writeFileSync(
  path.join(PUB, "HERKUNFT.md"),
  `# Herkunft der Medien in public/

Erzeugt von \`scripts/assets.mjs\` am ${new Date().toISOString().slice(0, 10)}. Nur Kopien bzw. verkleinerte Fassungen, die Originale liegen im Projektordner.

- \`logo/\` aus \`assets/logo/\` (vom Auftraggeber geliefert, siehe dortige HERKUNFT.md). \`consulting-2400.webp\` ist ein Ausschnitt der Wortmarke, \`svh-bild-480.webp\` das Monogramm in hoher Auflösung (Siegel).
- \`aktuelles/\` aus \`assets/aktuelles/\` (Vorschaubilder des eigenen YouTube-Kanals, lokal ausgeliefert, damit ohne Einwilligung nichts an Google geht).
- \`referenzen/\` aus \`assets/referenzen/\` (Screenshots der Kundenseiten estera.immobilien und fuchspools.com), auf 1600 px WebP verkleinert.
- \`og.png\` Vorschaubild für geteilte Links (Agent E).
`,
);
