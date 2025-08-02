# Croatian Passport Integration with KVK Generator

## Overview

The KVK Generator now has an additional feature to generate Croatian passport documents using the Veriftools API. This works **alongside** the existing KVK document generation, not as a replacement.

## How It Works

### Workflow
1. **User fills out KVK form** (as usual)
2. **User checks "Also generate Croatian Passport"** (optional)
3. **User enters Veriftools credentials** (if Croatian passport is enabled)
4. **User clicks "Generate KVK Extract PDF"**
5. **System generates KVK document** (downloads immediately)
6. **System generates Croatian passport** (downloads separately, if enabled)

### Data Mapping

The system automatically maps KVK form data to Croatian passport fields:

| KVK Field | Croatian Passport Field | Example |
|-----------|------------------------|---------|
| Owner Name | Surname + Given Names | "John Doe" → Surname: "Doe", Given Names: "John" |
| Owner DOB | Date of Birth | "1990-01-01" → "01.01.1990" |
| User Selection | Sex | M or F |
| Generated | Document Number | Random 9-digit number |
| Fixed | Date of Issue | 15.12.2020 |
| Fixed | Date of Expiry | 15.12.2030 (10 years after issue) |
| Fixed | Nationality | HRVATSKO |
| Fixed | Place of Birth | ZAGREB |
| Fixed | Issued by | PU/ZAGREB |

## Croatian Passport Fields

The generated Croatian passport includes these fields:

- **Surname**: Last part of owner name from KVK form
- **Given Names**: First part(s) of owner name from KVK form
- **Document Number**: Random 9-digit number (e.g., 123456789)
- **Sex**: M or F (user selectable)
- **Date of Birth**: From KVK form, formatted as DD.MM.YYYY
- **Date of Issue**: Fixed at 15.12.2020
- **Date of Expiry**: Fixed at 15.12.2030 (10 years after issue)
- **Nationality**: HRVATSKO
- **Place of Birth**: ZAGREB
- **Issued by**: PU/ZAGREB

## User Interface

### New Section: "Additional Document Generation"
- Checkbox: "Also generate Croatian Passport using Veriftools API"
- When checked, shows:
  - Veriftools Username field
  - Veriftools Password field
  - Croatian Passport Generator Slug field (default: "croatia-passport")
  - Sex selection (M/F)
  - Data preview showing what will be generated

### Status Messages
- Info: "Generating Croatian passport..." (while processing)
- Success: "Croatian passport generated and downloaded successfully!"
- Error: "Croatian Passport Error: [error message]"

## Technical Implementation

### Files Modified/Added

**New Files:**
- `src/lib/veriftools.js` - Veriftools API client
- `src/pages/api/generate-veriftools.js` - API route for Croatian passport generation
- `CROATIAN_PASSPORT_INTEGRATION.md` - This documentation

**Modified Files:**
- `src/components/KVKForm.js` - Added Croatian passport option
- `src/components/KVKForm.module.css` - Added styles for new UI elements

### Data Transformation

```javascript
// Example transformation
const kvkData = {
  ownerName: "John Doe",
  ownerDOB: "1990-01-01"
};

// Becomes Croatian passport data:
const passportData = {
  surname: "Doe",
  given_names: "John",
  document_number: "123456789", // random
  sex: "M", // user selected
  date_of_birth: "01.01.1990",
  date_of_issue: "15.12.2020",
  date_of_expiry: "15.12.2030",
  nationality: "HRVATSKO",
  place_of_birth: "ZAGREB",
  issued_by: "PU/ZAGREB"
};
```

### API Integration

The system uses the Veriftools API endpoints:
- `POST /api/integration/generate/` - Start document generation
- `GET /api/integration/generation-status/{task_id}/` - Check status
- `POST /api/integration/pay-for-result/` - Process payment (if required)

## Usage Instructions

### For Users

1. **Fill out the KVK form** as normal
2. **Check the Croatian passport checkbox** (optional)
3. **Enter your Veriftools credentials**:
   - Username
   - Password
   - Generator slug (use the correct slug from Veriftools)
4. **Select sex (M/F)** for the passport
5. **Review the data preview** to ensure accuracy
6. **Click "Generate KVK Extract PDF"**
7. **Two downloads will occur**:
   - KVK extract PDF (immediately)
   - Croatian passport PDF (after a short delay)

### For Developers

1. **Get Veriftools API access** and find the correct generator slug for Croatian passports
2. **Test the integration** using the provided test component
3. **Configure the default generator slug** in the code if needed
4. **Monitor API usage** and handle payment requirements

## Error Handling

The system handles various error scenarios:

- **Invalid Veriftools credentials**: Clear error message
- **Generator not found**: Suggests checking the slug
- **Missing required data**: Validates form data
- **Network errors**: Provides retry suggestions
- **Generation timeout**: Handles long-running processes
- **Payment required**: Guides user to payment process

## Security Considerations

- **Credentials not stored**: Users must enter credentials each time
- **HTTPS communication**: All API calls use secure connections
- **Basic Authentication**: Uses Veriftools' required auth method
- **Server-side processing**: Sensitive operations happen on the server

## Testing

### Test the Integration

1. **Use the test component**: `VeriftoolsTest.js`
2. **Verify API connectivity** with your credentials
3. **Test with sample data** before using real information
4. **Check both documents** are generated correctly

### Common Issues

- **"Generator not found"**: Contact Veriftools for the correct slug
- **"Invalid credentials"**: Verify username/password with Veriftools
- **"Payment required"**: Check account balance or implement payment flow

## Future Enhancements

Potential improvements:
- **Multiple passport types**: Support for different countries
- **Batch generation**: Generate multiple passports at once
- **Template customization**: Allow custom passport templates
- **Credential storage**: Secure storage for frequent users
- **Additional validation**: More robust data validation

## Support

For issues:
- **KVK generation**: Check existing KVK generator documentation
- **Croatian passport**: Check Veriftools API documentation
- **Integration issues**: Review browser console and server logs
- **Veriftools account**: Contact Veriftools support directly