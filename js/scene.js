/* scene.js — cảnh nền biển động cho trang chủ (data-scene="home") và dải tiêu đề trang đảo (data-scene="island").
   Các lớp (trời, sao, mặt trời/trăng, mây, đảo nhỏ, 3 lớp sóng) vẽ bằng CSS + SVG trong images/bg/.
   Màu đổi theo giờ qua thuộc tính html[data-sky] do sky-clock.js đặt; mặt trời/trăng đi theo cung như đồng hồ.
   Trang chủ có thêm chiếc thuyền chạy theo chiều Tây → Đông (trái → phải), hú còi mỗi lượt khởi hành. */
(() => {
  'use strict';
  const hosts = [...document.querySelectorAll('[data-scene]')];
  if (!hosts.length) return;
  const sfxOn = () => window.DaoTS.sfx;

  const sunSVG = (() => { let r = ''; for (let a = 0; a < 360; a += 45) r += `<line x1="0" y1="-17" x2="0" y2="-22" transform="rotate(${a})"/>`; return `<svg viewBox="-24 -24 48 48" aria-hidden="true"><g class="sun-rays">${r}</g><circle r="13"/></svg>`; })();
  const boatSVG = `
<svg viewBox="0 0 120 52" aria-hidden="true" focusable="false" overflow="visible">
  <path class="wake" d="M6 44 Q-30 46 -78 49 Q-30 40 6 38Z"/>
  <g class="steam"><circle cx="75" cy="6" r="4"/><circle cx="75" cy="6" r="3.4"/><circle cx="75" cy="6" r="3"/></g>
  <path d="M4 30H108Q119 30 113 37L101 47H14Q8 47 4 41Z" fill="#dfe7ec"/>
  <path d="M6 41H103L101 47H14Q8 47 6 43Z" fill="#b33a3a"/>
  <rect x="30" y="16" width="48" height="14" rx="2" fill="#f4f7f9"/>
  <rect x="35" y="20" width="9" height="6" rx="1" fill="#38607a"/><rect x="48" y="20" width="9" height="6" rx="1" fill="#38607a"/><rect x="61" y="20" width="9" height="6" rx="1" fill="#38607a"/>
  <rect x="70" y="8" width="10" height="9" rx="1.5" fill="#3b4a5a"/>
  <line x1="46" y1="16" x2="46" y2="1" stroke="#3b4a5a" stroke-width="1.4"/>
  <rect x="46" y="1" width="18" height="12" fill="#da251d"/>
  <path d="M55 3.4l1.3 3.5 3.7.1-2.9 2.3 1 3.6-3.1-2.1-3.1 2.1 1-3.6-2.9-2.3 3.7-.1z" fill="#ffd400" transform="scale(.62) translate(34 2)"/>
</svg>`;
  const speakerOn = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const speakerOff = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  const state = { body: null };
  function build(host) {
    const isHome = host.dataset.scene === 'home';
    const scene = document.createElement('div');
    scene.className = 'scene';
    scene.setAttribute('aria-hidden', 'true');
    // Keep the original moving boat visible above the wave layers on both home and island banners.
    // The scene host is reused by all four island pages via data-scene="island". 
    scene.innerHTML =
      '<div class="sc-sky"></div><div class="sc-stars"></div>' +
      `<div class="sc-body sc-sun">${sunSVG}</div>` +
      '<div class="sc-body sc-moon"><svg viewBox="-22 -22 44 44"><circle class="moon-dark" r="18"/><path class="moon-lit" d=""/></svg></div>' +
      '<div class="sc-cloud"><i></i></div><div class="sc-islet"></div>' +
      '<div class="sc-wave sc-wave-far"><i></i></div>' +
      `<div class="sc-lane"><div class="sc-boat"><div class="sc-boat-i">${boatSVG}</div></div></div>` +
      '<div class="sc-wave sc-wave-mid"><i></i></div><div class="sc-wave sc-wave-near"></div>';
    host.insertBefore(scene, host.firstChild);
    const boatLane = scene.querySelector('.sc-lane');
    if (boatLane) boatLane.style.zIndex = '4';

    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'sfx-toggle';
    const sync = () => {
      const on = sfxOn() ? sfxOn().isEnabled() : false;
      btn.innerHTML = on ? speakerOn : speakerOff;
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng');
      btn.title = on ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng';
    };
    btn.addEventListener('click', () => { if (sfxOn()) sfxOn().toggle(); sync(); });
    document.addEventListener('daots:sound', sync);
    sync();
    host.appendChild(btn);
    initBoat(scene.querySelector('.sc-boat'));
  }

  /* ----- thuyền: hú còi mỗi lượt khởi hành, chạm vào thuyền cũng hú ----- */
  function initBoat(boat) {
    if (!boat) return;
    boat.setAttribute('role', 'button'); boat.setAttribute('tabindex', '0'); boat.setAttribute('aria-label', 'Hú còi thuyền');
    let hootTimer = 0;
    function hoot() {
      if (document.hidden) return;
      boat.classList.remove('is-hooting'); void boat.offsetWidth; boat.classList.add('is-hooting'); // khói + hơi nước luôn hiện
      window.clearTimeout(hootTimer); hootTimer = window.setTimeout(() => boat.classList.remove('is-hooting'), 1700);
      if (sfxOn() && !document.body.classList.contains('intro-active')) sfxOn().horn(); // âm thanh chỉ khi được phép
    }
    boat.addEventListener('click', hoot);
    boat.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hoot(); } });
    // Thuyền vừa vào hẳn khung hình thì hú còi + nhả khói (mỗi lượt chạy một lần)
    if ('IntersectionObserver' in window) {
      let inView = false;
      new IntersectionObserver(entries => entries.forEach(en => {
        if (en.isIntersecting && !inView) { inView = true; hoot(); } else if (!en.isIntersecting) inView = false;
      }), { threshold: 0.9 }).observe(boat);
    }
    // Video mở đầu vừa đóng: nếu thuyền đang trong khung hình thì hú một tiếng chào
    document.addEventListener('daots:intro-closed', () => window.setTimeout(() => {
      const r = boat.getBoundingClientRect(); if (r.right > 0 && r.left < window.innerWidth) hoot();
    }, 500));
  }

  /* ----- cập nhật theo giờ: vị trí mặt trời / trăng + pha trăng ----- */
  function place(host, s) {
    const home = host.dataset.scene === 'home';
    const lo = home ? 8 : 46, hi = home ? 92 : 94, horizon = 64, amp = home ? 50 : 44;
    const pos = f => ({ x: lo + (hi - lo) * (1 - Math.cos(Math.PI * f)) / 2, y: horizon - amp * Math.sin(Math.PI * f) });
    const clamp = v => Math.max(-0.15, Math.min(1.15, v));
    const a = pos(clamp(s.p)), m = pos(clamp(s.q));
    host.style.setProperty('--sun-x', a.x.toFixed(1) + '%'); host.style.setProperty('--sun-y', a.y.toFixed(1) + '%');
    host.style.setProperty('--moon-x', m.x.toFixed(1) + '%'); host.style.setProperty('--moon-y', m.y.toFixed(1) + '%');
    const lit = host.querySelector('.moon-lit');
    if (lit && window.DaoTS.skyClock) lit.setAttribute('d', window.DaoTS.skyClock.moonPath(s.age, 18));
  }
  function update(s) { if (s) hosts.forEach(h => place(h, s)); }

  hosts.forEach(build);
  update(window.DaoTS.sky);
  document.addEventListener('daots:sky', e => update(e.detail));
})();
