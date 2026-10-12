// Anker-Sprung: Ziel-Inhalte sofort sichtbar? Deckkraft von Label, H2, Lead nach Klick
import { chromium, webkit, devices } from "playwright";
for (const eng of ["chromium", "webkit"]) {
  const b = eng === "webkit" ? await webkit.launch() : await chromium.launch();
  const ctx = eng === "webkit" ? await b.newContext({ ...devices["iPhone 15 Pro"] }) : await b.newContext({ viewport: { width: 1440, height: 800 } });
  await ctx.addInitScript(() => localStorage.setItem("svh-einwilligung", "notwendig"));
  const p = await ctx.newPage();
  await p.goto("http://localhost:3200/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  for (const [sel, id] of [[".hero-actions .btn-primary", "termin"], [".hero-actions .btn-ghost", "fahrplan"]]) {
    if (!(await p.locator(sel).isVisible())) continue;
    await p.click(sel);
    const probe = async () => p.evaluate((i) => {
      const s = document.getElementById(i);
      const els = [...s.querySelectorAll("[data-reveal], [data-split], h2, .lead")].slice(0, 6);
      return els.map((e) => Number(getComputedStyle(e).opacity).toFixed(2)).join(" ") + " | top " + Math.round(s.getBoundingClientRect().top);
    }, id);
    await p.waitForTimeout(300);
    const a = await probe();
    await p.waitForTimeout(1400);
    const c = await probe();
    console.log(eng, id, "nach 0,3 s:", a, "· nach 1,7 s:", c);
    await p.evaluate(() => scrollTo(0, 0));
    await p.waitForTimeout(800);
  }
  await b.close();
}
