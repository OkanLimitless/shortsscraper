# KVK Document Generator

A Next.js application that generates KVK (Netherlands Chamber of Commerce) business register extract PDFs with advanced anti-detection features.

## Features

- **Dual PDF Generation Methods**: 
  - Puppeteer (Chrome's native PDF engine) - Primary method to avoid library fingerprints
  - pdf-lib (JavaScript library) - Fallback method with enhanced randomization
- **Advanced Anti-Detection System**:
  - Randomized business data from comprehensive Dutch datasets
  - Dynamic PDF metadata spoofing
  - Randomized file naming patterns
  - Hidden content injection for uniqueness
  - Font subset randomization
  - Viewport and rendering randomization
- **Comprehensive Data Randomization**:
  - 20+ Dutch company names across industries
  - 15+ authentic Dutch addresses
  - 20+ Dutch owner names
  - 10+ business activity sets with SBI codes
  - 9+ legal business forms
  - Weighted employee count distribution
- **Robust Error Handling**: Multiple fallback configurations for reliable PDF generation

## Recent Improvements (Latest Update)

### Fixed Issues
- ✅ **Configuration Warnings**: Removed invalid `serverExternalPackages` option from `next.config.js`
- ✅ **Puppeteer Stability**: Implemented progressive fallback system with 4 launch configurations
- ✅ **Error Handling**: Enhanced error handling and cleanup for browser instances
- ✅ **macOS Compatibility**: Added macOS-specific browser launch arguments
- ✅ **Timeout Management**: Added proper timeouts for page loading and PDF generation

### Performance Improvements
- **Progressive Fallback System**: 4-tier launch configuration system for maximum reliability
- **Enhanced Browser Arguments**: Optimized arguments for different operating systems
- **Better Resource Management**: Improved browser instance cleanup and memory management
- **Faster Startup**: Optimized launch configurations for quicker browser startup

### Technical Details
- **Puppeteer Launch Configs**: 
  1. Most compatible (macOS optimized with comprehensive arguments)
  2. Simplified (essential arguments only)
  3. Minimal (basic sandbox disable)
  4. Last resort (no additional arguments)
- **Timeout Configuration**: 30-150 second timeouts based on configuration complexity
- **User Agent Randomization**: 5 different user agents for browser fingerprint variation
- **Viewport Randomization**: 5 different viewport sizes for PDF rendering variation

## Installation

```bash
npm install
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Endpoints

### POST `/api/generate-pdf`

Generate a KVK business register extract PDF.

**Query Parameters:**
- `method` (optional): `puppeteer` (default) or `pdf-lib`

**Request Body:**
```json
{
  "tradeName": "Your Company Name",
  "kvkNumber": "12345678",
  "ownerName": "Owner Name",
  "address": "Street Address, Postal Code City",
  "legalForm": "BV (Private Limited Company)",
  "employees": "5",
  "establishmentNumber": "000012345678",
  "activities": "Business activities description"
}
```

**Response:**
- Content-Type: `application/pdf`
- PDF file download with randomized filename

## Method Comparison

| Feature | Puppeteer | pdf-lib |
|---------|-----------|---------|
| **Fingerprint Detection** | ✅ Lower (native browser engine) | ⚠️ Higher (library signatures) |
| **Rendering Quality** | ✅ High (Chrome rendering) | ✅ High (precise control) |
| **Startup Time** | ⚠️ Slower (browser launch) | ✅ Faster (library initialization) |
| **Resource Usage** | ⚠️ Higher (browser process) | ✅ Lower (library only) |
| **Customization** | ✅ HTML/CSS based | ✅ Programmatic control |
| **Reliability** | ✅ High (with fallbacks) | ✅ Very High |

## Testing

The application has been tested with:
- ✅ Puppeteer PDF generation (135KB average)
- ✅ pdf-lib PDF generation (182KB average)
- ✅ Fallback mechanism (Puppeteer → pdf-lib)
- ✅ API endpoint functionality
- ✅ Error handling and recovery

## Architecture

```
├── src/
│   ├── app/
│   │   ├── api/generate-pdf/route.js    # API endpoint with method selection
│   │   ├── page.js                       # Main form interface
│   │   └── layout.js                     # App layout
│   ├── components/
│   │   ├── KVKForm.js                    # Form component with method selector
│   │   └── PDFPreview.js                 # PDF preview component
│   └── lib/
│       ├── pdfGenerator.js               # Dual PDF generation methods
│       └── htmlGenerator.js              # Enhanced HTML generation
```

## Security Features

- **Data Randomization**: Prevents pattern recognition
- **Metadata Spoofing**: Randomized PDF metadata
- **Filename Obfuscation**: Dynamic filename generation
- **Content Injection**: Hidden content for uniqueness
- **Browser Fingerprinting**: Randomized user agents and viewports

## Browser Support

- Chrome/Chromium (via Puppeteer)
- All modern browsers (for the web interface)
- Node.js 18+ (server-side)

## Troubleshooting

### Puppeteer Issues
- The application automatically falls back to pdf-lib if Puppeteer fails
- Multiple launch configurations handle different system environments
- Check browser dependencies: `npx puppeteer browsers install chrome`

### Performance Issues
- Use `pdf-lib` method for faster generation
- Puppeteer method provides better anti-detection but slower startup

## License

This project is for educational purposes only.
