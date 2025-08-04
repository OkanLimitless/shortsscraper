import { createVeriftoolsAPI } from '../../lib/veriftools';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('=== TESTING LIBRARY IN NEXT.JS ENVIRONMENT (Same as Test 3) ===');

  try {
    const veriftools = createVeriftoolsAPI('multilog24@protonmail.com', 'K7-pk2Xj8wMvXqR');
    
    // Use the EXACT same data that works in Test 3
    const testData = {
      'LN': 'DOE',
      'FN': 'JOHN',
      'NUMBER': '123456789',
      'SEX': 'M',
      'DOB': '16.10.1986',
      'DOI': '15.12.2020',
      'DOE': '15.12.2030',
      'NATIONALITY': 'HRVATSKO',
      'POB': 'ZAGREB',
      'POI': 'PU/ZAGREB',
      'BACKGROUND': 'Photo',
      'BACKGROUND_NUMBER': '1'
    };
    
    console.log('Testing library with exact Test 3 data in Next.js environment...');
    
    try {
      const result = await veriftools.generateDocument('croatia_passport', testData);
      console.log('🎉 SUCCESS! Document generation result:', result);
      
      return res.status(200).json({
        success: true,
        message: 'Library works perfectly!',
        result: result
      });
      
    } catch (error) {
      console.log('Library error:', error.message);
      
      if (error.message.includes('generator')) {
        console.log('❌ Still generator field issue in Next.js environment');
        return res.status(200).json({
          success: false,
          issue: 'generator_field',
          message: 'Generator field still not working in Next.js',
          error: error.message,
          comparison: 'Test 3 works, but library doesn\'t - there\'s a difference in FormData construction'
        });
      } else if (error.message.includes('400')) {
        if (error.message.includes('image')) {
          console.log('🎯 EXCELLENT! Generator field fixed, just needs images');
          return res.status(200).json({
            success: true,
            issue: 'images_only',
            message: 'Generator field FIXED! Only needs proper images now',
            error: error.message
          });
        } else {
          console.log('🎯 PROGRESS! Generator field fixed, different validation error');
          return res.status(200).json({
            success: true,
            issue: 'validation',
            message: 'Generator field FIXED! Different validation issue',
            error: error.message
          });
        }
      } else {
        console.log('🤔 Different error type:', error.message);
        return res.status(200).json({
          success: false,
          issue: 'unknown',
          message: 'Different error type',
          error: error.message
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