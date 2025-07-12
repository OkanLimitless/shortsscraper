import { generatePDF, generatePDFWithPuppeteer } from '../../../lib/pdfGenerator';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.json();
    const { searchParams } = new URL(request.url);
    const method = searchParams.get('method') || 'puppeteer'; // Default to Puppeteer
    
    // Validate required fields
    if (!formData.tradeName && !formData.kvkNumber) {
      return NextResponse.json(
        { error: 'Either tradeName or kvkNumber is required' },
        { status: 400 }
      );
    }

    console.log(`Generating PDF using ${method} method...`);
    console.log('Form data:', formData);

    let pdfBytes;
    
    // Choose generation method
    if (method === 'puppeteer') {
      // Use Puppeteer (Chrome's native PDF engine) to avoid library fingerprints
      pdfBytes = await generatePDFWithPuppeteer(formData);
    } else {
      // Use pdf-lib method (legacy)
      pdfBytes = await generatePDF(formData);
    }
    
    // Generate a randomized filename to avoid detection patterns
    const generateRandomFilename = () => {
      const prefixes = [
        'business_register_extract',
        'chamber_commerce_document',
        'kvk_business_extract',
        'netherlands_business_register',
        'official_business_document',
        'company_registration_extract',
        'business_information_document',
        'commercial_register_extract',
        'enterprise_registration_doc',
        'business_registry_certificate'
      ];
      
      const suffixes = [
        'certified',
        'official',
        'verified',
        'authenticated',
        'validated',
        'current',
        'updated',
        'final',
        'complete',
        'authorized'
      ];
      
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      const randomNumber = Math.floor(Math.random() * 90000000) + 10000000;
      const randomCode = Math.random().toString(36).substr(2, 4).toUpperCase();
      
      return `${randomPrefix}_${randomNumber}_${randomCode}_${randomSuffix}.pdf`;
    };
    
    const filename = generateRandomFilename();

    // Add randomized response headers to avoid detection
    const generateRandomHeaders = () => {
      const serverHeaders = [
        'nginx/1.22.1',
        'Apache/2.4.54',
        'Microsoft-IIS/10.0',
        'cloudflare',
        'nginx/1.21.6',
        'Apache/2.4.48',
        'LiteSpeed/6.0.12',
        'OpenResty/1.21.4.1'
      ];
      
      const randomServer = serverHeaders[Math.floor(Math.random() * serverHeaders.length)];
      const randomId = Math.random().toString(36).substr(2, 12);
      const randomSessionId = Math.random().toString(36).substr(2, 16);
      
      return {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': pdfBytes.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Server': randomServer,
        'X-Request-ID': randomId,
        'X-Session-ID': randomSessionId,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      };
    };

    console.log(`Generated PDF successfully - Method: ${method}, Size: ${pdfBytes.length} bytes`);

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