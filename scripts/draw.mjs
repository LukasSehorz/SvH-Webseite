// Endzustand aller gezeichneten Linien messen (nach langsamem Durchscrollen)
import { chromium } from "playwright";
const b = await chromium.launch();
for (const [w, h, mob] of [[390, 844, 1], [1440, 900, 0], [2560, 1440, 0]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob, deviceScaleFactor: mob ? 3 : 1 });
  await ctx.addInitScript(() => localStorage.setItem("svh-einwilligung", "notwendig"));
  const p = await ctx.newPage();
  await p.goto("http://localhost:3200/", { waitUntil: "networkidle" });
  await p.waitForTimeout(3500);
  const max = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < max; y += 300) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(70); }
  await p.waitForTimeout(2500);
  // zurück zu jedem Element, damit Scrub-Linien in ihrem Endbereich stehen
  const res = await p.evaluate(async () => {
    // alle Formen mit Strichmuster und pathLength (egal welcher Abschnitt)
    const els = [...document.querySelectorAll("svg path, svg circle, svg line, svg polyline, svg rect, svg ellipse")].filter((el) => {
      const cs = getComputedStyle(el);
      return el.getAttribute("pathLength") && !el.classList.contains("seal-tick") && cs.strokeDasharray !== "none" && el.getBoundingClientRect().width > 0;
    });
    const out = [];
    for (const el of els) {
      const cs = getComputedStyle(el);
      const m = el.getScreenCTM();
      const r = m ? Math.hypot(m.a, m.b) : 1;
      const da = cs.strokeDasharray, off = parseFloat(cs.strokeDashoffset) || 0;
      const nonScaling = cs.vectorEffect === "non-scaling-stroke";
      // sichtbarer Anteil bei pathLength=1
      let frac = 1;
      if (da !== "none") {
        const d = parseFloat(da);
        frac = nonScaling ? Math.min(1, (d - off) / r) : Math.min(1, d - off);
        if (d === 0) frac = 0;
      }
      const sec = el.closest("section")?.id || el.closest("footer, .divider")?.className || "?";
      out.push({ cls: (el.getAttribute("class") || el.tagName) + "@" + sec, frac: +frac.toFixed(2), r: +r.toFixed(2), off: +off.toFixed(2), ns: nonScaling });
    }
    return out;
  });
  const bad = res.filter((x) => x.frac < 0.99);
  console.log(`${w}: ${res.length} Linien, unvollständig: ${bad.length}`, bad.length ? JSON.stringify(bad.slice(0, 8)) : "");
  await ctx.close();
}
await b.close();
