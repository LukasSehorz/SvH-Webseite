/**
 * Bilder und kurze Videos fuer die Werbetafeln ueber kie.ai.
 *
 *   KIE_KEY=... node _ref3/tafeln-bilder.mjs bilder   [namensfilter]
 *   KIE_KEY=... node _ref3/tafeln-bilder.mjs videos   [namensfilter]
 *
 * Der Schluessel kommt AUSSCHLIESSLICH aus der Umgebungsvariablen KIE_KEY
 * und steht nirgends im Quelltext. Das ist eine feste Regel dieses
 * Projekts; ein Schluessel ist hier schon einmal versehentlich in ein
 * Skript geraten und musste vor dem Push wieder entfernt werden.
 *
 * Zwei Bildfamilien fuer die Unterseite /marketing/werbetafeln und den
 * Werbetafel-Strang der Landingpage:
 *
 * ORTE (16:9). Eine schlanke digitale Stele in Personengroesze an einem
 * belebten Ort, also Gym, Restaurant, Club, Event. Der Bildschirm leuchtet
 * blauviolett und traegt KEINE lesbare Schrift, damit die Seite dort ihren
 * eigenen gezeichneten Spot darueberlegen kann. Diese Bilder ersetzen die
 * drei Stockfotos, die sich bisher ueber Hero, Ortskarten und Band
 * wiederholen, was der Designauftrag als groesztes sichtbares Risiko der
 * Seite benennt.
 *
 * SPOTS (9:16). Der Inhalt, der auf der Tafel laeuft, also das, was SVH
 * herstellt. Ebenfalls ohne Schrift, ohne Preis, ohne Betriebsnamen; die
 * Woerter setzt die Komponente Spot.tsx selbst darueber. Der Bildschirm
 * der Stele misst 9 zu 15,5, und 9:16 ist das naechste Seitenverhaeltnis,
 * das die Schnittstelle anbietet; der Rest geht ueber object-fit.
 *
 * Die Spots werden im zweiten Schritt mit Veo 3 in kurze Schleifen
 * verwandelt (Bild zu Video). Dafuer braucht kie.ai eine erreichbare
 * Bildadresse, und die Ergebnisadresse aus dem ersten Schritt ist genau
 * das; sie wird deshalb in einer Manifestdatei festgehalten.
 *
 * Ergebnisse landen unter public/tafeln/ als WebP (Bilder) und MP4
 * (Videos). Die Roh-PNGs sind mehrere Megabyte grosz und werden nach der
 * Umwandlung geloescht.
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const KEY = process.env.KIE_KEY;
if (!KEY) {
  console.error('Fehlt: Umgebungsvariable KIE_KEY.');
  process.exit(1);
}

const OUT = path.resolve('public/tafeln');
fs.mkdirSync(OUT, { recursive: true });
const MANIFEST = path.join(OUT, 'manifest.json');
const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
const speichern = () => fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

/* Der gemeinsame Ton aller Bilder. Er bindet sie an die Bildwelt der
   Seite: sehr dunkler Grund, Licht in Blau bis Blauviolett, keine Schrift,
   keine Logos, keine Gesichter, die in die Kamera sehen. */
const TON =
  'Cinematic photograph, very dark environment, near-black background #050507, ' +
  'the only light sources are cool blue to blue-violet (#5b8cff, #7c6aff, #b9a5ff). ' +
  'Premium, calm, editorial. Absolutely no text, no letters, no numbers, no logos, ' +
  'no brand names, no watermarks, no readable signage. No faces looking at the camera. ' +
  'Shallow depth of field, soft bloom around light sources, fine film grain.';

/* Die Tafel selbst, in jedem Ortsbild gleich beschrieben, damit die vier
   Bilder als Reihe zusammengehoeren. */
const STELE =
  'A slim modern freestanding digital display stele, about the height of a person, ' +
  'narrow matte-black frame, portrait screen, standing on a small flat base. ' +
  'The screen glows a soft abstract blue-violet gradient with gentle light streaks ' +
  'and no content on it. It is the brightest thing in the frame and casts a soft ' +
  'blue-violet pool of light on the floor around it.';

const BILDER = [
  {
    name: 'ort-gym',
    ratio: '16:9',
    prompt:
      STELE +
      ' It stands in a modern gym at night near a rack of dumbbells and a treadmill, ' +
      'equipment out of focus in the background, a blurred person exercising far away. ' +
      TON,
  },
  {
    name: 'ort-restaurant',
    ratio: '16:9',
    prompt:
      STELE +
      ' It stands in an upscale restaurant in the evening beside the entrance to the ' +
      'dining room, warm candle points far in the background kept very dim, tables and ' +
      'glasses out of focus. ' +
      TON,
  },
  {
    name: 'ort-club',
    ratio: '16:9',
    prompt:
      STELE +
      ' It stands in the lounge area of a nightclub, haze in the air, a few blurred ' +
      'silhouettes of guests in the background, subtle violet laser lines far away. ' +
      TON,
  },
  {
    name: 'ort-event',
    ratio: '16:9',
    prompt:
      STELE +
      ' It stands in the foyer of an evening event, a blurred crowd and stage light ' +
      'spill far in the background, polished floor reflecting the screen glow. ' +
      TON,
  },
  {
    name: 'spot-gym',
    ratio: '9:16',
    prompt:
      'Advertising visual for a gym, portrait format, designed to run on a digital ' +
      'signage screen: a close, dramatic shot of a kettlebell and chalk dust in the air, ' +
      'rim-lit in electric blue, dark studio background, generous empty space in the ' +
      'lower third for a headline that will be added later. ' +
      TON,
  },
  {
    name: 'spot-restaurant',
    ratio: '9:16',
    prompt:
      'Advertising visual for a restaurant, portrait format, designed to run on a ' +
      'digital signage screen: a beautifully plated dish on dark slate, seen from above ' +
      'at a slight angle, steam rising, lit by cool blue-violet light with a faint warm ' +
      'highlight, generous empty space in the lower third for a headline. ' +
      TON,
  },
  {
    name: 'spot-club',
    ratio: '9:16',
    prompt:
      'Advertising visual for a night club, portrait format, designed to run on a ' +
      'digital signage screen: haze, violet and blue light beams crossing, a blurred ' +
      'crowd with raised hands far below, generous empty space in the lower third for ' +
      'a headline. ' +
      TON,
  },
  {
    name: 'spot-event',
    ratio: '9:16',
    prompt:
      'Advertising visual for a local event, portrait format, designed to run on a ' +
      'digital signage screen: a string of small round lights hanging in the dark with ' +
      'soft blue-violet bokeh, a hint of a stage below, generous empty space in the ' +
      'lower third for a headline. ' +
      TON,
  },
];

/* Die Bewegung fuer die Schleifen. Sie bleibt klein, damit der Spot auf
   der Tafel ruhig wirkt und sich nahtlos wiederholen laesst. */
const VIDEOS = [
  { name: 'spot-gym', prompt: 'Slow cinematic loop: chalk dust drifts gently through the blue rim light, the kettlebell stays still, subtle light flicker. No text appears. Seamless, calm, 6 seconds.' },
  { name: 'spot-restaurant', prompt: 'Slow cinematic loop: steam rises softly from the plated dish, the light breathes very slightly, nothing else moves. No text appears. Seamless, calm.' },
  { name: 'spot-club', prompt: 'Slow cinematic loop: light beams sweep slowly through the haze, the crowd sways gently in the distance. No text appears. Seamless, calm.' },
  { name: 'spot-event', prompt: 'Slow cinematic loop: the hanging lights sway very slightly, bokeh drifts, a soft pulse of light from the stage below. No text appears. Seamless, calm.' },
];

const api = (p, opt) =>
  fetch('https://api.kie.ai/api/v1' + p, {
    ...opt,
    headers: {
      Authorization: 'Bearer ' + KEY,
      'Content-Type': 'application/json',
      ...(opt?.headers || {}),
    },
  }).then((r) => r.json());

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function laden(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('Download ' + r.status + ' ' + url);
  return Buffer.from(await r.arrayBuffer());
}

async function bild(job) {
  const ziel = path.join(OUT, job.name + '.webp');
  if (fs.existsSync(ziel) && manifest[job.name]?.bildUrl) {
    return console.log('vorhanden', job.name);
  }
  const angelegt = await api('/jobs/createTask', {
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-image-2-text-to-image',
      input: { prompt: job.prompt, aspect_ratio: job.ratio, resolution: '2K' },
    }),
  });
  const taskId = angelegt?.data?.taskId;
  if (!taskId) return console.error('FEHLER anlegen', job.name, JSON.stringify(angelegt));
  console.log('eingereiht', job.name, taskId);

  for (let i = 0; i < 120; i++) {
    await sleep(5000);
    const info = await api('/jobs/recordInfo?taskId=' + taskId);
    const d = info?.data;
    if (d?.state === 'success') {
      const url = JSON.parse(d.resultJson).resultUrls[0];
      const roh = await laden(url);
      const meta = await sharp(roh).metadata();
      // Orte auf 1600 Breite, Spots auf 900 Breite. Beides reicht fuer
      // die Darstellung und haelt die Dateien unter 200 kB.
      const breite = job.ratio === '9:16' ? 900 : 1600;
      await sharp(roh).resize({ width: breite }).webp({ quality: 82 }).toFile(ziel);
      manifest[job.name] = {
        bildUrl: url,
        taskId,
        breite: meta.width,
        hoehe: meta.height,
        prompt: job.prompt,
        erzeugt: new Date().toISOString(),
        modell: 'gpt-image-2-text-to-image',
      };
      speichern();
      const kb = (fs.statSync(ziel).size / 1024).toFixed(0);
      return console.log('OK', job.name, meta.width + 'x' + meta.height, '->', kb + 'kB');
    }
    if (d?.state === 'fail') return console.error('FEHLER', job.name, d.failMsg);
  }
  console.error('ZEITUEBERSCHREITUNG', job.name);
}

async function video(job) {
  const ziel = path.join(OUT, job.name + '.mp4');
  if (fs.existsSync(ziel)) return console.log('vorhanden', job.name);
  const bildUrl = manifest[job.name]?.bildUrl;
  if (!bildUrl) return console.error('FEHLER kein Bild im Manifest fuer', job.name);

  const angelegt = await api('/veo/generate', {
    method: 'POST',
    body: JSON.stringify({
      prompt: job.prompt,
      imageUrls: [bildUrl],
      model: 'veo3_fast',
      aspect_ratio: '9:16',
      duration: 6,
      resolution: '720p',
      enableTranslation: false,
    }),
  });
  const taskId = angelegt?.data?.taskId;
  if (!taskId) return console.error('FEHLER anlegen video', job.name, JSON.stringify(angelegt));
  console.log('eingereiht video', job.name, taskId);

  for (let i = 0; i < 180; i++) {
    await sleep(10000);
    const info = await api('/veo/record-info?taskId=' + taskId);
    const d = info?.data;
    if (d?.successFlag === 1) {
      const urls = d.response?.fullResultUrls?.length ? d.response.fullResultUrls : d.response?.resultUrls;
      const url = urls?.[0];
      if (!url) return console.error('FEHLER keine Videoadresse', job.name, JSON.stringify(d));
      fs.writeFileSync(ziel, await laden(url));
      manifest[job.name] = {
        ...(manifest[job.name] || {}),
        videoUrl: url,
        videoTaskId: taskId,
        videoPrompt: job.prompt,
        videoErzeugt: new Date().toISOString(),
        videoModell: 'veo3_fast',
      };
      speichern();
      const kb = (fs.statSync(ziel).size / 1024).toFixed(0);
      return console.log('OK video', job.name, kb + 'kB');
    }
    if (d?.successFlag === 2 || d?.successFlag === 3) {
      return console.error('FEHLER video', job.name, d.errorMessage);
    }
  }
  console.error('ZEITUEBERSCHREITUNG video', job.name);
}

const modus = process.argv[2];
const filter = process.argv[3];
const liste = (modus === 'videos' ? VIDEOS : BILDER).filter((j) => !filter || j.name.includes(filter));
const lauf = modus === 'videos' ? video : bild;

/* Drei Auftraege gleichzeitig, mehr nimmt die Schnittstelle nicht gern. */
const schlange = [...liste];
await Promise.all(
  Array.from({ length: 3 }, async () => {
    while (schlange.length) await lauf(schlange.shift());
  }),
);
console.log('fertig');
