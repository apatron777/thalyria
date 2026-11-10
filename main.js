// Arranque
(function () {
  'use strict';
  const TH = window.TH;
  function boot() {
    TH.renderer.init();
    TH.input.init();
    TH.ui.init();
    TH.dialog.init();
    TH.settings.load();
    TH.lighting.init();
    TH.particles.init();
    TH.music.init();
    TH.res.init();
    TH.scenes.register('map', new TH.MapScene());
    TH.scenes.register('menu', new TH.PartyMenu());
    TH.scenes.register('shop', new TH.ShopScene());
    TH.scenes.register('world', new TH.WorldScene());
    TH.scenes.register('gallery', new TH.GalleryScene());
    TH.scenes.register('battle', new TH.BattleScene());
    TH.scenes.register('cutscene', new TH.CutsceneScene());
    TH.scenes.register('creditsScene', new TH.CreditsScene());
    TH.perf.apply();
    TH.buildObjTexts();

    TH.scenes.register('title', new TH.TitleScene());
    // de fondo, Bruma Salada al anochecer con el faro encendido; encima, el título
    TH.party.reset();
    TH.scenes.push('map', { map: 'brumaSalada', hour: 19.4, count: 1, quiet: true });
    TH.scenes.push('title');

    TH.loop.start(
      (dt) => { TH.scenes.update(dt); TH.perf.tick(dt); TH.objHud.tick(dt); TH.input.endFrame(); },
      () => {
        TH.scenes.render(TH.renderer.ctx); TH.renderer.present(); TH.ui.frame();
        const map = TH.scenes.registry.map;
        TH.input.setPadMode(TH.scenes.top() !== map);
        TH.res.syncHud(map, TH.scenes.top() === map && !map.inCutscene);
      }
    );
    // guarda al salir o al pasar a segundo plano
    const map = TH.scenes.registry.map;
    addEventListener('pagehide', () => map.saveGame());
    document.addEventListener('visibilitychange', () => { if (document.hidden) map.saveGame(); });
    window.__TH = TH;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
