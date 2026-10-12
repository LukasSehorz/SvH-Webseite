// Direktaufruf /#id, Seitenwechsel startet oben, Leisten-Knopf mobil auf Unterseiten
import { chromium } from "playwright";
const b = await chromium.launch();
for (const [w, h, mob] of [[1440, 900, 0], [390, 844, 1]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob, deviceScaleFactor: mob ? 3 : 1 });
  await ctx.addInitScript(() => localStorage.setItem("svh-einwilligung", "notwendig"));
  const p = await ctx.newPage();
  for (const id of ["fahrplan", "ergebnisse", "garantie", "fragen"]) {
    await p.goto(`http://localhost:3200/#${id}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(4500);
    console.log(w, `/#${id}:`, await p.evaluate((i) => Math.round(document.getElementById(i).getBoundingClientRect().top), id));
  }
  // Seitenwechsel: von weit unten auf der Startseite nach /aktuelles
  await p.goto("http://localhost:3200/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  await p.evaluate(() => scrollTo(0, document.body.scrollHeight - 1200));
  await p.waitForTimeout(800);
  await p.evaluate(() => { const a = document.querySelector('footer a[href="/aktuelles"]'); a?.click(); });
  await p.waitForTimeout(350);
  const y1 = await p.evaluate(() => Math.round(scrollY));
  await p.waitForTimeout(800);
  const y2 = await p.evaluate(() => Math.round(scrollY));
  console.log(w, "nach Wechsel zu /aktuelles scrollY:", y1, "→", y2, "Pfad:", await p.evaluate(() => location.pathname));
  if (mob) {
    for (const u of ["/impressum", "/aktuelles"]) {
      await p.goto("http://localhost:3200" + u, { waitUntil: "networkidle" });
      await p.waitForTimeout(800);
      console.log(w, u, "Leisten-Knopf sichtbar:", await p.evaluate(() => getComputedStyle(document.querySelector(".nav-end .btn")).display !== "none"));
    }
  }
  await ctx.close();
}
await b.close();
