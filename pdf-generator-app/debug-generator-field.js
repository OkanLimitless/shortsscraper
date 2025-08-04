const FormData = require('form-data');

// Use dynamic import for fetch in Node.js
async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function testGeneratorField() {
  console.log('=== TESTING DIFFERENT GENERATOR FIELD APPROACHES ===');
  
  const fetch = await getFetch();
  const credentials = 'bXVsdGlsb2cyNEBwcm90b21tYWlsLmNvbTpLNy1wazJYajh3TXZYcVI=';
  const baseURL = 'https://api.veriftools.com';
  
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

  const approaches = [
    {
      name: 'Approach 1: generator field first',
      setup: (formData) => {
        formData.append('generator', 'croatia_passport');
        formData.append('LN', 'Test');
        formData.append('FN', 'Test');
      }
    },
    {
      name: 'Approach 2: generatorSlug field',
      setup: (formData) => {
        formData.append('generatorSlug', 'croatia_passport');
        formData.append('LN', 'Test');
        formData.append('FN', 'Test');
      }
    },
    {
      name: 'Approach 3: document_type field',
      setup: (formData) => {
        formData.append('document_type', 'croatia_passport');
        formData.append('LN', 'Test');
        formData.append('FN', 'Test');
      }
    },
    {
      name: 'Approach 4: type field',
      setup: (formData) => {
        formData.append('type', 'croatia_passport');
        formData.append('LN', 'Test');
        formData.append('FN', 'Test');
      }
    },
    {
      name: 'Approach 5: template field',
      setup: (formData) => {
        formData.append('template', 'croatia_passport');
        formData.append('LN', 'Test');
        formData.append('FN', 'Test');
      }
    },
    {
      name: 'Approach 6: URL parameter instead of form field',
      setup: (formData) => {
        formData.append('LN', 'Test');
        formData.append('FN', 'Test');
      },
      url: '/api/integration/generate/croatia_passport'
    },
    {
      name: 'Approach 7: JSON in body instead of FormData',
      setup: null,
      isJSON: true
    }
  ];

  for (const approach of approaches) {
    console.log(`\n--- ${approach.name} ---`);
    
    try {
      if (approach.isJSON) {
        // Test JSON approach
        const response = await fetch(`${baseURL}/api/integration/generate/`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            generator: 'croatia_passport',
            LN: 'Test',
            FN: 'Test'
          })
        });
        
        console.log('Status:', response.status);
        const responseText = await response.text();
        console.log('Response:', responseText.substring(0, 200));
        
      } else {
        // Test FormData approach
        const formData = new FormData();
        
        if (approach.setup) {
          approach.setup(formData);
        }
        
        // Add minimal images
        formData.append('image1', minimalPNG, {
          filename: 'photo.png',
          contentType: 'image/png'
        });
        formData.append('image2', minimalPNG, {
          filename: 'signature.png',
          contentType: 'image/png'
        });
        
        const url = approach.url ? `${baseURL}${approach.url}` : `${baseURL}/api/integration/generate/`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            ...formData.getHeaders()
          },
          body: formData
        });
        
        console.log('Status:', response.status);
        const responseText = await response.text();
        console.log('Response:', responseText.substring(0, 200));
      }
      
    } catch (error) {
      console.log('Error:', error.message);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testGeneratorField().catch(console.error);