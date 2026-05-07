import Head from 'next/head';
import { useEffect } from 'react';

const TEMPLATE_CRUMB = {
  intern: { label: 'インターン体験談', filter: 'INTERN' },
  alumni: { label: 'OB・OG インタビュー', filter: 'ALUMNI' },
  event:  { label: '社内イベント', filter: 'EVENT' },
  press:  { label: 'プレス掲載', filter: 'NEWS' },
};

export default function ArticlePage({ article, seo, bodyHtml }) {
  const { title, description, image, pageUrl, jsonLd } = seo;
  const fullTitle = title + ' — WISE Journal';
  const tpl = article?.template || 'intern';
  const crumb = TEMPLATE_CRUMB[tpl] || { label: 'ジャーナル', filter: '' };
  const journalUrl = crumb.filter ? `/?filter=${crumb.filter}#journal` : '/#journal';

  useEffect(() => {
    const hdr = document.getElementById('header');
    if (!hdr) return;
    const onScroll = () => {
      if (window.scrollY > 20) {
        hdr.classList.remove('top-transparent');
        hdr.classList.add('scrolled');
      } else {
        hdr.classList.remove('scrolled');
        hdr.classList.add('top-transparent');
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="WISE — インターンシップ" />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        {image && <meta property="og:image" content={image} />}
        <meta property="og:url" content={pageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        {image && <meta name="twitter:image" content={image} />}
        <link rel="canonical" href={pageUrl} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;700;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      </Head>

      <header id="header" className="top-transparent">
        <a href="/" className="logo">
          <img src="/logo.png" alt="WISE" />
        </a>
        <nav>
          <a href="/#about">ABOUT</a>
          <a href="/#departments">DEPARTMENTS</a>
          <a href="/#journal">JOURNAL</a>
          <a href="/#recruit">RECRUIT</a>
          <a
            href="https://weby.app.n8n.cloud/form/3286f067-5ae9-454c-965c-085a702493ee"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-entry"
          >
            ENTRY
          </a>
        </nav>
      </header>

      <nav className="breadcrumb">
        <a href="/">ホーム</a>
        <span>›</span>
        <a href={journalUrl}>{crumb.label}</a>
        <span>›</span>
        <span>{title}</span>
      </nav>

      <div id="root" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  );
}
