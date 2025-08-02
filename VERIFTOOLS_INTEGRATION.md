# Veriftools API Integration Guide

This document explains how the Veriftools API has been integrated into the KVK Generator application.

## Overview

The Veriftools API integration allows users to generate KVK documents using Veriftools' professional document generation service as an alternative to the built-in PDF generation.

## How It Works

### API Workflow

1. **Generator Discovery**: Check available generators using the generator slug
2. **Document Generation**: Submit form data to generate a document
3. **Status Monitoring**: Poll the generation status until completion
4. **Document Retrieval**: Download the generated document
5. **Optional Payment**: Process payment if required by the service

### Integration Architecture

```
KVK Form → Veriftools API Service → Next.js API Route → Veriftools API
    ↓
User Interface ← Document Download ← Response Processing ← Generated Document
```

## Files Added/Modified

### New Files
- `src/lib/veriftools.js` - Veriftools API service class
- `src/pages/api/generate-veriftools.js` - API route for server-side integration
- `src/components/VeriftoolsTest.js` - Test component for API validation
- `VERIFTOOLS_INTEGRATION.md` - This documentation

### Modified Files
- `src/components/KVKForm.js` - Added Veriftools option to main form
- `src/components/KVKForm.module.css` - Added styles for Veriftools UI

## Usage Instructions

### 1. Enable Veriftools Integration

In the KVK Generator form:
1. Check the "Use Veriftools API for enhanced document generation" checkbox
2. Enter your Veriftools credentials:
   - Username
   - Password
   - Generator Slug (default: 'kvk-extract')

### 2. Generate Document

1. Fill in the KVK form data as usual
2. Click "Generate KVK Extract PDF"
3. The system will:
   - Validate your Veriftools credentials
   - Submit the generation request
   - Monitor the generation status
   - Download the completed document

### 3. Testing the Integration

Use the `VeriftoolsTest` component to verify your API connection:

```javascript
import VeriftoolsTest from '../components/VeriftoolsTest';

// Add to your page for testing
<VeriftoolsTest />
```

## API Reference

### Veriftools API Class

```javascript
import { createVeriftoolsAPI } from '../lib/veriftools';

const veriftools = createVeriftoolsAPI(username, password);
```

#### Methods

- `getGeneratorInfo(slug)` - Get basic generator information
- `getGeneratorFullInfo(slug)` - Get detailed generator information
- `generateDocument(slug, data)` - Start document generation
- `checkGenerationStatus(taskId)` - Check generation progress
- `waitForCompletion(taskId)` - Poll until completion
- `payForResult(paymentData)` - Process payment if required
- `generateDocumentComplete(slug, data)` - Full workflow

### API Endpoints

#### POST `/api/generate-veriftools`

Generate a document using Veriftools API.

**Request Body:**
```json
{
  "formData": {
    "tradeName": "Example Company",
    "kvkNumber": "12345678",
    "legalForm": "BV",
    "address": "Example Street 123",
    "establishmentNumber": "123456789012",
    "ownerName": "John Doe",
    "ownerDOB": "1990-01-01"
  },
  "generatorSlug": "kvk-extract",
  "credentials": {
    "username": "your_username",
    "password": "your_password"
  }
}
```

**Response:**
- Success: PDF file download
- Error: JSON with error message

## Configuration

### Environment Variables (Optional)

You can set default credentials using environment variables:

```env
VERIFTOOLS_USERNAME=your_default_username
VERIFTOOLS_PASSWORD=your_default_password
VERIFTOOLS_DEFAULT_SLUG=kvk-extract
```

### Generator Slugs

Common generator slugs (contact Veriftools for exact values):
- `kvk-extract` - KVK business register extract
- `kvk-uittreksel` - Dutch KVK uittreksel
- `business-registration` - General business registration

## Error Handling

The integration handles various error scenarios:

### Authentication Errors
- Invalid credentials (401)
- Missing credentials
- Expired tokens

### Generation Errors
- Generator not found (404)
- Invalid form data
- Generation timeout
- Service unavailable

### Network Errors
- Connection timeout
- Network unavailable
- Rate limiting

## Security Considerations

### Credential Storage
- Credentials are not stored in the application
- Users must enter credentials each session
- Consider implementing secure credential storage for production

### API Communication
- All API calls use HTTPS
- Basic Authentication is used as specified by Veriftools
- Credentials are base64 encoded for transmission

## Troubleshooting

### Common Issues

1. **"Invalid Veriftools credentials"**
   - Verify username and password
   - Check if account is active
   - Contact Veriftools support

2. **"Generator not found"**
   - Verify the generator slug
   - Check available generators with your account
   - Contact Veriftools for correct slug

3. **"Document generation timed out"**
   - Try again with a smaller document
   - Check Veriftools service status
   - Increase timeout in configuration

4. **"Payment required"**
   - Check your Veriftools account balance
   - Implement payment flow if needed
   - Contact Veriftools billing

### Testing Checklist

- [ ] API credentials are valid
- [ ] Generator slug exists and is accessible
- [ ] Form data is properly formatted
- [ ] Network connectivity to api.veriftools.net
- [ ] Sufficient account credits/balance

## Development Notes

### Future Enhancements

1. **Credential Management**
   - Implement secure credential storage
   - Add credential validation
   - Support for API keys instead of passwords

2. **Generator Discovery**
   - Auto-detect available generators
   - Dynamic generator selection UI
   - Generator capability display

3. **Advanced Features**
   - Batch document generation
   - Template customization
   - Document watermarking
   - Digital signatures

4. **Monitoring**
   - Generation analytics
   - Error tracking
   - Performance monitoring

### Code Structure

```
src/
├── lib/
│   └── veriftools.js          # API service class
├── pages/api/
│   └── generate-veriftools.js # Server-side API route
├── components/
│   ├── KVKForm.js            # Main form (modified)
│   ├── KVKForm.module.css    # Styles (modified)
│   └── VeriftoolsTest.js     # Test component
```

## Support

For Veriftools API issues:
- Check the official Veriftools documentation
- Contact Veriftools support
- Verify account status and permissions

For integration issues:
- Check browser console for errors
- Verify network connectivity
- Test with the VeriftoolsTest component
- Review server logs for API route errors

## License

This integration follows the same license as the main KVK Generator project.