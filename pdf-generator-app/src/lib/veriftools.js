class VeriftoolsAPI {
  constructor(username, password) {
    this.baseURL = 'https://api.veriftools.net';
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
  async generateDocument(generatorSlug, documentData) {
    try {
      console.log('=== VERIFTOOLS API CALL DEBUG ===');
      console.log('URL:', `${this.baseURL}/api/integration/generate/`);
      console.log('Generator slug:', generatorSlug);
      console.log('Document data:', documentData);
      
      const formData = new FormData();
      
      // Add generator slug
      formData.append('generator_slug', generatorSlug);
      
      // Add document data (this will depend on what the specific generator expects)
      Object.keys(documentData).forEach(key => {
        if (documentData[key] !== null && documentData[key] !== undefined) {
          console.log(`Adding form field: ${key} = ${documentData[key]}`);
          formData.append(key, documentData[key]);
        }
      });

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
  async generateDocumentComplete(generatorSlug, documentData) {
    try {
      // 1. Start generation
      const generateResult = await this.generateDocument(generatorSlug, documentData);
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
  
  return {
    surname: surname,
    given_names: givenNames,
    document_number: documentNumber,
    sex: sex,
    date_of_birth: dateOfBirth,
    date_of_issue: issueDate,
    date_of_expiry: expiryDate,
    nationality: 'HRVATSKO',
    place_of_birth: 'ZAGREB',
    issued_by: 'PU/ZAGREB'
  };
}