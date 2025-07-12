import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

/**
 * Enhanced PDF Generator with multiple generation methods to avoid fingerprinting
 * Uses both pdf-lib and Puppeteer approaches with randomization
 */

// Enhanced randomization functions to avoid detection patterns
const RANDOM_DATASETS = {
  // Varied Dutch company names with different industries
  tradeNames: [
    'Innovate Solutions B.V.',
    'Digital Bridge Consultancy',
    'Creative Minds Marketing',
    'Tech Forward Solutions',
    'Modern Business Partners',
    'Strategic Growth Advisors',
    'Elite Service Group',
    'Advanced Systems B.V.',
    'Dynamic Ventures Ltd.',
    'Premier Business Solutions',
    'Future Focus Consulting',
    'Smart Solutions Network',
    'Excellence Partners B.V.',
    'Progressive Business Group',
    'Optimal Results Consultancy',
    'Professional Edge Solutions',
    'NextGen Business Services',
    'Quality First Consulting',
    'Reliable Partners Group',
    'Success Driven Solutions'
  ],
  
  // Varied Dutch addresses from different cities
  addresses: [
    'Hoofdstraat 15, 1011AA Amsterdam',
    'Lange Voorhout 23, 2514EB Den Haag',
    'Coolsingel 67, 3012AC Rotterdam',
    'Neude 11, 3512AD Utrecht',
    'Grote Markt 45, 9712HN Groningen',
    'Stratumseind 89, 5611ET Eindhoven',
    'Grote Kerkstraat 34, 8011PK Zwolle',
    'Breestraat 71, 2311CS Leiden',
    'Oude Markt 28, 6511VL Nijmegen',
    'Vismarkt 12, 4811WV Breda',
    'Korte Putstraat 3, 5211KN Den Bosch',
    'Grote Markt 56, 2000AN Haarlem',
    'Walstraat 91, 4331BK Middelburg',
    'Broerstraat 44, 9712CP Groningen',
    'Spuistraat 134, 1012VB Amsterdam'
  ],
  
  // Varied Dutch surnames and names
  ownerNames: [
    'Van der Berg, Jan',
    'De Vries, Maria',
    'Janssen, Pieter',
    'Van Dijk, Sandra',
    'Bakker, Thomas',
    'Visser, Linda',
    'Smit, Robert',
    'Meijer, Annika',
    'De Boer, Martijn',
    'Mulder, Femke',
    'De Groot, Stefan',
    'Bos, Ingrid',
    'Vos, Dennis',
    'Peters, Marieke',
    'Hendriks, Jeroen',
    'Van Leeuwen, Sanne',
    'Dekker, Marco',
    'Brouwer, Esther',
    'De Wit, Bas',
    'Van der Meer, Nathalie'
  ],
  
  // Varied business activities with different SBI codes
  activities: [
    [
      'SBI-code: 70221 - Management consultancy',
      'SBI-code: 82999 - Other business support services'
    ],
    [
      'SBI-code: 6202 - Computer consultancy activities',
      'SBI-code: 6311 - Data processing, hosting and related activities'
    ],
    [
      'SBI-code: 73111 - Advertising agencies',
      'SBI-code: 73120 - Media representation services'
    ],
    [
      'SBI-code: 46901 - Non-specialised wholesale trade',
      'SBI-code: 46902 - Wholesale trade via internet'
    ],
    [
      'SBI-code: 85592 - Business training and coaching',
      'SBI-code: 85593 - Driving schools for motor vehicles'
    ],
    [
      'SBI-code: 74101 - Communication and graphic design',
      'SBI-code: 6201 - Writing, producing and publishing of software'
    ],
    [
      'SBI-code: 43210 - Electrical installation work',
      'SBI-code: 43221 - Plumbing and fitting work'
    ],
    [
      'SBI-code: 56101 - Restaurants',
      'SBI-code: 56102 - Fast food restaurants, cafeterias, ice cream parlours'
    ],
    [
      'SBI-code: 68204 - Letting of non-residential real estate',
      'SBI-code: 68311 - Real estate agencies'
    ],
    [
      'SBI-code: 47911 - Retail trade via internet',
      'SBI-code: 47914 - Retail trade via catalog companies'
    ]
  ],
  
  // Varied legal forms
  legalForms: [
    'Eenmanszaak (comparable with One-man business)',
    'Besloten vennootschap (comparable with Private limited company)',
    'Naamloze vennootschap (comparable with Public limited company)',
    'Vennootschap onder firma (comparable with General partnership)',
    'Commanditaire vennootschap (comparable with Limited partnership)',
    'Maatschap (comparable with Professional partnership)',
    'Coöperatie (comparable with Cooperative)',
    'Vereniging (comparable with Association)',
    'Stichting (comparable with Foundation)'
  ],
  
  // Varied PDF metadata producers
  producers: [
    'StreamServe Communication Server 23.3 Build 16.6.70 GA 496 (64 bit)',
    'StreamServe Communication Server 23.2 Build 16.5.82 GA 451 (64 bit)',
    'StreamServe Communication Server 23.4 Build 16.7.33 GA 512 (64 bit)',
    'StreamServe Communication Server 22.9 Build 16.4.91 GA 387 (64 bit)',
    'StreamServe Communication Server 23.1 Build 16.6.45 GA 478 (64 bit)',
    'Adobe Acrobat Pro DC 2023.006.20320',
    'Microsoft Print to PDF 22.0.1.0',
    'PDFCreator 5.1.2.0',
    'Foxit PDF Creator 12.1.0.0',
    'Nitro PDF Professional 14.12.1.0'
  ],
  
  // Varied PDF titles
  titles: [
    'titel',
    'Business Register Extract',
    'Handelsregister Uittreksel',
    'KvK Extract',
    'Chamber of Commerce Extract',
    'Official Business Registration',
    'Bedrijfsregistratie',
    'Handelsinformatie'
  ]
};

// Generate random item from array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate random business data to avoid detection
function generateRandomBusinessData() {
  const tradeName = getRandomItem(RANDOM_DATASETS.tradeNames);
  const address = getRandomItem(RANDOM_DATASETS.addresses);
  const ownerName = getRandomItem(RANDOM_DATASETS.ownerNames);
  const activities = getRandomItem(RANDOM_DATASETS.activities);
  const legalForm = getRandomItem(RANDOM_DATASETS.legalForms);
  
  // Generate realistic KVK number (8 digits)
  const kvkNumber = (Math.floor(Math.random() * 90000000) + 10000000).toString();
  
  // Generate realistic establishment number (12 digits starting with 000)
  const establishmentNumber = '000' + (Math.floor(Math.random() * 900000000) + 100000000).toString();
  
  return {
    tradeName,
    address,
    ownerName,
    activities,
    legalForm,
    kvkNumber,
    establishmentNumber
  };
}

// Generate random metadata to avoid detection
function generateRandomMetadata() {
  const producer = getRandomItem(RANDOM_DATASETS.producers);
  const title = getRandomItem(RANDOM_DATASETS.titles);
  
  return { producer, title };
}

// Generate random font subset prefixes (like EFYYZG+, EFZALS+)
function generateFontPrefix() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let prefix = '';
  for (let i = 0; i < 6; i++) {
    prefix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + '+';
}

// Generate realistic UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Generate realistic creation dates with timezone
function generateRealisticDates() {
  const now = new Date();
  // Create date should be slightly before modify date
  const createDate = new Date(now.getTime() - Math.random() * 3600000); // Up to 1 hour before
  const modifyDate = new Date(createDate.getTime() + Math.random() * 1800000); // Up to 30 minutes after create
  
  // Format for PDF metadata (ISO format with timezone)
  const formatPDFDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}:${month}:${day} ${hours}:${minutes}:${seconds}+02:00`;
  };
  
  return {
    createDate: formatPDFDate(createDate),
    modifyDate: formatPDFDate(modifyDate),
    metadataDate: formatPDFDate(modifyDate)
  };
}

// Helper function to load image from public folder
async function loadImage(imagePath) {
  try {
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath);
    }
    return null;
  } catch (error) {
    console.log(`Could not load image ${imagePath}:`, error.message);
    return null;
  }
}

export async function generatePDF(formData) {
  try {
    console.log('Starting PDF generation...');
    
    // Generate random business data if not provided
    const randomData = generateRandomBusinessData();
    const randomMetadata = generateRandomMetadata();
    
    // Create a new PDF document with enhanced options
    const pdfDoc = await PDFDocument.create({
      useObjectStreams: false,
    });
    
    console.log('PDF document created');
    
    // Generate metadata for spoofing
    const dates = generateRealisticDates();
    const documentId = generateUUID();
    const instanceId = generateUUID();
    
    // Set PDF metadata with randomized values to avoid detection
    pdfDoc.setTitle(randomMetadata.title);
    pdfDoc.setProducer(randomMetadata.producer);
    pdfDoc.setCreator(''); // Remove pdf-lib reference
    pdfDoc.setSubject('Business Register extract');
    pdfDoc.setKeywords(['KVK', 'Business Register', 'Chamber of Commerce', 'Netherlands']);
    pdfDoc.setCreationDate(dates.createDate);
    pdfDoc.setModificationDate(dates.modifyDate);
    
    // Note: pdf-lib doesn't support setVersion, so we'll skip that
    console.log('Enhanced metadata set with randomized values');
    
    const page = pdfDoc.addPage([595.44, 841.68]); // Exact A4 size from original
    
    console.log('Page added');
    
    // Get page dimensions
    const { width, height } = page.getSize();
    
    // Load fonts with subset-style naming to mimic original
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    
    // Generate font subset prefixes to mimic original structure
    const fontPrefixes = {
      regular: generateFontPrefix(),
      bold: generateFontPrefix()
    };
    
    console.log(`Fonts loaded with subset prefixes: ${fontPrefixes.regular}Roboto-Regular, ${fontPrefixes.bold}Roboto-Bold`);
    
    // Try to load and embed images to match original document
    let kvkLogoImage = null;
    let bottomBarImage = null;
    
    try {
      const kvkLogoBytes = await loadImage('images/kvklogo.png');
      if (kvkLogoBytes) {
        kvkLogoImage = await pdfDoc.embedPng(kvkLogoBytes);
        console.log('KVK logo embedded successfully');
      }
      
      const bottomBarBytes = await loadImage('images/bottombar.png');
      if (bottomBarBytes) {
        bottomBarImage = await pdfDoc.embedPng(bottomBarBytes);
        console.log('Bottom bar image embedded successfully');
      }
    } catch (error) {
      console.log('Could not embed images:', error.message);
    }
    
    // Helper function to draw separator lines
    const drawSeparatorLine = (yPosition) => {
      page.drawLine({
        start: { x: 111, y: yPosition },
        end: { x: width - 111, y: yPosition },
        thickness: 0.7,
        color: rgb(0.8, 0.8, 0.8),
      });
    };
    
    // Consistent spacing variables
    const sectionTitleFontSize = 11;
    const labelFontSize = 9;
    const valueFontSize = 9;
    const noteFontSize = 9;
    const leftMargin = 111;
    const labelIndent = leftMargin;
    const valueIndent = leftMargin + 180;
    
    // --- Draw the KVK logo (image or text fallback) ---
    if (kvkLogoImage) {
      page.drawImage(kvkLogoImage, {
        x: leftMargin,
        y: height - 115,
        width: 60,
        height: 20,
      });
    } else {
      page.drawText('KVK', {
        x: leftMargin,
        y: height - 95,
        size: 34,
        font: boldFont,
        color: rgb(0.125, 0.29, 0.388),
      });
    }
    
    // --- Add title and subtitle ---
    page.drawText('Business Register extract', {
      x: leftMargin,
      y: height - 187,
      size: 16,
      font: boldFont,
      color: rgb(0.125, 0.29, 0.388),
    });
    
    page.drawText('Netherlands Chamber of Commerce', {
      x: leftMargin,
      y: height - 212,
      size: 16,
      font: boldFont,
      color: rgb(0.125, 0.29, 0.388),
    });
    
    drawSeparatorLine(height - 232);
    
    // --- Add CCI number ---
    page.drawText('CCI number', {
      x: leftMargin,
      y: height - 255,
      size: labelFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    const kvkNumber = formData.kvkNumber || randomData.kvkNumber;
    page.drawText(kvkNumber, {
      x: valueIndent,
      y: height - 255,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    drawSeparatorLine(height - 275);
    
    page.drawText('Page 1 (of 1)', {
      x: leftMargin,
      y: height - 305,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    drawSeparatorLine(height - 325);
    
    // --- Add disclaimer ---
    const disclaimerText1 = 'The company / organisation does not want its address details to be used for';
    const disclaimerText2 = 'unsolicited postal advertising or visits from sales representatives.';
    
    page.drawText(disclaimerText1, {
      x: width / 2 - 200,
      y: height - 362,
      size: noteFontSize,
      font: italicFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(disclaimerText2, {
      x: width / 2 - 200,
      y: height - 377,
      size: noteFontSize,
      font: italicFont,
      color: rgb(0, 0, 0),
    });
    
    drawSeparatorLine(height - 400);
    
    // --- COMPANY section ---
    page.drawText('Company', {
      x: leftMargin,
      y: height - 430,
      size: sectionTitleFontSize,
      font: boldFont,
      color: rgb(0.125, 0.29, 0.388),
    });
    
    drawSeparatorLine(height - 445);
    
    // Trade names
    page.drawText('Trade names', {
      x: labelIndent,
      y: height - 465,
      size: labelFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    const tradeName = formData.tradeName || randomData.tradeName;
    page.drawText(tradeName, {
      x: valueIndent,
      y: height - 465,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    // Trade name alias if provided
    if (formData.tradeNameAlias && formData.tradeNameAlias.trim() !== '') {
      page.drawText(formData.tradeNameAlias, {
        x: valueIndent,
        y: height - 480,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
    }
    
    // Legal form
    page.drawText('Legal form', {
      x: labelIndent,
      y: height - 490,
      size: labelFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    const legalFormText = formData.legalForm || randomData.legalForm;
    page.drawText(legalFormText, {
      x: valueIndent,
      y: height - 490,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    // Generate random realistic start date with varied ranges
    const generateRandomStartDate = () => {
      const now = new Date();
      // Vary the range more significantly - between 6 months and 10 years
      const minMonths = 6;
      const maxMonths = 120;
      const randomMonths = Math.floor(Math.random() * (maxMonths - minMonths + 1)) + minMonths;
      const pastDate = new Date(now);
      pastDate.setMonth(now.getMonth() - randomMonths);
      
      const day = pastDate.getDate().toString().padStart(2, '0');
      const month = (pastDate.getMonth() + 1).toString().padStart(2, '0');
      const year = pastDate.getFullYear();
      
      const regDate = new Date(pastDate);
      // Vary registration delay between 1 and 45 days
      const regDelay = Math.floor(Math.random() * 45) + 1;
      regDate.setDate(regDate.getDate() + regDelay);
      const regDay = regDate.getDate().toString().padStart(2, '0');
      const regMonth = (regDate.getMonth() + 1).toString().padStart(2, '0');
      const regYear = regDate.getFullYear();
      
      return `${day}-${month}-${year} (registration date: ${regDay}-${regMonth}-${regYear})`;
    };
    
    // Company start date
    page.drawText('Company start date', {
      x: labelIndent,
      y: height - 510,
      size: labelFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    const startDate = formData.dateOfIncorporation ? 
      formatDutchDate(formData.dateOfIncorporation) : 
      generateRandomStartDate();
      
    page.drawText(startDate, {
      x: valueIndent,
      y: height - 510,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    // Activities
    page.drawText('Activities', {
      x: labelIndent,
      y: height - 530,
      size: labelFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    const activity1 = randomData.activities[0];
    const activity2 = randomData.activities[1];
    
    page.drawText(activity1, {
      x: valueIndent,
      y: height - 530,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(activity2, {
      x: valueIndent,
      y: height - 545,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    // Employees
    page.drawText('Employees', {
      x: labelIndent,
      y: height - 565,
      size: labelFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    // Generate more varied employee counts
    const generateEmployeeCount = () => {
      const ranges = [
        { min: 0, max: 2, weight: 40 },    // 0-2 employees (40% chance)
        { min: 3, max: 10, weight: 30 },   // 3-10 employees (30% chance)
        { min: 11, max: 50, weight: 20 },  // 11-50 employees (20% chance)
        { min: 51, max: 250, weight: 10 }  // 51-250 employees (10% chance)
      ];
      
      const random = Math.random() * 100;
      let cumulative = 0;
      
      for (const range of ranges) {
        cumulative += range.weight;
        if (random <= cumulative) {
          return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        }
      }
      
      return 1; // Fallback
    };
    
    const employees = formData.employees || generateEmployeeCount().toString();
    page.drawText(employees, {
      x: valueIndent,
      y: height - 565,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    // Add ESTABLISHMENT section
    drawSeparatorLine(height - 585);
    
    page.drawText('Establishment', {
      x: leftMargin,
      y: height - 615,
      size: sectionTitleFontSize,
      font: boldFont,
      color: rgb(0.125, 0.29, 0.388),
    });
    
    drawSeparatorLine(height - 630);
    
    // Establishment number
    page.drawText('Establishment number', {
      x: labelIndent,
      y: height - 650,
      size: labelFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    const establishmentNumber = formData.establishmentNumber || randomData.establishmentNumber;
    page.drawText(establishmentNumber, {
      x: valueIndent,
      y: height - 650,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    // Trade names (repeated for establishment)
    page.drawText('Trade names', {
      x: labelIndent,
      y: height - 670,
      size: labelFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(tradeName, {
      x: valueIndent,
      y: height - 670,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    if (formData.tradeNameAlias && formData.tradeNameAlias.trim() !== '') {
      page.drawText(formData.tradeNameAlias, {
        x: valueIndent,
        y: height - 685,
        size: valueFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
    }
    
    // Visiting address
    page.drawText('Visiting address', {
      x: labelIndent,
      y: height - 700,
      size: labelFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    const address = formData.address || randomData.address;
    page.drawText(address, {
      x: valueIndent,
      y: height - 700,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    // Add OWNER section
    drawSeparatorLine(height - 720);
    
    page.drawText('Owner', {
      x: leftMargin,
      y: height - 750,
      size: sectionTitleFontSize,
      font: boldFont,
      color: rgb(0.125, 0.29, 0.388),
    });
    
    drawSeparatorLine(height - 765);
    
    // Name
    page.drawText('Name', {
      x: labelIndent,
      y: height - 785,
      size: labelFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    let ownerName = formData.ownerName || randomData.ownerName;
    ownerName = ownerName.replace(/ṛ/g, 'r');
    
    page.drawText(ownerName, {
      x: valueIndent,
      y: height - 785,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    // Date of birth
    page.drawText('Date of birth', {
      x: labelIndent,
      y: height - 805,
      size: labelFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    // Generate random date of birth if not provided
    const generateRandomDOB = () => {
      const startYear = 1970;
      const endYear = 2000;
      const randomYear = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
      const randomMonth = Math.floor(Math.random() * 12) + 1;
      const randomDay = Math.floor(Math.random() * 28) + 1; // Use 28 to avoid invalid dates
      
      return `${randomDay.toString().padStart(2, '0')}-${randomMonth.toString().padStart(2, '0')}-${randomYear}`;
    };
    
    const dob = formData.ownerDOB ? 
      formatDutchDate(formData.ownerDOB) : 
      generateRandomDOB();
      
    page.drawText(dob, {
      x: valueIndent,
      y: height - 805,
      size: valueFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    // Add more content to increase file size
    drawSeparatorLine(height - 825);
    
    // --- Add extraction date ---
    const today = new Date();
    const extractionDate = today.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
    
    const extractionTime = today.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    }).replace(':', '.');
    
    page.drawText(`Extract was made on ${extractionDate} at ${extractionTime} hours.`, {
      x: width / 2 - 110,
      y: 150,
      size: noteFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    // --- Add WAARMERK watermark ---
    page.drawText('WAARMERK', {
      x: 112,
      y: 64,
      size: 14,
      font: boldFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    page.drawText('KAMER VAN KOOPHANDEL', {
      x: 112,
      y: 48,
      size: 8,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // --- Add footer text ---
    const footerFontSize = 7;
    const footerX = 230;
    const footerLineHeight = 10;
    
    const footerLines = [
      'This extract has been certified with a digital signature and is an official proof of registration in the Business',
      'Register. You can check the integrity of this document and validate the signature in Adobe at the top of your',
      'screen. The Chamber of Commerce recommends that this document be viewed in digital form so that its',
      'integrity is safeguarded and the signature remains verifiable.'
    ];
    
    footerLines.forEach((line, index) => {
      page.drawText(line, {
        x: footerX,
        y: 64 - (index * footerLineHeight),
        size: footerFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
    });
    
    // --- Add vertical timestamp at right edge ---
    const timestamp = today.toISOString().slice(0, 19).replace('T', ' ');
    
    page.drawText(timestamp, {
      x: width - 10,
      y: 140,
      size: 8,
      font: regularFont,
      color: rgb(0.3, 0.3, 0.3),
      rotate: {
        type: 'degrees',
        angle: 90,
      },
    });
    
    // --- Add pink/magenta bar at bottom (image or rectangle fallback) ---
    if (bottomBarImage) {
      page.drawImage(bottomBarImage, {
        x: 0,
        y: 0,
        width: width,
        height: 24,
      });
    } else {
      const barHeight = 24;
      page.drawRectangle({
        x: 0,
        y: 0,
        width: width,
        height: barHeight,
        color: rgb(0.85, 0, 0.5),
      });
    }
    
    // Add randomized content to increase file size and vary structure
    const hiddenContentCount = Math.floor(Math.random() * 100) + 150; // 150-250 items
    const hiddenPhrases = [
      'Processing Layer',
      'Verification Hash',
      'Authority Reference',
      'Signature Validation',
      'Compliance Check',
      'Standards Verification',
      'Metadata Container',
      'Color Profile',
      'Font Subset',
      'Handler Configuration',
      'Security Token',
      'Encryption Key',
      'Document Structure',
      'Content Stream',
      'Object Reference',
      'Page Tree',
      'Resource Dictionary',
      'Catalog Entry',
      'Cross Reference',
      'Trailer Information'
    ];
    
    for (let i = 0; i < hiddenContentCount; i++) {
      const randomPhrase = getRandomItem(hiddenPhrases);
      const randomNum = Math.floor(Math.random() * 10000);
      const randomX = -Math.floor(Math.random() * 5000) - 1000;
      const randomY = -Math.floor(Math.random() * 5000) - 1000;
      
      page.drawText(`${randomPhrase} ${randomNum}`, {
        x: randomX,
        y: randomY,
        size: 1,
        font: regularFont,
        color: rgb(1, 1, 1), // Invisible white text
      });
    }
    
    // Add more randomized structural content
    const structuralVariations = [
      'StreamServe Processing Layer',
      'Adobe Processing Engine',
      'Document Verification System',
      'Certification Authority Handler',
      'Digital Signature Module',
      'PDF/A Compliance Engine',
      'Accessibility Standards Module',
      'XMP Metadata Parser',
      'Color Profile Manager',
      'Font Subset Optimizer',
      'Security Handler Module',
      'Content Stream Processor',
      'Object Reference Manager',
      'Page Tree Handler',
      'Resource Dictionary Parser'
    ];
    
    const structuralCount = Math.floor(Math.random() * 10) + 5;
    for (let i = 0; i < structuralCount; i++) {
      const randomStructure = getRandomItem(structuralVariations);
      const iterations = Math.floor(Math.random() * 15) + 5;
      
      for (let j = 0; j < iterations; j++) {
        const randomX = -Math.floor(Math.random() * 3000) - 1000;
        const randomY = -Math.floor(Math.random() * 3000) - 1000;
        
        page.drawText(`${randomStructure} ${j}`, {
          x: randomX,
          y: randomY,
          size: 1,
          font: regularFont,
          color: rgb(1, 1, 1), // Invisible
        });
      }
    }
    
    console.log('Content drawn');
    
    // Save the PDF document with options to increase file size and disable compression
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: false, // Disable compression
      addDefaultPage: false,
      objectsPerTick: 25, // Smaller chunks for more objects
      updateFieldAppearances: true,
    });
    
    console.log(`Generated PDF with advanced anti-detection randomization:`);
    console.log(`- Producer: ${randomMetadata.producer}`);
    console.log(`- Title: ${randomMetadata.title}`);
    console.log(`- Creator: [REMOVED]`);
    console.log(`- Font prefixes: ${fontPrefixes.regular}Roboto-Regular, ${fontPrefixes.bold}Roboto-Bold`);
    console.log(`- Document ID: ${documentId}`);
    console.log(`- Instance ID: ${instanceId}`);
    console.log(`- KVK Number: ${kvkNumber}`);
    console.log(`- Trade Name: ${tradeName}`);
    console.log(`- Owner: ${ownerName}`);
    console.log(`- Activities: ${activity1}, ${activity2}`);
    console.log(`- Hidden content items: ${hiddenContentCount}`);
    console.log(`- Images embedded: ${kvkLogoImage ? 'KVK Logo' : 'None'}, ${bottomBarImage ? 'Bottom Bar' : 'None'}`);
    console.log(`- PDF saved successfully, size: ${pdfBytes.length}`);
    
    return pdfBytes;
    
  } catch (error) {
    console.error('Error in generatePDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

// NEW: Puppeteer-based PDF generation to avoid pdf-lib fingerprints
export async function generatePDFWithPuppeteer(formData) {
  let browser;
  
  try {
    console.log('Starting Puppeteer PDF generation...');
    
    // Generate random business data if not provided
    const randomData = generateRandomBusinessData();
    
    // Launch browser with randomized user agent and viewport
    const userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
    ];
    
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-features=VizDisplayCompositor',
        `--user-agent=${randomUserAgent}`
      ]
    });
    
    const page = await browser.newPage();
    
    // Set random viewport to vary PDF characteristics
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 },
      { width: 1280, height: 720 }
    ];
    
    const randomViewport = viewports[Math.floor(Math.random() * viewports.length)];
    await page.setViewport(randomViewport);
    
    // Generate enhanced HTML with anti-detection features
    const htmlContent = generateEnhancedHTML(formData, randomData);
    
    // Set content and wait for resources to load
    await page.setContent(htmlContent, {
      waitUntil: ['networkidle0', 'domcontentloaded']
    });
    
    // Add random delay to simulate human behavior
    await page.waitForTimeout(Math.floor(Math.random() * 2000) + 1000);
    
    // Generate PDF with randomized settings
    const randomMargin = Math.floor(Math.random() * 5) + 10; // 10-15mm
    const randomScale = 0.95 + Math.random() * 0.1; // 0.95-1.05
    
    const pdfOptions = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: `${randomMargin}mm`,
        bottom: `${randomMargin}mm`,
        left: `${randomMargin}mm`,
        right: `${randomMargin}mm`
      },
      scale: randomScale,
      preferCSSPageSize: false,
      displayHeaderFooter: false,
      // Add random metadata to PDF
      tagged: Math.random() > 0.5,
      outline: Math.random() > 0.7
    };
    
    const pdfBuffer = await page.pdf(pdfOptions);
    
    console.log(`Generated PDF with Puppeteer - Size: ${pdfBuffer.length} bytes`);
    console.log(`- User Agent: ${randomUserAgent}`);
    console.log(`- Viewport: ${randomViewport.width}x${randomViewport.height}`);
    console.log(`- Margin: ${randomMargin}mm`);
    console.log(`- Scale: ${randomScale}`);
    console.log(`- Business Data: ${randomData.tradeName}, ${randomData.kvkNumber}`);
    
    await browser.close();
    return pdfBuffer;
    
  } catch (error) {
    console.error('Error in Puppeteer PDF generation:', error);
    if (browser) await browser.close();
    throw new Error(`Failed to generate PDF with Puppeteer: ${error.message}`);
  }
}

// Enhanced HTML generator with anti-detection features
function generateEnhancedHTML(formData, randomData) {
  // Use randomized data if not provided
  const tradeName = formData.tradeName || randomData.tradeName;
  const kvkNumber = formData.kvkNumber || randomData.kvkNumber;
  const ownerName = formData.ownerName || randomData.ownerName;
  const address = formData.address || randomData.address;
  const establishmentNumber = formData.establishmentNumber || randomData.establishmentNumber;
  const legalForm = formData.legalForm || randomData.legalForm;
  const activities = randomData.activities;
  
  // Generate random dates
  const generateRandomDate = (minDays, maxDays) => {
    const now = new Date();
    const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
    const date = new Date(now.getTime() - (randomDays * 24 * 60 * 60 * 1000));
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    const regDate = new Date(date.getTime() + (Math.floor(Math.random() * 30) + 1) * 24 * 60 * 60 * 1000);
    const regDay = regDate.getDate().toString().padStart(2, '0');
    const regMonth = (regDate.getMonth() + 1).toString().padStart(2, '0');
    const regYear = regDate.getFullYear();
    
    return `${day}-${month}-${year} (registration date: ${regDay}-${regMonth}-${regYear})`;
  };
  
  const startDate = generateRandomDate(30, 1800); // 30 days to 5 years
  const entryDate = generateRandomDate(1, 365); // 1 day to 1 year
  
  // Generate proper date of birth (24-50 years old)
  const generateDOB = () => {
    const now = new Date();
    const minAge = 24;
    const maxAge = 50;
    const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
    const birthYear = now.getFullYear() - age;
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1; // Use 28 to avoid invalid dates
    
    return `${birthDay.toString().padStart(2, '0')}-${birthMonth.toString().padStart(2, '0')}-${birthYear}`;
  };
  
  const dob = generateDOB();
  
  // Generate random employee count with weighted distribution
  const generateEmployeeCount = () => {
    const rand = Math.random();
    if (rand < 0.4) return Math.floor(Math.random() * 3); // 0-2 (40%)
    if (rand < 0.7) return Math.floor(Math.random() * 8) + 3; // 3-10 (30%)
    if (rand < 0.9) return Math.floor(Math.random() * 40) + 11; // 11-50 (20%)
    return Math.floor(Math.random() * 200) + 51; // 51-250 (10%)
  };
  
  const employees = generateEmployeeCount();
  
  // Current date formatting
  const today = new Date();
  const extractionDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
  const extractionTime = `${today.getHours().toString().padStart(2, '0')}.${today.getMinutes().toString().padStart(2, '0')}`;
  const timestamp = today.toISOString().slice(0, 19).replace('T', ' ');
  
  // Generate random CSS variations to avoid fingerprinting
  const fontVariations = [
    'font-family: Arial, Helvetica, sans-serif;',
    'font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;',
    'font-family: system-ui, -apple-system, sans-serif;',
    'font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;'
  ];
  
  const randomFont = fontVariations[Math.floor(Math.random() * fontVariations.length)];
  const randomSpacing = Math.floor(Math.random() * 3) + 1; // 1-3px
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Business Register Extract</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 15mm;
    }
    
    body {
      ${randomFont}
      font-size: 10px;
      line-height: 1.3;
      color: #000;
      background: #fff;
      width: 210mm;
      min-height: 297mm;
      padding: 20px;
      letter-spacing: ${randomSpacing * 0.1}px;
    }
    
    .header {
      margin-bottom: 25px;
    }
    
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #204a63;
      margin-bottom: 20px;
    }
    
    .title {
      font-size: 16px;
      font-weight: bold;
      color: #204a63;
      margin-bottom: 5px;
    }
    
    .subtitle {
      font-size: 16px;
      font-weight: bold;
      color: #204a63;
      margin-bottom: 20px;
    }
    
    .separator {
      height: 1px;
      background: #ccc;
      margin: 10px 0;
    }
    
    .section {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 11px;
      font-weight: bold;
      color: #204a63;
      text-transform: uppercase;
      margin-bottom: 10px;
      padding: 5px 0;
      border-top: 1px solid #ccc;
      border-bottom: 1px solid #ccc;
    }
    
    .field {
      display: flex;
      margin-bottom: 8px;
      align-items: flex-start;
    }
    
    .field-label {
      font-weight: bold;
      min-width: 180px;
      margin-right: 20px;
    }
    
    .field-value {
      flex: 1;
    }
    
    .disclaimer {
      text-align: center;
      font-style: italic;
      margin: 20px 0;
      padding: 15px;
    }
    
    .footer {
      margin-top: 40px;
      position: relative;
    }
    
    .extract-info {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .watermark {
      position: absolute;
      bottom: 80px;
      left: 0;
      font-size: 14px;
      font-weight: bold;
      color: rgba(128, 128, 128, 0.3);
    }
    
    .kvk-sub {
      position: absolute;
      bottom: 65px;
      left: 0;
      font-size: 8px;
      color: rgba(128, 128, 128, 0.3);
    }
    
    .footer-text {
      position: absolute;
      bottom: 60px;
      left: 120px;
      right: 0;
      font-size: 7px;
      line-height: 1.4;
    }
    
    .timestamp {
      position: absolute;
      bottom: 100px;
      right: 20px;
      font-size: 8px;
      color: #666;
      transform: rotate(90deg);
      transform-origin: right center;
    }
    
    .bottom-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 20px;
      background: #d90080;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">KVK</div>
    <div class="title">Business Register extract</div>
    <div class="subtitle">Netherlands Chamber of Commerce</div>
  </div>
  
  <div class="separator"></div>
  
  <div class="field">
    <div class="field-label">CCI number</div>
    <div class="field-value">${kvkNumber}</div>
  </div>
  
  <div class="separator"></div>
  
  <div class="field">
    <div class="field-label">Page 1 (of 1)</div>
    <div class="field-value"></div>
  </div>
  
  <div class="separator"></div>
  
  <div class="disclaimer">
    The company / organisation does not want its address details to be used for<br>
    unsolicited postal advertising or visits from sales representatives.
  </div>
  
  <div class="separator"></div>
  
  <div class="section">
    <div class="section-title">Company</div>
    
    <div class="field">
      <div class="field-label">Trade names</div>
      <div class="field-value">${tradeName}</div>
    </div>
    
    <div class="field">
      <div class="field-label">Legal form</div>
      <div class="field-value">${legalForm}</div>
    </div>
    
    <div class="field">
      <div class="field-label">Company start date</div>
      <div class="field-value">${startDate}</div>
    </div>
    
    <div class="field">
      <div class="field-label">Activities</div>
      <div class="field-value">
        ${activities[0]}<br>
        ${activities[1]}
      </div>
    </div>
    
    <div class="field">
      <div class="field-label">Employees</div>
      <div class="field-value">${employees}</div>
    </div>
  </div>
  
  <div class="separator"></div>
  
  <div class="section">
    <div class="section-title">Establishment</div>
    
    <div class="field">
      <div class="field-label">Establishment number</div>
      <div class="field-value">${establishmentNumber}</div>
    </div>
    
    <div class="field">
      <div class="field-label">Trade names</div>
      <div class="field-value">${tradeName}</div>
    </div>
    
    <div class="field">
      <div class="field-label">Visiting address</div>
      <div class="field-value">${address}</div>
    </div>
    
    <div class="field">
      <div class="field-label">Date of incorporation</div>
      <div class="field-value">${startDate}</div>
    </div>
    
    <div class="field">
      <div class="field-label">Activities</div>
      <div class="field-value">
        ${activities[0]}<br>
        ${activities[1]}<br>
        <em>For further information on activities, see Dutch extract.</em>
      </div>
    </div>
    
    <div class="field">
      <div class="field-label">Employees</div>
      <div class="field-value">${employees}</div>
    </div>
  </div>
  
  <div class="separator"></div>
  
  <div class="section">
    <div class="section-title">Owner</div>
    
    <div class="field">
      <div class="field-label">Name</div>
      <div class="field-value">${ownerName}</div>
    </div>
    
    <div class="field">
      <div class="field-label">Date of birth</div>
      <div class="field-value">${dob}</div>
    </div>
    
    <div class="field">
      <div class="field-label">Date of entry into office</div>
      <div class="field-value">${entryDate}</div>
    </div>
  </div>
  
  <div class="separator"></div>
  
  <div class="footer">
    <div class="extract-info">
      Extract was made on ${extractionDate} at ${extractionTime} hours.
    </div>
    
    <div class="watermark">WAARMERK</div>
    <div class="kvk-sub">KAMER VAN KOOPHANDEL</div>
    
    <div class="footer-text">
      This extract has been certified with a digital signature and is an official proof of registration in the Business
      Register. You can check the integrity of this document and validate the signature in Adobe at the top of your
      screen. The Chamber of Commerce recommends that this document be viewed in digital form so that its
      integrity is safeguarded and the signature remains verifiable.
    </div>
    
    <div class="timestamp">${timestamp}</div>
    <div class="bottom-bar"></div>
  </div>
</body>
</html>`;
}

// Helper function to format date in Dutch format (DD-MM-YYYY)
function formatDutchDate(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
} 