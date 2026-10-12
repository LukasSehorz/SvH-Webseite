// Schnelle Kontroll-Aufnahme: node scripts/quick.mjs <pfad> <name> [w] [h] [mobil] [scrollY]
import { chromium } from "playwright";
const [, , url = "/", name = "quick", w = "1440", h = "900", mob = "0", sy = "0"] = process.argv;
const b = await chromium.launch();
const mobile = mob === "1";
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: mobile ? 3 : 1, isMobile: mobile, hasTouch: mobile });
const p = await ctx.newPage();
const logs = [];
p.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(m.type() + ": " + m.text()); });
p.on("pageerror", (e) => logs.push("pageerror: " + e.message));
await p.goto("http://localhost:3200" + url, { waitUntil: "networkidle" });
await p.waitForTimeout(3500);
if (+sy) { await p.evaluate((y) => window.scrollTo(0, y), +sy); await p.waitForTimeout(1500); }
await p.screenshot({ path: `../review/bau-runde2/A/${name}.png` });
console.log(logs.join("\n") || "keine Konsolenmeldungen");
await b.close();
