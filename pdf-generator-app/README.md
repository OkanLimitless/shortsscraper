# KVK Business Register Extract Generator

This application generates pixel-perfect, exact 1:1 match replicas of KVK (Netherlands Chamber of Commerce) business register extracts.

## Features

- **Exact 1:1 Match**: Precisely replicates the official KVK document layout
- **Table-Based Layout**: Uses HTML tables to ensure perfect alignment of data
- **Proper Typography**: Matches fonts, sizes, weights, and spacing exactly
- **Correct Colors**: Uses exact color matching for all elements
- **Print to PDF**: Built-in functionality to save as PDF with proper formatting
- **Special Character Handling**: Properly handles Unicode characters
- **Responsive UI**: User-friendly interface for data input

## Getting Started

### Prerequisites

- Node.js 14+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd pdf-generator-app
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser to http://localhost:3001

## Usage

1. Fill in the required fields:
   - Trade Name
   - KVK Number
   - Optional: Owner Name (with Unicode character support)

2. Click "Generate KVK Extract"

3. The HTML document will open in a new tab with a print button

4. To save as PDF, click the print button and:
   - Select "Save as PDF" as the destination
   - Set paper size to A4
   - Set margins to "None"
   - Disable headers and footers
   - Click Save

## Implementation Details

### HTML Template

The application uses a carefully crafted HTML template with:

- Table-based layout for perfect alignment
- Absolute positioning for header elements
- Precise typography matching
- Exact color reproduction
- Z-index management for overlapping elements
- Print-specific CSS for PDF generation

### Key Technical Highlights

- Uses CSS tables for perfect data alignment
- Handles special Unicode characters properly
- Dynamic date formatting matching the official KVK format
- Responsive print dialog with instructions
- Magenta bar properly positioned at bottom of the page
- Watermark with proper transparency
- Vertical timestamp on the right edge

## API

The application provides a REST API endpoint for generating the HTML:

- **Endpoint:** `/api/generate-pdf`
- **Method:** POST
- **Content-Type:** application/json
- **Body:**
  ```json
  {
    "tradeName": "Your Company Name",
    "kvkNumber": "12345678",
    "ownerName": "Last Name, First Name",
    "legalForm": "Optional legal form",
    "address": "Optional address",
    "dateOfIncorporation": "Optional date (YYYY-MM-DD)",
    "ownerDOB": "Optional date of birth (YYYY-MM-DD)"
  }
  ```

## Technologies

- Next.js
- React
- Tailwind CSS

## License

This project is licensed under the MIT License - see the LICENSE file for details.
