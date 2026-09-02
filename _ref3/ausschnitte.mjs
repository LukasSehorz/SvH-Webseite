// Ausschnitte einer gewaehlten Referenz. Ruhebilder je Sektion, dazu fuer
// ausgewaehlte Sektionen zwei Bewegungsphasen aus einem frischen Aufruf.
import { starten } from '../_ref2/browser.mjs';
import fs from 'node:fs';
import path from 'node:path';

const KONFIG = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const ZIEL = KONFIG.ziel;
fs.mkdirSync(ZIEL, { recursive: true });

const { browser, aufraeumen } = await starten();

const kontext = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
});

async function bannerWeg(seite) {
  const knoepfe = [
    'button:has-text("Accept")',
    'button:has-text("Akzeptieren")',
    'button:has-text("Allow all")',
    'button:has-text("Got it")',
  ];
  for (const wahl of knoepfe) {
    try {
      const el = seite.locator(wahl).first();
      if (await el.isVisible({ timeout: 600 })) {
        await el.click({ timeout: 1500 });
        await seite.waitForTimeout(700);
        return;
      }
    } catch {
      // Kein Banner.
    }
  }
}

async function vorbereiten(seite) {
  await seite.goto(KONFIG.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  try {
    await seite.waitForLoadState('networkidle', { timeout: 20000 });
  } catch {
    // Dauerverbindungen sind kein Fehler.
  }
  await seite.waitForTimeout(5000);
  await bannerWeg(seite);
}

// Erster Durchgang: alles einmal aufwecken, dann jede Sektion in Ruhe.
const seite = await kontext.newPage();
await vorbereiten(seite);
await seite.evaluate(async () => {
  const schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
  let y = 0;
  for (let i = 0; i < 80; i++) {
    y += window.innerHeight * 0.5;
    window.scrollTo(0, y);
    await schlaf(200);
    if (y > document.body.scrollHeight) break;
  }
});
await seite.waitForTimeout(2000);

for (const a of KONFIG.ausschnitte) {
  await seite.evaluate((y) => window.scrollTo(0, y), a.y);
  await seite.waitForTimeout(2200);
  await seite.screenshot({ path: path.join(ZIEL, `${a.name}-ruhe.png`) });
  console.log(`ruhe   ${a.name}`);
}

// Schwebezustand, wo einer angegeben ist.
for (const h of KONFIG.hover ?? []) {
  try {
    await seite.evaluate((y) => window.scrollTo(0, y), h.y);
    await seite.waitForTimeout(1500);
    await seite.locator(h.wahl).first().hover({ timeout: 4000 });
    await seite.waitForTimeout(900);
    await seite.screenshot({ path: path.join(ZIEL, `${h.name}-hover.png`) });
    console.log(`hover  ${h.name}`);
  } catch (fehler) {
    console.log(`hover FEHLER ${h.name} ${String(fehler).slice(0, 120)}`);
  }
}
await seite.close();

// Zweiter Durchgang: Bewegungsphasen. Je Sektion ein frischer Aufruf, damit
// die Eintrittsanimation noch nicht gelaufen ist.
for (const b of KONFIG.bewegung ?? []) {
  const p = await kontext.newPage();
  try {
    await vorbereiten(p);
    // Bis kurz vor die Sektion springen, ohne sie zu betreten.
    await p.evaluate((y) => window.scrollTo(0, y), Math.max(0, b.y - 850));
    await p.waitForTimeout(2500);
    await p.evaluate((y) => window.scrollTo(0, y), b.y);
    await p.waitForTimeout(b.phase1 ?? 160);
    await p.screenshot({ path: path.join(ZIEL, `${b.name}-phase1.png`) });
    await p.waitForTimeout(b.phase2 ?? 700);
    await p.screenshot({ path: path.join(ZIEL, `${b.name}-phase2.png`) });
    console.log(`phasen ${b.name}`);
  } catch (fehler) {
    console.log(`phasen FEHLER ${b.name} ${String(fehler).slice(0, 120)}`);
  }
  await p.close();
}

await aufraeumen();
