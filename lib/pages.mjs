import { page, table, pic, secHead, inquiryForm, breadcrumbLd, url, abs, esc } from './render.mjs';

const IMG = (f) => `/assets/images/${f}`;

export function home(ctx) {
  const { site, loc, t, locales, alloys, news, alloyCopy = {} } = ctx;
  const heroImg = IMG('hero-aluminum-mill.jpg');

  const labels = t.home.statsLabels || [];
  const stats = [
    [t.home.statCapacity || '50,000 t', labels[0] || ''],
    [String(alloys.alloys.length), labels[1] || ''],
    [String(alloys.forms.length), labels[2] || ''],
    ['40+', labels[3] || '']
  ];

  const formCards = alloys.forms
    .map((f) => `<a class="card" href="${url(loc, 'products/#' + f.id)}">
        ${pic(IMG(f.image), t.forms[f.id], f.img[0], f.img[1])}
        <div class="card__b"><h3>${esc(t.forms[f.id])}</h3><p>${esc(f.id)} · MTC</p></div>
      </a>`)
    .join('\n');

  const alloyCards = alloys.alloys
    .map((a) => {
      // 卡片图用该牌号图库里的另一张，避免与详情页首图重复、也避免首页出现重复图
      const img = IMG(a.cardImg || a.appImg);
      return `<a class="card" href="${url(loc, 'products/' + a.id + '/')}">
        ${pic(img, ((alloyCopy[a.id] || {}).uses || [])[0] || `${a.id} aluminium`, 1600, 1067)}
        <div class="card__b"><div class="card__meta">${esc(a.temper)} · ${esc(a.standardShort || a.standards[0])}</div>
          <h3>${a.id} ${esc(t.common.alloy)}</h3><p>${esc(a.thickness)}</p></div>
      </a>`;
    })
    .join('\n');

  const posts = news.slice(0, 3)
    .map((p) => `<a class="card" href="${url(loc, 'news/' + p.slug + '/')}">
        <div class="card__b"><div class="card__meta">${esc(p.meta.category)}</div><h3>${esc(p.meta.title)}</h3>
        <p>${esc(p.meta.description || '')}</p></div></a>`)
    .join('\n');

  const body = `
<section class="hero">
  <img class="hero__img" src="${heroImg}" alt="" width="1920" height="1080" fetchpriority="high" decoding="async">
  <div class="hero__in">
    <p class="eyebrow">${esc(t.home.eyebrow)}</p>
    <h1>${esc(t.home.h1)}</h1>
    <p>${esc(t.home.sub)}</p>
    <div class="actions">
      <a class="btn btn--p" href="${url(loc, 'contact/')}">${esc(t.cta.quote)}</a>
      <a class="btn btn--g" href="${url(loc, 'products/')}">${esc(t.home.ctaSecondary)}</a>
    </div>
  </div>
</section>
<div class="wrap" style="padding-top:18px"><div class="stats">
  ${stats.map(([v, k]) => `<div class="stat"><b><bdi dir="ltr">${v}</bdi></b><span>${esc(k)}</span></div>`).join('')}
</div></div>

<section class="sec"><div class="wrap">
  ${secHead(t.home.formsTitle, t.home.formsSub)}
  <div class="grid g3">${formCards}</div>
</div></section>

<section class="sec sec--alt"><div class="wrap">
  ${secHead(t.home.alloysTitle, t.home.alloysSub)}
  <div class="grid g4">${alloyCards}</div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="pgrid">
    <div>
      ${secHead(t.home.ctaTitle, t.home.ctaSub)}
      <ul class="prose">${(t.home.bullets || []).map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
      <p><a class="btn btn--d" href="${url(loc, 'capabilities/')}">${esc(t.nav.capabilities)}</a></p>
    </div>
    <aside class="aside"><div class="box box--dark">
      <h3>${esc(t.contact.formTitle)}</h3>
      ${inquiryForm({ site, loc, t })}
    </div></aside>
  </div>
</div></section>

${news.length ? `<section class="sec sec--alt"><div class="wrap">
  ${secHead(t.home.newsTitle, t.home.newsSub)}
  <div class="grid g3">${posts}</div>
  <p style="margin-top:18px"><a class="btn btn--o" href="${url(loc, 'news/')}">${esc(t.cta.viewAll)}</a></p>
</div></section>` : ''}
`;

  return page({
    site, loc, t, locales, path: '', active: 'home',
    title: t.home.metaTitle,
    desc: t.home.metaDesc || t.home.sub,
    heroPreload: heroImg,
    body
  });
}

export function products(ctx) {
  const { site, loc, t, locales, alloys } = ctx;
  const names = t.forms;

  const rows = alloys.alloys.map((a) => [
    `<a href="${url(loc, 'products/' + a.id + '/')}"><strong>${a.id}</strong></a>`,
    esc(a.series),
    esc(a.temper),
    esc(a.thickness),
    esc(a.standards.slice(0, 3).join(' / ')),
    a.forms.map((f) => `<span class="tag">${esc(names[f] || f)}</span>`).join('')
  ]);

  const seriesList = [...new Set(alloys.alloys.map((a) => a.series))];
  const seriesBar = seriesList
    .map((s) => `<span class="pill">${esc(s)} · ${alloys.alloys.filter((a) => a.series === s).length}</span>`)
    .join('');

  const sections = alloys.forms
    .map((f) => {
      const list = alloys.alloys.filter((a) => a.forms.includes(f.id));
      return `<div id="${f.id}" style="margin-bottom:34px">
        <div class="pgrid">
          <div>
            <h2>${esc(names[f.id])}</h2>
            <p class="lead">${esc(list.map((a) => a.id).join(' · '))}</p>
            <dl class="kv">
              <dt>${esc(t.common.thickness)}</dt><dd>${esc(list[0] ? list[0].thickness : '')}</dd>
              <dt>${esc(t.common.width)}</dt><dd>${esc(list[0] ? list[0].width : '')}</dd>
              <dt>${esc(t.common.surface)}</dt><dd>${esc(list[0] ? list[0].surface.join(', ') : '')}</dd>
            </dl>
            <p style="margin-top:12px">${list.map((a) => `<a class="pill" href="${url(loc, 'products/' + a.id + '/')}">${a.id}</a>`).join('')}</p>
          </div>
          <div>${pic(IMG(f.image), names[f.id], f.img[0], f.img[1])}</div>
        </div>
      </div>`;
    })
    .join('');

  const body = `
<section class="sec"><div class="wrap">
  <h1>${esc(t.products.h1)}</h1>
  <p class="lead">${esc(t.products.sub)}</p>
  <p class="tags-row">${seriesBar}</p>
</div></section>
<section class="sec sec--alt"><div class="wrap">
  ${secHead(t.products.tableTitle, t.products.tableSub)}
  ${table({
    head: [t.common.alloy, t.common.series, t.common.temper, t.common.thickness, t.common.standard, t.products.formLabel],
    rows
  })}
</div></section>
<section class="sec"><div class="wrap">${sections}</div></section>
`;

  return page({
    site, loc, t, locales, path: 'products/', active: 'products',
    title: (loc.code === 'en' && t.products.metaTitle) || `${t.products.h1} | ${site.brand} ${site.brandSuffix}`,
    desc: (loc.code === 'en' && t.products.metaDesc) || t.products.sub,
    crumbs: [{ label: t.nav.home, href: url(loc) }, { label: t.nav.products, href: url(loc, 'products/') }],
    jsonld: [breadcrumbLd([{ label: t.nav.home, href: url(loc) }, { label: t.nav.products, href: url(loc, 'products/') }], site)],
    body
  });
}

export function alloyPage(ctx, a) {
  const { site, loc, t, locales, alloys, alloyCopy, pdfAvailable } = ctx;
  const copy = alloyCopy[a.id] || {};
  const path = `products/${a.id}/`;
  const img = IMG(alloys.forms.find((f) => f.id === a.forms[0]).image);

  const specRows = [
    [t.common.alloy, a.id],
    [t.common.series, a.series],
    [t.common.temper, a.tempers.join(' · ')],
    [t.common.standard, a.standards.join(' / ')],
    [t.common.thickness, a.thickness],
    [t.common.width, a.width],
    [t.common.length, a.length],
    [t.common.surface, a.surface.join(' · ')],
    [t.common.density, a.density],
    ...(a.melting ? [[t.common.melting, a.melting]] : [])
  ];

  // 主要用途 + 应用示意图
  const usesList = (copy.uses || []).map((u) => `<li>${esc(u)}</li>`).join('');
  // 应用图：有附加图时渲染成「大图 + 缩略图」画廊，无 JS 时首图与缩略图依然可见
  const usesArr = copy.uses || [];
  const slides = [a.appImg, ...(a.gallery || [])].filter(Boolean);
  const slideAlt = (i) => `${a.id} — ${usesArr[i] || usesArr[0] || t.alloyPage.usesTitle}`;

  const appFig = a.appImg
    ? slides.length > 1
      ? `<figure class="appimg gal" data-gal>
        <div class="gal__stage">
          <picture class="gal__pic">
            <source type="image/webp" srcset="${IMG(a.appImg).replace(/\.jpg$/, '.webp')}" data-gal-webp>
            <img class="gal__img" src="${IMG(a.appImg)}" alt="${esc(slideAlt(0))}" width="1600" height="1067" data-gal-main decoding="async">
          </picture>
          <button class="gal__nav gal__nav--prev" type="button" aria-label="${esc(t.alloyPage.prevImg || 'Previous image')}">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="gal__nav gal__nav--next" type="button" aria-label="${esc(t.alloyPage.nextImg || 'Next image')}">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
        <figcaption>${esc(t.alloyPage.appImgCaption)} · <bdi dir="ltr">${esc(a.id)} ${esc(a.temper)}</bdi> · <span data-gal-count><bdi dir="ltr">1 / ${slides.length}</bdi></span></figcaption>
        <div class="gal__thumbs" role="group" aria-label="${esc(t.alloyPage.galleryLabel || t.alloyPage.appImgCaption)}">
          ${slides
            .map(
              (s, i) => `<a class="gal__th${i === 0 ? ' is-on' : ''}" href="${IMG(s)}" data-src="${IMG(s)}" data-i="${i}"${i === 0 ? ' aria-current="true"' : ''} aria-label="${esc(slideAlt(i))}">
            <img src="${IMG(s).replace(/\.jpg$/, '-t.jpg')}" alt="" width="320" height="213" loading="lazy" decoding="async">
          </a>`
            )
            .join('')}
        </div>
      </figure>`
      : `<figure class="appimg">${pic(IMG(a.appImg), slideAlt(0), 1600, 1067)}
        <figcaption>${esc(t.alloyPage.appImgCaption)} · ${esc(a.id)} ${esc(a.temper)}</figcaption></figure>`
    : '';

  const cmpAlts = a.compare
    .map((id) => alloys.alloys.find((x) => x.id === id))
    .filter(Boolean);

  const cmpHead = `<thead><tr><th scope="col">${esc(t.alloyPage.compareHead[0])}</th><th scope="col">${esc(a.id)}</th>${cmpAlts
    .map((o) => `<th scope="col"><a href="${url(loc, 'products/' + o.id + '/')}">${esc(o.id)}</a></th>`)
    .join('')}</tr></thead>`;

  const cmpBody = [
    ...a.mech.map(([k, v], i) =>
      `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td>${cmpAlts
        .map((o) => `<td>${esc((o.mech[i] || [0, '—'])[1])}</td>`)
        .join('')}</tr>`),
    `<tr><th scope="row">${esc(t.common.density)}</th><td>${esc(a.density)}</td>${cmpAlts
      .map((o) => `<td>${esc(o.density)}</td>`)
      .join('')}</tr>`
  ].join('');

  const compareTable = cmpAlts.length ? `<div class="tw"><table class="cmp">${cmpHead}<tbody>${cmpBody}</tbody></table></div>` : '';
  const compareNote = (copy.compare && cmpAlts.map((o) => copy.compare[o.id]).filter(Boolean).join(' ')) || '';

  const appList = (copy.apps || [])
    .map((x) => `<div class="box" style="margin-bottom:12px"><h3>${esc(x.t)}</h3><p style="margin:0">${esc(x.d)}</p></div>`)
    .join('');

  // 全部牌号，当前牌号高亮，方便横向切换
  const related = alloys.alloys
    .map((x) =>
      x.id === a.id
        ? `<span class="pill pill--on" aria-current="page">${esc(x.id)}</span>`
        : `<a class="pill" href="${url(loc, 'products/' + x.id + '/')}">${esc(x.id)}</a>`
    )
    .join('');

  const jsonld = [
    breadcrumbLd([
      { label: t.nav.home, href: url(loc) },
      { label: t.nav.products, href: url(loc, 'products/') },
      { label: a.id, href: url(loc, path) }
    ], site),
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `${a.id} aluminium ${a.forms.join(', ')}`,
      sku: `ZOR-${a.id}`,
      material: `Aluminium alloy ${a.id}`,
      description: copy.metaDesc || '',
      brand: { '@type': 'Brand', name: `${site.brand} ${site.brandSuffix}` },
      category: 'Aluminium products',
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        priceCurrency: 'USD',
        price: '0',
        priceValidUntil: '2026-12-31',
        url: abs(site, url(loc, path))
      }
    }
  ];

  const body = `
<section class="sec" style="padding-bottom:0"><div class="wrap">
  <h1>${esc(copy.h1 || `${a.id} ${t.common.alloy}`)}</h1>
  <p class="lead">${esc(copy.intro || '')}</p>
  <p>${a.forms.map((f) => `<span class="tag">${esc(t.forms[f] || f)}</span>`).join('')}</p>
</div></section>

<section class="sec sec--alt"><div class="wrap"><div class="pgrid">
  <div>${appFig}</div>
  <div>
    <h2>${esc(t.alloyPage.usesTitle)}</h2>
    <p class="note">${esc(t.alloyPage.usesSub)}</p>
    <ul class="uses">${usesList}</ul>
  </div>
</div></div></section>

<section class="sec"><div class="wrap"><div class="pgrid">
  <div>
    <h2>${esc(t.alloyPage.specTitle)}</h2>
    <p class="note">${esc(t.alloyPage.specSub)}</p>
    ${table({ rows: specRows.map(([k, v]) => [k, esc(v)]) })}
    <p class="note" style="margin-top:8px">${esc(t.alloyPage.otherTempers)}</p>
    ${a.melting && t.alloyPage.meltingNote ? `<p class="note" style="margin-top:4px">${esc(t.alloyPage.meltingNote)}</p>` : ''}

    <h2 style="margin-top:32px">${esc(t.alloyPage.chemTitle)}</h2>
    <p class="note">${esc(t.alloyPage.chemSub)}</p>
    ${table({ head: [t.common.element, '%'], rows: a.chem.map(([k, v]) => [esc(k), esc(v)]) })}

    <h2 style="margin-top:32px">${esc(t.alloyPage.mechTitle)}</h2>
    <p class="note">${esc(t.alloyPage.mechSub)}</p>
    ${table({ head: [t.common.property, t.common.value], rows: a.mech.map(([k, v]) => [esc(k), esc(v)]) })}

    <h2 style="margin-top:32px">${esc(t.alloyPage.compareTitle)}</h2>
    <p class="note">${esc(t.alloyPage.compareSub)}</p>
    ${compareTable}
    ${compareNote ? `<p class="note" style="margin-top:10px">${esc(compareNote)}</p>` : ''}

    <h2 style="margin-top:32px">${esc(t.alloyPage.processTitle)}</h2>
    <p>${esc(copy.qc || t.alloyPage.qcGeneric || '')}</p>

    <h2 style="margin-top:32px">${esc(t.alloyPage.packingTitle)}</h2>
    ${pic(IMG('process-06-packing.jpg'), 'Export packing', 1400, 933)}

    <h2 style="margin-top:32px">${esc(t.alloyPage.certTitle)}</h2>
    <p>${esc(t.alloyPage.certBody)}</p>
    <p><a class="btn btn--o" href="/downloads/${a.id}-spec.pdf" download>${esc(t.cta.downloadPdf)}</a></p>
    <p class="note">${esc(t.alloyPage.downloadNote)}</p>

    <h2 style="margin-top:32px">${esc(t.alloyPage.relatedTitle)}</h2>
    <div class="alloy-switch">${related}</div>
  </div>

  <aside class="aside">
    <div class="box box--dark">
      <h3>${esc(t.alloyPage.inquiryTitle)}</h3>
      <p class="note note--d">${esc(t.alloyPage.inquirySub)}</p>
      ${inquiryForm({ site, loc, t, alloy: a.id, thickness: a.defaultThickness, id: 'rfq' })}
    </div>
  </aside>
</div></div></section>
`;

  return page({
    site, loc, t, locales, path, active: 'products',
    title: copy.metaTitle || `${a.id} ${t.common.alloy} | ${site.brand}`,
    desc: copy.metaDesc || copy.intro || '',
    jsonld,
    crumbs: [
      { label: t.nav.home, href: url(loc) },
      { label: t.nav.products, href: url(loc, 'products/') },
      { label: a.id, href: url(loc, path) }
    ],
    body
  });
}


