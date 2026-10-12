// Aufnahme an einem Anker: node scripts/at.mjs <#id> <name> <w> <h> <mobil> [extraScroll]
import { chromium } from "playwright";
const [, , id, name, w, h, mob, extra = "0"] = process.argv;
const mobile = mob === "1";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: mobile ? 3 : 1, isMobile: mobile, hasTouch: mobile });
await ctx.addInitScript(() => localStorage.setItem("svh-einwilligung", "notwendig"));
const p = await ctx.newPage();
const logs = [];
p.on("console", (m) => { if (["error"].includes(m.type())) logs.push(m.text().slice(0, 200)); });
await p.goto("http://localhost:3200/", { waitUntil: "networkidle" });
await p.waitForTimeout(1200);
const top = await p.evaluate((id) => document.querySelector(id).getBoundingClientRect().top + window.scrollY, id);
for (let y = 0; y < top + +extra; y += 300) { await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(40); }
await p.evaluate((v) => window.scrollTo(0, v), top + +extra);
await p.waitForTimeout(2600);
await p.screenshot({ path: `../review/bau-runde2/A/${name}.png` });
console.log(logs.join("\n") || "ok");
await b.close();
