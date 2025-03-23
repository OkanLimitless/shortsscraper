import { generatePDF } from '../../../lib/pdfGenerator';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Parse the request body
    const formData = await request.json();
    
    // Validate the form data
    if (!formData.tradeName && !formData.kvkNumber) {
      return NextResponse.json(
        { error: 'Trade name or KVK number is required' },
        { status: 400 }
      );
    }
    
    // Generate the PDF
    const pdfBytes = await generatePDF(formData);
    
    // Return the PDF as a binary response
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="kvk_business_register_extract.pdf"'
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF: ' + error.message },
      { status: 500 }
    );
  }
} 