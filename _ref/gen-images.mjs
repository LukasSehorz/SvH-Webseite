// Bild-Generierung über kie.ai (GPT Image 2). Nutzung: node _ref/gen-images.mjs [nameFilter]
import fs from 'fs';
import path from 'path';

// Schlüssel kommt aus der Umgebung — nie im Code hinterlegen.
// Aufruf z. B.:  KIE_KEY=... node _ref/gen-images.mjs
const KEY = process.env.KIE_KEY;
if (!KEY) {
  console.error('Fehlt: Umgebungsvariable KIE_KEY (kie.ai API-Schlüssel).');
  process.exit(1);
}
const OUT = path.resolve('public/img');
fs.mkdirSync(OUT, { recursive: true });

const STYLE =
  'Corporate tech brand imagery. Colour palette strictly: pure white #FFFFFF, ' +
  'ice blue #EFFAFF, light cyan #B6EAFF, brand cyan #0092D4, bright cyan #00BCFF, ' +
  'deep ink #001A23. Clean, premium, minimal, lots of white space, soft studio lighting, ' +
  'no text, no words, no letters, no logos, no watermarks, no people looking at camera.';

const JOBS = [
  {
    name: 'hero-geometry',
    ratio: '4:3',
    res: '2K',
    prompt:
      'Abstract 3D render of translucent frosted glass chevrons and ascending triangular ' +
      'prisms stacked into a large mountain-like formation, seen slightly from the side. ' +
      'Glass is pale cyan, edges catch bright cyan light. Faint wireframe grid lines and ' +
      'thin halftone dot texture in the lowest layer. Background fades from pure white at ' +
      'the top left into light cyan at the bottom right. Very airy, high key, soft. ' + STYLE,
  },
  {
    name: 'showcase',
    ratio: '16:9',
    res: '2K',
    prompt:
      'Cinematic wide shot of a bright modern consulting office, two blurred professionals ' +
      'in conversation at a glass table in the background, sharp foreground detail of a ' +
      'laptop screen glowing faint cyan with abstract dashboard shapes. Shallow depth of ' +
      'field, cool daylight, calm and premium. ' + STYLE,
  },
  {
    name: 'testimonial-media',
    ratio: '16:9',
    res: '2K',
    prompt:
      'Cinematic wide shot of a bright minimal workspace, a blurred person working at a ' +
      'desk on the left, on the right an abstract translucent cyan data visualisation ' +
      'floating in the air made of thin curves and small rectangles. Cool daylight, ' +
      'shallow depth of field. ' + STYLE,
  },
  {
    name: 'audience-bg',
    ratio: '21:9',
    res: '2K',
    prompt:
      'Abstract background of soft diagonal light rays sweeping across a bright cyan ' +
      'gradient, with faint geometric chevron silhouettes and thin white streaks. ' +
      'Dreamy, smooth, no hard edges, looks like sunlight through frosted glass. ' + STYLE,
  },
  {
    name: 'cta-pattern',
    ratio: '21:9',
    res: '2K',
    prompt:
      'Abstract wide background: large flat geometric diamonds and chevrons tiling a ' +
      'gradient that goes from very pale ice blue at the top to saturated brand cyan at ' +
      'the bottom. Subtle embossed edges, faint dotted grid texture, perfectly flat ' +
      'graphic design style, no perspective. ' + STYLE,
  },
  {
    name: 'newsletter-book',
    ratio: '4:3',
    res: '2K',
    prompt:
      'A closed hardcover book floating at a slight angle above a bright cyan surface, ' +
      'blank white cover with no text at all, crisp shadow beneath, small polished chrome ' +
      'sphere resting next to it. Studio product photography, soft reflections. ' + STYLE,
  },
  {
    name: 'resource-1',
    ratio: '16:9',
    res: '1K',
    prompt:
      'Moody editorial photograph of a dark desk lit by a single cool cyan rim light, ' +
      'closed laptop and notebook, deep shadows, cinematic. No text. ' + STYLE,
  },
  {
    name: 'resource-2',
    ratio: '16:9',
    res: '1K',
    prompt:
      'Moody editorial photograph of a microphone on a boom arm in a dark studio, ' +
      'cyan rim light from the left, deep shadows, cinematic, shallow depth of field. ' +
      'No text. ' + STYLE,
  },
  {
    name: 'resource-3',
    ratio: '16:9',
    res: '1K',
    prompt:
      'Moody editorial photograph of abstract translucent cyan glass shards floating in ' +
      'a very dark room, single hard light source, cinematic, high contrast. No text. ' + STYLE,
  },
  {
    name: 'resource-feature',
    ratio: '16:9',
    res: '2K',
    prompt:
      'Dark cinematic still of a tablet propped on a desk, its screen glowing with ' +
      'abstract cyan interface shapes, cool rim lighting, deep black background, ' +
      'premium editorial feel. No text. ' + STYLE,
  },
  {
    name: 'og',
    ratio: '16:9',
    res: '2K',
    prompt:
      'Minimal brand key visual: large translucent cyan glass chevron formation centred ' +
      'on a clean white to ice blue gradient background, soft glow, generous empty space ' +
      'in the lower third. ' + STYLE,
  },
];

const api = (p, opt) =>
  fetch('https://api.kie.ai/api/v1' + p, {
    ...opt,
    headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', ...(opt?.headers || {}) },
  }).then((r) => r.json());

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run(job) {
  const dest = path.join(OUT, job.name + '.png');
  if (fs.existsSync(dest)) return console.log('skip (exists)', job.name);

  const created = await api('/jobs/createTask', {
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-image-2-text-to-image',
      input: { prompt: job.prompt, aspect_ratio: job.ratio, resolution: job.res },
    }),
  });
  const taskId = created?.data?.taskId;
  if (!taskId) return console.error('FAIL create', job.name, JSON.stringify(created));
  console.log('queued', job.name, taskId);

  for (let i = 0; i < 90; i++) {
    await sleep(5000);
    const info = await api('/jobs/recordInfo?taskId=' + taskId);
    const d = info?.data;
    if (d?.state === 'success') {
      const url = JSON.parse(d.resultJson).resultUrls[0];
      const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
      fs.writeFileSync(dest, buf);
      return console.log('OK', job.name, (buf.length / 1024).toFixed(0) + 'kB');
    }
    if (d?.state === 'fail') return console.error('FAIL', job.name, d.failMsg);
  }
  console.error('TIMEOUT', job.name);
}

const filter = process.argv[2];
const list = filter ? JOBS.filter((j) => j.name.includes(filter)) : JOBS;
// 3 parallel
const queue = [...list];
await Promise.all(
  Array.from({ length: 3 }, async () => {
    while (queue.length) await run(queue.shift());
  })
);
console.log('done');
