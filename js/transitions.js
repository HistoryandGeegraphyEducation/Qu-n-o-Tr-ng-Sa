/* transitions.js — chuyển trang hiện đại + âm thanh, và lời chào của đảo.
   - Hiệu ứng hình ảnh do trình duyệt đảm nhiệm bằng CSS View Transitions (xem style.css, mục 6);
     trình duyệt không hỗ trợ thì tự chuyển thẳng, không lỗi.
   - Âm thanh: nếu được phép phát (đã chạm, chưa tắt tiếng) thì phát tiếng vút + chuông rồi chuyển sau ~0,2 s;
     không được phép thì chuyển thẳng ngay. */
(() => {
  'use strict';
  const DELAY_MS = 220;
  let navigating = false;
  window.addEventListener('pageshow', () => { navigating = false; }); // quay lại bằng nút Back (bfcache)

  const FLAG = 'dao-transition-enter';
  document.querySelectorAll('a.island-link, .island-nav a, .back-link, .footer a').forEach(link => {
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      if (link.target && link.target !== '_self') return;
      if (link.getAttribute('aria-current') === 'page') return;
      const href = link.href;
      if (!href || navigating) { if (navigating) event.preventDefault(); return; }
      if (link.matches('a.island-link, .island-nav a')) { try { sessionStorage.setItem(FLAG, '1'); } catch (_) {} }
      const sfx = window.DaoTS.sfx;
      if (sfx && sfx.canPlay() && sfx.transition()) {
        navigating = true;
        event.preventDefault();
        window.setTimeout(() => { window.location.href = href; }, DELAY_MS);
      } // ngược lại: để trình duyệt chuyển trang bình thường (kèm View Transition nếu có)
    });
  });

  // Lời chào của đảo: thử phát sau khi đến từ lựa chọn của người xem; trình duyệt có thể chặn tự phát.
  let arrived = false;
  try { arrived = sessionStorage.getItem(FLAG) === '1'; if (arrived) sessionStorage.removeItem(FLAG); } catch (_) {}
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
  if (greeting && arrived) {
    const attempt = () => greeting.play().catch(() => {});
    if (document.readyState === 'complete') attempt();
    else window.addEventListener('load', attempt, { once: true });
  }
})();
