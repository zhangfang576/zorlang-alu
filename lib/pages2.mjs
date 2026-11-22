import { page, table, pic, secHead, inquiryForm, breadcrumbLd, url, abs, esc } from './render.mjs';

const IMG = (f) => `/assets/images/${f}`;

export function applications(ctx) {
  const { site, loc, t, locales, x } = ctx;
  const blocks = x.industries
    .map((ind, i) => `<section class="sec${i % 2 ? ' sec--alt' : ''}"><div class="wrap"><div class="pgrid">
      <div>${pic(IMG(ind.img), ind.t, 1600, 900)}</div>
      <div>
        <h2>${esc(ind.t)}</h2>
        <p class="lead">${esc(ind.d)}</p>
        <p class="ind__lbl">${esc(t.applications.alloysLabel)} · ${ind.alloys.length}</p>
        <div class="alloy-switch">${ind.alloys.map((a) => `<a class="pill" href="${url(loc, 'products/' + a + '/')}">${a}</a>`).join('')}</div>
      </div>
    </div></div></section>`)
    .join('\n');

  const body = `<section class="sec"><div class="wrap">
    <h1>${esc(t.applications.h1)}</h1><p class="lead">${esc(t.applications.sub)}</p>
  </div></section>${blocks}`;

  return page({
    site, loc, t, locales, path: 'applications/', active: 'applications',
    title: (loc.code === 'en' && t.applications.metaTitle) || `${t.applications.h1} | ${site.brand} ${site.brandSuffix}`,
    desc: (loc.code === 'en' && t.applications.metaDesc) || t.applications.sub,
    crumbs: [{ label: t.nav.home, href: url(loc) }, { label: t.nav.applications, href: url(loc, 'applications/') }],
    jsonld: [breadcrumbLd([{ label: t.nav.home, href: url(loc) }, { label: t.nav.applications, href: url(loc, 'applications/') }], site)],
    body
  });
}

export function capabilities(ctx) {
  const { site, loc, t, locales, x } = ctx;

  const steps = x.processSteps
    .map(([title, desc], i) => `<div class="box" style="margin-bottom:12px">
      <div class="card__meta">0${i + 1}</div><h3>${esc(title)}</h3><p style="margin:0">${esc(desc)}</p></div>`)
    .join('');

  const body = `<section class="sec"><div class="wrap">
    <h1>${esc(t.capabilities.h1)}</h1><p class="lead">${esc(t.capabilities.sub)}</p>
  </div></section>

<section class="sec sec--alt"><div class="wrap">
  ${secHead(t.capabilities.equipTitle, t.capabilities.equipSub)}
  ${table({ head: ['Line', 'Specification', 'Qty'], rows: x.equipment.map((r) => r.map(esc)) })}
  ${pic(IMG('about-factory.jpg'), 'Extrusion plant', 1400, 1050)}
</div></section>

<section class="sec"><div class="wrap">
  ${secHead(t.capabilities.processTitle, t.capabilities.processSub)}
  <div class="grid g3">${steps}</div>
</div></section>`;

  return page({
    site, loc, t, locales, path: 'capabilities/', active: 'capabilities',
    title: (loc.code === 'en' && t.capabilities.metaTitle) || `${t.capabilities.h1} | ${site.brand} ${site.brandSuffix}`,
    desc: (loc.code === 'en' && t.capabilities.metaDesc) || t.capabilities.sub,
    crumbs: [{ label: t.nav.home, href: url(loc) }, { label: t.nav.capabilities, href: url(loc, 'capabilities/') }],
    jsonld: [breadcrumbLd([{ label: t.nav.home, href: url(loc) }, { label: t.nav.capabilities, href: url(loc, 'capabilities/') }], site)],
    body
  });
}

export function quality(ctx) {
  const { site, loc, t, locales, x } = ctx;
  const tests = x.tests
    .map(([title, desc], i) => `<div class="card"><div class="card__b">
      <div class="card__meta">0${i + 1}</div><h3>${esc(title)}</h3><p>${esc(desc)}</p></div></div>`)
    .join('');

  const body = `<section class="sec"><div class="wrap">
    <h1>${esc(t.quality.h1)}</h1><p class="lead">${esc(t.quality.sub)}</p>
  </div></section>

<section class="sec sec--alt"><div class="wrap">
  ${secHead(t.quality.testTitle, t.quality.testSub)}
  <div class="grid g4">${tests}</div>
</div></section>

<section class="sec"><div class="wrap">
  ${secHead(t.quality.certTitle, t.quality.certSub)}
  ${table({ head: ['Standard', 'Scope', 'Frequency'], rows: x.standardsRows.map((r) => r.map(esc)) })}
  ${pic(IMG('inspection-03-corrosion.jpg'), 'Salt spray testing', 1200, 900)}
</div></section>

<section class="sec sec--alt"><div class="wrap">
  ${secHead(t.quality.packTitle, t.quality.packSub)}
  <div class="pgrid">
    <div>${pic(IMG('process-06-packing.jpg'), 'Export packing', 1400, 933)}</div>
    <div><ul class="prose">${x.packingSteps.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>
  </div>
</div></section>`;

  return page({
    site, loc, t, locales, path: 'quality/', active: 'quality',
    title: (loc.code === 'en' && t.quality.metaTitle) || `${t.quality.h1} | ${site.brand} ${site.brandSuffix}`,
    desc: (loc.code === 'en' && t.quality.metaDesc) || t.quality.sub,
    crumbs: [{ label: t.nav.home, href: url(loc) }, { label: t.nav.quality, href: url(loc, 'quality/') }],
    jsonld: [breadcrumbLd([{ label: t.nav.home, href: url(loc) }, { label: t.nav.quality, href: url(loc, 'quality/') }], site)],
    body
  });
}

const CATS = ['market', 'guide', 'standard', 'industry'];

// 列表分页：每页条数读 site.config.json 的 newsPerPage，首页仍是 /news/，第 2 页起为 /news/page/2/
function pagerHtml({ t, current, totalPages, href }) {
  if (totalPages <= 1) return '';
  const win = new Set([1, totalPages, current, current - 1, current + 1]);
  const nums = [...win].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const seq = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) seq.push('…');
    seq.push(n);
  });
  const label = (n) => (n === current
    ? `<span class="pager__n is-cur" aria-current="page">${n}</span>`
    : `<a class="pager__n" href="${href(n)}">${n}</a>`);

  return `<nav class="pager" aria-label="${esc(t.news.pagination)}">
      ${current > 1 ? `<a class="pager__step" rel="prev" href="${href(current - 1)}">← ${esc(t.news.prev)}</a>` : `<span class="pager__step is-off">← ${esc(t.news.prev)}</span>`}
      <span class="pager__nums">${seq.map((n) => (n === '…' ? '<span class="pager__gap">…</span>' : label(n))).join('')}</span>
      ${current < totalPages ? `<a class="pager__step" rel="next" href="${href(current + 1)}">${esc(t.news.next)} →</a>` : `<span class="pager__step is-off">${esc(t.news.next)} →</span>`}
    </nav>`;
}

export function newsIndex(ctx, category = '', pageNum = 1) {
  const { site, loc, t, locales, posts } = ctx;
  const perPage = Math.max(1, Number(site.newsPerPage) || 10);
  const list = category ? posts.filter((p) => p.meta.category === category) : posts;
  const totalPages = Math.max(1, Math.ceil(list.length / perPage));
  const current = Math.min(Math.max(1, Math.floor(Number(pageNum) || 1)), totalPages);
  const shown = list.slice((current - 1) * perPage, current * perPage);
  const base = category ? `news/${category}/` : 'news/';
  const path = current === 1 ? base : `${base}page/${current}/`;
  const href = (n) => url(loc, n === 1 ? base : `${base}page/${n}/`);

  const chips = `<div class="catlist">
    <a href="${url(loc, 'news/')}"${!category ? ' aria-current="page"' : ''}>${esc(t.common.allCategories)}</a>
    ${CATS.map((c) => `<a href="${url(loc, 'news/' + c + '/')}"${category === c ? ' aria-current="page"' : ''}>${esc(t.news.categories[c])}</a>`).join('')}
  </div>`;

  const items = shown
    .map((p) => `<article class="card" style="margin-bottom:14px"><div class="card__b">
      <div class="card__meta">${esc(t.news.categories[p.meta.category] || p.meta.category)} · ${esc(p.meta.date)}</div>
      <h3><a href="${url(loc, 'news/' + p.slug + '/')}" style="text-decoration:none">${esc(p.meta.title)}</a></h3>
      <p>${esc(p.meta.description || '')}</p>
      <p class="note">${esc(p.meta.author || '')} · ${p.readMin} ${esc(t.common.minRead)}</p>
    </div></article>`)
    .join('');

  const info = t.news.pageInfo
    .replace('{current}', current)
    .replace('{total}', totalPages)
    .replace('{count}', list.length);

  const body = `<section class="sec"><div class="wrap">
    <h1>${category ? esc(t.news.categories[category]) : esc(t.news.h1)}</h1>
    <p class="lead">${esc(category ? t.news.catDesc[category] : t.news.sub)}</p>
    ${chips}
    ${items || `<p>${esc(t.news.empty)}</p>`}
    ${pagerHtml({ t, current, totalPages, href })}
    <p class="pager__info">${esc(info)}</p>
    <p><a class="btn btn--o" href="${url(loc, 'news/rss.xml')}">${esc(t.news.rss)}</a></p>
  </div></section>`;

  const heading = category ? t.news.categories[category] : t.news.h1;
  return page({
    site, loc, t, locales, path, active: 'news', altCodes: ['en', 'zh-CN'], langFallback: true,
    title: `${heading}${current > 1 ? ` — ${(t.news.pageLabel || 'Page {n}').replace('{n}', current)}` : ''} | ${site.brand} ${site.brandSuffix}`,
    desc: category ? t.news.catDesc[category] : t.news.sub,
    crumbs: category
      ? [{ label: t.nav.home, href: url(loc) }, { label: t.nav.news, href: url(loc, 'news/') }, { label: t.news.categories[category], href: url(loc, path) }]
      : [{ label: t.nav.home, href: url(loc) }, { label: t.nav.news, href: url(loc, 'news/') }],
    jsonld: [breadcrumbLd(category
      ? [{ label: t.nav.home, href: url(loc) }, { label: t.nav.news, href: url(loc, 'news/') }, { label: t.news.categories[category], href: url(loc, path) }]
      : [{ label: t.nav.home, href: url(loc) }, { label: t.nav.news, href: url(loc, 'news/') }], site)],
    body
  });
}

export function article(ctx, post) {
  const { site, loc, t, locales, alloys } = ctx;
  const path = `news/${post.slug}/`;
  const related = (post.meta.products || [])
    .filter((id) => alloys.alloys.some((a) => a.id === id))
    .map((id) => `<li><a href="${url(loc, 'products/' + id + '/')}">${id} aluminium — specifications and forms</a></li>`)
    .join('');

  const sources = (post.meta.sources || [])
    .map((s) => `<li>${esc(s)}</li>`)
    .join('');

  const jsonld = [breadcrumbLd([
    { label: t.nav.home, href: url(loc) },
    { label: t.nav.news, href: url(loc, 'news/') },
    { label: post.meta.title, href: url(loc, path) }
  ], site), {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.meta.title,
    description: post.meta.description || '',
    datePublished: post.meta.date,
    dateModified: post.meta.updated || post.meta.date,
    author: { '@type': 'Person', name: post.meta.author || 'Zorlang technical team' },
    publisher: { '@type': 'Organization', name: `${site.brand} ${site.brandSuffix}` },
    mainEntityOfPage: abs(site, url(loc, path)),
    articleSection: post.meta.category,
    inLanguage: loc.code
  }];

  const body = `<article class="sec"><div class="wrap"><div class="post">
    <p class="eyebrow">${esc(t.news.categories[post.meta.category] || post.meta.category)}</p>
    <h1>${esc(post.meta.title)}</h1>
    <p class="lead">${esc(post.meta.description || '')}</p>
    <div class="post__meta">
      <span>${esc(t.common.author)}: ${esc(post.meta.author || 'Zorlang technical team')}</span>
      <span>${esc(t.common.published)}: <time datetime="${esc(post.meta.date)}">${esc(post.meta.date)}</time></span>
      <span>${esc(t.common.updated)}: <time datetime="${esc(post.meta.updated || post.meta.date)}">${esc(post.meta.updated || post.meta.date)}</time></span>
      <span>${post.readMin} ${esc(t.common.minRead)}</span>
    </div>
    ${post.html}
    ${sources ? `<h2>${esc(t.news.sources)}</h2><ul class="src">${sources}</ul>` : ''}
    ${related ? `<h2>${esc(t.common.related)}</h2><ul>${related}</ul>` : ''}
    <p style="margin-top:26px"><a class="btn btn--o" href="${url(loc, 'news/')}">${esc(t.cta.backToNews)}</a></p>
  </div></div></article>`;

  return page({
    site, loc, t, locales, path, active: 'news', altCodes: ['en', 'zh-CN'], langFallback: true,
    title: post.meta.metaTitle || `${post.meta.title} | ${site.brand}`,
    desc: post.meta.description || '',
    jsonld,
    crumbs: [
      { label: t.nav.home, href: url(loc) },
      { label: t.nav.news, href: url(loc, 'news/') },
      { label: post.meta.title, href: url(loc, path) }
    ],
    body
  });
}

export function about(ctx) {
  const { site, loc, t, locales, x } = ctx;
  const timeline = x.timeline
    .map(([year, text]) => `<tr><th scope="row">${esc(year)}</th><td>${esc(text)}</td></tr>`)
    .join('');

  const body = `<section class="sec"><div class="wrap">
    <h1>${esc(t.about.h1)}</h1><p class="lead">${esc(t.about.sub)}</p>
  </div></section>

<section class="sec sec--alt"><div class="wrap"><div class="pgrid">
  <div>
    <h2>${esc(t.about.capTitle)}</h2>
    ${table({ rows: x.plantTable.map((r) => [esc(r[0]), esc(r[1])]) })}
    <h2 style="margin-top:32px">${esc(t.about.timelineTitle)}</h2>
    <div class="tw"><table><tbody>${timeline}</tbody></table></div>
  </div>
  <div>${pic(IMG('about-factory.jpg'), 'Zorlang plant', 1400, 1050)}</div>
</div></div></section>

<section class="sec"><div class="wrap">
  <div class="pgrid">
    <div><h2>${esc(t.contact.formTitle)}</h2><p class="note">${esc(t.contact.note)}</p></div>
    <aside class="aside"><div class="box box--dark"><h3>${esc(t.cta.quote)}</h3>${inquiryForm({ site, loc, t })}</div></aside>
  </div>
</div></section>`;

  return page({
    site, loc, t, locales, path: 'about/', active: 'about',
    title: (loc.code === 'en' && t.about.metaTitle) || `${t.about.h1} | ${site.brand} ${site.brandSuffix}`,
    desc: (loc.code === 'en' && t.about.metaDesc) || t.about.sub,
    crumbs: [{ label: t.nav.home, href: url(loc) }, { label: t.nav.about, href: url(loc, 'about/') }],
    jsonld: [breadcrumbLd([{ label: t.nav.home, href: url(loc) }, { label: t.nav.about, href: url(loc, 'about/') }], site)],
    body
  });
}

export function contact(ctx) {
  const { site, loc, t, locales } = ctx;
  const body = `<section class="sec contact-page"><div class="wrap"><div class="pgrid">
  <div>
    <h1>${esc(t.contact.h1)}</h1>
    <p class="lead">${esc(t.contact.sub)}</p>
    <dl class="kv">
      <dt>${esc(t.cta.email)}</dt><dd><a href="mailto:${esc(site.email)}" data-conv="email">${esc(site.email)}</a></dd>
      <dt>${esc(t.cta.call)}</dt><dd><a href="tel:${esc(site.phoneDigits)}" data-conv="phone">${esc(site.phone)}</a></dd>
      <dt>${esc(t.cta.whatsapp)}</dt><dd><a href="https://wa.me/${esc(site.whatsapp)}" data-conv="whatsapp" rel="noopener">${esc(site.phone)}</a></dd>
      <dt>${esc(t.contact.address)}</dt><dd>${esc(site.addressLine)}</dd>
      <dt>${esc(t.contact.hoursLabel || 'Hours')}</dt><dd>${esc(t.contact.hours)}</dd>
    </dl>
    <p class="note">${esc(t.contact.note)}</p>
  </div>
  <div class="box"><h2>${esc(t.contact.formTitle)}</h2>${inquiryForm({ site, loc, t, id: 'contact-form' })}</div>
</div></div></section>`;

  return page({
    site, loc, t, locales, path: 'contact/', active: 'contact',
    title: (loc.code === 'en' && t.contact.metaTitle) || `${t.contact.h1} | ${site.brand} ${site.brandSuffix}`,
    desc: (loc.code === 'en' && t.contact.metaDesc) || t.contact.sub,
    crumbs: [{ label: t.nav.home, href: url(loc) }, { label: t.nav.contact, href: url(loc, 'contact/') }],
    jsonld: [breadcrumbLd([{ label: t.nav.home, href: url(loc) }, { label: t.nav.contact, href: url(loc, 'contact/') }], site)],
    body
  });
}
