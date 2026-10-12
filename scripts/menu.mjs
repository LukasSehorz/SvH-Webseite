// Menü-Zustände prüfen: mobil Vollbild-Menü (mit Aktuelles offen) und Desktop-Aufklapper
import { chromium } from "playwright";
const b = await chromium.launch();
const out = "../review/bau-runde2/A/A-menu";
(await import("node:fs")).mkdirSync(out, { recursive: true });
const m = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await m.addInitScript(() => localStorage.setItem("svh-einwilligung", "notwendig"));
const p = await m.newPage();
await p.goto("http://localhost:3200/", { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
await p.tap(".nav-burger");
await p.waitForTimeout(800);
await p.screenshot({ path: `${out}/mobil-menue.png` });
await p.tap(".nav-sheet button.nav-sheet-link");
await p.waitForTimeout(800);
await p.screenshot({ path: `${out}/mobil-menue-aktuelles.png` });
const d = await b.newContext({ viewport: { width: 1440, height: 800 } });
await d.addInitScript(() => localStorage.setItem("svh-einwilligung", "notwendig"));
const q = await d.newPage();
await q.goto("http://localhost:3200/", { waitUntil: "networkidle" });
await q.waitForTimeout(1500);
await q.click(".nav-drop > button");
await q.waitForTimeout(700);
await q.screenshot({ path: `${out}/desktop-aktuelles.png` });
// Tastatur: Escape schließt, Fokus zurück
await q.keyboard.press("Escape");
await q.waitForTimeout(400);
console.log("Fokus nach Escape:", await q.evaluate(() => document.activeElement?.textContent?.trim()), "offen:", await q.evaluate(() => document.querySelector(".nav-panel").dataset.open));
await b.close();
