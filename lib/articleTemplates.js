function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function textToParas(text, cls) {
  if (!text) return '';
  return text.split(/\n+/)
    .filter(l => l.trim())
    .map(l => `<p class="${cls}">${esc(l)}</p>`)
    .join('');
}

function imgBox(src) {
  if (src) return `<div class="img-box has-img"><img src="${esc(src)}" alt=""></div>`;
  return `<div class="img-box"></div>`;
}

function photoBox(src, large) {
  const cls = 'photo-box' + (large ? ' large' : '') + (src ? ' has-img' : '');
  if (src) return `<div class="${cls}"><img src="${esc(src)}" alt=""></div>`;
  return `<div class="${cls}"></div>`;
}

function splitParas(text) {
  if (!text) return ['', ''];
  const paras = text.split(/\n+/).filter(l => l.trim());
  if (paras.length < 2) return [text, ''];
  const mid = Math.ceil(paras.length / 2);
  return [paras.slice(0, mid).join('\n'), paras.slice(mid).join('\n')];
}

function renderSchedule(schedule) {
  if (!schedule || schedule.length === 0) return '';
  const rows = schedule.map(s =>
    `<div class="schedule-row">
      <div class="schedule-time-cell"><span class="s-time-text">${esc(s.time)}</span></div>
      <div class="schedule-item-cell"><span class="s-item-text">${esc(s.content)}</span></div>
    </div>`
  ).join('');
  return `
    <div class="schedule-wrap">
      <div class="schedule-head">
        <span class="schedule-eyebrow">DAILY SCHEDULE</span>
        <span class="schedule-title-text">ある1日のスケジュール</span>
        <div class="schedule-head-line"></div>
      </div>
      <div class="schedule-table">${rows}</div>
    </div>`;
}

function renderRelated(currentId, allArticles) {
  const others = allArticles.filter(a => String(a.id) !== String(currentId)).slice(0, 3);
  if (others.length === 0) return '';
  const cards = others.map(a => {
    const href = a.slug ? `/article/${a.slug}` : `/article?id=${a.id}`;
    return `<a href="${href}" class="rel-card">
      <div class="rel-card-img">${a.img ? `<img src="${esc(a.img)}" alt="">` : ''}</div>
      <div class="rel-card-body">
        <div class="rel-card-meta">
          <span class="rel-card-date">${esc(a.date)}</span>
          <span class="rel-card-tag">${esc(a.tag)}</span>
        </div>
        <div class="rel-card-title">${esc(a.title || a.catchcopy || a.eventTitle || a.pressTitle || '記事')}</div>
        <div class="rel-card-excerpt">${esc((a.excerpt || '').slice(0, 60))}</div>
        <div class="rel-card-arrow">READ MORE →</div>
      </div>
    </a>`;
  }).join('');
  return `
    <div class="related-wrap">
      <div class="related-head">
        <span class="related-eyebrow">RELATED ARTICLES</span>
        <span class="related-title-text">関連記事</span>
        <div class="related-head-line"></div>
      </div>
      <div class="related-grid">${cards}</div>
    </div>`;
}

export function renderIntern(a, allArticles) {
  const heroPhotoSrc = a.heroPhoto || '';
  const q = (a.qa || []);
  const qGet = (i) => q[i] || {};
  const q1 = qGet(0), q2 = qGet(1), q3 = qGet(2), q4 = qGet(3), q5 = qGet(4);
  return `
    <section class="art-hero">
      <div class="h-bg"></div>
      ${heroPhotoSrc ? `<img class="h-bg-img" src="${esc(heroPhotoSrc)}" alt="">` : ''}
      <div class="h-grad"></div>
      <div class="h-body">
        <span class="hero-badge">INTERNSHIP</span>
        <div class="hero-headline-text">${esc(a.catchcopy || '')}</div>
        <div><span class="hero-dept-badge">${esc(a.dept || '')}</span></div>
        <span class="hero-name-en-text">${esc(a.nameEn || '')}</span>
        <span class="hero-name-ja-text">${esc(a.nameJa || '')}</span>
        <span class="hero-univ-text">${esc(a.university || '')}</span>
      </div>
      <div class="scroll-line"><div class="scroll-line-fill"></div></div>
    </section>
    <div class="main-box">
      <div class="main-box-col">
        <span class="col-eyebrow">REASON FOR JOINING</span>
        <div class="col-title-label">入社した理由</div>
        ${textToParas(a.reason || '', 'dark-text')}
      </div>
      <div class="main-box-col">
        <span class="col-eyebrow">RESPONSIBILITIES &amp; REWARDS</span>
        <div class="col-title-label">具体的な業務とやりがい</div>
        ${textToParas(a.work || '', 'dark-text')}
      </div>
    </div>
    <div class="banner">
      <div class="banner-line"></div>
      <span class="banner-label">${esc(a.bannerLabel || 'Internship for Self-Driving Experience')}</span>
      <div class="banner-line"></div>
    </div>
    <div class="qa-wrap">
      <div class="qa-block">
        <div class="qa-head"><span class="qa-num">Q — 01</span><div class="qa-head-divider"></div><span class="qa-question-text">${esc(q1.question || '')}</span></div>
        <div class="layout-img-left">${imgBox(a.q1Photo || q1.photo || '')}<div class="qa-text-col">${textToParas(q1.answer || '', 'qa-p')}</div></div>
      </div>
      <div class="qa-block watermark-wrap">
        <div class="watermark">WISE</div>
        <div class="qa-head"><span class="qa-num">Q — 02</span><div class="qa-head-divider"></div><span class="qa-question-text">${esc(q2.question || '')}</span></div>
        <div class="layout-single">${textToParas(q2.answer || '', 'qa-p')}</div>
      </div>
      <div class="qa-block">
        <div class="qa-head"><span class="qa-num">Q — 03</span><div class="qa-head-divider"></div><span class="qa-question-text">${esc(q3.question || '')}</span></div>
        <div class="layout-single">${textToParas(q3.answer || '', 'qa-p')}</div>
      </div>
      <div class="qa-block">
        <div class="qa-head"><span class="qa-num">Q — 04</span><div class="qa-head-divider"></div><span class="qa-question-text">${esc(q4.question || '')}</span></div>
        <div class="layout-img-right"><div class="qa-text-col">${textToParas(q4.answer || '', 'qa-p')}</div>${imgBox(a.q4Photo || q4.photo || '')}</div>
      </div>
      <div class="qa-block">
        <div class="qa-head"><span class="qa-num">Q — 05</span><div class="qa-head-divider"></div><span class="qa-question-text">${esc(q5.question || '')}</span></div>
        <div class="layout-img-left">${imgBox(a.q5Photo || q5.photo || '')}<div class="qa-text-col">${textToParas(q5.answer || '', 'qa-p')}</div></div>
      </div>
    </div>
    ${renderSchedule(a.schedule)}
    ${renderRelated(a.id, allArticles)}`;
}

export function renderAlumni(a, allArticles) {
  const heroPhotoSrc = a.heroPhoto || '';
  const q = (a.qa || []);
  const qGet = (i) => q[i] || {};
  const q1 = qGet(0), q2 = qGet(1), q3 = qGet(2), q4 = qGet(3), q5 = qGet(4);
  return `
    <section class="art-hero">
      <div class="h-bg"></div>
      ${heroPhotoSrc ? `<img class="h-bg-img" src="${esc(heroPhotoSrc)}" alt="">` : ''}
      <div class="h-grad"></div>
      <div class="h-body">
        <span class="hero-badge">ALUMNI</span>
        <div class="hero-headline-text">${esc(a.catchcopy || '')}</div>
        <span class="hero-name-en-text">${esc(a.nameEn || '')}</span>
        <span class="hero-name-ja-text">${esc(a.nameJa || '')}</span>
        <span class="hero-meta-text">${esc(a.university || '')}</span>
        ${a.company ? `<div style="margin-top:20px;"><span class="hero-company-badge">${esc(a.company)}</span></div>` : ''}
      </div>
      <div class="scroll-line"><div class="scroll-line-fill"></div></div>
    </section>
    <div class="main-box">
      <div class="main-box-col"><span class="col-eyebrow">CURRENT CAREER</span><div class="col-title-label">現在の仕事・キャリア</div>${textToParas(a.career || '', 'dark-text')}</div>
      <div class="main-box-col"><span class="col-eyebrow">WISE EXPERIENCE</span><div class="col-title-label">WISEでの経験</div>${textToParas(a.wiseExp || '', 'dark-text')}</div>
    </div>
    <div class="banner"><div class="banner-line"></div><span class="banner-label">${esc(a.bannerLabel || 'From WISE to the World')}</span><div class="banner-line"></div></div>
    <div class="qa-wrap">
      <div class="qa-block">
        <div class="qa-head"><span class="qa-num">Q — 01</span><div class="qa-head-divider"></div><span class="qa-question-text">${esc(q1.question || '')}</span></div>
        <div class="layout-single">${textToParas(q1.answer || '', 'qa-p')}</div>
      </div>
      <div class="qa-block watermark-wrap">
        <div class="watermark">WISE</div>
        <div class="qa-head"><span class="qa-num">Q — 02</span><div class="qa-head-divider"></div><span class="qa-question-text">${esc(q2.question || '')}</span></div>
        <div class="layout-single">${textToParas(q2.answer || '', 'qa-p')}</div>
      </div>
      <div class="qa-block">
        <div class="qa-head"><span class="qa-num">Q — 03</span><div class="qa-head-divider"></div><span class="qa-question-text">${esc(q3.question || '')}</span></div>
        <div class="layout-single">${textToParas(q3.answer || '', 'qa-p')}</div>
      </div>
      <div class="qa-block">
        <div class="qa-head"><span class="qa-num">Q — 04</span><div class="qa-head-divider"></div><span class="qa-question-text">${esc(q4.question || '')}</span></div>
        <div class="layout-single">${textToParas(q4.answer || '', 'qa-p')}</div>
      </div>
      <div class="qa-block">
        <div class="qa-head"><span class="qa-num">Q — 05</span><div class="qa-head-divider"></div><span class="qa-question-text">${esc(q5.question || '')}</span></div>
        <div class="layout-single">${textToParas(q5.answer || '', 'qa-p')}</div>
      </div>
    </div>
    ${renderRelated(a.id, allArticles)}`;
}

export function renderEvent(a, allArticles) {
  return `
    <section class="art-hero event-hero">
      <div class="h-bg"></div>
      ${(a.img || a.photo1) ? `<img class="h-bg-img" src="${esc(a.img || a.photo1)}" alt="" style="object-position:center center;">` : ''}
      <div class="h-grad" style="background:linear-gradient(to bottom,rgba(15,23,42,0.5) 0%,rgba(15,23,42,0.75) 100%);"></div>
      <div class="h-body">
        <span class="hero-badge">COMPANY EVENT</span>
        <div class="hero-title-event">${esc(a.eventTitle || '')}</div>
        <div class="hero-meta-row">
          <span class="hero-date-text">${esc(a.date || '')}</span>
          <div class="hero-dot"></div>
          <span class="hero-location-text">${esc(a.location || 'WISE OFFICE')}</span>
        </div>
      </div>
      <div class="scroll-line"><div class="scroll-line-fill"></div></div>
    </section>
    <div class="intro-wrap-event">
      <span class="intro-eyebrow">OVERVIEW</span>
      <div class="intro-title">${esc(a.overviewTitle || '')}</div>
      <div class="intro-divider"></div>
      <div>${textToParas(a.overviewText || '', 'body-p')}</div>
    </div>
    <div class="photo-wrap">
      <div class="photo-grid">
        ${photoBox(a.photo1 || '', true)}
        ${photoBox(a.photo2 || '', false)}
        ${photoBox(a.photo3 || '', false)}
      </div>
    </div>
    <div class="body-wrap-event">
      <div class="body-head"><span class="body-eyebrow">REPORT</span><span class="body-title">イベントレポート</span><div class="body-head-line"></div></div>
      <div class="body-two-col">
        <div>${textToParas(a.reportLeft || '', 'body-p')}</div>
        <div>${textToParas(a.reportRight || '', 'body-p')}</div>
      </div>
    </div>
    ${a.pullQuote ? `<div class="quote-wrap"><div class="quote-inner"><span class="quote-mark">"</span><div class="quote-text">${esc(a.pullQuote)}</div><span class="quote-attr">— ${esc(a.pullQuoteAttr || '参加者コメント')}</span></div></div>` : ''}
    <div class="closing-wrap">
      <div class="closing-head"><span class="closing-eyebrow">CLOSING</span><div class="closing-head-line"></div></div>
      <div>${textToParas(a.closingText || '', 'body-p')}</div>
    </div>
    ${renderRelated(a.id, allArticles)}`;
}

export function renderPress(a, allArticles) {
  const tags = (a.tags || '').split(',').map(t => t.trim()).filter(Boolean);
  const relLinks = a.relatedLinks || [];
  const tagHtml = tags.map(t => `<span class="sidebar-tag">${esc(t)}</span>`).join('');
  const linksHtml = relLinks.map(l =>
    `<a href="${esc(l.url || '#')}" class="sidebar-link-row" target="_blank" rel="noopener"><div class="sidebar-link-dot"></div><span class="sidebar-link-text">${esc(l.text || l.url || '')}</span></a>`
  ).join('');
  return `
    <section class="art-hero press-hero">
      <div class="h-bg"></div>
      <div class="h-body">
        <span class="hero-badge-press">PRESS / EXTERNAL EVENT</span>
        <div class="press-hero-title">${esc(a.pressTitle || '')}</div>
        <div class="hero-meta-row-press">${(a.pressCategory || a.tags || '').split(',').slice(0,2).map(t => `<span class="hero-tag">${esc(t.trim())}</span>`).join('')}</div>
        <span class="hero-date-press">${esc(a.date || '')}</span>
      </div>
      <div class="press-hero-right"><div class="hero-logo-box"><span class="hero-logo-label">${esc(a.mediaName || 'MEDIA / EVENT LOGO')}</span></div></div>
      <div class="scroll-line"><div class="scroll-line-fill"></div></div>
    </section>
    <div class="intro-wrap-press">
      <div class="intro-head"><span class="intro-eyebrow-press">OVERVIEW</span><span class="intro-section-title">概要</span><div class="intro-head-line"></div></div>
      <div>${textToParas(a.overviewText || '', 'body-p')}</div>
    </div>
    <div class="body-wrap-press">
      <div class="body-main">
        <div class="body-main-head"><span class="body-eyebrow">DETAIL</span><span class="body-section-title">詳細レポート</span><div class="body-head-line"></div></div>
        ${textToParas(a.detailText || '', 'body-p')}
      </div>
      <aside class="body-sidebar">
        ${tags.length > 0 ? `<div class="sidebar-card"><div class="sidebar-card-head">TAGS</div><div class="sidebar-card-body"><div class="sidebar-tag-row">${tagHtml}</div></div></div>` : ''}
        ${relLinks.length > 0 ? `<div class="sidebar-card"><div class="sidebar-card-head">RELATED LINKS</div><div class="sidebar-card-body" style="padding:0 20px;">${linksHtml}</div></div>` : ''}
      </aside>
    </div>
    ${renderRelated(a.id, allArticles)}`;
}
