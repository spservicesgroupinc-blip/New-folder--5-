import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDF_COLORS } from '../templates/pdfColors';
import { buildPdfHeader } from '../templates/pdfHeader';
import { buildPdfFooter } from '../templates/pdfFooter';
import { WorkOrderPdfData } from '../types/pdf.types';

export async function generateWorkOrderPdf(data: WorkOrderPdfData): Promise<void> {
  const { state, record } = data;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  let yPos = await buildPdfHeader(doc, state.companyProfile, 'WORK ORDER');

  doc.setFillColor(PDF_COLORS.accent[0], PDF_COLORS.accent[1], PDF_COLORS.accent[2]);
  doc.rect(15, yPos, pageWidth - 30, 10, 'F');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined as unknown as string, 'bold');
  doc.text(`JOB #${record.id.substring(0, 8).toUpperCase()}`, 20, yPos + 7);
  doc.text(`CREATED: ${new Date(record.date).toLocaleDateString()}`, pageWidth - 20, yPos + 7, { align: 'right' });

  yPos += 15;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(record.customer.name, 20, yPos);
  doc.setFontSize(11);
  doc.setFont(undefined as unknown as string, 'normal');
  doc.text(record.customer.address, 20, yPos + 5);
  doc.text(`${record.customer.city}, ${record.customer.state} ${record.customer.zip}`, 20, yPos + 10);
  if (record.customer.phone) doc.text(`Phone: ${record.customer.phone}`, 20, yPos + 18);

  if (record.scheduledDate) {
    doc.setFont(undefined as unknown as string, 'bold');
    doc.setTextColor(PDF_COLORS.accent[0], PDF_COLORS.accent[1], PDF_COLORS.accent[2]);
    doc.text(`SCHEDULED: ${new Date(record.scheduledDate).toLocaleDateString()}`, pageWidth - 20, yPos, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }
  yPos += 30;

  if (record.workOrderLines && record.workOrderLines.length > 0) {
    doc.setFontSize(12);
    doc.setFont(undefined as unknown as string, 'bold');
    doc.setTextColor(PDF_COLORS.brand[0], PDF_COLORS.brand[1], PDF_COLORS.brand[2]);
    doc.text('JOB SCOPE & MATERIALS', 15, yPos);
    yPos += 5;

    const rows = record.workOrderLines.map((l) => [l.item, l.description, l.qty]);
    autoTable(doc, {
      startY: yPos,
      head: [['Item', 'Instructions', 'Quantity']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: PDF_COLORS.brand },
    });
    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(12);
    doc.setFont(undefined as unknown as string, 'bold');
    doc.setTextColor(PDF_COLORS.brand[0], PDF_COLORS.brand[1], PDF_COLORS.brand[2]);
    doc.text('INSTALLATION SCOPE', 15, yPos);
    yPos += 5;

    const scopeRows: unknown[][] = [];
    if (record.results.wallBdFt > 0) scopeRows.push(['WALLS', `${record.wallSettings.type} @ ${record.wallSettings.thickness}"`, `${Math.round(record.results.wallBdFt).toLocaleString()} bdft`]);
    if (record.results.roofBdFt > 0) scopeRows.push(['ROOF/CEILING', `${record.roofSettings.type} @ ${record.roofSettings.thickness}"`, `${Math.round(record.results.roofBdFt).toLocaleString()} bdft`]);

    autoTable(doc, { startY: yPos, head: [['Area', 'Spec', 'Volume']], body: scopeRows, theme: 'grid', headStyles: { fillColor: PDF_COLORS.brand } });
    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 15;

    doc.text('MATERIALS & EQUIPMENT', 15, yPos);
    yPos += 5;

    const matRows: unknown[][] = [];
    if (record.materials.openCellSets > 0) {
      const strokes = record.results.openCellStrokes ? ` (${record.results.openCellStrokes.toLocaleString()} Strokes)` : '';
      matRows.push(['Open Cell Foam', `${record.materials.openCellSets.toFixed(2)} Sets${strokes}`]);
    }
    if (record.materials.closedCellSets > 0) {
      const strokes = record.results.closedCellStrokes ? ` (${record.results.closedCellStrokes.toLocaleString()} Strokes)` : '';
      matRows.push(['Closed Cell Foam', `${record.materials.closedCellSets.toFixed(2)} Sets${strokes}`]);
    }
    record.materials.inventory.forEach((item) => matRows.push([item.name, `${item.quantity} ${item.unit}`]));
    if (record.materials.equipment && record.materials.equipment.length > 0) {
      record.materials.equipment.forEach((tool) => matRows.push([`EQUIPMENT: ${tool.name}`, 'Assigned']));
    }

    autoTable(doc, { startY: yPos, head: [['Item', 'Quantity/Status']], body: matRows, theme: 'grid', headStyles: { fillColor: PDF_COLORS.accent } });
    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 15;
  }

  if (record.notes) {
    doc.setFont(undefined as unknown as string, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(PDF_COLORS.brand[0], PDF_COLORS.brand[1], PDF_COLORS.brand[2]);
    doc.text('CREW NOTES / GATE CODES / INSTRUCTIONS', 15, yPos);
    doc.setFont(undefined as unknown as string, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(record.notes, 15, yPos + 5, { maxWidth: pageWidth - 30 });
  }

  buildPdfFooter(doc, 'workorder');
  doc.save(`${record.customer.name.replace(/\s+/g, '_')}_WorkOrder.pdf`);
}
