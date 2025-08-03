const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const username = 'multilog24@protonmail.com';
const password = 'K7-pk2Xj8wMvXqR';
const credentials = Buffer.from(`${username}:${password}`).toString('base64');
const generatorSlug = 'croatia_passport';

console.log('=== DIRECT API TEST - ITERATION 1 ===');
console.log(`Username: ${username}`);
console.log(`Generator: ${generatorSlug}`);

async function testAPI() {
  try {
    // Load test images
    const photoPath = path.join(__dirname, 'public', 'test-images', 'test-photo.png');
    const signaturePath = path.join(__dirname, 'public', 'test-images', 'test-signature.png');
    
    console.log('\n=== LOADING IMAGES ===');
    const photoBuffer = fs.readFileSync(photoPath);
    const signatureBuffer = fs.readFileSync(signaturePath);
    console.log(`Photo: ${photoBuffer.length} bytes`);
    console.log(`Signature: ${signatureBuffer.length} bytes`);

    // Test 1: Try basic generate request with minimal data
    console.log('\n=== TEST 1: MINIMAL GENERATE REQUEST ===');
    
    const formData = new FormData();
    formData.append('generator', generatorSlug);
    
    // Minimal required fields based on API example
    formData.append('LN', 'DOE');           // From API example
    formData.append('FN', 'JOHN');          // From API example  
    formData.append('NUMBER', '123456789'); // From API example
    formData.append('SEX', 'M');            // From API example
    formData.append('DOB', '16.10.1986');   // From API example - EXACT format
    formData.append('DOI', '15.12.2020');   // From API example
    formData.append('DOE', '15.12.2030');   // From API example
    formData.append('NATIONALITY', 'HRVATSKO'); // From API example
    formData.append('POB', 'ZAGREB');       // From API example
    formData.append('POI', 'PU/ZAGREB');    // From API example
    
    // Add images
    formData.append('image1', photoBuffer, 'photo.png');
    formData.append('image2', signatureBuffer, 'signature.png');

    console.log('Making generate request...');
    const response = await fetch('https://api.veriftools.com/api/integration/generate/', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      body: formData
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log(`Response body: ${responseText.substring(0, 1000)}`);

    if (response.status === 201 || response.status === 200) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ SUCCESS! Generate response:', data);
        
        if (data.task_id) {
          console.log(`\n=== TASK CREATED: ${data.task_id} ===`);
          await checkTaskStatus(data.task_id);
        }
      } catch (e) {
        console.log('Response is not JSON:', responseText);
      }
    } else {
      console.log('❌ Generate failed');
      
      // Try to parse error details
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error details:', errorData);
      } catch (e) {
        console.log('Error is HTML/text, not JSON');
      }
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

async function checkTaskStatus(taskId) {
  console.log(`\n=== CHECKING TASK STATUS: ${taskId} ===`);
  
  try {
    const response = await fetch(`https://api.veriftools.com/api/integration/generation-status/${taskId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    });

    console.log(`Status check response: ${response.status}`);
    const statusData = await response.text();
    console.log(`Status data: ${statusData}`);

    if (response.ok) {
      try {
        const data = JSON.parse(statusData);
        console.log('Task status:', data);
        
        if (data.status === 'completed') {
          console.log('✅ Task completed! Trying to pay for result...');
          await payForResult(taskId);
        } else {
          console.log(`Task status: ${data.status}, waiting...`);
          // In a real implementation, we'd wait and check again
        }
      } catch (e) {
        console.log('Status response not JSON:', statusData);
      }
    }
  } catch (error) {
    console.error('Status check failed:', error);
  }
}

async function payForResult(taskId) {
  console.log(`\n=== PAYING FOR RESULT: ${taskId} ===`);
  
  try {
    const payFormData = new FormData();
    payFormData.append('task_id', taskId);
    
    const response = await fetch('https://api.veriftools.com/api/integration/pay-for-result/', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`
      },
      body: payFormData
    });

    console.log(`Pay response status: ${response.status}`);
    const payData = await response.text();
    console.log(`Pay response: ${payData}`);

    if (response.ok) {
      console.log('✅ Payment successful!');
      // The response should contain the download URL or file data
    } else {
      console.log('❌ Payment failed');
      try {
        const errorData = JSON.parse(payData);
        console.log('Payment error details:', errorData);
      } catch (e) {
        console.log('Payment error is not JSON');
      }
    }
  } catch (error) {
    console.error('Payment failed:', error);
  }
}

// Run the test
testAPI().then(() => {
  console.log('\n=== TEST COMPLETED ===');
}).catch(error => {
  console.error('Test script failed:', error);
});