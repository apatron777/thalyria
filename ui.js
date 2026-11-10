// Interfaz HTML superpuesta: reloj, cartel de zona, avisos, FPS y menú
(function () {
  'use strict';
  const TH = window.TH;
  const $ = (id) => document.getElementById(id);
  TH.ui = {
    init() {
      this.el = {
        time: $('clockTime'), day: $('clockDay'), ico: $('clockIco'), fps: $('fps'),
        banner: $('banner'), bName: $('bannerName'), bSub: $('bannerSub'),
        toast: $('toast'), menu: $('menu'), list: $('menuList'),
      };
      this.showFps = false;
      this._clock = '';
      this._fps = -1;
      this._toastT = 0;
    },
    clock(hour, day) {
      const h = Math.floor(hour);
      const m = Math.floor(((hour - h) * 60) / 10) * 10;
      const s = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + '|' + day;
      if (s === this._clock) return;
      this._clock = s;
      this.el.time.textContent = s.slice(0, 5);
      this.el.day.textContent = 'Día ' + day;
      const isNight = hour < 6 || hour >= 20;
      this.el.ico.className = 'ico ' + (isNight ? 'moon' : hour < 8 || hour >= 18 ? 'dusk' : 'sun');
    },
    frame() {
      if (this.showFps && TH.fps.value !== this._fps) {
        this._fps = TH.fps.value;
        this.el.fps.textContent = this._fps + ' FPS';
      }
    },
    toggleFps(v) {
      this.showFps = v == null ? !this.showFps : v;
      this.el.fps.hidden = !this.showFps;
      this._fps = -1;
    },
    banner(name, sub) {
      this.el.bName.textContent = name;
      this.el.bSub.textContent = sub || '';
      const b = this.el.banner;
      b.classList.remove('show');
      void b.offsetWidth; // reinicia la animación
      b.classList.add('show');
    },
    toast(msg) {
      const t = this.el.toast;
      t.textContent = msg;
      t.hidden = false;
      clearTimeout(this._toastT);
      this._toastT = setTimeout(() => { t.hidden = true; }, 1800);
    },
    showMenu(items, onSelect) {
      this.el.list.innerHTML = '';
      items.forEach((it, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'menu-item';
        b.innerHTML = '<span>' + it.label + '</span>' + (it.value ? '<em>' + it.value + '</em>' : '');
        b.addEventListener('pointerdown', (e) => e.stopPropagation());
        b.addEventListener('click', () => onSelect(i));
        this.el.list.appendChild(b);
      });
      this.el.menu.hidden = false;
    },
    markMenu(i) {
      [...this.el.list.children].forEach((b, k) => b.classList.toggle('sel', k === i));
    },
    hideMenu() { this.el.menu.hidden = true; },
  };
})();
