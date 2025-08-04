// Use dynamic import for fetch
async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function testAPIInfo() {
  console.log('=== TESTING API INFORMATION ENDPOINTS ===');
  
  const fetch = await getFetch();
  
  const credentials = 'bXVsdGlsb2cyNEBwcm90b21tYWlsLmNvbTpLNy1wazJYajh3TXZYcVI=';
  const baseURL = 'https://api.veriftools.com';
  
  const endpoints = [
    '/api/integration/generator-information/croatia_passport/',
    '/api/integration/generators/',
    '/api/integration/',
    '/api/integration/generate/',  // OPTIONS request
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n--- Testing ${endpoint} ---`);
    
    try {
      const method = endpoint.includes('generate/') ? 'OPTIONS' : 'GET';
      
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: method,
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Status:', response.status);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const responseText = await response.text();
        console.log('Response:', responseText.substring(0, 1000));
      } else {
        const errorText = await response.text();
        console.log('Error:', errorText.substring(0, 500));
      }
      
    } catch (error) {
      console.log('Error:', error.message);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testAPIInfo().catch(console.error);