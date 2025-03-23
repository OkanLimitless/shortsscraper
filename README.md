# PDF Editor for Legal Documents

A simple tool to edit PDF documents for legal purposes. This tool allows you to take an existing PDF template and modify it by:

1. Filling in form fields (if they exist in the PDF)
2. Adding custom text at specific positions
3. Saving the modified document with a new name

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```

## Usage

### Basic Usage

Run the editor with command line arguments:

```bash
node src/cli-pdf-editor.js --input=./your-template.pdf --output=./modified-output.pdf --config=./your-config.json
```

### Parameters

- `--input`: Path to the input PDF template
- `--output`: Path where the modified PDF will be saved
- `--config`: (Optional) Path to a JSON configuration file with field data

If no `--config` parameter is provided, default values will be used.

### Configuration File Format

The configuration file should be a JSON file with the following structure:

```json
{
  "FieldName1": "Value for field 1",
  "FieldName2": "Value for field 2",
  "customText": [
    {
      "text": "Text to add to the PDF",
      "x": 50,           // X coordinate (from left)
      "y": 750,          // Y coordinate (from bottom)
      "size": 12,        // Font size
      "color": {         // RGB color (values from 0-1)
        "r": 0,
        "g": 0,
        "b": 0
      },
      "isBold": false    // Whether to use bold font
    },
    // Add more text items as needed
  ]
}
```

## Examples

1. **Basic Example**:
   ```bash
   node src/cli-pdf-editor.js --input=./uittreksel_handelsregister_77678303.pdf --output=./output/modified.pdf
   ```

2. **With Config File**:
   ```bash
   node src/cli-pdf-editor.js --input=./uittreksel_handelsregister_77678303.pdf --output=./output/modified.pdf --config=./src/sample-config.json
   ```

## Determining PDF Field Names

To determine the names of fields in your PDF, you can run the analysis tool:

```bash
node src/analyze-pdf.js
```

This will show information about the PDF including any form fields that might be available for editing.

## Coordinates

When adding custom text, you need to specify the x and y coordinates:

- **X coordinate**: Distance from the left edge of the page (in points)
- **Y coordinate**: Distance from the bottom edge of the page (in points)

The default page size is typically 595.44 x 841.68 points (A4).

## Limitations

- This tool currently works best with simple PDF modifications
- For signature fields, only simple text modifications are possible
- Some PDFs may have restrictions that prevent modifications

## License

MIT 