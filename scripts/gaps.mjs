// Leerraum zwischen Sektionen messen: letzter sichtbarer Inhalt von N bis erster sichtbarer Inhalt von N+1
import { chromium } from "playwright";
const b = await chromium.launch();
for (const [w, h, mob] of [[390, 844, 1], [1440, 900, 0]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob, deviceScaleFactor: 2, reducedMotion: "reduce" });
  await ctx.addInitScript(() => localStorage.setItem("svh-einwilligung", "notwendig"));
  const p = await ctx.newPage();
  await p.goto("http://localhost:3200/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const res = await p.evaluate(() => {
    const blocks = [...document.querySelectorAll("main > *")].filter((el) => !el.classList.contains("mcta"));
    const bounds = (el) => {
      let top = Infinity, bottom = -Infinity;
      el.querySelectorAll("h1,h2,h3,p,li,a,button,img,svg,canvas,figure,article,input,label").forEach((c) => {
        const r = c.getBoundingClientRect();
        const cs = getComputedStyle(c);
        if (!r.width || !r.height || cs.visibility === "hidden") return;
        top = Math.min(top, r.top + scrollY);
        bottom = Math.max(bottom, r.bottom + scrollY);
      });
      return { top, bottom };
    };
    const out = [];
    for (let i = 0; i < blocks.length - 1; i++) {
      const a = bounds(blocks[i]), c = bounds(blocks[i + 1]);
      out.push(`${blocks[i].id || blocks[i].className.split(" ")[0]} → ${blocks[i + 1].id || blocks[i + 1].className.split(" ")[0]}: ${Math.round(c.top - a.bottom)} px`);
    }
    return out;
  });
  console.log(`--- ${w} (reduzierte Bewegung, ohne Pins)\n` + res.join("\n"));
  await ctx.close();
}
await b.close();
