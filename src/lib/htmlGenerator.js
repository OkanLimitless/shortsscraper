/**
 * HTML Generator for KVK business register extracts
 * Used to create HTML that matches the official KVK layout exactly
 */
export function generateHTML(formData) {
  // Default values if not provided
  const tradeName = formData.tradeName || 'Diamond Sky Marketing';
  // Only use tradeNameAlias if provided
  const tradeNameAlias = formData.tradeNameAlias && formData.tradeNameAlias.trim() !== '' 
    ? formData.tradeNameAlias 
    : null;
  const legalForm = formData.legalForm || 'Eenmanszaak (comparable with One-man business)';
  const kvkNumber = formData.kvkNumber || '77678303';
  const address = formData.address || 'Spreeuwenhof 81, 7051XJ Varsseveld';
  const establishmentNumber = formData.establishmentNumber || '000045362920';
  
  // Generate random employee count if not provided
  const employees = formData.employees || Math.floor(Math.random() * 5).toString();
  
  // Generate random date of incorporation if not provided
  const getRandomStartDate = () => {
    const now = new Date();
    // Random date within the last 5 years
    const randomMonths = Math.floor(Math.random() * 60); // 0-59 months ago
    const pastDate = new Date(now);
    pastDate.setMonth(now.getMonth() - randomMonths);
    // Format as DD-MM-YYYY
    const day = pastDate.getDate().toString().padStart(2, '0');
    const month = (pastDate.getMonth() + 1).toString().padStart(2, '0');
    const year = pastDate.getFullYear();
    
    // Add registration date (usually a few days after incorporation)
    const regDate = new Date(pastDate);
    regDate.setDate(regDate.getDate() + Math.floor(Math.random() * 14) + 1); // 1-14 days after
    const regDay = regDate.getDate().toString().padStart(2, '0');
    const regMonth = (regDate.getMonth() + 1).toString().padStart(2, '0');
    const regYear = regDate.getFullYear();
    
    return `${day}-${month}-${year} (registration date: ${regDay}-${regMonth}-${regYear})`;
  };
  
  const startDate = formData.dateOfIncorporation 
    ? formatDutchDate(formData.dateOfIncorporation)
    : getRandomStartDate();
  
  // Handle special characters in owner name
  let ownerName = formData.ownerName || 'Piyirci, Okan';
  // Replace ṛ with r if present (for compatibility)
  ownerName = ownerName.replace(/ṛ/g, 'r');
  
  const dob = formData.ownerDOB 
    ? formatDutchDate(formData.ownerDOB)
    : '21-01-1994';
  
  // Format the current date for the extract timestamp and page header
  const today = new Date();
  const headerDate = formatCustomDate(today);
  const extractionDate = formatDutchDate(today, true);
  const extractionTime = today.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit'
  }).replace(':', '.');
  
  // Format date for vertical timestamp
  const timestamp = formatTimestamp(today);
  
  // Generate HTML with the provided data
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KVK Business Register Extract</title>
  <style>
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 0;
    }
    
    body {
      font-family: Arial, Helvetica, sans-serif;
      width: 210mm; /* A4 width */
      height: 297mm; /* A4 height */
      position: relative;
      background-color: white;
      color: black;
      margin: 0;
      padding: 0;
    }
    
    /* Header section - removed to match example */
    
    /* KVK Logo */
    .kvk-logo {
      position: absolute;
      top: 82px;
      left: 112px;
      width: 120px; /* Adjust based on actual logo size */
      height: auto;
    }
    
    /* Title section */
    .title {
      position: absolute;
      top: 188px;
      left: 112px;
      font-size: 16px;
      font-weight: bold;
      color: #204a63; /* Dark blue color */
    }
    
    .subtitle {
      position: absolute;
      top: 228px;
      left: 112px;
      font-size: 16px;
      font-weight: bold;
      color: #204a63; /* Dark blue color */
    }
    
    /* Main content */
    .content {
      position: absolute;
      top: 280px;
      left: 112px;
      width: calc(100% - 224px);
    }
    
    /* Table styles */
    table {
      width: 100%;
      border-collapse: collapse;
      border: none;
    }
    
    tr.header-row td {
      border-top: 1px solid #e0e0e0;
      border-bottom: 1px solid #e0e0e0;
      padding: 5px 0;
    }
    
    tr.header-row h2 {
      font-size: 11px;
      font-weight: bold;
      margin: 0;
      color: #204a63;
    }
    
    tr.data-row td {
      vertical-align: top;
      padding: 4px 0;
      font-size: 9px;
    }
    
    tr.data-row td:first-child {
      width: 180px;
      font-weight: bold;
    }
    
    tr.spacer-row td {
      height: 12px;
    }
    
    tr.separator-row td {
      border-top: 1px solid #e0e0e0;
      height: 1px;
      padding: 0;
    }
    
    tr.disclaimer-row td {
      text-align: center;
      font-style: italic;
      font-size: 9px;
      padding: 15px 0;
    }
    
    tr.extract-date-row td {
      text-align: center;
      font-size: 9px;
      padding-top: 30px;
    }
    
    .italic-note {
      font-style: italic;
      margin-top: 3px;
    }
    
    /* Footer elements */
    .waarmerk {
      position: absolute;
      bottom: 64px; /* Reduced from 84px */
      left: 112px;
      font-weight: bold;
      font-size: 14px;
      color: rgba(128, 128, 128, 0.4);
      z-index: 1;
    }
    
    .kvk-subtitle {
      position: absolute;
      bottom: 48px; /* Reduced from 68px */
      left: 112px;
      font-size: 8px;
      color: rgba(128, 128, 128, 0.4);
      z-index: 1;
    }
    
    .footer-text {
      position: absolute;
      bottom: 64px; /* Reduced from 84px */
      left: 230px;
      font-size: 7px;
      line-height: 1.4;
      width: 55%;
      z-index: 1;
    }
    
    .timestamp {
      position: absolute;
      bottom: 140px; /* Reduced from 140px */
      right: 10px;
      transform: rotate(90deg);
      transform-origin: right bottom;
      font-size: 8px;
      color: #555;
      z-index: 1;
    }
    
    .bottom-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      z-index: 0;
    }
    
    /* Print button */
    .print-button {
      position: fixed;
      top: 10px;
      right: 10px;
      background-color: #204a63;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 12px;
      cursor: pointer;
      z-index: 9999;
    }
    
    .instructions-box {
      position: fixed;
      top: 50px;
      right: 10px;
      width: 250px;
      background: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 9998;
      border: 1px solid #ddd;
    }
    
    .instructions-box ol {
      margin-left: 20px;
    }
    
    /* For print */
    @media print {
      body {
        margin: 0;
        width: 100%;
      }
      
      .print-button,
      .instructions-box {
        display: none;
      }
    }
  </style>
  <script>
    function setupPrintButton() {
      const printBtn = document.createElement('button');
      printBtn.innerText = 'Print/Save as PDF';
      printBtn.classList.add('print-button');
      
      printBtn.onclick = function() {
        this.style.display = 'none';
        document.querySelector('.instructions-box').style.display = 'none';
        window.print();
        setTimeout(() => {
          this.style.display = 'block';
          document.querySelector('.instructions-box').style.display = 'block';
        }, 1000);
      };
      
      document.body.appendChild(printBtn);
      
      const instructions = document.createElement('div');
      instructions.classList.add('instructions-box');
      instructions.innerHTML = 
        '<p><strong>To save as PDF:</strong></p>' +
        '<ol>' +
        '<li>Click the Print/Save button above</li>' +
        '<li>In the print dialog, select "Save as PDF" as the destination</li>' +
        '<li>Set paper size to A4</li>' +
        '<li>Set margins to "None"</li>' +
        '<li>Disable headers and footers</li>' +
        '<li>Click Save</li>' +
        '</ol>';
      
      document.body.appendChild(instructions);
    }
    
    window.onload = setupPrintButton;
  </script>
</head>
<body>
  <!-- We're removing the header info to match the example -->
  
  <!-- KVK Logo -->
  <img src="/images/kvklogo.png" alt="KVK Logo" class="kvk-logo">
  
  <!-- Title section -->
  <div class="title">Business Register extract</div>
  <div class="subtitle">Netherlands Chamber of Commerce</div>
  
  <!-- Main content -->
  <div class="content">
    <table>
      <!-- Header data section -->
      <tr>
        <td style="font-weight: bold; font-size: 9px; padding-top: 0;">CCI number</td>
        <td style="font-size: 9px; padding-top: 0;">${kvkNumber}</td>
      </tr>
      <tr class="separator-row">
        <td colspan="2"></td>
      </tr>
      <tr>
        <td style="font-size: 9px; padding: 4px 0;">Page 1 (of 1)</td>
        <td></td>
      </tr>
      <tr class="separator-row">
        <td colspan="2"></td>
      </tr>
      
      <!-- Disclaimer -->
      <tr class="disclaimer-row">
        <td colspan="2">
          The company / organisation does not want its address details to be used for<br>
          unsolicited postal advertising or visits from sales representatives.
        </td>
      </tr>
      <tr class="separator-row">
        <td colspan="2"></td>
      </tr>
      
      <!-- Company section - note that we're keeping uppercase in h2 because that's how it appears in the actual document -->
      <tr class="header-row">
        <td colspan="2">
          <h2>Company</h2>
        </td>
      </tr>
      <tr class="data-row">
        <td>Trade names</td>
        <td>
          ${tradeName}
          ${tradeNameAlias ? `<br>${tradeNameAlias}` : ''}
        </td>
      </tr>
      <tr class="data-row">
        <td>Legal form</td>
        <td>${legalForm}</td>
      </tr>
      <tr class="data-row">
        <td>Company start date</td>
        <td>${startDate}</td>
      </tr>
      <tr class="data-row">
        <td>Activities</td>
        <td>
          SBI-code: 74101 - Communication and graphic design<br>
          SBI-code: 6201 - Writing, producing and publishing of software
        </td>
      </tr>
      <tr class="data-row">
        <td>Employees</td>
        <td>${employees}</td>
      </tr>
      <tr class="separator-row">
        <td colspan="2"></td>
      </tr>
      
      <!-- ESTABLISHMENT section -->
      <tr class="header-row">
        <td colspan="2">
          <h2>Establishment</h2>
        </td>
      </tr>
      <tr class="data-row">
        <td>Establishment number</td>
        <td>${establishmentNumber}</td>
      </tr>
      <tr class="data-row">
        <td>Trade names</td>
        <td>
          ${tradeName}
          ${tradeNameAlias ? `<br>${tradeNameAlias}` : ''}
        </td>
      </tr>
      <tr class="data-row">
        <td>Visiting address</td>
        <td>${address}</td>
      </tr>
      <tr class="data-row">
        <td>Date of incorporation</td>
        <td>${startDate}</td>
      </tr>
      <tr class="data-row">
        <td>Activities</td>
        <td>
          SBI-code: 74101 - Communication and graphic design<br>
          SBI-code: 6201 - Writing, producing and publishing of software<br>
          <span class="italic-note">For further information on activities, see Dutch extract.</span>
        </td>
      </tr>
      <tr class="data-row">
        <td>Employees</td>
        <td>${employees}</td>
      </tr>
      <tr class="separator-row">
        <td colspan="2"></td>
      </tr>
      
      <!-- OWNER section - updated to match screenshot -->
      <tr class="header-row">
        <td colspan="2">
          <h2>Owner</h2>
        </td>
      </tr>
      <tr class="data-row">
        <td>Name</td>
        <td>${ownerName}</td>
      </tr>
      <tr class="data-row">
        <td>Date of birth</td>
        <td>${dob}</td>
      </tr>
      <tr class="data-row">
        <td>Date of entry into office</td>
        <td>${startDate}</td>
      </tr>
      <tr class="separator-row">
        <td colspan="2"></td>
      </tr>
      
      <!-- Extract date -->
      <tr class="extract-date-row">
        <td colspan="2">Extract was made on ${extractionDate} at ${extractionTime} hours.</td>
      </tr>
    </table>
  </div>
  
  <!-- WAARMERK watermark -->
  <div class="waarmerk">WAARMERK</div>
  <div class="kvk-subtitle">KAMER VAN KOOPHANDEL</div>
  
  <!-- Footer text -->
  <div class="footer-text">
    This extract has been certified with a digital signature and is an official proof of registration in the Business<br>
    Register. You can check the integrity of this document and validate the signature in Adobe at the top of your<br>
    screen. The Chamber of Commerce recommends that this document be viewed in digital form so that its<br>
    integrity is safeguarded and the signature remains verifiable.
  </div>
  
  <!-- Timestamp -->
  <div class="timestamp">${timestamp}</div>
  
  <!-- Bottom Bar Image - replaces the CSS magenta bar -->
  <img src="/images/bottombar.png" alt="Bottom Bar" class="bottom-bar">
</body>
</html>`;
}

// Format date as DD-MM-YYYY, HH:MM for header
function formatCustomDate(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}-${month}-${year}, ${hours}:${minutes}`;
}

// Format timestamp for vertical display
function formatTimestamp(date) {
  const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, '-');
  const formattedTime = date.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/:/g, ':');
  
  return `${formattedDate} ${formattedTime}`;
}

// Helper function to format date in Dutch format (DD-MM-YYYY)
function formatDutchDate(dateString, useToday = false) {
  if (!dateString && !useToday) return '';
  
  try {
    const date = useToday ? new Date() : new Date(dateString);
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