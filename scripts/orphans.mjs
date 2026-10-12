// Sucht Überschriften, deren letzte Zeile nur ein Wort trägt (je Breite)
import { chromium } from "playwright";
const b = await chromium.launch();
for (const [w, h, mob] of [[360, 740, 1], [375, 667, 1], [390, 844, 1], [430, 932, 1], [834, 1112, 0], [1440, 900, 0]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob, deviceScaleFactor: 2, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3200" + (process.argv[2] || "/"), { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const res = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll("h1,h2,h3").forEach((el) => {
      if (!el.offsetParent) return;
      const r = document.createRange();
      r.selectNodeContents(el);
      const rects = [...r.getClientRects()].filter((x) => x.width > 2);
      if (!rects.length) return;
      // Zeilen nach Oberkante gruppieren
      const lines = [];
      rects.forEach((x) => {
        const l = lines.find((y) => Math.abs(y.top - x.top) < x.height * 0.5);
        if (l) { l.left = Math.min(l.left, x.left); l.right = Math.max(l.right, x.right); } else lines.push({ top: x.top, left: x.left, right: x.right });
      });
      if (lines.length < 2) return;
      lines.sort((a, b) => a.top - b.top);
      const last = lines[lines.length - 1];
      // Wörter der letzten Zeile zählen
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let words = 0;
      while (walker.nextNode()) {
        const t = walker.currentNode;
        const re = /\S+/g; let m;
        while ((m = re.exec(t.textContent))) {
          const rr = document.createRange(); rr.setStart(t, m.index); rr.setEnd(t, m.index + m[0].length);
          const b = rr.getBoundingClientRect();
          if (b.width && Math.abs(b.top - last.top) < b.height * 0.5) words++;
        }
      }
      if (words === 1) out.push(el.textContent.trim().slice(0, 70));
    });
    return out;
  });
  console.log(w, res.length ? res.join(" | ") : "keine");
  await ctx.close();
}
await b.close();
