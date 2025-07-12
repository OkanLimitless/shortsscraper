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
    
    // Generate a randomized filename to avoid detection patterns
    const generateRandomFilename = () => {
      const prefixes = [
        'uittreksel_handelsregister',
        'business_register_extract',
        'kvk_extract',
        'chamber_commerce_extract',
        'handelsregister_uittreksel',
        'bedrijfsregistratie',
        'official_extract',
        'register_extract'
      ];
      
      const suffixes = [
        'certified',
        'official',
        'verified',
        'authenticated',
        'document',
        'final',
        'current',
        'updated'
      ];
      
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      const randomNumber = Math.floor(Math.random() * 90000000) + 10000000;
      
      return `${randomPrefix}_${randomNumber}_${randomSuffix}.pdf`;
    };
    
    const filename = generateRandomFilename();

    // Add randomized response headers to avoid detection
    const generateRandomHeaders = () => {
      const serverHeaders = [
        'nginx/1.18.0',
        'Apache/2.4.41',
        'Microsoft-IIS/10.0',
        'cloudflare',
        'nginx/1.20.1',
        'Apache/2.4.52'
      ];
      
      const randomServer = serverHeaders[Math.floor(Math.random() * serverHeaders.length)];
      const randomId = Math.random().toString(36).substr(2, 9);
      
      return {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': pdfBytes.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Server': randomServer,
        'X-Request-ID': randomId,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN'
      };
    };

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: generateRandomHeaders(),
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    );
  }
} 