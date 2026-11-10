// Estado del grupo: nivel, PV/PM, equipo, Ecos, inventario y oro. Se guarda entero con la partida.
(function () {
  'use strict';
  const TH = window.TH;
  const KEYS = ['hp', 'mp', 'atk', 'def', 'mag', 'res', 'spd'];
  const SLOTS = ['weapon', 'armor', 'acc'];
  const ECO_SLOTS = 2;

  const P = (TH.party = {
    KEYS, SLOTS, ECO_SLOTS,
    SLOT_ES: { weapon: 'Arma', armor: 'Armadura', acc: 'Accesorio' },
    members: {},
    ecoState: {}, // id → 'standby' | 'recover' (solo durante el combate)
    inv: {},
    gold: 0,
    ecos: [],
    // partida nueva
    reset() {
      const D = TH.data;
      this.members = {};
      for (const id in D.party) {
        const d = D.party[id];
        this.members[id] = { lv: 1, exp: 0, hp: 0, mp: 0, equip: Object.assign({}, d.equip), ecos: [] };
      }
      this.inv = Object.assign({}, D.start.items);
      this.gold = D.start.gold;
      this.ecos = D.start.ecos.slice();
      this.members.kaelen.ecos = [];
      for (const id in this.members) { const s = this.stats(id); this.members[id].hp = s.hp; this.members[id].mp = s.mp; }
    },
    dump() { return JSON.parse(JSON.stringify({ members: this.members, inv: this.inv, gold: this.gold, ecos: this.ecos })); },
    load(o) {
      this.reset();
      if (!o || !o.members) return;
      for (const id in o.members) if (this.members[id]) Object.assign(this.members[id], o.members[id]);
      this.inv = Object.assign({}, o.inv || {});
      this.gold = o.gold | 0;
      this.ecos = (o.ecos || []).filter((e) => TH.data.ecos[e]);
      for (const id in this.members) this.clamp(id);
    },
    // stats finales = base + crecimiento + equipo + Ecos
    stats(id, override) {
      const d = TH.data.party[id], m = this.members[id], out = {};
      const lv = m ? m.lv : 1;
      for (const k of KEYS) out[k] = d.base[k] + d.grow[k] * (lv - 1);
      const eq = Object.assign({}, m ? m.equip : d.equip, override || {});
      for (const s of SLOTS) { const it = eq[s] && TH.data.items[eq[s]]; if (it && it.stats) for (const k in it.stats) out[k] += it.stats[k]; }
      // un Eco en espera (liberado en combate) no da stats hasta que vuelve
      for (const e of m ? m.ecos : []) { const ec = TH.data.ecos[e]; if (ec && !this.ecoState[e]) for (const k in ec.stats) out[k] += ec.stats[k]; }
      for (const k of KEYS) out[k] = Math.max(k === 'hp' ? 1 : 0, out[k]);
      return out;
    },
    clamp(id) {
      const m = this.members[id], s = this.stats(id);
      m.hp = Math.max(0, Math.min(s.hp, m.hp)); m.mp = Math.max(0, Math.min(s.mp, m.mp));
    },
    canEquip(id, itemId) {
      const it = TH.data.items[itemId];
      return !!it && SLOTS.indexOf(it.type) >= 0 && (!it.who || it.who.indexOf(id) >= 0);
    },
    // equipar desde el inventario (null = quitar). Devuelve true si cambió.
    equip(id, slot, itemId) {
      const m = this.members[id];
      if (itemId && (!this.canEquip(id, itemId) || TH.data.items[itemId].type !== slot || !this.count(itemId))) return false;
      const old = m.equip[slot];
      if (old) this.add(old, 1);
      if (itemId) this.add(itemId, -1);
      m.equip[slot] = itemId || null;
      this.clamp(id);
      return true;
    },
    // Ecos: cada uno lo lleva un solo personaje
    ecoOwner(ecoId) { for (const id in this.members) if (this.members[id].ecos.indexOf(ecoId) >= 0) return id; return null; },
    setEco(id, slotIdx, ecoId) {
      const m = this.members[id];
      if (ecoId) { const o = this.ecoOwner(ecoId); if (o) { const om = this.members[o]; om.ecos = om.ecos.filter((e) => e !== ecoId); this.clamp(o); } }
      const list = m.ecos.slice();
      if (ecoId) list[slotIdx] = ecoId; else list.splice(slotIdx, 1);
      m.ecos = list.filter(Boolean).slice(0, ECO_SLOTS);
      this.clamp(id);
    },
    count(itemId) { return this.inv[itemId] | 0; },
    add(itemId, n) {
      const c = (this.inv[itemId] | 0) + n;
      if (c > 0) this.inv[itemId] = Math.min(99, c); else delete this.inv[itemId];
    },
    giveEco(ecoId) { if (this.ecos.indexOf(ecoId) < 0) this.ecos.push(ecoId); },
    // usar un consumible sobre un personaje; devuelve texto del resultado o null
    use(itemId, id) {
      const it = TH.data.items[itemId], m = this.members[id];
      if (!it || !it.use || !this.count(itemId)) return null;
      const s = this.stats(id);
      if ((!it.use.hp || m.hp >= s.hp) && (!it.use.mp || m.mp >= s.mp)) return 'No le hace falta';
      const h0 = m.hp, m0 = m.mp;
      if (it.use.hp) m.hp = Math.min(s.hp, m.hp + it.use.hp);
      if (it.use.mp) m.mp = Math.min(s.mp, m.mp + it.use.mp);
      this.add(itemId, -1);
      const parts = [];
      if (m.hp > h0) parts.push('+' + (m.hp - h0) + ' PV');
      if (m.mp > m0) parts.push('+' + (m.mp - m0) + ' PM');
      return TH.chars.defs[id].name + ' ' + parts.join(' · ');
    },
    // experiencia: la siguiente subida pide un poco más cada vez
    need(lv) { return Math.round(16 * Math.pow(lv, 1.55)); },
    gainExp(id, n) {
      const m = this.members[id];
      let ups = 0;
      m.exp += n;
      while (m.lv < 50 && m.exp >= this.need(m.lv)) {
        m.exp -= this.need(m.lv);
        const before = this.stats(id);
        m.lv++; ups++;
        const after = this.stats(id);
        m.hp += after.hp - before.hp; m.mp += after.mp - before.mp;
      }
      this.clamp(id);
      return ups;
    },
    healAll() { for (const id in this.members) { const s = this.stats(id); this.members[id].hp = s.hp; this.members[id].mp = s.mp; } },
    sellPrice(itemId) { const it = TH.data.items[itemId]; return it && it.price ? Math.floor(it.price / 2) : 0; },
  });
  P.reset.bind(P);
})();
