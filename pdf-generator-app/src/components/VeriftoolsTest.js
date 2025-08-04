'use client';

import { useState } from 'react';
import { createVeriftoolsAPI } from '../lib/veriftools';

export default function VeriftoolsTest() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    generatorSlug: 'kvk-extract'
  });
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const testConnection = async () => {
    if (!credentials.username || !credentials.password) {
      setError('Please provide username and password');
      return;
    }

    setLoading(true);
    setError(null);
    setTestResults(null);

    try {
      const veriftools = createVeriftoolsAPI(credentials.username, credentials.password);
      
      // Test getting generator information
      const generatorInfo = await veriftools.getGeneratorInfo(credentials.generatorSlug);
      
      setTestResults({
        success: true,
        generatorInfo,
        message: 'Successfully connected to Veriftools API!'
      });
    } catch (err) {
      console.error('Test failed:', err);
      setError(err.message || 'Failed to connect to Veriftools API');
    } finally {
      setLoading(false);
    }
  };

  const testFullInfo = async () => {
    if (!credentials.username || !credentials.password) {
      setError('Please provide username and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const veriftools = createVeriftoolsAPI(credentials.username, credentials.password);
      
      // Test getting full generator information
      const fullInfo = await veriftools.getGeneratorFullInfo(credentials.generatorSlug);
      
      setTestResults({
        success: true,
        fullInfo,
        message: 'Successfully retrieved full generator information!'
      });
    } catch (err) {
      console.error('Full info test failed:', err);
      setError(err.message || 'Failed to get full generator information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      margin: '20px 0',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>Veriftools API Test</h3>
      <p>Use this component to test your Veriftools API connection and generator availability.</p>
      
      <div style={{ marginBottom: '15px' }}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={credentials.username}
            onChange={handleInputChange}
            style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
          />
        </label>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleInputChange}
            style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
          />
        </label>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>
          Generator Slug:
          <input
            type="text"
            name="generatorSlug"
            value={credentials.generatorSlug}
            onChange={handleInputChange}
            style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
          />
        </label>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={testConnection}
          disabled={loading}
          style={{ 
            padding: '10px 15px', 
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Generator Info'}
        </button>
        
        <button 
          onClick={testFullInfo}
          disabled={loading}
          style={{ 
            padding: '10px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Full Info'}
        </button>
      </div>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          Error: {error}
        </div>
      )}
      
      {testResults && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#d4edda', 
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '4px'
        }}>
          <h4>{testResults.message}</h4>
          <pre style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(testResults.generatorInfo || testResults.fullInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}