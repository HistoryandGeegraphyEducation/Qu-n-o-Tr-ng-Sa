/* intro.js — clip giới thiệu ở trang chủ: cố tự phát CÓ TIẾNG; có nút bật/tắt tiếng; luôn tự đóng; có nút "Bỏ qua".
   Một số trình duyệt (nhất là điện thoại) chặn tự phát có tiếng với người mới vào. Khi đó clip phát im lặng
   và tiếng tự bật ở lần chạm / bấm phím đầu tiên của người xem (không cần bấm vào nút nào). */
(() => {
  'use strict';
  const introScreen = document.getElementById('intro-video-screen');
  // Quay lại trang chủ trong cùng phiên (từ trang đảo) thì không phát lại clip.
  let introSeen = false;
  try { introSeen = sessionStorage.getItem('dao-intro-seen') === '1'; } catch (_) {}
  if (introScreen && introSeen) { introScreen.remove(); return; }
  if (!introScreen) return;
  window.__introReady = true;   // báo cho đoạn script dự phòng trong index.html biết là script chính đã chạy

  const introVideo = document.getElementById('intro-video');
  const skipIntro = document.getElementById('intro-skip');
  const progressBar = document.getElementById('intro-progress-bar');
  let introClosed = false, fallbackCloseTimer = 0, durationCloseTimer = 0;

  document.documentElement.classList.add('intro-active');
  document.body.classList.add('intro-active');
  // Bàn phím / trình đọc màn hình: nội dung phía sau bị vô hiệu cho đến khi clip đóng; Esc để bỏ qua.
  const behind = [...document.body.children].filter(el => el !== introScreen && el.tagName !== 'SCRIPT');
  behind.forEach(el => { el.inert = true; });
  introScreen.setAttribute('role', 'dialog');
  introScreen.setAttribute('aria-modal', 'true');
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeIntro(); });

  function closeIntro() {
    if (introClosed) return;
    introClosed = true;
    window.clearTimeout(fallbackCloseTimer);
    window.clearTimeout(durationCloseTimer);
    introVideo.removeEventListener('ended', closeIntro);
    introScreen.classList.add('is-leaving');
    introVideo.pause();
    document.documentElement.classList.remove('intro-active');
    document.body.classList.remove('intro-active');
    behind.forEach(el => { el.inert = false; });
    try { sessionStorage.setItem('dao-intro-seen', '1'); } catch (_) {}
    document.dispatchEvent(new CustomEvent('daots:intro-closed'));
    const firstFocus = document.getElementById('noi-dung'); if (firstFocus) firstFocus.focus({ preventScroll: true });
    // Gỡ lớp phủ kể cả khi sự kiện chuyển tiếp CSS không bắn (một số WebView di động).
    window.setTimeout(() => { if (introScreen.isConnected) introScreen.remove(); }, 450);
  }

  function updateIntroProgress() {
    const duration = Number(introVideo.duration);
    if (progressBar && Number.isFinite(duration) && duration > 0) progressBar.style.width = Math.min(100, introVideo.currentTime / duration * 100) + '%';
    // Một số Android WebView không bắn `ended`: đóng khi chạm khung hình cuối.
    if (Number.isFinite(duration) && duration > 0 && introVideo.currentTime >= duration - 0.08) closeIntro();
  }

  function startDurationFallback() {
    const duration = Number(introVideo.duration);
    if (Number.isFinite(duration) && duration > 0) {
      window.clearTimeout(durationCloseTimer);
      durationCloseTimer = window.setTimeout(closeIntro, Math.ceil((duration + 1.2) * 1000));
    }
  }

  const GESTURES = ['pointerup', 'touchend', 'mouseup', 'click', 'keydown'];
  // Nút bật/tắt tiếng: người xem tự quyết định; đã chủ động tắt thì không tự bật lại ở các lần chạm sau.
  const soundBtn = document.getElementById('intro-sound');
  const soundLabel = soundBtn && soundBtn.querySelector('.intro-sound-label');
  let userMuted = false;
  function syncSoundButton() {
    if (!soundBtn) return;
    const on = !introVideo.muted && introVideo.volume > 0;
    soundBtn.classList.toggle('is-on', on);
    soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    soundBtn.setAttribute('aria-label', on ? 'Tắt tiếng' : 'Bật tiếng');
    if (soundLabel) soundLabel.textContent = on ? 'Tắt tiếng' : 'Bật tiếng';
  }
  function onSoundClick(event) {
    event.preventDefault(); event.stopPropagation();
    if (introVideo.muted || introVideo.volume === 0) {
      userMuted = false;
      introVideo.muted = false; introVideo.defaultMuted = false; introVideo.volume = 1;
      const result = introVideo.play();   // nằm trong cử chỉ bấm nút nên được phép phát có tiếng
      if (result && typeof result.catch === 'function') result.catch(() => { introVideo.muted = true; syncSoundButton(); });
    } else {
      userMuted = true;
      introVideo.muted = true;
    }
    syncSoundButton();
  }
  if (soundBtn) {
    soundBtn.addEventListener('click', onSoundClick);
    introVideo.addEventListener('volumechange', syncSoundButton);
    syncSoundButton();
  }

  function unmuteOnGesture(event) {
    if (introClosed || userMuted || (event.type === 'keydown' && event.key === 'Escape')) return;
    if (event.target && event.target.closest && event.target.closest('#intro-sound, #intro-skip')) return; // chạm vào 2 nút này không tính là "chạm để bật tiếng"
    introVideo.muted = false; introVideo.defaultMuted = false; introVideo.volume = 1;
    const result = introVideo.play();   // gọi ngay trong cử chỉ của người xem nên được phép phát có tiếng
    const done = () => GESTURES.forEach(ev => document.removeEventListener(ev, unmuteOnGesture, true));
    if (result && typeof result.then === 'function') result.then(done).catch(() => { introVideo.muted = true; }); // vẫn bị chặn: giữ im lặng, chờ lần chạm sau
    else done();
  }

  function startPlayback() {
    introVideo.muted = false; introVideo.defaultMuted = false; introVideo.volume = 1;
    const result = introVideo.play();
    if (result && typeof result.catch === 'function') {
      result.catch(() => {
        if (introClosed) return;
        // Trình duyệt chặn tự phát có tiếng → phát im lặng, bật tiếng ở lần chạm đầu tiên.
        introVideo.muted = true; introVideo.defaultMuted = true;
        introVideo.play().catch(() => {});
        GESTURES.forEach(ev => document.addEventListener(ev, unmuteOnGesture, true));
      });
    }
  }

  skipIntro.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); closeIntro(); });
  introVideo.addEventListener('timeupdate', updateIntroProgress);
  introVideo.addEventListener('ended', closeIntro);
  introVideo.addEventListener('loadedmetadata', startDurationFallback, { once: true });
  introVideo.addEventListener('error', () => {
    // Clip hỏng/thiếu không bao giờ được giữ chân người xem ở màn hình mở đầu.
    fallbackCloseTimer = window.setTimeout(closeIntro, 1800);
  }, { once: true });

  const introSource = introVideo.querySelector('source');
  // Lỗi tải/giải mã clip thường bắn ở thẻ <source> (không nổi lên thẻ <video>) → cũng phải tự đóng.
  if (introSource) introSource.addEventListener('error', () => { fallbackCloseTimer = window.setTimeout(closeIntro, 1200); }, { once: true });

  // Clip không chạy được (không tải/giải mã/không có Range…) → không bắt người xem chờ ảnh tĩnh: tự vào trang.
  window.setTimeout(() => {
    if (introClosed) return;
    const stuck = introVideo.readyState < 3 && introVideo.currentTime < 0.05;
    if (stuck) closeIntro();
  }, 6000);

  introVideo.autoplay = true;
  introVideo.playsInline = true;
  introVideo.preload = 'auto';
  startPlayback();
  syncSoundButton();
  if (introVideo.readyState >= 1) startDurationFallback();
  // Chốt an toàn tuyệt đối: luôn trả về trang chủ dù sự kiện media không bao giờ bắn.
  fallbackCloseTimer = window.setTimeout(closeIntro, 17000);
})();
