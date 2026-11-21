// Server-side HTML rendering. No client framework, no hydration.
import fs from 'fs';
import crypto from 'crypto';
// 资源指纹：CSS/JS 内容一变，URL 跟着变，避免浏览器用旧缓存渲染新页面
const fileHash = (rel) => {
  try {
    return crypto.createHash('md5').update(fs.readFileSync(new URL(rel, import.meta.url))).digest('hex').slice(0, 8);
  } catch {
    return 'dev';
  }
};
const V_CSS = fileHash('../assets/css/main.css');
const V_JS = fileHash('../assets/js/main.js');
// 牌号清单以数据层为准，避免表单/页脚写死后与产品页脱节
const ALLOY_IDS = JSON.parse(
  fs.readFileSync(new URL('../content/alloys.json', import.meta.url), 'utf8')
).alloys.map((a) => a.id);
const FOOTER_ALLOYS = ['1050', '3003', '5052', '5083', '6061', '6063', '6082'].filter((id) => ALLOY_IDS.includes(id));
// 只有这两种语言生成新闻栏目与 RSS，其他语种的 RSS 指向英文源，避免死链
const NEWS_LOCALES = ['en', 'zh-CN'];

let CURRENT_NAV = {};
export function setNavOverrides(o) { CURRENT_NAV = o || {}; }

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const url = (loc, p = '') => {
  const base = loc.path.endsWith('/') ? loc.path : loc.path + '/';
  const clean = String(p).replace(/^\/+/, '');
  return base + clean;
};

export const abs = (site, p) => site.siteUrl.replace(/\/$/, '') + (p.startsWith('/') ? p : '/' + p);

const FAVICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#121417"/><path d="M17 17h30v7L31 44h16v7H17v-7l16-20H17z" fill="#b8894a"/></svg>'
  );

export function head({ site, loc, title, desc, canonical, alternates = [], jsonld = [], heroPreload, trackingInline = '' }) {
  const hl = alternates
    .map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${esc(a.href)}">`)
    .join('\n    ');
  const ld = jsonld
    .filter(Boolean)
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`)
    .join('\n    ');

  return `<!doctype html>
<html lang="${loc.code}" dir="${loc.dir}">
<head>
    <meta charset="utf-8">
    <link rel="icon" href="${FAVICON}">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}">
    <link rel="canonical" href="${esc(canonical)}">
    ${hl}
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${esc(site.brand)} ${esc(site.brandSuffix)}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:url" content="${esc(canonical)}">
    <meta name="twitter:card" content="summary_large_image">
    ${heroPreload ? `<link rel="preload" as="image" href="${esc(heroPreload)}" fetchpriority="high">` : ''}
    <link rel="stylesheet" href="/assets/css/main.css?v=${V_CSS}">
    <link rel="alternate" type="application/rss+xml" title="${esc(site.brand)} news" href="${esc(NEWS_LOCALES.includes(loc.code) ? url(loc, 'news/rss.xml') : '/news/rss.xml')}">
    ${ld}
    ${trackingInline}
</head>
<body>`;
}

export function header({ site, loc, t, locales, active, path, navOverrides = {}, langFallback = false }) {
  const navItems = ['products', 'applications', 'capabilities', 'quality', 'news', 'about', 'contact'];
  const links = navItems
    .map((k) => {
      const href = navOverrides[k] || url(loc, k + '/');
      const cur = active === k ? ' aria-current="page"' : '';
      return `<a href="${href}"${cur}>${esc(t.nav[k])}</a>`;
    })
    .join('\n        ');

  const langLinks = locales
    .map((l) => {
      const href = langFallback ? url(l, '/') : url(l, path);
      const cur = l.code === loc.code ? ' aria-current="true"' : '';
      return `<a href="${href}" hreflang="${l.code}" lang="${l.code}"${cur}>${esc(l.name)}</a>`;
    })
    .join('\n          ');

  return `<a class="skip" href="#main">${esc(t.a11y.skip)}</a>
<header class="hdr">
  <div class="hdr__bar">
    <a class="brand" href="${url(loc)}"><b>${esc(site.brand)}</b><span>${esc(site.brandSuffix)}</span></a>
    <nav class="nav" aria-label="Main">
        ${links}
    </nav>
    <div class="hdr__cta">
      <details class="lang">
        <summary aria-label="${esc(loc.name)} — ${esc(t.a11y.language)}">${esc(loc.name)} ▾</summary>
        <div class="lang__menu">
          ${langLinks}
        </div>
      </details>
      <a class="btn btn--p btn--sm" href="${url(loc, 'contact/')}">${esc(t.cta.quote)}</a>
    </div>
  </div>
</header>`;
}

export function footer({ site, loc, t, locales, navOverrides = {} }) {
  const alloyLinks = FOOTER_ALLOYS
    .map((a) => `<li><a href="${url(loc, 'products/' + a + '/')}">${a}</a></li>`)
    .join('');
  const langLinks = locales
    .map((l) => `<a href="${url(l, '')}" hreflang="${l.code}">${esc(l.name)}</a>`)
    .join(' · ');

  return `<footer class="ft">
  <div class="wrap">
    <div class="ft__g">
      <div>
        <p style="color:#fff;font-weight:700;letter-spacing:.06em;margin-bottom:10px">${esc(site.brand)} ${esc(site.brandSuffix)}</p>
        <p>${esc(t.footer.about)}</p>
        <p style="font-size:.8rem">${esc(site.addressLine)}</p>
      </div>
      <div>
        <h3>${esc(t.footer.products)}</h3>
        <ul>${alloyLinks}<li><a href="${url(loc, 'products/')}">${esc(t.cta.viewAlloys)}</a></li></ul>
      </div>
      <div>
        <h3>${esc(t.footer.company)}</h3>
        <ul>
          <li><a href="${url(loc, 'about/')}">${esc(t.nav.about)}</a></li>
          <li><a href="${url(loc, 'capabilities/')}">${esc(t.nav.capabilities)}</a></li>
          <li><a href="${url(loc, 'quality/')}">${esc(t.nav.quality)}</a></li>
          <li><a href="${navOverrides.news || url(loc, 'news/')}">${esc(t.nav.news)}</a></li>
        </ul>
      </div>
      <div>
        <h3>${esc(t.footer.contact)}</h3>
        <ul>
          <li><a href="mailto:${esc(site.email)}" data-conv="email">${esc(site.email)}</a></li>
          <li><a href="tel:${esc(site.phoneDigits)}" data-conv="phone">${esc(site.phone)}</a></li>
          <li><a href="https://wa.me/${esc(site.whatsapp)}" data-conv="whatsapp" rel="noopener">WhatsApp</a></li>
        </ul>
      </div>
    </div>
    <div class="ft__b">
      <span>© ${new Date().getFullYear()} ${esc(site.legalName)} · ${esc(t.footer.rights)}</span>
      <span>${langLinks}</span>
    </div>
    <p style="font-size:.74rem;color:#6b7076;margin:10px 0 0">${esc(t.footer.note)}</p>
  </div>
</footer>`;
}

export function breadcrumbs(items, t) {
  const li = items
    .map((it, i) => {
      const last = i === items.length - 1;
      const inner = last
        ? `<span aria-current="page">${esc(it.label)}</span>`
        : `<a href="${it.href}">${esc(it.label)}</a>`;
      return `<li>${inner}</li>`;
    })
    .join('');
  return `<nav class="wrap" aria-label="${esc(t.common.breadcrumb)}"><div class="crumbs"><ol>${li}</ol></div></nav>`;
}

export function breadcrumbLd(items, site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.label,
      item: abs(site, it.href)
    }))
  };
}

export function secHead(title, sub, id) {
  return `<div class="sec__head"><h2${id ? ` id="${id}"` : ''}>${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ''}</div>`;
}

export function table({ head: h, rows, cls = '', caption }) {
  const thead = h && h.length
    ? `<thead><tr>${h.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>`
    : '';
  const body = rows
    .map((r) => `<tr>${r.map((c, i) => (i === 0 && !h ? `<th scope="row">${esc(c)}</th>` : `<td>${c}</td>`)).join('')}</tr>`)
    .join('');
  return `<div class="tw"><table class="${cls}">${caption ? `<caption class="sr">${esc(caption)}</caption>` : ''}${thead}<tbody>${body}</tbody></table></div>`;
}

export function pic(src, alt, w, h, { eager = false, cls = '' } = {}) {
  const webp = src.replace(/\.jpg$/, '.webp');
  const loading = eager ? 'eager' : 'lazy';
  const prio = eager ? ' fetchpriority="high"' : '';
  return `<picture>
      <source srcset="${webp}" type="image/webp">
      <img src="${src}" alt="${esc(alt)}" width="${w}" height="${h}" loading="${loading}" decoding="async"${prio}${cls ? ` class="${cls}"` : ''}>
    </picture>`;
}

export function inquiryForm({ site, loc, t, alloy = '', thickness = '', id = 'inquiry' }) {
  const alloyOptions = ALLOY_IDS
    .map((a) => `<option value="${a}"${a === alloy ? ' selected' : ''}>${a}</option>`)
    .join('');
  const action = site.form.endpoint === 'mailto:' ? `mailto:${site.email}` : site.form.endpoint;
  const enc = site.form.endpoint === 'mailto:' ? ' enctype="text/plain"' : '';

  return `<form class="form" id="${id}" action="${esc(action)}" method="post"${enc} data-inquiry>
      <input type="hidden" name="_subject" value="Website inquiry — ${esc(alloy || 'general')}">
      <input type="hidden" name="gclid" value="" data-gclid>
      <input type="hidden" name="utm_source" value="" data-utm="utm_source">
      <input type="hidden" name="utm_medium" value="" data-utm="utm_medium">
      <input type="hidden" name="utm_campaign" value="" data-utm="utm_campaign">
      <input type="hidden" name="utm_term" value="" data-utm="utm_term">
      <input type="hidden" name="utm_content" value="" data-utm="utm_content">
      <input type="hidden" name="page" value="${esc(url(loc, ''))}">
      <div class="form__row">
        <div class="field"><label for="${id}-name">${esc(t.form.name)} <span class="req">*</span></label><input id="${id}-name" name="name" required autocomplete="name"></div>
        <div class="field"><label for="${id}-email">${esc(t.form.email)} <span class="req">*</span></label><input id="${id}-email" name="email" type="email" dir="ltr" required autocomplete="email"></div>
      </div>
      <div class="form__row">
        <div class="field"><label for="${id}-company">${esc(t.form.company)}</label><input id="${id}-company" name="company" autocomplete="organization"></div>
        <div class="field"><label for="${id}-qty">${esc(t.form.quantity)}</label><input id="${id}-qty" name="quantity" dir="ltr" placeholder="5 t"></div>
      </div>
      <div class="form__row">
        <div class="field"><label for="${id}-alloy">${esc(t.form.alloy)}</label><select id="${id}-alloy" name="alloy">${alloyOptions}</select></div>
        <div class="field"><label for="${id}-thk">${esc(t.form.thickness)}</label><input id="${id}-thk" name="thickness" dir="ltr" value="${esc(thickness)}"></div>
      </div>
      <div class="field"><label for="${id}-msg">${esc(t.form.message)}</label><textarea id="${id}-msg" name="message" placeholder="Temper, width, length, surface, destination port"></textarea></div>
      <button class="btn btn--p" type="submit" data-conv="form">${esc(t.form.submit)}</button>
      <p class="form__note">${esc(t.form.privacy)}</p>
    </form>`;
}

export function chartSVG({ type = 'line', title, labels = [], values = [], unit = '', source = '' }) {
  const W = 720, H = 300, L = 56, R = 16, T = 24, B = 46;
  const iw = W - L - R, ih = H - T - B;
  const max = Math.max(...values) * 1.12 || 1;
  const min = type === 'bar' ? 0 : Math.min(...values) * 0.88;
  const span = max - min || 1;
  const x = (i) => L + (labels.length === 1 ? iw / 2 : (i * iw) / (labels.length - 1));
  const y = (v) => T + ih - ((v - min) / span) * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => min + f * span);
  const grid = ticks
    .map((v) => `<line x1="${L}" y1="${y(v).toFixed(1)}" x2="${W - R}" y2="${y(v).toFixed(1)}" stroke="#e6e2db" stroke-width="1"/>
      <text x="${L - 8}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#7b8189">${Math.round(v).toLocaleString('en-US')}</text>`)
    .join('');
  const xlab = labels
    .map((l, i) => `<text x="${x(i).toFixed(1)}" y="${H - B + 18}" text-anchor="middle" font-size="11" fill="#7b8189">${esc(l)}</text>`)
    .join('');
  let shape = '';
  if (type === 'bar') {
    // 柱子按等宽区间居中排布，避免首尾柱子伸进 Y 轴刻度区
    const band = iw / Math.max(labels.length, 1);
    const bw = Math.min(54, band * 0.56);
    const bx = (i) => L + band * (i + 0.5);
    shape = values
      .map((v, i) => `<rect x="${(bx(i) - bw / 2).toFixed(1)}" y="${y(v).toFixed(1)}" width="${bw.toFixed(1)}" height="${(T + ih - y(v)).toFixed(1)}" fill="#b8894a"/>`)
      .join('');
  } else {
    const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    shape = `<polyline fill="none" stroke="#c8102e" stroke-width="2.5" points="${pts}"/>
      <polygon fill="rgba(200,16,46,.10)" points="${pts} ${x(values.length - 1).toFixed(1)},${T + ih} ${x(0).toFixed(1)},${T + ih}"/>` +
      values.map((v, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3.2" fill="#c8102e"/>`).join('');
  }
  return `<figure class="chart">
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">
        <text x="${L}" y="14" font-size="12" font-weight="700" fill="#1a1d21">${esc(title)}</text>
        ${grid}${shape}${xlab}
      </svg>
      <figcaption>${esc(title)}${unit ? ` · ${esc(unit)}` : ''}${source ? ` · ${esc(source)}` : ''}</figcaption>
    </figure>`;
}

export function page({ site, loc, t, locales, title, desc, path, body, active, heroPreload, jsonld = [], crumbs, navOverrides, altCodes, langFallback = false }) {
  const nav = navOverrides || CURRENT_NAV;

  // RTL 页面：把纯拉丁/数字的表格单元与定义值隔离成 LTR，避免「0.2 – 150 mm」被整体反转成「mm 150 – 0.2」
  if (loc.dir === 'rtl') {
    const ltrCell = (inner) => (/[\u0600-\u06FF]/.test(inner) ? inner : `<bdi dir="ltr">${inner}</bdi>`);
    body = body
      .replace(/<td>([^<]*)<\/td>/g, (m, inner) => (inner.trim() ? `<td>${ltrCell(inner)}</td>` : m))
      .replace(/<dd>([^<]*)<\/dd>/g, (m, inner) => (inner.trim() ? `<dd>${ltrCell(inner)}</dd>` : m));
  }

  const canonical = abs(site, url(loc, path));
  const altLocales = altCodes ? locales.filter((l) => altCodes.includes(l.code)) : locales;
  const alternates = altLocales.map((l) => ({ hreflang: l.code, href: abs(site, url(l, path)) }));
  alternates.push({ hreflang: 'x-default', href: abs(site, url(altLocales[0], path)) });

  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.legalName,
    alternateName: `${site.brand} ${site.brandSuffix}`,
    url: site.siteUrl,
    email: site.email,
    telephone: site.phone,
    foundingDate: site.founded,
    address: { '@type': 'PostalAddress', streetAddress: site.addressLine, addressCountry: 'CN' }
  };

  const trackingInline = `<script>window.ZL=${JSON.stringify({
    ga4: site.tracking.ga4,
    ads: site.tracking.ads,
    labels: {
      form: site.tracking.adsFormLabel,
      whatsapp: site.tracking.adsWhatsappLabel,
      email: site.tracking.adsEmailLabel,
      phone: site.tracking.adsPhoneLabel
    },
    successText: t.form.success
  })}</script>`;

  const waLabel = (t.a11y && t.a11y.whatsapp) || 'WhatsApp';
  const wa = `<a class="wa" href="${esc(url(loc, 'contact/'))}" aria-label="${esc(waLabel)}" title="${esc(waLabel)}" data-conv="whatsapp">
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
</a>`;

  return `${head({ site, loc, title, desc, canonical, alternates, jsonld: [org, ...jsonld], heroPreload, trackingInline })}
${header({ site, loc, t, locales, active, path, navOverrides: nav, langFallback })}
<main id="main">
${crumbs ? breadcrumbs(crumbs, t) : ''}
${body}
</main>
${footer({ site, loc, t, locales, navOverrides: nav })}
${wa}
<script src="/assets/js/main.js?v=${V_JS}" defer></script>
</body>
</html>`;
}



