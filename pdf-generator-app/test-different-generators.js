const FormData = require('form-data');
const fs = require('fs');

// Use dynamic import for fetch
async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function testDifferentGenerators() {
  console.log('=== TESTING DIFFERENT GENERATOR NAMES ===');
  
  const fetch = await getFetch();
  
  // Import our Veriftools class
  const { VeriftoolsAPI } = await import('./src/lib/veriftools.js');
  
  // Different possible generator names to try
  const generatorNames = [
    'croatia_passport',
    'croatian_passport', 
    'hr_passport',
    'passport_croatia',
    'passport_hr',
    'croatia-passport',
    'croatian-passport',
    'hr-passport',
    'passport-croatia',
    'passport-hr',
    'CROATIA_PASSPORT',
    'CROATIAN_PASSPORT'
  ];
  
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
  
  // Initialize Veriftools API with credentials
  const veriftools = new VeriftoolsAPI('multilog24@protonmail.com', 'K7-pk2Xj8wMvXqR');
  
  for (const generatorName of generatorNames) {
    console.log(`\n--- Testing generator: ${generatorName} ---`);
    
    try {
      const result = await veriftools.generateDocument(
        generatorName,
        testData,
        mockImage1,
        mockImage2
      );
      
      console.log(`✅ SUCCESS with ${generatorName}!`);
      console.log('Result:', result);
      break; // Stop on first success
      
    } catch (error) {
      console.log(`❌ FAILED with ${generatorName}:`, error.message.substring(0, 100));
      
      // If we get a different error (not "generator required"), that's progress
      if (!error.message.includes('generator') && !error.message.includes('This field is required')) {
        console.log('🔍 DIFFERENT ERROR - might be progress!');
        console.log('Full error:', error.message);
      }
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Clean up temp files
  try {
    fs.unlinkSync('/tmp/test-photo.png');
    fs.unlinkSync('/tmp/test-signature.png');
  } catch (e) {
    // Ignore cleanup errors
  }
}

testDifferentGenerators().catch(console.error);