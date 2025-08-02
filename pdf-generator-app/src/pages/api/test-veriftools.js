export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Test API called');
    console.log('Request body:', req.body);

    // Test basic functionality
    const testData = {
      message: 'Test API working',
      environment: {
        nodeVersion: process.version,
        hasFetch: typeof fetch !== 'undefined',
        hasBuffer: typeof Buffer !== 'undefined'
      },
      receivedData: req.body
    };

    console.log('Test data:', testData);

    // Test basic auth encoding
    const username = 'test';
    const password = 'test';
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    testData.testCredentials = credentials;

    // Test the transformation function
    try {
      const { transformKVKDataToCroatianPassport } = await import('../../lib/veriftools');
      const sampleData = {
        ownerName: 'John Doe',
        ownerDOB: '1990-01-01'
      };
      const transformedData = transformKVKDataToCroatianPassport(sampleData, 'M');
      testData.transformedData = transformedData;
    } catch (importError) {
      console.error('Import error:', importError);
      testData.importError = importError.message;
    }

    return res.status(200).json(testData);

  } catch (error) {
    console.error('Test API error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}