// Input unificado: teclado + joystick virtual + botones táctiles
(function () {
  'use strict';
  const TH = window.TH;
  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    Space: 'a', Enter: 'a', KeyE: 'a',
    ShiftLeft: 'b', ShiftRight: 'b', KeyX: 'b', Backspace: 'b',
    Escape: 'menu', KeyM: 'menu', KeyF: 'fps', KeyT: 'time', KeyQ: 'swap', Tab: 'swap', KeyR: 'res', KeyC: 'res', KeyZ: 'b', KeyV: 'epoch', Digit1: 'p1', Digit2: 'p2', Digit3: 'p3', Digit4: 'p4', Numpad1: 'p1', Numpad2: 'p2', Numpad3: 'p3', Numpad4: 'p4',
  };

  const I = (TH.input = {
    held: new Set(),
    edge: new Set(),
    joy: { x: 0, y: 0 },
    init() {
      addEventListener('keydown', (e) => {
        const a = KEYMAP[e.code];
        if (!a) return;
        if (e.code.startsWith('Arrow') || e.code === 'Space' || e.code === 'Backspace' || e.code === 'Tab') e.preventDefault();
        if (!e.repeat) I.edge.add(a);
        I.held.add(a);
      });
      addEventListener('keyup', (e) => { const a = KEYMAP[e.code]; if (a) I.held.delete(a); });
      addEventListener('blur', () => I.held.clear());

      // joystick virtual
      const stick = document.getElementById('stick');
      const knob = document.getElementById('knob');
      let sid = null;
      const move = (e) => {
        const r = stick.getBoundingClientRect();
        let dx = e.clientX - (r.left + r.width / 2);
        let dy = e.clientY - (r.top + r.height / 2);
        const m = Math.hypot(dx, dy);
        const R = r.width * 0.34;
        if (m > R) { dx *= R / m; dy *= R / m; }
        knob.style.transform = `translate(${dx}px,${dy}px)`;
        const x = dx / R, y = dy / R;
        if (Math.hypot(x, y) < 0.2) { I.joy.x = 0; I.joy.y = 0; } else { I.joy.x = x; I.joy.y = y; }
      };
      if (stick) {
        stick.addEventListener('pointerdown', (e) => { sid = e.pointerId; stick.setPointerCapture(sid); move(e); });
        stick.addEventListener('pointermove', (e) => { if (e.pointerId === sid) move(e); });
        const end = (e) => { if (e.pointerId !== sid) return; sid = null; I.joy.x = 0; I.joy.y = 0; knob.style.transform = ''; };
        stick.addEventListener('pointerup', end);
        stick.addEventListener('pointercancel', end);
      }
      const bind = (id, a) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('pointerdown', (e) => { e.preventDefault(); I.edge.add(a); I.held.add(a); el.classList.add('on'); });
        const up = () => { I.held.delete(a); el.classList.remove('on'); };
        el.addEventListener('pointerup', up);
        el.addEventListener('pointercancel', up);
        el.addEventListener('pointerleave', up);
      };
      bind('btnA', 'a');
      bind('btnB', 'b');
      bind('btnMenu', 'menu');
      bind('btnSwap', 'swap');
      // cruceta: pulsación = un paso; mantener = repetición, como en los menús de consola
      const pad = document.querySelector('.pad');
      I.padEl = pad;
      document.querySelectorAll('.dp').forEach((el) => {
        const a = el.dataset.dir;
        let t1 = 0, t2 = 0;
        const stop = () => { clearTimeout(t1); clearInterval(t2); I.held.delete(a); el.classList.remove('on'); };
        el.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          stop();
          I.edge.add(a); I.held.add(a); el.classList.add('on');
          t1 = setTimeout(() => { t2 = setInterval(() => I.edge.add(a), 110); }, 380);
        });
        el.addEventListener('pointerup', stop);
        el.addEventListener('pointercancel', stop);
        el.addEventListener('pointerleave', stop);
      });
    },
    axis(out) {
      let x = 0, y = 0;
      if (I.held.has('left')) x -= 1;
      if (I.held.has('right')) x += 1;
      if (I.held.has('up')) y -= 1;
      if (I.held.has('down')) y += 1;
      if (!x && !y) { x = I.joy.x; y = I.joy.y; }
      const m = Math.hypot(x, y);
      if (m > 1) { x /= m; y /= m; }
      out.x = x; out.y = y;
      return out;
    },
    pressed(a) { if (I.edge.has(a)) { I.edge.delete(a); return true; } return false; },
    down(a) { return I.held.has(a); },
    endFrame() { I.edge.clear(); },
    // joystick al caminar por el mapa; cruceta en todo lo demás
    setPadMode(dpad) {
      if (!I.padEl || I.dpad === dpad) return;
      I.dpad = dpad;
      I.padEl.classList.toggle('dpad-mode', dpad);
      I.joy.x = 0; I.joy.y = 0;
      const knob = document.getElementById('knob');
      if (knob) knob.style.transform = '';
      for (const d of ['up', 'down', 'left', 'right']) I.held.delete(d);
    },
  });
})();
