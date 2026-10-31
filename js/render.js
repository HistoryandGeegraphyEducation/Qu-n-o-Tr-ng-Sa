/* render.js — dựng nội dung từ data/islands.js: lưới thẻ đảo (trang chủ) và toàn bộ trang đảo.
   Nạp ĐỒNG BỘ (không defer) ngay sau data/islands.js để nội dung có trước lần vẽ đầu tiên.
   Muốn đổi chữ/số liệu/ảnh: sửa data/islands.js. Muốn đổi bố cục: sửa các hàm bên dưới. */
(() => {
  'use strict';
  const D = window.DaoTSData;
  if (!D) return;
  const body = document.body;
  const page = body.dataset.page;
  const root = body.dataset.root || '.';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const arrow = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const fact = (island, label) => (island.facts.find(f => f.label === label) || {}).value || '';

  /* ---------- trang chủ: thẻ đảo ---------- */
  function renderHome() {
    const grid = document.getElementById('island-grid');
    if (!grid) return;
    grid.innerHTML = D.islands.map((it, n) => `
<article class="island-card" data-reveal style="--i:${n}"><a class="island-link card-link" href="islands/${esc(it.id)}.html" data-island-name="${esc(it.name)}" aria-label="Khám phá đảo ${esc(it.name)}">
<div class="card-image"><img src="${esc(it.card.image)}" width="${it.card.width}" height="${it.card.height}" decoding="async" alt="${esc(it.card.alt)}" loading="${n === 0 ? 'eager' : 'lazy'}"><span class="card-chip">Ảnh vệ tinh</span><span class="card-number">ĐIỂM ĐẾN ${String(it.order).padStart(2, '0')}</span></div>
<div class="card-body"><h2>${esc(it.name)}</h2><span class="card-coords">${esc(fact(it, 'Tọa độ'))}</span><span class="card-go" aria-hidden="true">Khám phá ${arrow}</span></div></a></article>`).join('');
  }

  /* ---------- trang đảo ---------- */
  function renderIsland() {
    const it = D.islands.find(i => i.id === body.dataset.island);
    const main = document.getElementById('noi-dung');
    if (!it || !main) return;
    const a = p => root + '/' + p;
    const g = it.gallery, multi = g.images.length > 1;

    const title = document.querySelector('.island-page-title');
    if (title) title.textContent = it.name;

    const nav = D.islands.map(i => `<a href="${esc(i.id)}.html"${i.id === it.id ? ' aria-current="page"' : ''}>${esc(i.name)}</a>`).join('');
    const facts = it.facts.map((f, n) => `<article class="info-card" data-reveal style="--i:${n}"><div class="info-label">${esc(f.label)}</div><div class="info-value">${esc(f.value)}</div></article>`).join('');
    const thumbs = multi ? `<div class="gallery-thumbnails" id="gallery-thumbnails">${g.images.map((s, n) => `<button class="gallery-thumbnail${n ? '' : ' active'}" type="button" data-index="${n}" aria-label="Xem ảnh ${n + 1}"><img src="${esc(a(s))}" alt="${esc((g.alts && g.alts[n]) || (g.thumbAlt + ' ' + (n + 1)))}" loading="lazy"></button>`).join('')}</div>` : '';
    const controls = multi ? '<button class="gallery-button" id="gallery-prev" type="button" aria-label="Ảnh trước">‹</button><button class="gallery-button" id="gallery-next" type="button" aria-label="Ảnh tiếp theo">›</button>' : '';

    // ----- khối nội dung dựng từ dữ liệu -----
    const para = p => `<p>${esc(p)}</p>`;
    const accordion = items => items.map((s, n) => `<details class="acc"${n === 0 ? ' open' : ''}><summary><span>${esc(s.title)}</span></summary><div class="acc-body">${s.paras.map(para).join('')}${s.source ? `<p class="acc-source">Nguồn: ${esc(s.source)}</p>` : ''}</div></details>`).join('');
    const section = (id, kicker, title, inner) => `<section class="panel sec-panel" id="${id}" data-reveal><p class="section-kicker">${esc(kicker)}</p><h2>${esc(title)}</h2>${inner}</section>`;
    const has = x => Array.isArray(x) && x.length;
    const parts = [], tabs = [];
    const add = (id, label, html) => { parts.push(html); tabs.push([id, label]); };

    if (has(it.intro)) add('gioi-thieu', 'Giới thiệu', section('gioi-thieu', 'Hồ sơ điểm đến', 'Giới thiệu đảo', accordion(it.intro)));
    if (it.history && (has(it.history.phases) || has(it.history.summary))) {
      const summary = has(it.history.summary) ? `<details class="acc acc-soft"><summary><span>Tóm tắt nhanh các mốc chính</span></summary><div class="acc-body"><ul class="tl-summary">${it.history.summary.map(x => `<li>${x.date ? `<strong>${esc(x.date)}:</strong> ` : ''}${esc(x.text)}</li>`).join('')}</ul></div></details>` : '';
      const phases = has(it.history.phases) ? `<ol class="timeline">${it.history.phases.map(x => `<li class="tl-item"><span class="tl-date">${esc(x.date)}</span><h3>${esc(x.title)}</h3>${x.paras.map(para).join('')}</li>`).join('')}</ol>` : '';
      add('lich-su', 'Lịch sử', section('lich-su', 'Lịch sử', 'Lịch sử và mốc thời gian', phases + summary));
    }
    if (has(it.nature)) add('thien-nhien', 'Thiên nhiên', section('thien-nhien', 'Tự nhiên', 'Thiên nhiên và môi trường biển đảo', accordion(it.nature)));
    if (has(it.life)) add('doi-song', 'Đời sống', section('doi-song', 'Đời sống', `Cuộc sống trên đảo ${it.name}`, accordion(it.life)));

    const vlist = Array.isArray(it.videos) ? it.videos : [];
    const videoItem = v => `<figure class="video-item"><video controls preload="none" playsinline poster="${esc(a(v.poster))}"><source src="${esc(a(v.src))}" type="video/mp4">Trình duyệt không hỗ trợ video.</video>${v.title ? `<figcaption><strong>${esc(v.title)}</strong>${v.source && v.source.url ? ` <a class="video-source" href="${esc(v.source.url)}" target="_blank" rel="noopener">Nguồn: ${esc(v.source.text || 'video gốc')}</a>` : ''}</figcaption>` : ''}</figure>`;
    const video = vlist.length
      ? `<article class="panel video-panel video-panel--list" id="video" data-reveal style="--i:1"><h2>Video</h2><div class="video-list">${vlist.map(videoItem).join('')}</div></article>`
      : (it.video ? `<article class="panel video-panel" id="video" data-reveal style="--i:1"><h2>Video</h2><video id="island-video" controls preload="metadata" poster="${esc(a(it.video.poster))}"><source src="${esc(a(it.video.src))}" type="video/mp4">Trình duyệt không hỗ trợ video.</video></article>` : '');
    const hasSideVideo = !!it.video && !vlist.length;
    const media = `<section id="tu-lieu" data-reveal><h2 class="section-heading">Tài liệu đa phương tiện</h2><div class="media-grid${hasSideVideo ? '' : ' media-grid--single'}"><article class="panel gallery-panel" data-reveal><div class="gallery-main"><img id="gallery-main-image" src="${esc(a(g.images[0]))}" alt="${esc((g.alts && g.alts[0]) || g.mainAlt)}"><div class="gallery-controls">${controls}</div></div>${thumbs}<p class="gallery-caption" id="gallery-caption">${esc((g.captions && g.captions[0]) || g.caption)}</p>${g.credit ? `<p class="gallery-credit">Nguồn hình ảnh: ${g.credit.url ? `<a href="${esc(g.credit.url)}" target="_blank" rel="noopener">${esc(g.credit.text)}</a>` : esc(g.credit.text)}</p>` : ''}</article>${video}</div></section>`;
    add('tu-lieu', 'Tư liệu', media);

    if (has(it.references)) {
      const refs = it.references.map(r => `<li>${esc(r.text)}${r.url ? ` <a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">Mở nguồn<span class="visually-hidden"> (liên kết ngoài)</span> ↗</a>` : ''}</li>`).join('');
      add('nguon', 'Nguồn', section('nguon', 'Tài liệu', 'Nguồn tham khảo', `<ol class="refs">${refs}</ol>`));
    }

    main.innerHTML = `
<div class="island-toolbar"><a class="back-link" href="../index.html#diem-den">← Trở về không gian trung tâm</a><nav class="island-nav" aria-label="Chuyển sang đảo khác">${nav}</nav></div>
<nav class="page-tabs" id="page-tabs" aria-label="Mục lục trang">${tabs.map(([id, label]) => `<a href="#${id}">${esc(label)}</a>`).join('')}</nav>
<section id="thong-tin"><p class="section-kicker">Hồ sơ điểm đến</p><h2 class="section-heading">Thông tin cơ bản</h2><p class="section-intro">${esc(D.site.infoNote || '')}</p><div class="info-grid">${facts}</div></section>
${parts.join('\n')}
<section class="panel panel-last" id="truy-cap" data-reveal><p class="section-kicker">Thời gian &amp; thống kê</p><h2>Thông tin truy cập</h2><ul class="fact-list"><li><span class="fact-dot">◷</span><div><strong>Giờ Việt Nam</strong><br><span class="clock" data-vn-clock>Đang cập nhật…</span></div></li><li><span class="fact-dot">↗</span><div><strong>Lượt xem</strong><br><span data-visit-count>Chưa cấu hình thống kê trực tuyến</span><div class="muted-note" data-visit-note>Muốn thống kê toàn bộ người truy cập, hãy cấu hình GoatCounter theo hướng dẫn trong docs/README.md.</div></div></li></ul></section>`;

    const footer = document.getElementById('site-footer');
    if (footer) footer.innerHTML = `<div class="footer-inner"><p>BẢO TÀNG SỐ BIỂN ĐẢO VIỆT NAM · ${esc(it.name)}</p><p><a href="../index.html#diem-den">← Khám phá đảo khác</a></p></div>`;
    if (it.greeting) {
      const audio = document.createElement('audio');
      audio.id = 'island-greeting'; audio.preload = 'none';
      audio.innerHTML = `<source src="${esc(a(it.greeting))}" type="audio/mpeg">`;
      body.appendChild(audio);
    }
  }

  if (page === 'home') renderHome(); else if (page === 'island') renderIsland();
})();
