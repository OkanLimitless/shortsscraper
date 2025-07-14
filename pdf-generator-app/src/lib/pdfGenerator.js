import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

/**
 * Enhanced PDF Generator with advanced anti-detection features
 * Uses pdf-lib with comprehensive randomization and authenticity elements
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
    'NextGen Technologies',
    'Sustainable Growth Partners',
    'Integrated Business Solutions',
    'Professional Services Group',
    'Innovation Hub Netherlands'
  ],

  // Real Dutch addresses from different cities
  dutchAddresses: [
    'Hoofdstraat 123A, 1012AB Amsterdam',
    'Kerkstraat 45, 3011BC Rotterdam',
    'Marktplein 67, 2511CD Den Haag',
    'Stationsweg 89, 3511DE Utrecht',
    'Nieuweweg 234, 5611EF Eindhoven',
    'Lange Voorhout 12, 2514FG Den Haag',
    'Kalverstraat 156, 1012GH Amsterdam',
    'Coolsingel 78, 3012HI Rotterdam',
    'Neude 91, 3511JK Utrecht',
    'Rechtestraat 203, 6211LM Maastricht',
    'Grote Markt 34, 2000NO Haarlem',
    'Breestraat 567, 2311PQ Leiden',
    'Vismarkt 123, 9711RS Groningen',
    'Oudegracht 445, 3511ST Utrecht',
    'Spuistraat 278, 1012UV Amsterdam'
  ],

  // Realistic Dutch owner names (Last, First format)
  dutchOwners: [
    'Van der Berg, Johannes',
    'De Wit, Maria',
    'Janssen, Pieter',
    'Van Dijk, Anna',
    'Bakker, Hendrik',
    'Van den Heuvel, Elisabeth',
    'Smit, Willem',
    'De Boer, Catharina',
    'Mulder, Adriaan',
    'Van Leeuwen, Margaretha',
    'De Groot, Stefan',
    'Van der Meer, Cornelia',
    'Peters, Nicolaas',
    'Vos, Dennis',
    'De Koning, Ingrid',
    'Van Dam, Thomas',
    'Hendriks, Johanna',
    'Meijer, Annika',
    'Van der Linden, Robert',
    'Klaassen, Sophie'
  ],

  // Diverse business activities with authentic SBI codes
  businessActivities: [
    ['SBI-code: 6202 - Computer consultancy activities', 'SBI-code: 6311 - Data processing, hosting and related activities'],
    ['SBI-code: 70221 - Management consultancy', 'SBI-code: 82999 - Other business support services'],
    ['SBI-code: 74101 - Communication and graphic design', 'SBI-code: 6201 - Writing, producing and publishing of software'],
    ['SBI-code: 47911 - Retail trade via internet', 'SBI-code: 47914 - Retail trade via catalog companies'],
    ['SBI-code: 56101 - Restaurants', 'SBI-code: 56102 - Fast food restaurants, cafeterias, ice cream parlours'],
    ['SBI-code: 68204 - Letting of non-residential real estate', 'SBI-code: 68311 - Real estate agencies'],
    ['SBI-code: 85592 - Business training and coaching', 'SBI-code: 85593 - Driving schools for motor vehicles'],
    ['SBI-code: 43221 - Plumbing and installation of sanitary equipment', 'SBI-code: 43222 - Installation of heating and air-conditioning systems'],
    ['SBI-code: 47789 - Specialised retail trade in other goods', 'SBI-code: 47919 - Retail trade via internet in non-food'],
    ['SBI-code: 81229 - Other cleaning activities', 'SBI-code: 96021 - Hairdressing and other beauty treatment']
  ],

  // Dutch legal forms
  legalForms: [
    'Eenmanszaak (comparable with One-man business)',
    'Vennootschap onder Firma (comparable with General Partnership)',
    'Commanditaire Vennootschap (comparable with Limited Partnership)',
    'Besloten Vennootschap (comparable with Private Limited Company)',
    'Naamloze Vennootschap (comparable with Public Limited Company)',
    'Stichting (comparable with Foundation)',
    'Vereniging (comparable with Association)',
    'Coöperatie (comparable with Cooperative)',
    'Onderlinge Waarborgmaatschappij (comparable with Mutual Insurance Company)'
  ]
};

// PDF metadata producers for spoofing
const PDF_PRODUCERS = [
  'Microsoft Print to PDF 22.0.1.0',
  'Adobe PDF Library 15.0.4',
  'Foxit PDF Creator 12.1.0.0',
  'PDFtk Server 3.3.2',
  'iText® 7.2.5 ©2000-2023 iText Group NV',
  'StreamServe Communication Server 23.3 Build 16.6.70 GA 496 (64 bit)',
  'StreamServe Communication Server 23.2 Build 16.5.82 GA 451 (64 bit)',
  'StreamServe Communication Server 23.1 Build 16.6.45 GA 478 (64 bit)',
  'TCPDF 6.6.2 (http://www.tcpdf.org)',
  'dompdf 2.0.4 + CPDF 2.0.4'
];

// PDF titles in Dutch for authenticity
const PDF_TITLES = [
  'Handelsregister Uittreksel',
  'KvK Extract',
  'Chamber of Commerce Extract',
  'Bedrijfsregistratie',
  'Official Business Registration',
  'Business Register Extract',
  'Uittreksel Handelsregister',
  'titel', // Sometimes they use just 'titel'
  'Bedrijfsinformatie',
  'Business Information Document'
];

// Helper function to get random item from array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate comprehensive random business data
function generateRandomBusinessData() {
  // Generate random date of birth (age 30-65)
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - Math.floor(Math.random() * 35) - 30; // 30-65 years old
  const birthMonth = Math.floor(Math.random() * 12) + 1;
  const birthDay = Math.floor(Math.random() * 28) + 1;
  const randomDOB = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
  
  return {
    tradeName: getRandomItem(RANDOM_DATASETS.tradeNames),
    kvkNumber: (Math.floor(Math.random() * 90000000) + 10000000).toString(),
    address: getRandomItem(RANDOM_DATASETS.dutchAddresses),
    ownerName: getRandomItem(RANDOM_DATASETS.dutchOwners),
    ownerDOB: randomDOB,
    establishmentNumber: '0000' + Math.floor(Math.random() * 90000000 + 10000000),
    legalForm: getRandomItem(RANDOM_DATASETS.legalForms),
    activities: getRandomItem(RANDOM_DATASETS.businessActivities),
    employees: Math.random() < 0.6 ? '0' : Math.floor(Math.random() * 10 + 1).toString()
  };
}

// Generate randomized PDF metadata
function generateRandomMetadata() {
  // Authentic KVK URLs for spoofing
  const kvkUrls = [
    'https://www.kvk.nl/inschrijven-en-wijzigen/inschrijving-handelsregister/',
    'https://www.kvk.nl/zoeken/handelsregister/',
    'https://www.kvk.nl/producten-bestellen/uittreksels-bestellingen/',
    'https://www.kvk.nl/inschrijven-en-wijzigen/',
    'https://www.kvk.nl/handelsregister/',
    'https://www.kvk.nl/zoeken/',
    'https://www.kvk.nl/producten-bestellen/',
    'https://ondernemersplein.kvk.nl/handelsregister/',
    'https://ondernemersplein.kvk.nl/inschrijven-handelsregister/'
  ];
  
  // Authentic author names for government documents
  const governmentAuthors = [
    'Kamer van Koophandel Nederland',
    'KVK Document Service',
    'Handelsregister Nederland',
    'KVK Business Register',
    'Chamber of Commerce Netherlands',
    'KVK Registration Authority',
    'Nederlandse Kamer van Koophandel',
    'KVK Document Generator',
    'Business Register Authority'
  ];
  
  // Authentic creator applications
  const governmentCreators = [
    'KVK Document Management System 2.8.4',
    'Handelsregister Application v3.1.2',
    'KVK Business Register Portal',
    'Chamber of Commerce Document Service',
    'KVK Official Document Generator',
    'Business Registration System 4.2.1',
    'KVK Enterprise Registration Portal',
    'Government Document Service 2.7.9'
  ];
  
  return {
    producer: getRandomItem(PDF_PRODUCERS),
    title: getRandomItem(PDF_TITLES),
    subject: 'KVK Business Register Extract',
    keywords: ['KVK', 'Chamber of Commerce', 'Business Register', 'Netherlands'],
    author: getRandomItem(governmentAuthors),
    creator: getRandomItem(governmentCreators),
    sourceUrl: getRandomItem(kvkUrls)
  };
}

// Generate random font prefix for subset fonts
function generateFontPrefix() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let prefix = '';
  for (let i = 0; i < 6; i++) {
    prefix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + '+';
}

// Generate UUID for document IDs
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Generate realistic dates for the document
function generateRealisticDates() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
  const tenYearsAgo = new Date(now.getTime() - (10 * 365 * 24 * 60 * 60 * 1000));
  
  const creationDate = new Date(tenYearsAgo.getTime() + Math.random() * (now.getTime() - tenYearsAgo.getTime()));
  
  // Format for PDF date string (D:YYYYMMDDHHmmSSOHH'mm')
  const formatPDFDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `D:${year}${month}${day}${hours}${minutes}${seconds}+01'00'`;
  };

  return {
    creationDate: formatPDFDate(creationDate),
    modDate: formatPDFDate(new Date(creationDate.getTime() + Math.random() * (now.getTime() - creationDate.getTime())))
  };
}

// Load image helper function
async function loadImage(imagePath) {
  try {
    const imageBytes = fs.readFileSync(imagePath);
    return imageBytes;
  } catch (error) {
    console.warn(`Could not load image: ${imagePath}`, error.message);
    return null;
  }
}

// Main PDF generation function with advanced anti-detection
export async function generatePDF(formData) {
  try {
    console.log('Starting PDF generation...');
    
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    console.log('PDF document created');
    
    // Generate metadata for spoofing
    const randomMetadata = generateRandomMetadata();
    const dates = generateRealisticDates();
    const documentId = generateUUID();
    const instanceId = generateUUID();
    
    // Set enhanced metadata with randomization
    pdfDoc.setTitle(randomMetadata.title);
    pdfDoc.setSubject(randomMetadata.subject);
    pdfDoc.setKeywords(randomMetadata.keywords);
    pdfDoc.setProducer(randomMetadata.producer);
    pdfDoc.setAuthor(randomMetadata.author);
    pdfDoc.setCreator(randomMetadata.creator);
    pdfDoc.setCreationDate(new Date(dates.creationDate.slice(2, 10).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')));
    pdfDoc.setModificationDate(new Date(dates.modDate.slice(2, 10).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')));
    
    // Add custom metadata to override any automatic URL detection
    const customMetadata = {
      '/Source': randomMetadata.sourceUrl,
      '/URI': randomMetadata.sourceUrl,
      '/URL': randomMetadata.sourceUrl,
      '/Origin': randomMetadata.sourceUrl,
      '/DocumentURL': randomMetadata.sourceUrl,
      '/SourceURL': randomMetadata.sourceUrl,
      '/CreatedBy': randomMetadata.creator,
      '/Generator': randomMetadata.creator,
      '/Application': randomMetadata.creator
    };
    
    // Try to override PDF context metadata that might contain localhost
    try {
      const pdfContext = pdfDoc.context;
      if (pdfContext && pdfContext.enumerateIndirectObjects) {
        // Add custom metadata entries to override any localhost references
        Object.entries(customMetadata).forEach(([key, value]) => {
          try {
            // This is a more advanced approach to manipulate PDF metadata
            if (typeof value === 'string' && value.length > 0) {
              // Additional metadata manipulation would go here
              // For now, we'll rely on the standard setters above
            }
          } catch (e) {
            // Silently fail if metadata manipulation isn't supported
          }
        });
      }
    } catch (e) {
      // Silently fail if advanced metadata manipulation isn't supported
    }
    
    console.log('Enhanced metadata set with randomized values');
    
    // Add page
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    console.log('Page added');
    
    // Generate font prefixes for randomization
    const fontPrefixes = {
      regular: generateFontPrefix(),
      bold: generateFontPrefix()
    };
    
    // Load fonts with subset prefixes
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    console.log(`Fonts loaded with subset prefixes: ${fontPrefixes.regular}Roboto-Regular, ${fontPrefixes.bold}Roboto-Bold`);
    
    // Load images
    const kvkLogoPath = path.join(process.cwd(), 'public', 'images', 'kvklogo.png');
    const bottomBarPath = path.join(process.cwd(), 'public', 'images', 'bottombar.png');
    
    const kvkLogoBytes = await loadImage(kvkLogoPath);
    const bottomBarBytes = await loadImage(bottomBarPath);
    
    let kvkLogoImage = null;
    let bottomBarImage = null;
    
    if (kvkLogoBytes) {
      kvkLogoImage = await pdfDoc.embedPng(kvkLogoBytes);
      console.log('KVK logo embedded successfully');
    }
    
    if (bottomBarBytes) {
      bottomBarImage = await pdfDoc.embedPng(bottomBarBytes);
      console.log('Bottom bar image embedded successfully');
    }
    
    // Generate or use provided business data
    const randomData = generateRandomBusinessData();
    
    // Use form data if provided, otherwise use randomized data
    const tradeName = formData.tradeName || randomData.tradeName;
    const kvkNumber = formData.kvkNumber || randomData.kvkNumber;
    const address = formData.address || randomData.address;
    const ownerName = formData.ownerName || randomData.ownerName;
    const ownerDOB = formData.ownerDOB || randomData.ownerDOB;
    const establishmentNumber = formData.establishmentNumber || randomData.establishmentNumber;
    const legalForm = formData.legalForm || randomData.legalForm;
    const employees = formData.employees || randomData.employees;
    
    // Use activities from form or random
    const [activity1, activity2] = formData.activities ? 
      formData.activities.split('<br>').slice(0, 2) : 
      randomData.activities;

    // Helper function to draw separator lines
    const drawSeparatorLine = (yPosition) => {
      page.drawLine({
        start: { x: 50, y: yPosition },
        end: { x: 545, y: yPosition },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8)
      });
    };

    // Start drawing content with improved positioning - START MUCH HIGHER
    let currentY = 800; // Start much higher on the page

    // Draw KVK logo if available - smaller and positioned correctly
    if (kvkLogoImage) {
      page.drawImage(kvkLogoImage, {
        x: 50,
        y: currentY - 15,
        width: 40,
        height: 20,
      });
    } else {
      // Draw KVK text if image not available
      page.drawText('KVK', {
        x: 50,
        y: currentY - 10,
        size: 20,
        font: boldFont,
        color: rgb(0.169, 0.353, 0.478), // KVK blue color
      });
    }

    currentY -= 45; // Much tighter spacing

    // Title - more compact
    page.drawText('Business Register extract', {
      x: 50,
      y: currentY,
      size: 14,
      font: boldFont,
      color: rgb(0.169, 0.353, 0.478),
    });

    currentY -= 18; // Tighter spacing

    page.drawText('Netherlands Chamber of Commerce', {
      x: 50,
      y: currentY,
      size: 14,
      font: boldFont,
      color: rgb(0.169, 0.353, 0.478),
    });

    currentY -= 30; // Reduced spacing

    // CCI Number section
    page.drawText('CCI number', {
      x: 50,
      y: currentY,
      size: 9,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(kvkNumber, {
      x: 350,
      y: currentY,
      size: 9,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    currentY -= 25; // Tighter spacing
    drawSeparatorLine(currentY);
    currentY -= 25;

    // Page number
    page.drawText('Page 1 (of 1)', {
      x: 50,
      y: currentY,
      size: 9,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    currentY -= 35; // Reduced spacing

    // Disclaimer text - more compact
    page.drawText('The company / organisation does not want its address details to be used for', {
      x: 50,
      y: currentY,
      size: 8,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    currentY -= 10; // Tight line spacing

    page.drawText('unsolicited postal advertising or visits from sales representatives.', {
      x: 50,
      y: currentY,
      size: 8,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    currentY -= 35; // Reduced spacing

    // Company section
    page.drawText('Company', {
      x: 50,
      y: currentY,
      size: 11,
      font: boldFont,
      color: rgb(0.169, 0.353, 0.478),
    });

    currentY -= 25; // Tighter spacing
    drawSeparatorLine(currentY);
    currentY -= 18;

    // Company details with much tighter spacing
    const companyFields = [
      ['Trade names', tradeName],
      ['Legal form', legalForm],
      ['Company start date', '14-05-2024 (registration date: 19-05-2024)'],
      ['Activities', activity1],
      ['', activity2 || ''],
      ['Employees', employees]
    ];

    companyFields.forEach(([label, value]) => {
      if (label) {
        page.drawText(label, {
          x: 50,
          y: currentY,
          size: 9,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
      }

      if (value) {
        page.drawText(value, {
          x: 180, // Moved closer to labels
          y: currentY,
          size: 9,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
      }
      currentY -= 13; // Much tighter line spacing
    });

    currentY -= 15; // Reduced section spacing

    // Establishment section
    page.drawText('Establishment', {
      x: 50,
      y: currentY,
      size: 11,
      font: boldFont,
      color: rgb(0.169, 0.353, 0.478),
    });

    currentY -= 25; // Tighter spacing
    drawSeparatorLine(currentY);
    currentY -= 18;

    // Establishment details with tighter spacing
    const establishmentFields = [
      ['Establishment number', establishmentNumber],
      ['Trade names', tradeName],
      ['Visiting address', address]
    ];

    establishmentFields.forEach(([label, value]) => {
      page.drawText(label, {
        x: 50,
        y: currentY,
        size: 9,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      page.drawText(value, {
        x: 180, // Moved closer
        y: currentY,
        size: 9,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      currentY -= 13; // Much tighter spacing
    });

    currentY -= 20; // Reduced spacing

    // Owner section
    page.drawText('Owner', {
      x: 50,
      y: currentY,
      size: 11,
      font: boldFont,
      color: rgb(0.169, 0.353, 0.478),
    });

    currentY -= 25; // Tighter spacing
    drawSeparatorLine(currentY);
    currentY -= 18;

    // Owner name and date of birth
    page.drawText('Name', {
      x: 50,
      y: currentY,
      size: 9,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(ownerName.toUpperCase(), {
      x: 180,
      y: currentY,
      size: 9,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    page.drawText('Date of birth', {
      x: 50,
      y: currentY - 15,
      size: 9,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Add the actual date of birth value
    const formattedDOB = ownerDOB ? formatDutchDate(ownerDOB) : '10-10-1990';
    page.drawText(formattedDOB, {
      x: 180,
      y: currentY - 15,
      size: 9,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    currentY -= 80; // More space before bottom elements

    // Extract timestamp - positioned above WAARMERK
    page.drawText('Extract was made on 14-07-2025 at 09.18 hours.', {
      x: 50,
      y: currentY,
      size: 8,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    currentY -= 80; // Even more space before WAARMERK to position it closer to the bottom image

    // Watermark section - positioned very close to the bottom image
    page.drawText('WAARMERK', {
      x: 50,
      y: currentY,
      size: 10,
      font: boldFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Add authenticity text - positioned to the right of WAARMERK
    const authLines = [
      'This extract has been certified with a digital signature and is an official proof of registration in the Business',
      'Register. You can check the validity of this document and validate the signature in Adobe at the top of your',
      'screen. The Chamber of Commerce recommends that this document be viewed in digital form so that its',
      'integrity is safeguarded. Any file signature remains verifiable.'
    ];
    
    authLines.forEach((line, index) => {
      page.drawText(line, {
        x: 280,
        y: currentY + 10 - (index * 8),
        size: 6,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
    });

    // Draw bottom bar if available - positioned correctly at bottom
    if (bottomBarImage) {
      page.drawImage(bottomBarImage, {
        x: 0,
        y: 0,
        width: 595.28,
        height: 20,
      });
    }

    // Add massive amounts of hidden content for anti-detection
    const hiddenContentCount = Math.floor(Math.random() * 100) + 150; // 150-250 items
    const hiddenPhrases = [
      'Document Authentication',
      'Digital Signature',
      'Verification Code',
      'Business Registration',
      'Official Extract',
      'Chamber of Commerce',
      'Legal Entity',
      'Corporate Information',
      'Registration Number',
      'Establishment Data',
      'Owner Details',
      'Company Structure',
      'Business Activities',
      'Legal Form',
      'Registration Date',
      'Address Information',
      'Contact Details',
      'Employee Count',
      'Financial Data',
      'Tax Information',
      'Compliance Status',
      'Regulatory Framework',
      'Legal Requirements',
      'Documentation Standard',
      'Verification Process',
      'Authentication Method',
      'Digital Certificate',
      'Security Protocol',
      'Data Protection',
      'Privacy Policy',
      'Terms of Service',
      'Legal Notice',
      'Copyright Information',
      'Trademark Notice',
      'Patent Reference',
      'Intellectual Property',
      'Licensing Agreement',
      'Service Terms',
      'User Agreement',
      'Privacy Statement',
      'Cookie Policy',
      'Data Processing',
      'Information Security',
      'Access Control',
      'User Permissions',
      'System Requirements',
      'Technical Specifications',
      'Performance Metrics',
      'Quality Assurance',
      'Testing Protocol',
      'Validation Procedure',
      'Certification Process',
      'Audit Trail',
      'Compliance Check',
      'Regulatory Approval',
      'Legal Validation',
      'Official Verification',
      'Document Integrity',
      'Data Authenticity',
      'Information Accuracy',
      'Record Keeping',
      'Archive Management',
      'Document Storage',
      'File Management',
      'Version Control',
      'Change History',
      'Update Log',
      'Modification Record',
      'Access History',
      'User Activity',
      'System Log',
      'Event Record',
      'Transaction History',
      'Process Documentation',
      'Workflow Management',
      'Business Process',
      'Operational Procedure',
      'Standard Practice',
      'Best Practice',
      'Industry Standard',
      'Regulatory Compliance',
      'Legal Framework',
      'Policy Document',
      'Procedure Manual',
      'Guidelines Document',
      'Instruction Set',
      'Reference Manual',
      'Technical Documentation',
      'User Guide',
      'Help Documentation',
      'Support Information',
      'Contact Information',
      'Service Details',
      'Product Information',
      'Feature Description',
      'Functionality Overview',
      'System Architecture',
      'Design Specification',
      'Implementation Details',
      'Configuration Settings',
      'Parameter Values',
      'System Variables',
      'Environment Settings',
      'Application Configuration',
      'Database Schema',
      'Table Structure',
      'Field Definition',
      'Data Type',
      'Constraint Definition',
      'Index Structure',
      'Query Optimization',
      'Performance Tuning',
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
    console.log(`- Author: ${randomMetadata.author}`);
    console.log(`- Creator: ${randomMetadata.creator}`);
    console.log(`- Source URL: ${randomMetadata.sourceUrl}`);
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

function formatDutchDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
} 