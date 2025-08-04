const FormData = require('form-data');
const fs = require('fs');

// Use dynamic import for fetch
async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function testVeriftoolsAPI() {
  console.log('=== TESTING VERIFTOOLS API WITH URL GENERATOR ===');
  
  const fetch = await getFetch();
  
  // Import our Veriftools class
  const { VeriftoolsAPI } = await import('./src/lib/veriftools.js');
  
  // Create test data
  const testData = {
    LN: 'TestLastName',
    FN: 'TestFirstName',
    NUMBER: '123456789',
    SEX: 'M',
    DOB: '10.10.1990',
    DOI: '15.12.2020',
    DOE: '15.12.2030',
    NATIONALITY: 'HRVATSKO',
    POB: 'ZAGREB',
    POI: 'PU/ZAGREB',
    BACKGROUND: 'Photo',
    BACKGROUND_NUMBER: '1'
  };
  
  // Create minimal PNG for testing
  const minimalPNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x06, 0x00, 0x00, 0x00, // bit depth: 8, color type: RGBA, compression: 0, filter: 0, interlace: 0
    0x1F, 0x15, 0xC4, 0x89, // IHDR CRC
    0x00, 0x00, 0x00, 0x0A, // IDAT length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x78, 0x9C, 0x62, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
    0x73, 0x75, 0x01, 0x18, // IDAT CRC
    0x00, 0x00, 0x00, 0x00, // IEND length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // IEND CRC
  ]);
  
  // Write test images to temp files
  fs.writeFileSync('/tmp/test-photo.png', minimalPNG);
  fs.writeFileSync('/tmp/test-signature.png', minimalPNG);
  
  const mockImage1 = {
    filepath: '/tmp/test-photo.png',
    originalFilename: 'photo.png',
    mimetype: 'image/png'
  };
  
  const mockImage2 = {
    filepath: '/tmp/test-signature.png',
    originalFilename: 'signature.png',
    mimetype: 'image/png'
  };
  
  try {
    // Initialize Veriftools API with credentials
    const veriftools = new VeriftoolsAPI('multilog24@protonmail.com', 'K7-pk2Xj8wMvXqR');
    
    console.log('Calling generateDocument with URL generator approach...');
    
    // Test the API call
    const result = await veriftools.generateDocument(
      'croatia_passport',
      testData,
      mockImage1,
      mockImage2
    );
    
    console.log('✅ SUCCESS! API call completed');
    console.log('Result:', result);
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    // Clean up temp files
    try {
      fs.unlinkSync('/tmp/test-photo.png');
      fs.unlinkSync('/tmp/test-signature.png');
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

testVeriftoolsAPI().catch(console.error);