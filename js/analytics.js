/* analytics.js — thống kê lượt xem GoatCounter (tùy chọn, xem docs/README.md). */
(() => {
  'use strict';
  const body = document.body;
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
})();
