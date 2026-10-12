// Start-Maschine: Überlappung sichtbarer Kärtchen und Rest-Kärtchen im Kern über 12 s
import { chromium } from "playwright";
const b = await chromium.launch();
for (const [w, h, mob] of [[1440, 800, 0], [390, 844, 1], [1024, 768, 0]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => localStorage.setItem("svh-einwilligung", "notwendig"));
  const p = await ctx.newPage();
  await p.goto("http://localhost:3200/", { waitUntil: "networkidle" });
  if (mob) { await p.evaluate(() => scrollTo(0, document.querySelector(".hero-visual").getBoundingClientRect().top + scrollY - 200)); }
  await p.waitForTimeout(1500);
  let maxOv = 0, tiny = 0, clipped = 0;
  for (let i = 0; i < 48; i++) {
    const r = await p.evaluate(() => {
      const cards = [...document.querySelectorAll(".task")].map((c) => ({ c, r: c.getBoundingClientRect(), o: Number(getComputedStyle(c).opacity), v: getComputedStyle(c).visibility }));
      const vis = cards.filter((x) => x.o > 0.9 && x.v !== "hidden" && x.r.width > 100);
      let ov = 0;
      for (let a = 0; a < vis.length; a++) for (let b = a + 1; b < vis.length; b++) {
        const A = vis[a].r, B = vis[b].r;
        const x = Math.min(A.right, B.right) - Math.max(A.left, B.left), y = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
        if (x > 0 && y > 0) ov = Math.max(ov, y);
      }
      const tiny = cards.filter((x) => x.o > 0.08 && x.v !== "hidden" && x.r.width > 2 && x.r.width < 100).length;
      const clipped = [...document.querySelectorAll(".task-label")].filter((l) => l.scrollWidth > l.clientWidth + 1).length;
      return { ov, tiny, clipped };
    });
    maxOv = Math.max(maxOv, r.ov); tiny = Math.max(tiny, r.tiny); clipped = Math.max(clipped, r.clipped);
    await p.waitForTimeout(250);
  }
  console.log(`${w}: max. Überlappung voll sichtbarer Kärtchen ${Math.round(maxOv)} px · winzige sichtbare Kärtchen ${tiny} · abgeschnittene Beschriftungen ${clipped}`);
  await p.screenshot({ path: `../review/bau-runde2/A/maschine-${w}.png` });
  await ctx.close();
}
await b.close();
