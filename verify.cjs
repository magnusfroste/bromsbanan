/* verify.cjs – räknar om Bromsbanans fysik oberoende av data.js och kontrollerar
 * frågor, svarsalternativ, texter och röstfiler.  node verify.cjs  */
'use strict';

require('./public/data.js');
const B = globalThis.BROMS;

const G = 9.81, MU = { torr: 0.8, blot: 0.5 };
let fel = 0;
function kolla(villkor, text) {
  if (!villkor) { fel++; console.log('FEL:', text); }
}

/* oberoende omräkning */
function broms(kmh, vag) {
  const v = kmh / 3.6;
  return (v * v) / (2 * MU[vag] * G);
}
function reaktion(kmh) { return (kmh / 3.6) * 1.0; }

const fragor = B.FRÅGOR;
kolla(fragor.length === 15, 'antal frågor ' + fragor.length + ' != 15');
kolla(B.NIVÅER.length === 3, 'antal nivåer');

const perNiva = { 1: [], 2: [], 3: [] };
fragor.forEach(q => perNiva[q.nivå].push(q));
Object.keys(perNiva).forEach(n => kolla(perNiva[n].length === 5, 'nivå ' + n + ' har ' + perNiva[n].length));

const siffror = ['noll', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio',
  'elva', 'tolv', 'tretton', 'fjorton', 'femton', 'sexton', 'sjutton', 'arton', 'nitton', 'tjugo',
  'tjugoett', 'tjugotvå', 'tjugotre', 'tjugofyra', 'tjugofem', 'tjugosex', 'tjugosju', 'tjugoåtta', 'tjugonio',
  'trettio', 'trettioett', 'trettiotvå', 'trettiotre', 'trettiofyra', 'trettiofem', 'trettiossex', 'trettiosju', 'trettioåtta', 'trettionio',
  'fyrtio', 'fyrtioett', 'fyrtiotvå', 'fyrtiotre', 'fyrtiofyra', 'fyrtiofem', 'fyrtiossex', 'fyrtiosju', 'fyrtioåtta', 'fyrtionio',
  'femtio', 'femtioett', 'femtiotvå', 'femtiotre', 'femtiofyra', 'femtiofem', 'femtiossex', 'femtiosju', 'femtioåtta', 'femtionio',
  'sextio', 'sextioett', 'sextiotvå', 'sextiotre', 'sextiofyra', 'sextiofem', 'sextiossex', 'sextiosju', 'sextioåtta', 'sextionio',
  'sjuttio', 'sjuttioett', 'sjuttiotvå', 'sjuttiotre', 'sjuttiofyra', 'sjuttiofem', 'sjuttiossex', 'sjuttiosju', 'sjuttioåtta', 'sjuttionio',
  'åttio', 'åttioett', 'åttiotvå', 'åttiotre', 'åttiofyra', 'åttiofem', 'åttiossex', 'åttiosju', 'åttioåtta', 'åttionio',
  'nittio', 'nittioett', 'nittiotvå', 'nittiotre', 'nittiofyra', 'nittiofem', 'nittiossex', 'nittiosju', 'nittioåtta', 'nittionio'];
kolla(siffror.length === 100, 'tabellen har ' + siffror.length + ' tal');
const ord = n => siffror[Math.round(n)];

fragor.forEach(q => {
  const b = broms(q.kmh, q.vag);
  const r = q.reaktion ? reaktion(q.kmh) : 0;
  /* delarna avrundas var för sig – det är så appen skriver ut räkningen */
  const ratt = Math.round(b) + Math.round(r);
  const namn = 'nivå ' + q.nivå + ' ' + q.kmh + ' km/h';

  kolla(q.ratt === ratt, namn + ': rätt svar ' + q.ratt + ' != omräknat ' + ratt);
  kolla(Math.abs(q.broms - b) < 0.15, namn + ': bromssträcka avviker');
  kolla(q.reaktion === (q.nivå === 3), namn + ': reaktionsflaggan');
  kolla(q.vag === B.NIVÅER[q.nivå - 1].vag, namn + ': väglag');

  /* alternativ */
  kolla(q.alternativ.length === 3, namn + ': ' + q.alternativ.length + ' alternativ');
  kolla(new Set(q.alternativ).size === 3, namn + ': dubbla alternativ ' + q.alternativ);
  kolla(q.alternativ.every(x => x > 0 && x <= 100), namn + ': alternativ utanför 0–100 m ' + q.alternativ);
  kolla(q.alternativ.filter(x => x === ratt).length === 1, namn + ': rätt svar saknas/dubbelt');
  kolla(q.alternativ.every(x => x === ratt || Math.abs(x - ratt) >= Math.max(2, ratt * 0.25)), namn + ': för snarlika alternativ ' + q.alternativ);
  const felaktiga = q.alternativ.filter(x => x !== ratt);
  kolla(felaktiga.every(x => Math.round(x) !== Math.round(b + r)), namn + ': felkort med rätt värde');

  /* frågetext */
  kolla(q.fraga.indexOf(String(q.kmh)) >= 0, namn + ': hastigheten står inte i frågan');
  kolla(q.fraga.indexOf(q.vag === 'blot' ? 'blöt asfalt' : 'torr asfalt') >= 0, namn + ': väglaget står inte i frågan');
  kolla(q.fraga.indexOf(String(ratt) + ' meter') < 0, namn + ': svaret står i frågan');
  kolla(q.fraga.endsWith('?'), namn + ': frågan slutar inte med frågetecken');

  /* svarstext */
  kolla(q.svar.indexOf(ord(ratt) + ' meter') === 0, namn + ': svaret börjar inte med "' + ord(ratt) + ' meter" (' + q.svar + ')');
  if (q.reaktion) {
    kolla(q.svar.indexOf(ord(Math.round(r)) + ' meter innan bromsen tar') >= 0, namn + ': reaktionssträckan nämns inte');
    kolla(q.svar.indexOf(ord(Math.round(b)) + ' meter bromssträcka') >= 0, namn + ': bromssträckan nämns inte');
    kolla(Math.round(r) + Math.round(b) === ratt, namn + ': reaktion + broms != stoppsträcka');
  }
});

/* fysikens ordning: längre hastighet ger längre sträcka, blöt väg längre än torr */
[1, 2, 3].forEach(n => {
  const l = perNiva[n];
  for (let i = 1; i < l.length; i++) {
    kolla(l[i].ratt > l[i - 1].ratt, 'nivå ' + n + ': ' + l[i].kmh + ' km/h kortare än ' + l[i - 1].kmh);
  }
});
[30, 50, 70, 80, 90].forEach(kmh => {
  const torr = perNiva[1].find(q => q.kmh === kmh).ratt;
  const blot = perNiva[2].find(q => q.kmh === kmh).ratt;
  const stopp = perNiva[3].find(q => q.kmh === kmh).ratt;
  kolla(blot > torr, kmh + ' km/h: blöt väg kortare än torr');
  kolla(stopp > torr, kmh + ' km/h: stoppsträcka kortare än bromssträcka');
});
/* dubblering av hastigheten ger ungefär fyrdubbling (v²) */
const f30 = perNiva[1].find(q => q.kmh === 30).ratt;
const f60 = broms(60, 'torr');
kolla(f60 / f30 > 3.5 && f60 / f30 < 4.5, 'v²-sambandet: 60/30 ger ' + (f60 / f30).toFixed(2));

/* röstfiler */
let lines = {};
try {
  const kod = require('fs').readFileSync('./public/ljud/lines.js', 'utf8');
  const m = kod.match(/window\.__ROST\s*=\s*([\s\S]*);\s*$/);
  lines = JSON.parse(m[1]);
} catch (e) {
  kolla(false, 'ljud/lines.js går inte att läsa: ' + e.message);
}
const sagt = [];
fragor.forEach(q => { sagt.push(q.fraga); sagt.push(q.svar); });
sagt.push('Nivå 1 klar.', 'Nivå 2 klar.', 'Alla tre nivåerna är klara.');
let saknas = 0;
sagt.forEach(s => {
  if (!lines[s]) { saknas++; console.log('SAKNAR RÖST:', s); }
});
kolla(saknas === 0, saknas + ' meningar utan mp3');
kolla(sagt.filter(s => s.endsWith('?')).length === 15, 'antal frågor med röst');
kolla(Object.keys(lines).length >= sagt.length, 'lines.js har ' + Object.keys(lines).length + ' nycklar för ' + sagt.length + ' meningar');

/* filerna finns på disk */
const fs = require('fs');
Object.keys(lines).forEach(t => {
  const p = './public/ljud/' + lines[t] + '.mp3';
  if (!fs.existsSync(p) || fs.statSync(p).size < 400) { fel++; console.log('FEL: tom eller saknad fil', p, t); }
});

console.log(fel === 0 ? 'OK: 0 fel (' + fragor.length + ' frågor, ' + sagt.length + ' meningar, ' + Object.keys(lines).length + ' röstfiler)' : fel + ' FEL');
process.exit(fel ? 1 : 0);
