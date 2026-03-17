import { jsPDF } from 'jspdf';
import { CompanyProfile } from '../../../../types';
import { PDF_COLORS } from './pdfColors';

export const getImageData = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Canvas context failed'));
      }
    };
    img.onerror = (e) => reject(e);
    img.src = url;
  });
};

/**
 * Draws the company header (logo + name + address) onto the PDF.
 * Returns the Y position after the header block.
 */
export async function buildPdfHeader(
  doc: jsPDF,
  companyProfile: CompanyProfile,
  title: string
): Promise<number> {
  const pageWidth = doc.internal.pageSize.width;

  if (companyProfile.logoUrl) {
    try {
      let logoData = companyProfile.logoUrl;
      if (logoData.startsWith('http')) {
        try {
          logoData = await getImageData(logoData);
        } catch (err) {
          console.warn('Failed to load remote logo for PDF', err);
          logoData = '';
        }
      }
      if (logoData) {
        const imgProps = doc.getImageProperties(logoData);
        const ratio = imgProps.height / imgProps.width;
        const width = 40;
        const height = width * ratio;
        doc.addImage(logoData, 'PNG', 15, 15, width, height);
      }
    } catch (e) {
      console.error('Error adding logo', e);
    }
  }

  doc.setFontSize(18);
  doc.setTextColor(PDF_COLORS.brand[0], PDF_COLORS.brand[1], PDF_COLORS.brand[2]);
  doc.text(companyProfile.companyName || title, pageWidth - 15, 25, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(100);
  let yPos = 32;

  const companyLines = [
    companyProfile.addressLine1,
    companyProfile.addressLine2,
    `${companyProfile.city ? companyProfile.city + ', ' : ''}${companyProfile.state} ${companyProfile.zip}`,
    companyProfile.phone,
    companyProfile.email,
    companyProfile.website,
  ].filter(Boolean);

  companyLines.forEach((line) => {
    doc.text(line || '', pageWidth - 15, yPos, { align: 'right' });
    yPos += 5;
  });

  return Math.max(yPos, 40) + 10;
}
