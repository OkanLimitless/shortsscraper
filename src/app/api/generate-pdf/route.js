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
    let pdfDoc;
    let pdfBytes;
    
    try {
      console.log('Attempting to load PDF template...');
      
      // Try to fetch the template from public path
      try {
        const response = await fetch(new URL('/template.pdf', 'https://shortsscraper.vercel.app'));
        if (!response.ok) {
          throw new Error(`Template fetch failed with status: ${response.status}`);
        }
        pdfBytes = await response.arrayBuffer();
        console.log('Loaded template via fetch successfully!');
      } catch (fetchError) {
        console.error('Fetch loading failed:', fetchError.message);
        // Fall back to direct file loading for local development
        try {
          // In production environments, this will likely fail but that's okay since fetch should work
          const publicPath = path.join(process.cwd(), 'public', 'template.pdf');
          pdfBytes = await fs.readFile(publicPath);
          console.log('Loaded template directly from filesystem!');
        } catch (fsError) {
          console.error('Filesystem loading also failed:', fsError.message);
          console.log('Creating a blank PDF as a fallback...');
          // Create a blank PDF as a last resort
          pdfDoc = await PDFDocument.create();
          pdfDoc.addPage([595, 842]); // A4 size
          console.log('Blank PDF created successfully');
          // Continue with the blank PDF
          return generateCustomPDF(formData);
        }
      }
      
      // If we reach here, we have pdfBytes loaded from some source
      // Load the PDF document
      pdfDoc = await PDFDocument.load(pdfBytes);
      console.log('PDF document loaded successfully!');
      
      // Since we can't easily detect and replace text in the PDF using pdf-lib,
      // we'll create a new document from scratch that looks like the KVK extract
      return generateCustomPDF(formData);
      
    } catch (error) {
      console.error('Error loading template:', error);
      // Final fallback - create a blank PDF
      console.log('Creating a custom PDF after error...');
      return generateCustomPDF(formData);
    }
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
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    
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
    const kvkBlue = { r: 0.19, g: 0.36, b: 0.49 }; // Dark blue
    
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
    const drawHorizontalLine = (y, startX = 50, endX = width - 50, thickness = 0.5) => {
      page.drawLine({
        start: { x: startX, y },
        end: { x: endX, y },
        thickness,
        color: rgb(0.7, 0.7, 0.7)
      });
    };
    
    // Title and top section
    drawText('Business Register extract', 115, 810, { 
      size: 24, 
      color: kvkBlue,
      font: boldFont 
    });
    
    // Company name can be directly under the title or in the top section
    drawText(tradeName || 'Company Name', 400, 770, {
      size: 18,
      font: boldFont,
      align: 'center'
    });
    
    drawText('Netherlands Chamber of Commerce', 115, 780, { 
      size: 18, 
      color: kvkBlue,
      font: boldFont 
    });
    
    // Legal form
    drawText(legalForm || 'Eenmanszaak', 400, 750, {
      size: 14,
      align: 'center'
    });
    
    // Draw first horizontal line
    drawHorizontalLine(730);
    
    // CCI number section
    drawText('CCI number', 115, 710, { font: boldFont });
    drawText(kvkNumber || '00000000', 230, 710);
    
    // Address section (if provided)
    if (address) {
      drawText(address, 400, 710, { align: 'center' });
    }
    
    // Page number
    drawText('Page', 115, 690, { font: boldFont });
    drawText('1 (of 1)', 150, 690);
    
    // Draw second horizontal line
    drawHorizontalLine(670);
    
    // Privacy notice
    const privacyText = "The company / organisation does not want its address details to be used for";
    drawText(privacyText, 400, 645, { align: 'center' });
    const privacyText2 = "unsolicited postal advertising or visits from sales representatives.";
    drawText(privacyText2, 400, 625, { align: 'center' });
    
    // Draw third horizontal line
    drawHorizontalLine(605);
    
    // Company section
    drawText('Company', 115, 585, { font: boldFont });
    drawText('Trade names', 115, 565);
    
    // Company trade name
    drawText(tradeName || 'Company Name', 400, 565);
    
    // Legal form and start date
    drawText('Legal form', 115, 545);
    drawText(`${legalForm} (comparable with One-man business)`, 400, 545);
    
    drawText('Company start date', 115, 525);
    drawText(`${formatDutchDate(dateOfIncorporation)} (registration date: ${formatDutchDate(dateOfIncorporation)})`, 400, 525);
    
    // Activities
    drawText('Activities', 115, 505);
    
    // SBI codes
    drawText('SBI-code: 74101 - Communication and graphic design', 400, 505);
    drawText('SBI-code: 6201 - Writing, producing and publishing of software', 400, 485);
    
    // If activities is provided, list them
    if (activities) {
      const activityLines = splitIntoLines(activities, 50);
      activityLines.forEach((line, index) => {
        if (index === 0) {
          // Use the existing position for the first line
          drawText(line, 400, 465);
        } else {
          // Offset subsequent lines
          drawText(line, 400, 465 - (index * 20));
        }
      });
    }
    
    // Employees
    drawText('Employees', 115, 425);
    drawText('0', 400, 425);
    
    // Draw fourth horizontal line
    drawHorizontalLine(405);
    
    // Establishment section
    drawText('Establishment', 115, 385, { font: boldFont });
    drawText('Establishment number', 115, 365);
    drawText('000045362920', 400, 365);
    
    drawText('Trade names', 115, 345);
    drawText(tradeName || 'Company Name', 400, 345);
    
    // Visiting address
    drawText('Visiting address', 115, 325);
    drawText(address || 'Address not provided', 400, 325);
    
    // Date of incorporation (repeated)
    drawText('Date of incorporation', 115, 305);
    drawText(`${formatDutchDate(dateOfIncorporation)} (registration date: ${formatDutchDate(dateOfIncorporation)})`, 400, 305);
    
    // Activities (repeated in establishment section)
    drawText('Activities', 115, 285);
    drawText('SBI-code: 74101 - Communication and graphic design', 400, 285);
    drawText('SBI-code: 6201 - Writing, producing and publishing of software', 400, 265);
    drawText('For further information on activities, see Dutch extract.', 400, 245);
    
    // Employees (repeated)
    drawText('Employees', 115, 225);
    drawText('0', 400, 225);
    
    // Draw fifth horizontal line
    drawHorizontalLine(205);
    
    // Owner section
    drawText('Owner', 115, 185, { font: boldFont });
    drawText('Name', 115, 165);
    drawText(ownerName || 'Owner name not provided', 400, 165);
    
    drawText('Date of birth', 115, 145);
    drawText(formatDutchDate(ownerDOB) || 'DOB not provided', 400, 145);
    
    drawText('Date of entry into office', 115, 125);
    drawText(`${formatDutchDate(dateOfIncorporation)} (registration date: ${formatDutchDate(dateOfIncorporation)})`, 400, 125);
    
    // Draw final horizontal line
    drawHorizontalLine(105);
    
    // Footer with extraction date
    const currentDate = new Date();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    
    const extractionInfo = `Extract was made on ${formatDutchDate(currentDate.toISOString())} at ${hours}.${minutes} hours.`;
    drawText(extractionInfo, 400, 85, { align: 'center' });
    
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