/**
 * Die Schranke der Linienbreite in WebGL, an der echten Seite gemessen.
 *
 * Der Auftrag verlangt, den Weg ueber THREE.Line oder THREE.LineSegments
 * zu pruefen und die Wahl mit einer Messung zu begruenden. Die eine harte
 * Zahl dafuer ist ALIASED_LINE_WIDTH_RANGE des Treibers. Steht dort eins
 * bis eins, so wird linewidth stillschweigend ignoriert und jeder Faden
 * ist genau einen Bildpunkt breit, ohne jeden Hof.
 *
 *   node _ref2/linienbreite.mjs [port]
 */
import { chromium } from 'playwright';

const PORT = process.argv[2] || '3100';
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(2500);
const info = await page.evaluate(() => {
  const cv = document.createElement('canvas');
  const gl = cv.getContext('webgl2') || cv.getContext('webgl');
  if (!gl) return { fehler: 'kein webgl' };
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  return {
    linie: Array.from(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)),
    punkt: Array.from(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)),
    karte: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'unbekannt',
  };
});
console.log(JSON.stringify(info));
await browser.close();
