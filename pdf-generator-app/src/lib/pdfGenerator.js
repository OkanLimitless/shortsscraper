import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Enhanced PDF Generator with metadata spoofing for KVK business register extracts
 * Designed to match the original document structure and avoid detection
 */

// Generate random font subset prefixes (like EFYYZG+, EFZALS+)
function generateFontPrefix() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let prefix = '';
  for (let i = 0; i < 6; i++) {
    prefix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + '+';
}

// Generate realistic UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Generate realistic creation dates with timezone
function generateRealisticDates() {
  const now = new Date();
  // Create date should be slightly before modify date
  const createDate = new Date(now.getTime() - Math.random() * 3600000); // Up to 1 hour before
  const modifyDate = new Date(createDate.getTime() + Math.random() * 1800000); // Up to 30 minutes after create
  
  // Format for PDF metadata (ISO format with timezone)
  const formatPDFDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}:${month}:${day} ${hours}:${minutes}:${seconds}+02:00`;
  };
  
  return {
    createDate: formatPDFDate(createDate),
    modifyDate: formatPDFDate(modifyDate),
    metadataDate: formatPDFDate(modifyDate)
  };
}

export async function generatePDF(formData) {
  try {
    console.log('Starting PDF generation...');
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    console.log('PDF document created');
    
    // Generate metadata for spoofing
    const dates = generateRealisticDates();
    const documentId = generateUUID();
    const instanceId = generateUUID();
    
    // Set PDF metadata to match original
    pdfDoc.setTitle('titel');
    pdfDoc.setProducer('StreamServe Communication Server 23.3 Build 16.6.70 GA 496 (64 bit)');
    pdfDoc.setCreationDate(new Date());
    pdfDoc.setModificationDate(new Date());
    
    console.log('Enhanced metadata set');
    
    const page = pdfDoc.addPage([595.44, 841.68]); // Exact A4 size from original
    
    console.log('Page added');
    
    // Get page dimensions
    const { width, height } = page.getSize();
    
    // Load fonts
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    
    console.log('Fonts loaded');
    
    // Helper function to draw separator lines
    const drawSeparatorLine = (yPosition) => {
      page.drawLine({
        start: { x: 111, y: yPosition },
        end: { x: width - 111, y: yPosition },
        thickness: 0.7,
        color: rgb(0.8, 0.8, 0.8),
      });
    };
    
    // Consistent spacing variables
    const sectionTitleFontSize = 11;
    const labelFontSize = 9;
    const valueFontSize = 9;
    const noteFontSize = 9;
    const leftMargin = 111;
    const labelIndent = leftMargin;
    const valueIndent = leftMargin + 180;
    
    // --- Draw the KVK logo ---
    page.drawText('KVK', {
      x: leftMargin,
      y: height - 95,
      size: 34,
      font: boldFont,
      color: rgb(0.125, 0.29, 0.388),
    });
    
    // --- Add title and subtitle ---
    page.drawText('Business Register extract', {
      x: leftMargin,
      y: height - 187,
      size: 16,
      font: boldFont,
      color: rgb(0.125, 0.29, 0.388),
    });
    
    page.drawText('Netherlands Chamber of Commerce', {
      x: leftMargin,
      y: height - 212,
      size: 16,
      font: boldFont,
      color: rgb(0.125, 0.29, 0.388),
    });
    
    drawSeparatorLine(height - 232);
    
    // --- Add CCI number ---
    page.drawText('CCI number', {
      x: leftMargin,
      y: height - 255,
      size: labelFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    const kvkNumber = formData.kvkNumber || '77678303';
    page.drawText(kvkNumber, {
      x: valueIndent,
      y: height - 255,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    drawSeparatorLine(height - 275);
    
    page.drawText('Page 1 (of 1)', {
      x: leftMargin,
      y: height - 305,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    drawSeparatorLine(height - 325);
    
    // --- Add disclaimer ---
    const disclaimerText1 = 'The company / organisation does not want its address details to be used for';
    const disclaimerText2 = 'unsolicited postal advertising or visits from sales representatives.';
    
    page.drawText(disclaimerText1, {
      x: width / 2 - 200,
      y: height - 362,
      size: noteFontSize,
      font: italicFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(disclaimerText2, {
      x: width / 2 - 200,
      y: height - 377,
      size: noteFontSize,
      font: italicFont,
      color: rgb(0, 0, 0),
    });
    
    drawSeparatorLine(height - 400);
    
    // --- COMPANY section ---
    page.drawText('Company', {
      x: leftMargin,
      y: height - 430,
      size: sectionTitleFontSize,
      font: boldFont,
      color: rgb(0.125, 0.29, 0.388),
    });
    
    drawSeparatorLine(height - 445);
    
    // Trade names
    page.drawText('Trade names', {
      x: labelIndent,
      y: height - 465,
      size: labelFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    const tradeName = formData.tradeName || 'Diamond Sky Marketing';
    page.drawText(tradeName, {
      x: valueIndent,
      y: height - 465,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    // Trade name alias if provided
    if (formData.tradeNameAlias && formData.tradeNameAlias.trim() !== '') {
      page.drawText(formData.tradeNameAlias, {
        x: valueIndent,
        y: height - 480,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
    }
    
    // Legal form
    page.drawText('Legal form', {
      x: labelIndent,
      y: height - 490,
      size: labelFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    const legalFormText = formData.legalForm || 'Eenmanszaak (comparable with One-man business)';
    page.drawText(legalFormText, {
      x: valueIndent,
      y: height - 490,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    // Generate random realistic start date
    const generateRandomStartDate = () => {
      const now = new Date();
      const randomMonths = Math.floor(Math.random() * 60);
      const pastDate = new Date(now);
      pastDate.setMonth(now.getMonth() - randomMonths);
      
      const day = pastDate.getDate().toString().padStart(2, '0');
      const month = (pastDate.getMonth() + 1).toString().padStart(2, '0');
      const year = pastDate.getFullYear();
      
      const regDate = new Date(pastDate);
      regDate.setDate(regDate.getDate() + Math.floor(Math.random() * 14) + 1);
      const regDay = regDate.getDate().toString().padStart(2, '0');
      const regMonth = (regDate.getMonth() + 1).toString().padStart(2, '0');
      const regYear = regDate.getFullYear();
      
      return `${day}-${month}-${year} (registration date: ${regDay}-${regMonth}-${regYear})`;
    };
    
    // Company start date
    page.drawText('Company start date', {
      x: labelIndent,
      y: height - 510,
      size: labelFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    const startDate = formData.dateOfIncorporation ? 
      formatDutchDate(formData.dateOfIncorporation) : 
      generateRandomStartDate();
      
    page.drawText(startDate, {
      x: valueIndent,
      y: height - 510,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    // Activities
    page.drawText('Activities', {
      x: labelIndent,
      y: height - 530,
      size: labelFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    const activity1 = 'SBI-code: 74101 - Communication and graphic design';
    const activity2 = 'SBI-code: 6201 - Writing, producing and publishing of software';
    
    page.drawText(activity1, {
      x: valueIndent,
      y: height - 530,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(activity2, {
      x: valueIndent,
      y: height - 545,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    // Employees
    page.drawText('Employees', {
      x: labelIndent,
      y: height - 565,
      size: labelFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    const employees = formData.employees || Math.floor(Math.random() * 5).toString();
    page.drawText(employees, {
      x: valueIndent,
      y: height - 565,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    // --- Add extraction date ---
    const today = new Date();
    const extractionDate = today.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
    
    const extractionTime = today.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    }).replace(':', '.');
    
    page.drawText(`Extract was made on ${extractionDate} at ${extractionTime} hours.`, {
      x: width / 2 - 110,
      y: 150,
      size: noteFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    // --- Add WAARMERK watermark ---
    page.drawText('WAARMERK', {
      x: 112,
      y: 64,
      size: 14,
      font: boldFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    page.drawText('KAMER VAN KOOPHANDEL', {
      x: 112,
      y: 48,
      size: 8,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // --- Add footer text ---
    const footerFontSize = 7;
    const footerX = 230;
    const footerLineHeight = 10;
    
    const footerLines = [
      'This extract has been certified with a digital signature and is an official proof of registration in the Business',
      'Register. You can check the integrity of this document and validate the signature in Adobe at the top of your',
      'screen. The Chamber of Commerce recommends that this document be viewed in digital form so that its',
      'integrity is safeguarded and the signature remains verifiable.'
    ];
    
    footerLines.forEach((line, index) => {
      page.drawText(line, {
        x: footerX,
        y: 64 - (index * footerLineHeight),
        size: footerFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
    });
    
    // --- Add vertical timestamp at right edge ---
    const timestamp = today.toISOString().slice(0, 19).replace('T', ' ');
    
    page.drawText(timestamp, {
      x: width - 10,
      y: 140,
      size: 8,
      font: regularFont,
      color: rgb(0.3, 0.3, 0.3),
      rotate: {
        type: 'degrees',
        angle: 90,
      },
    });
    
    // --- Add pink/magenta bar at bottom ---
    const barHeight = 24;
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: barHeight,
      color: rgb(0.85, 0, 0.5),
    });
    
    console.log('Content drawn');
    
    // Save the PDF document
    const pdfBytes = await pdfDoc.save();
    
    console.log(`Generated PDF with metadata spoofing:`);
    console.log(`- Producer: StreamServe Communication Server 23.3`);
    console.log(`- Document ID: ${documentId}`);
    console.log(`- Instance ID: ${instanceId}`);
    console.log(`- PDF saved successfully, size: ${pdfBytes.length}`);
    
    return pdfBytes;
    
  } catch (error) {
    console.error('Error in generatePDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

// Helper function to format date in Dutch format (DD-MM-YYYY)
function formatDutchDate(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
} 