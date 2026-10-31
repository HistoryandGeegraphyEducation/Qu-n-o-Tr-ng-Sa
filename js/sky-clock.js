/* sky-clock.js — giờ Việt Nam + đồng hồ thiên thể.
   Mặt trời đi theo cung từ Đông sang Tây theo giờ mọc/lặn tính cho giữa quần đảo Trường Sa;
   trăng đi theo cung ban đêm và hiện đúng pha; kim đồng hồ mặt trời đổ bóng ngược hướng mặt trời.
   Giờ mọc/lặn và pha trăng là công thức thiên văn gần đúng (sai số vài phút), dùng để minh họa. */
(() => {
  'use strict';
  const VN_OFFSET_MS = 7 * 3600 * 1000; // Việt Nam UTC+7, không có giờ mùa hè
  const DAY_MS = 86400000;
  const LAT = 9.5, LON = 113;           // xấp xỉ giữa quần đảo Trường Sa (độ B, độ Đ)
  const SYNODIC = 29.530588853;         // chu kỳ trăng (ngày)
  const NEW_MOON_EPOCH = Date.UTC(2000, 0, 6, 18, 14); // một lần trăng non đã biết
  const RAD = Math.PI / 180;
  const dateFormatter = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  const pad = n => (n < 10 ? '0' : '') + n;

  /* ---------- thiên văn gần đúng ---------- */
  const sunCache = {};
  // Trả về {rise, set, noon} tính bằng ms UTC cho ngày Việt Nam chứa `ms`.
  function sunTimes(ms) {
    const day = Math.floor((ms + VN_OFFSET_MS) / DAY_MS);
    if (sunCache[day]) return sunCache[day];
    const jd = day + 2440587.5 + 0.5 - VN_OFFSET_MS / DAY_MS;       // ~ trưa giờ Việt Nam
    const n = Math.round(jd - 2451545.0 + 0.0008);
    const jStar = n - LON / 360;
    const M = (357.5291 + 0.98560028 * jStar) % 360;
    const C = 1.9148 * Math.sin(M * RAD) + 0.02 * Math.sin(2 * M * RAD) + 0.0003 * Math.sin(3 * M * RAD);
    const lambda = (M + C + 180 + 102.9372) % 360;
    const jTransit = 2451545.0 + jStar + 0.0053 * Math.sin(M * RAD) - 0.0069 * Math.sin(2 * lambda * RAD);
    const sinDec = Math.sin(lambda * RAD) * Math.sin(23.4397 * RAD);
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH = (Math.sin(-0.833 * RAD) - Math.sin(LAT * RAD) * sinDec) / (Math.cos(LAT * RAD) * cosDec);
    const h0 = Math.acos(Math.max(-1, Math.min(1, cosH))) / RAD;
    const toMs = j => (j - 2440587.5) * DAY_MS;
    return (sunCache[day] = { rise: toMs(jTransit - h0 / 360), set: toMs(jTransit + h0 / 360), noon: toMs(jTransit) });
  }

  const moonAge = ms => (((ms - NEW_MOON_EPOCH) / DAY_MS) % SYNODIC + SYNODIC) % SYNODIC;
  function moonName(age) {
    if (age < 1.8 || age >= 27.7) return 'Trăng non';
    if (age < 5.5) return 'Trăng lưỡi liềm';
    if (age < 9.3) return 'Trăng thượng huyền';
    if (age < 13.8) return 'Trăng gần tròn';
    if (age < 15.8) return 'Trăng tròn';
    if (age < 20.2) return 'Trăng gần tròn';
    if (age < 24) return 'Trăng hạ huyền';
    return 'Trăng lưỡi liềm';
  }
  // Đường viền phần sáng của trăng bán kính r, tâm (0,0). Trăng đầu tháng sáng bên phải, cuối tháng sáng bên trái.
  function moonPath(age, r) {
    const phi = 2 * Math.PI * age / SYNODIC;
    const k = Math.cos(phi), rx = (r * Math.abs(k)).toFixed(2);
    const waxing = age < SYNODIC / 2;
    const outer = waxing ? 1 : 0;
    const inner = waxing ? (k > 0 ? 0 : 1) : (k > 0 ? 1 : 0);
    return `M0 ${-r}A${r} ${r} 0 0 ${outer} 0 ${r}A${rx} ${r} 0 0 ${inner} 0 ${-r}Z`;
  }

  /* Trạng thái bầu trời tại thời điểm ms. */
  function skyState(ms) {
    const t = sunTimes(ms), min = 60000;
    const vn = new Date(ms + VN_OFFSET_MS), vnMinutes = vn.getUTCHours() * 60 + vn.getUTCMinutes();
    const age = moonAge(ms);
    let phase, label;
    if (ms >= t.rise - 30 * min && ms < t.rise + 45 * min) { phase = 'sunrise'; label = 'Bình minh · Trăng nhường nắng'; }
    else if (ms >= t.rise + 45 * min && ms < t.set - 45 * min) {
      phase = 'day'; label = Math.abs(ms - t.noon) <= 30 * min ? 'Giữa trưa · Mặt trời tỏa tia nắng' : 'Ban ngày · Ánh mặt trời';
    } else if (ms >= t.set - 45 * min && ms < t.set + 30 * min) { phase = 'sunset'; label = 'Hoàng hôn · Nắng nhường trăng'; }
    else if (vnMinutes >= 1410 || vnMinutes < 30) { phase = 'midnight'; label = 'Giữa khuya · Trăng và sao li ti'; }
    else { phase = 'night'; label = `Đêm · ${moonName(age)}`; }

    const p = (ms - t.rise) / (t.set - t.rise); // tiến độ mặt trời: 0 lúc mọc, 1 lúc lặn
    let q = -1;                                  // tiến độ trăng trong đêm: 0 lúc mặt trời lặn, 1 lúc mọc
    if (ms >= t.set) q = (ms - t.set) / (t.rise + DAY_MS - t.set);
    else if (ms < t.rise) q = (ms - (t.set - DAY_MS)) / (t.rise - (t.set - DAY_MS));
    return { phase, label, p, q, age };
  }

  /* ---------- vẽ ---------- */
  // Cung đi từ trái (Đông) sang phải (Tây) trong khung 100×100: p=0 trái, 0.5 đỉnh, 1 phải.
  const arc = f => ({ x: 50 - 36 * Math.cos(Math.PI * f), y: 66 - 44 * Math.sin(Math.PI * f) });

  function paintSky(el, s) {
    el.dataset.skyClock = s.phase;
    el.setAttribute('aria-label', s.label);
    const sun = el.querySelector('.sky-sun-g'), moon = el.querySelector('.sky-moon-g'), lit = el.querySelector('.moon-lit');
    const shadow = el.querySelector('.sky-shadow');
    if (sun) { const a = arc(Math.max(-0.15, Math.min(1.15, s.p))); sun.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)})`); }
    if (moon) { const a = arc(Math.max(-0.15, Math.min(1.15, s.q))); moon.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)})`); }
    if (lit) lit.setAttribute('d', moonPath(s.age, 10));
    if (shadow) { // bóng kim: ngược hướng mặt trời, dài nhất lúc nắng thấp, ngắn nhất lúc giữa trưa
      const u = -Math.cos(Math.PI * Math.max(0, Math.min(1, s.p)));
      shadow.setAttribute('x2', (50 - 22 * u).toFixed(1));
      shadow.setAttribute('y2', (88 + 2 * Math.abs(u)).toFixed(1));
    }
  }

  function init() {
    const timeEls = [...document.querySelectorAll('[data-vn-time]')];
    const clockEls = [...document.querySelectorAll('[data-vn-clock]')];
    const dateEls = [...document.querySelectorAll('[data-vn-date]')];
    const skyEls = [...document.querySelectorAll('[data-sky-clock]')];
    const phaseEls = [...document.querySelectorAll('[data-sky-phase]')];
    if (!timeEls.length && !clockEls.length && !dateEls.length && !skyEls.length) return;

    let lastDay = -1, lastMinute = -1, timer = 0;

    function tick() {
      const now = Date.now();
      const vn = new Date(now + VN_OFFSET_MS); // đọc bằng getUTC* = giờ Việt Nam
      const hms = `${pad(vn.getUTCHours())}:${pad(vn.getUTCMinutes())}:${pad(vn.getUTCSeconds())} · UTC+7`;
      timeEls.forEach(el => { el.textContent = hms; });
      clockEls.forEach(el => { el.textContent = hms; });

      const day = Math.floor((now + VN_OFFSET_MS) / DAY_MS);
      if (day !== lastDay) {
        lastDay = day;
        const text = dateFormatter.format(new Date(now));
        dateEls.forEach(el => { el.textContent = text; });
      }
      const minute = Math.floor(now / 60000);  // bầu trời chỉ cần cập nhật mỗi phút
      if (minute !== lastMinute) {
        lastMinute = minute;
        const s = skyState(now);
        window.DaoTS.sky = s;                                    // cho scene.js và các module khác
        document.documentElement.dataset.sky = s.phase;          // CSS đổi màu nền theo giờ
        document.dispatchEvent(new CustomEvent('daots:sky', { detail: s }));
        skyEls.forEach(el => paintSky(el, s));
        phaseEls.forEach(el => { el.textContent = s.label; });
      }
    }

    function schedule() {
      window.clearTimeout(timer);
      if (document.hidden) return;                       // tab ẩn: dừng hẳn
      tick();
      timer = window.setTimeout(schedule, 1000 - (Date.now() % 1000) + 5); // bám đúng nhịp giây
    }
    document.addEventListener('visibilitychange', schedule);
    schedule();
  }

  window.DaoTS = window.DaoTS || {};
  window.DaoTS.skyClock = { init, sunTimes, moonAge, moonName, moonPath, skyState };
})();
