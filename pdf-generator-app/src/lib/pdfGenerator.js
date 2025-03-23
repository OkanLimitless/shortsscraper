import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * PDF Generator utility for KVK business register extracts
 * Used to create PDF documents that match the official KVK layout
 */
export async function generatePDF(formData) {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    
    // Get page dimensions
    const { width, height } = page.getSize();
    
    // Load fonts 
    try {
      // Embed standard fonts
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
      
      // Helper function to draw separator lines
      const drawSeparatorLine = (yPosition) => {
        page.drawLine({
          start: { x: 112, y: yPosition },
          end: { x: width - 112, y: yPosition },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8), // Light gray
        });
      };
      
      // Consistent spacing variables
      const sectionTitleFontSize = 12;
      const labelFontSize = 10;
      const valueFontSize = 10;
      const noteFontSize = 9;
      const leftMargin = 112;
      const rightMargin = width - 112;
      const labelIndent = leftMargin;
      const valueIndent = leftMargin + 183; // 183px indentation for values
      
      // --- Draw the KVK logo (smaller) ---
      page.drawText('KVK', {
        x: leftMargin,
        y: height - 85,
        size: 28, // Reduced from 36 to 28
        font: boldFont,
        color: rgb(0.125, 0.29, 0.388), // Dark blue color for KVK logo
      });
      
      // --- Add title and subtitle on same line (right-aligned) ---
      const title = 'Business Register extract   Netherlands Chamber of Commerce';
      const titleWidth = boldFont.widthOfTextAtSize(title, 14);
      
      page.drawText(title, {
        x: rightMargin - titleWidth,
        y: height - 85,
        size: 14, // Smaller font size for the title
        font: boldFont,
        color: rgb(0.125, 0.29, 0.388), // Dark blue color
      });
      
      // --- Add horizontal separator line ---
      drawSeparatorLine(height - 105);
      
      // --- CCI number and page number on same line ---
      page.drawText('CCI number', {
        x: leftMargin,
        y: height - 135,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(formData.kvkNumber || '77678303', {
        x: valueIndent,
        y: height - 135,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Page number (right-aligned)
      const pageText = 'Page 1 (of 1)';
      const pageTextWidth = regularFont.widthOfTextAtSize(pageText, valueFontSize);
      
      page.drawText(pageText, {
        x: rightMargin - pageTextWidth,
        y: height - 135,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // --- Postal disclaimer (left-aligned, italicized, smaller) ---
      const disclaimerText = 'The company / organisation does not want its address details to be used for';
      const disclaimerText2 = 'unsolicited postal advertising or visits from sales representatives.';
      
      page.drawText(disclaimerText, {
        x: leftMargin,
        y: height - 165,
        size: noteFontSize,
        font: italicFont, // Italicized text
        color: rgb(0, 0, 0),
      });
      
      page.drawText(disclaimerText2, {
        x: leftMargin, 
        y: height - 180,
        size: noteFontSize,
        font: italicFont, // Italicized text
        color: rgb(0, 0, 0),
      });
      
      // --- Add horizontal separator line ---
      drawSeparatorLine(height - 200);
      
      // --- COMPANY section (with lines above and below) ---
      // Line above is already drawn at height - 200
      page.drawText('COMPANY', {
        x: leftMargin,
        y: height - 225,
        size: sectionTitleFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      drawSeparatorLine(height - 240); // Line below section title
      
      // Trade names
      page.drawText('Trade names', {
        x: labelIndent,
        y: height - 265,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      const tradeName = formData.tradeName || 'Diamond Sky Marketing';
      const tradeNameAlias = 'AdWings';
      
      page.drawText(tradeName, {
        x: valueIndent,
        y: height - 265,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(tradeNameAlias, {
        x: valueIndent,
        y: height - 280,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Legal form
      page.drawText('Legal form', {
        x: labelIndent,
        y: height - 305,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      const legalFormText = formData.legalForm || 'Eenmanszaak (comparable with One-man business)';
      
      page.drawText(legalFormText, {
        x: valueIndent,
        y: height - 305,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Company start date
      page.drawText('Company start date', {
        x: labelIndent,
        y: height - 330,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      const startDate = formData.dateOfIncorporation 
        ? formatDutchDate(formData.dateOfIncorporation)
        : '09-03-2020 (registration date: 20-03-2020)';
        
      page.drawText(startDate, {
        x: valueIndent,
        y: height - 330,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Activities
      page.drawText('Activities', {
        x: labelIndent,
        y: height - 355,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      const activity1 = 'SBI-code: 74101 - Communication and graphic design';
      const activity2 = 'SBI-code: 6201 - Writing, producing and publishing of software';
      
      page.drawText(activity1, {
        x: valueIndent,
        y: height - 355,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(activity2, {
        x: valueIndent,
        y: height - 370,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Employees
      page.drawText('Employees', {
        x: labelIndent,
        y: height - 395,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('0', {
        x: valueIndent,
        y: height - 395,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // --- Add horizontal separator line (increased spacing) ---
      drawSeparatorLine(height - 425);
      
      // --- ESTABLISHMENT section (with lines above and below) ---
      // Line above is already drawn at height - 425
      page.drawText('ESTABLISHMENT', {
        x: leftMargin,
        y: height - 450,
        size: sectionTitleFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      drawSeparatorLine(height - 465); // Line below section title
      
      // Establishment number
      page.drawText('Establishment number', {
        x: labelIndent,
        y: height - 490,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('000045362920', {
        x: valueIndent,
        y: height - 490,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Trade names again for establishment
      page.drawText('Trade names', {
        x: labelIndent,
        y: height - 515,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(tradeName, {
        x: valueIndent,
        y: height - 515,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(tradeNameAlias, {
        x: valueIndent,
        y: height - 530,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Visiting address
      page.drawText('Visiting address', {
        x: labelIndent,
        y: height - 555,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      const address = formData.address || 'Spreeuwenhof 81, 7051XJ Varsseveld';
      
      page.drawText(address, {
        x: valueIndent,
        y: height - 555,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Date of incorporation again for establishment
      page.drawText('Date of incorporation', {
        x: labelIndent,
        y: height - 580,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(startDate, {
        x: valueIndent,
        y: height - 580,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Activities again for establishment
      page.drawText('Activities', {
        x: labelIndent,
        y: height - 605,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(activity1, {
        x: valueIndent,
        y: height - 605,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(activity2, {
        x: valueIndent,
        y: height - 620,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // For further information text (italicized note)
      page.drawText('For further information on activities, see Dutch extract.', {
        x: valueIndent,
        y: height - 640,
        size: noteFontSize,
        font: italicFont, // Italicized text
        color: rgb(0, 0, 0),
      });
      
      // Employees again for establishment
      page.drawText('Employees', {
        x: labelIndent,
        y: height - 665,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('0', {
        x: valueIndent,
        y: height - 665,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // --- Add horizontal separator line (increased spacing) ---
      drawSeparatorLine(height - 695);
      
      // --- OWNER section (with lines above and below) ---
      // Line above is already drawn at height - 695
      page.drawText('OWNER', {
        x: leftMargin,
        y: height - 720,
        size: sectionTitleFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      drawSeparatorLine(height - 735); // Line below section title
      
      // Name
      page.drawText('Name', {
        x: labelIndent,
        y: height - 760,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      const ownerName = formData.ownerName || 'Piyniṛci, Okan';
      
      page.drawText(ownerName, {
        x: valueIndent,
        y: height - 760,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Date of birth
      page.drawText('Date of birth', {
        x: labelIndent,
        y: height - 785,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      const dob = formData.ownerDOB 
        ? formatDutchDate(formData.ownerDOB)
        : '21-01-1994';
        
      page.drawText(dob, {
        x: valueIndent,
        y: height - 785,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Date of entry into office
      page.drawText('Date of entry into office', {
        x: labelIndent,
        y: height - 810,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('09-03-2020 (registration date: 20-03-2020)', {
        x: valueIndent,
        y: height - 810,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // --- Add extraction date at the bottom (left-aligned) ---
      const today = new Date();
      const extractionDate = today.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '-');
      
      const extractionTime = today.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      page.drawText(`Extract was made on ${extractionDate} at ${extractionTime} hours.`, {
        x: leftMargin,
        y: 100, // Position at bottom of page
        size: noteFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // --- Add WAARMERK section (right-aligned) ---
      page.drawText('WAARMERK', {
        x: 130,
        y: 50,
        size: 14,
        font: boldFont,
        color: rgb(0.5, 0.5, 0.5), // Gray color
      });
      
      page.drawText('KAMER VAN KOOPHANDEL', {
        x: 130,
        y: 35,
        size: 8,
        font: regularFont,
        color: rgb(0.5, 0.5, 0.5), // Gray color
      });
      
      // --- Add footer text (wrapping appropriately) ---
      const footerX = 170; // Starting X position for footer text
      const footerFontSize = 7;
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
          y: 70 - (index * footerLineHeight),
          size: footerFontSize,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
      });
      
      // Save the PDF document
      const pdfBytes = await pdfDoc.save();
      
      return pdfBytes;
      
    } catch (fontError) {
      console.error('Error with fonts:', fontError);
      throw new Error('Failed to embed fonts in PDF');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
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