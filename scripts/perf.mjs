// Mobil-Leistung am Produktions-Build: LCP, CLS, Gewicht, JS (gedrosselt)
import { chromium } from "playwright";
const url = process.argv[2] || "http://localhost:3300/";
const b = await chromium.launch();
for (const run of ["mobil (4x CPU, 1,6 Mbit/s, 150 ms)", "desktop"]) {
  const mob = run.startsWith("mobil");
  const ctx = await b.newContext(mob ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Network.enable");
  if (mob) {
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  }
  let bytes = 0, js = 0, reqs = 0;
  cdp.on("Network.loadingFinished", (e) => { bytes += e.encodedDataLength; reqs++; });
  const types = new Map();
  cdp.on("Network.responseReceived", (e) => types.set(e.requestId, e.type));
  cdp.on("Network.loadingFinished", (e) => { if (types.get(e.requestId) === "Script") js += e.encodedDataLength; });
  await p.addInitScript(() => {
    window.__lcp = 0; window.__cls = 0; window.__lcpEl = "";
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__lcp = e.startTime; window.__lcpEl = (e.element?.tagName || "") + "." + (e.element?.className || "").toString().slice(0, 40); } }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  });
  const t0 = Date.now();
  await p.goto(url, { waitUntil: "load" });
  await p.waitForTimeout(mob ? 6000 : 3000);
  const r = await p.evaluate(() => ({ lcp: Math.round(window.__lcp), el: window.__lcpEl, cls: window.__cls.toFixed(3), fcp: Math.round(performance.getEntriesByName("first-contentful-paint")[0]?.startTime || 0) }));
  console.log(`${run}: FCP ${r.fcp} ms · LCP ${r.lcp} ms (${r.el}) · CLS ${r.cls} · ${reqs} Anfragen · ${(bytes / 1024).toFixed(0)} KB gesamt · JS ${(js / 1024).toFixed(0)} KB (bis 6 s nach Laden)`);
  await ctx.close();
}
await b.close();
