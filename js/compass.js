/* compass.js — la bàn đọc cảm biến hướng của thiết bị.
   DaoTS.compass.init({heading, dial, trigger, root})
   - dial   : phần tử SVG <g> của mặt la bàn; quay ngược chiều hướng máy để chữ B luôn chỉ Bắc thật
   - heading: nơi hiện chữ "Đông Bắc · 45°"
   - root   : phần tử .instrument, nhận data-state = idle | live | denied | unsupported
   Mặt la bàn xoay mượt theo đường ngắn nhất (không quay vòng khi qua 359° → 0°). */
(() => {
  'use strict';
  const NAMES = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'];
  const directionName = deg => NAMES[Math.round(deg / 45) % 8];
  const circDiff = (a, b) => ((a - b + 540) % 360) - 180; // hiệu góc có dấu, trong (-180, 180]

  function init({ heading: headingEl, dial, trigger, root }) {
    if (!headingEl) return;
    const reduce = !!(window.DaoTS && window.DaoTS.reducedMotion);
    const setState = s => { if (root) root.dataset.state = s; };
    setState('idle');

    if (!('DeviceOrientationEvent' in window)) { headingEl.textContent = 'La bàn không hỗ trợ'; setState('unsupported'); return; }

    let seen = false;          // đã nhận được ít nhất một giá trị hướng
    let absoluteSeen = false;  // đã có nguồn "tuyệt đối" (hướng Bắc thật), ưu tiên hơn nguồn tương đối
    let target = null;         // hướng cảm biến mới nhất
    let shown = 0;             // hướng đang vẽ
    let raf = 0;
    let textHeading = -999, textAt = 0, waitTimer = 0;

    const drawDial = a => { if (dial) dial.setAttribute('transform', `rotate(${(-a).toFixed(2)} 50 50)`); };

    function frame() {
      raf = 0;
      if (target === null || document.hidden) return;
      const d = circDiff(target, shown);
      if (reduce || Math.abs(d) < 0.15) shown = target; else shown += d * 0.22; // làm mượt kiểu giảm dần
      shown = (shown + 360) % 360;
      drawDial(shown);
      if (shown !== target) raf = window.requestAnimationFrame(frame);
    }

    function updateText(h, now) {
      // Chữ chỉ đổi khi lệch ≥ 1° và cách lần trước ≥ 100 ms
      if (Math.abs(circDiff(h, textHeading)) < 1 || now - textAt < 100) return;
      textHeading = h; textAt = now;
      headingEl.textContent = `${directionName(h)} · ${Math.round(h) % 360}°`;
    }

    function handle(event) {
      const isAbsoluteEvent = event.type === 'deviceorientationabsolute';
      let h = null;
      if (Number.isFinite(event.webkitCompassHeading)) h = event.webkitCompassHeading; // iOS
      else if (Number.isFinite(event.alpha)) {
        // Android: 'deviceorientation' thường là góc tương đối; có nguồn tuyệt đối thì bỏ nguồn tương đối.
        if (!isAbsoluteEvent && absoluteSeen) return;
        h = (360 - event.alpha) % 360;
      }
      if (h === null) return;
      if (isAbsoluteEvent) absoluteSeen = true;
      h = (h + 360) % 360;
      if (!seen) { seen = true; setState('live'); window.clearTimeout(waitTimer); }
      target = h;
      updateText(h, performance.now());
      if (!raf) raf = window.requestAnimationFrame(frame);
    }

    function waitForSensor() {
      window.clearTimeout(waitTimer);
      waitTimer = window.setTimeout(() => {
        if (!seen) { headingEl.textContent = 'La bàn không hỗ trợ'; setState('unsupported'); }
      }, 5000);
    }

    window.addEventListener('deviceorientationabsolute', handle, true);
    window.addEventListener('deviceorientation', handle, true);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && target !== null && !raf) raf = window.requestAnimationFrame(frame); });

    if (typeof DeviceOrientationEvent.requestPermission === 'function') { // iOS 13+: cần người dùng chạm
      headingEl.textContent = 'Chạm để bật la bàn';
      (trigger || headingEl).addEventListener('click', async () => {
        if (seen) return;
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') { headingEl.textContent = 'Đang xác định hướng…'; waitForSensor(); }
          else { headingEl.textContent = 'Đã từ chối quyền cảm biến'; setState('denied'); }
        } catch (_) { headingEl.textContent = 'Cảm biến không khả dụng'; setState('unsupported'); }
      });
    } else {
      waitForSensor();
    }
  }

  window.DaoTS = window.DaoTS || {};
  window.DaoTS.compass = { init, directionName };
})();
