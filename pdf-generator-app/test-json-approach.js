// Use dynamic import for fetch
async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function testJSONApproach() {
  console.log('=== TESTING JSON APPROACH ===');
  
  const fetch = await getFetch();
  
  const credentials = 'bXVsdGlsb2cyNEBwcm90b25tYWlsLmNvbTpLNy1wazJYajh3TXZYcVI=';
  const baseURL = 'https://api.veriftools.com';
  
  // Test data
  const requestData = {
    generator: 'croatia_passport',
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
  
  try {
    console.log('Sending JSON request...');
    console.log('Data:', JSON.stringify(requestData, null, 2));
    
    const response = await fetch(`${baseURL}/api/integration/generate/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText.substring(0, 500));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testJSONApproach().catch(console.error);