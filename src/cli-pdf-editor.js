#!/usr/bin/env node
const { editPDF } = require('./pdf-editor');
const fs = require('fs');
const path = require('path');

/**
 * Command-line interface for the PDF editor
 * 
 * Usage:
 * node cli-pdf-editor.js --input=./input.pdf --output=./output.pdf --config=./config.json
 * 
 * The config.json file should contain the data to modify in the PDF
 */

// Parse command-line arguments
const args = process.argv.slice(2);
const params = {};

args.forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.substring(2).split('=');
    params[key] = value;
  }
});

// Check for required parameters
if (!params.input || !params.output) {
  console.log(`
PDF Editor CLI - Edit legal documents automatically

Usage:
  node cli-pdf-editor.js --input=<input-pdf> --output=<output-pdf> [--config=<config-json>]

Options:
  --input    Path to the input PDF template
  --output   Path where the modified PDF will be saved
  --config   (Optional) Path to a JSON configuration file with field data
             If not provided, it will use interactive mode
  
Example:
  node cli-pdf-editor.js --input=./template.pdf --output=./modified.pdf --config=./data.json
  `);
  process.exit(1);
}

// Check if input file exists
if (!fs.existsSync(params.input)) {
  console.error(`Error: Input file "${params.input}" does not exist.`);
  process.exit(1);
}

// Function to load configuration
function loadConfig(configPath) {
  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error(`Error loading configuration file: ${error.message}`);
    process.exit(1);
  }
}

// Main function
async function main() {
  try {
    let data = {};
    
    // Load configuration from file if provided
    if (params.config) {
      data = loadConfig(params.config);
      console.log('Configuration loaded successfully.');
    } else {
      // Example simple data
      data = {
        customText: [
          { 
            text: 'MODIFIED DOCUMENT', 
            x: 50, 
            y: 750, 
            size: 16, 
            color: { r: 1, g: 0, b: 0 }, 
            isBold: true 
          },
          { 
            text: 'Company: Example Corp', 
            x: 50, 
            y: 700, 
            size: 12 
          },
          { 
            text: 'Date: ' + new Date().toLocaleDateString(), 
            x: 50, 
            y: 680, 
            size: 12 
          }
        ]
      };
      console.log('Using default configuration.');
    }
    
    console.log(`Processing PDF...`);
    console.log(`Input: ${params.input}`);
    console.log(`Output: ${params.output}`);
    
    // Process the PDF
    const result = await editPDF(params.input, params.output, data);
    
    if (result.success) {
      console.log(`\nSuccess! Modified PDF saved to: ${params.output}`);
    } else {
      console.error(`\nError: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main(); 