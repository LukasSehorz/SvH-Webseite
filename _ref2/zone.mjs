/**
 * Misst die Geometrie der DNA-Zone im Dokument.
 *   node _ref2/zone.mjs [port] [w] [h]
 */
import { chromium } from 'playwright';
const PORT = process.argv[2] || '3100';
const W = Number(process.argv[3] || 1440);
const H = Number(process.argv[4] || 900);
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(3000);
const r = await page.evaluate(() => {
  const se = document.scrollingElement;
  const mk = document.getElementById('marketing');
  const cv = document.querySelector('canvas[aria-hidden="true"]');
  const sticky = cv ? cv.parentElement : null;
  const bg = sticky ? sticky.parentElement : null;
  const zone = bg ? bg.parentElement : null;
  const box = (el) => el ? { top: Math.round(el.getBoundingClientRect().top + se.scrollTop), h: Math.round(el.getBoundingClientRect().height) } : null;
  return {
    doc: se.scrollHeight, vp: window.innerHeight,
    marketing: box(mk), zone: box(zone), bg: box(bg), sticky: box(sticky),
    stickyCls: sticky && sticky.className, zoneCls: zone && zone.className,
    canvas: cv ? { w: cv.clientWidth, h: cv.clientHeight } : null,
  };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
