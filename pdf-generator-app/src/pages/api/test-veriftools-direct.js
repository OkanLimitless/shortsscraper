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

    // Test 0: Basic connectivity test
    console.log('=== TEST 0: BASIC CONNECTIVITY ===');
    try {
      const baseResponse = await fetch('https://api.veriftools.net/', {
        method: 'GET',
        headers: {
          'User-Agent': 'KVK-Generator/1.0'
        }
      });
      console.log('Base API response status:', baseResponse.status);
      console.log('Base API response headers:', Object.fromEntries(baseResponse.headers.entries()));
      
      const baseText = await baseResponse.text();
      console.log('Base API response:', baseText.substring(0, 500));
    } catch (baseError) {
      console.error('Base API connectivity failed:', baseError);
    }

    // Test 1: Try to get generator info first
    console.log('=== TEST 1: GET GENERATOR INFO ===');
    try {
      const infoResponse = await fetch(`https://api.veriftools.net/api/integration/generator-information/${generatorSlug}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
          'User-Agent': 'KVK-Generator/1.0'
        }
      });

      console.log('Info response status:', infoResponse.status);
      console.log('Info response headers:', Object.fromEntries(infoResponse.headers.entries()));

             if (infoResponse.ok) {
         const contentType = infoResponse.headers.get('content-type');
         console.log('Info response content-type:', contentType);
         
         if (contentType && contentType.includes('application/json')) {
           const infoData = await infoResponse.json();
           console.log('Generator info success:', infoData);
         } else {
           const textData = await infoResponse.text();
           console.log('Generator info returned non-JSON:', textData.substring(0, 500));
         }
       } else {
         const errorText = await infoResponse.text();
         console.log('Generator info error:', errorText.substring(0, 500));
       }
    } catch (infoError) {
      console.error('Generator info failed:', infoError);
    }

    // Test 2: Try to generate a document
    console.log('=== TEST 2: GENERATE DOCUMENT ===');
    try {
      const formData = new FormData();
      formData.append('generator_slug', generatorSlug);
      formData.append('surname', 'TestSurname');
      formData.append('given_names', 'TestName');
      formData.append('document_number', '123456789');
      formData.append('sex', 'M');
      formData.append('date_of_birth', '01.01.1990');
      formData.append('date_of_issue', '15.12.2020');
      formData.append('date_of_expiry', '15.12.2030');
      formData.append('nationality', 'HRVATSKO');
      formData.append('place_of_birth', 'ZAGREB');
      formData.append('issued_by', 'PU/ZAGREB');

      console.log('Making generate request...');
      const generateResponse = await fetch('https://api.veriftools.net/api/integration/generate/', {
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
             message: 'Direct API test successful',
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
        error: generateError.message
      });
    }

  } catch (error) {
    console.error('Direct test error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}