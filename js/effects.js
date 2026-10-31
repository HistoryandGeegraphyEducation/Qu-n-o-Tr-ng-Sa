/* effects.js — hiệu ứng nhẹ, chỉ dùng transform/opacity, tự tắt khi bật "giảm chuyển động".
   1) Hiện dần khi cuộn ([data-reveal])  2) Thẻ đảo nghiêng nhẹ theo con trỏ (chuột)  3) Thị sai (parallax) cho cảnh nền
   4) Thanh mục lục trang đảo: đổ bóng khi dính + tô mục đang xem. */
(() => {
  'use strict';
  const { reducedMotion } = window.DaoTS;
  const html = document.documentElement;
  window.__revealOk = true; // báo cho đoạn an toàn trong <head> rằng JS đã chạy

  /* ---- 1. Hiện dần khi cuộn ---- */
  const items = [...document.querySelectorAll('[data-reveal]')];
  if (reducedMotion || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(el => io.observe(el));
  }

  /* ---- 2. Thẻ nghiêng nhẹ (chỉ chuột/bút trên máy có hover) ---- */
  if (!reducedMotion && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('.island-card').forEach(card => {
      let raf = 0, ex = 0, ey = 0;
      const apply = () => { raf = 0; card.style.setProperty('--ry', (ex * 5).toFixed(2) + 'deg'); card.style.setProperty('--rx', (-ey * 5).toFixed(2) + 'deg'); };
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        ex = (e.clientX - r.left) / r.width - 0.5; ey = (e.clientY - r.top) / r.height - 0.5;
        if (!raf) raf = requestAnimationFrame(apply);
      });
      card.addEventListener('pointerleave', () => { ex = ey = 0; if (!raf) raf = requestAnimationFrame(apply); });
    });
  }

  /* ---- 3. Thị sai cho cảnh nền: mây và mặt trời/trăng trôi chậm hơn lúc cuộn ---- */
  if (!reducedMotion) {
    const hosts = [...document.querySelectorAll('[data-scene]')];
    if (hosts.length) {
      let ticking = false;
      const update = () => {
        ticking = false;
        const y = Math.min(window.scrollY, 600);
        hosts.forEach(h => h.style.setProperty('--py', (y * 0.14).toFixed(1) + 'px'));
      };
      window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    }
  }

  /* ---- 4. Mục lục trang đảo ---- */
  const tabs = document.getElementById('page-tabs');
  if (tabs && 'IntersectionObserver' in window) {
    // đổ bóng khi thanh đang dính ở đầu màn hình
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'height:1px;margin-bottom:-1px;pointer-events:none';
    tabs.parentNode.insertBefore(sentinel, tabs);
    new IntersectionObserver(([e]) => tabs.classList.toggle('is-stuck', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(sentinel);
    // tô mục đang xem
    const links = [...tabs.querySelectorAll('a')];
    const byId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.removeAttribute('aria-current'));
      const a = byId.get(en.target.id); if (a) a.setAttribute('aria-current', 'location');
    }), { rootMargin: '-35% 0px -55% 0px' });
    byId.forEach((_, id) => { const el = document.getElementById(id); if (el) spy.observe(el); });
  }
})();
