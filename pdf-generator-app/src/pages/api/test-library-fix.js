import { createVeriftoolsAPI } from '../../lib/veriftools';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('=== TESTING LIBRARY FIX IN NEXT.JS ENVIRONMENT ===');

  try {
    // Create API instance with hardcoded credentials
    const veriftools = createVeriftoolsAPI('multilog24@protonmail.com', 'K7-pk2Xj8wMvXqR');
    
    console.log('1. Testing generator info (should work):');
    const generatorInfo = await veriftools.getGeneratorInfo('croatia_passport');
    console.log('✅ Generator info success:', Object.keys(generatorInfo));
    
    console.log('2. Testing document generation with minimal data:');
    
    // Test data
    const testData = {
      LN: 'DOE',
      FN: 'JOHN', 
      NUMBER: '123456789',
      SEX: 'M',
      DOB: '16.10.1986',
      DOI: '15.12.2020',
      DOE: '15.12.2030',
      NATIONALITY: 'HRVATSKO',
      POB: 'ZAGREB',
      POI: 'PU/ZAGREB',
      BACKGROUND: 'Photo',
      BACKGROUND_NUMBER: '1'
    };
    
    console.log('Test data:', testData);
    
    // Test without images (should get 400 "missing images" or different error)
    try {
      console.log('Testing document generation...');
      const result = await veriftools.generateDocument('croatia_passport', testData);
      console.log('🎉 UNEXPECTED SUCCESS:', result);
      
      return res.status(200).json({
        success: true,
        message: 'Document generation successful!',
        result: result
      });
      
    } catch (error) {
      console.log('Generate error:', error.message);
      
      const errorMessage = error.message;
      
      if (errorMessage.includes('400')) {
        if (errorMessage.includes('generator')) {
          console.log('❌ Generator field issue persists in Next.js');
          return res.status(200).json({
            success: false,
            issue: 'generator_field',
            message: 'Generator field not being recognized',
            error: errorMessage
          });
        } else {
          console.log('🎯 PROGRESS! Generator field OK, other validation issues');
          return res.status(200).json({
            success: false,
            issue: 'validation',
            message: 'Generator field working, other validation errors',
            error: errorMessage
          });
        }
      } else if (errorMessage.includes('500')) {
        console.log('❌ Still getting 500 errors - FormData fix didn\'t work');
        return res.status(200).json({
          success: false,
          issue: 'server_error',
          message: 'Still getting 500 server errors',
          error: errorMessage
        });
      } else {
        console.log('🤔 Different error type:', errorMessage);
        return res.status(200).json({
          success: false,
          issue: 'unknown',
          message: 'Different error type',
          error: errorMessage
        });
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}