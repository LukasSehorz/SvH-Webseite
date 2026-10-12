// Erster Bildschirm mit Einwilligung, reduzierte Bewegung, ohne JavaScript
import { chromium } from "playwright";
const out = "../review/bau-runde2/A/A-checks";
(await import("node:fs")).mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const shot = async (name, opts, fn) => {
  const ctx = await b.newContext(opts);
  const p = await ctx.newPage();
  await p.goto("http://localhost:3200/", { waitUntil: "networkidle" });
  await p.waitForTimeout(2800);
  if (fn) await fn(p);
  await p.screenshot({ path: `${out}/${name}.png` });
  const r = await p.evaluate(() => {
    const q = (s) => document.querySelector(s)?.getBoundingClientRect();
    const c = q(".cons"), btn = q(".hero-actions .btn-primary"), h1 = q(".hero-title");
    const hit = (a, b) => a && b && !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
    return { cons: !!c, consOverBtn: hit(c, btn), consOverH1: hit(c, h1), btnBottom: btn && Math.round(btn.bottom), vh: innerHeight };
  });
  console.log(name, JSON.stringify(r));
  await ctx.close();
};
await shot("consent-1440x800", { viewport: { width: 1440, height: 800 } });
await shot("consent-390x844", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await shot("consent-360x740", { viewport: { width: 360, height: 740 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await shot("consent-375x667", { viewport: { width: 375, height: 667 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const rm = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: "reduce" };
for (const id of ["#alltag", "#ergebnisse", "#garantie"]) {
  await shot(`reduced-${id.slice(1)}`, rm, async (p) => {
    await p.evaluate(() => localStorage.setItem("svh-einwilligung", "notwendig"));
    await p.evaluate((i) => document.querySelector(i).scrollIntoView(), id);
    await p.waitForTimeout(800);
  });
}
const nojs = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, javaScriptEnabled: false };
await shot("nojs-hero", nojs);
for (const id of ["#alltag", "#garantie"]) {
  await shot(`nojs-${id.slice(1)}`, nojs, async (p) => {
    const y = await p.evaluate((i) => document.querySelector(i).getBoundingClientRect().top + scrollY, id);
    await p.mouse.wheel(0, y);
    await p.waitForTimeout(600);
  });
}
await b.close();
