/**
 * 构建校验：部署前检查 dist/ 是否完整可用。
 * 任何一项不通过都以非 0 退出，GitHub Actions 会拦住这次发布。
 * 用法：node scripts/verify-dist.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DIST = path.join(ROOT, 'dist');
const errors = [];
const notes = [];

const rel = (p) => path.relative(DIST, p).split(path.sep).join('/');

if (!fs.existsSync(DIST)) {
  console.error('✗ dist/ 不存在，请先运行 npm run build');
  process.exit(1);
}

const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const alloys = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/alloys.json'), 'utf8'));

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const allFiles = walk(DIST);
const htmls = allFiles.filter((f) => f.endsWith('.html'));

// ---------- 1. 必备文件 ----------
for (const f of ['index.html', '404.html', '_headers', '_redirects', 'robots.txt', 'sitemap.xml']) {
  if (!fs.existsSync(path.join(DIST, f))) errors.push(`缺少必备文件 dist/${f}`);
}
for (const l of site.locales) {
  const p = path.join(DIST, l.path.replace(/^\//, ''), 'index.html');
  if (!fs.existsSync(p)) errors.push(`语言首页缺失：${l.code} → ${l.path}`);
}
const rss = [
  ['dist/news/rss.xml', path.join(DIST, 'news/rss.xml')],
  ['dist/zh-CN/news/rss.xml', path.join(DIST, 'zh-CN/news/rss.xml')]
];
for (const [label, p] of rss) {
  if (!fs.existsSync(p)) errors.push(`缺少 RSS：${label}`);
  else if (!fs.readFileSync(p, 'utf8').includes('<item>')) errors.push(`RSS 为空：${label}`);
}

// ---------- 2. 页面与下载数量 ----------
const LOCALES = site.locales.length;
const ALLOY = alloys.alloys.length;
const expectMin = LOCALES * 9 + ALLOY * LOCALES; // 每语种 9 个栏目页 + 每牌号详情页
if (htmls.length < expectMin) {
  errors.push(`页面数偏少：实测 ${htmls.length}，按配置至少应有 ${expectMin}（${LOCALES} 语种 × 9 栏目 + ${ALLOY} 牌号 × ${LOCALES}）`);
}
const pdfs = allFiles.filter((f) => f.endsWith('.pdf'));
if (pdfs.length !== ALLOY) errors.push(`规格书 PDF 数量不符：实测 ${pdfs.length}，应为 ${ALLOY}`);

// ---------- 3. SEO 基本项逐页检查 ----------
const needCanonical = [];
const noTitle = [];
for (const f of htmls) {
  const h = fs.readFileSync(f, 'utf8');
  // 404 页不放 canonical（必须 noindex），单独校验
  if (rel(f) === '404.html') {
    if (!/<meta name="robots" content="[^"]*noindex/.test(h)) errors.push('404.html 缺少 noindex');
    continue;
  }
  if (!/<link rel="canonical" href="https?:\/\/[^"]+"/.test(h)) needCanonical.push(rel(f));
  const t = h.match(/<title>([^<]*)<\/title>/);
  if (!t || t[1].trim().length < 5) noTitle.push(rel(f));
}
if (needCanonical.length) errors.push(`${needCanonical.length} 个页面缺少 canonical，例如：${needCanonical.slice(0, 5).join(', ')}`);
if (noTitle.length) errors.push(`${noTitle.length} 个页面 title 缺失或过短，例如：${noTitle.slice(0, 5).join(', ')}`);

// ---------- 4. 站内链接与静态资源 ----------
const redirectSources = new Set();
const rdPath = path.join(DIST, '_redirects');
if (fs.existsSync(rdPath)) {
  for (const line of fs.readFileSync(rdPath, 'utf8').split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith('#')) continue;
    redirectSources.add(s.split(/\s+/)[0]);
  }
}

const exists = (urlPath) => {
  const clean = decodeURIComponent(urlPath).replace(/\/{2,}/g, '/');
  const p = path.join(DIST, clean);
  if (clean.endsWith('/')) return fs.existsSync(path.join(p, 'index.html'));
  if (fs.existsSync(p) && fs.statSync(p).isFile()) return true;
  if (fs.existsSync(path.join(p, 'index.html'))) return true;
  if (fs.existsSync(p + '.html')) return true;
  return false;
};

const broken = new Map();
for (const f of htmls) {
  const pageUrl = '/' + rel(f).replace(/index\.html$/, '');
  const h = fs.readFileSync(f, 'utf8');
  for (const m of h.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const raw = m[1];
    if (!raw || raw.startsWith('#') || /^(https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(raw)) continue;
    let u;
    try {
      u = new URL(raw, 'https://verify.invalid' + pageUrl);
    } catch {
      continue;
    }
    const target = u.pathname;
    if (redirectSources.has(target)) continue;
    if (!exists(target)) {
      if (!broken.has(target)) broken.set(target, new Set());
      broken.get(target).add(pageUrl);
    }
  }
}
if (broken.size) {
  const list = [...broken.entries()].slice(0, 12).map(([t, from]) => `${t} ← ${[...from].slice(0, 2).join(' / ')}`);
  errors.push(`${broken.size} 个站内链接或资源指向不存在的文件：\n    ${list.join('\n    ')}`);
}

// ---------- 5. 图片资源 ----------
const imgs = allFiles.filter((f) => /\.(jpg|webp|png|svg)$/i.test(f));
if (imgs.length < 100) errors.push(`图片资源偏少：实测 ${imgs.length}`);

// ---------- 输出 ----------
notes.push(`页面 ${htmls.length} 个（${LOCALES} 语种）`);
notes.push(`规格书 PDF ${pdfs.length} 份`);
notes.push(`图片资源 ${imgs.length} 个`);
notes.push(`静态文件合计 ${allFiles.length} 个，${(allFiles.reduce((n, f) => n + fs.statSync(f).size, 0) / 1048576).toFixed(1)} MB`);

console.log('构建校验结果：');
for (const n of notes) console.log('  · ' + n);

if (errors.length) {
  console.error(`\n✗ 校验未通过（${errors.length} 项）：`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log('\n✓ 全部通过，可以部署');
