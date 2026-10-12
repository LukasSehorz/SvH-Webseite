// Konsole prüfen (Fehler, Warnungen, Hydration) beim langsamen Durchscrollen
import { chromium } from "playwright";
const b = await chromium.launch();
for (const [w, h, mob] of [[390, 844, true], [1440, 900, false]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mob, hasTouch: mob, deviceScaleFactor: mob ? 2 : 1 });
  const p = await ctx.newPage();
  const logs = [];
  const hosts = new Set();
  p.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(`${m.type()}: ${m.text().slice(0, 240)}`); });
  p.on("pageerror", (e) => logs.push("pageerror: " + e.message));
  p.on("request", (r) => { const u = new URL(r.url()); if (u.hostname !== "localhost") hosts.add(u.hostname); });
  await p.goto(`http://localhost:3200${process.argv[2] || "/"}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const max = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < max; y += 400) { await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(60); }
  await p.waitForTimeout(1500);
  console.log(`--- ${w}: ${logs.length} Meldungen, fremde Hosts: ${[...hosts].join(", ") || "keine"}`);
  console.log([...new Set(logs)].slice(0, 12).join("\n"));
  await ctx.close();
}
await b.close();
