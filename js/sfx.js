/* sfx.js — âm thanh giao diện tổng hợp bằng Web Audio (không cần tệp âm thanh).
   DaoTS.sfx: canPlay(), transition() (vút nhẹ + chuông), horn() (còi tàu), toggle(), isEnabled().
   Trình duyệt chỉ cho phát sau lần chạm đầu tiên; chưa được phép thì canPlay() = false và mọi nơi gọi
   sẽ bỏ qua âm thanh (chuyển trang thẳng). Người xem tắt/bật bằng nút loa; lựa chọn được nhớ. */
(() => {
  'use strict';
  const KEY = 'dao-sound';
  let enabled = true;
  try { enabled = localStorage.getItem(KEY) !== '0'; } catch (_) {}
  let ctx = null, master = null;

  function unlock() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      if (!ctx) { ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.7; master.connect(ctx.destination); }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    } catch (_) {}
  }
  ['pointerdown', 'keydown', 'touchend'].forEach(t => window.addEventListener(t, unlock, { passive: true }));

  const canPlay = () => !!(enabled && ctx && ctx.state === 'running' && !document.hidden);

  function env(gainNode, t, peak, attack, hold, release) {
    const g = gainNode.gain;
    g.setValueAtTime(0.0001, t);
    g.exponentialRampToValueAtTime(peak, t + attack);
    g.setValueAtTime(peak, t + attack + hold);
    g.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
  }

  // Tiếng "vút" hiện đại: nhiễu băng thông quét từ trầm lên cao
  function swoosh(t) {
    const len = Math.floor(ctx.sampleRate * 0.32), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.1;
    bp.frequency.setValueAtTime(260, t); bp.frequency.exponentialRampToValueAtTime(3200, t + 0.26);
    const g = ctx.createGain(); env(g, t, 0.2, 0.05, 0.06, 0.18);
    src.connect(bp); bp.connect(g); g.connect(master); src.start(t); src.stop(t + 0.34);
  }
  // Chuông hai nốt nhẹ (quãng năm) kết thúc cú chuyển
  function ping(t, freq, peak, dur) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq; o2.type = 'triangle'; o2.frequency.value = freq * 2;
    const g2 = ctx.createGain(); g2.gain.value = 0.18;
    env(g, t, peak, 0.012, 0.01, dur);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(master);
    o.start(t); o2.start(t); o.stop(t + dur + 0.06); o2.stop(t + dur + 0.06);
  }
  function transition() {
    if (!canPlay()) return false;
    const t = ctx.currentTime + 0.01;
    try { swoosh(t); ping(t + 0.07, 784, 0.1, 0.32); ping(t + 0.15, 1175, 0.075, 0.36); } catch (_) { return false; }
    return true;
  }
  // Còi tàu: hai sóng răng cưa quãng năm qua bộ lọc trầm, vào nhanh, giữ ~0,8 s rồi tắt dần
  function horn() {
    if (!canPlay()) return false;
    const t = ctx.currentTime + 0.01;
    try {
      const out = ctx.createGain(); env(out, t, 0.15, 0.07, 0.8, 0.45);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 820; lp.Q.value = 0.7;
      [[130.8, 0], [196, 5]].forEach(([f, det]) => {
        const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det;
        o.connect(lp); o.start(t); o.stop(t + 1.4);
      });
      lp.connect(out); out.connect(master);
    } catch (_) { return false; }
    return true;
  }

  function toggle() {
    enabled = !enabled;
    try { localStorage.setItem(KEY, enabled ? '1' : '0'); } catch (_) {}
    if (enabled) { unlock(); window.setTimeout(() => ping2(), 30); }
    document.dispatchEvent(new CustomEvent('daots:sound', { detail: { enabled } }));
    return enabled;
  }
  function ping2() { if (canPlay()) ping(ctx.currentTime + 0.01, 988, 0.08, 0.25); } // xác nhận khi bật

  window.DaoTS = window.DaoTS || {};
  window.DaoTS.sfx = { canPlay, transition, horn, toggle, isEnabled: () => enabled };
})();
