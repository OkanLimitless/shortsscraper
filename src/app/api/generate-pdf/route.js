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
          return generateBlankPDF(formData, pdfDoc);
        }
      }
      
      // If we reach here, we have pdfBytes loaded from some source
      // Load the PDF document
      pdfDoc = await PDFDocument.load(pdfBytes);
      console.log('PDF document loaded successfully!');
    } catch (error) {
      console.error('Error loading template:', error);
      // Final fallback - create a blank PDF
      console.log('Creating a blank PDF after error...');
      pdfDoc = await PDFDocument.create();
      pdfDoc.addPage([595, 842]); // A4 size
      return generateBlankPDF(formData, pdfDoc);
    }
    
    // Continue with template-based PDF generation
    // Get the first page
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    
    // Get page dimensions for reference
    const { width, height } = firstPage.getSize();
    console.log(`Page dimensions: ${width} x ${height}`);
    
    // Load standard fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Define positions for each field
    // These coordinates need to be adjusted based on the actual KVK template
    // The y-coordinate is measured from the bottom of the page
    // These values should be carefully calibrated to match the template
    const positions = {
      // Legal entity information
      tradeName: { x: 140, y: 700 },      // Handelsnaam
      legalForm: { x: 140, y: 665 },      // Rechtsvorm
      address: { x: 140, y: 630 },        // Vestigingsadres
      kvkNumber: { x: 140, y: 590 },      // KVK-number
      
      // Activities section
      activities: { x: 140, y: 550 },     // Main activities description
      sbiCode1: { x: 140, y: 520 },       // SBI code 1
      sbiCode2: { x: 140, y: 505 },       // SBI code 2 (if applicable)
      
      // Dates section
      dateOfIncorporation: { x: 200, y: 470 }, // Datum inschrijving
      
      // Owner information
      ownerName: { x: 140, y: 430 },      // Eigenaar naam 
      ownerDOB: { x: 140, y: 405 },       // Geboortedatum
      
      // Footer generation info
      generatedDate: { x: 400, y: 50 }    // Gegenereerd op datum
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
    
    // Generate SBI codes (in a real application, these would be determined by the activities)
    // For demo purposes, we use fixed codes that are commonly used for businesses
    const sbiCodes = [
      '62012 - Advisering op het gebied van informatietechnologie',
      '85592 - Bedrijfsopleiding en -training'
    ];
    
    // Add text to the PDF
    const addText = (text, position, options = {}) => {
      if (!text) return; // Skip empty fields
      
      const { 
        size = 10, 
        color = { r: 0, g: 0, b: 0 }, 
        isBold = false, 
        maxWidth = null,
        align = 'left' 
      } = options;
      
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
      
      // Draw white rectangle behind text to cover existing content
      firstPage.drawRectangle({
        x: position.x - 2,
        y: position.y - 2,
        width: fontToUse.widthOfTextAtSize(text, size) + 4,
        height: size + 4,
        color: rgb(1, 1, 1), // White
        opacity: 0.9,
      });
      
      firstPage.drawText(text, {
        x: position.x,
        y: position.y,
        size: size,
        font: fontToUse,
        color: rgb(color.r, color.g, color.b)
      });
    };
    
    // Add all the field values - only overwrite what's necessary
    addText(tradeName, positions.tradeName, { size: 12, isBold: true });
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
    throw new Error(`Failed to generate PDF: ${error.message}`);
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

/**
 * Alternative PDF generator that creates a PDF from scratch
 * Used as a fallback when template loading fails
 */
async function generateBlankPDF(formData, pdfDoc) {
  try {
    // Get the first page
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    
    // Get page dimensions for reference
    const { width, height } = firstPage.getSize();
    console.log(`Blank PDF dimensions: ${width} x ${height}`);
    
    // Load standard fonts
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
    
    // Add title to the PDF
    firstPage.drawText('UITTREKSEL HANDELSREGISTER KAMER VAN KOOPHANDEL', {
      x: 50,
      y: 800,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0)
    });
    
    // Draw lines for headers
    firstPage.drawLine({
      start: { x: 50, y: 780 },
      end: { x: 545, y: 780 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    
    // Add field labels and values
    const fields = [
      { label: 'Handelsnaam:', value: tradeName, y: 750 },
      { label: 'KVK-nummer:', value: kvkNumber, y: 730 },
      { label: 'Rechtsvorm:', value: legalForm, y: 710 },
      { label: 'Bezoekadres:', value: address, y: 690 },
      { label: 'Datum van inschrijving:', value: formatDutchDate(dateOfIncorporation), y: 670 },
      { label: 'Eigenaar:', value: ownerName, y: 650 },
      { label: 'Geboortedatum eigenaar:', value: formatDutchDate(ownerDOB), y: 630 }
    ];
    
    // Draw field labels and values
    fields.forEach(field => {
      // Draw label
      firstPage.drawText(field.label, {
        x: 50,
        y: field.y,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
      
      // Draw value
      if (field.value) {
        firstPage.drawText(field.value, {
          x: 200,
          y: field.y,
          size: 12,
          font: font,
          color: rgb(0, 0, 0)
        });
      }
    });
    
    // Add activities header
    firstPage.drawText('Activiteiten (SBI):', {
      x: 50,
      y: 600,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0)
    });
    
    // Add activities
    if (activities) {
      const activityLines = splitIntoLines(activities, 50);
      activityLines.forEach((line, index) => {
        firstPage.drawText(line, {
          x: 50,
          y: 580 - (index * 20),
          size: 10,
          font: font,
          color: rgb(0, 0, 0)
        });
      });
    }
    
    // Add SBI codes
    const sbiCodes = [
      '62012 - Advisering op het gebied van informatietechnologie',
      '85592 - Bedrijfsopleiding en -training'
    ];
    
    sbiCodes.forEach((code, index) => {
      firstPage.drawText(code, {
        x: 50,
        y: 520 - (index * 20),
        size: 10,
        font: font,
        color: rgb(0, 0, 0)
      });
    });
    
    // Add footer
    const currentDate = new Date().toLocaleDateString('nl-NL');
    firstPage.drawText(`Gegenereerd op: ${currentDate}`, {
      x: 50,
      y: 50,
      size: 8,
      font: font,
      color: rgb(0, 0, 0)
    });
    
    // Add watermark
    firstPage.drawText('Dit is een voorbeeld document (generated by KVK Document Generator)', {
      x: 50,
      y: 20,
      size: 8,
      font: font,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    
    return modifiedPdfBytes;
  } catch (error) {
    console.error('Error generating blank PDF:', error);
    throw new Error(`Failed to generate blank PDF: ${error.message}`);
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