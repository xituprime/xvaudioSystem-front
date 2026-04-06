import { jsPDF } from 'jspdf';

const PAGE_W = 210;
const MARGIN = 20;
const RIGHT = PAGE_W - MARGIN;
const LINE = 6.5;
const FONT_TITLE = 20;
const FONT_SUB = 11;
const FONT_BODY = 10;
const FONT_SMALL = 8.5;

function sumItemsTotal(items) {
  return items.reduce((acc, it) => {
    const qty = Number(it?.quantity ?? it?.qty ?? 0);
    const price = Number(it?.price ?? it?.unitPrice ?? it?.publicPrice ?? 0);
    const sub = Number(it?.subtotal ?? it?.total ?? price * qty);
    return acc + sub;
  }, 0);
}

/**
 * Factura / recibo para el cliente (sin ganancia ni datos internos).
 * Total: usa el total de la venta o la suma de líneas si hace falta.
 */
export function downloadReceiptPdf(sale) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  let y = MARGIN;

  const receiptNumber = sale?.receiptNumber ?? sale?._id?.slice(-8) ?? 'N/A';
  const dateStr = sale?.createdAt
    ? new Date(sale.createdAt).toLocaleString('es-GT', { dateStyle: 'long', timeStyle: 'short' })
    : '—';
  const items = sale?.items ?? sale?.products ?? [];
  let total = Number(sale?.total ?? sale?.totalVentas ?? sale?.amount ?? sale?.totalAmount ?? 0);
  if (!Number.isFinite(total) || total <= 0) {
    total = sumItemsTotal(items);
  }

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, PAGE_W, 42, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(FONT_TITLE);
  doc.setFont('helvetica', 'bold');
  doc.text('XV AUDIO', PAGE_W / 2, 18, { align: 'center' });
  doc.setFontSize(FONT_SMALL);
  doc.setFont('helvetica', 'normal');
  doc.text('Factura de venta', PAGE_W / 2, 26, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  y = 52;

  doc.setFontSize(FONT_BODY);
  doc.setFont('helvetica', 'bold');
  doc.text('Recibo Nº', MARGIN, y);
  doc.setFont('helvetica', 'normal');
  doc.text(receiptNumber, 50, y);
  y += LINE;
  doc.setFont('helvetica', 'bold');
  doc.text('Fecha', MARGIN, y);
  doc.setFont('helvetica', 'normal');
  doc.text(dateStr, 50, y);
  y += LINE + 6;

  if (items.length > 0) {
    doc.setFillColor(241, 245, 249);
    doc.rect(MARGIN, y - 4, PAGE_W - 2 * MARGIN, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SMALL);
    doc.setTextColor(51, 65, 85);
    doc.text('CANT.', MARGIN + 2, y + 1);
    doc.text('DESCRIPCIÓN', MARGIN + 22, y + 1);
    doc.text('P. UNIT.', RIGHT - 58, y + 1);
    doc.text('SUBTOTAL', RIGHT - 2, y + 1, { align: 'right' });
    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT_BODY);

    items.forEach((it) => {
      const name = (it?.product?.name ?? it?.name ?? it?.productName ?? 'Producto').slice(0, 40);
      const qty = it?.quantity ?? it?.qty ?? 0;
      const price = Number(it?.price ?? it?.unitPrice ?? it?.publicPrice ?? 0);
      const subtotal = Number(it?.subtotal ?? it?.total ?? price * qty);
      doc.text(String(qty), MARGIN + 2, y);
      doc.text(name, MARGIN + 22, y);
      doc.text(`Q${price.toFixed(2)}`, RIGHT - 58, y);
      doc.text(`Q${subtotal.toFixed(2)}`, RIGHT - 2, y, { align: 'right' });
      y += LINE;
    });
    y += 4;
  }

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.35);
  doc.line(MARGIN, y, RIGHT, y);
  y += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL A PAGAR', MARGIN, y);
  doc.setFontSize(14);
  doc.setTextColor(14, 165, 233);
  const totalLabel = `Q ${total.toFixed(2)}`;
  doc.text(totalLabel, RIGHT, y, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  y += 14;

  doc.setDrawColor(14, 165, 233);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, RIGHT, y);
  y += 8;

  doc.setFontSize(FONT_SMALL);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Gracias por su compra.', PAGE_W / 2, y, { align: 'center' });
  y += 5;
  doc.text('XV Audio · Guatemala', PAGE_W / 2, y, { align: 'center' });

  doc.save(`factura-${receiptNumber}.pdf`);
}
