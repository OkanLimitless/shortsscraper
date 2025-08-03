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
      // ITERATION 2: Use EXACT data from the working API response
      const testData = {
        'LN': 'DOE',                // EXACT from API example
        'FN': 'JOHN',               // EXACT from API example
        'NUMBER': '123456789',      // EXACT from API example
        'SEX': 'M',                 // EXACT from API example
        'DOB': '16.10.1986',        // EXACT from API example
        'DOI': '15.12.2020',        // EXACT from API example
        'DOE': '15.12.2030',        // EXACT from API example
        'NATIONALITY': 'HRVATSKO',  // EXACT from API example
        'POB': 'ZAGREB',            // EXACT from API example
        'POI': 'PU/ZAGREB',         // EXACT from API example
        'BACKGROUND': 'Photo',      // EXACT from API example
        'BACKGROUND_NUMBER': '1'    // EXACT from API example
      };

      console.log('=== SENDING TEST DATA ===');
      Object.keys(testData).forEach(key => {
        console.log(`${key}: "${testData[key]}"`);
        formData.append(key, testData[key]);
      });

      // Load actual test images
      const fs = require('fs');
      const path = require('path');
      
      const photoPath = path.join(process.cwd(), 'public', 'test-images', 'test-photo.png');
      const signaturePath = path.join(process.cwd(), 'public', 'test-images', 'test-signature.png');
      
      console.log('Loading test images...');
      console.log('Photo path:', photoPath);
      console.log('Signature path:', signaturePath);
      
      const photoBuffer = fs.readFileSync(photoPath);
      const signatureBuffer = fs.readFileSync(signaturePath);
      
      console.log('Photo buffer size:', photoBuffer.length);
      console.log('Signature buffer size:', signatureBuffer.length);

      // Add actual test images
      formData.append('image1', new Blob([photoBuffer], { type: 'image/png' }), 'test-photo.png');
      formData.append('image2', new Blob([signatureBuffer], { type: 'image/png' }), 'test-signature.png');

      console.log('Making generate request with images...');
      
      // Use exact same headers as the working generator-information request
      const headers = {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9'
      };
      
      console.log('Using headers:', headers);
      
      const generateResponse = await fetch('https://api.veriftools.com/api/integration/generate/', {
        method: 'POST',
        headers: headers,
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
        console.log('Generate error (full):', errorText);
        
        // Try to extract more specific error information
        const htmlMatch = errorText.match(/<body[^>]*>(.*?)<\/body>/s);
        const bodyContent = htmlMatch ? htmlMatch[1].trim() : errorText;
        
        console.log('Error body content:', bodyContent);
        
        // Don't return here - continue with other tests
        console.log('Generate failed, continuing with other tests...');
      }
          } catch (generateError) {
        console.error('Generate request failed:', generateError);
        console.log('Generate exception, continuing with other tests...');
      }

    // === TEST 4: CHECK ACCOUNT BALANCE ===
    console.log('=== TEST 4: CHECK ACCOUNT BALANCE ===');
    try {
      const balanceResponse = await fetch('https://api.veriftools.com/api/integration/balance/', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'User-Agent': 'KVK-Generator/1.0'
        }
      });

      console.log('Balance response status:', balanceResponse.status);
      console.log('Balance response headers:', Object.fromEntries(balanceResponse.headers.entries()));

      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        console.log('Account balance:', balanceData);
      } else {
        const balanceError = await balanceResponse.text();
        console.log('Balance check failed:', balanceError);
      }
    } catch (balanceError) {
      console.error('Balance check exception:', balanceError);
    }

    // === TEST 5: TRY DIFFERENT GENERATE APPROACH ===
    console.log('=== TEST 5: TRY MINIMAL GENERATE REQUEST ===');
    try {
      // Try with just the most basic required fields
      const minimalFormData = new FormData();
      minimalFormData.append('generator', generatorSlug);
      
             // ITERATION 2: Use EXACT API example data without BACKGROUND fields
       minimalFormData.append('LN', 'DOE');
       minimalFormData.append('FN', 'JOHN');
       minimalFormData.append('NUMBER', '123456789');
       minimalFormData.append('SEX', 'M');
       minimalFormData.append('DOB', '16.10.1986');  // EXACT from API
       minimalFormData.append('DOI', '15.12.2020');
       minimalFormData.append('DOE', '15.12.2030');
       minimalFormData.append('NATIONALITY', 'HRVATSKO');
       minimalFormData.append('POB', 'ZAGREB');
       minimalFormData.append('POI', 'PU/ZAGREB');
      
             // Add images (reuse the buffers from earlier)
       const fs = require('fs');
       const path = require('path');
       const photoPath2 = path.join(process.cwd(), 'public', 'test-images', 'test-photo.png');
       const signaturePath2 = path.join(process.cwd(), 'public', 'test-images', 'test-signature.png');
       const photoBuffer2 = fs.readFileSync(photoPath2);
       const signatureBuffer2 = fs.readFileSync(signaturePath2);
       
       minimalFormData.append('image1', new Blob([photoBuffer2], { type: 'image/png' }), 'photo.png');
       minimalFormData.append('image2', new Blob([signatureBuffer2], { type: 'image/png' }), 'signature.png');

      console.log('Making minimal generate request...');
      const minimalResponse = await fetch('https://api.veriftools.com/api/integration/generate/', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'User-Agent': 'KVK-Generator/1.0'
        },
        body: minimalFormData
      });

      console.log('Minimal generate response status:', minimalResponse.status);
      console.log('Minimal generate response headers:', Object.fromEntries(minimalResponse.headers.entries()));

      if (minimalResponse.ok) {
        const minimalData = await minimalResponse.json();
        console.log('Minimal generate SUCCESS:', minimalData);
        return res.status(200).json({
          success: true,
          message: 'Minimal generate request successful',
          result: minimalData
        });
      } else {
        const minimalError = await minimalResponse.text();
        console.log('Minimal generate failed:', minimalError);
      }
    } catch (minimalError) {
      console.error('Minimal generate exception:', minimalError);
    }

    // === TEST 6: CHECK PAY-FOR-RESULT ENDPOINT ===
    console.log('=== TEST 6: CHECK PAY-FOR-RESULT ENDPOINT ===');
    try {
      // Try to understand the pay-for-result workflow
      const payFormData = new FormData();
      payFormData.append('task_id', 'test-task-id'); // This will fail but might give us info
      
      const payResponse = await fetch('https://api.veriftools.com/api/integration/pay-for-result/', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Accept': 'application/json'
        },
        body: payFormData
      });

      console.log('Pay-for-result response status:', payResponse.status);
      console.log('Pay-for-result response headers:', Object.fromEntries(payResponse.headers.entries()));

      const payResponseText = await payResponse.text();
      console.log('Pay-for-result response:', payResponseText.substring(0, 500));
    } catch (payError) {
      console.error('Pay-for-result test exception:', payError);
    }

    // === TEST 7: TRY WITHOUT BACKGROUND FIELDS ===
    console.log('=== TEST 7: TRY WITHOUT BACKGROUND FIELDS ===');
    try {
      const noBgFormData = new FormData();
      noBgFormData.append('generator', generatorSlug);
      
      // Only the core fields - NO BACKGROUND fields
      noBgFormData.append('LN', 'DOE');
      noBgFormData.append('FN', 'JOHN');
      noBgFormData.append('NUMBER', '123456789');
      noBgFormData.append('SEX', 'M');
      noBgFormData.append('DOB', '16.10.1986');
      noBgFormData.append('DOI', '15.12.2020');
      noBgFormData.append('DOE', '15.12.2030');
      noBgFormData.append('NATIONALITY', 'HRVATSKO');
      noBgFormData.append('POB', 'ZAGREB');
      noBgFormData.append('POI', 'PU/ZAGREB');
      
      // Add images
      const photoPath3 = path.join(process.cwd(), 'public', 'test-images', 'test-photo.png');
      const signaturePath3 = path.join(process.cwd(), 'public', 'test-images', 'test-signature.png');
      const photoBuffer3 = fs.readFileSync(photoPath3);
      const signatureBuffer3 = fs.readFileSync(signaturePath3);
      
      noBgFormData.append('image1', new Blob([photoBuffer3], { type: 'image/png' }), 'photo.png');
      noBgFormData.append('image2', new Blob([signatureBuffer3], { type: 'image/png' }), 'signature.png');

      console.log('Making request WITHOUT background fields...');
      const noBgResponse = await fetch('https://api.veriftools.com/api/integration/generate/', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Accept': 'application/json'
        },
        body: noBgFormData
      });

      console.log('No-background response status:', noBgResponse.status);
      console.log('No-background response headers:', Object.fromEntries(noBgResponse.headers.entries()));

      const noBgResponseText = await noBgResponse.text();
      console.log('No-background response:', noBgResponseText.substring(0, 1000));

      if (noBgResponse.ok) {
        console.log('✅ SUCCESS WITHOUT BACKGROUND FIELDS!');
        try {
          const data = JSON.parse(noBgResponseText);
          console.log('Response data:', data);
          if (data.task_id) {
            console.log(`Task ID: ${data.task_id}`);
          }
        } catch (e) {
          console.log('Response not JSON but request succeeded');
        }
      } else {
        console.log('❌ Still failed without background fields');
      }
    } catch (noBgError) {
      console.error('No-background test exception:', noBgError);
    }

    // === FINAL RESULT ===
    console.log('=== ALL TESTS COMPLETED ===');
    return res.status(200).json({
      success: false,
      message: 'All tests completed - check server logs for detailed results',
      note: 'This comprehensive test helps identify the exact issue'
    });

  } catch (error) {
    console.error('Direct Veriftools test failed:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}