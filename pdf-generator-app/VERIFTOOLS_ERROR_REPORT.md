# Veriftools API Integration Error Report

## Issue Summary
**Persistent API Error**: `{"generator":["This field is required."]}` despite generator field being included in all requests.

## Account Information
- **API Username**: multilog24@protonmail.com
- **API Endpoint**: https://api.veriftools.com/api/integration/generate/
- **Target Generator**: croatia_passport (and 11 other variations tested)

## Error Details
- **HTTP Status**: 400 Bad Request
- **Error Response**: `{"generator":["This field is required."]}`
- **Consistency**: This error occurs 100% of the time across all attempts

## Technical Implementation Details

### Authentication
- **Method**: HTTP Basic Authentication
- **Status**: ✅ WORKING (no 401/403 errors, receiving 400 JSON responses)
- **Credentials**: Base64 encoded as expected

### Request Format
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Headers**: Authorization + FormData headers
- **Body**: FormData with generator field + document data + images

### Generator Field Attempts
We have tested the generator field in multiple ways:

1. **Field Names Tested**:
   - `generator` (primary)
   - `generator_slug`
   - `template`
   - `document_type`
   - `type`

2. **Generator Values Tested**:
   - croatia_passport
   - croatian_passport
   - hr_passport
   - passport_croatia
   - passport_hr
   - croatia-passport
   - croatian-passport
   - hr-passport
   - passport-croatia
   - passport-hr
   - CROATIA_PASSPORT
   - CROATIAN_PASSPORT

3. **Transmission Methods Tested**:
   - FormData field (first position)
   - FormData field (last position)
   - FormData field (middle position)
   - URL path parameter (`/generate/croatia_passport/`)
   - URL query parameter (`?generator=croatia_passport`)
   - Multiple field names simultaneously

### Sample Request Structure
```javascript
const formData = new FormData();
formData.append('generator', 'croatia_passport');
formData.append('LN', 'TestLastName');
formData.append('FN', 'TestFirstName');
// ... other document fields
formData.append('image1', imageBuffer, { filename: 'photo.png' });
formData.append('image2', imageBuffer, { filename: 'signature.png' });

fetch('https://api.veriftools.com/api/integration/generate/', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic bXVsdGlsb2cyNEBwcm90b25tYWlsLmNvbTpLNy1wazJYajh3TXZYcVI=',
    ...formData.getHeaders()
  },
  body: formData
});
```

### Response Pattern Analysis
- **FormData POST requests**: 400 JSON responses (reach API)
- **JSON POST requests**: 403 Cloudflare challenges (blocked)
- **GET requests**: 403 Cloudflare challenges (blocked)
- **OPTIONS requests**: 403 Cloudflare challenges (blocked)

This pattern indicates that only FormData POST requests are allowed through Cloudflare, confirming our approach is correct.

## Document Data Structure
```javascript
{
  LN: 'Worstenman',
  FN: 'Liam',
  NUMBER: '275012473',
  SEX: 'M',
  DOB: '09.09.1990',
  DOI: '15.12.2020',
  DOE: '15.12.2030',
  NATIONALITY: 'HRVATSKO',
  POB: 'ZAGREB',
  POI: 'PU/ZAGREB',
  BACKGROUND: 'Photo',
  BACKGROUND_NUMBER: '1'
}
```

## Images Included
- **image1**: Photo (PNG format, valid image data)
- **image2**: Signature (PNG format, valid image data)

## Environment Details
- **Platform**: Node.js v22.16.0
- **FormData Library**: form-data (Node.js)
- **HTTP Client**: node-fetch
- **Server**: Next.js production environment

## Debugging Performed
1. ✅ Verified FormData creation and field addition
2. ✅ Tested 12+ different generator names
3. ✅ Tested multiple field positioning strategies
4. ✅ Verified authentication is working (no auth errors)
5. ✅ Confirmed API connectivity (receiving structured JSON responses)
6. ✅ Tested alternative transmission methods (URL params, etc.)
7. ✅ Verified image data is properly formatted and included

## Request Flow Analysis
1. **FormData Creation**: ✅ Successful
2. **Generator Field Addition**: ✅ Confirmed in logs
3. **Document Fields Addition**: ✅ All fields added correctly
4. **Image Files Addition**: ✅ Both images added with proper headers
5. **HTTP Request**: ✅ Reaches Veriftools API
6. **API Response**: ❌ Consistent "generator field required" error

## Hypothesis
The API is not receiving the `generator` field despite it being clearly added to the FormData. This suggests:

1. **API Change**: The endpoint may have changed requirements
2. **FormData Parsing Issue**: Server-side FormData parsing may have issues
3. **Field Format Requirement**: The generator field may need specific formatting
4. **Account Permissions**: The API key may not have access to document generation
5. **Hidden Required Fields**: There may be additional required fields not documented

## Request for Support
We need assistance to:

1. **Verify API Requirements**: Confirm the correct format for the generator field
2. **Check Account Status**: Verify our API key has document generation permissions
3. **Review API Changes**: Confirm if there have been recent changes to the generate endpoint
4. **Provide Working Example**: A sample request that successfully generates a Croatian passport

## Contact Information
- **Implementation**: Professional Next.js application with comprehensive error handling
- **Timeline**: This issue has persisted across multiple debugging sessions
- **Impact**: Blocking Croatian passport document generation feature

## Technical Logs
All requests consistently show:
- Successful FormData creation with generator field
- Successful API connection (no network errors)
- Consistent 400 response with generator field required error
- No variation across different approaches

This appears to be an API-level issue requiring Veriftools support team assistance.