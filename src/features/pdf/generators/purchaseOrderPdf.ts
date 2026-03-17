import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDF_COLORS } from '../templates/pdfColors';
import { buildPdfHeader } from '../templates/pdfHeader';
import { PurchaseOrderPdfData } from '../types/pdf.types';

const formatCurrency = (val: number) =>
  `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export async function generatePurchaseOrderPdf(data: PurchaseOrderPdfData): Promise<void> {
  const { state, po } = data;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  let yPos = await buildPdfHeader(doc, state.companyProfile, 'PURCHASE ORDER');

  doc.setFillColor(PDF_COLORS.accent[0], PDF_COLORS.accent[1], PDF_COLORS.accent[2]);
  doc.rect(15, yPos, pageWidth - 30, 10, 'F');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined as unknown as string, 'bold');
  doc.text(`PO #${po.id.substring(0, 8).toUpperCase()}`, 20, yPos + 7);
  doc.text(`DATE: ${new Date(po.date).toLocaleDateString()}`, pageWidth - 20, yPos + 7, { align: 'right' });
  yPos += 20;

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Vendor:', 20, yPos);
  doc.setFont(undefined as unknown as string, 'normal');
  doc.text(po.vendorName, 20, yPos + 7);
  yPos += 20;

  const tableRows = po.items.map((item) => [
    item.description,
    item.quantity,
    formatCurrency(item.unitCost),
    formatCurrency(item.total),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Item Description', 'Qty', 'Unit Cost', 'Total']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: PDF_COLORS.brand },
    columnStyles: { 3: { halign: 'right' } },
  });

  // @ts-ignore
  let finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont(undefined as unknown as string, 'bold');
  doc.text(`Total Order Value: ${formatCurrency(po.totalCost)}`, pageWidth - 15, finalY, { align: 'right' });

  if (po.notes) {
    finalY += 15;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Notes:', 15, finalY);
    doc.setFont(undefined as unknown as string, 'normal');
    doc.text(po.notes, 15, finalY + 5);
  }

  doc.save(`PO_${po.vendorName}_${po.id.substring(0, 6)}.pdf`);
}
