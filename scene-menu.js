// Menú de grupo (Estado, Equipo, Ecos, Objetos, Opciones) y tienda. HTML sobre el canvas, teclado y táctil.
(function () {
  'use strict';
  const TH = window.TH;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const TABS = ['Estado', 'Equipo', 'Ecos', 'Objetos', 'Historia', 'Bestiario', 'Mapa', 'Opciones'];
  const OPT = 7, EXT = (t) => t >= 4 && t <= 6 && TH.menuExt;
  const SK = ['atk', 'def', 'mag', 'res', 'spd'];

  // ---------- piezas compartidas ----------
  function portraits(root) {
    root.querySelectorAll('canvas[data-port]').forEach((c) => {
      const g = c.getContext('2d');
      g.imageSmoothingEnabled = false;
      g.clearRect(0, 0, 64, 64);
      g.drawImage(TH.portraits.get(c.dataset.port, c.dataset.e || 'neutral'), 0, 0);
    });
  }
  const name = (id) => TH.chars.defs[id].name;
  // descripción + efecto especial (equipo de la Fase B)
  const fxLine = (id) => { const it = id && TH.data.items[id], t = it && TH.gear && TH.gear.text(it); return t ? '<br><b class="fxl">✦ ' + esc(t) + '</b>' : ''; };
  const itemDesc = (id) => esc(TH.data.items[id].desc) + fxLine(id);
  const itemName = (id) => (id && TH.data.items[id] ? TH.data.items[id].name : '—');
  function bar(v, max, cls) { return '<span class="bar ' + cls + '"><i style="width:' + Math.round((100 * v) / Math.max(1, max)) + '%"></i></span>'; }
  // tabla de stats con vista previa (b = stats nuevos)
  function statTable(a, b) {
    const S = TH.data.STAT_ES;
    let h = '<div class="stats">';
    for (const k of ['hp', 'mp'].concat(SK)) {
      const d = b ? b[k] - a[k] : 0;
      h += '<span class="k">' + S[k] + '</span><span class="v">' + a[k] + (b ? ' <em class="' + (d > 0 ? 'up' : d < 0 ? 'down' : '') + '">→ ' + b[k] + '</em>' : '') + '</span>';
    }
    return h + '</div>';
  }
  function diffText(id, override) {
    const a = TH.party.stats(id), b = TH.party.stats(id, override), S = TH.data.STAT_ES, out = [];
    for (const k of ['hp', 'mp'].concat(SK)) { const d = b[k] - a[k]; if (d) out.push('<em class="' + (d > 0 ? 'up' : 'down') + '">' + S[k] + (d > 0 ? '+' : '') + d + '</em>'); }
    return out.join(' ') || '<em>=</em>';
  }
  function chips(members, mi) {
    return '<div class="chips">' + members.map((id, i) => '<button type="button" class="chip' + (i === mi ? ' sel' : '') + '" data-act="member" data-i="' + i + '"><canvas width="64" height="64" data-port="' + id + '"></canvas><span>' + name(id) + '</span></button>').join('') + '</div>';
  }

  { const st = document.createElement('style'); st.textContent = '.fxm{color:#7af0ff;font-style:normal}.fxl{color:#7af0ff;font-weight:normal}'; document.head.appendChild(st); }
  // ---------- menú de grupo ----------
  class PartyMenu extends TH.Scene {
    constructor() { super(); this.transparent = true; this.tab = 0; }
    enter(d) {
      this.owner = d.owner;
      this.focus = 'tabs'; this.idx = 0; this.sub = 0; this.mi = 0;
      this.travel = !!d.travel; if (d.tab != null) { this.tab = d.tab; if (this.travel) this.focus = 'list'; }
      this.el = { root: $('pm'), tabs: $('pmTabs'), body: $('pmBody'), foot: $('pmFoot'), gold: $('pmGold') };
      if (!this._bound) {
        this._bound = true;
        this.el.root.addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (b && TH.scenes.top() === this) this.click(b.dataset.act, +b.dataset.i); });
        $('pmX').addEventListener('click', () => { if (TH.scenes.top() === this) TH.scenes.pop(); });
      }
      this.el.root.hidden = false;
      this.draw();
    }
    exit() { this.el.root.hidden = true; }
    members() { return this.owner.members(); }
    member() { const m = this.members(); this.mi = Math.min(this.mi, m.length - 1); return m[this.mi]; }

    // filas de la lista según la pestaña
    rows() {
      const P = TH.party, id = this.member();
      switch (this.tab) {
        case 0: return this.members().map((m) => ({ id: m }));
        case 1: return P.SLOTS.map((s) => ({ slot: s }));
        case 2: return [0, 1].map((k) => ({ eco: k }));
        case 3: return Object.keys(P.inv).sort((a, b) => this.order(a) - this.order(b)).map((it) => ({ item: it }));
        case 4: case 5: case 6: return EXT(this.tab) ? TH.menuExt.rows(this.tab, this) : [];
        case OPT: return this.options();
      }
      void id;
      return [];
    }
    order(it) { const T = { item: 0, weapon: 1, armor: 2, acc: 3, key: 4 }; return T[TH.data.items[it].type] * 1000 + (TH.data.items[it].price || 0); }
    options() {
      const o = this.owner, c = o.clock;
      return [
        { label: 'Continuar', act: () => TH.scenes.pop() },
        { label: 'Guardar partida', act: () => TH.ui.toast(o.saveGame() ? 'Partida guardada' : 'No se pudo guardar en este navegador') },
        { label: 'Cargar partida', act: () => { if (o.loadGame()) { TH.scenes.pop(); TH.ui.toast('Partida cargada'); } else TH.ui.toast('No hay partida guardada'); } },
        { label: 'Velocidad del texto', value: TH.settings.speedLabel(), act: () => TH.settings.cycleSpeed() },
        { label: 'Velocidad del tiempo', value: c.speed > 1 ? 'Rápida ×30' : 'Normal', act: () => { c.speed = c.speed > 1 ? 1 : 30; } },
        { label: 'Volumen de la música', value: TH.music.label('music'), act: () => TH.music.cycle('music') },
        { label: 'Volumen de los efectos', value: TH.music.label('sfx'), act: () => TH.music.cycle('sfx') },
        { label: 'Flecha guía', value: TH.settings.guide === false ? 'No' : 'Sí', act: () => { TH.settings.guide = TH.settings.guide === false; TH.settings.save(); } },
        { label: 'Margen del timing', value: TH.settings.lab(TH.settings.TIMINGS, TH.settings.timing), act: () => TH.settings.cyc('timing', TH.settings.TIMINGS) },
        { label: 'Botones táctiles', value: TH.settings.lab(TH.settings.TOUCH, TH.settings.touch), act: () => TH.settings.cyc('touch', TH.settings.TOUCH) },
        ...(document.documentElement.classList.contains('mob') ? [
          { label: 'Vibración', value: TH.settings.vib ? 'Sí' : 'No', act: () => { TH.settings.vib = !TH.settings.vib; TH.settings.saveMob(); TH.haptic && TH.haptic(20); } },
          { label: 'Correr empujando el joystick', value: TH.settings.autorun ? 'Sí' : 'No', act: () => { TH.settings.autorun = !TH.settings.autorun; TH.settings.saveMob(); } },
          { label: 'Pantalla completa', value: document.fullscreenElement ? 'Sí' : 'No', act: () => { const on = !document.fullscreenElement; TH.settings.fs = on; TH.settings.saveMob(); TH.fullscreen(on); } },
        ] : []),
        { label: 'Calidad gráfica', value: TH.settings.lab(TH.settings.QUALITY, TH.settings.quality), act: () => { TH.settings.cyc('quality', TH.settings.QUALITY); TH.perf && TH.perf.apply(); } },
        { label: 'Mostrar FPS', value: TH.ui.showFps ? 'Sí' : 'No', act: () => TH.ui.toggleFps() },
        { label: 'Adelantar 3 horas', act: () => { c.hour = (c.hour + 3) % 24; TH.ui.toast('Ahora son las ' + String(Math.floor(c.hour)).padStart(2, '0') + ':00'); } },
        { label: 'Guardar y volver al título', act: () => { o.saveGame(); TH.scenes.pop(); TH.scenes.push('title'); } },
        { label: 'Desatascar: volver a la entrada', act: () => {
          // red de seguridad: si el grupo se queda encajado, vuelve a la entrada de la zona sin perder nada
          const m = TH.scenes.registry.map, def = m.map.def, en = Object.keys(def.entries || {})[0];
          TH.scenes.pop();
          if (m.inCutscene) return;
          m.enter(en ? { map: m.mapId, entry: en, quiet: true } : { map: m.mapId, pos: { x: def.start.c * 16 + 8, y: def.start.r * 16 + 8 }, quiet: true });
          TH.ui.toast('Has vuelto a la entrada de ' + (def.name || 'la zona'));
        } },
        { label: 'Créditos', act: () => { TH.scenes.pop(); TH.credits.show(); } },
      ];
    }
    // sublista (equipar, Ecos, usar objeto)
    subRows() {
      const P = TH.party, id = this.member(), r = this.rows()[this.idx];
      if (this.tab === 1) {
        const out = [{ item: null }];
        for (const it in P.inv) if (TH.data.items[it].type === r.slot && P.canEquip(id, it)) out.push({ item: it });
        return out;
      }
      if (this.tab === 2) return [{ eco: null }].concat(P.ecos.map((e) => ({ eco: e })));
      if (this.tab === 3) return this.members().map((m) => ({ id: m }));
      return [];
    }

    draw() {
      const P = TH.party, E = this.el;
      E.gold.textContent = P.gold + ' oro';
      E.tabs.innerHTML = TABS.map((t, i) => '<button type="button" class="tab' + (i === this.tab ? ' sel' : '') + (this.focus === 'tabs' && i === this.tab ? ' focus' : '') + '" data-act="tab" data-i="' + i + '">' + t + '</button>').join('');
      const rows = this.rows();
      this.idx = Math.max(0, Math.min(this.idx, rows.length - 1));
      let h = '', foot = '';
      const id = this.member();
      const rowCls = (i) => 'row' + (i === this.idx && this.focus !== 'tabs' ? ' sel' : '');
      if (this.tab === 0) {
        h = '<div class="cards">' + this.members().map((m, i) => {
          const s = P.stats(m), mm = P.members[m];
          return '<button type="button" class="card ' + rowCls(i) + '" data-act="row" data-i="' + i + '"><canvas width="64" height="64" data-port="' + m + '"></canvas><div><b>' + name(m) + '</b> <small>Nv ' + mm.lv + '</small>' +
            '<div class="hpmp"><span>PV ' + mm.hp + '/' + s.hp + '</span>' + bar(mm.hp, s.hp, 'hp') + '<span>PM ' + mm.mp + '/' + s.mp + '</span>' + bar(mm.mp, s.mp, 'mp') + '</div>' +
            '<div class="mini">' + SK.map((k) => TH.data.STAT_ES[k] + ' <b>' + s[k] + '</b>').join(' · ') + '</div>' +
            '<div class="mini dim">' + P.SLOTS.map((sl) => itemName(mm.equip[sl])).join(' · ') + '</div>' +
            '<div class="mini dim">' + (mm.ecos.length ? mm.ecos.map((e) => TH.data.ecos[e].name).join(' · ') : 'Sin Ecos') + '</div></div></button>';
        }).join('') + '</div>';
        foot = this.members().map((m) => TH.chars.defs[m].name + ': ' + P.members[m].exp + '/' + P.need(P.members[m].lv) + ' exp').join(' · ');
      } else if (this.tab === 1 || this.tab === 2) {
        const mm = P.members[id];
        let preview = null;
        const subs = this.focus === 'sub' ? this.subRows() : null;
        h = chips(this.members(), this.mi) + '<div class="split"><div class="list">';
        if (this.tab === 1) {
          rows.forEach((r, i) => { const eq = mm.equip[r.slot]; h += '<button type="button" class="' + rowCls(i) + '" data-act="row" data-i="' + i + '"><span class="lbl">' + P.SLOT_ES[r.slot] + '</span><span>' + itemName(eq) + (eq && TH.data.items[eq].fx ? ' <em class="fxm">✦</em>' : '') + '</span></button>'; });
          if (subs) {
            const slot = rows[this.idx].slot;
            h += '<div class="sub">' + subs.map((s, i) => '<button type="button" class="row' + (i === this.sub ? ' sel' : '') + '" data-act="sub" data-i="' + i + '"><span>' + (s.item ? itemName(s.item) + (TH.data.items[s.item].fx ? ' <em class="fxm">✦</em>' : '') + ' <small>×' + P.count(s.item) + '</small>' : '(Quitar)') + '</span><span class="diff">' + diffText(id, { [slot]: s.item }) + '</span></button>').join('') + '</div>';
            const cur = subs[this.sub];
            if (cur) { preview = P.stats(id, { [slot]: cur.item }); foot = (cur.item ? itemDesc(cur.item) : 'Dejar el hueco vacío.') + (mm.equip[slot] && TH.data.items[mm.equip[slot]].fx && cur.item !== mm.equip[slot] ? '<br><small class="dim">Ahora: ' + esc(itemName(mm.equip[slot])) + ' · ' + esc(TH.gear.text(TH.data.items[mm.equip[slot]])) + '</small>' : ''); }
          } else foot = mm.equip[rows[this.idx].slot] ? itemDesc(mm.equip[rows[this.idx].slot]) : 'Nada equipado. Pulsa A para elegir.';
        } else {
          rows.forEach((r, i) => { const e = mm.ecos[r.eco]; h += '<button type="button" class="' + rowCls(i) + '" data-act="row" data-i="' + i + '"><span class="lbl">Eco ' + (i + 1) + '</span><span>' + (e ? '<i class="dot" style="background:' + TH.data.ecos[e].color + '"></i>' + TH.data.ecos[e].name : '—') + '</span></button>'; });
          if (subs) {
            h += '<div class="sub">' + subs.map((s, i) => {
              const ec = s.eco && TH.data.ecos[s.eco], ow = s.eco && P.ecoOwner(s.eco);
              return '<button type="button" class="row' + (i === this.sub ? ' sel' : '') + '" data-act="sub" data-i="' + i + '"><span>' + (ec ? '<i class="dot" style="background:' + ec.color + '"></i>' + ec.name + ' <small>' + ec.el + '</small>' : '(Quitar)') + '</span><span class="diff">' + (ow ? '<small>' + name(ow) + '</small>' : '') + '</span></button>';
            }).join('') + '</div>';
            const cur = subs[this.sub];
            if (cur) {
              // vista previa simulando el cambio
              const save = mm.ecos.slice(), saveO = {};
              for (const k in P.members) saveO[k] = P.members[k].ecos.slice();
              P.setEco(id, rows[this.idx].eco, cur.eco);
              preview = P.stats(id);
              for (const k in P.members) P.members[k].ecos = saveO[k];
              mm.ecos = save;
              for (const k in P.members) P.clamp(k);
              foot = cur.eco ? TH.data.ecos[cur.eco].desc : 'Dejar el hueco libre.';
            }
          } else { const e = mm.ecos[rows[this.idx].eco]; foot = e ? TH.data.ecos[e].desc + ' (' + TH.data.ecos[e].el + ')' : 'Hueco libre. Pulsa A para elegir un Eco.'; }
        }
        h += '</div><div class="side"><canvas width="64" height="64" data-port="' + id + '"></canvas>' + statTable(P.stats(id), preview) + '</div></div>';
      } else if (this.tab === 3) {
        if (!rows.length) h = '<p class="empty">No llevas nada.</p>';
        else h = '<div class="list items">' + rows.map((r, i) => { const it = TH.data.items[r.item]; return '<button type="button" class="' + rowCls(i) + '" data-act="row" data-i="' + i + '"><span>' + it.name + '</span><span class="lbl">' + TH.data.TYPE_ES[it.type] + ' ×' + P.count(r.item) + '</span></button>'; }).join('') + '</div>';
        if (this.focus === 'sub') {
          h += '<div class="sub floating">' + this.subRows().map((s, i) => { const st = P.stats(s.id), mm = P.members[s.id]; return '<button type="button" class="row' + (i === this.sub ? ' sel' : '') + '" data-act="sub" data-i="' + i + '"><span>' + name(s.id) + '</span><span class="lbl">PV ' + mm.hp + '/' + st.hp + ' · PM ' + mm.mp + '/' + st.mp + '</span></button>'; }).join('') + '</div>';
        }
        const r = rows[this.idx];
        foot = r ? itemDesc(r.item) : '';
      } else if (EXT(this.tab)) {
        const o = TH.menuExt.draw(this.tab, this, rows, rowCls);
        h = o.h; foot = o.foot || '';
      } else {
        h = '<div class="list">' + rows.map((r, i) => '<button type="button" class="' + rowCls(i) + '" data-act="row" data-i="' + i + '"><span>' + r.label + '</span>' + (r.value ? '<span class="lbl">' + r.value + '</span>' : '') + '</button>').join('') + '</div>';
        foot = 'Flechas para moverte · A elegir · B volver';
      }
      E.body.innerHTML = h;
      E.foot.innerHTML = foot;
      portraits(E.body);
      if (EXT(this.tab)) TH.menuExt.after(this.tab, this, E.body);
      const sel = E.body.querySelector('.sub .row.sel') || E.body.querySelector('.row.sel');
      if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest' });
    }

    update() {
      const I = TH.input, rows = this.rows();
      if (EXT(this.tab) && TH.menuExt.tick) TH.menuExt.tick(this.tab, this);
      if (this.focus === 'tabs') {
        if (I.pressed('left')) { this.tab = (this.tab + TABS.length - 1) % TABS.length; this.idx = 0; this.draw(); }
        if (I.pressed('right')) { this.tab = (this.tab + 1) % TABS.length; this.idx = 0; this.draw(); }
        if ((I.pressed('down') || I.pressed('a')) && rows.length) { this.focus = 'list'; this.draw(); }
        if (I.pressed('b') || I.pressed('menu')) TH.scenes.pop();
        return;
      }
      if (this.focus === 'list') {
        if (I.pressed('up')) { TH.sfx('menu'); if (this.idx === 0) this.focus = 'tabs'; else this.idx--; this.draw(); }
        if (I.pressed('down')) { TH.sfx('menu'); this.idx = Math.min(rows.length - 1, this.idx + 1); this.draw(); }
        const dl = I.pressed('left'), dr = I.pressed('right');
        if ((this.tab === 1 || this.tab === 2) && (dl || dr)) {
          const n = this.members().length;
          this.mi = (this.mi + (dl ? -1 : 1) + n) % n;
          this.draw();
        }
        if (I.pressed('a')) { TH.sfx('ok'); this.activate(); }
        if (I.pressed('b')) { TH.sfx('back'); this.focus = 'tabs'; this.draw(); }
        if (I.pressed('menu')) TH.scenes.pop();
        return;
      }
      // sublista
      const subs = this.subRows();
      if (I.pressed('up')) { TH.sfx('menu'); this.sub = (this.sub + subs.length - 1) % subs.length; this.draw(); }
      if (I.pressed('down')) { TH.sfx('menu'); this.sub = (this.sub + 1) % subs.length; this.draw(); }
      if (I.pressed('a')) { TH.sfx('ok'); this.confirm(); }
      if (I.pressed('b')) { TH.sfx('back'); this.focus = 'list'; this.draw(); }
      if (I.pressed('menu')) TH.scenes.pop();
    }
    activate() {
      const r = this.rows()[this.idx];
      if (!r) return;
      if (this.tab === 1 || this.tab === 2) { this.focus = 'sub'; this.sub = 0; }
      else if (this.tab === 3) {
        const it = TH.data.items[r.item];
        if (it.use) { this.focus = 'sub'; this.sub = 0; } else TH.ui.toast(it.type === 'key' ? 'Es un objeto clave' : 'Se equipa desde «Equipo»');
      } else if (EXT(this.tab)) { TH.menuExt.activate(this.tab, this, r); if (TH.scenes.top() !== this) return; }
      else if (this.tab === OPT) { r.act(); if (TH.scenes.top() !== this) return; }
      this.draw();
    }
    confirm() {
      const P = TH.party, id = this.member(), s = this.subRows()[this.sub], r = this.rows()[this.idx];
      if (!s) return;
      if (this.tab === 1) { P.equip(id, r.slot, s.item); TH.ui.toast(s.item ? name(id) + ' se equipa ' + itemName(s.item) : 'Hueco vacío'); this.focus = 'list'; }
      else if (this.tab === 2) { P.setEco(id, r.eco, s.eco); TH.ui.toast(s.eco ? name(id) + ' lleva ' + TH.data.ecos[s.eco].name : 'Eco retirado'); this.focus = 'list'; }
      else if (this.tab === 3) {
        const res = P.use(r.item, s.id);
        TH.ui.toast(res || 'No se puede usar');
        if (!P.count(r.item)) this.focus = 'list';
      }
      this.draw();
    }
    // toques
    click(act, i) {
      if (act === 'tab') { this.tab = i; this.idx = 0; this.focus = 'tabs'; }
      else if (act === 'member') { this.mi = i; if (this.focus === 'sub') this.focus = 'list'; }
      else if (act === 'row') { const same = this.focus === 'list' && this.idx === i; this.idx = i; this.focus = 'list'; if (same || this.tab === OPT) { this.activate(); return; } }
      else if (act === 'sub') { if (this.sub === i) { this.confirm(); return; } this.sub = i; }
      this.draw();
    }
  }

  // ---------- tienda ----------
  class ShopScene extends TH.Scene {
    constructor() { super(); this.transparent = true; }
    enter(d) {
      this.shop = TH.data.shops[d.id];
      this.owner = d.owner || TH.scenes.registry.map;
      this.mode = 0; this.idx = 0;
      this.el = { root: $('shop'), title: $('shTitle'), tabs: $('shTabs'), body: $('shBody'), foot: $('shFoot'), gold: $('shGold'), act: $('shAct') };
      if (!this._bound) {
        this._bound = true;
        this.el.root.addEventListener('click', (e) => {
          const b = e.target.closest('[data-act]');
          if (!b || TH.scenes.top() !== this) return;
          const i = +b.dataset.i;
          if (b.dataset.act === 'mode') { this.mode = i; this.idx = 0; }
          else if (b.dataset.act === 'row') { if (this.idx === i) { this.deal(); return; } this.idx = i; }
          else if (b.dataset.act === 'deal') { this.deal(); return; }
          this.draw();
        });
        $('shX').addEventListener('click', () => { if (TH.scenes.top() === this) TH.scenes.pop(); });
      }
      this.el.root.hidden = false;
      this.draw();
    }
    exit() { this.el.root.hidden = true; }
    rows() {
      const P = TH.party;
      if (this.mode === 0) return this.shop.stock.filter((x) => typeof x === 'string' || TH.flags.test(x[1])).map((x) => (typeof x === 'string' ? x : x[0])).filter((it) => TH.data.items[it]);
      return Object.keys(P.inv).filter((it) => TH.data.items[it].type !== 'key' && P.sellPrice(it) > 0);
    }
    price(it) { return this.mode === 0 ? TH.data.items[it].price : TH.party.sellPrice(it); }
    draw() {
      const P = TH.party, E = this.el, rows = this.rows();
      this.idx = Math.max(0, Math.min(this.idx, rows.length - 1));
      E.title.textContent = this.shop.name;
      E.gold.textContent = P.gold + ' oro';
      E.tabs.innerHTML = ['Comprar', 'Vender'].map((t, i) => '<button type="button" class="tab' + (i === this.mode ? ' sel focus' : '') + '" data-act="mode" data-i="' + i + '">' + t + '</button>').join('');
      let h = '<div class="list">';
      rows.forEach((it, i) => {
        const d = TH.data.items[it], p = this.price(it), poor = this.mode === 0 && p > P.gold;
        h += '<button type="button" class="row' + (i === this.idx ? ' sel' : '') + (poor ? ' poor' : '') + '" data-act="row" data-i="' + i + '"><span>' + d.name + (d.fx ? ' <em class="fxm">✦</em>' : '') + '</span><span class="lbl">' + p + ' oro · tienes ' + P.count(it) + '</span></button>';
      });
      if (!rows.length) h += '<p class="empty">' + (this.mode ? 'No tienes nada que vender.' : 'No queda género.') + '</p>';
      h += '</div>';
      const it = rows[this.idx];
      let side = '';
      if (it) {
        const d = TH.data.items[it];
        side = '<p class="desc">' + esc(d.desc) + fxLine(it) + '</p>';
        if (TH.party.SLOTS.indexOf(d.type) >= 0) {
          side += '<div class="who">' + this.owner.members().map((m) => {
            const can = TH.party.canEquip(m, it);
            return '<div class="whorow"><canvas width="64" height="64" data-port="' + m + '"></canvas><span>' + name(m) + '</span><span class="diff">' + (can ? diffText(m, { [d.type]: it }) : '<small>No puede equiparlo</small>') + '</span></div>';
          }).join('') + '</div>';
        } else if (d.type === 'item') side += '<p class="dim">Para usar fuera de combate desde el menú.</p>';
      }
      E.body.innerHTML = '<div class="split">' + h + '<div class="side">' + side + '</div></div>';
      portraits(E.body);
      E.act.textContent = it ? (this.mode ? 'Vender por ' : 'Comprar por ') + this.price(it) + ' oro' : '—';
      E.act.disabled = !it || (this.mode === 0 && this.price(it) > P.gold);
      E.foot.textContent = '←/→ comprar o vender · A ' + (this.mode ? 'vender' : 'comprar') + ' · B salir';
      const sel = E.body.querySelector('.row.sel');
      if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest' });
    }
    deal() {
      const P = TH.party, it = this.rows()[this.idx];
      if (!it) return;
      const p = this.price(it), d = TH.data.items[it];
      if (this.mode === 0) {
        if (P.gold < p) { TH.ui.toast('No te llega el oro'); return; }
        if (P.count(it) >= 99) { TH.ui.toast('No te caben más'); return; }
        P.gold -= p; P.add(it, 1); TH.ui.toast('Compras ' + d.name);
      } else { P.gold += p; P.add(it, -1); TH.ui.toast('Vendes ' + d.name + ' por ' + p + ' oro'); }
      this.draw();
    }
    update() {
      const I = TH.input, n = this.rows().length;
      if (I.pressed('left') || I.pressed('right')) { this.mode = 1 - this.mode; this.idx = 0; this.draw(); }
      if (I.pressed('up') && n) { TH.sfx('menu'); this.idx = (this.idx + n - 1) % n; this.draw(); }
      if (I.pressed('down') && n) { TH.sfx('menu'); this.idx = (this.idx + 1) % n; this.draw(); }
      if (I.pressed('a')) { TH.sfx('ok'); this.deal(); }
      if (I.pressed('b') || I.pressed('menu')) TH.scenes.pop();
    }
  }

  TH.PartyMenu = PartyMenu;
  TH.ShopScene = ShopScene;
})();
