const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function analyzePDF() {
  try {
    // Read the existing PDF
    const pdfBytes = fs.readFileSync('./uittreksel_handelsregister_77678303.pdf');
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Get information about the PDF
    const pageCount = pdfDoc.getPageCount();
    console.log(`PDF has ${pageCount} pages`);
    
    // Check if the PDF has form fields
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    if (fields.length === 0) {
      console.log('PDF does not contain any form fields.');
      console.log('We will need to add text at specific positions.');
    } else {
      console.log(`PDF contains ${fields.length} form fields:`);
      
      // List all form fields
      fields.forEach((field, index) => {
        const type = field.constructor.name;
        const name = field.getName();
        console.log(`Field ${index + 1}: Name = "${name}", Type = ${type}`);
      });
    }
  } catch (error) {
    console.error('Error analyzing PDF:', error);
  }
}

analyzePDF(); 