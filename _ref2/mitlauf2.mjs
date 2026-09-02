// Der Mitlauf aus zwei fertigen Aufnahmen, ueber einen BLOCKVERGLEICH.
//
// _ref2/rueckkehr.mjs mittelt dafuer einen ganzen Streifen zu einem
// senkrechten Profil. Seit der Schleier zwischen den Punkten traegt, wird
// dieses Profil vom ortsfesten Grund der Zone beherrscht, und die
// Kreuzkorrelation meldet deshalb null. Ein Blockvergleich in einem
// Fenster, das nachweislich Gewebe enthaelt, hat dieses Problem nicht.
//
//   node _ref2/mitlauf2.mjs <a.png> <b.png> <schritt> [x y b h]
import { grau, blockschub, hochpass, stdabw, fenster } from './mess/lib.mjs';

const A = process.argv[2], B = process.argv[3];
const SCHRITT = Number(process.argv[4]);
const X = Number(process.argv[5] ?? 1000), Y = Number(process.argv[6] ?? 250);
const BW = Number(process.argv[7] ?? 320), BH = Number(process.argv[8] ?? 320);

const a = await grau(A), b = await grau(B);
// Erst pruefen, ob das Fenster ueberhaupt Gewebe enthaelt.
const hpA = hochpass(a.g, a.b, a.h, 7);
const belegt = stdabw(fenster(hpA, a.b, a.h, X, Y, BW, BH));
console.log(`fenster ${X},${Y},${BW},${BH}  hochpass-streuung ${belegt.toFixed(2)}` +
  (belegt < 2 ? '   ACHTUNG FENSTER FAST LEER' : ''));

const r = blockschub(a.g, a.b, a.h, b.g, b.b, b.h, X, Y, BW, BH, Math.min(180, SCHRITT));
console.log(`  verschiebung dy ${r.dy.toFixed(2)} px, dx ${r.dx.toFixed(2)} px, korr ${r.korr.toFixed(3)}` +
  (r.rand ? '   ACHTUNG AM SUCHRAND' : ''));
console.log(`  mitlauf = ${Math.abs(r.dy / SCHRITT).toFixed(3)} bei schritt ${SCHRITT}`);
