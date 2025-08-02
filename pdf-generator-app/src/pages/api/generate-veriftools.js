import { createVeriftoolsAPI, transformKVKDataToCroatianPassport } from '../../lib/veriftools';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { formData, generatorSlug, credentials, sex } = req.body;

    // Validate required data
    if (!formData || !generatorSlug || !credentials) {
      return res.status(400).json({ 
        error: 'Missing required data: formData, generatorSlug, and credentials are required' 
      });
    }

    if (!credentials.username || !credentials.password) {
      return res.status(400).json({ 
        error: 'Missing Veriftools credentials' 
      });
    }

    // Create Veriftools API instance
    const veriftools = createVeriftoolsAPI(credentials.username, credentials.password);

    // Transform form data to Croatian passport format for Veriftools
    const documentData = transformKVKDataToCroatianPassport(formData, sex || 'M');

    // Generate document using Veriftools
    console.log('Starting Veriftools document generation...');
    console.log('Generator slug:', generatorSlug);
    console.log('Document data:', documentData);
    
    const result = await veriftools.generateDocumentComplete(generatorSlug, documentData);

    // Check if the result contains a download URL or document data
    if (result.download_url) {
      // If there's a download URL, fetch the document
      const documentResponse = await fetch(result.download_url);
      
      if (!documentResponse.ok) {
        throw new Error('Failed to download generated document');
      }

      const documentBuffer = await documentResponse.arrayBuffer();
      
      // Set appropriate headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="croatian_passport.pdf"');
      res.setHeader('Content-Length', documentBuffer.byteLength);
      
      // Send the PDF
      res.send(Buffer.from(documentBuffer));
    } else if (result.document_data) {
      // If document data is embedded in response
      const documentBuffer = Buffer.from(result.document_data, 'base64');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="croatian_passport.pdf"');
      res.setHeader('Content-Length', documentBuffer.length);
      
      res.send(documentBuffer);
    } else {
      // Return the result data for further processing
      res.status(200).json({
        success: true,
        result: result,
        message: 'Document generated successfully'
      });
    }

  } catch (error) {
    console.error('Veriftools generation error:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate document with Veriftools';
    let statusCode = 500;
    
    if (error.message.includes('401')) {
      errorMessage = 'Invalid Veriftools credentials';
      statusCode = 401;
    } else if (error.message.includes('404')) {
      errorMessage = 'Generator not found. Please check the generator slug.';
      statusCode = 404;
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Document generation timed out. Please try again.';
      statusCode = 408;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Helper function to check generator availability
export async function checkGeneratorAvailability(slug, credentials) {
  try {
    const veriftools = createVeriftoolsAPI(credentials.username, credentials.password);
    const info = await veriftools.getGeneratorInfo(slug);
    return { available: true, info };
  } catch (error) {
    return { available: false, error: error.message };
  }
}