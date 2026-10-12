// Durchscrollen mit Kontroll-Aufnahmen.
// node scripts/shots.mjs <breite> <höhe> <mobil 0|1> <ordner> [pfad=/] [schritt=0.85] [start=#id]
import { chromium, webkit, devices } from "playwright";
import fs from "node:fs";
const [, , w = "390", h = "844", mob = "1", dir = "A-390", url = "/", stepArg = "0.85", from = ""] = process.argv;
const out = `../review/bau-runde2/A/${dir}`;
fs.mkdirSync(out, { recursive: true });
const mobile = mob === "1";
// w = "webkit" → Safari-Technik mit iPhone 15 Pro (echte sichtbare Höhe)
const wk = w === "webkit";
const b = wk ? await webkit.launch() : await chromium.launch();
const ctx = wk
  ? await b.newContext({ ...devices["iPhone 15 Pro"] })
  : await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: mobile ? 3 : 1, isMobile: mobile, hasTouch: mobile });
// Einwilligung vorab beantworten, damit sie nicht jede Aufnahme verdeckt
await ctx.addInitScript(() => { try { localStorage.setItem("svh-einwilligung", "notwendig"); } catch {} });
const p = await ctx.newPage();
const logs = [];
p.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(m.type() + ": " + m.text().slice(0, 300)); });
p.on("pageerror", (e) => logs.push("pageerror: " + e.message));
await p.goto("http://localhost:3200" + url, { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
if (from) { await p.evaluate((id) => document.querySelector(id)?.scrollIntoView(), from); await p.waitForTimeout(1200); }
const vh = wk ? devices["iPhone 15 Pro"].viewport.height : +h;
let n = 0;
let last = -1;
for (let i = 0; i < 400; i++) {
  const y = await p.evaluate(() => window.scrollY);
  const max = await p.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  await p.screenshot({ path: `${out}/${String(n).padStart(2, "0")}.png` });
  n++;
  if (y >= max - 2 || y === last) break;
  last = y;
  // in kleinen Schritten scrollen, damit ScrollTrigger und Lenis mitkommen
  const target = Math.min(max, y + vh * +stepArg);
  for (let yy = y; yy < target; yy += 180) {
    if (mobile || wk) await p.evaluate((v) => window.scrollTo(0, v), Math.min(target, yy + 180));
    else await p.mouse.wheel(0, 180);
    await p.waitForTimeout(90);
  }
  await p.waitForTimeout(900);
}
const sw = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
console.log(`${n} Aufnahmen in ${out} · Überlauf: ${sw.sw > sw.cw ? "JA " + sw.sw : "nein"}`);
console.log(logs.slice(0, 20).join("\n") || "keine Konsolenmeldungen");
await b.close();
