import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFront, renderMarkdown, wordCount } from './lib/md.mjs';
import { specPdf } from './lib/pdf.mjs';
import { home, products, alloyPage } from './lib/pages.mjs';
import { applications, capabilities, quality, newsIndex, article, about, contact } from './lib/pages2.mjs';
import { url, abs, setNavOverrides } from './lib/render.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));

const site = readJson('site.config.json');
const alloys = readJson('content/alloys.json');
const LOCALES = site.locales;
const NEWS_LOCALES = ['en', 'zh-CN'];

function deepMerge(base, extra) {
  const out = { ...base };
  for (const [k, v] of Object.entries(extra || {})) {
    out[k] = v && typeof v === 'object' && !Array.isArray(v) ? deepMerge(base[k] || {}, v) : v;
  }
  return out;
}

const i18n = {};
const extra = {};
const alloyCopy = {};
for (const l of LOCALES) {
  const base = readJson('content/i18n/en.json');
  const over = exists(`content/i18n/${l.code}.json`) ? readJson(`content/i18n/${l.code}.json`) : {};
  i18n[l.code] = deepMerge(base, over);

  const baseX = readJson('content/i18n/en.extra.json');
  const overX = exists(`content/i18n/${l.code}.extra.json`) ? readJson(`content/i18n/${l.code}.extra.json`) : {};
  extra[l.code] = deepMerge(baseX, overX);

  const baseA = readJson('content/i18n/en.alloys.json');
  const overA = exists(`content/i18n/${l.code}.alloys.json`) ? readJson(`content/i18n/${l.code}.alloys.json`) : {};
  alloyCopy[l.code] = baseA;
  for (const [k, v] of Object.entries(overA)) alloyCopy[l.code][k] = { ...baseA[k], ...v };
}

// ---------- news ----------
// 阅读时长：拉丁词按 200 词/分钟，中文按 400 字/分钟，最少 1 分钟
const CJK_RE = /[\u3400-\u4dbf\u4e00-\u9fff\u3040-\u30ff]/g;
const readingMinutes = (body) => {
  const plain = body.replace(/[#*>`\-\[\]()|]/g, ' ');
  const cjk = (plain.match(CJK_RE) || []).length;
  const latin = plain.replace(CJK_RE, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(latin / 200 + cjk / 400));
};

const news = {};
for (const l of LOCALES) {
  news[l.code] = [];
  if (!NEWS_LOCALES.includes(l.code)) continue;
  const dir = path.join(ROOT, 'content/news', l.code);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const { meta, body } = parseFront(raw);
    // 正文里的站内链接补上语言前缀，中文/其他语种文章不要跳到英文页
    const prefix = l.code === 'en' ? '' : '/' + l.code;
    const html = prefix
      ? renderMarkdown(body).replace(/href="\/(products|news|applications|capabilities|quality|about|contact)\//g, `href="${prefix}/$1/`)
      : renderMarkdown(body);
    news[l.code].push({
      slug: file.replace(/\.md$/, ''),
      meta,
      html,
      words: wordCount(body),
      readMin: readingMinutes(body)
    });
  }
  news[l.code].sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1));
}

// ---------- output helpers ----------
const written = [];
const availability = new Set();

function writePage(loc, pagePath, html) {
  const dir = path.join(DIST, loc.path.replace(/^\//, ''), pagePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
  availability.add(`${loc.code}:${pagePath}`);
  written.push({ code: loc.code, path: pagePath, bytes: Buffer.byteLength(html) });
}

function buildLocale(l) {
  const t = i18n[l.code];
  const x = extra[l.code];
  const hasNews = NEWS_LOCALES.includes(l.code);
  const navOverrides = hasNews ? {} : { news: '/news/' };
  const ctx = {
    site, loc: l, t, locales: LOCALES, alloys,
    alloyCopy: alloyCopy[l.code],
    news: news[l.code] || [],
    posts: news[l.code] || [],
    x, navOverrides
  };

  // home & core pages need navOverrides inside page(); pass through wrappers
  setNavOverrides(navOverrides);
  const wrap = (fn, ...args) => fn(ctx, ...args);

  writePage(l, '', wrap(home));
  writePage(l, 'products/', wrap(products));
  for (const a of alloys.alloys) writePage(l, `products/${a.id}/`, wrap(alloyPage, a));
  writePage(l, 'applications/', wrap(applications));
  writePage(l, 'capabilities/', wrap(capabilities));
  writePage(l, 'quality/', wrap(quality));
  writePage(l, 'about/', wrap(about));
  writePage(l, 'contact/', wrap(contact));

  if (hasNews) {
    const perPage = Math.max(1, Number(site.newsPerPage) || 10);
    const pagesOf = (n) => Math.max(1, Math.ceil(n / perPage));
    const all = news[l.code] || [];

    // 列表第 1 页固定在 /news/，第 2 页起为 /news/page/N/（分类页同理）
    for (let i = 1; i <= pagesOf(all.length); i++) {
      writePage(l, i === 1 ? 'news/' : `news/page/${i}/`, wrap(newsIndex, '', i));
    }
    for (const c of ['market', 'guide', 'standard', 'industry']) {
      const n = all.filter((p) => p.meta.category === c).length;
      for (let i = 1; i <= pagesOf(n); i++) {
        writePage(l, i === 1 ? `news/${c}/` : `news/${c}/page/${i}/`, wrap(newsIndex, c, i));
      }
    }
    for (const p of all) writePage(l, `news/${p.slug}/`, wrap(article, p));
  }
}

// ---------- assets ----------
async function buildAssets() {
  const sharpMod = await import('sharp').catch(() => null);
  const sharp = sharpMod?.default;

  fs.mkdirSync(path.join(DIST, 'assets/css'), { recursive: true });
  fs.mkdirSync(path.join(DIST, 'assets/js'), { recursive: true });
  fs.mkdirSync(path.join(DIST, 'assets/images'), { recursive: true });
  fs.mkdirSync(path.join(DIST, 'downloads'), { recursive: true });

  fs.copyFileSync(path.join(ROOT, 'assets/css/main.css'), path.join(DIST, 'assets/css/main.css'));
  fs.copyFileSync(path.join(ROOT, 'assets/js/main.js'), path.join(DIST, 'assets/js/main.js'));

  const imgDir = path.join(ROOT, 'public/assets/images');
  const files = fs.readdirSync(imgDir).filter((f) => f.endsWith('.jpg'));
  let thumbs = 0;
  for (const f of files) {
    fs.copyFileSync(path.join(imgDir, f), path.join(DIST, 'assets/images', f));
    if (!sharp) continue;
    // 图库缩略图：单独生成 320×213 小图，避免每个缩略图都去下载 1600px 大图
    if (/^(gal|app)-.+\.jpg$/.test(f) && !/-t\.jpg$/.test(f)) {
      await sharp(path.join(imgDir, f))
        .resize(320, 213, { fit: 'cover' })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(path.join(DIST, 'assets/images', f.replace(/\.jpg$/, '-t.jpg')));
      thumbs++;
    }
    if (!/-t\.jpg$/.test(f)) {
      await sharp(path.join(imgDir, f)).webp({ quality: 78 }).toFile(path.join(DIST, 'assets/images', f.replace(/\.jpg$/, '.webp')));
    }
  }
  return { images: files.length, webp: Boolean(sharp), thumbs };
}

// ---------- pdf ----------
function buildPdfs() {
  const en = alloyCopy.en;
  for (const a of alloys.alloys) {
    const copy = en[a.id] || {};
    const pdf = specPdf({
      title: `${a.id} Aluminium — Specification`,
      subtitle: `ZORLANG ALUMINUM · ${a.standards.join(' / ')} · ${a.tempers.join(', ')}`,
      blocks: [
        {
          heading: 'Dimensions and supply',
          rows: [
            ['Series', a.series],
            ['Typical temper', a.tempers.join(', ')],
            ['Thickness', a.thickness],
            ['Width', a.width],
            ['Length', a.length],
            ['Surface', a.surface.join(', ')],
            ['Density', a.density],
            ...(a.melting ? [['Melting range', a.melting]] : [])
          ]
        },
        { heading: 'Chemical composition (wt %)', rows: a.chem },
        { heading: 'Mechanical properties', rows: a.mech }
      ]
    });
    fs.writeFileSync(path.join(DIST, 'downloads', `${a.id}-spec.pdf`), pdf);
  }
}

// ---------- sitemaps / rss / robots ----------
const today = new Date().toISOString().slice(0, 10);
const SECTIONS = [
  { id: 'pages', paths: ['', 'products/', 'applications/', 'capabilities/', 'quality/', 'about/', 'contact/'] },
  { id: 'products', paths: alloys.alloys.map((a) => `products/${a.id}/`) },
  { id: 'news', paths: [] }
];

function sitemapXml(entries) {
  const alt = (p) =>
    LOCALES.filter((l) => availability.has(`${l.code}:${p}`))
      .map((l) => `<xhtml:link rel="alternate" hreflang="${l.code}" href="${abs(site, url(l, p))}"/>`)
      .join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries
  .map(
    (e) => `  <url><loc>${abs(site, url(e.loc, e.path))}</loc><lastmod>${e.lastmod || today}</lastmod>${alt(e.path)}</url>`
  )
  .join('\n')}
</urlset>`;
}

function buildSitemaps() {
  fs.mkdirSync(path.join(DIST, 'sitemaps'), { recursive: true });
  const files = [];

  for (const l of LOCALES) {
    for (const sec of SECTIONS) {
      let paths = sec.paths.slice();
      if (sec.id === 'news') {
        if (!NEWS_LOCALES.includes(l.code)) continue;
        // 直接取该语种已写出的新闻页（含分页页与分类分页页），避免分页规则在两处各写一遍
        paths = [...availability]
          .filter((k) => k.startsWith(`${l.code}:news/`))
          .map((k) => k.slice(l.code.length + 1));
      }
      const entries = paths
        .filter((p) => availability.has(`${l.code}:${p}`))
        .map((p) => ({ loc: l, path: p, lastmod: today }));
      if (!entries.length) continue;
      const name = `${sec.id}-${l.code}.xml`;
      fs.writeFileSync(path.join(DIST, 'sitemaps', name), sitemapXml(entries));
      files.push(name);
    }
  }

  const index = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${files.map((f) => `  <sitemap><loc>${site.siteUrl}/sitemaps/${f}</loc><lastmod>${today}</lastmod></sitemap>`).join('\n')}
</sitemapindex>`;
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), index, 'utf8');

  fs.writeFileSync(
    path.join(DIST, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${site.siteUrl}/sitemap.xml\n`,
    'utf8'
  );
  return files.length;
}

function buildRss() {
  const out = [];
  for (const code of NEWS_LOCALES) {
    const l = LOCALES.find((x) => x.code === code);
    if (!l) continue;
    const t = i18n[code];
    const items = (news[code] || [])
      .map(
        (p) => `    <item>
      <title>${escapeXml(p.meta.title)}</title>
      <link>${abs(site, url(l, `news/${p.slug}/`))}</link>
      <guid>${abs(site, url(l, `news/${p.slug}/`))}</guid>
      <pubDate>${new Date(p.meta.date).toUTCString()}</pubDate>
      <description>${escapeXml(p.meta.description || '')}</description>
    </item>`
      )
      .join('\n');
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
    <title>${escapeXml(site.brand)} ${escapeXml(site.brandSuffix)} — ${escapeXml(t.nav.news)}</title>
    <link>${abs(site, url(l, 'news/'))}</link>
    <description>${escapeXml(t.news.sub)}</description>
    <language>${code}</language>
${items}
</channel></rss>`;
    const dir = path.join(DIST, l.path.replace(/^\//, ''), 'news');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'rss.xml'), rss, 'utf8');
    out.push(`${l.path}news/rss.xml`);
  }
  return out;
}

const escapeXml = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- run ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

for (const l of LOCALES) buildLocale(l);

fs.writeFileSync(
  path.join(DIST, '404.html'),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Page not found — ${site.brand} ${site.brandSuffix}</title><meta name="robots" content="noindex">
<link rel="stylesheet" href="/assets/css/main.css"></head>
<body><main class="sec"><div class="wrap"><h1>Page not found</h1>
<p>This page does not exist. Try one of these:</p>
<ul><li><a href="/">Home</a></li><li><a href="/products/">Aluminium products</a></li><li><a href="/news/">News</a></li><li><a href="/contact/">Contact</a></li></ul>
</div></main>
<a class="wa" href="/contact/" aria-label="Contact us on WhatsApp" title="Contact us on WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
</body></html>`,
  'utf8'
);

const assets = await buildAssets();
buildPdfs();
const sitemapCount = buildSitemaps();
const rss = buildRss();

fs.writeFileSync(
  path.join(DIST, '_headers'),
  `/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`,
  'utf8'
);

// 7075 按牌号总表口径下线（1C202 两用物项），旧链接 301 到产品总览
fs.writeFileSync(
  path.join(DIST, '_redirects'),
  `/products/7075/    /products/    301
/products/7075     /products/    301
/*/products/7075/    /:splat/products/    301
/*/products/7075     /:splat/products/    301
`,
  'utf8'
);

const perLocale = {};
for (const w of written) perLocale[w.code] = (perLocale[w.code] || 0) + 1;
console.log(JSON.stringify({
  pages: written.length,
  perLocale,
  images: assets.images,
  webp: assets.webp,
  pdfs: alloys.alloys.length,
  sitemaps: sitemapCount,
  rss
}, null, 2));
