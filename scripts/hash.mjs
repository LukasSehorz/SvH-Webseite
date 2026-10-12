// Anker-Sprung prüfen: /#id direkt laden und Lage des Ziels messen
import { chromium } from "playwright";
const b = await chromium.launch();
for (const [w, h, mob] of [[390, 844, true], [1440, 900, false]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mob, hasTouch: mob, deviceScaleFactor: mob ? 3 : 1 });
  await ctx.addInitScript(() => localStorage.setItem("svh-einwilligung", "notwendig"));
  const p = await ctx.newPage();
  for (const id of ["ergebnisse", "garantie", "termin", "fahrplan"]) {
    await p.goto(`http://localhost:3200/#${id}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(3000);
    const top = await p.evaluate((i) => Math.round(document.getElementById(i).getBoundingClientRect().top), id);
    console.log(w, id, "top:", top);
  }
  await ctx.close();
}
await b.close();
