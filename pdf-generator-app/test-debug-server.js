const FormData = require('form-data');
const fs = require('fs');

// Use dynamic import for fetch
async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function testDebugServer() {
  console.log('=== TESTING FORMDATA TO DEBUG SERVER ===');
  
  const fetch = await getFetch();
  
  // Create FormData exactly like our app does
  const formData = new FormData();
  
  // Add generator field FIRST
  console.log('Adding generator field...');
  formData.append('generator', 'croatia_passport', { 
    contentType: 'text/plain'
  });
  
  // Add some test data
  formData.append('LN', 'TestLastName');
  formData.append('FN', 'TestFirstName');
  formData.append('SEX', 'M');
  
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
  
  // Add images
  formData.append('image1', minimalPNG, {
    filename: 'photo.png',
    contentType: 'image/png'
  });
  formData.append('image2', minimalPNG, {
    filename: 'signature.png',
    contentType: 'image/png'
  });
  
  try {
    console.log('Sending FormData to debug server...');
    
    const response = await fetch('http://localhost:8080/test', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic test',
        ...formData.getHeaders()
      },
      body: formData
    });
    
    const result = await response.json();
    console.log('Debug server response:', result);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDebugServer().catch(console.error);