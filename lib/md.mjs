import { esc, chartSVG } from './render.mjs';

export function parseFront(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    // YAML 字符串的引号是语法标记，不进正文：去掉成对的单/双引号
    if (v.length > 1 && ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))) {
      v = v.slice(1, -1);
    }
    if (/^\[.*\]$/.test(v)) {
      try { v = JSON.parse(v); } catch { /* keep string */ }
    }
    meta[k] = v;
  }
  return { meta, body: m[2] };
}

const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

const isTableRow = (l) => l.startsWith('|') && l.endsWith('|');
const isTableSep = (l) => isTableRow(l) && /^[|\s:-]+$/.test(l) && l.includes('-');
const cellsOf = (l) => l.replace(/^\|/, '').replace(/\|$/, '').split('|').map((s) => s.trim());
const isOrdered = (l) => /^\d+\.\s+/.test(l);

export function renderMarkdown(body) {
  const lines = body.split(/\r?\n/);
  const out = [];
  let list = null;
  let listTag = 'ul';
  let para = [];
  let table = null;

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(' '))}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      out.push(`<${listTag}>${list.map((l) => `<li>${inline(l)}</li>`).join('')}</${listTag}>`);
      list = null;
    }
  };
  const flushTable = () => {
    if (!table) return;
    const head = table.head.map((c) => `<th scope="col">${inline(c)}</th>`).join('');
    const rows = table.rows
      .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
      .join('');
    out.push(`<div class="tw"><table>${head ? `<thead><tr>${head}</tr></thead>` : ''}<tbody>${rows}</tbody></table></div>`);
    table = null;
  };

  for (const raw of lines) {
    const line = raw.trim();

    // 表格：连续的 | ... | 行，第二行为分隔行
    if (isTableRow(line)) {
      flushPara(); flushList();
      if (!table) { table = { head: cellsOf(line), rows: [] }; continue; }
      if (isTableSep(line)) continue;
      table.rows.push(cellsOf(line));
      continue;
    }
    flushTable();

    if (!line) { flushPara(); flushList(); continue; }
    if (/^(-{3,}|\*{3,})$/.test(line)) { flushPara(); flushList(); out.push('<hr>'); continue; }

    if (line.startsWith('## ')) { flushPara(); flushList(); out.push(`<h2>${inline(line.slice(3))}</h2>`); continue; }
    if (line.startsWith('### ')) { flushPara(); flushList(); out.push(`<h3>${inline(line.slice(4))}</h3>`); continue; }

    if (line.startsWith('- ')) {
      flushPara();
      if (list && listTag !== 'ul') flushList();
      listTag = 'ul';
      (list = list || []).push(line.slice(2));
      continue;
    }
    if (isOrdered(line)) {
      flushPara();
      if (list && listTag !== 'ol') flushList();
      listTag = 'ol';
      (list = list || []).push(line.replace(/^\d+\.\s+/, ''));
      continue;
    }

    if (line.startsWith('> ')) { flushPara(); flushList(); out.push(`<blockquote><p>${inline(line.slice(2))}</p></blockquote>`); continue; }

    if (line.startsWith('::chart')) {
      flushPara(); flushList();
      const json = line.replace(/^::chart\s*/, '');
      try {
        out.push(chartSVG(JSON.parse(json)));
      } catch {
        out.push('<p class="note">chart data error</p>');
      }
      continue;
    }
    if (list) flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  flushTable();
  return out.join('\n');
}

export const wordCount = (body) => body.replace(/[#*>`\-\[\]()|]/g, ' ').split(/\s+/).filter(Boolean).length;
