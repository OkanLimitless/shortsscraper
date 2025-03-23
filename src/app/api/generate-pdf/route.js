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
    
    // Load fonts - use Helvetica which is guaranteed to be available
    console.log('Loading fonts...');
    let fontRegular, fontBold;
    try {
      fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    } catch (fontError) {
      console.error('Error loading preferred fonts, falling back to standard fonts:', fontError);
      // Fallback to Times Roman if Helvetica fails
      fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      fontBold = await pdfDoc.embedFont(StandardFonts.TimesBold);
    }
    console.log('Fonts loaded successfully');
    
    if (!fontRegular || !fontBold) {
      throw new Error('Failed to load fonts');
    }
    
    // Extract form data with defaults
    const tradeName = formData.tradeName || 'Diamond Sky Marketing';
    const legalForm = formData.legalForm || 'Eenmanszaak';
    const address = formData.address || 'Spreeuwenhof 81, 7051XJ Varsseveld';
    const kvkNumber = formData.kvkNumber || '77678303';
    const dateOfIncorporation = formData.dateOfIncorporation || '2020-03-09';
    const ownerName = formData.ownerName || 'Piyirici, Okan';
    const ownerDOB = formData.ownerDOB || '1994-01-21';
    
    console.log('Using data:', { tradeName, legalForm, kvkNumber });
    
    // Pre-format dates to avoid issues
    const formattedIncorporationDate = formatDutchDate(dateOfIncorporation);
    const formattedRegDate = formatDutchDate(dateOfIncorporation);
    const formattedOwnerDOB = formatDutchDate(ownerDOB);
    
    // Brand colors for KVK
    const kvkBlue = { r: 0.16, g: 0.35, b: 0.47 }; // Adjusted dark blue to match example
    const kvkPurple = { r: 0.66, g: 0.11, b: 0.49 }; // Adjusted purple for the bottom bar

    // Helper function to draw text with safe guards
    const drawText = (text, x, y, options = {}) => {
      if (!text) return;
      
      try {
        const { 
          size = 10, 
          color = { r: 0, g: 0, b: 0 }, 
          font = fontRegular,
          align = 'left',
          maxWidth = null
        } = options;
        
        // Safety check for font
        if (!font) {
          console.error('Font is undefined in drawText call');
          return;
        }
        
        // Handle text truncation if needed
        let finalText = text;
        if (maxWidth && font.widthOfTextAtSize(text, size) > maxWidth) {
          let truncatedText = text;
          while (font.widthOfTextAtSize(truncatedText + '...', size) > maxWidth && truncatedText.length > 0) {
            truncatedText = truncatedText.slice(0, -1);
          }
          finalText = truncatedText + '...';
        }
        
        // Calculate x position for different alignments
        let xPos = x;
        if (align === 'center') {
          xPos = x - font.widthOfTextAtSize(finalText, size) / 2;
        } else if (align === 'right') {
          xPos = x - font.widthOfTextAtSize(finalText, size);
        }
        
        page.drawText(finalText, {
          x: xPos,
          y: y,
          size,
          font,
          color: rgb(color.r, color.g, color.b)
        });
        
        return font.widthOfTextAtSize(finalText, size);
      } catch (error) {
        console.error('Error in drawText:', error, { text, x, y, options });
        return 0;
      }
    };
    
    // Draw horizontal line - better spacing, slightly thinner lines
    const drawHorizontalLine = (y, startX = 105, endX = width - 105, thickness = 0.5) => {
      page.drawLine({
        start: { x: startX, y },
        end: { x: endX, y },
        thickness,
        color: rgb(0.85, 0.85, 0.85)
      });
    };
    
    // KVK Logo - large blue "KVK" text at the top
    drawText('KVK', 85, 790, {
      size: 48,
      color: kvkBlue,
      font: fontBold
    });
    
    // Title and top section - center aligned like in the example
    const titleX = width / 2;
    drawText('Business Register extract', titleX, 700, { 
      size: 20, 
      color: kvkBlue,
      font: fontBold,
      align: 'center'
    });
    
    drawText('Netherlands Chamber of Commerce', titleX, 675, { 
      size: 18, 
      color: kvkBlue,
      font: fontBold,
      align: 'center'
    });
    
    // Draw first horizontal line
    drawHorizontalLine(640);
    
    // CCI number section
    drawText('CCI number', 105, 600, { font: fontBold });
    drawText(kvkNumber, 300, 600);
    
    // Page number
    drawText('Page', 105, 575, { font: fontBold });
    drawText('1 (of 1)', 140, 575);
    
    // Draw second horizontal line
    drawHorizontalLine(555, 105, width - 105);
    
    // Privacy notice - center aligned
    const privacyText = "The company / organisation does not want its address details to be used for";
    drawText(privacyText, width/2, 535, { align: 'center' });
    const privacyText2 = "unsolicited postal advertising or visits from sales representatives.";
    drawText(privacyText2, width/2, 515, { align: 'center' });
    
    // Draw third horizontal line
    drawHorizontalLine(495, 105, width - 105);
    
    // Adjust line spacing throughout document
    // Add more whitespace between sections by adjusting y coordinates
    const sectionSpacing = 10;
    
    // Company section - adjust spacing to match example
    drawText('Company', 105, 475, { font: fontBold });
    drawText('Trade names', 105, 455);
    
    // Company trade name
    drawText(tradeName, 300, 455);
    
    // Legal form and start date
    drawText('Legal form', 105, 435);
    drawText(`${legalForm} (comparable with One-man business)`, 300, 435);
    
    drawText('Company start date', 105, 415);
    drawText(`${formattedIncorporationDate} (registration date: ${formattedRegDate})`, 300, 415);
    
    // Activities
    drawText('Activities', 105, 395);
    drawText('SBI-code: 74101 - Communication and graphic design', 300, 395);
    drawText('SBI-code: 6201 - Writing, producing and publishing of software', 300, 375);
    
    // Employees
    drawText('Employees', 105, 355);
    drawText('0', 300, 355);
    
    // Draw fourth horizontal line
    drawHorizontalLine(335, 105, width - 105);
    
    // Establishment section
    drawText('Establishment', 105, 315, { font: fontBold });
    drawText('Establishment number', 105, 295);
    drawText('000045362920', 300, 295);
    
    drawText('Trade names', 105, 275);
    drawText(tradeName, 300, 275);
    
    // Visiting address
    drawText('Visiting address', 105, 255);
    drawText(address, 300, 255);
    
    // Date of incorporation (repeated)
    drawText('Date of incorporation', 105, 235);
    drawText(`${formattedIncorporationDate} (registration date: ${formattedRegDate})`, 300, 235);
    
    // Activities (repeated in establishment section)
    drawText('Activities', 105, 215);
    drawText('SBI-code: 74101 - Communication and graphic design', 300, 215);
    drawText('SBI-code: 6201 - Writing, producing and publishing of software', 300, 195);
    drawText('For further information on activities, see Dutch extract.', 300, 175);
    
    // Employees (repeated)
    drawText('Employees', 105, 155);
    drawText('0', 300, 155);
    
    // Draw fifth horizontal line
    drawHorizontalLine(135, 105, width - 105);
    
    // Owner section
    drawText('Owner', 105, 115, { font: fontBold });
    drawText('Name', 105, 95);
    drawText(ownerName, 300, 95);
    
    drawText('Date of birth', 105, 75);
    drawText(formattedOwnerDOB, 300, 75);
    
    drawText('Date of entry into office', 105, 55);
    drawText(`${formattedIncorporationDate} (registration date: ${formattedRegDate})`, 300, 55);
    
    // Draw final horizontal line
    drawHorizontalLine(35, 105, width - 105);
    
    // Add extraction date at the bottom like in the example (not in the middle)
    const currentDate = new Date();
    const dateStr = formatDutchDate(currentDate.toISOString());
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    
    // Move extraction date to match example (at the bottom before the certification text)
    const extractionInfo = `Extract was made on ${dateStr} at ${hours}.${minutes} hours.`;
    drawText(extractionInfo, 105, 120, { align: 'left' });
    
    // Date stamp on the right side of the page - vertical, near the bottom
    const formattedDateStr = currentDate.toISOString().split('T')[0].split('-').reverse().join('-');
    const verticalDateStr = `${formattedDateStr} ${hours}.${minutes}`;
    page.drawText(verticalDateStr, {
      x: 880,
      y: 90,
      size: 7,
      color: rgb(0.5, 0.5, 0.5),
      rotate: {
        type: 'degrees',
        angle: 90,
      },
    });
    
    // Create more space between the data and the watermark
    const extraSpace = 15; // Add extra space
    
    // Add the watermark section - leave enough space for the watermark
    // Purple bar at the bottom
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: 22,
      color: rgb(kvkPurple.r, kvkPurple.g, kvkPurple.b),
    });
    
    // Bottom section with certified text
    // WAARMERK text on the bottom left, just above the watermark
    drawText('WAARMERK', 105, 75, { 
      font: fontBold,
      size: 12,
      color: { r: 0.5, g: 0.5, b: 0.5 }
    });
    
    drawText('KAMER VAN KOOPHANDEL', 105, 62, {
      size: 8,
      color: { r: 0.5, g: 0.5, b: 0.5 }
    });
    
    // Add certification text at the bottom right
    const certText1 = "This extract has been certified with a digital signature and is an official proof of registration in the Business";
    const certText2 = "Register. You can check the integrity of this document and validate the signature in Adobe at the top of your";
    const certText3 = "screen. The Chamber of Commerce recommends that this document be viewed in digital form so that its";
    const certText4 = "integrity is safeguarded and the signature remains verifiable.";

    // Draw certification text paragraphs - positioned just above the purple bar
    drawText(certText1, 280, 75, { size: 8, color: { r: 0.5, g: 0.5, b: 0.5 } });
    drawText(certText2, 280, 62, { size: 8, color: { r: 0.5, g: 0.5, b: 0.5 } });
    drawText(certText3, 280, 49, { size: 8, color: { r: 0.5, g: 0.5, b: 0.5 } });
    drawText(certText4, 280, 36, { size: 8, color: { r: 0.5, g: 0.5, b: 0.5 } });
    
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
    // Check if date is valid before formatting
    if (isNaN(date.getTime())) {
      console.warn('Invalid date provided:', dateString);
      return '';
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
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