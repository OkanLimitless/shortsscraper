import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { NextResponse } from 'next/server';

/**
 * PDF Generator utility for legal documents
 * Used to modify PDFs based on user input
 */
async function generatePDF(formData) {
  try {
    let pdfDoc;
    
    try {
      // Try to fetch the PDF template
      const response = await fetch('/template.pdf');
      const pdfBytes = await response.arrayBuffer();
      // Load the PDF document
      pdfDoc = await PDFDocument.load(pdfBytes);
    } catch (error) {
      console.log('Template not found, creating a blank template');
      // Create a new PDF document if template doesn't exist
      pdfDoc = await PDFDocument.create();
      pdfDoc.addPage([595, 842]); // A4 size
    }
    
    // Get the first page
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    
    // Get page dimensions
    const { width, height } = firstPage.getSize();
    console.log(`Page dimensions: ${width} x ${height}`);
    
    // Load standard fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Define positions for each field
    // These coordinates need to be adjusted based on the actual template
    // The y-coordinate is measured from the bottom of the page
    const positions = {
      tradeName: { x: 170, y: 720 },       // Trade name position
      legalForm: { x: 170, y: 680 },       // Legal form position
      address: { x: 170, y: 640 },         // Address position
      kvkNumber: { x: 170, y: 600 },       // KVK number position
      activities: { x: 170, y: 560 },      // Activities position
      sbiCode1: { x: 170, y: 500 },        // SBI code 1 position
      sbiCode2: { x: 170, y: 480 },        // SBI code 2 position (if applicable)
      dateOfIncorporation: { x: 170, y: 440 }, // Date of incorporation position
      ownerName: { x: 170, y: 400 },       // Owner name position
      ownerDOB: { x: 170, y: 380 },        // Owner date of birth position
      generatedDate: { x: 400, y: 50 }     // Generated date position (bottom right)
    };
    
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
    
    // Mock SBI codes (in a real application, these could be determined from the activities)
    const sbiCodes = [
      '62090 - Other information technology services', 
      '85592 - Business training and coaching'
    ];
    
    // Add text to the PDF
    const addText = (text, position, options = {}) => {
      const { size = 10, color = { r: 0, g: 0, b: 0 }, isBold = false, maxWidth = null } = options;
      const fontToUse = isBold ? boldFont : font;
      
      // If maxWidth is provided and text is longer, we need to truncate or wrap it
      if (maxWidth && fontToUse.widthOfTextAtSize(text, size) > maxWidth) {
        // In this case we'll simply truncate with ellipsis
        // In a more advanced implementation, you could implement text wrapping
        let truncatedText = text;
        while (fontToUse.widthOfTextAtSize(truncatedText + '...', size) > maxWidth && truncatedText.length > 0) {
          truncatedText = truncatedText.slice(0, -1);
        }
        text = truncatedText + (truncatedText.length < text.length ? '...' : '');
      }
      
      firstPage.drawText(text, {
        x: position.x,
        y: position.y,
        size: size,
        font: fontToUse,
        color: rgb(color.r, color.g, color.b)
      });
    };
    
    // Section labels (these would be on the template, but we'll add them for clarity)
    addText('Handelsnaam:', { x: 50, y: positions.tradeName.y }, { isBold: true });
    addText('Rechtsvorm:', { x: 50, y: positions.legalForm.y }, { isBold: true });
    addText('Bezoekadres:', { x: 50, y: positions.address.y }, { isBold: true });
    addText('KVK-nummer:', { x: 50, y: positions.kvkNumber.y }, { isBold: true });
    addText('Activiteiten:', { x: 50, y: positions.activities.y }, { isBold: true });
    addText('SBI-codes:', { x: 50, y: positions.sbiCode1.y }, { isBold: true });
    addText('Oprichtingsdatum:', { x: 50, y: positions.dateOfIncorporation.y }, { isBold: true });
    addText('Eigenaar:', { x: 50, y: positions.ownerName.y }, { isBold: true });
    addText('Geboortedatum:', { x: 50, y: positions.ownerDOB.y }, { isBold: true });
    
    // Add all the field values
    addText(tradeName, positions.tradeName, { size: 12 });
    addText(legalForm, positions.legalForm);
    addText(address, positions.address);
    addText(kvkNumber, positions.kvkNumber);
    
    // Activities might be longer, so we need to handle multi-line text
    const activityLines = splitIntoLines(activities, 50); // 50 chars per line
    activityLines.forEach((line, index) => {
      addText(line, { 
        x: positions.activities.x, 
        y: positions.activities.y - (index * 20) // Adjust Y position for each line
      });
    });
    
    // Add SBI codes
    sbiCodes.forEach((code, index) => {
      const position = index === 0 ? positions.sbiCode1 : positions.sbiCode2;
      addText(code, position);
    });
    
    // Add date of incorporation
    addText(formatDutchDate(dateOfIncorporation), positions.dateOfIncorporation);
    
    // Add owner information
    addText(ownerName, positions.ownerName);
    addText(formatDutchDate(ownerDOB), positions.ownerDOB);
    
    // Add generated date at the bottom
    const currentDate = new Date().toLocaleDateString('nl-NL');
    addText(`Gegenereerd op: ${currentDate}`, positions.generatedDate, { size: 8 });
    
    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    
    return modifiedPdfBytes;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
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
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

export async function POST(request) {
  try {
    // Parse the request body
    const formData = await request.json();
    
    // Validate the form data
    if (!formData.tradeName || !formData.kvkNumber) {
      return NextResponse.json(
        { error: 'Trade name and KVK number are required' },
        { status: 400 }
      );
    }
    
    // Generate the PDF
    const pdfBytes = await generatePDF(formData);
    
    // Return the PDF as a binary response
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="handelsregister.pdf"'
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
} 