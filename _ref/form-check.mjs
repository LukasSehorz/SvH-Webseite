/**
 * Prüft das Kontaktformular:
 *  1. Absenden ohne Pflichtfelder → Fehlermeldungen, kein Neuladen
 *  2. Absenden mit Pflichtfeldern → Erfolgsmeldung, kein Neuladen
 *
 *   node _ref/form-check.mjs [url]
 */
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:3100/unternehmen/kontakt';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 200)));

await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);

// Marker, um ein Neuladen zu erkennen
await page.evaluate(() => { window.__noReload = true; });

const card = page.locator('#anfrage');
const result = {};

// --- 1: leer absenden ---------------------------------------------------
await card.getByRole('button', { name: /anfrage senden/i }).click();
await page.waitForTimeout(500);
result.stillNoReload_1 = await page.evaluate(() => window.__noReload === true);
result.errorMessages = await card.locator('.svhError').allTextContents();
result.invalidCount = await card.locator('[aria-invalid="true"]').count();
result.successVisible_1 = await card.getByRole('status').count();

// --- 2: gültig absenden -------------------------------------------------
await card.getByLabel(/Ihr Name/).fill('Testperson');
await card.getByLabel(/E-Mail-Adresse/).fill('test@beispiel.de');
await card.getByLabel(/Ihre Nachricht/).fill('Das ist eine Testanfrage.');
await card.getByRole('button', { name: /anfrage senden/i }).click();
await page.waitForTimeout(900);

result.stillNoReload_2 = await page.evaluate(() => window.__noReload === true);
result.successText = (await card.getByRole('status').textContent().catch(() => null))?.trim() ?? null;
result.formGone = (await card.locator('form').count()) === 0;
result.consoleErrors = errors;

console.log(JSON.stringify(result, null, 2));
await browser.close();
