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

    // Test 1: Try to get generator info first
    console.log('=== TEST 1: GET GENERATOR INFO ===');
    try {
      const infoResponse = await fetch(`https://api.veriftools.net/api/integration/generator-information/${generatorSlug}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Info response status:', infoResponse.status);
      console.log('Info response headers:', Object.fromEntries(infoResponse.headers.entries()));

      if (infoResponse.ok) {
        const infoData = await infoResponse.json();
        console.log('Generator info success:', infoData);
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
          'Authorization': `Basic ${credentials}`
        },
        body: formData
      });

      console.log('Generate response status:', generateResponse.status);
      console.log('Generate response headers:', Object.fromEntries(generateResponse.headers.entries()));

      if (generateResponse.ok) {
        const generateData = await generateResponse.json();
        console.log('Generate success:', generateData);
        return res.status(200).json({
          success: true,
          message: 'Direct API test successful',
          generateResult: generateData
        });
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