(() => {
  'use strict';
  const body = document.body;
  const root = body.dataset.root || '.';
  const islandId = body.dataset.island || '';
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const islands = {
    'truong-sa-lon': {name:'Trường Sa Lớn', images:['images/truong-sa-lon-1.jpg','images/truong-sa-lon-2.jpg','images/truong-sa-lon-3.jpg'], greeting:'audio/chao-truong-sa-lon.mp3'},
    'sinh-ton': {name:'Sinh Tồn', images:['images/island-illustration.svg'], greeting:'audio/chao-sinh-ton.mp3'},
    'song-tu-tay': {name:'Song Tử Tây', images:['images/island-illustration.svg'], greeting:'audio/chao-song-tu-tay.mp3'},
    'an-bang': {name:'An Bang', images:['images/island-illustration.svg'], greeting:'audio/chao-an-bang.mp3'}
  };

  // Clock: always display Vietnam time (UTC+7), independent of the device timezone.
  const clockFormatter = new Intl.DateTimeFormat('vi-VN', {
    timeZone:'Asia/Ho_Chi_Minh', weekday:'short', year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false
  });
  function updateClock() {
    const value = clockFormatter.format(new Date()) + ' (UTC+7)';
    document.querySelectorAll('[data-vn-clock]').forEach(el => { el.textContent = value; });
  }
  updateClock(); window.setInterval(updateClock, 1000);

  // Optional real site-wide analytics. Configure your own GoatCounter site code in docs/README.md.
  const analyticsCode = document.documentElement.dataset.goatcounter || body.dataset.goatcounter || '';
  const countEls = [...document.querySelectorAll('[data-visit-count]')];
  const noteEls = [...document.querySelectorAll('[data-visit-note]')];
  if (analyticsCode && !/YOUR[-_ ]?SITE|example/i.test(analyticsCode)) {
    const script = document.createElement('script');
    script.async = true; script.src = 'https://gc.zgo.at/count.js';
    script.dataset.goatcounter = analyticsCode.replace(/\/$/, '') + '/count';
    script.onload = () => {
      const pagePath = window.location.pathname || '/';
      const counterUrl = analyticsCode.replace(/\/$/, '') + '/counter/' + encodeURIComponent(pagePath) + '.json';
      fetch(counterUrl, {mode:'cors', cache:'no-store'})
        .then(response => { if (!response.ok) throw new Error('Counter endpoint unavailable'); return response.json(); })
        .then(data => {
          const count = data.count ?? data.total ?? data.views;
          countEls.forEach(el => { el.textContent = Number.isFinite(Number(count)) ? Number(count).toLocaleString('vi-VN') + ' lượt xem trang này' : 'Đã bật ghi nhận lượt xem'; });
          noteEls.forEach(el => { el.textContent = Number.isFinite(Number(count)) ? 'Số liệu từ dịch vụ thống kê trực tuyến.' : 'Đang ghi nhận truy cập; chưa đọc được bộ đếm công khai.'; });
        })
        .catch(() => {
          countEls.forEach(el => { el.textContent = 'Đã bật ghi nhận lượt xem'; });
          noteEls.forEach(el => { el.textContent = 'Đã gửi dữ liệu thống kê; bộ đếm công khai có thể chưa được bật trong cấu hình dịch vụ.'; });
        });
    };
    script.onerror = () => {
      countEls.forEach(el => { el.textContent = 'Chưa lấy được dữ liệu thống kê'; });
    };
    document.head.appendChild(script);
  }

  // Full-page zoom transition from homepage to a separate island URL.
  const overlay = document.getElementById('transition-overlay');
  const label = document.getElementById('transition-label');
  document.querySelectorAll('a.island-link').forEach(link => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const href = link.getAttribute('href');
      if (!href) return;
      try { sessionStorage.setItem('dao-transition-enter', '1'); } catch (_) {}
      if (!overlay || reducedMotion) return;
      event.preventDefault();
      if (label) label.textContent = 'Đang tiến vào ' + (link.dataset.islandName || 'đảo') + '…';
      overlay.classList.add('active');
      window.setTimeout(() => { window.location.href = href; }, 680);
    });
  });
  let arrivedFromSelection = false;
  try {
    arrivedFromSelection = sessionStorage.getItem('dao-transition-enter') === '1';
    if (arrivedFromSelection) {
      sessionStorage.removeItem('dao-transition-enter');
      if (!reducedMotion) body.classList.add('page-enter');
    }
  } catch (_) {}
  document.querySelectorAll('.island-nav a').forEach(link => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0 || reducedMotion || !overlay) return;
      const href = link.getAttribute('href'); if (!href || href === '#') return;
      event.preventDefault();
      try { sessionStorage.setItem('dao-transition-enter', '1'); } catch (_) {}
      if (label) label.textContent = 'Đang chuyển hải trình…';
      overlay.classList.add('active');
      window.setTimeout(() => { window.location.href = href; }, 600);
    });
  });

  // Central audio policy: any other media playback pauses the island greeting.
  const greeting = document.getElementById('island-greeting');
  function stopGreeting() {
    if (!greeting) return;
    greeting.pause();
    try { greeting.currentTime = 0; } catch (_) {}
  }
  document.addEventListener('play', event => {
    const target = event.target;
    if (target instanceof HTMLMediaElement && target !== greeting) stopGreeting();
  }, true);
  document.addEventListener('click', event => {
    const soundControl = event.target.closest('video, audio, [data-sound-action]');
    if (soundControl && soundControl !== greeting) stopGreeting();
  }, true);
  // Greeting is attempted after arrival from a user-selected island. Browsers may block autoplay;
  // in that case the visitor can start it after a direct interaction.
  if (greeting && arrivedFromSelection) {
    const attempt = () => greeting.play().catch(() => {});
    if (document.readyState === 'complete') attempt();
    else window.addEventListener('load', attempt, {once:true});
  }

  // Gallery: one 5-second interval, shared by auto-advance and manual controls.
  const mainImage = document.getElementById('gallery-main-image');
  const galleryThumbs = [...document.querySelectorAll('.gallery-thumbnail')];
  const prev = document.getElementById('gallery-prev');
  const next = document.getElementById('gallery-next');
  if (mainImage && islandId && islands[islandId]) {
    const data = islands[islandId];
    const images = data.images.map(path => root + '/' + path);
    let index = 0;
    let timer = null;
    const gallery = mainImage.closest('.gallery-panel');
    function showImage(nextIndex, animate=true) {
      index = (nextIndex + images.length) % images.length;
      if (animate) mainImage.classList.add('changing');
      const target = images[index];
      const apply = () => {
        mainImage.src = target;
        mainImage.onload = () => mainImage.classList.remove('changing');
        if (mainImage.complete) window.setTimeout(() => mainImage.classList.remove('changing'), 80);
      };
      if (animate) window.setTimeout(apply, 110); else apply();
      galleryThumbs.forEach((thumb, i) => thumb.classList.toggle('active', i === index));
    }
    function resetTimer() {
      if (timer) window.clearInterval(timer);
      if (images.length > 1 && !document.hidden) timer = window.setInterval(() => showImage(index + 1), 5000);
    }
    function manualMove(delta) { showImage(index + delta); resetTimer(); }
    if (prev) prev.addEventListener('click', () => manualMove(-1));
    if (next) next.addEventListener('click', () => manualMove(1));
    galleryThumbs.forEach((thumb, i) => thumb.addEventListener('click', () => { showImage(i); resetTimer(); }));
    if (gallery) {
      let touchX = null;
      gallery.addEventListener('touchstart', e => { touchX = e.changedTouches[0]?.clientX ?? null; }, {passive:true});
      gallery.addEventListener('touchend', e => {
        if (touchX === null) return;
        const delta = touchX - (e.changedTouches[0]?.clientX ?? touchX); touchX = null;
        if (Math.abs(delta) > 45) manualMove(delta > 0 ? 1 : -1);
      }, {passive:true});
      gallery.addEventListener('mouseenter', () => { if (timer) window.clearInterval(timer); });
      gallery.addEventListener('mouseleave', resetTimer);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { if (timer) window.clearInterval(timer); timer = null; }
      else resetTimer();
    });
    // Preload the next image to reduce perceived delay.
    if (images.length > 1) { const preload = new Image(); preload.src = images[1]; }
    resetTimer();
  }

  // Keep the decorative boat smooth and avoid JS animation loops.
  const shipLane = document.querySelector('.ship-lane');
  if (shipLane && document.hidden) shipLane.classList.add('paused');
  document.addEventListener('visibilitychange', () => {
    if (shipLane) shipLane.classList.toggle('paused', document.hidden);
  });
})();
