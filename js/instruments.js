/* instruments.js — MỘT mẫu duy nhất cho dải dụng cụ (la bàn + đồng hồ thiên thể) trên mọi trang.
   Trang đặt: <section class="instrument-strip" id="instruments" aria-label="…" data-compass="live|static"></section>
   - live  : la bàn đọc cảm biến thiết bị (mặc định, dùng ở mọi trang)
   - static: la bàn minh họa, luôn chỉ Bắc */
(() => {
  'use strict';
  const strip = document.getElementById('instruments');
  if (!strip) { if (window.DaoTS.skyClock) window.DaoTS.skyClock.init(); return; }
  const live = strip.dataset.compass !== 'static';

  // ----- SVG la bàn: mặt quay (#compass-dial) + mốc cố định phía trên (hướng đang hướng tới) -----
  let ticks = '';
  for (let a = 0; a < 360; a += 30) {
    const main = a % 90 === 0, len = main ? 0 : 4;
    ticks += `<line x1="50" y1="${main ? 8 : 6}" x2="50" y2="${main ? 12 : 6 + len + 2}" transform="rotate(${a} 50 50)"/>`;
  }
  const compassSVG = `
<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
  <circle class="cp-ring" cx="50" cy="50" r="47"/>
  <g id="compass-dial">
    <g class="cp-ticks">${ticks}</g>
    <path class="cp-needle-n" d="M50 20L57 50L43 50Z"/><path class="cp-needle-s" d="M50 80L57 50L43 50Z"/>
    <circle class="cp-hub" cx="50" cy="50" r="3"/>
    <text class="cp-letter cp-b" x="50" y="31" >B</text>
    <text class="cp-letter" x="73" y="54">Đ</text>
    <text class="cp-letter" x="50" y="77">N</text>
    <text class="cp-letter" x="27" y="54">T</text>
  </g>
  <path class="cp-lubber" d="M50 3L55 11L45 11Z"/>
</svg>`;

  // ----- SVG đồng hồ thiên thể: sao, mặt trời, trăng, biển, đảo cát, kim đồng hồ mặt trời -----
  const star = (x, y, s) => `<path d="M0 -4L1 -1L4 0L1 1L0 4L-1 1L-4 0L-1 -1Z" transform="translate(${x} ${y}) scale(${s})"/>`;
  let rays = '';
  for (let a = 0; a < 360; a += 45) rays += `<line x1="0" y1="-13" x2="0" y2="-17" transform="rotate(${a})"/>`;
  const skySVG = `
<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
  <g class="sky-stars">${star(22, 24, 1.2)}${star(78, 30, 1)}${star(64, 12, .8)}${star(36, 44, .7)}</g>
  <g class="sky-sun-g" transform="translate(14 66)"><g class="sky-rays-g">${rays}</g><circle r="10"/></g>
  <g class="sky-moon-g" transform="translate(14 66)"><circle class="moon-dark" r="10"/><path class="moon-lit" d=""/></g>
  <path class="sky-sea" d="M0 70Q12 66 25 70T50 70T75 70T100 70V100H0Z"/>
  <ellipse class="sky-sand" cx="50" cy="88" rx="26" ry="6"/>
  <line class="sky-shadow" x1="50" y1="88" x2="50" y2="88"/>
  <line class="sky-gnomon" x1="50" y1="88" x2="50" y2="75"/>
</svg>`;

  strip.innerHTML = `
<div class="instrument compass-instrument" id="compass-instrument" data-state="idle" title="${live ? 'La bàn dùng cảm biến hướng của thiết bị' : 'La bàn minh họa hướng Bắc'}">
  <div class="compass-face" aria-hidden="true">${compassSVG}</div>
  <div class="instrument-copy"><span class="instrument-label">La bàn</span><span class="instrument-value" id="compass-heading">${live ? 'Đang xác định hướng…' : 'Bắc · N'}</span></div>
</div>
<div class="instrument time-instrument" title="Giờ Việt Nam, mặt trời và mặt trăng (gần đúng)">
  <div class="sky-clock" data-sky-clock="night" role="img" aria-label="Mặt trời và mặt trăng">${skySVG}</div>
  <div class="instrument-copy"><span class="instrument-value" data-vn-time>Đang cập nhật…</span><span class="instrument-date" data-vn-date>Đang cập nhật…</span><span class="sky-phase" data-sky-phase>Đang cập nhật…</span></div>
</div>`;

  if (live && window.DaoTS.compass) {
    window.DaoTS.compass.init({
      heading: document.getElementById('compass-heading'),
      dial: document.getElementById('compass-dial'),
      trigger: document.getElementById('compass-instrument'),
      root: document.getElementById('compass-instrument')
    });
  }
  if (window.DaoTS.skyClock) window.DaoTS.skyClock.init(); // chạy sau khi markup đã có
})();
