// Meine Abschnitte bei Zwischenbreiten: Start, Schalter, Ergebnisse, Garantie
import { chromium } from "playwright";
const out = "../review/bau-runde2/A/A-breiten";
(await import("node:fs")).mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const [w, h, mob] of [[834, 1112, 1], [1000, 800, 0], [1280, 800, 0], [1920, 1080, 0], [2560, 1440, 0]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob, deviceScaleFactor: mob ? 2 : 1 });
  await ctx.addInitScript(() => localStorage.setItem("svh-einwilligung", "notwendig"));
  const p = await ctx.newPage();
  await p.goto("http://localhost:3200/", { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `${out}/${w}-start.png` });
  for (const id of ["alltag", "ergebnisse", "garantie"]) {
    const top = await p.evaluate((i) => document.getElementById(i).getBoundingClientRect().top + scrollY, id);
    for (let y = await p.evaluate(() => scrollY); y < top; y += 400) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(30); }
    await p.evaluate((v) => scrollTo(0, v), top + 40);
    await p.waitForTimeout(1800);
    await p.screenshot({ path: `${out}/${w}-${id}.png` });
  }
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(w, "Überlauf px:", ov);
  await ctx.close();
}
await b.close();
