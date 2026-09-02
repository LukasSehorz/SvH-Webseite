// Kleine Messreihe: setzt Rasterweite und Punktgroesse, laedt neu, misst.
import { chromium } from 'playwright';
import fs from 'fs';
import { execSync } from 'child_process';

const FILE = 'app/components/marketing/DnaBand.tsx';
const combos = JSON.parse(process.argv[2]);

const browser = await chromium.launch({ headless: false });
for (const [nu, ns, ps] of combos) {
  let s = fs.readFileSync(FILE, 'utf8');
  s = s.replace(/const N_U = \d+;/, `const N_U = ${nu};`);
  s = s.replace(/const N_S = \d+;/, `const N_S = ${ns};`);
  s = s.replace(/uPointSize\.value = [\d.]+ \* dpr;/, `uPointSize.value = ${ps} * dpr;`);
  fs.writeFileSync(FILE, s, 'utf8');

  const p = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  await p.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded', timeout: 180000 });
  await p.waitForTimeout(9000);
  const top = await p.evaluate(() => {
    const el = document.getElementById('marketing');
    return el.getBoundingClientRect().top + document.scrollingElement.scrollTop;
  });
  await p.evaluate(v => { document.scrollingElement.scrollTop = v; }, top + 700);
  await p.waitForTimeout(3000);
  const out = `_ref2/shots/sweep/${nu}-${ns}-${ps}.png`;
  fs.mkdirSync('_ref2/shots/sweep', { recursive: true });
  await p.screenshot({ path: out });
  await p.close();
  const res = execSync(`node _ref2/metric2.mjs "${out}"`, { encoding: 'utf8' }).trim();
  console.log(`N_U=${nu} N_S=${ns} PS=${ps}  ${res.split(/\s+/).slice(1).join(' ')}`);
}
await browser.close();
