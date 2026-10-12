// Leiste Desktop: Ausrichtung je Breite oben, kompakte Pille beim Runterscrollen
import { chromium } from "playwright";
const out = "../review/bau-runde2/A/nav";
(await import("node:fs")).mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const w of [834, 1024, 1100, 1180, 1280, 1440]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: w < 900, hasTouch: w < 900 });
  await ctx.addInitScript(() => localStorage.setItem("svh-einwilligung", "notwendig"));
  const p = await ctx.newPage();
  await p.goto("http://localhost:3200/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${out}/${w}-oben.png`, clip: { x: 0, y: 0, width: w, height: 100 } });
  const m1 = await p.evaluate(() => { const bar = document.querySelector(".nav-bar").getBoundingClientRect(); const end = document.querySelector(".nav-end").getBoundingClientRect(); const links = [...document.querySelectorAll(".nav-links .nav-link")].map((l) => l.getBoundingClientRect().height); return { barRight: Math.round(bar.right), endRight: Math.round(end.right), linkH: Math.max(0, ...links) }; });
  for (let k = 0; k < 8; k++) { await p.mouse.wheel(0, 200); await p.waitForTimeout(60); }
  await p.waitForTimeout(1000);
  await p.screenshot({ path: `${out}/${w}-runter.png`, clip: { x: 0, y: 0, width: w, height: 100 } });
  const m2 = await p.evaluate(() => { const n = document.querySelector(".nav"); const cta = document.querySelector(".nav-end .btn").getBoundingClientRect(); return { compact: n.dataset.compact, hidden: n.dataset.hidden, ctaVisible: cta.width > 0 && Number(getComputedStyle(n).opacity) > 0.9 }; });
  console.log(w, JSON.stringify(m1), JSON.stringify(m2));
  await ctx.close();
}
await b.close();
