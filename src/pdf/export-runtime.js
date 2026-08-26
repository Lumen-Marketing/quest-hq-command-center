import { jsPDF } from 'jspdf';

export function createPdfDocument(options) {
  return new jsPDF(options);
}

export function saveProposalPdf({
  draft,
  proposal,
  defaults,
  formatMoney,
  formatDate,
  slugify,
}) {
  const pdf = createPdfDocument({ unit: 'pt', format: 'letter' });
  const pageWidth = 612;
  const margin = 42;
  let y = 54;
  pdf.setFillColor(26, 43, 74);
  pdf.rect(0, 0, pageWidth, 102, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  pdf.text('Quest Roofing', margin, y);
  pdf.setFontSize(10);
  pdf.text(`Proposal - ${draft.proposalNo || proposal.proposal_no || proposal.id}`, margin, y + 20);
  pdf.setFontSize(26);
  pdf.text(formatMoney(draft.total || 0), pageWidth - margin, y, { align: 'right' });
  y = 138;
  pdf.setTextColor(232, 97, 26);
  pdf.setFontSize(11);
  pdf.text(String(draft.tagline || 'On a quest to serve you better').toUpperCase(), margin, y);
  pdf.setTextColor(20, 28, 45);
  pdf.setFontSize(18);
  pdf.text(draft.jobTitle || proposal.title || 'Proposal', margin, y + 22);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  const prepared = `Prepared for ${draft.client?.name || 'Client'}${draft.client?.address ? ` at ${draft.client.address}` : ''}`;
  pdf.text(pdf.splitTextToSize(prepared, pageWidth - margin * 2), margin, y + 42);
  y += 84;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Scope of work', margin, y);
  y += 22;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  (draft.items || []).forEach((item) => {
    const line = `${item.star ? '* ' : ''}${item.service}${item.description ? ` - ${item.description}` : ''}`;
    const lines = pdf.splitTextToSize(line, pageWidth - margin * 2 - 18);
    if (y + lines.length * 13 > 742) {
      pdf.addPage();
      y = 54;
    }
    pdf.text('- ', margin, y);
    pdf.text(lines, margin + 16, y);
    y += lines.length * 13 + 4;
  });
  y += 12;
  if (y > 660) {
    pdf.addPage();
    y = 54;
  }
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text('Warranty and terms', margin, y);
  y += 18;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const terms = [
    draft.warranty || defaults.warranty,
    draft.manufacturerWarranty || defaults.manufacturerWarranty,
    draft.terms || defaults.terms,
    draft.deposit ? `Deposit due at approval: ${draft.deposit}% (${formatMoney((draft.total || 0) * draft.deposit / 100)}).` : '',
    `Valid through ${formatDate(draft.valid)}.`,
  ].filter(Boolean).join('\n');
  pdf.text(pdf.splitTextToSize(terms, pageWidth - margin * 2), margin, y);
  pdf.save(`Quest-Proposal-${slugify(proposal.proposal_no || proposal.id)}.pdf`);
}

export async function saveClientPortalMarkedPdf({
  documentRecord,
  resolveBase,
  annotationsFor,
  measureLabel,
  statusMeta,
  createCanvas,
  loadImage,
  fileName,
}) {
  const pages = documentRecord.page_count || 1;
  let pdf = null;
  for (let page = 0; page < pages; page += 1) {
    const base = await resolveBase(page);
    const canvas = createCanvas();
    canvas.width = base.w;
    canvas.height = base.h;
    const ctx = canvas.getContext('2d');
    const image = await loadImage(base.dataUrl);
    ctx.drawImage(image, 0, 0, base.w, base.h);
    paintAnnotationsToCanvas(ctx, annotationsFor(page), base, measureLabel, statusMeta);
    const orientation = base.w > base.h ? 'l' : 'p';
    if (!pdf) pdf = createPdfDocument({ orientation, unit: 'px', format: [base.w, base.h], compress: true });
    else pdf.addPage([base.w, base.h], orientation);
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, base.w, base.h);
  }
  pdf?.save(fileName);
}

function paintAnnotationsToCanvas(ctx, annotations, base, measureLabel, statusMeta) {
  annotations.forEach((annotation) => {
    const p = annotation.payload || {};
    const type = annotation.annotation_type;
    const color = p.color || '#e66a1f';
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Number(p.sw) || 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const W = base.w;
    const H = base.h;
    if (type === 'freehand' && Array.isArray(p.points)) {
      ctx.beginPath();
      p.points.forEach((point, index) => {
        const x = point.x * W;
        const y = point.y * H;
        if (index) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      });
      ctx.stroke();
    } else if (type === 'line' || type === 'arrow' || type === 'measure') {
      const x1 = p.x1 * W;
      const y1 = p.y1 * H;
      const x2 = p.x2 * W;
      const y2 = p.y2 * H;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      if (type === 'arrow') {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const head = 16;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      }
      if (type === 'measure') {
        ctx.font = `700 ${Math.round(W / 90)}px sans-serif`;
        ctx.fillText(measureLabel(p, base), (x1 + x2) / 2, (y1 + y2) / 2 - 6);
      }
    } else if (type === 'rect' || type === 'highlight') {
      const x = p.x * W;
      const y = p.y * H;
      const width = p.w * W;
      const height = p.h * H;
      if (type === 'highlight') {
        ctx.globalAlpha = 0.28;
        ctx.fillRect(x, y, width, height);
        ctx.globalAlpha = 1;
      } else {
        ctx.strokeRect(x, y, width, height);
      }
    } else if (type === 'circle') {
      const x = p.x * W;
      const y = p.y * H;
      const width = p.w * W;
      const height = p.h * H;
      ctx.beginPath();
      ctx.ellipse(x + width / 2, y + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (type === 'label' || type === 'comment' || type === 'marker') {
      const x = p.x * W;
      const y = p.y * H;
      const text = type === 'marker'
        ? (statusMeta[p.markerStatus]?.label || p.text || 'Mark')
        : (p.text || 'Comment');
      ctx.font = '700 16px sans-serif';
      const textWidth = ctx.measureText(text).width + 16;
      ctx.fillStyle = type === 'comment' ? '#fff' : color;
      ctx.strokeStyle = color;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y - 24, textWidth, 28, 6);
      else ctx.rect(x, y - 24, textWidth, 28);
      ctx.fill();
      if (type !== 'marker') ctx.stroke();
      ctx.fillStyle = type === 'comment' ? color : '#fff';
      ctx.fillText(text, x + 8, y - 5);
    }
    ctx.restore();
  });
}
