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
          start: { x: 111, y: yPosition },
          end: { x: width - 111, y: yPosition },
          thickness: 0.7,
          color: rgb(0.8, 0.8, 0.8), // Light gray
        });
      };
      
      // Consistent spacing variables
      const sectionTitleFontSize = 11;
      const labelFontSize = 9;
      const valueFontSize = 9;
      const noteFontSize = 9;
      const leftMargin = 111;
      const rightMargin = width - 111;
      const labelIndent = leftMargin;
      const valueIndent = leftMargin + 180; // 180px indentation for values
      
      // --- Draw the KVK logo ---
      page.drawText('KVK', {
        x: leftMargin,
        y: height - 95, // Fine-tune vertical position
        size: 34, // Fine-tune size
        font: boldFont,
        color: rgb(0.125, 0.29, 0.388), // Dark blue color for KVK logo
      });
      
      // --- Add title and subtitle ---
      const businessRegisterText = 'Business Register extract';
      const chamberOfCommerceText = 'Netherlands Chamber of Commerce';
      
      page.drawText(businessRegisterText, {
        x: leftMargin,
        y: height - 187, // Fine-tune vertical position
        size: 16,
        font: boldFont,
        color: rgb(0.125, 0.29, 0.388), // Dark blue color
      });
      
      page.drawText(chamberOfCommerceText, {
        x: leftMargin,
        y: height - 212, // Fine-tune vertical position
        size: 16,
        font: boldFont,
        color: rgb(0.125, 0.29, 0.388), // Dark blue color
      });
      
      // --- Add horizontal separator line ---
      drawSeparatorLine(height - 232);
      
      // --- CCI number and page number ---
      page.drawText('CCI number', {
        x: leftMargin,
        y: height - 260,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(formData.kvkNumber || '77678303', {
        x: valueIndent,
        y: height - 260,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Horizontal separator line before Page number
      drawSeparatorLine(height - 280);
      
      // Page number
      const pageText = 'Page 1 (of 1)';
      
      page.drawText(pageText, {
        x: leftMargin,
        y: height - 305, // Fine-tune vertical position
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // --- Horizontal separator line ---
      drawSeparatorLine(height - 321);
      
      // --- Postal disclaimer (centered italicized) ---
      const disclaimerText = 'The company / organisation does not want its address details to be used for';
      const disclaimerText2 = 'unsolicited postal advertising or visits from sales representatives.';
      
      // Calculate center position
      const centerX = width / 2;
      
      page.drawText(disclaimerText, {
        x: centerX - (italicFont.widthOfTextAtSize(disclaimerText, noteFontSize) / 2),
        y: height - 362, // Fine-tune vertical position
        size: noteFontSize,
        font: italicFont, // Italicized text
        color: rgb(0, 0, 0),
      });
      
      page.drawText(disclaimerText2, {
        x: centerX - (italicFont.widthOfTextAtSize(disclaimerText2, noteFontSize) / 2), 
        y: height - 377, // Fine-tune vertical position
        size: noteFontSize,
        font: italicFont, // Italicized text
        color: rgb(0, 0, 0),
      });
      
      // --- Add horizontal separator line ---
      drawSeparatorLine(height - 395);
      
      // --- COMPANY section ---
      page.drawText('COMPANY', {
        x: leftMargin,
        y: height - 420,
        size: sectionTitleFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      // Line below section title
      drawSeparatorLine(height - 435);
      
      // Trade names
      page.drawText('Trade names', {
        x: labelIndent,
        y: height - 455,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      const tradeName = formData.tradeName || 'Diamond Sky Marketing';
      const tradeNameAlias = 'AdWings';
      
      page.drawText(tradeName, {
        x: valueIndent,
        y: height - 455,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(tradeNameAlias, {
        x: valueIndent,
        y: height - 470,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
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
      
      // Company start date
      page.drawText('Company start date', {
        x: labelIndent,
        y: height - 510,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      const startDate = formData.dateOfIncorporation 
        ? formatDutchDate(formData.dateOfIncorporation)
        : '09-03-2020 (registration date: 20-03-2020)';
        
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
      
      page.drawText('0', {
        x: valueIndent,
        y: height - 565,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // --- Add horizontal separator line ---
      drawSeparatorLine(height - 585);
      
      // --- ESTABLISHMENT section ---
      page.drawText('ESTABLISHMENT', {
        x: leftMargin,
        y: height - 610,
        size: sectionTitleFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      // Line below section title
      drawSeparatorLine(height - 625);
      
      // Establishment number
      page.drawText('Establishment number', {
        x: labelIndent,
        y: height - 645,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('000045362920', {
        x: valueIndent,
        y: height - 645,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Trade names again for establishment
      page.drawText('Trade names', {
        x: labelIndent,
        y: height - 665,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(tradeName, {
        x: valueIndent,
        y: height - 665,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(tradeNameAlias, {
        x: valueIndent,
        y: height - 680,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Visiting address
      page.drawText('Visiting address', {
        x: labelIndent,
        y: height - 700,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      const address = formData.address || 'Spreeuwenhof 81, 7051XJ Varsseveld';
      
      page.drawText(address, {
        x: valueIndent,
        y: height - 700,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Date of incorporation again for establishment
      page.drawText('Date of incorporation', {
        x: labelIndent,
        y: height - 720,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(startDate, {
        x: valueIndent,
        y: height - 720,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Activities again for establishment
      page.drawText('Activities', {
        x: labelIndent,
        y: height - 740,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(activity1, {
        x: valueIndent,
        y: height - 740,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(activity2, {
        x: valueIndent,
        y: height - 755,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // For further information text (italicized note)
      page.drawText('For further information on activities, see Dutch extract.', {
        x: valueIndent,
        y: height - 770,
        size: noteFontSize,
        font: italicFont, // Italicized text
        color: rgb(0, 0, 0),
      });
      
      // Employees again for establishment
      page.drawText('Employees', {
        x: labelIndent,
        y: height - 790,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('0', {
        x: valueIndent,
        y: height - 790,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // --- Add horizontal separator line ---
      drawSeparatorLine(height - 794);
      
      // --- OWNER section ---
      page.drawText('OWNER', {
        x: leftMargin,
        y: height - 830,
        size: sectionTitleFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      // Line below section title
      drawSeparatorLine(height - 845);
      
      // Name
      page.drawText('Name', {
        x: labelIndent,
        y: height - 865,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      // Fix the Unicode character issue by replacing 'ṛ' with 'r'
      const ownerName = formData.ownerName || 'Piyirci, Okan';
      
      page.drawText(ownerName, {
        x: valueIndent,
        y: height - 865,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Date of birth
      page.drawText('Date of birth', {
        x: labelIndent,
        y: height - 885,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      const dob = formData.ownerDOB 
        ? formatDutchDate(formData.ownerDOB)
        : '21-01-1994';
        
      page.drawText(dob, {
        x: valueIndent,
        y: height - 885,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Date of entry into office
      page.drawText('Date of entry into office', {
        x: labelIndent,
        y: height - 905,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('09-03-2020 (registration date: 20-03-2020)', {
        x: valueIndent,
        y: height - 905,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // --- Separator line after owner section ---
      drawSeparatorLine(height - 925);
      
      // --- Add extraction date ---
      // Format the date as in the example: DD-MM-YYYY
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
        x: width / 2 - 110, // Centered position
        y: 150, // Fine-tune vertical position
        size: noteFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // --- Add WAARMERK watermark ---
      page.drawText('WAARMERK', {
        x: 112, // Adjusted position to match example
        y: 45, // Adjusted position to match example
        size: 14,
        font: boldFont,
        color: rgb(0.5, 0.5, 0.5), // Gray color
      });
      
      page.drawText('KAMER VAN KOOPHANDEL', {
        x: 112, // Adjusted position to match example
        y: 30, // Adjusted position to match example
        size: 8,
        font: regularFont,
        color: rgb(0.5, 0.5, 0.5), // Gray color
      });
      
      // --- Add footer text ---
      const footerFontSize = 7;
      const footerX = 170;
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
      
      // --- Add vertical timestamp at right edge ---
      const timestamp = '2023-10-23 14:18:04'; // Use fixed timestamp to match example
      
      // Draw rotated text for timestamp
      page.drawText(timestamp, {
        x: width - 20, // Adjusted position to match example
        y: 120, // Adjusted position to match example
        size: 8,
        font: regularFont,
        color: rgb(0, 0, 0),
        rotate: {
          type: 'degrees',
          angle: 90,
        },
      });
      
      // --- Add pink/magenta bar at bottom ---
      const barHeight = 24; // Adjusted to match example
      page.drawRectangle({
        x: 0,
        y: 0,
        width: width,
        height: barHeight,
        color: rgb(0.85, 0, 0.5), // Magenta/pink color
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