const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

/**
 * PDF Editor for modifying legal documents
 * 
 * This script allows:
 * 1. Loading an existing PDF template
 * 2. Editing form fields if they exist
 * 3. Adding text at specific positions
 * 4. Saving the modified document with a new name
 */
async function editPDF(inputFilePath, outputFilePath, data = {}) {
  try {
    // Ensure output directory exists
    const outputDir = path.dirname(outputFilePath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Read the existing PDF
    const pdfBytes = fs.readFileSync(inputFilePath);
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Get the first page (assuming we're working with a single-page document)
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    
    // Get page dimensions
    const { width, height } = firstPage.getSize();
    console.log(`Page dimensions: ${width} x ${height}`);
    
    // Load a standard font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Handle form fields if they exist
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    console.log(`Found ${fields.length} form fields`);
    
    // Process form fields based on data provided
    fields.forEach(field => {
      const fieldName = field.getName();
      if (data[fieldName]) {
        // Handle different field types
        if (field.constructor.name === 'PDFTextField') {
          const textField = form.getTextField(fieldName);
          textField.setText(data[fieldName]);
        } else if (field.constructor.name === 'PDFCheckBox') {
          const checkBox = form.getCheckBox(fieldName);
          if (data[fieldName] === true) {
            checkBox.check();
          } else {
            checkBox.uncheck();
          }
        } else if (field.constructor.name === 'PDFDropdown') {
          const dropdown = form.getDropdown(fieldName);
          dropdown.select(data[fieldName]);
        } else if (field.constructor.name === 'PDFSignature') {
          // Signature fields typically require more complex handling
          // For now, we'll just log that we found it
          console.log(`Found signature field: ${fieldName}`);
        }
      }
    });
    
    // Add custom text at specific positions
    if (data.customText) {
      for (const item of data.customText) {
        const { text, x, y, size = 12, color = { r: 0, g: 0, b: 0 }, isBold = false } = item;
        const fontToUse = isBold ? boldFont : font;
        
        firstPage.drawText(text, {
          x: x,
          y: y,
          size: size,
          font: fontToUse,
          color: rgb(color.r, color.g, color.b)
        });
      }
    }
    
    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputFilePath, modifiedPdfBytes);
    
    console.log(`Modified PDF saved to: ${outputFilePath}`);
    return { success: true, path: outputFilePath };
  } catch (error) {
    console.error('Error editing PDF:', error);
    return { success: false, error: error.message };
  }
}

// Example usage:
// If running this file directly
if (require.main === module) {
  // Example data to modify in the PDF
  const sampleData = {
    // Form fields (if any)
    Signature1: 'Electronic Signature 1',
    Signature2: 'Electronic Signature 2',
    
    // Custom text to add at specific positions
    customText: [
      { 
        text: 'MODIFIED DOCUMENT', 
        x: 50, 
        y: 750, 
        size: 16, 
        color: { r: 1, g: 0, b: 0 }, 
        isBold: true 
      },
      { 
        text: 'Company: ACME Corporation', 
        x: 50, 
        y: 700, 
        size: 12 
      },
      { 
        text: 'Date: ' + new Date().toLocaleDateString(), 
        x: 50, 
        y: 680, 
        size: 12 
      }
    ]
  };
  
  // Run the editor with the sample data
  const inputPath = './uittreksel_handelsregister_77678303.pdf';
  const outputPath = './output/modified_document.pdf';
  
  editPDF(inputPath, outputPath, sampleData)
    .then(result => {
      if (result.success) {
        console.log('Success! PDF modified and saved.');
      } else {
        console.error('Failed to modify PDF:', result.error);
      }
    });
}

// Export the function for use in other modules
module.exports = { editPDF }; 