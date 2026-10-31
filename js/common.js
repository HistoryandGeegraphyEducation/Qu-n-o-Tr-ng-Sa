/* common.js — tiện ích dùng chung. Nạp đầu tiên trên mọi trang. */
(() => {
  'use strict';
  const body = document.body;
  window.DaoTS = {
    root: body.dataset.root || '.',
    islandId: body.dataset.island || '',
    reducedMotion: !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches),
    // true khi tab đang bị ẩn; các module dùng để không làm việc vô ích
    isHidden: () => document.hidden
  };
  // Tab bị ẩn → CSS tạm dừng hoạt ảnh trang trí (thuyền, sóng…), tiết kiệm pin.
  const sync = () => document.documentElement.classList.toggle('page-hidden', document.hidden);
  document.addEventListener('visibilitychange', sync);
  sync();

  // Chạy ngoại tuyến (chỉ khi từ https/localhost). Thêm ?nosw vào địa chỉ để gỡ bản lưu khi đang chỉnh sửa.
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    if (/[?&]nosw\b/.test(location.search)) {
      navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
      if (window.caches) caches.keys().then(ks => ks.forEach(k => caches.delete(k)));
    } else {
      window.addEventListener('load', () => navigator.serviceWorker.register(window.DaoTS.root + '/sw.js').catch(() => {}));
    }
  }
})();
