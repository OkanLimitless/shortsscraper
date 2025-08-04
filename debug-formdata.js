const FormData = require('form-data');

async function debugFormData() {
  console.log('=== DEBUGGING FORMDATA ISSUE ===');
  
  // Create FormData exactly like our app does
  const formData = new FormData();
  
  // Add generator field
  console.log('Adding generator field...');
  formData.append('generator', 'croatia_passport');
  
  // Add some test data
  formData.append('LN', 'TestLastName');
  formData.append('FN', 'TestFirstName');
  
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
  
  formData.append('image1', minimalPNG, {
    filename: 'photo.png',
    contentType: 'image/png'
  });
  formData.append('image2', minimalPNG, {
    filename: 'signature.png',
    contentType: 'image/png'
  });
  
  // Get headers
  const headers = formData.getHeaders();
  console.log('FormData headers:', headers);
  
  // Convert FormData to string to see what's actually being sent
  const formDataString = formData.toString();
  console.log('\n=== FORMDATA CONTENT ===');
  console.log('Length:', formDataString.length);
  console.log('First 2000 chars:');
  console.log(formDataString.substring(0, 2000));
  
  // Look for generator field specifically
  if (formDataString.includes('generator')) {
    console.log('\n✅ GENERATOR FIELD FOUND in FormData');
    const generatorMatch = formDataString.match(/name="generator"[^]*?croatia_passport/);
    if (generatorMatch) {
      console.log('Generator field content:', generatorMatch[0]);
    }
  } else {
    console.log('\n❌ GENERATOR FIELD NOT FOUND in FormData');
  }
  
  // Test with different approaches
  console.log('\n=== TESTING DIFFERENT APPROACHES ===');
  
  // Approach 1: Add generator first
  const formData1 = new FormData();
  formData1.append('generator', 'croatia_passport');
  formData1.append('LN', 'Test');
  console.log('Approach 1 - Generator first:', formData1.toString().includes('generator') ? '✅' : '❌');
  
  // Approach 2: Add generator last
  const formData2 = new FormData();
  formData2.append('LN', 'Test');
  formData2.append('generator', 'croatia_passport');
  console.log('Approach 2 - Generator last:', formData2.toString().includes('generator') ? '✅' : '❌');
  
  // Approach 3: Use different field name
  const formData3 = new FormData();
  formData3.append('generatorSlug', 'croatia_passport');
  formData3.append('LN', 'Test');
  console.log('Approach 3 - Different field name:', formData3.toString().includes('generatorSlug') ? '✅' : '❌');
}

debugFormData().catch(console.error);