// FASE D · exploración con poderes de campo.
// Poderes (teclas 1-4 o la barra de abajo): Mover (atrae bloques), Luz (revela lo oculto), Brisa (apaga/aviva braseros),
// Congelar (convierte charcos en pilares de hielo). Se desbloquean con la historia.
// Cada capítulo tiene un sello ante su jefe que se abre con un puzle de poderes; cada mapa esconde un cofre secreto
// que necesita un poder que llega más tarde. Opción «Reiniciar puzles de esta zona» en el menú.
(function () {
  'use strict';
  const TH = window.TH, D = TH.data, F = TH.flags, TS = 16, HZ = TH.HZ;
  const DV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const POW = [
    { id: 'mover', key: 'p1', n: 1, name: 'Mover', color: '#c8a8ff', flag: 'prologo.fin', desc: 'Atrae hacia ti bloques de piedra que estén en línea.' },
    { id: 'luz', key: 'p2', n: 2, name: 'Luz', color: '#ffe48a', flag: 'cap1.fin', desc: 'Revela runas, caminos y cofres ocultos a tu alrededor.' },
    { id: 'brisa', key: 'p3', n: 3, name: 'Brisa', color: '#c8f4ff', flag: 'cap3.fin', desc: 'Sopla hacia delante: apaga o aviva braseros.' },
    { id: 'congelar', key: 'p4', n: 4, name: 'Congelar', color: '#8ad8ff', flag: 'cap5.fin', desc: 'Convierte el charco de delante en un pilar de hielo.' },
  ];
  const has = (p) => F.test(p.flag);
  const K = () => TH.particles.K;
  const sp = (k, x, y, vx, vy, life, c) => TH.particles.spawn(K()[k], x, y, vx, vy, life, (Math.random() * 9) | 0, c);

  // ---------- tipos de objeto nuevos ----------
  Object.assign(D.puzzleTypes, {
    runa: { flat: true, name: 'Runa oculta' },
    llama: { solid: true, name: 'Brasero' },
    charco: { flat: true, name: 'Charco' },
    secreto: { solid: true, interact: true, name: 'Cofre secreto' },
    pista: { interact: true, name: 'Inscripción' },
  });
  const PZ = TH.Puzzle.prototype;
  const _apply = PZ.apply, _draw = PZ.draw, _ground = PZ.drawGround, _inter = PZ.interact, _list = PZ.interactables, _upd = PZ.update, _lights = PZ.lights;
  const secKey = (z, o) => 'sec.' + z + '.' + o.id;
  PZ.apply = function (m) {
    _apply.call(this, m);
    const Dl = m.dynLv;
    for (const o of this.objs) {
      if (!this.inEpoch(o)) continue;
      const s = this.st(o), i = o.r * m.w + o.c;
      if (o.type === 'charco' && s.on) Dl[i] = 254;
      if (o.type === 'secreto' && o.need === 'luz' && !s.open) Dl[i] = 255;
    }
  };
  PZ.interactables = function (scene) {
    return _list.call(this, scene).filter((t) => !(t.pzo && t.pzo.type === 'secreto' && t.pzo.need === 'luz' && !this.st(t.pzo).open));
  };
  const LOCKED = {
    luz: 'Aquí no hay nada… ¿o sí?',
    brisa: 'Un cofre rodeado de llamas que no se apagan solas. {p:0.3}Haría falta un buen soplo de viento.',
    congelar: 'Un cofre hundido en un charco helado de miedo. {p:0.3}Si el agua se volviera hielo, se podría alcanzar.',
    mover: 'Una roca enorme tapa algo que brilla debajo. {p:0.3}Habría que apartarla sin tocarla.',
  };
  PZ.interact = function (scene, o) {
    const s = this.st(o);
    if (o.type === 'pista') { TH.cutscene.play([{ say: 'none', name: 'Inscripción', t: o.text }]); return true; }
    if (o.type === 'secreto') {
      if (F.get(secKey(this.zone, o))) { TH.ui.toast('El cofre está vacío'); return true; }
      if (!s.open) { TH.cutscene.play([{ say: 'none', name: 'Algo escondido', t: LOCKED[o.need] }]); return true; }
      F.set(secKey(this.zone, o), true);
      TH.sfx('chest');
      this.chime(o.c * TS + 8, o.r * TS - scene.map.hh(o.c, o.r) * HZ, '#ffe070');
      const ops = [{ say: 'none', t: '¡Un cofre secreto!' }, { give: o.give, n: o.n || 1 }];
      const reg = TH.powers.regionDone(o.region);
      if (reg) ops.push({ say: 'none', t: 'Has encontrado todos los secretos de ' + reg.name + '. {p:0.3}Algo brilla en el fondo del cofre…' }, { give: reg.give });
      TH.cutscene.play(ops);
      return true;
    }
    return _inter.call(this, scene, o);
  };
  PZ.lights = function (L, cx, cy, n, t) {
    _lights.call(this, L, cx, cy, n, t);
    for (const o of this.objs) {
      if (o.type !== 'llama' || !this.inEpoch(o) || this.st(o).on) continue;
      L.light(o.c * TS + 8 - cx, (o.dsy != null ? o.dsy : o.r * TS + 15) - 14 - cy, 44 + Math.sin(t * 9) * 2, [255, 150, 60], (0.35 + 0.65 * n) * 0.9);
    }
  };
  // el sello se abre: guarda su bandera para siempre
  PZ.update = function (dt, scene) {
    _upd.call(this, dt, scene);
    for (const o of this.objs) {
      if (!o.fdflag || F.get(o.fdflag) || !this.isOpen(o)) continue;
      F.set(o.fdflag, true);
      this.apply(scene.map);
      TH.sfx('perfect'); TH.ui.toast('¡El sello se abre!');
      for (let i = 0; i < 24; i++) sp('SPARK', (o.c + Math.random() * o.w) * TS, (o.r + Math.random() * o.h) * TS, (Math.random() - 0.5) * 30, -30 - Math.random() * 30, 0.9, '#ffe8a0');
    }
  };
  function P(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
  PZ.drawGround = function (ctx, m, t, cx, cy) {
    _ground.call(this, ctx, m, t, cx, cy);
    for (const o of this.objs) {
      if (!this.inEpoch(o) || (o.type !== 'runa' && o.type !== 'charco')) continue;
      const s = this.st(o), z = m.hh(o.c, o.r), X = o.c * TS, Y = o.r * TS - z * HZ;
      if (o.type === 'runa') {
        if (!s.on) { if (Math.sin(t * 2 + o.c) > 0.92) P(ctx, X + 7, Y + 7, 1, 1, 'rgba(255,240,180,.5)'); continue; }
        ctx.globalAlpha = 0.7 + Math.sin(t * 3 + o.c) * 0.3;
        P(ctx, X + 3, Y + 3, 10, 10, 'rgba(255,220,120,.25)'); P(ctx, X + 7, Y + 3, 2, 10, '#ffe48a'); P(ctx, X + 4, Y + 6, 8, 2, '#ffe48a'); P(ctx, X + 5, Y + 10, 6, 1, '#fff4c8');
        ctx.globalAlpha = 1;
      } else {
        if (!s.on) {
          P(ctx, X + 1, Y + 3, 14, 11, '#1a3a5a'); P(ctx, X + 2, Y + 4, 12, 9, '#2a6a9a'); P(ctx, X + 3 + ((t * 6) | 0) % 6, Y + 6, 4, 1, '#9fe8ff'); P(ctx, X + 8, Y + 10, 3, 1, '#9fe8ff');
        } else {
          // pilar de hielo
          P(ctx, X + 1, Y - 10, 14, 24, '#2a5a8a'); P(ctx, X + 2, Y - 9, 12, 22, '#8ad8ff'); P(ctx, X + 2, Y - 9, 12, 3, '#e8fbff'); P(ctx, X + 4, Y - 5, 2, 14, '#ffffff'); P(ctx, X + 10, Y - 2, 2, 8, '#c8f0ff');
        }
      }
    }
  };
  PZ.draw = function (ctx, o, t) {
    if (o.type !== 'llama' && o.type !== 'secreto' && o.type !== 'pista') return _draw.call(this, ctx, o, t);
    const x = Math.round(o.dx), y = Math.round(o.dsy), s = this.st(o);
    if (o.type === 'pista') {
      P(ctx, x - 6, y - 2, 12, 3, 'rgba(16,10,30,.35)'); P(ctx, x - 5, y - 16, 10, 15, '#2a2238'); P(ctx, x - 4, y - 15, 8, 13, '#8a8094'); P(ctx, x - 3, y - 12, 6, 1, '#4a4058'); P(ctx, x - 3, y - 9, 6, 1, '#4a4058'); P(ctx, x - 3, y - 6, 4, 1, '#4a4058');
      return;
    }
    if (o.type === 'llama') {
      P(ctx, x - 7, y - 2, 14, 3, 'rgba(16,10,30,.35)'); P(ctx, x - 6, y - 8, 12, 7, '#3a2a20'); P(ctx, x - 7, y - 9, 14, 2, '#6a5040'); P(ctx, x - 2, y - 2, 4, 2, '#2a1a10');
      if (!s.on) for (let i = 0; i < 5; i++) { const h = 6 + ((Math.sin(t * 9 + i * 1.7) + 1) * 3) | 0; P(ctx, x - 5 + i * 2, y - 9 - h, 2, h, i % 2 ? '#ff8a2a' : '#ffc84a'); }
      else { P(ctx, x - 4, y - 10, 8, 1, '#4a4a4a'); if (Math.sin(t * 2) > 0) P(ctx, x - 1, y - 14 - ((t * 8) % 6), 2, 2, 'rgba(160,160,170,.5)'); }
      return;
    }
    // cofre secreto
    const got = F.get(secKey(this.zone, o)), open = s.open;
    if (o.need === 'luz' && !open) return;
    P(ctx, x - 8, y - 2, 16, 3, 'rgba(16,10,30,.35)');
    P(ctx, x - 7, y - 11, 14, 10, '#3a2010'); P(ctx, x - 6, y - 10, 12, 8, got ? '#5a3a20' : '#8a5a2a'); P(ctx, x - 6, y - 10, 12, 2, '#c89a4a'); P(ctx, x - 1, y - 8, 2, 3, '#ffe070');
    if (!got && open && Math.sin(t * 4) > 0.6) P(ctx, x + 4, y - 13, 1, 1, '#ffffff');
    if (open) return;
    if (o.need === 'brisa') for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, h = 4 + ((Math.sin(t * 9 + i) + 1) * 2) | 0; P(ctx, x + Math.cos(a) * 10 - 1, y - 4 + Math.sin(a) * 5 - h, 2, h, i % 2 ? '#ff8a2a' : '#ffc84a'); }
    if (o.need === 'congelar') { ctx.globalAlpha = 0.75; P(ctx, x - 10, y - 8, 20, 9, '#2a6a9a'); ctx.globalAlpha = 1; P(ctx, x - 8 + ((t * 6) | 0) % 10, y - 6, 4, 1, '#9fe8ff'); }
    if (o.need === 'mover') { P(ctx, x - 10, y - 20, 20, 20, '#2a2238'); P(ctx, x - 9, y - 19, 18, 18, '#7a7064'); P(ctx, x - 9, y - 19, 18, 3, '#a89a8a'); P(ctx, x - 5, y - 12, 6, 2, '#5a5048'); }
  };

  // ---------- usar un poder ----------
  TH.powers = {
    list: POW,
    has,
    regions: {
      bruma: { short: 'Bruma', name: 'la Isla de Bruma', give: 'brujula_vael' }, oeste: { short: 'Raíces', name: 'la Isla de las Raíces', give: 'hoja_eterna' }, sur: { short: 'Thalyria', name: 'la Isla de Thalyria', give: 'reloj_arena' },
      norte: { short: 'Hondaroca', name: 'Hondaroca', give: 'yunque_bolsillo' }, hundida: { short: 'Torre', name: 'la Isla de la Torre', give: 'farol_eterno' }, instante: { short: 'Instante', name: 'el instante', give: 'cristal_instante' },
    },
    count(region) {
      let n = 0, tot = 0;
      for (const [mid, d] of Object.entries(D.maps)) for (const o of d.puzzle || []) if (o.type === 'secreto' && (!region || o.region === region)) { tot++; if (F.get('sec.' + mid + '.' + o.id)) n++; }
      return [n, tot];
    },
    regionDone(region) {
      const [n, tot] = this.count(region), R = this.regions[region];
      if (!R || n < tot || F.get('secreg.' + region)) return null;
      F.set('secreg.' + region, true);
      return R;
    },
    zoneLbl(z) {
      let n = 0, tot = 0;
      for (const id of [z.id, z.alt]) for (const o of (id && D.maps[id] && D.maps[id].puzzle) || []) if (o.type === 'secreto') { tot++; if (F.get('sec.' + id + '.' + o.id)) n++; }
      return tot ? '<span class="lbl">' + (n === tot ? '✦ ' : '') + 'secretos ' + n + '/' + tot + '</span>' : '';
    },
    regionFoot() {
      return 'Secretos: ' + Object.keys(this.regions).map((k) => { const [n, t] = this.count(k); return (n === t ? '✦' : '') + this.regions[k].short + ' ' + n + '/' + t; }).join(' · ');
    },
    use(scene, p) {
      if (!has(p)) { TH.ui.toast('Aún no conoces el poder «' + p.name + '»'); return; }
      if ((this.cd || 0) > performance.now()) return;
      this.cd = performance.now() + 450;
      const pz = scene.puzzle, L = scene.leader, [dx, dy] = DV[L.dir] || DV.down;
      const pc = Math.floor(L.x / TS), pr = Math.floor((L.y - 1) / TS), X = L.x, Y = L.y - L.z * HZ - 10;
      TH.sfx('res');
      TH.res.ring(X, Y, p.color);
      const line = (n) => { const o = []; for (let k = 1; k <= n; k++) o.push([pc + dx * k, pr + dy * k]); return o; };
      const near = (o, rad) => Math.hypot(o.c - pc, o.r - pr) <= rad;
      const inLine = (o, n) => line(n).some(([c, r]) => c === o.c && r === o.r);
      let hit = false;
      const objs = pz ? pz.objs.filter((o) => pz.inEpoch(o)) : [];
      // secretos: el poder adecuado, cerca y de frente (o alrededor, para la Luz)
      for (const o of objs) {
        if (o.type !== 'secreto' || o.need !== p.id || pz.st(o).open) continue;
        if (p.id === 'luz' ? near(o, 3.5) : near(o, 1.6) || inLine(o, 4)) {
          pz.st(o).open = true; hit = true; pz.chime(o.c * TS + 8, o.r * TS + 4 - scene.map.hh(o.c, o.r) * HZ, p.color);
          TH.ui.toast(p.id === 'luz' ? '¡Algo oculto aparece!' : p.id === 'brisa' ? 'Las llamas se apagan' : p.id === 'congelar' ? 'El charco se congela' : 'La roca se aparta');
        }
      }
      if (p.id === 'mover') {
        for (let i = 0; i < 12; i++) { const k = i / 12; sp('SPARK', X + dx * 90 * k, Y + dy * 90 * k, -dx * 20, -dy * 20, 0.5, p.color); }
        if (pz) for (let k = 2; k <= 7; k++) {
          const c = pc + dx * k, r = pr + dy * k, o = pz.objAt(c, r, true);
          if (!o) continue;
          if (o.type === 'block' && o.mover) { hit = true; scene.resSeq = this.pull(scene, pz, o, L.dir); }
          break;
        }
      } else if (p.id === 'luz') {
        for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; sp('SPARK', X + Math.cos(a) * 10, Y + Math.sin(a) * 6, Math.cos(a) * 60, Math.sin(a) * 30, 0.8, p.color); }
        for (const o of objs) if (o.type === 'runa' && !pz.st(o).on && near(o, 3.5)) { pz.st(o).on = true; hit = true; pz.chime(o.c * TS + 8, o.r * TS + 6, p.color); }
      } else if (p.id === 'brisa') {
        for (let i = 0; i < 18; i++) sp('PUFF', X + (Math.random() - 0.5) * 8, Y + (Math.random() - 0.5) * 8, dx * (90 + Math.random() * 50) + dy * (Math.random() - 0.5) * 30, dy * (90 + Math.random() * 50) + dx * (Math.random() - 0.5) * 30, 0.6, '#e8faff');
        for (const o of objs) if (o.type === 'llama' && (inLine(o, 5) || near(o, 1.5))) { const s = pz.st(o); s.on = !s.on; hit = true; TH.ui.toast(s.on ? 'El brasero se apaga' : 'El brasero se aviva'); }
      } else if (p.id === 'congelar') {
        for (let i = 0; i < 16; i++) sp('SPARK', X + dx * (10 + i * 3), Y + dy * (6 + i * 2), (Math.random() - 0.5) * 30, -10 - Math.random() * 20, 0.7, '#e8fbff');
        const o = objs.find((o) => o.type === 'charco' && !pz.st(o).on && (inLine(o, 3) || near(o, 1.2)));
        if (o) { pz.st(o).on = true; hit = true; pz.chime(o.c * TS + 8, o.r * TS + 4, '#bff4ff'); TH.sfx('epoch'); }
      }
      if (pz) pz.apply(scene.map);
      if (!hit) TH.ui.toast(p.name + ': ' + p.desc);
    },
    // Mover: el bloque viene hacia ti casilla a casilla hasta quedar a tu lado o chocar
    *pull(scene, pz, o, dir) {
      const back = { up: 'down', down: 'up', left: 'right', right: 'left' }[dir], L = scene.leader;
      for (let n = 0; n < 8; n++) {
        const s = pz.st(o), [dx, dy] = DV[back];
        const c = s.c + dx, r = s.r + dy;
        const pc = Math.floor(L.x / TS), pr = Math.floor((L.y - 1) / TS);
        if (c === pc && r === pr) break;
        if (!pz.push(scene, o, back)) break;
        sp('SPARK', s.c * TS + 8, s.r * TS + 4, 0, -20, 0.4, '#c8a8ff');
        let k = 0; while (k < 0.13) { k += scene.dt || 1 / 60; yield; }
      }
    },
  };

  // ---------- teclas, barra de poderes y aviso de poder nuevo ----------
  const bar = document.createElement('div');
  bar.id = 'powBar';
  bar.innerHTML = POW.map((p) => '<button type="button" data-p="' + p.id + '" title="' + p.name + ' (' + p.n + ')" style="--pc:' + p.color + '"><i>' + p.n + '</i><span>' + p.name + '</span></button>').join('');
  const css = document.createElement('style');
  css.textContent = '#powBar{position:absolute;right:6px;bottom:46px;display:flex;flex-direction:column;align-items:flex-end;gap:4px;z-index:4}#powBar[hidden]{display:none}' +
    '#powBar button{display:flex;align-items:center;gap:4px;padding:3px 7px 3px 3px;border:1px solid rgba(232,184,74,.35);border-radius:14px;background:rgba(14,11,30,.8);color:#f4ecd8;font:inherit;font-size:11px;cursor:pointer}' +
    '#powBar button i{width:16px;height:16px;border-radius:50%;display:grid;place-content:center;font-style:normal;font-size:10px;color:#1a1028;background:var(--pc);box-shadow:0 0 6px var(--pc)}' +
    '#powBar button.off{opacity:.35}@media (max-width:520px){#powBar span{display:none}}';
  document.head.appendChild(css);
  const host = () => { const r = document.getElementById('resBtn'); return r && r.parentElement; };
  let barReady = false;
  // la barra solo se ve con el mapa delante (no en combates, menús ni minijuegos)
  setInterval(() => { const m = TH.scenes && TH.scenes.registry && TH.scenes.registry.map; if (m && TH.scenes.top() !== m) bar.hidden = true; }, 150);
  const MS = TH.MapScene.prototype, _mupd = MS.update;
  MS.update = function (dt) {
    if (!barReady && host()) {
      host().appendChild(bar); barReady = true;
      bar.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; const m = TH.scenes.registry.map; if (TH.scenes.top() === m && !m.inCutscene && !m.resSeq) TH.powers.use(m, POW.find((p) => p.id === b.dataset.p)); });
    }
    const top = TH.scenes.top() === this, free = top && !this.inCutscene && !this.trans && !TH.res.wheel && !this.resSeq && this.leader && this.leader.state === 'walk';
    const any = POW.some(has);
    bar.hidden = !(top && !this.inCutscene && any);
    if (!bar.hidden) for (const b of bar.children) b.classList.toggle('off', !has(POW.find((p) => p.id === b.dataset.p)));
    if (free) {
      for (const p of POW) {
        if (TH.input.pressed(p.key)) TH.powers.use(this, p);
        if (has(p) && !F.get('pod.' + p.id)) { F.set('pod.' + p.id, true); TH.ui.banner('Nuevo poder de campo', p.name + ' · tecla ' + p.n); TH.ui.toast(p.desc); }
      }
    }
    return _mupd.apply(this, arguments);
  };

  // ---------- reiniciar puzles desde el menú ----------
  const PM = TH.PartyMenu && TH.PartyMenu.prototype;
  if (PM && PM.options) {
    const _opt = PM.options;
    PM.options = function () {
      const L = _opt.apply(this, arguments), m = TH.scenes.registry.map;
      if (m && m.puzzle) L.push({ label: 'Reiniciar puzles de esta zona', note: 'si algo se ha quedado atascado', act: () => { m.puzzle.reset(); m.puzzle.apply(m.map); TH.ui.toast('Los puzles de la zona vuelven a su estado inicial'); TH.scenes.pop(); } });
      return L;
    };
  }

  // ---------- recompensas de región ----------
  const IT = D.items, add = (id, o) => { o.id = id; IT[id] = o; };
  add('brujula_vael', { name: 'Brújula de Vael', type: 'acc', price: 0, stats: { spd: 3 }, fx: { expUp: 0.15, goldUp: 0.15 }, desc: 'Encontraste todos los secretos de Bruma. Ahora la brújula los encuentra por ti.' });
  add('hoja_eterna', { name: 'Hoja eterna', type: 'acc', price: 0, stats: { hp: 40, res: 4 }, fx: { regen: 0.05 }, desc: 'Una hoja del Bosque que nunca se seca.' });
  add('reloj_arena', { name: 'Reloj de arena', type: 'acc', price: 0, stats: { spd: 4 }, fx: { startCombo: 50 }, desc: 'Arena de las dos épocas. Siempre empieza a contar antes.' });
  add('yunque_bolsillo', { name: 'Yunque de bolsillo', type: 'acc', price: 0, stats: { def: 8 }, fx: { counter: 0.4 }, desc: 'Pesa poco y aguanta mucho. Como Flint.' });
  add('farol_eterno', { name: 'Farol eterno', type: 'acc', price: 0, stats: { mp: 20, mag: 6 }, fx: { mpRegen: 3 }, desc: 'Un farol de la Aldea que no se apaga ni bajo el agua.' });
  add('cristal_instante', { name: 'Cristal del instante', type: 'acc', price: 0, stats: { atk: 8, mag: 8 }, fx: { ringDouble: true }, desc: 'Un segundo detenido dentro de un cristal.' });
})();
