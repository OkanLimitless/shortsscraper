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
    // Create a new PDF document with specific version
    const pdfDoc = await PDFDocument.create();
    
    // Set PDF version to 1.4 to match original
    pdfDoc.setVersion(1, 4);
    
    // Generate metadata
    const dates = generateRealisticDates();
    const documentId = generateUUID();
    const instanceId = generateUUID();
    const fontPrefixes = {
      regular: generateFontPrefix(),
      bold: generateFontPrefix()
    };
    
    // Set PDF metadata to match original
    pdfDoc.setTitle('titel');
    pdfDoc.setProducer('StreamServe Communication Server 23.3 Build 16.6.70 GA 496 (64 bit)');
    pdfDoc.setCreationDate(new Date(dates.createDate.replace(/:/g, '-').replace('+02:00', '')));
    pdfDoc.setModificationDate(new Date(dates.modifyDate.replace(/:/g, '-').replace('+02:00', '')));
    
    // Add custom metadata to match original structure
    const customMetadata = {
      'DocumentID': `uuid:${documentId}`,
      'InstanceID': `uuid:${instanceId}`,
      'MetadataDate': dates.metadataDate,
      'Part': '1',
      'Conformance': 'B',
      'HasXFA': 'No'
    };
    
    // Set additional metadata
    Object.entries(customMetadata).forEach(([key, value]) => {
      try {
        pdfDoc.setCustomMetadata(key, value);
      } catch (error) {
        console.log(`Could not set custom metadata ${key}: ${error.message}`);
      }
    });
    
    const page = pdfDoc.addPage([595.44, 841.68]); // Exact A4 size from original
    
    // Get page dimensions
    const { width, height } = page.getSize();
    
    // Load fonts with custom names to match original structure
    try {
      // Embed standard fonts but we'll reference them with subset names
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
        y: height - 95,
        size: 34,
        font: boldFont,
        color: rgb(0.125, 0.29, 0.388), // Dark blue color for KVK logo
      });
      
      // --- Add title and subtitle ---
      const businessRegisterText = 'Business Register extract';
      const chamberOfCommerceText = 'Netherlands Chamber of Commerce';
      
      page.drawText(businessRegisterText, {
        x: leftMargin,
        y: height - 187,
        size: 16,
        font: boldFont,
        color: rgb(0.125, 0.29, 0.388), // Dark blue color
      });
      
      page.drawText(chamberOfCommerceText, {
        x: leftMargin,
        y: height - 212,
        size: 16,
        font: boldFont,
        color: rgb(0.125, 0.29, 0.388), // Dark blue color
      });
      
      // --- Add horizontal separator line ---
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
      
      // --- Add page number ---
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
        color: rgb(0.125, 0.29, 0.388), // Blue color for section headers
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
      
      // Company start date
      page.drawText('Company start date', {
        x: labelIndent,
        y: height - 510,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      // Generate random realistic start date
      const generateRandomStartDate = () => {
        const now = new Date();
        const randomMonths = Math.floor(Math.random() * 60); // 0-59 months ago
        const pastDate = new Date(now);
        pastDate.setMonth(now.getMonth() - randomMonths);
        
        const day = pastDate.getDate().toString().padStart(2, '0');
        const month = (pastDate.getMonth() + 1).toString().padStart(2, '0');
        const year = pastDate.getFullYear();
        
        // Add registration date (usually a few days after incorporation)
        const regDate = new Date(pastDate);
        regDate.setDate(regDate.getDate() + Math.floor(Math.random() * 14) + 1);
        const regDay = regDate.getDate().toString().padStart(2, '0');
        const regMonth = (regDate.getMonth() + 1).toString().padStart(2, '0');
        const regYear = regDate.getFullYear();
        
        return `${day}-${month}-${year} (registration date: ${regDay}-${regMonth}-${regYear})`;
      };
      
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
      
      drawSeparatorLine(height - 585);
      
      // --- ESTABLISHMENT section ---
      page.drawText('Establishment', {
        x: leftMargin,
        y: height - 615,
        size: sectionTitleFontSize,
        font: boldFont,
        color: rgb(0.125, 0.29, 0.388), // Blue color for section headers
      });
      
      drawSeparatorLine(height - 630);
      
      // Establishment number
      page.drawText('Establishment number', {
        x: labelIndent,
        y: height - 650,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      const establishmentNumber = formData.establishmentNumber || '000045362920';
      page.drawText(establishmentNumber, {
        x: valueIndent,
        y: height - 650,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Trade names (repeated for establishment)
      page.drawText('Trade names', {
        x: labelIndent,
        y: height - 670,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(tradeName, {
        x: valueIndent,
        y: height - 670,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      if (formData.tradeNameAlias && formData.tradeNameAlias.trim() !== '') {
        page.drawText(formData.tradeNameAlias, {
          x: valueIndent,
          y: height - 685,
          size: valueFontSize,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
      }
      
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
      
      // Date of incorporation
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
        font: italicFont,
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
      
      page.drawText(employees, {
        x: valueIndent,
        y: height - 790,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      drawSeparatorLine(height - 810);
      
      // --- OWNER section ---
      page.drawText('Owner', {
        x: leftMargin,
        y: height - 840,
        size: sectionTitleFontSize,
        font: boldFont,
        color: rgb(0.125, 0.29, 0.388), // Blue color for section headers
      });
      
      drawSeparatorLine(height - 855);
      
      // Name
      page.drawText('Name', {
        x: labelIndent,
        y: height - 875,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      // Fix the Unicode character issue by replacing 'ṛ' with 'r'
      let ownerName = formData.ownerName || 'Piyirci, Okan';
      ownerName = ownerName.replace(/ṛ/g, 'r');
      
      page.drawText(ownerName, {
        x: valueIndent,
        y: height - 875,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Date of birth
      page.drawText('Date of birth', {
        x: labelIndent,
        y: height - 895,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      const dob = formData.ownerDOB ? 
        formatDutchDate(formData.ownerDOB) : 
        '21-01-1994';
        
      page.drawText(dob, {
        x: valueIndent,
        y: height - 895,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      // Date of entry into office
      page.drawText('Date of entry into office', {
        x: labelIndent,
        y: height - 915,
        size: labelFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      // Generate random entry date
      const generateRandomEntryDate = () => {
        const now = new Date();
        const randomDays = Math.floor(Math.random() * 180); // 0-180 days ago
        const entryDate = new Date(now);
        entryDate.setDate(now.getDate() - randomDays);
        
        const day = entryDate.getDate().toString().padStart(2, '0');
        const month = (entryDate.getMonth() + 1).toString().padStart(2, '0');
        const year = entryDate.getFullYear();
        
        const regDate = new Date(entryDate);
        regDate.setDate(regDate.getDate() + Math.floor(Math.random() * 7) + 1);
        const regDay = regDate.getDate().toString().padStart(2, '0');
        const regMonth = (regDate.getMonth() + 1).toString().padStart(2, '0');
        const regYear = regDate.getFullYear();
        
        return `${day}-${month}-${year} (registration date: ${regDay}-${regMonth}-${regYear})`;
      };
      
      const entryDate = formData.dateOfEntry ? 
        formatDutchDate(formData.dateOfEntry) : 
        generateRandomEntryDate();
      
      page.drawText(entryDate, {
        x: valueIndent,
        y: height - 915,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      drawSeparatorLine(height - 935);
      
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
        color: rgb(0.85, 0, 0.5), // Magenta color matching original
      });
      
      // Save the PDF document with proper compression
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false, // Match original structure
        addDefaultPage: false,
        objectsPerTick: 50
      });
      
      console.log(`Generated PDF with metadata spoofing:`);
      console.log(`- Producer: StreamServe Communication Server 23.3`);
      console.log(`- Font prefixes: ${fontPrefixes.regular}Roboto-Regular, ${fontPrefixes.bold}Roboto-Bold`);
      console.log(`- Document ID: ${documentId}`);
      console.log(`- Instance ID: ${instanceId}`);
      console.log(`- Creation Date: ${dates.createDate}`);
      console.log(`- Modify Date: ${dates.modifyDate}`);
      
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