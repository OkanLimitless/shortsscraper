import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

/**
 * PDF Generator utility for legal documents
 * Used to modify PDFs based on user input
 */
async function generatePDF(formData) {
  try {
    console.log('Creating a custom KVK extract PDF...');
    return generateCustomPDF(formData);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

/**
 * Generate a custom PDF that looks like the KVK extract
 */
async function generateCustomPDF(formData) {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    
    // Get page dimensions
    const { width, height } = page.getSize();
    console.log(`Page dimensions: ${width} x ${height}`);
    
    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Extract form data
    const {
      tradeName,
      legalForm,
      address,
      kvkNumber,
      activities,
      dateOfIncorporation,
      ownerName,
      ownerDOB
    } = formData;
    
    // Brand colors for KVK
    const kvkBlue = { r: 0.078, g: 0.31, b: 0.439 }; // Dark blue
    const kvkPurple = { r: 0.7, g: 0.0, b: 0.5 }; // Purple for the bottom bar

    // Helper function to draw text
    const drawText = (text, x, y, options = {}) => {
      if (!text) return;
      
      const { 
        size = 10, 
        color = { r: 0, g: 0, b: 0 }, 
        font: useFont = font,
        align = 'left',
        maxWidth = null
      } = options;
      
      // Handle text truncation if needed
      let finalText = text;
      if (maxWidth && useFont.widthOfTextAtSize(text, size) > maxWidth) {
        let truncatedText = text;
        while (useFont.widthOfTextAtSize(truncatedText + '...', size) > maxWidth && truncatedText.length > 0) {
          truncatedText = truncatedText.slice(0, -1);
        }
        finalText = truncatedText + '...';
      }
      
      // Calculate x position for different alignments
      let xPos = x;
      if (align === 'center') {
        xPos = x - useFont.widthOfTextAtSize(finalText, size) / 2;
      } else if (align === 'right') {
        xPos = x - useFont.widthOfTextAtSize(finalText, size);
      }
      
      page.drawText(finalText, {
        x: xPos,
        y: y,
        size,
        font: useFont,
        color: rgb(color.r, color.g, color.b)
      });
      
      return useFont.widthOfTextAtSize(finalText, size);
    };
    
    // Draw horizontal line
    const drawHorizontalLine = (y, startX = 115, endX = width - 115, thickness = 0.5) => {
      page.drawLine({
        start: { x: startX, y },
        end: { x: endX, y },
        thickness,
        color: rgb(0.7, 0.7, 0.7)
      });
    };
    
    // KVK Logo - large blue "KVK" text at the top
    drawText('KVK', 115, 810, {
      size: 48,
      color: kvkBlue,
      font: boldFont
    });
    
    // Title and top section
    drawText('Business Register extract', 115, 710, { 
      size: 20, 
      color: kvkBlue,
      font: boldFont 
    });
    
    drawText('Netherlands Chamber of Commerce', 115, 685, { 
      size: 18, 
      color: kvkBlue,
      font: boldFont 
    });
    
    // Draw first horizontal line
    drawHorizontalLine(650);
    
    // CCI number section
    drawText('CCI number', 115, 630, { font: boldFont });
    drawText(kvkNumber || '77678303', 190, 630);
    
    // Page number
    drawText('Page', 115, 600, { font: boldFont });
    drawText('1 (of 1)', 155, 600);
    
    // Draw second horizontal line
    drawHorizontalLine(580);
    
    // Privacy notice
    const privacyText = "The company / organisation does not want its address details to be used for";
    drawText(privacyText, 400, 560, { align: 'center' });
    const privacyText2 = "unsolicited postal advertising or visits from sales representatives.";
    drawText(privacyText2, 400, 540, { align: 'center' });
    
    // Draw third horizontal line
    drawHorizontalLine(520);
    
    // Company section
    drawText('Company', 115, 500, { font: boldFont });
    drawText('Trade names', 115, 480);
    
    // Company trade name
    drawText(tradeName || 'Diamond Sky Marketing', 300, 480);
    drawText('AdWings', 300, 465);
    
    // Legal form and start date
    drawText('Legal form', 115, 445);
    drawText(`${legalForm} (comparable with One-man business)`, 300, 445);
    
    drawText('Company start date', 115, 425);
    drawText(`${formatDutchDate(dateOfIncorporation)} (registration date: ${formatDutchDate(dateOfIncorporation)})`, 300, 425);
    
    // Activities
    drawText('Activities', 115, 405);
    drawText('SBI-code: 74101 - Communication and graphic design', 300, 405);
    drawText('SBI-code: 6201 - Writing, producing and publishing of software', 300, 385);
    
    // Employees
    drawText('Employees', 115, 365);
    drawText('0', 300, 365);
    
    // Draw fourth horizontal line
    drawHorizontalLine(345);
    
    // Establishment section
    drawText('Establishment', 115, 325, { font: boldFont });
    drawText('Establishment number', 115, 305);
    drawText('000045362920', 300, 305);
    
    drawText('Trade names', 115, 285);
    drawText(tradeName || 'Diamond Sky Marketing', 300, 285);
    drawText('AdWings', 300, 270);
    
    // Visiting address
    drawText('Visiting address', 115, 250);
    drawText(address || 'Spreeuwenhof 81, 7051XJ Varsseveld', 300, 250);
    
    // Date of incorporation (repeated)
    drawText('Date of incorporation', 115, 230);
    drawText(`${formatDutchDate(dateOfIncorporation)} (registration date: ${formatDutchDate(dateOfIncorporation)})`, 300, 230);
    
    // Activities (repeated in establishment section)
    drawText('Activities', 115, 210);
    drawText('SBI-code: 74101 - Communication and graphic design', 300, 210);
    drawText('SBI-code: 6201 - Writing, producing and publishing of software', 300, 190);
    drawText('For further information on activities, see Dutch extract.', 300, 170);
    
    // Employees (repeated)
    drawText('Employees', 115, 150);
    drawText('0', 300, 150);
    
    // Draw fifth horizontal line
    drawHorizontalLine(130);
    
    // Owner section
    drawText('Owner', 115, 110, { font: boldFont });
    drawText('Name', 115, 90);
    drawText(ownerName || 'Piyirici, Okan', 300, 90);
    
    drawText('Date of birth', 115, 70);
    drawText(formatDutchDate(ownerDOB) || '21-01-1994', 300, 70);
    
    drawText('Date of entry into office', 115, 50);
    drawText(`${formatDutchDate(dateOfIncorporation)} (registration date: ${formatDutchDate(dateOfIncorporation)})`, 300, 50);
    
    // Draw final horizontal line
    drawHorizontalLine(30);
    
    // Footer with extraction date
    const currentDate = new Date();
    const dateStr = formatDutchDate(currentDate.toISOString());
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    
    const extractionInfo = `Extract was made on ${dateStr} at ${hours}.${minutes} hours.`;
    drawText(extractionInfo, 400, 10, { align: 'center' });
    
    // Add the watermark section
    // Purple bar at the bottom
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: 20,
      color: rgb(kvkPurple.r, kvkPurple.g, kvkPurple.b),
    });
    
    // Certification text on the left side (small, gray text)
    drawText('WAARMERK', 115, -40, { 
      font: boldFont,
      size: 12,
      color: { r: 0.5, g: 0.5, b: 0.5 }
    });
    
    drawText('KAMER VAN KOOPHANDEL', 115, -53, {
      size: 8,
      color: { r: 0.5, g: 0.5, b: 0.5 }
    });
    
    // Add certification text on the right
    const certText1 = "This extract has been certified with a digital signature and is an official proof of registration in the Business";
    const certText2 = "Register. You can check the integrity of this document and validate the signature in Adobe at the top of your";
    const certText3 = "screen. The Chamber of Commerce recommends that this document be viewed in digital form so that its";
    const certText4 = "integrity is safeguarded and the signature remains verifiable.";

    // Draw certification text paragraphs
    drawText(certText1, 300, -40, { size: 8, color: { r: 0.5, g: 0.5, b: 0.5 } });
    drawText(certText2, 300, -53, { size: 8, color: { r: 0.5, g: 0.5, b: 0.5 } });
    drawText(certText3, 300, -66, { size: 8, color: { r: 0.5, g: 0.5, b: 0.5 } });
    drawText(certText4, 300, -79, { size: 8, color: { r: 0.5, g: 0.5, b: 0.5 } });

    // Date stamp on the right side of the page
    drawText(dateStr, 550, -160, {
      size: 7,
      align: 'right',
      color: { r: 0.5, g: 0.5, b: 0.5 }
    });
    
    drawText(`${hours}.${minutes}`, 550, -145, {
      size: 7,
      align: 'right',
      color: { r: 0.5, g: 0.5, b: 0.5 }
    });
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error('Error generating custom PDF:', error);
    throw new Error(`Failed to generate custom PDF: ${error.message}`);
  }
}

// Helper function to split text into lines of specified length
function splitIntoLines(text, maxCharsPerLine) {
  if (!text) return [];
  
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  words.forEach(word => {
    if ((currentLine + word).length > maxCharsPerLine) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });
  
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }
  
  return lines;
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

export async function POST(request) {
  try {
    console.log('Starting PDF generation process');
    
    // Parse the request body
    const formData = await request.json();
    console.log('Request data received:', JSON.stringify(formData, null, 2));
    
    // Validate the form data
    if (!formData.tradeName || !formData.kvkNumber) {
      console.log('Validation failed: Missing required fields');
      return NextResponse.json(
        { error: 'Trade name and KVK number are required' },
        { status: 400 }
      );
    }
    
    // Generate the PDF
    console.log('Calling PDF generator...');
    const pdfBytes = await generatePDF(formData);
    console.log('PDF generated successfully!');
    
    // Return the PDF as a binary response
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="handelsregister.pdf"'
      }
    });
  } catch (error) {
    console.error('Error in PDF generation API:', error);
    return NextResponse.json(
      { error: `Failed to generate PDF: ${error.message}` },
      { status: 500 }
    );
  }
} 