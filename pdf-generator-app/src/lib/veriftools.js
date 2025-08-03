class VeriftoolsAPI {
  constructor(username, password) {
    this.baseURL = 'https://api.veriftools.com';
    // Handle both browser and Node.js environments
    if (typeof btoa !== 'undefined') {
      this.credentials = btoa(`${username}:${password}`);
    } else {
      // Node.js environment
      this.credentials = Buffer.from(`${username}:${password}`).toString('base64');
    }
  }

  // Get available generators
  async getGeneratorInfo(slug) {
    try {
      const response = await fetch(`${this.baseURL}/api/integration/generator-information/${slug}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${this.credentials}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get generator info: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting generator info:', error);
      throw error;
    }
  }

  // Get full generator information
  async getGeneratorFullInfo(slug) {
    try {
      const response = await fetch(`${this.baseURL}/api/integration/generator-full-information/${slug}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${this.credentials}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get full generator info: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting full generator info:', error);
      throw error;
    }
  }

  // Generate document
  async generateDocument(generatorSlug, documentData, image1 = null, image2 = null) {
    try {
      console.log('=== VERIFTOOLS API CALL DEBUG ===');
      console.log('URL:', `${this.baseURL}/api/integration/generate/`);
      console.log('Generator slug:', generatorSlug);
      console.log('Document data:', documentData);
      
      const formData = new FormData();
      
      // Add generator slug
      formData.append('generator', generatorSlug); // Use 'generator' not 'generator_slug'
      
      // Add document data (this will depend on what the specific generator expects)
      Object.keys(documentData).forEach(key => {
        if (documentData[key] !== null && documentData[key] !== undefined) {
          console.log(`Adding form field: ${key} = ${documentData[key]}`);
          formData.append(key, documentData[key]);
        }
      });

      // Add required images (Photo and Signature)
      if (image1 && image2) {
        console.log('Adding uploaded images...');
        
        // In Node.js environment, read the files and create proper form data
        const fs = require('fs');
        
        // Read the uploaded files
        const image1Buffer = fs.readFileSync(image1.filepath);
        const image2Buffer = fs.readFileSync(image2.filepath);
        
        // Create proper file objects for FormData
        formData.append('image1', image1Buffer, {
          filename: image1.originalFilename || 'photo.jpg',
          contentType: image1.mimetype || 'image/jpeg'
        });
        formData.append('image2', image2Buffer, {
          filename: image2.originalFilename || 'signature.jpg', 
          contentType: image2.mimetype || 'image/jpeg'
        });
        
        console.log(`Added image1: ${image1.originalFilename} (${image1.mimetype})`);
        console.log(`Added image2: ${image2.originalFilename} (${image2.mimetype})`);
      } else {
        console.log('No images provided - using placeholder images...');
        
        // Create valid minimal placeholder images (1x1 pixel PNG)
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

        // Node.js environment - use Buffer directly
        formData.append('image1', minimalPNG, 'photo.png');
        formData.append('image2', minimalPNG, 'signature.png');
      }

      console.log('Making API request...');
      const response = await fetch(`${this.baseURL}/api/integration/generate/`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.credentials}`
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response body:', errorText.substring(0, 1000));
        throw new Error(`Failed to generate document: ${response.status} - ${errorText.substring(0, 200)}`);
      }

      const result = await response.json();
      console.log('Success response:', result);
      return result; // Should contain task_id for status checking
    } catch (error) {
      console.error('Error generating document:', error);
      throw error;
    }
  }

  // Check generation status
  async checkGenerationStatus(taskId) {
    try {
      console.log('=== CHECKING STATUS FOR TASK:', taskId, '===');
      const response = await fetch(`${this.baseURL}/api/integration/generation-status/${taskId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${this.credentials}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Status check response:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Status check error:', errorText.substring(0, 500));
        throw new Error(`Failed to check status: ${response.status} - ${errorText.substring(0, 200)}`);
      }

      const result = await response.json();
      console.log('Status result:', result);
      return result;
    } catch (error) {
      console.error('Error checking generation status:', error);
      throw error;
    }
  }

  // Poll for completion
  async waitForCompletion(taskId, maxAttempts = 30, interval = 2000) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.checkGenerationStatus(taskId);
      
      if (status.status === 'completed') {
        return status;
      } else if (status.status === 'failed') {
        throw new Error('Document generation failed');
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error('Document generation timed out');
  }

  // Pay for result (if required)
  async payForResult(paymentData) {
    try {
      const response = await fetch(`${this.baseURL}/api/integration/pay-for-result/`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error(`Payment failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Complete workflow: generate and wait for completion
  async generateDocumentComplete(generatorSlug, documentData, image1 = null, image2 = null) {
    try {
      // 1. Start generation
      const generateResult = await this.generateDocument(generatorSlug, documentData, image1, image2);
      const taskId = generateResult.task_id;

      // 2. Wait for completion
      const completedResult = await this.waitForCompletion(taskId);

      // 3. Return the completed result (should contain download URL or document data)
      return completedResult;
    } catch (error) {
      console.error('Error in complete generation workflow:', error);
      throw error;
    }
  }
}

// Export function to create API instance
export function createVeriftoolsAPI(username, password) {
  return new VeriftoolsAPI(username, password);
}

// Helper function to generate random 9-digit document number
function generateDocumentNumber() {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
}

// Helper function to format date to DD.MM.YYYY
function formatDateToCroatian(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

// Helper function to add years to a date and format it
function addYearsToDate(dateString, years) {
  const date = new Date(dateString);
  date.setFullYear(date.getFullYear() + years);
  return formatDateToCroatian(date);
}

// Helper function to extract name parts from owner name
function extractNameParts(ownerName) {
  if (!ownerName) return { surname: '', givenNames: '' };
  
  const nameParts = ownerName.trim().split(/\s+/);
  if (nameParts.length === 1) {
    return { surname: nameParts[0], givenNames: '' };
  }
  
  // Assume last part is surname, rest are given names
  const surname = nameParts[nameParts.length - 1];
  const givenNames = nameParts.slice(0, -1).join(' ');
  
  return { surname, givenNames };
}

// Helper function to transform KVK form data to Croatian passport format for Veriftools
export function transformKVKDataToCroatianPassport(kvkFormData, sex = 'M') {
  const { surname, givenNames } = extractNameParts(kvkFormData.ownerName);
  const documentNumber = generateDocumentNumber();
  const dateOfBirth = formatDateToCroatian(kvkFormData.ownerDOB);

  // Fixed issue date (example: 15.12.2020)
  const issueDate = '15.12.2020';

  // Expiry date (10 years after issue date)
  const expiryDate = '15.12.2030';

  // Return data using the correct API field names
  const transformedData = {
    LN: surname,              // Last Name
    FN: givenNames,           // First Name  
    NUMBER: documentNumber,   // Document Number
    SEX: sex,                 // Sex
    DOB: dateOfBirth,         // Date of Birth
    DOI: issueDate,           // Date of Issue
    DOE: expiryDate,          // Date of Expiry
    NATIONALITY: 'HRVATSKO', // Nationality
    POB: 'ZAGREB',            // Place of Birth
    POI: 'PU/ZAGREB'          // Place of Issue
  };

  console.log('=== TRANSFORMED DATA FOR API ===');
  console.log('Input KVK data:', JSON.stringify(kvkFormData, null, 2));
  console.log('Output Croatian passport data:');
  Object.keys(transformedData).forEach(key => {
    console.log(`  ${key}: "${transformedData[key]}"`);
  });

  return transformedData;
}