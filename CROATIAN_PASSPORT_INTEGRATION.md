# Croatian Passport Integration with Veriftools API

## Overview

This document describes the integration of the Veriftools API to generate Croatian passport documents alongside the existing KVK document generation. The system now supports dual document generation: KVK extracts and Croatian passports.

## 🎯 **Complete API Integration Details**

### API Configuration
- **Base URL**: `https://api.veriftools.com`
- **Generator Slug**: `croatia_passport`
- **Authentication**: Basic Auth (username:password)
- **Cost**: $0.99 per document (requires account credits)

### Required Fields
The Croatian passport generator requires these specific field names:
- `LN` - Last Name (surname)
- `FN` - First Name (given names)
- `NUMBER` - Document Number (9 digits)
- `SEX` - Sex (M/F)
- `DOB` - Date of Birth (DD.MM.YYYY format)
- `DOI` - Date of Issue (DD.MM.YYYY format)
- `DOE` - Date of Expiry (DD.MM.YYYY format)
- `NATIONALITY` - Nationality (HRVATSKO)
- `POB` - Place of Birth (ZAGREB)
- `POI` - Place of Issue (PU/ZAGREB)

### Required Images
- `image1` - Photo (PNG/JPG format)
- `image2` - Signature (PNG/JPG format)

## Workflow

1. **User fills KVK form** with owner name and date of birth
2. **User enables Croatian passport generation** via checkbox
3. **User provides Veriftools credentials** (username, password)
4. **System generates KVK document** using existing logic
5. **System calls Veriftools API** to generate Croatian passport:
   - Maps KVK data to Croatian passport fields
   - Generates random document number
   - Adds placeholder images for photo/signature
   - Submits request to Veriftools API
   - Handles payment/credit requirements
6. **Both documents are downloaded** to user

## Data Mapping

| KVK Field | Croatian Passport Field | Value Source |
|-----------|------------------------|--------------|
| ownerName (surname) | LN | Extracted from full name |
| ownerName (given names) | FN | Extracted from full name |
| - | NUMBER | Random 9-digit number |
| passportSex | SEX | User selection (M/F) |
| ownerDOB | DOB | Converted to DD.MM.YYYY |
| - | DOI | Fixed: 15.12.2020 |
| - | DOE | Fixed: 15.12.2030 |
| - | NATIONALITY | Fixed: HRVATSKO |
| - | POB | Fixed: ZAGREB |
| - | POI | Fixed: PU/ZAGREB |

## UI Components

### Additional Document Generation Section
- Checkbox: "Also generate Croatian Passport using Veriftools API"
- Username input field (pre-filled)
- Password input field (pre-filled)
- Generator slug input (pre-filled with `croatia_passport`)
- Sex selection dropdown (M/F)

### Croatian Passport Data Preview
Shows mapped data before generation:
- Surname (LN)
- Given Names (FN)
- Document Number
- Sex
- Date of Birth (DOB)
- Date of Issue (DOI)
- Date of Expiry (DOE)
- Nationality
- Place of Birth (POB)
- Place of Issue (POI)

### Status Indicators
- Loading state during generation
- Success/error messages
- Test buttons for API debugging

## Technical Implementation

### Core Files

1. **`src/lib/veriftools.js`**
   - `VeriftoolsAPI` class for API communication
   - Data transformation functions
   - Image handling for photo/signature requirements
   - Error handling and logging

2. **`src/pages/api/generate-veriftools.js`**
   - Next.js API route for server-side proxy
   - Handles credentials securely
   - Manages file downloads

3. **`src/components/KVKForm.js`**
   - Updated form with Croatian passport options
   - Dual document generation workflow
   - UI for credentials and preview

### Data Transformation

```javascript
export function transformKVKDataToCroatianPassport(kvkFormData, sex = 'M') {
  const { surname, givenNames } = extractNameParts(kvkFormData.ownerName);
  const documentNumber = generateDocumentNumber();
  const dateOfBirth = formatDateToCroatian(kvkFormData.ownerDOB);

  return {
    LN: surname,              // Last Name
    FN: givenNames,           // First Name  
    NUMBER: documentNumber,   // Document Number
    SEX: sex,                 // Sex
    DOB: dateOfBirth,         // Date of Birth
    DOI: '15.12.2020',        // Date of Issue
    DOE: '15.12.2030',        // Date of Expiry
    NATIONALITY: 'HRVATSKO', // Nationality
    POB: 'ZAGREB',            // Place of Birth
    POI: 'PU/ZAGREB'          // Place of Issue
  };
}
```

### API Integration

The system uses a task-based approach:
1. Submit generation request with data and images
2. Receive task ID
3. Poll for completion status
4. Download generated document
5. Handle payment requirements

## Usage Instructions

### For Users
1. Fill out the KVK form with required information
2. Check "Also generate Croatian Passport using Veriftools API"
3. Verify pre-filled Veriftools credentials
4. Select sex (M/F) for the passport
5. Review the data preview
6. Click "Generate" to create both documents
7. **Ensure Veriftools account has sufficient credits ($0.99 per document)**

### For Developers
1. Credentials are hardcoded for testing: `multilog24@protonmail.com` / `K7-pk2Xj8wMvXqR`
2. Use test buttons to debug API integration
3. Monitor server logs for detailed API responses
4. Check account balance before production use

## Error Handling

### Common Issues
- **500 Server Error**: Usually indicates insufficient account credits
- **404 Not Found**: Incorrect generator slug or API endpoint
- **Authentication Failed**: Invalid credentials
- **Invalid Images**: Photo/signature files not properly formatted

### Debugging Tools
- "Test API Integration" button - tests server environment
- "Test Direct API" button - tests external API calls
- Comprehensive logging in server console
- Error messages displayed to user

## Security Considerations

- Credentials handled server-side only
- API calls proxied through Next.js API routes
- No sensitive data stored client-side
- Basic authentication over HTTPS

## Payment Requirements

⚠️ **Important**: The Veriftools API is a paid service requiring:
- Account registration at veriftools.com
- Credit purchase ($0.99 per Croatian passport)
- Sufficient account balance before generation

## Troubleshooting

### Account Issues
- Verify credentials are correct
- Check account balance at veriftools.com
- Ensure account has API access permissions

### Technical Issues
- Check server logs for detailed error messages
- Use test buttons to isolate problems
- Verify API endpoints and field names
- Ensure images are properly formatted

### Common Solutions
- Top up account credits for 500 errors
- Update credentials if authentication fails
- Check generator slug spelling (`croatia_passport`)
- Verify image file formats (PNG/JPG)

## Future Enhancements

- Support for custom photo/signature uploads
- Multiple document type selection
- Batch generation capabilities
- Credit balance checking
- Enhanced error recovery

## Support

For technical issues:
- Check server console logs
- Use built-in test tools
- Verify API documentation updates

For account/billing issues:
- Contact Veriftools support
- Check account balance
- Verify payment methods

---

**Status**: ✅ Integration Complete
**Last Updated**: January 2025
**API Version**: Veriftools Integration API v1.0