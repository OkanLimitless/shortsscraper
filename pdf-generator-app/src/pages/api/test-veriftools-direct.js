export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password, generatorSlug } = req.body;

    if (!username || !password || !generatorSlug) {
      return res.status(400).json({ 
        error: 'Missing required fields: username, password, generatorSlug' 
      });
    }

    console.log('=== DIRECT VERIFTOOLS TEST ===');
    console.log('Username:', username);
    console.log('Generator slug:', generatorSlug);

    // Create credentials
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    console.log('Credentials created');

    // Test 0: Basic connectivity test - try different base URLs
    console.log('=== TEST 0: BASIC CONNECTIVITY ===');
    const baseUrls = [
      'https://api.veriftools.net/',
      'https://api.veriftools.com/',
      'https://veriftools.net/api/',
      'https://veriftools.com/api/',
      'https://api.veriftools.com/api/schema/swagger-ui/'
    ];

    for (const baseUrl of baseUrls) {
      try {
        console.log(`Testing base URL: ${baseUrl}`);
        const baseResponse = await fetch(baseUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'KVK-Generator/1.0'
          }
        });
        console.log(`${baseUrl} - Status:`, baseResponse.status);
        console.log(`${baseUrl} - Content-Type:`, baseResponse.headers.get('content-type'));
        
        const baseText = await baseResponse.text();
        if (baseText.includes('API') || baseText.includes('swagger') || baseText.includes('openapi')) {
          console.log(`${baseUrl} - Looks like API documentation:`, baseText.substring(0, 300));
        } else {
          console.log(`${baseUrl} - Regular website:`, baseText.substring(0, 200));
        }
      } catch (baseError) {
        console.error(`${baseUrl} - Failed:`, baseError.message);
      }
    }

    // Test 1: Try to list available generators
    console.log('=== TEST 1: LIST AVAILABLE GENERATORS ===');
    try {
      const listUrls = [
        'https://api.veriftools.com/api/integration/generators/',
        'https://api.veriftools.com/api/integration/generator-list/',
        'https://api.veriftools.com/api/integration/',
        'https://api.veriftools.com/api/'
      ];

      for (const url of listUrls) {
        console.log(`Trying list URL: ${url}`);
        try {
          const listResponse = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Content-Type': 'application/json',
              'User-Agent': 'KVK-Generator/1.0'
            }
          });

          console.log(`${url} - Status:`, listResponse.status);
          console.log(`${url} - Content-Type:`, listResponse.headers.get('content-type'));
          
          if (listResponse.headers.get('content-type')?.includes('application/json')) {
            const data = await listResponse.text();
            console.log(`${url} - JSON Response:`, data.substring(0, 1000));
          }
        } catch (error) {
          console.log(`${url} - Error:`, error.message);
        }
      }
    } catch (error) {
      console.error('List generators failed:', error);
    }

    // Test 2: Try different Croatian passport generator slugs
    console.log('=== TEST 2: GET GENERATOR INFO ===');
    try {
      const possibleSlugs = [
        'croatia-passport',
        'croatian-passport', 
        'croatia_passport',
        'croatian_passport',
        'hr-passport',
        'hr_passport',
        'passport-croatia',
        'passport_croatia'
      ];

      let foundSlug = null;
      const baseUrl = 'https://api.veriftools.com/api/integration/generator-information/';

      for (const slug of possibleSlugs) {
        console.log(`Trying generator slug: ${slug}`);
        try {
          const response = await fetch(`${baseUrl}${slug}/`, {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Content-Type': 'application/json',
              'User-Agent': 'KVK-Generator/1.0'
            }
          });

          console.log(`${slug} - Status:`, response.status);
          
          if (response.status === 200) {
            const data = await response.json();
            console.log(`SUCCESS: Found working slug "${slug}":`, JSON.stringify(data, null, 2));
            foundSlug = slug;
            break;
          } else if (response.status === 404) {
            console.log(`${slug} - Not found (404)`);
          } else {
            const errorText = await response.text();
            console.log(`${slug} - Error ${response.status}:`, errorText.substring(0, 200));
          }
        } catch (error) {
          console.log(`${slug} - Request failed:`, error.message);
        }
      }

      if (!foundSlug) {
        console.log('No working Croatian passport generator slug found');
      }
    } catch (infoError) {
      console.error('Generator info test failed:', infoError);
    }

    // Test 3: Try to generate a document with images
    console.log('=== TEST 3: GENERATE DOCUMENT WITH IMAGES ===');
    try {
      const formData = new FormData();
      formData.append('generator', generatorSlug); // Use 'generator' not 'generator_slug'
      
      // Use the correct field names as discovered from the API response
      formData.append('LN', 'TestSurname');        // Last Name
      formData.append('FN', 'TestName');           // First Name
      formData.append('NUMBER', '123456789');      // Document Number
      formData.append('SEX', 'M');                 // Sex
      formData.append('DOB', '01.01.1990');        // Date of Birth
      formData.append('DOI', '15.12.2020');        // Date of Issue
      formData.append('DOE', '15.12.2030');        // Date of Expiry
      formData.append('NATIONALITY', 'HRVATSKO');  // Nationality
      formData.append('POB', 'ZAGREB');            // Place of Birth
      formData.append('POI', 'PU/ZAGREB');         // Place of Issue

      // Create minimal placeholder images (1x1 pixel PNG)
      const minimalPNG = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // RGB, no compression
        0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
        0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // minimal data
        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND
      ]);

      // Add required images based on the API response
      formData.append('image1', new Blob([minimalPNG], { type: 'image/png' }), 'photo.png');
      formData.append('image2', new Blob([minimalPNG], { type: 'image/png' }), 'signature.png');

      console.log('Making generate request with images...');
      const generateResponse = await fetch('https://api.veriftools.com/api/integration/generate/', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'User-Agent': 'KVK-Generator/1.0'
        },
        body: formData
      });

      console.log('Generate response status:', generateResponse.status);
      console.log('Generate response headers:', Object.fromEntries(generateResponse.headers.entries()));

      const contentType = generateResponse.headers.get('content-type');
      console.log('Generate response content-type:', contentType);
      
      if (generateResponse.ok) {
        if (contentType && contentType.includes('application/json')) {
          const generateData = await generateResponse.json();
          console.log('Generate success:', generateData);
          return res.status(200).json({
            success: true,
            message: 'Direct API test successful with images',
            generateResult: generateData
          });
        } else {
          const textData = await generateResponse.text();
          console.log('Generate returned non-JSON success:', textData.substring(0, 1000));
          return res.status(200).json({
            success: false,
            message: 'Generate returned non-JSON response',
            responseText: textData.substring(0, 500)
          });
        }
      } else {
        const errorText = await generateResponse.text();
        console.log('Generate error:', errorText.substring(0, 1000));
        return res.status(200).json({
          success: false,
          message: 'Generate request failed',
          status: generateResponse.status,
          error: errorText.substring(0, 500)
        });
      }
    } catch (generateError) {
      console.error('Generate request failed:', generateError);
      return res.status(200).json({
        success: false,
        message: 'Generate request exception',
        error: generateError.message,
        stack: generateError.stack
      });
    }

  } catch (error) {
    console.error('Direct Veriftools test failed:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}