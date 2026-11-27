/* Bromsbanan – data.js
 * Fysikmodellen är enkel och redovisas i appen:
 *   bromssträcka = v² / (2 · µ · g)      v i m/s, g = 9,81 m/s²
 *   reaktionssträcka = v · 1,0 s
 * µ = 0,8 torr asfalt, µ = 0,5 blöt asfalt (typvärden för personbilsdäck).
 * Kontroll: 50 km/h torr väg ger 13,9 m reaktion + 12,4 m broms = 26 m,
 * vilket stämmer med Trafikverkets tabell för stoppsträcka (ca 27 m).
 */
(function (root) {
  'use strict';

  var G = 9.81;
  var REAKTIONSTID = 1.0;
  var VAG = {
    torr: { my: 0.8, namn: 'torr asfalt' },
    blot: { my: 0.5, namn: 'blöt asfalt' }
  };

  function mps(kmh) { return kmh / 3.6; }
  function bromssträcka(kmh, vag) { var v = mps(kmh); return v * v / (2 * VAG[vag].my * G); }
  function reaktionssträcka(kmh) { return mps(kmh) * REAKTIONSTID; }

  var TAL = ['noll', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio',
    'elva', 'tolv', 'tretton', 'fjorton', 'femton', 'sexton', 'sjutton', 'arton', 'nitton', 'tjugo'];
  var TIO = ['', '', 'tjugo', 'trettio', 'fyrtio', 'femtio', 'sextio', 'sjuttio', 'åttio', 'nittio'];

  function ord(n) {
    n = Math.round(n);
    if (n < 0) return 'minus ' + ord(-n);
    if (n <= 20) return TAL[n];
    if (n < 100) {
      var ti = Math.floor(n / 10), en = n % 10;
      return TIO[ti] + (en ? TAL[en] : '');
    }
    var hundra = Math.floor(n / 100), rest = n % 100;
    var s = TAL[hundra] + 'hundra';
    if (rest) s += (rest < 20 ? '' : '') + ord(rest);
    return s;
  }

  var NIVÅER = [
    { nr: 1, namn: 'Torr väg', vag: 'torr', reaktion: false, intro: 'torr asfalt', hastigheter: [30, 50, 70, 80, 90] },
    { nr: 2, namn: 'Blöt väg', vag: 'blot', reaktion: false, intro: 'blöt asfalt', hastigheter: [30, 50, 70, 80, 90] },
    { nr: 3, namn: 'Med reaktionstid', vag: 'torr', reaktion: true, intro: 'reaktionstiden', hastigheter: [30, 50, 70, 80, 90] }
  ];

  function avrunda(x) { return Math.round(x); }

  function byggFråga(nivå, kmh) {
    var broms = bromssträcka(kmh, nivå.vag);
    var reaktion = nivå.reaktion ? reaktionssträcka(kmh) : 0;
    /* avrunda delarna först: texten säger "8 meter + 4 meter", alltså måste summan bli 12 */
    var bromsR = avrunda(broms);
    var reaktionR = avrunda(reaktion);
    var ratt = nivå.reaktion ? bromsR + reaktionR : bromsR;
    var fel = [];
    if (nivå.reaktion) {
      fel.push(bromsR);                         /* glömde reaktionstiden */
      fel.push(avrunda(ratt * 1.35));
    } else if (nivå.vag === 'blot') {
      fel.push(avrunda(bromssträcka(kmh, 'torr')));  /* torr väg – vanligaste felet */
      fel.push(avrunda(broms * 1.35));
    } else {
      fel.push(avrunda(broms / 2));
      fel.push(avrunda(broms * 1.5));
    }
    var alt = [ratt].concat(fel);
    /* unika, positiva, sorterade – rätt svar ligger kvar på sin plats */
    var sedda = {};
    alt = alt.filter(function (x) {
      if (x <= 0 || sedda[x]) return false;
      sedda[x] = 1; return true;
    });
    while (alt.length < 3) {
      var kandidat = ratt + 3 * alt.length;
      if (!sedda[kandidat]) { sedda[kandidat] = 1; alt.push(kandidat); }
    }
    var blandad = alt.slice();
    /* deterministisk blandning: rätt svar hamnar på olika plats per fråga */
    var nyckel = (kmh + nivå.nr * 7) % 3;
    blandad.splice(blandad.indexOf(ratt), 1);
    blandad.splice(nyckel, 0, ratt);

    var fraga;
    if (nivå.reaktion) {
      fraga = 'Bilen kör ' + kmh + ' kilometer i timmen på torr asfalt. Föraren reagerar på en sekund. Hur lång blir hela stoppsträckan?';
    } else if (nivå.vag === 'blot') {
      fraga = 'Bilen kör ' + kmh + ' kilometer i timmen på blöt asfalt. Hur lång blir bromssträckan?';
    } else {
      fraga = 'Bilen kör ' + kmh + ' kilometer i timmen på torr asfalt. Hur lång blir bromssträckan?';
    }

    var svar;
    if (nivå.reaktion) {
      svar = ord(ratt) + ' meter. ' + ord(reaktionR) + ' meter innan bromsen tar och ' +
        ord(bromsR) + ' meter bromssträcka.';
    } else {
      svar = ord(ratt) + ' meter bromssträcka.';
    }

    return {
      kmh: kmh, nivå: nivå.nr, vag: nivå.vag, reaktion: nivå.reaktion,
      broms: Math.round(broms * 10) / 10,
      reaktionM: Math.round(reaktion * 10) / 10,
      ratt: ratt,
      alternativ: blandad,
      fraga: fraga,
      svar: svar
    };
  }

  var FRÅGOR = [];
  NIVÅER.forEach(function (nivå) {
    nivå.hastigheter.forEach(function (kmh) { FRÅGOR.push(byggFråga(nivå, kmh)); });
  });

  root.BROMS = {
    G: G, REAKTIONSTID: REAKTIONSTID, VAG: VAG, NIVÅER: NIVÅER, FRÅGOR: FRÅGOR,
    bromssträcka: bromssträcka, reaktionssträcka: reaktionssträcka,
    ord: ord, byggFråga: byggFråga
  };
})(typeof window !== 'undefined' ? window : globalThis);
