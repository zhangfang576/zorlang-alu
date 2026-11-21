# Zorlang Aluminum — 纯静态多语言站（Google 自然流量 + Ads 落地页）

生成器：`node build.mjs` → 输出 `dist/`（207 个文件，123 个 HTML 页面）。
无前端框架、无 hydration、无客户端语言切换；所有内容在 HTML 源码里，关掉 JS 仍完整可读。

## 1. 信息架构与 URL

英文是主站，位于根路径；其余 6 种语言带前缀，每个语言独立静态 URL。

```
/                          en 首页
/products/                 en 产品总览（6 种形态 + 23 个牌号对照表，按系列分组）
/products/5052/            单一牌号页（23 个：1050 1100 2011 2017 3003 3004 3104 4032 4045
                           4343 5005 5052 5083 5182 5754 5A06 6005A 6061 6063 6082 6101
                           7005 8011）
/applications/             行业应用
/capabilities/             产能与设备
/quality/                  检测与认证
/news/                     新闻（4 个分类：market / guide / standard / industry）
/news/market/              分类页
/news/{slug}/              单篇文章
/about/  /contact/         关于 / 联系

/zh-CN/… /es/… /fr/… /de/… /ar/… /vi/…   同上结构
```

层级最多 3 层（`/products/5052/`、`/news/market/`）。

## 2. 上线前必须改一处

`site.config.json` → `"siteUrl": "https://www.zorlang.com"` 改成你的真实域名，然后重新 `node build.mjs`。
canonical、hreflang、sitemap、RSS 全部由这个值生成，域名不对 Google 会视为错误信号。

同一文件里还有：邮箱、电话、WhatsApp、地址、GA4/Ads ID。

## 3. 发布新闻（每周操作：只上传一个 .md）

1. 在 `content/news/en/` 新建 `my-article.md`（中文版放 `content/news/zh-CN/`，文件名相同）
2. 头部 front matter：

```yaml
---
title: "文章标题"
description: "120–160 字符摘要，会写进 meta description"
metaTitle: "可选的 SEO 标题"
category: "market"        # market | guide | standard | industry
date: "2026-11-20"
updated: "2026-11-20"
author: "Zorlang Technical Desk"
products: ["5052", "6061"]   # 自动生成指向产品页的内链
sources: ["来源名称 — 域名", "来源 2"]
---
```

3. 正文用简单 Markdown：`##` 小标题、`-` 列表、`1.` 有序列表、`**粗体**`、`[文字](/products/5052/)` 内链、`| 表格 |`、`---` 分隔线。
   图表用一行指令，构建时渲染成内联 SVG（无 JS）：

```
::chart {"type":"bar","title":"标题","labels":["A","B"],"values":[12,30],"unit":"单位","source":"来源"}
```

4. **提交 .md 即可**（GitHub 网页 Add file → Upload files → Commit）。
   Actions 会自动构建、校验并发布，约 1–2 分钟上线。不需要本地跑命令、不需要上传 `dist/`。

新增文章不需要改任何模板；分类、内链、结构化数据、sitemap、RSS 都是自动的。

本地仍可预览：双击 `重建站点.bat` 重建，或 `npm run check`（构建 + 校验）。

## 4. 部署（GitHub Actions → Cloudflare Pages）

`.github/workflows/deploy.yml` 已就位，流程是：

```
push 到 main/master
  → npm ci
  → npm run build      # 源文件 → dist
  → npm run verify     # scripts/verify-dist.mjs 守门，不通过就中止
  → wrangler pages deploy dist
```

### 4.1 一次性配置（约 10 分钟）

**① Cloudflare 侧**

| 要拿的东西 | 位置 |
| --- | --- |
| API Token | My Profile → API Tokens → Create Token → 模板选 **Edit Cloudflare Workers**，或自定义权限 `Account → Cloudflare Pages → Edit` |
| Account ID | Cloudflare 控制台域名列表右侧的 Account ID |
| 项目名 | Pages 项目名（不是域名），没有就先建一个空项目 |

Pages 项目的 **Settings → Builds & deployments → Production branch** 要与下面变量一致（默认 `main`）。

**② GitHub 仓库侧**

Settings → Secrets and variables → Actions：

| 类型 | 名称 | 值 |
| --- | --- | --- |
| Secret | `CLOUDFLARE_API_TOKEN` | 上一步的 Token |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | Account ID |
| Variable | `CLOUDFLARE_PROJECT_NAME` | Pages 项目名 |
| Variable | `CLOUDFLARE_PRODUCTION_BRANCH` | 可选，默认 `main` |

**③ 首次运行**

Actions 页 → 「构建并发布」→ Run workflow。绿灯即上线；红灯看是哪一步，缺参数会直接提示缺哪个。

> 两条路只能选一条：如果 Pages 项目当前是用 **Git 集成**（Build command = `npm run build`）自动构建的，
> 就不要再接 Actions，否则一次提交会触发两次部署。反之用了 Actions，就把 Pages 的
> Settings → Builds & deployments → 断开 Git 连接（或把构建命令留空），只让 Actions 推送 `dist`。

### 4.2 仓库里该提交什么

```bash
git init
git add .
git commit -m "site source"
```

`.gitignore` 已排除 `dist/`、`node_modules/`、`screenshots/`、临时脚本与密钥。
源码约 37 MB（主要是 `public/assets/images` 的 102 张原图），`dist/` 由 CI 每次重新生成。

> 注意：`public/assets/images/` 是**源图**，必须入库；`dist/` 里的 `-t.jpg` 缩略图与 `.webp` 是构建产物，不入库。

### 4.3 改用 GitHub Pages（可选）

如果不想用 Cloudflare，把 deploy 步骤换成：

```yaml
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  # 另起一个 job
  # permissions: { pages: write, id-token: write }
  # environment: github-pages
  # steps: [{ uses: actions/deploy-pages@v4 }]
```

同时把仓库 Settings → Pages → Source 设为 **GitHub Actions**。

### 4.4 校验脚本在管什么

`npm run verify` 会在发布前检查，任一不过就中止部署：

- 必备文件：`index.html`、`404.html`、`_headers`、`_redirects`、`robots.txt`、`sitemap.xml`、两份 RSS
- 7 个语种首页全部存在，页面数不少于「语种 × 9 栏目 + 23 牌号 × 语种」
- 23 份规格书 PDF 一份不少
- 每个页面都有 canonical（404 页除外，要求 noindex）与有效 `<title>`
- **全站站内链接与静态资源逐个验证存在**（`_redirects` 里的旧路径放行）
- 图片资源数量下限

## 5. 追踪配置

`site.config.json` → `tracking`：

```json
"ga4": "G-XXXXXXXXXX",
"ads": "AW-XXXXXXXXXX",
"adsFormLabel": "…", "adsWhatsappLabel": "…", "adsEmailLabel": "…", "adsPhoneLabel": "…"
```

已埋事件：表单提交（`generate_lead`）、WhatsApp 点击、邮件点击、电话点击，均带 Ads 转化标签。
表单内已含 `gclid` 隐藏字段 + `utm_*` 五个字段，由 `assets/js/main.js` 从 URL 与 `_gcl_aw` cookie 透传。

**表单投递**：默认 `"endpoint": "mailto:"`，提交会打开邮件客户端。
正式使用请换成 Formspree / 自建 Worker / CRM 的 POST 地址，改一个字段即可，无需动模板。

## 6. 语言与 hreflang 策略

- 7 种语言：en（根）、zh-CN、es、fr、de、ar、vi。`ar` 为 `dir="rtl"` 的右到左镜像版式（符合中东习惯）：导航、卡片、图库箭头、表单字段顺序全部镜像；数字与单位用 `bdi dir="ltr"` 隔离，避免「0.2 – 150 mm」被反转。WhatsApp 悬浮按钮固定右侧中间，不参与镜像。
- 每个页面输出 7 条 `hreflang` + `x-default`（指向英文）。
- 新闻只有 en 与 zh-CN 两个语言版本；其余语言的导航"新闻"指向英文 `/news/`，且这些页面**不会**输出指向不存在译文页的 hreflang。

## 7. 验收结果

| 项目 | 结果 |
| --- | --- |
| Lighthouse 移动端（首页，模拟 4G 节流） | Performance **100**，Accessibility 96，Best Practices 96，SEO 100 |
| LCP / CLS / TBT | **1.1 s** / **0** / **0 ms**（目标 ≤2.5s / ≤0.1 / ≤200ms） |
| 关闭 JS 抽查 3 页 | 首页 3393 字符、5052 页 3477 字符 + 4 个表格、文章 5842 字符，无骨架屏 |
| 横向溢出 | 1440 与 390 视口均为 `scrollWidth === innerWidth` |
| 结构化数据 | Organization、Product、Article、BreadcrumbList 全部输出 |
| sitemap | 索引 + 16 个分段文件（pages/products/news × 语言），含 hreflang 交替链接 |
| RSS | `/news/rss.xml`、`/zh-CN/news/rss.xml` |
| PDF 规格书 | 8 份（`/downloads/1050-spec.pdf` …），A4 单页，内容取自页面数据 |

截图在 `screenshots/`：桌面 1440×900、移动 390×844（首页整页 + 产品页 + 文章页）。

## 8. 已知限制

1. **域名未定**：`siteUrl` 仍是占位，canonical/sitemap 需改真实域名后重建，才能提交 Search Console。
2. **PDF 只有英文版**：8 份规格书共用英文内容；其它语言页面下载的是英文 PDF。
3. **新闻仅中英**：其余 5 种语言没有译文文章（导航指向英文），避免空页面与错误 hreflang。
4. **表单默认 mailto**：需替换成真实接收端，否则只能靠访客本地邮件客户端发送。
5. **GA4/Ads ID 为占位**：`G-XXXXXXXXXX` 这类值不填写则不会加载任何统计脚本，页面不受影响。

## 1b. 牌号数据来源（重要）

`content/alloys.json` 的化学成分、力学性能、典型状态、原材料形态、主要用途全部取自
《铝合金牌号成分与力学性能对照表.xlsx — 牌号总表》的 23 个牌号，数值未做改写：

- 化学成分：`chem` 数组，元素与区间逐条对应表格「主要元素含量」列。
- 力学性能：`mech` 数组，Rm / Rp0.2 / A / HBW 取表格典型值。
- 典型状态：`temper` / `tempers`，来自表格「典型状态」列（如 H116/H321 拆为两项）。
- 原材料形态：`forms`，映射为 plate / coil / foil / bar / tube / profile 六类。
  表格把「铝带」归入「铝卷纵剪分条」，所以站点不再单列铝带，而是在铝卷文案里说明分条能力。
- 主要用途：`usesCn`（中文原词，中文页直接用）；各语言页面的 `uses` 在各语种
  `*.alloys.json` 里，与表格一一对应。
- 对比牌号：`compare` 优先取表格「选材速查」里的备选/替代牌号。

**7075 已按表格口径下线**（1C202 两用物项：Rm≥460 MPa 且管材/棒材形态需许可）。
`dist/_redirects` 里已写好 301：`/products/7075/` → `/products/`，Cloudflare Pages 自动生效。
若以后要恢复 7075 板材页，把该牌号加回 `content/alloys.json` 与各语种 `*.alloys.json` 即可。

## 1c. 全站 WhatsApp 悬浮按钮

`lib/render.mjs` 的 `page()` 统一注入 `a.wa`，所以每一页（含 404）右下角都有：
桌面 70px、移动 58px 圆形图标，指向当前语言的 `/contact/`（`/zh-CN/contact/` 等），
带 `data-conv="whatsapp"`，点击会计入 GA4 / Google Ads 的 whatsapp_click 转化。
样式在 `assets/css/main.css` 的 `.wa`；移动端头部改为 `position:static`，避免吸顶遮挡正文。


