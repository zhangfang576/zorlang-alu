// Minimal, dependency-free PDF writer (A4, Helvetica) for one-page spec sheets.
const A4 = [595.28, 841.89];

const latin = (s) =>
  String(s).replace(/[\u2013\u2014]/g, '-').replace(/[\u00b0]/g, ' deg').replace(/[\u00b5]/g, 'u')
    .replace(/[^\x20-\x7E]/g, '');

const pdfStr = (s) => latin(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

export function specPdf({ title, subtitle, blocks }) {
  const pages = [];
  let ops = [];
  let y = A4[1] - 64;
  const left = 56;

  const newPage = () => { pages.push(ops.join('\n')); ops = []; y = A4[1] - 64; };
  const text = (s, size = 10.5, bold = false, color = '0 0 0') => {
    if (y < 64) newPage();
    ops.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${color} rg 1 0 0 1 ${left} ${y.toFixed(2)} Tm (${pdfStr(s)}) Tj ET`);
    y -= size + 5;
  };
  const rule = () => {
    actions();
    function actions() {
      ops.push(`0.82 0.80 0.77 RG 0.6 w ${left} ${y.toFixed(2)} m ${A4[0] - left} ${y.toFixed(2)} l S`);
      y -= 12;
    }
  };

  text(title, 19, true);
  text(subtitle, 9.5, false, '0.35 0.37 0.40');
  rule();

  for (const b of blocks) {
    if (y < 120) newPage();
    text(b.heading, 11.5, true, '0.72 0.42 0.12');
    for (const row of b.rows) {
      if (y < 64) newPage();
      const label = String(row[0]);
      const value = String(row[1]);
      ops.push(`BT /F1 9.5 Tf 0.38 0.40 0.43 rg 1 0 0 1 ${left} ${y.toFixed(2)} Tm (${pdfStr(label)}) Tj ET`);
      ops.push(`BT /F2 9.5 Tf 0 0 0 rg 1 0 0 1 ${left + 210} ${y.toFixed(2)} Tm (${pdfStr(value)}) Tj ET`);
      y -= 16;
    }
    y -= 8;
  }

  text('Typical values. The mill test certificate issued for your heat is the governing document.', 8, false, '0.45 0.47 0.50');
  pages.push(ops.join('\n'));

  // ---- assemble objects ----
  const objs = [];
  const pageCount = pages.length;
  const kids = Array.from({ length: pageCount }, (_, i) => `${4 + i * 2} 0 R`).join(' ');

  objs[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objs[2] = `<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>`;
  objs[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';

  pages.forEach((content, i) => {
    const pageObj = 4 + i * 2;
    const contObj = pageObj + 1;
    objs[pageObj] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4[0]} ${A4[1]}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 ${3 + pageCount * 2 + 1} 0 R >> >> /Contents ${contObj} 0 R >>`;
    objs[contObj] = `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`;
  });

  const boldId = 3 + pageCount * 2 + 1;
  objs[boldId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  for (let i = 1; i < objs.length; i++) {
    if (!objs[i]) continue;
    offsets[i] = Buffer.byteLength(pdf, 'latin1');
    pdf += `${i} 0 obj\n${objs[i]}\nendobj\n`;
  }
  const xrefStart = Buffer.byteLength(pdf, 'latin1');
  const maxId = objs.length;
  pdf += `xref\n0 ${maxId}\n0000000000 65535 f \n`;
  for (let i = 1; i < maxId; i++) {
    pdf += offsets[i]
      ? `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
      : '0000000000 65535 f \n';
  }
  pdf += `trailer\n<< /Size ${maxId} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(pdf, 'latin1');
}
