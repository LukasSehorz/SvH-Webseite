/**
 * Bildzeiten am PRODUKTIONSBAU messen.
 *
 * Der Entwicklungsserver uebersetzt im Hintergrund neu und erzeugt dabei
 * Aussetzer von ueber einer Sekunde. Gemessen wurden auf ihm 135 von 1769
 * Bildern ueber 33 ms, mit Ausreiszern bis 1983 ms. Ob davon etwas an der
 * Seite selbst liegt, laeszt sich nur am gebauten Stand entscheiden.
 *
 * Das Skript baut nach .next-mess, startet den Auslieferungsserver auf
 * einem eigenen Port und zeichnet dort jedes Bild einzeln auf. Der laufende
 * Entwicklungsserver auf 3100 bleibt unberuehrt.
 *
 *   node _ref2/bau-ruckler.mjs [sekunden] [port]
 */
import { chromium } from 'playwright';
import { spawn, spawnSync } from 'node:child_process';

const SEK = Number(process.argv[2] || 45);
const PORT = process.argv[3] || '3210';

const umgebung = { ...process.env, NEXT_DIST_DIR: '.next-mess', PORT };

console.log('baue nach .next-mess ...');
const bau = spawnSync('npx', ['next', 'build'], {
  env: umgebung,
  shell: true,
  encoding: 'utf8',
});
if (bau.status !== 0) {
  console.error('Bau fehlgeschlagen:');
  console.error((bau.stdout || '').slice(-3000));
  console.error((bau.stderr || '').slice(-2000));
  process.exit(1);
}
const warnungen = (bau.stdout || '')
  .split('\n')
  .filter((z) => /warn/i.test(z))
  .slice(0, 8);
console.log(warnungen.length ? `Warnungen:\n${warnungen.join('\n')}` : 'Bau ohne Warnung');

console.log(`starte Auslieferung auf ${PORT} ...`);
const server = spawn('npx', ['next', 'start'], {
  env: umgebung,
  shell: true,
  stdio: 'ignore',
  detached: false,
});

const warte = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://localhost:${PORT}/`, { signal: AbortSignal.timeout(3000) });
      if (r.ok) return true;
    } catch {
      /* noch nicht da */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
};
if (!(await warte())) {
  console.error('Auslieferungsserver kam nicht hoch');
  server.kill();
  process.exit(1);
}

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const fehler = [];
page.on('console', (m) => {
  if (m.type() === 'error') fehler.push(m.text().slice(0, 160));
});
await page.goto(`http://localhost:${PORT}/`, {
  waitUntil: 'domcontentloaded',
  timeout: 120000,
});
await page.waitForTimeout(3000);

for (let i = 0; i < 6; i++) {
  const top = await page.evaluate(() => {
    const se = document.scrollingElement;
    return Math.round(
      document.getElementById('marketing').getBoundingClientRect().top + se.scrollTop,
    );
  });
  await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, top);
  await page.waitForTimeout(800);
  const ist = await page.evaluate(
    () => Math.round(document.getElementById('marketing').getBoundingClientRect().top),
  );
  if (Math.abs(ist) <= 6) break;
}

// Die ersten zwei Sekunden werden verworfen. Dort uebersetzt die
// Grafikkarte ihre Schattierer und legt die Puffer an; das gehoert zum
// Start und nicht zum laufenden Betrieb.
await page.evaluate((sek) => {
  window.__r = { t: [], start: performance.now() };
  let last = performance.now();
  const tick = (now) => {
    window.__r.t.push([now - window.__r.start, now - last]);
    last = now;
    if (now - window.__r.start < sek * 1000) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}, SEK);
await page.waitForTimeout(SEK * 1000 + 2500);

const erg = await page.evaluate(() => {
  const t = window.__r.t.filter((x) => x[0] > 2000);
  const d = t.map((x) => x[1]).sort((a, b) => a - b);
  const p = (q) => d[Math.min(d.length - 1, Math.floor(q * d.length))];
  return {
    n: t.length,
    p50: +p(0.5).toFixed(1),
    p95: +p(0.95).toFixed(1),
    p99: +p(0.99).toFixed(1),
    max: +d[d.length - 1].toFixed(1),
    ueber33: t.filter((x) => x[1] > 33).length,
    ueber100: t.filter((x) => x[1] > 100).map((x) => [Math.round(x[0]), Math.round(x[1])]),
  };
});

console.log('');
console.log(`Bilder ${erg.n} (erste 2 s verworfen)`);
console.log(`p50 ${erg.p50}  p95 ${erg.p95}  p99 ${erg.p99}  max ${erg.max}`);
console.log(`ueber 33 ms: ${erg.ueber33} (${((erg.ueber33 / erg.n) * 100).toFixed(1)} %)`);
console.log(`ueber 100 ms: ${erg.ueber100.length}`, JSON.stringify(erg.ueber100).slice(0, 400));
console.log(`Konsolenfehler: ${fehler.length}`, fehler.slice(0, 3).join(' | '));

await browser.close();
server.kill();
process.exit(0);
