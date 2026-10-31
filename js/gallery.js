/* gallery.js — thư viện ảnh đảo: tự chuyển 5 giây, nút, vuốt, ảnh thu nhỏ.
   Danh sách ảnh từng đảo lấy từ data/islands.js (mục gallery.images). */
(() => {
  'use strict';
  const { root, islandId, reducedMotion } = window.DaoTS;
  const entry = ((window.DaoTSData || {}).islands || []).find(i => i.id === islandId);
  const islands = entry ? { [islandId]: { images: entry.gallery.images, captions: entry.gallery.captions || [], alts: entry.gallery.alts || [], positions: entry.gallery.positions || [] } } : {};
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
    const captionEl = document.getElementById('gallery-caption');
    function showImage(nextIndex, animate=true) {
      index = (nextIndex + images.length) % images.length;
      if (animate) mainImage.classList.add('changing');
      const target = images[index];
      if (captionEl && data.captions[index]) captionEl.textContent = data.captions[index];
      mainImage.alt = data.alts[index] || mainImage.alt;
      mainImage.style.objectPosition = data.positions[index] || '';
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
      if (images.length > 1 && !document.hidden && !reducedMotion) timer = window.setInterval(() => showImage(index + 1), 5000);
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
      // Người dùng bàn phím: ngừng tự chuyển ảnh khi đang thao tác trong thư viện
      gallery.addEventListener('focusin', () => { if (timer) window.clearInterval(timer); timer = null; });
      gallery.addEventListener('focusout', resetTimer);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { if (timer) window.clearInterval(timer); timer = null; }
      else resetTimer();
    });
    mainImage.style.objectPosition = data.positions[0] || '';
    // Preload the next image to reduce perceived delay.
    if (images.length > 1) { const preload = new Image(); preload.src = images[1]; }
    resetTimer();
  }
  // Trang có nhiều video: bấm phát video nào thì các video khác tự tạm dừng.
  document.addEventListener('play', e => {
    if (!e.target.matches || !e.target.matches('.video-panel video')) return;
    document.querySelectorAll('.video-panel video').forEach(v => { if (v !== e.target) v.pause(); });
  }, true);
})();
