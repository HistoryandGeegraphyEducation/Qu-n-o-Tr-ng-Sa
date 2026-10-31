/* sw.js — chạy được ngoại tuyến sau lần mở đầu tiên (chỉ hoạt động khi trang chạy từ https hoặc localhost).
   Mỗi lần phát hành bản mới, ĐỔI VERSION để máy người dùng nhận bản mới. Video/âm thanh không lưu (tệp lớn, truy vấn Range). */
const VERSION = 'dao-ts-v13';
const SHELL = [
  'index.html', 'islands/truong-sa-lon.html', 'islands/sinh-ton.html', 'islands/song-tu-tay.html', 'islands/an-bang.html',
  'style.css', 'data/islands.js', 'manifest.webmanifest', 'favicon.svg',
  'js/common.js', 'js/sfx.js', 'js/compass.js', 'js/sky-clock.js', 'js/instruments.js', 'js/scene.js', 'js/effects.js',
  'js/intro.js', 'js/analytics.js', 'js/transitions.js', 'js/render.js', 'js/gallery.js',
  'images/island-truong-sa-lon.webp', 'images/island-sinh-ton.webp', 'images/island-song-tu-tay.webp', 'images/island-an-bang.webp',
  'images/truong-sa-lon-1.webp', 'images/truong-sa-lon-2.webp', 'images/truong-sa-lon-3.webp',
  'images/sinh-ton-illustration.svg', 'images/song-tu-tay-illustration.svg', 'images/an-bang-illustration.svg',
  'images/icons/icon-192.png', 'images/og-image.jpg', 'videos/intro-poster.webp'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;                // chỉ xử lý tệp cùng nguồn
  if (req.headers.has('range') || /\/(videos|audio)\/[^/]+\.(mp4|mp3)$/i.test(url.pathname)) return; // để trình duyệt tự tải
  if (req.mode === 'navigate') {                                                         // trang HTML: mạng trước, hỏng mạng thì dùng bản lưu
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.open(VERSION).then(cache => cache.match(req).then(hit => {          // còn lại: dùng bản lưu ngay, đồng thời cập nhật ngầm
    const refresh = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || refresh;
  })));
});
