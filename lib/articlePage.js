import { renderIntern, renderAlumni, renderEvent, renderPress } from './articleTemplates';

export function getTitle(a) {
  return a.cardTitle || a.title || a.name || a.headline || a.articleTitle || 'WISE Journal';
}

export function getDescription(a) {
  const intro = a.excerpt || a.introText || a.bodyText || a.overviewText || a.reason || a.work || '';
  return intro.slice(0, 120).replace(/\n/g, ' ').trim() || 'WISEインターンシップの活動記録・メンバーインタビュー';
}

export function getImage(a) {
  return a.img || a.photo1 || a.heroImg || '';
}

export function renderBody(a, allArticles) {
  const type = a.template || a.type || 'intern';
  if (type === 'alumni') return renderAlumni(a, allArticles);
  if (type === 'event') return renderEvent(a, allArticles);
  if (type === 'press') return renderPress(a, allArticles);
  return renderIntern(a, allArticles);
}

export function buildProps(row, allRows) {
  const article = { ...row.data, id: row.id };
  const allArticles = (allRows || []).map(r => ({ ...r.data, id: r.id }));

  const title = getTitle(article);
  const description = getDescription(article);
  const image = getImage(article);
  const pageUrl = article.slug
    ? `https://wise.weby.co.jp/article/${article.slug}`
    : `https://wise.weby.co.jp/article?id=${article.id}`;
  const bodyHtml = renderBody(article, allArticles);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    ...(image ? { image: [image] } : {}),
    url: pageUrl,
    publisher: {
      '@type': 'Organization',
      name: 'WISE — 株式会社WEBY',
      url: 'https://wise.weby.co.jp',
    },
  };

  return {
    props: {
      article,
      allArticles,
      seo: { title, description, image, pageUrl, jsonLd: JSON.stringify(jsonLd) },
      bodyHtml,
    },
  };
}
