class VeriftoolsAPI {
  constructor(username, password) {
    this.baseURL = 'https://api.veriftools.net';
    this.credentials = btoa(`${username}:${password}`);
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
      const formData = new FormData();
      
      // Add generator slug
      formData.append('generator_slug', generatorSlug);
      
      // Add document data (this will depend on what the specific generator expects)
      Object.keys(documentData).forEach(key => {
        if (documentData[key] !== null && documentData[key] !== undefined) {
          formData.append(key, documentData[key]);
        }
      });

      const response = await fetch(`${this.baseURL}/api/integration/generate/`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.credentials}`
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to generate document: ${response.status}`);
      }

      const result = await response.json();
      return result; // Should contain task_id for status checking
    } catch (error) {
      console.error('Error generating document:', error);
      throw error;
    }
  }

  // Check generation status
  async checkGenerationStatus(taskId) {
    try {
      const response = await fetch(`${this.baseURL}/api/integration/generation-status/${taskId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${this.credentials}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to check status: ${response.status}`);
      }

      return await response.json();
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

// Helper function to transform KVK form data to Veriftools format
export function transformKVKDataForVeriftools(kvkFormData) {
  return {
    trade_name: kvkFormData.tradeName,
    kvk_number: kvkFormData.kvkNumber,
    legal_form: kvkFormData.legalForm,
    address: kvkFormData.address,
    establishment_number: kvkFormData.establishmentNumber,
    owner_name: kvkFormData.ownerName,
    owner_dob: kvkFormData.ownerDOB,
    // Add any other fields that Veriftools expects
  };
}