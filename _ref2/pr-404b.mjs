import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const roh = [];
page.on('response', (r) => roh.push(`${r.status()} ${r.request().resourceType()} ${r.url()}`));
page.on('console', (m) => { if (m.type() === 'error') roh.push('KONSOLE ' + m.text().slice(0,200) + ' @ ' + JSON.stringify(m.location())); });
await page.goto('http://localhost:3100/', { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(3000);
const h = await page.evaluate(() => document.scrollingElement.scrollHeight);
for (let y = 0; y <= h; y += 400) {
  await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, y);
  await page.waitForTimeout(220);
}
await page.waitForTimeout(4000);
const schlecht = roh.filter((z) => z.startsWith('KONSOLE') || (!z.startsWith('200') && !z.startsWith('204') && !z.startsWith('304')));
console.log(schlecht.length ? [...new Set(schlecht)].join('\n') : 'alle Anfragen in Ordnung');
await browser.close();
