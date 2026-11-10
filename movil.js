// Capa móvil: Thalyria pensado para smartphone.
// - En horizontal: el juego a toda la pantalla, joystick flotante (aparece donde pones el dedo, en la mitad izquierda),
//   botones A/B/⇄ translúcidos a la derecha y, fuera del paseo, todo se juega tocando la pantalla (sin mando encima).
// - Empujar el joystick a fondo = correr. Vibración en golpes, timing perfecto, cofres y subidas de nivel.
// - Pantalla completa + bloqueo en horizontal al primer toque, aviso para girar el móvil, pausa al salir de la app.
(function () {
  'use strict';
  const TH = window.TH, I = TH.input, S = TH.settings;
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;

  // ---------- ajustes propios del móvil ----------
  const KEY = 'thalyria.movil.v1';
  S.vib = true; S.autorun = true; S.fs = true;
  try { const o = JSON.parse(localStorage.getItem(KEY) || '{}'); for (const k of ['vib', 'autorun', 'fs']) if (typeof o[k] === 'boolean') S[k] = o[k]; } catch (e) { /* sin almacenamiento */ }
  S.saveMob = () => { try { localStorage.setItem(KEY, JSON.stringify({ vib: S.vib, autorun: S.autorun, fs: S.fs })); } catch (e) { /* sin almacenamiento */ } };

  const coarse = matchMedia('(pointer:coarse)');
  const isMob = () => coarse.matches || (navigator.maxTouchPoints > 0 && matchMedia('(hover:none)').matches);
  const sync = () => {
    root.classList.toggle('mob', isMob());
    root.classList.toggle('land', innerWidth > innerHeight);
    root.classList.toggle('short', innerHeight < 520);
    restStick();
    rotCheck();
  };

  // ---------- vibración ----------
  const HAP = { hit: 14, magic: 10, hurt: 32, block: 8, break: 45, perfect: [8, 30, 14], encounter: [20, 50, 30], level: [15, 40, 15, 40, 40], chest: 18, epoch: [10, 20, 10], res: 10 };
  TH.haptic = (p) => { if (!S.vib || !navigator.vibrate || !isMob()) return; try { navigator.vibrate(p); } catch (e) { /* no disponible */ } };
  const sfx0 = TH.sfx;
  TH.sfx = (n) => { if (HAP[n]) TH.haptic(HAP[n]); return sfx0(n); };
  for (const id of ['btnA', 'btnB', 'btnSwap']) { const el = $(id); if (el) el.addEventListener('pointerdown', () => TH.haptic(6)); }

  // ---------- modo de juego (paseo / resto) ----------
  const setPad0 = I.setPadMode.bind(I);
  I.setPadMode = (dpad) => { root.classList.toggle('walk', !dpad); setPad0(dpad); };

  // ---------- joystick flotante (horizontal) ----------
  const stick = $('stick'), knob = $('knob');
  let sid = null, ox = 0, oy = 0;
  function restStick() {
    if (!stick || sid !== null) return;
    const sl = parseFloat(getComputedStyle(root).getPropertyValue('--sl')) || 0;
    const z = S.touch || 1;
    stick.style.left = (Math.max(14, sl) + 70 * z) + 'px';
    stick.style.top = (innerHeight - 78 * z) + 'px';
  }
  const liveMode = () => root.classList.contains('mob') && root.classList.contains('land') && root.classList.contains('walk');
  document.addEventListener('pointerdown', (e) => {
    if (!liveMode() || sid !== null) return;
    if (TH.res && TH.res.wheel) return; // la rueda de Resonancias se elige tocándola
    if (e.target.closest('button,.panel,#powBar,.btns,#mRot')) return;
    if (e.clientX > innerWidth * 0.5 || e.clientY < innerHeight * 0.22) return;
    e.preventDefault(); e.stopPropagation();
    sid = e.pointerId; ox = e.clientX; oy = e.clientY;
    stick.style.left = ox + 'px'; stick.style.top = oy + 'px';
    stick.classList.add('live');
  }, { capture: true, passive: false });
  document.addEventListener('pointermove', (e) => {
    if (e.pointerId !== sid) return;
    const R = 44 * (S.touch || 1);
    let dx = e.clientX - ox, dy = e.clientY - oy;
    const m = Math.hypot(dx, dy);
    // si el dedo se aleja mucho, la base le sigue (como en los juegos de móvil)
    if (m > R * 1.6) { const k = (m - R * 1.6) / m; ox += dx * k; oy += dy * k; stick.style.left = ox + 'px'; stick.style.top = oy + 'px'; dx = e.clientX - ox; dy = e.clientY - oy; }
    const mm = Math.hypot(dx, dy);
    if (mm > R) { dx *= R / mm; dy *= R / mm; }
    knob.style.transform = `translate(${dx}px,${dy}px)`;
    const x = dx / R, y = dy / R;
    if (Math.hypot(x, y) < 0.18) { I.joy.x = 0; I.joy.y = 0; } else { I.joy.x = x; I.joy.y = y; }
  }, { capture: true });
  const endStick = (e) => {
    if (e.pointerId !== sid) return;
    sid = null; I.joy.x = 0; I.joy.y = 0; knob.style.transform = '';
    stick.classList.remove('live');
    restStick();
  };
  document.addEventListener('pointerup', endStick, true);
  document.addEventListener('pointercancel', endStick, true);

  // ---------- botón contextual: Atrás en combate, Saltar en cinemáticas ----------
  const ctx = document.createElement('button');
  ctx.id = 'mCtx'; ctx.type = 'button'; ctx.className = 'panel'; ctx.hidden = true;
  $('stage').querySelector('.frame').appendChild(ctx);
  let ctxAct = null;
  ctx.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); if (ctxAct) { I.edge.add(ctxAct); TH.haptic(6); } });
  const BACK = new Set(['command', 'skills', 'items', 'combos', 'ecos', 'summons', 'target', 'ally']);
  function ctxTick() {
    let lab = null; ctxAct = null;
    if (isMob()) {
      const top = TH.scenes.top();
      if (top instanceof TH.BattleScene && !top.seq && BACK.has(top.state) && !(top.state === 'command' && !(top.plan && top.plan.length))) { lab = '↩ Atrás'; ctxAct = 'b'; }
      else if (TH.scenes.registry.cine && top === TH.scenes.registry.cine) { lab = 'Saltar ⏭'; ctxAct = 'menu'; }
    }
    if (lab) { if (ctx.textContent !== lab) ctx.textContent = lab; ctx.hidden = false; } else ctx.hidden = true;
    // correr empujando el joystick a fondo
    I.joyRun = S.autorun && Math.hypot(I.joy.x, I.joy.y) > 0.92;
  }

  // créditos: tocar = saltar
  const cr = $('credits');
  if (cr) cr.addEventListener('pointerdown', () => I.edge.add('a'));

  // ---------- pantalla completa + horizontal ----------
  const inFrame = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
  TH.fullscreen = (on) => {
    const d = document;
    try {
      if (on === false || (on === undefined && d.fullscreenElement)) { if (d.fullscreenElement) d.exitFullscreen(); return; }
      const rq = root.requestFullscreen || root.webkitRequestFullscreen;
      if (!rq || d.fullscreenElement) return;
      const p = rq.call(root, { navigationUI: 'hide' });
      const lock = () => { try { const o = screen.orientation; if (o && o.lock) o.lock('landscape').catch(() => {}); } catch (e) { /* sin bloqueo */ } };
      if (p && p.then) p.then(lock).catch(() => {}); else lock();
    } catch (e) { /* no permitido aquí */ }
  };
  let asked = false;
  document.addEventListener('pointerup', () => {
    if (asked || !isMob() || !S.fs) return;
    asked = true;
    TH.fullscreen(true);
  }, true);

  // ---------- aviso para girar el móvil ----------
  const rot = document.createElement('div');
  rot.id = 'mRot'; rot.hidden = true;
  rot.innerHTML = '<div class="mr-ph"><i></i></div><b>Gira el móvil</b><p>Thalyria está pensado para jugarse en horizontal, con el juego a toda la pantalla.</p><button type="button" class="pm-btn ghost">Jugar en vertical</button>';
  document.body.appendChild(rot);
  let vert = false;
  try { vert = sessionStorage.getItem('thalyria.vertical') === '1'; } catch (e) { /* nada */ }
  rot.querySelector('button').addEventListener('click', () => { vert = true; try { sessionStorage.setItem('thalyria.vertical', '1'); } catch (e) { /* nada */ } rotCheck(); });
  function rotCheck() { rot.hidden = !(isMob() && innerHeight > innerWidth && !vert); }

  // ---------- pausa al salir de la app ----------
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden || !isMob()) return;
    const m = TH.scenes.registry.map;
    if (TH.scenes.top() === m && !m.inCutscene && !m.resSeq) TH.scenes.push('menu', { owner: m });
  });

  // ---------- sin gestos del navegador que molesten ----------
  addEventListener('contextmenu', (e) => { if (isMob()) e.preventDefault(); });
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });

  // ---------- app instalable (solo fuera de un iframe y con https) ----------
  if ('serviceWorker' in navigator && location.protocol === 'https:' && !inFrame) {
    addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }

  // ---------- estilos ----------
  const css = document.createElement('style');
  css.textContent = `
html.mob{--sl:env(safe-area-inset-left,0px);overscroll-behavior:none}
html.mob body{overscroll-behavior:none;-webkit-touch-callout:none;position:fixed;inset:0}
.mob .toast{white-space:normal;max-width:82%;text-align:center}
.mob .menu-item{min-height:40px}
.mob .row{min-height:40px}
.mob .tab{min-height:38px}
.mob .pm-x{width:40px;height:40px}
.mob .menu-btn{width:42px;height:38px}
.mob .title .menu-list{max-height:56vh;overflow:auto;overscroll-behavior:contain}
.mob #powBar button{padding:5px 9px 5px 5px;font-size:12px}
.mob #powBar button i{width:22px;height:22px;font-size:12px}
#mCtx{position:absolute;top:6px;left:50%;transform:translateX(-50%);z-index:8;padding:8px 16px;min-height:40px;font:600 14px var(--ui);color:var(--fg);cursor:pointer}
#mRot{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:30px;text-align:center;background:radial-gradient(ellipse at 50% 40%,#2a2050,#0b0a14 70%);color:var(--fg);line-height:1.4}
#mRot[hidden]{display:none}
#mRot b{font-family:var(--title);font-size:24px;letter-spacing:.12em;color:var(--gold)}
#mRot p{margin:0;max-width:280px;color:var(--muted)}
#mRot .pm-btn{min-height:44px;padding:0 18px;margin-top:8px}
#mRot .mr-ph{width:54px;height:92px;border:3px solid var(--gold);border-radius:10px;position:relative;animation:mrot 2.4s ease-in-out infinite}
#mRot .mr-ph i{position:absolute;left:50%;bottom:5px;width:14px;height:3px;margin-left:-7px;border-radius:2px;background:var(--gold)}
@keyframes mrot{0%,25%{transform:rotate(0)}55%,85%{transform:rotate(-90deg)}100%{transform:rotate(0)}}

/* ---- horizontal: pantalla completa, mando flotante encima ---- */
.mob.land .app{padding:0;gap:0}
.mob.land .stage{padding:0}
.mob.land canvas{border-radius:0;box-shadow:none}
.mob.land .pad{position:fixed;inset:0;display:block;padding:0;pointer-events:none;z-index:9}
.mob.land:not(.walk) .pad{display:none}
.mob.land .pad .dpad{display:none!important}
.mob.land .stick{zoom:1;position:fixed;display:block!important;width:calc(112px*var(--touch,1));height:calc(112px*var(--touch,1));transform:translate(-50%,-50%);opacity:.38;pointer-events:none;transition:opacity .15s;background:radial-gradient(circle,rgba(40,32,70,.55) 0 55%,rgba(26,21,46,.55) 56%)}
.mob.land .stick.live{opacity:.9;transition:none}
.mob.land .knob{transition:transform .08s}
.mob.land .stick.live .knob{transition:none}
.mob.land .btns{position:fixed;right:max(14px,env(safe-area-inset-right,0px));bottom:max(12px,env(safe-area-inset-bottom,0px));pointer-events:auto;opacity:.82;gap:10px}
.mob.land .btn{width:60px;height:60px}
.mob.land #btnB{width:54px;height:54px}
.mob.land #btnSwap{width:42px;height:42px}
.mob.land #btnA{margin-bottom:26px}
.mob.land .res-btn{top:46px;bottom:auto}
.mob.land #powBar{top:88px;bottom:auto}
.mob.land .hint{display:none}
/* título en pantallas bajas: logo a la izquierda, menú a la derecha */
.mob.land.short .title{flex-direction:row;gap:5%}
.mob.land.short .title .menu-list{max-height:78vh;width:min(300px,44%)}
.mob.land.short .title h1{font-size:clamp(22px,5.2cqw,44px)}
`;
  document.head.appendChild(css);

  addEventListener('resize', sync);
  addEventListener('orientationchange', () => setTimeout(sync, 200));
  sync();
  // ticks ligeros fuera del bucle principal para no tocar el motor
  (function loop() { ctxTick(); requestAnimationFrame(loop); })();
})();
