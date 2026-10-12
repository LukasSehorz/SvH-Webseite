// A1: nach dem Laden nichts per visibility versteckt; Tab-Folge erreicht die Inhaltsknöpfe
import { chromium } from "playwright";
const b = await chromium.launch();
for (const [w, h, mob] of [[390, 844, 1], [1440, 900, 0]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob });
  await ctx.addInitScript(() => localStorage.setItem("svh-einwilligung", "notwendig"));
  const p = await ctx.newPage();
  await p.goto("http://localhost:3200/", { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  const hidden = await p.evaluate(() => [...document.querySelectorAll("main *")].filter((e) => getComputedStyle(e).visibility === "hidden" && e.textContent.trim().length > 3 && !e.closest("[aria-hidden='true'],[inert],.sw-texts,.nav-sheet,.nav-panel")).map((e) => e.className.toString().slice(0, 40)).slice(0, 8));
  // Tab-Folge: bis zu 60 Stopps, Inhaltsknöpfe zählen
  const stops = [];
  for (let i = 0; i < 70; i++) {
    await p.keyboard.press("Tab");
    const s = await p.evaluate(() => { const a = document.activeElement; return a ? (a.textContent || a.getAttribute("aria-label") || a.tagName).trim().slice(0, 40) + "@" + (a.closest("section")?.id || a.closest("footer,header")?.tagName || "") : ""; });
    stops.push(s);
  }
  const ctas = stops.filter((s) => s.startsWith("Kostenlosen KI-Workshop sichern")).map((s) => s.split("@")[1]);
  console.log(`${w}: versteckt nach Laden: ${hidden.length} ${hidden.join(", ")} · Inhaltsknöpfe in Tab-Folge: ${ctas.join(", ")} · estera-Link erreichbar: ${stops.some((s) => s.startsWith("estera"))}`);
  await ctx.close();
}
await b.close();
