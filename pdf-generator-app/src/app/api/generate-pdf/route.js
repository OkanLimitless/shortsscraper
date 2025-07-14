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

    console.log('Generating PDF using pdf-lib method...');
    console.log('Form data:', formData);

    // Generate PDF using pdf-lib with advanced anti-detection features
    const pdfBytes = await generatePDF(formData);
    
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
        'handelsregister_uittreksel',
        'bedrijfsregistratie_document',
        'kamer_van_koophandel_extract'
      ];
      
      const suffixes = [
        'official',
        'certified',
        'verified',
        'authentic',
        'registration',
        'extract',
        'document'
      ];
      
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      const kvkPart = formData.kvkNumber || Math.floor(Math.random() * 90000000 + 10000000).toString();
      
      return `${prefix}_${kvkPart}_${suffix}.pdf`;
    };

    const generateRandomHeaders = () => {
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ];
      
      const servers = [
        'nginx/1.18.0 (Ubuntu)',
        'Apache/2.4.52 (Ubuntu)',
        'Microsoft-IIS/10.0',
        'cloudflare',
        'nginx/1.20.2'
      ];
      
      return {
        'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
        'Server': servers[Math.floor(Math.random() * servers.length)],
        'X-Powered-By': Math.random() > 0.5 ? 'PHP/8.1.2' : 'ASP.NET',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
    };

    const filename = generateRandomFilename();
    const randomHeaders = generateRandomHeaders();
    
    console.log(`Generated PDF successfully - Size: ${pdfBytes.length} bytes`);
    
    // Return PDF with randomized headers and filename
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBytes.length.toString(),
        ...randomHeaders
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