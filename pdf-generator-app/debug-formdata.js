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
  
  // Properly read FormData content
  console.log('\n=== FORMDATA CONTENT ===');
  
  return new Promise((resolve) => {
    let formDataContent = '';
    
    formData.on('data', (chunk) => {
      formDataContent += chunk.toString();
    });
    
    formData.on('end', () => {
      console.log('Length:', formDataContent.length);
      console.log('First 2000 chars:');
      console.log(formDataContent.substring(0, 2000));
      
      // Look for generator field specifically
      if (formDataContent.includes('generator')) {
        console.log('\n✅ GENERATOR FIELD FOUND in FormData');
        const generatorMatch = formDataContent.match(/name="generator"[\s\S]*?croatia_passport/);
        if (generatorMatch) {
          console.log('Generator field content:', generatorMatch[0]);
        }
      } else {
        console.log('\n❌ GENERATOR FIELD NOT FOUND in FormData');
      }
      
      // Look for specific patterns
      console.log('\n=== PATTERN ANALYSIS ===');
      console.log('Contains "generator":', formDataContent.includes('generator'));
      console.log('Contains "croatia_passport":', formDataContent.includes('croatia_passport'));
      console.log('Contains "name="generator"":', formDataContent.includes('name="generator"'));
      
      resolve();
    });
    
    formData.on('error', (err) => {
      console.error('Error reading FormData:', err);
      resolve();
    });
  });
}

debugFormData().catch(console.error);