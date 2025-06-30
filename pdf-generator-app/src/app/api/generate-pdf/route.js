import { generatePDF } from '../../../lib/pdfGenerator';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.json();
    
    // Validate required fields
    if (!formData.tradeName && !formData.kvkNumber) {
      return NextResponse.json(
        { error: 'Either tradeName or kvkNumber is required' },
        { status: 400 }
      );
    }

    console.log('Generating PDF with enhanced metadata spoofing...');
    console.log('Form data:', formData);

    // Generate PDF with metadata spoofing
    const pdfBytes = await generatePDF(formData);
    
    // Generate a realistic filename
    const kvkNumber = formData.kvkNumber || '77678303';
    const filename = `uittreksel_handelsregister_${kvkNumber}.pdf`;

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': pdfBytes.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    );
  }
} 