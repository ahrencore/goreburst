/* Gore Burst 2.0 - safe Home Screen update prompt.
   Never refresh an active level. No Supabase/game/shop/frame changes. */
(() => {
  'use strict';
  const INITIAL_VERSION = '2026.11.08.6';
  const VERSION_URL = new URL('version.json', document.baseURI);
  const SW_URL = new URL('sw.js', document.baseURI);
  const KEY = 'gb_seen_game_version';
  const currentVersion = INITIAL_VERSION;
  const acknowledgedVersion = () => { try { return localStorage.getItem(KEY); } catch (_) { return null; } };
  let pending = null;
  let modal = null;
  let checking = false;

  const versionOk = value => /^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(value || '');
  function inLevel() {
    const game = document.getElementById('game');
    if (!game) return false;
    const style = getComputedStyle(game);
    return !game.hidden && style.display !== 'none' && style.visibility !== 'hidden' && game.getBoundingClientRect().width > 0 && game.getBoundingClientRect().height > 0;
  }
  function safeToNotify() {
    if (document.visibilityState === 'hidden' || inLevel()) return false;
    // Restrict interruption to main-menu when its container is present.
    const menu = document.getElementById('menu');
    if (!menu) return true;
    const style = getComputedStyle(menu);
    return !menu.hidden && style.display !== 'none' && style.visibility !== 'hidden';
  }
  function hide() {
    if (modal) { modal.remove(); modal = null; }
  }
  function showIfSafe() {
    if (!pending || modal || !safeToNotify()) return;
    modal = document.createElement('div');
    modal.className = 'gb-pwa-update-backdrop';
    modal.innerHTML = `<div class="gb-pwa-update-card" role="dialog" aria-modal="true" aria-labelledby="gb-pwa-update-heading">
      <h2 id="gb-pwa-update-heading">THE CARNIVAL HAS CHANGED!</h2>
      <p>Mr. Walker has prepared an update. Install it now or continue playing and update later.</p>
      <div class="gb-pwa-update-buttons"><button type="button" data-gb-update-now>UPDATE NOW</button><button type="button" data-gb-update-later>UPDATE LATER</button></div>
    </div>`;
    document.body.appendChild(modal);
    modal.querySelector('[data-gb-update-now]').addEventListener('click', async () => {
      if (inLevel()) { hide(); return; }
      const target = pending;
      // Navigation busts cache for HTML; existing CSS/JS cache directives remain server-managed.
      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration(SW_URL);
          if (reg) {
            await reg.update();
            if (reg.waiting) reg.waiting.postMessage({type:'GB_ACTIVATE_UPDATE'});
          }
        }
      } catch (e) { console.warn('GB update worker check:',e); }
      try { localStorage.setItem(KEY,target); } catch (_) {}
      pending = null; hide();
      const url = new URL(window.location.href);
      url.searchParams.set('gb_version',target);
      window.location.replace(url.href);
    });
    modal.querySelector('[data-gb-update-later]').addEventListener('click',() => { pending=null; hide(); });
    modal.querySelector('[data-gb-update-now]').focus();
  }
  async function check() {
    if (checking || document.visibilityState === 'hidden') return;
    checking = true;
    try {
      const response = await fetch(VERSION_URL.href + '?t=' + Date.now(), {cache:'no-store'});
      if (!response.ok) return;
      const data = await response.json();
      const remote = data && data.version;
      if (!versionOk(remote)) return;
      // Baseline this session on the JS build version, not localStorage, to avoid suppressing new installs.
      if (remote === currentVersion) { pending = null; hide(); return; }
      // After UPDATE NOW, don't keep prompting for the same target if an old JS file is cached.
      if (remote === acknowledgedVersion()) { pending = null; hide(); return; }
      pending = remote; showIfSafe();
    } catch (err) { /* offline: continue using running session */ }
    finally { checking = false; }
  }
  function installStyle() {
    const s = document.createElement('style');
    s.textContent = `.gb-pwa-update-backdrop{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:20px;background:rgba(13,1,21,.82);backdrop-filter:blur(7px)}
.gb-pwa-update-card{width:min(100%,390px);padding:24px 18px;color:#ffe4f4;text-align:center;border:2px solid #e76bba;border-radius:19px;background:linear-gradient(160deg,#35123a,#1a0c28);box-shadow:0 0 24px #d44b9c88, inset 0 0 13px #a32c6944;font-family:Georgia,serif}
.gb-pwa-update-card h2{margin:0 0 15px;color:#ffabd9;text-shadow:0 0 12px #f25aaf;font-size:20px}
.gb-pwa-update-card p{font:14px/1.6 system-ui,sans-serif;margin:0 0 18px}
.gb-pwa-update-buttons{display:flex;gap:9px;flex-wrap:wrap;justify-content:center}
.gb-pwa-update-buttons button{padding:11px 15px;border:1px solid #f190c7;border-radius:25px;background:linear-gradient(#e765b1,#843064);box-shadow:0 0 10px #ee76ba66;color:white;font:700 13px system-ui;cursor:pointer}
.gb-pwa-update-buttons button+button{background:#2c1737}`;
    document.head.appendChild(s);
  }
  async function init() {
    installStyle();
    try { if ('serviceWorker' in navigator) await navigator.serviceWorker.register(SW_URL.href,{scope:new URL('./',document.baseURI).pathname}); } catch(e) { console.warn('GB worker registration failed:',e); }
    check();
    document.addEventListener('visibilitychange', () => {if (document.visibilityState === 'visible') {check();showIfSafe();}});
    window.addEventListener('focus', () => {check();showIfSafe();});
    // Periodically check while open; never show dialog mid-level.
    setInterval(() => {check();showIfSafe();}, 60000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
