// Audio de Thalyria (Web Audio, todo sintetizado): música por zona, combate, jefes, tema del grupo y efectos.
// Dos buses (música / efectos) con volumen en Opciones. El audio arranca con la primera interacción del jugador.
(function () {
  'use strict';
  const TH = window.TH;
  const TRI = { M: [0, 4, 7], m: [0, 3, 7], d: [0, 3, 6], s: [0, 5, 7], M7: [0, 4, 7, 11], m7: [0, 3, 7, 10], D7: [0, 4, 7, 10] };

  // Melodías: 16 pasos por compás. número = semitonos sobre la raíz, '.' = silencio, '-' = mantener la nota anterior.
  // Tema del grupo (leitmotiv): suena en el título, en el amanecer final y en los créditos; el jefe final lo cita en su última fase.
  const GRUPO = '12 - - 14 16 - 19 - 21 - 19 - 16 - 14 - | 17 - - 16 14 - 12 - 14 - - - . . 7 - | 12 - - 14 16 - 19 - 24 - 23 - 21 - 19 - | 21 - 19 - 17 - 16 - 14 - - - 12 - - -';
  const T = {
    // ---- zonas ----
    vael: { bpm: 92, root: 50, prog: [[0, 'M'], [5, 'M'], [9, 'm'], [7, 'M']], bass: 'r . . . 5 . . . r . . . 5 . o .', arp: '0 1 2 1 0 1 2 1 0 1 2 1 0 1 2 1', aw: 'triangle', av: 0.06,
      lead: '16 - - 14 12 - 14 - 16 - 19 - 16 - - - | 17 - - 16 14 - 12 - 9 - - - . . . . | 16 - - 14 12 - 14 - 16 - 19 - 21 - - - | 19 - 17 - 16 - 14 - 12 - - - . . . .', lw: 'triangle', lv: 0.13, drum: 'k-------s-------k---k---s-------', pad: 0.035 },
    cabo: { bpm: 104, root: 52, prog: [[0, 'M'], [7, 'M'], [9, 'm'], [5, 'M']], bass: 'r . r . 5 . r . r . r . 5 . o .', arp: '0 2 1 2 0 2 1 2 0 2 1 2 0 2 1 2', aw: 'square', av: 0.035,
      lead: '19 - 21 - 23 - 19 - 16 - - - 14 - 16 - | 19 - 21 - 23 - 26 - 23 - - - . . . . | 24 - 23 - 21 - 19 - 16 - 19 - 21 - - - | 19 - - - 16 - 14 - 12 - - - . . . .', lw: 'triangle', lv: 0.12, drum: 'k---h---s---h-h-k---h---s---h---', pad: 0.03 },
    gruta: { bpm: 70, root: 45, prog: [[0, 'm'], [8, 'M'], [0, 'm'], [7, 'M']], bass: 'r . . . . . . . 5 . . . . . . .', arp: '0 . 2 . 1 . 2 . 0 . 2 . 3 . 2 .', aw: 'sine', av: 0.07,
      lead: '. . . . 15 - - - 14 - - - 12 - - - | . . . . 11 - - - 12 - - - - - - - | . . . . 15 - - - 17 - - - 19 - - - | 20 - - - 19 - - - 15 - - - - - - -', lw: 'sine', lv: 0.1, drum: '', pad: 0.05 },
    arrecife: { bpm: 88, root: 53, prog: [[0, 'M7'], [5, 'M7'], [2, 'm7'], [7, 'M']], bass: 'r . . 5 . . r . . . 5 . . . o .', arp: '0 1 2 3 2 1 0 1 2 3 2 1 0 1 2 3', aw: 'sine', av: 0.07,
      lead: '16 - - - 19 - - - 23 - 21 - 19 - - - | 17 - - - 21 - - - 24 - - - . . . . | 16 - - - 19 - - - 23 - 21 - 19 - 16 - | 14 - - - 12 - - - 11 - - - 12 - - -', lw: 'triangle', lv: 0.11, drum: 'k-------h-------k---h---h-------', pad: 0.04 },
    bosque: { bpm: 96, root: 50, prog: [[0, 'm'], [10, 'M'], [8, 'M'], [10, 'M']], bass: 'r . . r . . 5 . r . . r . . 5 .', arp: '0 1 2 0 1 2 0 1 2 0 1 2 0 1 2 1', aw: 'triangle', av: 0.06,
      lead: '12 - 15 - 17 - 19 - 17 - 15 - 12 - - - | 10 - 14 - 17 - 22 - 20 - - - . . . . | 12 - 15 - 17 - 19 - 22 - 20 - 19 - - - | 17 - 15 - 14 - 10 - 12 - - - . . . .', lw: 'square', lv: 0.07, drum: 'k--k--s-k--k--s-', pad: 0.03 },
    ruinas: { bpm: 84, root: 48, prog: [[0, 'm'], [5, 'm'], [10, 'M'], [3, 'M']], bass: 'r . . . r . . . 5 . . . 5 . . .', arp: '0 2 1 2 0 2 1 2 3 2 1 2 0 2 1 2', aw: 'triangle', av: 0.05,
      lead: '15 - - - 14 - 12 - 10 - - - 12 - - - | 17 - - - 15 - 14 - 12 - - - . . . . | 15 - - - 17 - 19 - 22 - - - 20 - 19 - | 17 - - - 15 - - - 12 - - - . . . .', lw: 'triangle', lv: 0.11, drum: 'k-------s-----h-k-------s-------', pad: 0.04 },
    dorada: { bpm: 100, root: 53, prog: [[0, 'M'], [5, 'M'], [7, 'M'], [0, 'M']], bass: 'r . 5 . r . 5 . r . 5 . o . 5 .', arp: '0 1 2 3 0 1 2 3 0 1 2 3 0 1 2 3', aw: 'square', av: 0.03,
      lead: '24 - - 19 21 - 23 - 24 - - - 28 - - - | 26 - - 24 23 - 21 - 19 - - - . . . . | 24 - - 19 21 - 23 - 24 - 28 - 31 - - - | 29 - 28 - 26 - 23 - 24 - - - . . . .', lw: 'sawtooth', lv: 0.06, drum: 'k---s---k-k-s---k---s---k-k-s-ss', pad: 0.04 },
    biblioteca: { bpm: 76, root: 52, prog: [[0, 'm7'], [5, 'm7'], [3, 'M7'], [7, 'D7']], bass: 'r . . . . . 5 . r . . . . . 5 .', arp: '0 1 2 3 1 2 3 2 0 1 2 3 1 2 3 2', aw: 'sine', av: 0.07,
      lead: '. . 19 - 17 - 15 - 14 - - - 12 - - - | . . 17 - 15 - 14 - 12 - - - 11 - - - | . . 19 - 22 - 24 - 22 - - - 19 - - - | 17 - 15 - 14 - 11 - 12 - - - . . . .', lw: 'triangle', lv: 0.1, drum: '', pad: 0.045 },
    hondaroca: { bpm: 112, root: 45, prog: [[0, 'm'], [3, 'M'], [10, 'M'], [7, 'm']], bass: 'r r . r 5 . r . r r . r 5 . o .', arp: '0 . 2 . 1 . 2 . 0 . 2 . 1 . 2 .', aw: 'square', av: 0.04,
      lead: '12 - 12 - 15 - 17 - 19 - - - 17 - 15 - | 14 - 14 - 15 - 17 - 15 - - - . . . . | 12 - 12 - 15 - 17 - 19 - 22 - 24 - - - | 22 - 19 - 17 - 15 - 12 - - - . . . .', lw: 'square', lv: 0.07, drum: 'k-h-s-h-k-k-s-h-', pad: 0.025 },
    faro: { bpm: 80, root: 48, prog: [[0, 'M'], [9, 'm'], [5, 'M'], [7, 'M']], bass: 'r . . . . . 5 . r . . . . . o .', arp: '0 1 2 1 0 1 2 1 0 1 2 1 0 1 2 1', aw: 'triangle', av: 0.06,
      lead: '19 - - - 21 - 19 - 16 - - - 12 - - - | 21 - - - 19 - 17 - 16 - - - . . . . | 19 - - - 21 - 24 - 26 - - - 24 - 21 - | 19 - - - 17 - 16 - 14 - - - 12 - - -', lw: 'triangle', lv: 0.12, drum: 'k-------h-------', pad: 0.045 },
    congelada: { bpm: 66, root: 52, prog: [[0, 'm'], [8, 'M7'], [5, 'm'], [7, 's']], bass: 'r . . . . . . . . . . . . . . .', arp: '0 2 1 3 2 1 0 2 0 2 1 3 2 1 0 2', aw: 'sine', av: 0.06,
      lead: '. . . . 24 - - - 23 - - - 19 - - - | . . . . 20 - - - 19 - - - - - - - | . . . . 24 - - - 26 - - - 27 - - - | 26 - - - 24 - - - 23 - - - - - - -', lw: 'sine', lv: 0.09, drum: '', pad: 0.06 },
    motor: { bpm: 92, root: 47, prog: [[0, 'm'], [1, 'M'], [0, 'm'], [6, 'd']], bass: 'r . r . r . r . r . r . r . 5 .', arp: '0 2 1 2 0 2 1 2 0 2 1 2 0 2 1 2', aw: 'square', av: 0.035,
      lead: '12 - - - - - 13 - 12 - - - 10 - - - | 12 - - - - - 15 - 13 - - - . . . . | 12 - - - - - 13 - 15 - 18 - 17 - - - | 15 - 13 - 12 - 10 - 12 - - - . . . .', lw: 'triangle', lv: 0.1, drum: 'k-------k---h---', pad: 0.04 },
    abismo: { bpm: 60, root: 40, prog: [[0, 'm'], [1, 'M'], [0, 'm'], [11, 'd']], bass: 'r . . . . . . . r . . . . . . .', arp: '0 . . 2 . . 1 . . 2 . . 0 . . .', aw: 'sine', av: 0.07,
      lead: '. . . . . . . . 13 - - - 12 - - - | . . . . . . . . 11 - - - 12 - - - | . . . . 15 - - - 13 - - - 12 - - - | 11 - - - 13 - - - 12 - - - - - - -', lw: 'sine', lv: 0.1, drum: 'k---------------', pad: 0.06 },
    mar: { bpm: 108, root: 50, prog: [[0, 'M'], [7, 'M'], [5, 'M'], [7, 'M']], bass: 'r . . 5 . . r . r . . 5 . . o .', arp: '0 1 2 0 1 2 0 1 2 0 1 2 0 1 2 1', aw: 'triangle', av: 0.05,
      lead: GRUPO, lw: 'square', lv: 0.06, drum: 'k-----h-s-----h-k-----h-s---h-h-', pad: 0.03 },
    // ---- momentos ----
    // tensión en exploración: ostinato grave y tambores lejanos (el pueblo atacado, la ciudad en ruinas)
    alerta: { bpm: 118, root: 45, prog: [[0, 'm'], [0, 'm'], [8, 'M'], [7, 'M']], bass: 'r . r r . r r . r . r r . r o .', arp: '0 . 1 . 2 . 1 . 0 . 1 . 2 . 3 .', aw: 'square', av: 0.03,
      lead: '. . . . 12 - 15 - 14 - - - 12 - - - | . . . . 12 - 15 - 17 - - - 15 - 14 - | . . . . 20 - 19 - 17 - - - 15 - - - | 14 - - - 12 - - - 11 - - - - - - -', lw: 'sawtooth', lv: 0.05, drum: 'k-----k-s-------k-----k-s-----h-', pad: 0.03 },
    // amenaza: aparece el enemigo y habla (Matriarca, Varek, el Abisal). Lento, frigio, con tritono
    amenaza: { bpm: 70, root: 38, prog: [[0, 'm'], [1, 'M'], [0, 'm'], [6, 'd']], bass: 'r . . . . . . . r . . . . . r .', arp: '0 . . . 2 . . . 1 . . . 2 . . .', aw: 'sawtooth', av: 0.025,
      lead: '. . . . . . . . 13 - - - 12 - - - | . . . . . . . . 15 - - - 13 - 12 - | . . . . . . . . 18 - - - 17 - - - | 13 - - - 12 - - - - - - - - - - -', lw: 'triangle', lv: 0.09, drum: 'k---------------k-------------k-', pad: 0.06 },
    // acción: la crisis estalla (la ola negra, el mar que sube, la ola que arrastra a Varek)
    accion: { bpm: 158, root: 47, prog: [[0, 'm'], [3, 'M'], [5, 'm'], [7, 'D7']], bass: 'r r o r r r o r r r o r 5 5 o 5', arp: '0 1 2 1 0 1 2 1 0 1 2 1 0 1 2 3', aw: 'square', av: 0.03,
      lead: '24 - - - 22 - 24 - 27 - - - 26 - 24 - | 22 - - - 20 - 22 - 24 - - - . . . . | 24 - - - 22 - 24 - 27 - 29 - 31 - - - | 30 - 29 - 27 - 26 - 24 - - - . . . .', lw: 'sawtooth', lv: 0.055, drum: 'k-hsk-hsk-hsk-hsk-hsk-hskshsssss', pad: 0 },
    grupo: { bpm: 96, root: 50, prog: [[0, 'M'], [5, 'M'], [9, 'm'], [7, 'M']], bass: 'r . . 5 . . r . r . . 5 . . o .', arp: '0 1 2 3 2 1 0 1 0 1 2 3 2 1 0 1', aw: 'triangle', av: 0.05,
      lead: GRUPO, lw: 'triangle', lv: 0.14, drum: 'k-------s-------k---k---s-----h-', pad: 0.045 },
    triste: { bpm: 64, root: 45, prog: [[0, 'm'], [8, 'M'], [3, 'M'], [10, 'M']], bass: 'r . . . . . . . 5 . . . . . . .', arp: '0 1 2 1 0 1 2 1 0 1 2 1 0 1 2 1', aw: 'sine', av: 0.06,
      lead: '15 - - - 14 - 12 - 15 - - - 19 - - - | 20 - - - 19 - 15 - 12 - - - . . . . | 15 - - - 17 - 19 - 22 - - - 20 - 19 - | 17 - - - 15 - 14 - 12 - - - - - - -', lw: 'triangle', lv: 0.11, drum: '', pad: 0.05 },
    combate: { bpm: 150, root: 45, prog: [[0, 'm'], [3, 'M'], [7, 'm'], [5, 'm']], bass: 'r . r r 5 . 5 r r . r r 5 . o .', arp: '0 1 2 1 0 1 2 3 0 1 2 1 0 1 2 3', aw: 'square', av: 0.035,
      lead: '24 - - 22 24 - 27 - 26 - 24 - 22 - 19 - | 22 - - 20 22 - 26 - 24 - - - . . . . | 24 - - 22 24 - 27 - 29 - 27 - 26 - 24 - | 22 - 24 - 26 - 22 - 24 - - - . . . .', lw: 'square', lv: 0.07, drum: 'k-h-s-h-k-k-s-h-k-h-s-h-k-hss-h-', pad: 0 },
    jefe1: { bpm: 132, root: 40, prog: [[0, 'm'], [1, 'M'], [0, 'm'], [6, 'd']], bass: 'r r . r 5 . r . r r . r o . 5 .', arp: '0 1 2 1 0 1 2 3 0 1 2 1 3 2 1 0', aw: 'sawtooth', av: 0.03,
      lead: '24 - - - 25 - 24 - 22 - - - 19 - 20 - | 24 - - - 25 - 27 - 25 - - - . . . . | 24 - - - 25 - 24 - 22 - 27 - 28 - - - | 27 - 25 - 24 - 22 - 24 - - - . . . .', lw: 'sawtooth', lv: 0.06, drum: 'k--hs-h-k-khs-h-k--hs-h-kkkhs-hh', pad: 0.02 },
    jefe2: { bpm: 168, root: 41, prog: [[0, 'm'], [1, 'M'], [3, 'M'], [1, 'M']], bass: 'r r o r r r o r r r o r r r o r', arp: '0 1 2 3 0 1 2 3 0 1 2 3 0 1 2 3', aw: 'square', av: 0.035,
      lead: '24 27 31 - 25 29 32 - 27 - 31 29 27 25 24 - | 24 27 31 - 25 29 32 - 34 - 32 - 31 - - - | 24 27 31 - 25 29 32 - 27 - 31 29 27 25 24 - | 22 - 24 - 25 - 27 - 24 - - - . . . .', lw: 'sawtooth', lv: 0.06, drum: 'kkhskhshkkhskhshkkhskhshk-hsshss', pad: 0 },
    // jefe final: la última fase cita el tema del grupo sobre la percusión del jefe
    final: { bpm: 144, root: 50, prog: [[0, 'M'], [5, 'M'], [9, 'm'], [7, 'M']], bass: 'r r o r 5 r o r r r o r 5 r o r', arp: '0 1 2 3 0 1 2 3 0 1 2 3 0 1 2 3', aw: 'square', av: 0.035,
      lead: GRUPO, lw: 'sawtooth', lv: 0.07, drum: 'k-hsk-hsk-hskkhsk-hsk-hsk-hskshs', pad: 0.03 },
    victoria: { bpm: 140, root: 50, once: true, prog: [[0, 'M'], [5, 'M'], [7, 'M'], [0, 'M']], bass: 'r . . . r . . . r . . . r . . .', arp: '0 1 2 3 0 1 2 3 0 1 2 3 0 1 2 3', aw: 'square', av: 0.035,
      lead: '12 - 12 - 12 - 12 - 8 - - - 10 - - - | 12 - - 10 12 - - - . . . . . . . . | . . . . . . . . . . . . . . . . | . . . . . . . . . . . . . . . .', lw: 'square', lv: 0.1, drum: 'k-k-k-k-s---s---', pad: 0 },
  };
  // zona → pista
  const ZONE = { brumaSalada: 'vael', acantilados: 'vael', cabo: 'cabo', gruta: 'gruta', santuario: 'gruta', arrecife: 'arrecife', bosque: 'bosque', ruinas: 'ruinas', jardin: 'ruinas',
    ciudad: 'dorada', biblioteca: 'biblioteca', hondaroca: 'hondaroca', brumaInundada: 'triste', faroleros: 'faro', torre: 'faro', congelada: 'congelada', motor: 'motor', abismo: 'abismo' };
  const freq = (n) => 440 * Math.pow(2, (n - 69) / 12);
  const toks = (s) => (s || '').replace(/\|/g, ' ').split(/\s+/).filter(Boolean);
  // convierte una melodía de texto en eventos {n, d} por paso
  function melody(s) {
    const t = toks(s), out = new Array(t.length).fill(null);
    for (let i = 0; i < t.length; i++) {
      if (t[i] === '.' || t[i] === '-') continue;
      let d = 1; while (t[i + d] === '-') d++;
      out[i] = { n: +t[i], d };
    }
    return out;
  }
  function compile(D) {
    if (D._c) return D._c;
    const bars = D.prog.length, n = bars * 16, bass = [], arp = [], lead = melody(D.lead);
    const bp = toks(D.bass), ap = toks(D.arp);
    for (let i = 0; i < n; i++) {
      const [r, q] = D.prog[(i >> 4) % bars], ch = TRI[q], b = bp[i % 16], a = ap[i % 16];
      bass.push(b === 'r' ? r : b === '5' ? r + 7 : b === 'o' ? r + 12 : null);
      arp.push(a == null || a === '.' ? null : 12 + r + ch[(+a) % ch.length] + (+a >= ch.length ? 12 : 0));
    }
    return (D._c = { n, bass, arp, lead, pads: D.prog.map(([r, q]) => TRI[q].map((x) => 12 + r + x)) });
  }
  const load = () => { try { return JSON.parse(localStorage.getItem('thalyria.audio')) || {}; } catch (e) { return {}; } };

  const M = (TH.music = {
    ctx: null, mbus: null, sbus: null, cur: null, curName: null, pending: null, step: 0, next: 0, timer: 0, noise: null, zone: null, last: null,
    vol: Object.assign({ music: 0.7, sfx: 0.8 }, load()),
    get enabled() { return this.vol.music > 0; },
    init() {
      const unlock = () => { if (!this.ctx) this.start(); else if (this.ctx.state === 'suspended') this.ctx.resume(); };
      addEventListener('pointerdown', unlock, true);
      addEventListener('keydown', unlock, true);
      addEventListener('touchend', unlock, true);
      document.addEventListener('visibilitychange', () => { if (!this.ctx) return; if (document.hidden) this.ctx.suspend(); else this.ctx.resume(); });
    },
    start() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try { this.ctx = new AC(); } catch (e) { return; }
      const c = this.ctx;
      this.out = c.createDynamicsCompressor(); this.out.connect(c.destination);
      this.mvol = c.createGain(); this.mvol.gain.value = this.vol.music; this.mvol.connect(this.out);
      this.master = this.mbus = c.createGain(); this.mbus.gain.value = 0; this.mbus.connect(this.mvol);
      this.sbus = c.createGain(); this.sbus.gain.value = this.vol.sfx * 0.9; this.sbus.connect(this.out);
      // eco suave para la música
      const dl = c.createDelay(), fb = c.createGain(), wet = c.createGain();
      dl.delayTime.value = 0.27; fb.gain.value = 0.28; wet.gain.value = 0.22;
      this.mbus.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(this.mvol);
      const len = c.sampleRate * 0.4, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noise = b;
      const p = this.pending || this.last; this.pending = null; this.cur = null;
      if (p) this.play(p);
    },
    setVol(k, v) {
      this.vol[k] = Math.max(0, Math.min(1, Math.round(v * 10) / 10));
      try { localStorage.setItem('thalyria.audio', JSON.stringify(this.vol)); } catch (e) { /* sin almacenamiento */ }
      if (!this.ctx) return;
      if (k === 'music') this.mvol.gain.value = this.vol.music;
      else this.sbus.gain.value = this.vol.sfx * 0.9;
      if (k === 'music' && this.vol.music > 0 && !this.cur && this.last) this.play(this.last);
    },
    cycle(k) { const v = this.vol[k]; this.setVol(k, v >= 1 ? 0 : v + 0.2); if (k === 'sfx') TH.sfx('ok'); },
    label(k) { return this.vol[k] ? Math.round(this.vol[k] * 100) + '%' : 'No'; },
    toggle() { this.cycle('music'); },
    // música de la zona actual: el mapa la pide al entrar; combate y cinemáticas la sustituyen y después se vuelve a ella
    // música de zona: primero las reglas que dependen del guion (p. ej. el pueblo atacado), luego la del mapa
    setZone(mapId, def, fade) {
      this.zMap = mapId; this.zDef = def;
      const rule = (TH.data.zoneMusic || []).find((r) => r.map === mapId && TH.flags.test(r.if));
      this.zone = (rule && rule.music) || (def && def.music) || ZONE[mapId] || 'vael';
      this.play(this.zone, fade);
    },
    resume(f) { if (this.zMap) this.setZone(this.zMap, this.zDef, f); else if (this.zone) this.play(this.zone, f); },
    play(name, fade) {
      if (!T[name]) return;
      this.last = name;
      if (!this.ctx) { this.pending = name; return; }
      if (this.curName === name && this.cur) return;
      const g = this.mbus.gain, now = this.ctx.currentTime, fo = fade == null ? 0.35 : fade;
      g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(0, now + fo);
      clearTimeout(this._sw);
      this.curName = name;
      this._sw = setTimeout(() => {
        this.cur = compile(T[name]); this.curD = T[name]; this.step = 0; this.next = this.ctx.currentTime + 0.05;
        const t = this.ctx.currentTime; g.cancelScheduledValues(t); g.setValueAtTime(0, t); g.linearRampToValueAtTime(0.5, t + 0.6);
        if (!this.timer) this.timer = setInterval(() => this.tick(), 40);
      }, fo * 1000 + 30);
    },
    stop(fade) {
      this.curName = null;
      if (!this.ctx || !this.cur) { this.pending = null; return; }
      const g = this.mbus.gain, now = this.ctx.currentTime, f = fade == null ? 0.8 : fade;
      g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(0, now + f);
      clearTimeout(this._sw);
      this._sw = setTimeout(() => { this.cur = null; }, f * 1000 + 50);
    },
    tick() {
      const C = this.cur, D = this.curD;
      if (!C || !this.ctx || this.vol.music <= 0) return;
      const sp = 60 / D.bpm / 4, R = D.root;
      while (this.next < this.ctx.currentTime + 0.2) {
        const i = this.step % C.n, t = this.next;
        if (D.once && this.step >= 32) { this.stop(0.6); return; }
        if (C.bass[i] != null) this.tone(freq(R - 12 + C.bass[i]), t, sp * 1.7, 'triangle', 0.32);
        if (C.arp[i] != null) this.tone(freq(R + C.arp[i]), t, sp * 0.9, D.aw, D.av);
        const L = C.lead[i % C.lead.length];
        if (L) this.tone(freq(R + L.n), t, sp * L.d * 0.95, D.lw, D.lv, true);
        if (D.pad && i % 16 === 0) for (const n of C.pads[(i >> 4) % C.pads.length]) this.tone(freq(R + n), t, sp * 16, 'sine', D.pad, false, 0.4);
        const dc = D.drum && D.drum[this.step % D.drum.length];
        if (dc === 'k') this.kick(t, 0.5); else if (dc === 's') this.hit(this.mbus, t, 0.16, 1800, 0.22); else if (dc === 'h') this.hit(this.mbus, t, 0.04, 7000, 0.07);
        this.next += sp; this.step++;
      }
    },
    tone(f, t, d, type, v, vib, att) {
      const c = this.ctx, o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.value = f;
      if (vib && d > 0.25) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 5.5; lg.gain.value = f * 0.006; l.connect(lg); lg.connect(o.frequency); l.start(t + 0.12); l.stop(t + d); }
      const a = att || 0.012;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g); g.connect(this.mbus); o.start(t); o.stop(t + d + 0.03);
    },
    kick(t, v) {
      const c = this.ctx, o = c.createOscillator(), g = c.createGain();
      o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      o.connect(g); g.connect(this.mbus); o.start(t); o.stop(t + 0.2);
    },
    hit(bus, t, d, fq, v, type) {
      const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = this.noise; f.type = type || 'highpass'; f.frequency.value = fq;
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      s.connect(f); f.connect(g); g.connect(bus); s.start(t); s.stop(t + d + 0.02);
    },
    // ---------- efectos ----------
    blip(f0, f1, d, type, v, t0) {
      const c = this.ctx, t = c.currentTime + (t0 || 0), o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + d);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g); g.connect(this.sbus); o.start(t); o.stop(t + d + 0.02);
    },
    sfx(name) {
      if (!this.ctx || this.vol.sfx <= 0 || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime, S = this.sbus;
      if (this._lt && this._lt[name] && now - this._lt[name] < 0.04) return;
      (this._lt = this._lt || {})[name] = now;
      switch (name) {
        case 'step': this.hit(S, now, 0.05, 900 + Math.random() * 500, 0.05, 'bandpass'); break;
        case 'menu': this.blip(880, 0, 0.04, 'square', 0.04); break;
        case 'ok': this.blip(660, 0, 0.05, 'square', 0.05); this.blip(990, 0, 0.07, 'square', 0.05, 0.05); break;
        case 'back': this.blip(520, 330, 0.08, 'square', 0.045); break;
        case 'text': this.blip(1200 + Math.random() * 200, 0, 0.018, 'square', 0.015); break;
        case 'hit': this.hit(S, now, 0.12, 600, 0.35, 'lowpass'); this.blip(180, 60, 0.1, 'square', 0.12); break;
        case 'hurt': this.hit(S, now, 0.16, 400, 0.3, 'lowpass'); this.blip(140, 50, 0.15, 'sawtooth', 0.1); break;
        case 'perfect': this.blip(1320, 0, 0.08, 'square', 0.07); this.blip(1760, 0, 0.14, 'triangle', 0.09, 0.06); this.hit(S, now, 0.12, 5000, 0.12); break;
        case 'block': this.blip(1500, 900, 0.09, 'triangle', 0.12); this.hit(S, now, 0.07, 3000, 0.18); break;
        case 'break': for (let i = 0; i < 4; i++) this.blip(900 + i * 300, 300, 0.12, 'square', 0.05, i * 0.03); this.hit(S, now, 0.3, 2400, 0.25); break;
        case 'magic': this.blip(400, 1200, 0.25, 'sine', 0.08); this.blip(600, 1800, 0.25, 'triangle', 0.05, 0.05); break;
        case 'res': this.blip(300, 900, 0.3, 'sine', 0.1); this.blip(450, 1350, 0.32, 'triangle', 0.06, 0.06); this.hit(S, now, 0.35, 4000, 0.05); break;
        case 'epoch': this.blip(1600, 200, 0.6, 'sine', 0.09); this.blip(200, 1600, 0.6, 'sine', 0.06); break;
        case 'chest': [0, 4, 7, 12].forEach((n, i) => this.blip(freq(72 + n), 0, 0.18, 'triangle', 0.08, i * 0.07)); break;
        case 'level': [0, 4, 7, 12, 16].forEach((n, i) => this.blip(freq(67 + n), 0, 0.22, 'square', 0.05, i * 0.08)); break;
        case 'heal': [0, 7, 12].forEach((n, i) => this.blip(freq(79 + n), 0, 0.25, 'sine', 0.07, i * 0.06)); break;
        case 'encounter': this.blip(200, 900, 0.25, 'sawtooth', 0.07); this.hit(S, now, 0.3, 1500, 0.15); break;
        case 'ko': this.blip(300, 60, 0.5, 'sawtooth', 0.08); break;
      }
    },
  });
  TH.sfx = (n) => M.sfx(n);
  TH.MUSIC_TRACKS = T;
})();
