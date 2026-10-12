// Mobil-Befunde prüfen: Hero 1./2. Bildschirm, Schalter-Band beim Scrollen, Garantie
import { chromium } from "playwright";
const out = "../review/bau-runde2/A/A-mobilfix";
(await import("node:fs")).mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const [w, h] of [[360, 740], [375, 667], [390, 844], [430, 932]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => localStorage.setItem("svh-einwilligung", "notwendig"));
  const p = await ctx.newPage();
  await p.goto("http://localhost:3200/", { waitUntil: "networkidle" });
  await p.waitForTimeout(4200);
  await p.screenshot({ path: `${out}/${w}-1-start.png` });
  const vis = await p.evaluate(() => document.querySelector(".hero-visual").getBoundingClientRect().top + scrollY);
  await p.evaluate((y) => scrollTo(0, y - 140), vis);
  await p.waitForTimeout(2600);
  await p.screenshot({ path: `${out}/${w}-2-maschine.png` });
  // Schalter: in Schritten runter bis in die dritte Karte (Leiste blendet aus), dann ein Stück hoch (Leiste blendet ein)
  const sw = await p.evaluate(() => document.getElementById("alltag").getBoundingClientRect().top + scrollY);
  for (let y = vis; y < sw + 900; y += 160) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(50); }
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/${w}-3-schalter-runter.png` });
  for (let k = 0; k < 3; k++) { await p.evaluate(() => scrollBy(0, -60)); await p.waitForTimeout(80); }
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/${w}-4-schalter-hoch.png` });
  const g = await p.evaluate(() => document.getElementById("garantie").getBoundingClientRect().top + scrollY);
  for (let y = sw + 900; y < g; y += 400) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(30); }
  await p.evaluate((v) => scrollTo(0, v), g);
  await p.waitForTimeout(2600);
  await p.screenshot({ path: `${out}/${w}-5-garantie.png` });
  await ctx.close();
}
// SE mit Einwilligung
const se = await b.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const q = await se.newPage();
await q.goto("http://localhost:3200/", { waitUntil: "networkidle" });
await q.waitForTimeout(3000);
console.log("Leiste SE Höhe:", await q.evaluate(() => Math.round(document.querySelector(".cons").getBoundingClientRect().height)));
await q.screenshot({ path: `${out}/375-einwilligung.png` });
await b.close();
