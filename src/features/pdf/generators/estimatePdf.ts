import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FoamType } from '../../../../types';
import { PDF_COLORS } from '../templates/pdfColors';
import { buildPdfHeader } from '../templates/pdfHeader';
import { buildPdfFooter } from '../templates/pdfFooter';
import { EstimatePdfData } from '../types/pdf.types';

const formatCurrency = (val: number) =>
  `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

async function buildEstimatePdfDoc(data: EstimatePdfData) {
  const { state, results, record, type } = data;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  const customer = record ? record.customer : state.customerProfile;
  const wallSettings = record ? record.wallSettings : state.wallSettings;
  const roofSettings = record ? record.roofSettings : state.roofSettings;
  const inventory = record ? record.materials.inventory : state.inventory;
  const pricingMode = record ? (record.pricingMode || 'level_pricing') : state.pricingMode;
  const sqFtRates = record ? (record.sqFtRates || { wall: 0, roof: 0 }) : state.sqFtRates;

  let displayDate = record?.date || new Date().toISOString();
  if (type === 'INVOICE' && record?.invoiceDate) displayDate = record.invoiceDate;

  let docTitle = 'Spray Foam Estimate';
  if (type === 'INVOICE') docTitle = 'INVOICE';
  if (type === 'RECEIPT') docTitle = 'PAYMENT RECEIPT';

  const metaLabel = type === 'ESTIMATE' ? 'Estimate #' : 'Invoice #';
  const metaValue =
    (type === 'INVOICE' || type === 'RECEIPT') && record?.invoiceNumber
      ? record.invoiceNumber
      : record?.id.substring(0, 8).toUpperCase() || String(Math.floor(Math.random() * 10000) + 1000);

  let yPos = await buildPdfHeader(doc, state.companyProfile, docTitle);

  // Customer box
  doc.setFillColor(PDF_COLORS.lightBg[0], PDF_COLORS.lightBg[1], PDF_COLORS.lightBg[2]);
  doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, 'F');
  doc.setFontSize(14);
  doc.setTextColor(PDF_COLORS.brand[0], PDF_COLORS.brand[1], PDF_COLORS.brand[2]);
  doc.text(type === 'ESTIMATE' ? 'Estimate For:' : 'Bill To:', 20, yPos + 10);
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(customer.name || 'Valued Customer', 20, yPos + 18);
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text(customer.address || '', 20, yPos + 23);
  doc.text(`${customer.city} ${customer.state} ${customer.zip}`, 20, yPos + 28);
  doc.setFontSize(10);
  doc.text(`Date: ${new Date(displayDate).toLocaleDateString()}`, pageWidth - 25, yPos + 10, { align: 'right' });
  doc.text(`${metaLabel}: ${metaValue}`, pageWidth - 25, yPos + 15, { align: 'right' });
  if (type === 'INVOICE') {
    doc.setFont(undefined as unknown as string, 'bold');
    doc.text(`Terms: ${record?.paymentTerms || 'Due on Receipt'}`, pageWidth - 25, yPos + 22, { align: 'right' });
  }

  yPos += 45;
  doc.setFontSize(12);
  doc.setTextColor(PDF_COLORS.brand[0], PDF_COLORS.brand[1], PDF_COLORS.brand[2]);
  doc.text('Job Configuration', 15, yPos);
  yPos += 5;

  const metalFactorDisplay = (record?.inputs.isMetalSurface || state.isMetalSurface) ? 'Yes (+15%)' : 'No';
  autoTable(doc, {
    startY: yPos,
    head: [['Project Scope', 'Metal Surface Adjustment', 'Total Spray Area']],
    body: [[
      record ? 'Saved Record' : state.mode,
      metalFactorDisplay,
      `${Math.round(results.totalWallArea + results.totalRoofArea).toLocaleString()} sq ft`,
    ]],
    theme: 'striped',
    headStyles: { fillColor: PDF_COLORS.accent },
    styles: { fontSize: 9 },
  });

  // @ts-ignore
  let finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(12);
  doc.text(type === 'ESTIMATE' ? 'Estimate Breakdown' : 'Invoice Details', 15, finalY);
  finalY += 5;

  let tableRows: unknown[][] = [];
  const customLines = type === 'ESTIMATE' ? record?.estimateLines : record?.invoiceLines;

  if (customLines && customLines.length > 0) {
    tableRows = customLines.map((line) => [
      line.item, line.description, line.qty,
      state.showPricing ? formatCurrency(Number(line.amount)) : '-',
    ]);
  } else {
    if (results.wallBdFt > 0) {
      const wType = wallSettings.type;
      let lineCost = 0;
      if (pricingMode === 'sqft_pricing') {
        lineCost = results.totalWallArea * (sqFtRates.wall || 0);
      } else {
        const costPerSet = wType === FoamType.OPEN_CELL ? state.costs.openCell : state.costs.closedCell;
        const yieldPerSet = wType === FoamType.OPEN_CELL ? state.yields.openCell : state.yields.closedCell;
        lineCost = (results.wallBdFt / yieldPerSet) * costPerSet;
      }
      tableRows.push(['Wall Insulation', `Spray approximately ${wallSettings.thickness} inches of ${wType} to walls.`, `${Math.round(results.totalWallArea).toLocaleString()} sqft`, state.showPricing ? formatCurrency(lineCost) : '-']);
    }
    if (results.roofBdFt > 0) {
      const rType = roofSettings.type;
      let lineCost = 0;
      if (pricingMode === 'sqft_pricing') {
        lineCost = results.totalRoofArea * (sqFtRates.roof || 0);
      } else {
        const costPerSet = rType === FoamType.OPEN_CELL ? state.costs.openCell : state.costs.closedCell;
        const yieldPerSet = rType === FoamType.OPEN_CELL ? state.yields.openCell : state.yields.closedCell;
        lineCost = (results.roofBdFt / yieldPerSet) * costPerSet;
      }
      tableRows.push(['Roof Insulation', `Spray approximately ${roofSettings.thickness} inches of ${rType} to ceiling/roof deck.`, `${Math.round(results.totalRoofArea).toLocaleString()} sqft`, state.showPricing ? formatCurrency(lineCost) : '-']);
    }
    inventory.forEach((item) => tableRows.push([item.name, `Quantity: ${item.quantity} (${item.unit})`, '-', '-']));
    if (pricingMode === 'level_pricing' && results.laborCost > 0) {
      tableRows.push(['Labor', `Application Labor (${state.expenses.manHours} hours)`, '-', state.showPricing ? formatCurrency(results.laborCost) : '-']);
    }
    if (state.expenses.tripCharge > 0) tableRows.push(['Trip Charge', 'Standard Rate', '1', state.showPricing ? formatCurrency(state.expenses.tripCharge) : '-']);
    if (state.expenses.fuelSurcharge > 0) tableRows.push(['Fuel Surcharge', 'Distance Adjustment', '1', state.showPricing ? formatCurrency(state.expenses.fuelSurcharge) : '-']);
    if (state.expenses.other.amount !== 0) tableRows.push([state.expenses.other.description || 'Adjustment', 'Misc', '1', state.showPricing ? formatCurrency(state.expenses.other.amount) : '-']);
  }

  autoTable(doc, {
    startY: finalY,
    head: [['Item', 'Description', 'Qty/Area', 'Amount']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: PDF_COLORS.brand },
    columnStyles: { 3: { halign: 'right' } },
  });

  if (state.showPricing) {
    // @ts-ignore
    finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont(undefined as unknown as string, 'bold');
    let finalTotal = results.totalCost;
    if (customLines && customLines.length > 0) {
      finalTotal = customLines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
    } else if (record?.totalValue) {
      finalTotal = record.totalValue;
    }
    doc.text(`Total Due: ${formatCurrency(finalTotal)}`, pageWidth - 15, finalY, { align: 'right' });
    if (type === 'RECEIPT') {
      finalY += 10;
      doc.setTextColor(PDF_COLORS.green[0], PDF_COLORS.green[1], PDF_COLORS.green[2]);
      doc.text('PAID IN FULL', pageWidth - 15, finalY, { align: 'right' });
    }
  }

  buildPdfFooter(doc, type.toLowerCase() as 'estimate' | 'invoice' | 'receipt');

  const filename = `${customer.name.replace(/\s+/g, '_')}_${docTitle.replace(/\s+/g, '_')}.pdf`;
  return { doc, filename };
}

export async function generateEstimatePdf(data: EstimatePdfData): Promise<void> {
  const { doc, filename } = await buildEstimatePdfDoc(data);
  doc.save(filename);
}
