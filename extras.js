// FASE E · motor de los extras: comidas con efecto, cocina en la hoguera, pesca y el juego de mesa «Mareas».
// Todo usa un panel propio (#xp) con el mismo estilo que la tienda, con teclado, mando táctil y ratón.
(function () {
  'use strict';
  const TH = window.TH, D = TH.data, F = TH.flags;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const IT = (id) => D.items[id] || { name: id };

  // ---------- panel ----------
  let PANEL = null;
  function panel() {
    if (PANEL) return PANEL;
    const shop = document.getElementById('shop');
    const el = document.createElement('div');
    el.className = 'pm shop panel xp'; el.id = 'xp'; el.hidden = true;
    el.innerHTML = '<div class="pm-head"><b class="pm-title" id="xpT"></b><div class="pm-tabs" id="xpTabs"></div><span class="pm-gold" id="xpG"></span><button class="pm-x" id="xpX" type="button" aria-label="Cerrar">✕</button></div>' +
      '<div class="pm-body" id="xpB"></div><div class="pm-foot"><span id="xpF"></span><button class="pm-btn" id="xpA" type="button" data-act="go">—</button></div>';
    shop.parentElement.insertBefore(el, shop.nextSibling);
    const css = document.createElement('style');
    css.textContent =
      '.xp .ck-ing{display:flex;flex-wrap:wrap;gap:.3em .8em;margin:.4em 0}.xp .ck-ing span{white-space:nowrap}.xp .ck-ing .no{color:#ff9a8a}.xp .ck-ing .ok{color:#9fe8a0}' +
      '.xp .fs{display:flex;flex-direction:column;align-items:center;gap:.7em;padding:1em}.xp .fs-bar{position:relative;width:min(420px,90%);height:22px;border-radius:11px;background:#1a1530;border:1px solid rgba(232,184,74,.4);overflow:hidden}' +
      '.xp .fs-zone{position:absolute;top:0;bottom:0;background:linear-gradient(#5ad88a,#2a9a5a)}.xp .fs-mk{position:absolute;top:-2px;bottom:-2px;width:4px;background:#fff;box-shadow:0 0 6px #fff}' +
      '.xp .fs-msg{font-size:1.2em;min-height:1.4em;text-align:center}.xp .fs-dots{letter-spacing:.3em}.xp .fs-water{width:min(420px,90%);height:70px;border-radius:10px;background:linear-gradient(#2a5a8a,#0e2a4a);position:relative;overflow:hidden}' +
      '.xp .fs-bob{position:absolute;left:50%;top:22px;width:10px;height:14px;margin-left:-5px;border-radius:50% 50% 40% 40%;background:linear-gradient(#ff5a4a 50%,#fff 50%)}.xp .fs-bob.bite{animation:bob .18s infinite alternate}@keyframes bob{to{transform:translateY(8px)}}' +
      '.xp .mb{display:flex;gap:1em;align-items:flex-start;justify-content:center;flex-wrap:wrap;padding:.4em}.xp .mb-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:3px;width:min(330px,62vw);aspect-ratio:1;background:#0e3a4a;padding:5px;border-radius:10px;border:2px solid #c89a4a}' +
      '.xp .mb-c{border:0;border-radius:5px;background:#1a6a7a;display:grid;place-items:center;padding:0;cursor:pointer}.xp .mb-c.v{background:#2a8a8a;box-shadow:inset 0 0 0 2px rgba(255,240,180,.5)}.xp .mb-c.cur{outline:2px solid #ffe070;outline-offset:-2px}' +
      '.xp .mb-c i{width:76%;height:76%;border-radius:50%;display:block}.xp .mb-c i.s{background:radial-gradient(circle at 35% 35%,#fff6c0,#f0b030 60%,#a86a10)}.xp .mb-c i.l{background:radial-gradient(circle at 35% 35%,#e8f0ff,#8aa0d8 60%,#3a4a8a)}.xp .mb-c.last i{box-shadow:0 0 0 2px #ff7a5a}' +
      '.xp .mb-side{min-width:150px;max-width:240px}.xp .mb-side p{margin:.3em 0}.xp .mb-score{font-size:1.3em}';
    document.head.appendChild(css);
    PANEL = { root: el, title: el.querySelector('#xpT'), tabs: el.querySelector('#xpTabs'), gold: el.querySelector('#xpG'), body: el.querySelector('#xpB'), foot: el.querySelector('#xpF'), act: el.querySelector('#xpA') };
    el.addEventListener('click', (e) => {
      const top = TH.scenes.top();
      if (!top || !top.xp) return;
      if (e.target.closest('#xpX')) { top.quit(); return; }
      const b = e.target.closest('[data-act]');
      if (b) top.click(b.dataset.act, +b.dataset.i, b);
    });
    return PANEL;
  }
  class XPScene extends TH.Scene {
    constructor() { super(); this.transparent = true; this.xp = true; }
    enter(d) { this.d = d || {}; this.P = panel(); this.P.root.hidden = false; this.P.gold.textContent = TH.party.gold + ' oro'; this.start(this.d); this.draw(); }
    exit() { this.P.root.hidden = true; this.P.body.innerHTML = ''; }
    quit() { TH.scenes.pop(); }
    start() {} draw() {} click() {}
  }

  // ================= COMIDAS =================
  // Un plato comido fuera de combate da su efecto en el siguiente combate; dentro del combate, hasta que acabe.
  TH.meal = {
    get(id) { const m = F.get('comida'); return (m && typeof m === 'object' && m[id]) || null; },
    set(id, v) { let m = F.get('comida'); if (!m || typeof m !== 'object') m = {}; if (v) m[id] = v; else delete m[id]; F.set('comida', m); },
    clear(battleOnly) { const m = F.get('comida'); if (!m || typeof m !== 'object') return; for (const k of Object.keys(m)) if (!battleOnly || m[k].now) delete m[k]; F.set('comida', m); },
  };
  const _fx = TH.gear.fx.bind(TH.gear);
  TH.gear.fx = function (id) {
    const out = _fx(id), ml = TH.meal.get(id);
    if (!ml || !ml.fx) return out;
    for (const [k, v] of Object.entries(ml.fx)) {
      if (k === 'resist') { out.resist = out.resist || {}; for (const [e, x] of Object.entries(v)) out.resist[e] = Math.min(out.resist[e] || 1, x); }
      else if (typeof v === 'number' && typeof out[k] === 'number') out[k] = k === 'comboUp' ? out[k] * v : out[k] + v;
      else out[k] = v;
    }
    return out;
  };
  const _use = TH.party.use.bind(TH.party);
  TH.party.use = function (itemId, id) {
    const it = D.items[itemId];
    if (!it || !it.use || !it.use.fx || !this.count(itemId)) return _use(itemId, id);
    const m = this.members[id], s = this.stats(id), h0 = m.hp, m0 = m.mp;
    if (it.use.hp) m.hp = Math.min(s.hp, m.hp + it.use.hp);
    if (it.use.mp) m.mp = Math.min(s.mp, m.mp + it.use.mp);
    this.add(itemId, -1);
    const inBattle = TH.scenes.top() instanceof TH.BattleScene || !!(TH.scenes.registry.map && TH.scenes.registry.map.battle);
    TH.meal.set(id, { fx: it.use.fx, dish: itemId, now: inBattle });
    const parts = [];
    if (m.hp > h0) parts.push('+' + (m.hp - h0) + ' PV');
    if (m.mp > m0) parts.push('+' + (m.mp - m0) + ' PM');
    parts.push(it.use.fxName || 'efecto');
    return TH.chars.defs[id].name + ' ' + parts.join(' · ');
  };
  const BS = TH.BattleScene.prototype, _close = BS.close;
  BS.close = function () { TH.meal.clear(false); return _close.apply(this, arguments); };

  // ================= COCINA =================
  // recetas: D.recipes[id] = { name, dish, ing: { item: n }, learn } · se aprenden con F 'receta.<id>'
  TH.cook = {
    known() { return Object.keys(D.recipes).filter((k) => D.recipes[k].start || F.get('receta.' + k)); },
    can(k) { const r = D.recipes[k]; return Object.entries(r.ing).every(([it, n]) => TH.party.count(it) >= n); },
    learn(k) { if (F.get('receta.' + k)) return false; F.set('receta.' + k, true); return true; },
  };
  class CookScene extends XPScene {
    start() { this.idx = 0; }
    rows() { return TH.cook.known(); }
    draw() {
      const P = this.P, rows = this.rows();
      this.idx = Math.max(0, Math.min(this.idx, rows.length - 1));
      P.title.textContent = 'Cocina de la hoguera'; P.tabs.innerHTML = ''; P.gold.textContent = TH.party.gold + ' oro';
      let h = '<div class="split"><div class="list">';
      rows.forEach((k, i) => { const r = D.recipes[k], ok = TH.cook.can(k); h += '<button type="button" class="row' + (i === this.idx ? ' sel' : '') + (ok ? '' : ' poor') + '" data-act="row" data-i="' + i + '"><span>' + esc(r.name) + '</span><span class="lbl">' + (ok ? 'listo' : 'faltan cosas') + ' · tienes ' + TH.party.count(r.dish) + '</span></button>'; });
      const tot = Object.keys(D.recipes).length;
      h += '</div><div class="side">';
      const k = rows[this.idx];
      if (k) {
        const r = D.recipes[k], d = IT(r.dish);
        h += '<h4>' + esc(r.name) + '</h4><p class="desc">' + esc(d.desc || '') + '</p><div class="ck-ing">' +
          Object.entries(r.ing).map(([it, n]) => { const have = TH.party.count(it); return '<span class="' + (have >= n ? 'ok' : 'no') + '">' + esc(IT(it).name) + ' ' + have + '/' + n + '</span>'; }).join('') + '</div>' +
          '<p class="dim">' + (d.use ? [d.use.hp ? '+' + d.use.hp + ' PV' : '', d.use.mp ? '+' + d.use.mp + ' PM' : '', d.use.fxName ? '✦ ' + d.use.fxName : ''].filter(Boolean).join(' · ') : '') + '</p>' +
          '<p class="dim">Cómelo fuera de combate y el efecto dura el siguiente combate; en combate, hasta que termine.</p>';
      }
      h += '</div></div>';
      P.body.innerHTML = h;
      P.foot.textContent = 'Recetas aprendidas ' + rows.length + '/' + tot + ' · A cocinar · B salir';
      P.act.textContent = k ? 'Cocinar' : '—'; P.act.disabled = !k || !TH.cook.can(k);
      const sel = P.body.querySelector('.row.sel'); if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest' });
    }
    cook() {
      const k = this.rows()[this.idx]; if (!k) return;
      if (!TH.cook.can(k)) { TH.ui.toast('Te faltan ingredientes'); return; }
      const r = D.recipes[k];
      for (const [it, n] of Object.entries(r.ing)) TH.party.add(it, -n);
      TH.party.add(r.dish, 1); TH.sfx('chest'); TH.ui.toast('Cocinas: ' + IT(r.dish).name);
      F.add('cocina.platos', 1);
      this.draw();
    }
    click(act, i) { if (act === 'row') { if (this.idx === i) this.cook(); else { this.idx = i; this.draw(); } } else if (act === 'go') this.cook(); }
    update() {
      const I = TH.input, n = this.rows().length;
      if (I.pressed('up') && n) { TH.sfx('menu'); this.idx = (this.idx + n - 1) % n; this.draw(); }
      if (I.pressed('down') && n) { TH.sfx('menu'); this.idx = (this.idx + 1) % n; this.draw(); }
      if (I.pressed('a')) this.cook();
      if (I.pressed('b') || I.pressed('menu')) this.quit();
    }
  }
  TH.scenes.register('cocina', new CookScene());

  // ================= PESCA =================
  // d.pool = [[pez, peso], …]. Espera a que pique, pulsa A a tiempo y luego acierta la zona verde 2-3 veces.
  class FishScene extends XPScene {
    start(d) {
      const pool = d.pool || [['pez_plata', 1]], tot = pool.reduce((a, b) => a + b[1], 0);
      let x = Math.random() * tot; this.fish = pool[0][0];
      for (const [f, w] of pool) { if ((x -= w) <= 0) { this.fish = f; break; } }
      const rare = (IT(this.fish).rare || 0);
      const luck = TH.gear && TH.party ? this.d.owner.members().some((m) => (TH.gear.fx(m).fishLuck || 0) > 0) : false;
      this.need = 2 + rare; this.hits = 0; this.miss = 0; this.maxMiss = luck ? 3 : 2;
      this.zw = Math.max(0.12, 0.3 - rare * 0.07 + (luck ? 0.05 : 0)); this.zx = 0.2 + Math.random() * (0.8 - this.zw - 0.2);
      this.speed = 0.9 + rare * 0.45; this.pos = 0; this.dirm = 1;
      this.state = 'cast'; this.t = 1 + Math.random() * 2.2; this.msg = 'Lanzas el sedal… {espera a que pique}'; this.built = false;
    }
    draw() {
      const P = this.P;
      P.title.textContent = 'Pesca · ' + (this.d.name || 'Punto de pesca'); P.tabs.innerHTML = ''; P.gold.textContent = TH.party.gold + ' oro';
      if (!this.built) {
        P.body.innerHTML = '<div class="fs"><div class="fs-water"><div class="fs-bob" id="fsBob"></div></div><div class="fs-msg" id="fsMsg"></div><div class="fs-bar"><div class="fs-zone" id="fsZone"></div><div class="fs-mk" id="fsMk"></div></div><div class="fs-dots" id="fsDots"></div></div>';
        this.el = { bob: P.body.querySelector('#fsBob'), msg: P.body.querySelector('#fsMsg'), zone: P.body.querySelector('#fsZone'), mk: P.body.querySelector('#fsMk'), dots: P.body.querySelector('#fsDots') };
        this.built = true;
        P.foot.textContent = 'A: tirar / acertar la zona verde · B: soltar la caña'; P.act.textContent = '¡Tirar!';
      }
      const E = this.el;
      E.msg.textContent = this.msg.replace(/[{}]/g, '');
      E.bob.classList.toggle('bite', this.state === 'bite');
      E.zone.style.left = (this.zx * 100) + '%'; E.zone.style.width = (this.zw * 100) + '%';
      E.mk.style.left = 'calc(' + (this.pos * 100) + '% - 2px)'; E.mk.style.visibility = this.state === 'reel' ? 'visible' : 'hidden';
      E.zone.style.visibility = this.state === 'reel' ? 'visible' : 'hidden';
      E.dots.textContent = this.state === 'reel' || this.state === 'done' ? '●'.repeat(this.hits) + '○'.repeat(Math.max(0, this.need - this.hits)) + '   ' + '✕'.repeat(this.miss) : '';
    }
    press() {
      if (this.state === 'cast') { this.msg = 'Demasiado pronto: el pez se asusta.'; this.end(false); return; }
      if (this.state === 'bite') { this.state = 'reel'; this.msg = '¡Ha picado! Acierta la zona verde.'; TH.sfx('ok'); this.draw(); return; }
      if (this.state === 'reel') {
        if (this.pos >= this.zx && this.pos <= this.zx + this.zw) {
          this.hits++; TH.sfx('perfect');
          if (this.hits >= this.need) { this.end(true); return; }
          this.zx = 0.1 + Math.random() * (0.85 - this.zw - 0.1); this.speed *= 1.12; this.msg = '¡Bien! Otra vez…';
        } else {
          this.miss++; TH.sfx('back'); this.msg = 'Casi… el sedal se tensa.';
          if (this.miss >= this.maxMiss) { this.msg = 'Se ha soltado. Era ' + (IT(this.fish).rare ? '¡enorme!' : 'grande…'); this.end(false); return; }
        }
        this.draw(); return;
      }
      if (this.state === 'done') this.quit();
    }
    end(ok) {
      this.state = 'done';
      if (ok) {
        TH.party.add(this.fish, 1); F.add('pesca.total', 1); F.set('pesca.' + this.fish, true);
        this.msg = '¡Has pescado ' + IT(this.fish).name + '!'; TH.sfx('chest');
        if (TH.bestiary && TH.fishLog) TH.fishLog(this.fish);
      }
      F.set('pesca.ultimo', ok ? this.fish : '');
      this.P.act.textContent = 'Seguir'; this.draw();
    }
    click(act) { if (act === 'go') this.press(); }
    update(dt) {
      const I = TH.input;
      if (I.pressed('b') || I.pressed('menu')) { this.quit(); return; }
      if (I.pressed('a')) this.press();
      if (this.state === 'cast') { this.t -= dt; if (this.t <= 0) { this.state = 'bite'; this.t = 0.85; this.msg = '¡Pica! ¡Pulsa A!'; TH.sfx('menu'); this.draw(); } }
      else if (this.state === 'bite') { this.t -= dt; if (this.t <= 0) { this.msg = 'Se ha escapado. Hay que tirar en cuanto pica.'; this.end(false); } }
      else if (this.state === 'reel') { this.pos += this.dirm * this.speed * dt; if (this.pos > 1) { this.pos = 1; this.dirm = -1; } if (this.pos < 0) { this.pos = 0; this.dirm = 1; } this.el.mk.style.left = 'calc(' + (this.pos * 100) + '% - 2px)'; }
    }
  }
  TH.scenes.register('pesca', new FishScene());

  // ================= MAREAS: el juego de mesa de Thalyria =================
  // Tablero de 6×6. Tú juegas con fichas de Sol, el rival con fichas de Luna. Colocas una ficha de forma que encierre
  // en línea fichas del rival: la marea las voltea a tu color. Si no puedes encerrar ninguna, pasas. Gana quien tenga más.
  const N = 6, DIRS8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const WPOS = [
    [60, -12, 8, 8, -12, 60], [-12, -20, -2, -2, -20, -12], [8, -2, 2, 2, -2, 8],
    [8, -2, 2, 2, -2, 8], [-12, -20, -2, -2, -20, -12], [60, -12, 8, 8, -12, 60]];
  const MB = {
    init() { const b = Array.from({ length: N }, () => Array(N).fill(0)); b[2][2] = b[3][3] = -1; b[2][3] = b[3][2] = 1; return b; },
    flips(b, r, c, p) {
      if (b[r][c]) return [];
      const out = [];
      for (const [dr, dc] of DIRS8) {
        const line = []; let rr = r + dr, cc = c + dc;
        while (rr >= 0 && rr < N && cc >= 0 && cc < N && b[rr][cc] === -p) { line.push([rr, cc]); rr += dr; cc += dc; }
        if (line.length && rr >= 0 && rr < N && cc >= 0 && cc < N && b[rr][cc] === p) out.push(...line);
      }
      return out;
    },
    moves(b, p) { const m = []; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const f = this.flips(b, r, c, p); if (f.length) m.push([r, c, f]); } return m; },
    play(b, mv, p) { const nb = b.map((x) => x.slice()); nb[mv[0]][mv[1]] = p; for (const [r, c] of mv[2]) nb[r][c] = p; return nb; },
    score(b) { let s = 0, l = 0; for (const row of b) for (const v of row) { if (v === 1) s++; else if (v === -1) l++; } return [s, l]; },
    evalB(b, p) { let v = 0; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) v += b[r][c] * WPOS[r][c]; const mob = this.moves(b, 1).length - this.moves(b, -1).length; return p * (v + mob * 4); },
    minimax(b, p, depth, a, bt) {
      const ms = this.moves(b, p);
      if (!depth) return [this.evalB(b, p), null];
      if (!ms.length) {
        if (!this.moves(b, -p).length) { const [s, l] = this.score(b); return [p * (s - l) * 1000, null]; }
        return [-this.minimax(b, -p, depth - 1, -bt, -a)[0], null];
      }
      let best = -Infinity, bm = ms[0];
      for (const mv of ms) {
        const v = -this.minimax(this.play(b, mv, p), -p, depth - 1, -bt, -a)[0];
        if (v > best) { best = v; bm = mv; }
        a = Math.max(a, v); if (a >= bt) break;
      }
      return [best, bm];
    },
    ai(b, level) {
      const ms = this.moves(b, -1);
      if (!ms.length) return null;
      if (level <= 1) { if (Math.random() < 0.45) return ms[(Math.random() * ms.length) | 0]; return ms.sort((x, y) => y[2].length - x[2].length)[0]; }
      if (level === 2) return ms.map((m) => [m, WPOS[m[0]][m[1]] + m[2].length * 2 + Math.random() * 6]).sort((x, y) => y[1] - x[1])[0][0];
      return this.minimax(b, -1, level === 3 ? 2 : 4, -Infinity, Infinity)[1] || ms[0];
    },
  };
  TH.mareas = MB;
  class BoardScene extends XPScene {
    start(d) {
      this.R = D.rivals[d.rival] || { name: 'Rival', level: 1 };
      this.b = MB.init(); this.turn = 1; this.cur = [1, 1]; this.last = null; this.over = false; this.aiT = 0; this.msg = 'Te toca. Encierra fichas de Luna para voltearlas.';
      F.set('mareas.res', '');
    }
    draw() {
      const P = this.P, ms = this.turn === 1 && !this.over ? MB.moves(this.b, 1) : [], [s, l] = MB.score(this.b);
      P.title.textContent = 'Mareas · contra ' + this.R.name; P.tabs.innerHTML = ''; P.gold.textContent = TH.party.gold + ' oro';
      let h = '<div class="mb"><div class="mb-grid">';
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const v = this.b[r][c], ok = ms.some((m) => m[0] === r && m[1] === c), cur = this.cur[0] === r && this.cur[1] === c, last = this.last && this.last[0] === r && this.last[1] === c;
        h += '<button type="button" class="mb-c' + (ok ? ' v' : '') + (cur ? ' cur' : '') + (last ? ' last' : '') + '" data-act="cell" data-i="' + (r * N + c) + '" aria-label="Casilla ' + (r + 1) + '-' + (c + 1) + '">' + (v ? '<i class="' + (v > 0 ? 's' : 'l') + '"></i>' : '') + '</button>';
      }
      h += '</div><div class="mb-side"><p class="mb-score">☀ ' + s + ' · ☾ ' + l + '</p><p>' + esc(this.msg) + '</p><p class="dim">' + esc(this.R.title || '') + '</p>' +
        '<p class="dim">Coloca una ficha de Sol de modo que encierre en línea (también en diagonal) fichas de Luna: se voltean. Las esquinas no se pueden voltear nunca.</p></div></div>';
      P.body.innerHTML = h;
      P.foot.textContent = this.over ? 'A: volver' : 'Flechas: mover · A: colocar · B: rendirse';
      P.act.textContent = this.over ? 'Volver' : 'Colocar'; P.act.disabled = false;
    }
    place(r, c) {
      if (this.over || this.turn !== 1) return;
      const f = MB.flips(this.b, r, c, 1);
      if (!f.length) { TH.sfx('back'); this.msg = 'Ahí no encierras nada. Las casillas iluminadas sí valen.'; this.draw(); return; }
      this.b = MB.play(this.b, [r, c, f], 1); this.last = [r, c]; TH.sfx('menu');
      this.next(-1);
    }
    next(p) {
      const a = MB.moves(this.b, p).length, o = MB.moves(this.b, -p).length;
      if (!a && !o) { this.finish(); return; }
      if (!a) { this.turn = -p; this.msg = (p === 1 ? 'No puedes encerrar nada: pasas.' : this.R.name + ' no puede mover: pasa.'); }
      else { this.turn = p; this.msg = p === 1 ? 'Te toca.' : this.R.name + ' piensa…'; }
      if (this.turn === -1) this.aiT = 0.6;
      this.draw();
    }
    finish() {
      this.over = true;
      const [s, l] = MB.score(this.b), res = s > l ? 'win' : s < l ? 'lose' : 'draw';
      F.set('mareas.res', res); F.add('mareas.partidas', 1);
      if (res === 'win') { F.add('mareas.victorias', 1); TH.sfx('perfect'); }
      this.msg = res === 'win' ? '¡Ganas ' + s + ' a ' + l + '!' : res === 'lose' ? 'Pierdes ' + s + ' a ' + l + '.' : 'Empate a ' + s + '.';
      this.draw();
    }
    click(act, i) {
      if (this.over) { if (act === 'go' || act === 'cell') this.quit(); return; }
      if (act === 'cell') { this.cur = [(i / N) | 0, i % N]; this.place(this.cur[0], this.cur[1]); }
      else if (act === 'go') this.place(this.cur[0], this.cur[1]);
    }
    quit() { if (!this.over) F.set('mareas.res', 'lose'); TH.scenes.pop(); }
    update(dt) {
      const I = TH.input;
      if (this.over) { if (I.pressed('a') || I.pressed('b') || I.pressed('menu')) TH.scenes.pop(); return; }
      if (I.pressed('b') || I.pressed('menu')) { this.quit(); return; }
      if (this.turn === -1) {
        this.aiT -= dt;
        if (this.aiT <= 0) { const mv = MB.ai(this.b, this.R.level); if (mv) { this.b = MB.play(this.b, mv, -1); this.last = [mv[0], mv[1]]; TH.sfx('menu'); } this.next(1); }
        return;
      }
      let moved = false;
      if (I.pressed('up')) { this.cur[0] = (this.cur[0] + N - 1) % N; moved = true; }
      if (I.pressed('down')) { this.cur[0] = (this.cur[0] + 1) % N; moved = true; }
      if (I.pressed('left')) { this.cur[1] = (this.cur[1] + N - 1) % N; moved = true; }
      if (I.pressed('right')) { this.cur[1] = (this.cur[1] + 1) % N; moved = true; }
      if (moved) this.draw();
      if (I.pressed('a')) this.place(this.cur[0], this.cur[1]);
    }
  }
  TH.scenes.register('mareas', new BoardScene());
})();
