/* Bromsbanan – app.js */
(function () {
  'use strict';

  var P = { papper: '#FBF7EF', papper2: '#F2EBDC', black: '#2E2A26', accent: '#1F6FB2',
    guld: '#F2B01E', gron: '#3E8E5A', rod: '#C4453C', kotte: '#A9693C', kotteMörk: '#7E4B27',
    vag: '#4A4744', vagKant: '#5C5854' };

  var B = window.BROMS;
  var MAXM = 100;              /* vägens skala: alltid 0–100 m */
  var PER_NIVA = 5;

  var S = {
    niva: 1, i: 0, lage: 'start', ljud: true,
    fragor: [], stjarnor: [0, 0, 0], ratt: null, vald: null,
    pos: 0, stopp: null, anim: null, fel: 0
  };

  var duk = document.getElementById('duk');
  var ctx = duk.getContext('2d');
  var fragText = document.getElementById('fragText');
  var svarText = document.getElementById('svarText');
  var valBox = document.getElementById('val');
  var hud = document.getElementById('hud');
  var spel = document.getElementById('spel');
  var startskarm = document.getElementById('startskarm');
  var ruta = document.getElementById('ruta');
  var rutaText = document.getElementById('rutaText');
  var rutaSiffra = document.getElementById('rutaSiffra');
  var rutaKnapp = document.getElementById('rutaKnapp');
  var prickar = document.getElementById('prickar');
  var stjarnText = document.getElementById('stjarnText');
  var nivaKnapp = document.getElementById('nivaKnapp');
  var ljudKnapp = document.getElementById('ljud');
  var nastaKnapp = document.getElementById('nasta');

  var reducerad = false;
  try { reducerad = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function spår(ev, data) {
    try { if (window.skolappar && window.skolappar.event) window.skolappar.event(ev, data); } catch (e) {}
  }

  /* ---------------- ljud ---------------- */
  var ac = null;
  function blip(frekvens, längd, typ) {
    if (!S.ljud) return;
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = typ || 'sine';
      o.frequency.value = frekvens;
      g.gain.setValueAtTime(0.0001, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.16, ac.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + (längd || 0.18));
      o.connect(g); g.connect(ac.destination);
      o.start(); o.stop(ac.currentTime + (längd || 0.18) + 0.02);
    } catch (e) {}
  }

  function tala(text) {
    if (!S.ljud || !text) return;
    try { if (window.__rost && window.__rost(text)) return; } catch (e) {}
    try {
      if ('speechSynthesis' in window) {
        var u = new SpeechSynthesisUtterance(text);
        u.lang = 'sv-SE'; u.rate = 0.95; u.pitch = 1.02;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
    } catch (e) {}
  }

  /* ---------------- Kotten (SVG) ---------------- */
  function kottenSVG(mood) {
    var ögaV, ögaH, mun, armar;
    if (mood === 'glad') {
      ögaV = '<circle cx="52" cy="52" r="7.5" fill="#fff"/><circle cx="53.5" cy="53" r="3.6" fill="#2E2A26"/>';
      ögaH = '<circle cx="70" cy="52" r="7.5" fill="#fff"/><circle cx="68.5" cy="53" r="3.6" fill="#2E2A26"/>';
      mun = '<path d="M54 63 q8 9 16 0" stroke="#2E2A26" stroke-width="3" fill="none" stroke-linecap="round"/>';
      armar = '<path d="M32 88 q-12 -8 -14 -18" stroke="#7E4B27" stroke-width="6" fill="none" stroke-linecap="round"/>' +
              '<path d="M88 88 q12 -8 14 -18" stroke="#7E4B27" stroke-width="6" fill="none" stroke-linecap="round"/>';
    } else if (mood === 'orolig') {
      ögaV = '<circle cx="52" cy="53" r="7" fill="#fff"/><circle cx="54" cy="54" r="3.4" fill="#2E2A26"/>';
      ögaH = '<circle cx="70" cy="53" r="7" fill="#fff"/><circle cx="68" cy="54" r="3.4" fill="#2E2A26"/>';
      mun = '<ellipse cx="61" cy="66" rx="4.5" ry="5" fill="#2E2A26" opacity=".8"/>';
      armar = '<path d="M34 92 q-10 4 -12 12" stroke="#7E4B27" stroke-width="6" fill="none" stroke-linecap="round"/>' +
              '<path d="M86 92 q10 4 12 12" stroke="#7E4B27" stroke-width="6" fill="none" stroke-linecap="round"/>';
    } else if (mood === 'firar') {
      ögaV = '<path d="M45 53 q7 -8 14 0" stroke="#2E2A26" stroke-width="3.4" fill="none" stroke-linecap="round"/>';
      ögaH = '<path d="M63 53 q7 -8 14 0" stroke="#2E2A26" stroke-width="3.4" fill="none" stroke-linecap="round"/>';
      mun = '<path d="M52 62 q9 12 18 0" stroke="#2E2A26" stroke-width="3.4" fill="none" stroke-linecap="round"/>';
      armar = '<path d="M30 82 q-14 -14 -10 -26" stroke="#7E4B27" stroke-width="6" fill="none" stroke-linecap="round"/>' +
              '<path d="M90 82 q14 -14 10 -26" stroke="#7E4B27" stroke-width="6" fill="none" stroke-linecap="round"/>';
    } else if (mood === 'tanker') {
      ögaV = '<circle cx="52" cy="52" r="7" fill="#fff"/><circle cx="55" cy="50" r="3.4" fill="#2E2A26"/>';
      ögaH = '<circle cx="70" cy="52" r="7" fill="#fff"/><circle cx="73" cy="50" r="3.4" fill="#2E2A26"/>';
      mun = '<path d="M55 65 h11" stroke="#2E2A26" stroke-width="3" stroke-linecap="round"/>';
      armar = '<path d="M34 92 q-8 6 -6 14" stroke="#7E4B27" stroke-width="6" fill="none" stroke-linecap="round"/>' +
              '<path d="M86 92 q10 -2 12 -10" stroke="#7E4B27" stroke-width="6" fill="none" stroke-linecap="round"/>';
    } else {
      ögaV = '<circle cx="52" cy="52" r="7.5" fill="#fff"/><circle cx="53" cy="53" r="3.6" fill="#2E2A26"/>';
      ögaH = '<circle cx="70" cy="52" r="7.5" fill="#fff"/><circle cx="69" cy="53" r="3.6" fill="#2E2A26"/>';
      mun = '<path d="M55 64 q6 6 12 0" stroke="#2E2A26" stroke-width="3" fill="none" stroke-linecap="round"/>';
      armar = '<path d="M33 92 q-9 4 -10 11" stroke="#7E4B27" stroke-width="6" fill="none" stroke-linecap="round"/>' +
              '<path d="M87 92 q9 4 10 11" stroke="#7E4B27" stroke-width="6" fill="none" stroke-linecap="round"/>';
    }
    return '<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<ellipse cx="60" cy="104" rx="31" ry="33" fill="' + P.kotte + '"/>' +
      '<path d="M33 96 q27 12 54 0 M31 108 q29 13 58 0 M35 120 q25 11 50 0" stroke="' + P.kotteMörk + '" stroke-width="2.4" fill="none" opacity=".55" stroke-linecap="round"/>' +
      armar +
      '<circle cx="60" cy="52" r="26" fill="' + P.kotte + '"/>' +
      '<path d="M40 34 q20 -12 40 0" stroke="' + P.kotteMörk + '" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>' +
      ögaV + ögaH + mun +
      '<path d="M52 78 q8 6 16 0" stroke="' + P.kotteMörk + '" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/>' +
      '</svg>';
  }

  document.getElementById('startkotte').innerHTML = kottenSVG('glad');
  document.getElementById('rutaKotte').innerHTML = kottenSVG('firar');

  /* ---------------- ritteknik ---------------- */
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  var mått = { w: 0, h: 0, padL: 42, padR: 22, roadTop: 0, roadH: 0 };

  function storlek() {
    var box = document.getElementById('scen').getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(240, Math.round(box.width));
    var h = Math.max(90, Math.round(box.height));
    duk.width = Math.round(w * dpr);
    duk.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mått.w = w; mått.h = h;
    mått.padL = w < 480 ? 30 : 42;
    mått.padR = w < 480 ? 16 : 22;
    mått.roadH = Math.max(38, Math.min(h * 0.46, h - 46));
    mått.roadTop = Math.max(28, (h - mått.roadH) * 0.66);
    rita();
  }

  function xAv(m) {
    var span = mått.w - mått.padL - mått.padR;
    return mått.padL + (Math.min(Math.max(m, 0), MAXM) / MAXM) * span;
  }

  function ritaBil(x, y, s) {
    var c = ctx;
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    /* kaross */
    c.fillStyle = P.accent;
    rr(c, -34, -14, 68, 20, 7); c.fill();
    /* hytt */
    c.fillStyle = '#2E6EA6';
    rr(c, -14, -26, 34, 15, 6); c.fill();
    /* fönster */
    c.fillStyle = '#DCEAF4';
    rr(c, -10, -23, 12, 9, 3); c.fill();
    rr(c, 5, -23, 11, 9, 3); c.fill();
    /* lykta */
    c.fillStyle = '#F6D37A';
    rr(c, 30, -10, 5, 6, 2); c.fill();
    /* hjul */
    c.fillStyle = '#2E2A26';
    c.beginPath(); c.arc(-20, 8, 8, 0, 7); c.fill();
    c.beginPath(); c.arc(20, 8, 8, 0, 7); c.fill();
    c.fillStyle = '#B9B3A6';
    c.beginPath(); c.arc(-20, 8, 3.4, 0, 7); c.fill();
    c.beginPath(); c.arc(20, 8, 3.4, 0, 7); c.fill();
    c.restore();
  }

  function rita() {
    if (!mått.w) return;
    var c = ctx, w = mått.w, h = mått.h;
    c.clearRect(0, 0, w, h);
    c.fillStyle = P.papper2;
    c.fillRect(0, 0, w, h);

    /* skala över vägen */
    var ySkala = mått.roadTop - 14;
    c.strokeStyle = '#C9BEA8';
    c.lineWidth = 1;
    c.beginPath(); c.moveTo(mått.padL, ySkala); c.lineTo(w - mått.padR, ySkala); c.stroke();
    c.fillStyle = '#6E675C';
    c.font = (w < 520 ? '10px' : '11px') + ' system-ui, sans-serif';
    c.textAlign = 'center';
    for (var m = 0; m <= MAXM; m += 10) {
      var x = xAv(m);
      c.strokeStyle = '#C9BEA8';
      c.beginPath(); c.moveTo(x, ySkala - (m % 50 === 0 ? 6 : 3)); c.lineTo(x, ySkala); c.stroke();
      if (m % 20 === 0) c.fillText(String(m), x, ySkala - 8);
    }
    c.textAlign = 'left';
    c.fillText('meter', w - mått.padR - 30, ySkala - 8);

    /* vägen */
    c.fillStyle = P.vag;
    c.fillRect(0, mått.roadTop, w, mått.roadH);
    c.fillStyle = P.vagKant;
    c.fillRect(0, mått.roadTop, w, 3);
    c.fillRect(0, mått.roadTop + mått.roadH - 3, w, 3);

    /* mittlinje */
    c.strokeStyle = 'rgba(255,255,255,.55)';
    c.lineWidth = 2;
    c.setLineDash([14, 12]);
    c.beginPath();
    c.moveTo(0, mått.roadTop + mått.roadH * 0.5);
    c.lineTo(w, mått.roadTop + mått.roadH * 0.5);
    c.stroke();
    c.setLineDash([]);

    var bilY = mått.roadTop + mått.roadH * 0.78;
    var skalaBil = Math.max(0.7, Math.min(2.4, mått.roadH / 62));

    /* bromsspår efter svaret */
    if (S.stopp != null) {
      c.strokeStyle = 'rgba(30,28,26,.55)';
      c.lineWidth = 2;
      c.setLineDash([5, 6]);
      c.beginPath();
      c.moveTo(xAv(0), bilY + 16);
      c.lineTo(xAv(S.stopp), bilY + 16);
      c.stroke();
      c.setLineDash([]);
      /* stoppmarkering */
      var xs = xAv(S.stopp);
      c.strokeStyle = P.guld;
      c.lineWidth = 3;
      c.beginPath(); c.moveTo(xs, mått.roadTop - 2); c.lineTo(xs, mått.roadTop + mått.roadH); c.stroke();
      c.fillStyle = '#8A6A12';
      c.font = 'bold ' + (w < 520 ? '13px' : '16px') + ' system-ui, sans-serif';
      c.textAlign = xs > w - 70 ? 'right' : 'center';
      c.fillText(S.stopp + ' m', xs + (xs > w - 70 ? -4 : 0), mått.roadTop + mått.roadH - 8);
      c.textAlign = 'left';
    }

    ritaBil(xAv(S.pos), bilY, skalaBil);
  }

  /* ---------------- spellogik ---------------- */
  function nivaFragor(n) {
    return B.FRÅGOR.filter(function (q) { return q.nivå === n; }).slice(0, PER_NIVA);
  }

  function uppdateraHud() {
    stjarnText.textContent = String(S.stjarnor[S.niva - 1]);
    nivaKnapp.textContent = 'Nivå ' + S.niva;
    var html = '';
    for (var k = 0; k < PER_NIVA; k++) html += '<i class="' + (k < S.i ? 'klar' : '') + '"></i>';
    prickar.innerHTML = html;
  }

  function visaFraga() {
    var q = S.fragor[S.i];
    S.lage = 'fraga';
    S.vald = null;
    S.ratt = q.ratt;
    S.stopp = null;
    S.anim = null;
    S.pos = 0;
    fragText.textContent = q.fraga;
    svarText.textContent = '';
    nastaKnapp.hidden = true;
    valBox.innerHTML = '';
    q.alternativ.forEach(function (tal, idx) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = tal + ' m';
      b.setAttribute('aria-label', tal + ' meter');
      b.addEventListener('click', function () { svara(idx); });
      valBox.appendChild(b);
    });
    uppdateraHud();
    rita();
    spår('round_start');
    tala(q.fraga);
  }

  function svara(idx) {
    if (S.lage !== 'fraga') return;
    var q = S.fragor[S.i];
    var knappar = Array.prototype.slice.call(valBox.children);
    var valt = q.alternativ[idx];
    var ratt = valt === q.ratt;
    S.lage = 'svar';
    S.vald = valt;
    knappar.forEach(function (b, k) {
      b.disabled = true;
      if (q.alternativ[k] === q.ratt) b.classList.add('rattsvar');
      else if (k === idx) b.classList.add('felsvar');
    });
    if (ratt) {
      S.stjarnor[S.niva - 1] += 1;
      blip(880, 0.16, 'sine');
      setTimeout(function () { blip(1180, 0.16, 'sine'); }, 120);
    } else {
      blip(220, 0.22, 'triangle');
      /* efter ett fel pulserar rätt bricka – två hints som säger samma sak */
      var rättKnapp = knappar.filter(function (b, k) { return q.alternativ[k] === q.ratt; })[0];
      if (rättKnapp && !reducerad) setTimeout(function () { rättKnapp.classList.add('puls'); }, 700);
      else if (rättKnapp) rättKnapp.style.boxShadow = '0 0 0 4px rgba(31,111,178,.35)';
    }
    uppdateraHud();
    spår('round_done', Math.round((S.stjarnor[S.niva - 1] / PER_NIVA) * 100));

    /* bilen kör och bromsar in på det rätta avståndet */
    var start = performance.now();
    var dur = reducerad ? 200 : 1250;
    S.anim = { t0: start, dur: dur, till: q.ratt };
    if (reducerad) { S.pos = q.ratt; S.stopp = q.ratt; rita(); visaSvar(q); }
  }

  function visaSvar(q) {
    svarText.textContent = q.svar;
    nastaKnapp.hidden = false;
    tala(q.svar);
  }

  function steg(nu) {
    if (!S.anim) return;
    var t = (nu - S.anim.t0) / S.anim.dur;
    if (t >= 1) t = 1;
    /* inbromsning: hastigheten avtar linjärt → sträckan går som 1-(1-t)^2 */
    var e = 1 - (1 - t) * (1 - t);
    S.pos = S.anim.till * e;
    if (t >= 1) {
      S.pos = S.anim.till;
      S.stopp = S.anim.till;
      S.anim = null;
      visaSvar(S.fragor[S.i]);
    }
    rita();
  }

  function nasta() {
    if (S.lage !== 'svar') return;
    S.i += 1;
    if (S.i >= S.fragor.length) { avslutaNiva(); return; }
    visaFraga();
  }

  function avslutaNiva() {
    S.lage = 'slut';
    spel.hidden = true;
    ruta.hidden = false;
    var st = S.stjarnor[S.niva - 1];
    rutaSiffra.textContent = st + ' av ' + PER_NIVA + ' stjärnor';
    if (S.niva < 3) {
      rutaText.textContent = 'Nivå ' + S.niva + ' klar! Nu väntar ' + B.NIVÅER[S.niva].intro + '.';
      rutaKnapp.textContent = 'Nästa nivå →';
      rutaKnapp.style.width = 'auto';
      rutaKnapp.style.borderRadius = '16px';
      rutaKnapp.style.padding = '14px 26px';
      rutaKnapp.style.fontSize = '1.2rem';
      rutaKnapp.style.fontWeight = '700';
    } else {
      rutaText.textContent = 'Alla tre nivåer klara! Du kan räkna ut hur långt en bil hinner innan den stannar – på torr väg, på blöt väg och med reaktionstid.';
      rutaKnapp.textContent = '↻';
      rutaKnapp.style.width = '68px';
      rutaKnapp.style.borderRadius = '50%';
      rutaKnapp.style.padding = '0';
      rutaKnapp.style.fontSize = '1.5rem';
    }
    tala(S.niva < 3 ? 'Nivå ' + S.niva + ' klar.' : 'Alla tre nivåerna är klara.');
    spår('level', S.niva);
  }

  function startaNiva(n) {
    S.niva = Math.min(3, Math.max(1, n));
    S.fragor = nivaFragor(S.niva);
    S.i = 0;
    S.stjarnor[S.niva - 1] = 0;
    ruta.hidden = true;
    startskarm.hidden = true;
    hud.hidden = false;
    spel.hidden = false;
    storlek();
    visaFraga();
  }

  /* ---------------- händelser ---------------- */
  document.getElementById('spela').addEventListener('click', function () {
    startaNiva(1);
  });
  nastaKnapp.addEventListener('click', nasta);
  nivaKnapp.addEventListener('click', function () {
    startaNiva(S.niva >= 3 ? 1 : S.niva + 1);
  });
  ljudKnapp.addEventListener('click', function () {
    S.ljud = !S.ljud;
    ljudKnapp.textContent = S.ljud ? '🔊' : '🔇';
    ljudKnapp.setAttribute('aria-pressed', S.ljud ? 'true' : 'false');
    ljudKnapp.setAttribute('aria-label', S.ljud ? 'Stäng av ljudet' : 'Sätt på ljudet');
    if (!S.ljud) {
      try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
      try { window.__rostStopp && window.__rostStopp(); } catch (e) {}
      spår('sound_off');
    }
  });
  rutaKnapp.addEventListener('click', function () {
    startaNiva(S.niva < 3 ? S.niva + 1 : 1);
  });
  window.addEventListener('resize', storlek);
  window.addEventListener('orientationchange', function () { setTimeout(storlek, 250); });

  /* rAF + watchdog: fliken kan tappa frames i en förhandsvisning */
  var senaste = 0;
  function ram(nu) { senaste = nu; steg(nu); requestAnimationFrame(ram); }
  requestAnimationFrame(ram);
  setInterval(function () {
    /* ingen klocka som kan dra här – bara animeringen som ska bli klar,
       så watchdogen får gå även i en dold flik/förhandsvisning */
    var nu = performance.now();
    if (nu - senaste > 320) { senaste = nu; steg(nu); }
  }, 100);

  storlek();

  window.__game = { S: S, startaNiva: startaNiva, svara: svara, nasta: nasta, steg: steg,
    rita: rita, fraga: function () { return S.fragor[S.i]; } };
})();
