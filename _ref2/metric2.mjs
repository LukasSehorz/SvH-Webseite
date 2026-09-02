import sharp from 'sharp';

/** Sucht das dichteste Fenster und misst dort. Dadurch ist die Messung
 *  unabhaengig davon, wo im Bild das Gewebe gerade liegt. */
async function best(file, win = 400, avoidBright = true) {
  const img = sharp(file).greyscale();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const px = data;
  let bx = 0, by = 0, bs = -1;
  const step = 40;
  for (let y = 0; y + win < H; y += step) {
    for (let x = 0; x + win < W; x += step) {
      let sum = 0, n = 0, blown = 0;
      for (let yy = y; yy < y + win; yy += 8) {
        for (let xx = x; xx < x + win; xx += 8) {
          const v = px[yy * W + xx];
          sum += v; n++;
          if (v > 150) blown++;
        }
      }
      // Fenster mit viel sehr hellem Inhalt sind Fremdinhalt (Bilder, Text)
      if (avoidBright && blown / n > 0.35) continue;
      const m = sum / n;
      if (m > bs) { bs = m; bx = x; by = y; }
    }
  }
  const box = { left: bx, top: by, width: win, height: win };
  const sub = await sharp(file).extract(box).greyscale().raw().toBuffer({ resolveWithObject: true });
  const q = [...sub.data];
  const sorted = [...q].sort((a, b) => a - b);
  const floor = sorted[Math.floor(sorted.length * 0.05)];
  const mean = q.reduce((s, v) => s + v, 0) / q.length;
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  const cov = q.filter(v => v > floor + 8).length / q.length;
  const w = box.width;
  const acf = [];
  for (let d = 1; d <= 12; d++) {
    let num = 0, da = 0, db = 0;
    for (let y = 0; y < box.height; y += 2)
      for (let x = 0; x + d < w; x += 2) {
        const a = q[y * w + x] - mean, b = q[y * w + x + d] - mean;
        num += a * b; da += a * a; db += b * b;
      }
    acf.push(+(num / Math.sqrt(da * db || 1)).toFixed(3));
  }
  return {
    at: `${bx},${by}`,
    signal: +(mean - floor).toFixed(2),
    p99: +(p99 - floor).toFixed(0),
    coverage: +(cov * 100).toFixed(1),
    bump: Math.max(...acf.slice(4, 9)),
  };
}

const files = process.argv.slice(2);
for (const f of files) {
  const r = await best(f);
  console.log(f.split(/[\/]/).pop().padEnd(14), JSON.stringify(r));
}
