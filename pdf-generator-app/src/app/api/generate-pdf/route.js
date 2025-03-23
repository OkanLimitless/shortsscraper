import { generateHTML } from '../../../lib/htmlGenerator';
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
    
    // Generate the HTML
    const htmlContent = generateHTML(formData);
    
    // Return the HTML content
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': 'inline; filename="kvk_business_register_extract.html"'
      }
    });
  } catch (error) {
    console.error('Error generating HTML:', error);
    return NextResponse.json(
      { error: 'Failed to generate HTML: ' + error.message },
      { status: 500 }
    );
  }
} 