import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

// Units and helpers
const MM_TO_PT = 72 / 25.4;
const mm = (val) => val * MM_TO_PT;

const hexToRgb = (hex) => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return rgb(r, g, b);
};

// Colors per spec
const COLORS = {
  kvkBlue: hexToRgb('#0A6FB6'),
  text: hexToRgb('#1F2937'),
  lightRule: hexToRgb('#E5E7EB'),
  waarmerk: hexToRgb('#B0B7C3'),
  timestamp: hexToRgb('#9CA3AF'),
  notes: hexToRgb('#6B7280'),
  certText: hexToRgb('#374151'),
};

// Page and grid
const PAGE = {
  width: 595.28,
  height: 841.89,
  margins: { top: mm(22), right: mm(18), bottom: mm(24), left: mm(18) },
  grid: { labelWidth: mm(44), gutter: mm(6) },
};

// Typography
const TYPO = {
  h1: 18,
  h2: 14,
  section: 12,
  label: 10.5,
  value: 10.5,
  notes: 9,
  waarmerk: 10,
  timestamp: 8.5,
  lineHeight: 1.35,
};

// Text formatting helpers
function formatDateDDMMYYYY(dateLike) {
  if (!dateLike) return '';
  const d = typeof dateLike === 'string' ? new Date(dateLike) : dateLike;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatTimeHHdotMM(dateLike) {
  const d = dateLike ? new Date(dateLike) : new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mmn = String(d.getMinutes()).padStart(2, '0');
  return `${hh}.${mmn}`;
}

function formatTimestampStrip(now = new Date()) {
  const yyyy = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const DD = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}-${MM}-${DD} ${hh}.${mi}.${ss}`;
}

function canonicalizePostcodeCity(raw) {
  if (!raw) return '';
  const match = raw.match(/^(.*?),\s*([0-9]{4})\s*([A-Za-z]{2})\s+(.*)$/);
  if (match) {
    const street = match[1].trim();
    const pc = `${match[2]}${match[3].toUpperCase()}`;
    const city = match[4].trim();
    return `${street}, ${pc} ${city}`;
  }
  const m2 = raw.match(/^(.*?)(\s+)([0-9]{4})\s*([A-Za-z]{2})\s+(.*)$/);
  if (m2) {
    const street = m2[1].trim();
    const pc = `${m2[3]}${m2[4].toUpperCase()}`;
    const city = m2[5].trim();
    return `${street}, ${pc} ${city}`;
  }
  return raw;
}

function splitTradeNames(raw) {
  if (!raw) return [];
  return raw.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
}

function wrapText({ text, maxWidth, font, size }) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    const width = font.widthOfTextAtSize(test, size);
    if (width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function loadImage(imagePath) {
  try { return fs.readFileSync(imagePath); } catch { return null; }
}

export async function generatePDF(formData = {}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE.width, PAGE.height]);

  // Try to embed Inter fonts; fall back to Helvetica if unavailable
  let regular;
  let bold;
  try {
    const interRegularPath = path.join(process.cwd(), 'public', 'fonts', 'Inter-Regular.ttf');
    const interBoldPath = path.join(process.cwd(), 'public', 'fonts', 'Inter-SemiBold.ttf');
    const interRegular = fs.existsSync(interRegularPath) ? fs.readFileSync(interRegularPath) : null;
    const interBold = fs.existsSync(interBoldPath) ? fs.readFileSync(interBoldPath) : null;
    if (interRegular && interBold) {
      regular = await pdfDoc.embedFont(interRegular, { subset: true });
      bold = await pdfDoc.embedFont(interBold, { subset: true });
    } else {
      regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    }
  } catch {
    regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  }

  // Content frame
  const left = PAGE.margins.left;
  const right = PAGE.width - PAGE.margins.right;
  const width = right - left;
  const labelX = left;
  const valueX = left + PAGE.grid.labelWidth + PAGE.grid.gutter;
  let y = PAGE.height - PAGE.margins.top;

  // Logo at top-left margin; ensure 6 mm gap before H1
  const logoPath = path.join(process.cwd(), 'public', 'images', 'kvklogo.png');
  const logoBytes = await loadImage(logoPath);
  if (logoBytes) {
    const img = await pdfDoc.embedPng(logoBytes);
    const targetW = mm(22);
    const scale = targetW / img.width;
    const targetH = img.height * scale;
    const logoY = y - targetH; // top aligned to top margin
    page.drawImage(img, { x: left, y: logoY, width: targetW, height: targetH });
    y = logoY - mm(6); // 6 mm gap under logo before H1 baseline
  } else {
    page.drawText('KVK', { x: left, y: y - TYPO.h1, size: TYPO.h1, font: bold, color: COLORS.kvkBlue });
    y = y - TYPO.h1 - mm(6);
  }

  // Titles
  page.drawText('Business Register extract', { x: left, y, size: TYPO.h1, font: bold, color: COLORS.kvkBlue });
  // 4 mm gap below H1 to H2 baseline
  y -= (mm(4) + TYPO.h2);
  page.drawText('Netherlands Chamber of Commerce', { x: left, y, size: TYPO.h2, font: bold, color: COLORS.kvkBlue });

  // CCI row
  y -= mm(8);
  const kvkNumber = (formData.kvkNumber || '').toString().trim();
  page.drawText('CCI number', { x: labelX, y, size: TYPO.label, font: bold, color: COLORS.text });
  if (kvkNumber) {
    const w = regular.widthOfTextAtSize(kvkNumber, TYPO.value);
    // Nudge 7 mm left from content right edge per delta
    page.drawText(kvkNumber, { x: right - w - mm(7), y, size: TYPO.value, font: regular, color: COLORS.text });
  }

  // Divider
  y -= mm(8);
  page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 0.5, color: COLORS.lightRule });

  // Page note and disclaimer
  // Page note 6 mm below divider
  y -= mm(6);
  page.drawText('Page 1 (of 1)', { x: left, y, size: TYPO.notes, font: regular, color: COLORS.notes });
  // Disclaimer 6 mm below page note
  y -= mm(6);
  const disclaimer = 'The company / organisation does not want its address details to be used for unsolicited postal advertising or visits from sales representatives.';
  const discLines = wrapText({ text: disclaimer, maxWidth: width, font: regular, size: TYPO.notes });
  discLines.forEach((line) => {
    page.drawText(line, { x: left, y, size: TYPO.notes, font: regular, color: COLORS.notes });
    y -= TYPO.notes * TYPO.lineHeight;
  });

  // Section helpers
  const drawSectionTitle = (title) => {
    y -= mm(12);
    page.drawText(title, { x: left, y, size: TYPO.section, font: bold, color: COLORS.kvkBlue });
    y -= mm(6);
  };
  const rowGap = mm(4);
  const multiGap = mm(2);
  const drawRow = (label, value) => {
    if (label) page.drawText(label, { x: labelX, y, size: TYPO.label, font: bold, color: COLORS.text });
    const writeValue = (val, yy) => page.drawText(val || '', { x: valueX, y: yy, size: TYPO.value, font: regular, color: COLORS.text });
    if (Array.isArray(value)) {
      let yy = y;
      if (value.length > 0) writeValue(value[0], yy);
      for (let i = 1; i < value.length; i++) {
        // Place second line with tight internal spacing: normal line advance minus 2 mm
        const lineAdvance = TYPO.value * TYPO.lineHeight;
        yy -= (lineAdvance - mm(2));
        writeValue(value[i], yy);
      }
      // No extra blank line after multi-line block; proceed with normal row gap
      y = yy - rowGap;
    } else if (typeof value === 'string' && value.includes('\n')) {
      const lines = value.split('\n');
      drawRow(label, lines);
    } else {
      writeValue(value, y);
      y -= rowGap;
    }
  };

  // Canonicalized inputs
  const tradeNamesLines = splitTradeNames(formData.tradeName || '');
  const legalForm = formData.legalForm || 'Eenmanszaak (comparable with One-man business)';
  const employees = (formData.employees || '0').toString();
  const establishmentNumber = (formData.establishmentNumber || '').toString();
  const visitingAddress = canonicalizePostcodeCity(formData.address || '');
  // Owner name canonicalization to "Surname, Given name" if not already
  let ownerName = formData.ownerName || '';
  if (ownerName && !ownerName.includes(',')) {
    const parts = ownerName.trim().split(/\s+/);
    if (parts.length >= 2) {
      const surname = parts.pop();
      const given = parts.join(' ');
      ownerName = `${surname}, ${given}`;
    }
  }
  const ownerDOB = formData.ownerDOB ? formatDateDDMMYYYY(formData.ownerDOB) : '';

  const now = new Date();
  const companyStart = formatDateDDMMYYYY(formData.companyStartDate || now);
  const companyReg = formatDateDDMMYYYY(formData.companyRegistrationDate || now);
  const incDate = formatDateDDMMYYYY(formData.dateOfIncorporation || now);
  const incReg = formatDateDDMMYYYY(formData.establishmentRegistrationDate || now);
  const entryDate = formatDateDDMMYYYY(formData.dateOfEntryIntoOffice || now);
  const entryReg = formatDateDDMMYYYY(formData.ownerRegistrationDate || now);

  // Activities
  let activity1 = 'SBI-code: 6202 – Computer consultancy activities';
  let activity2 = 'SBI-code: 6311 – Data processing, hosting and related activities';
  if (typeof formData.activities === 'string' && formData.activities.trim()) {
    const parts = formData.activities.split(/<br\s*\/?\s*>|\n|\r|,/i).map((s) => s.trim()).filter(Boolean);
    activity1 = parts[0] || activity1;
    activity2 = parts[1] || activity2;
  } else if (Array.isArray(formData.activities) && formData.activities.length) {
    activity1 = formData.activities[0] || activity1;
    activity2 = formData.activities[1] || activity2;
  }

  // Company
  drawSectionTitle('Company');
  drawRow('Trade names', tradeNamesLines.length ? tradeNamesLines : (formData.tradeName || ''));
  drawRow('Legal form', legalForm);
  drawRow('Company start date', `${companyStart} (registration date: ${companyReg})`);
  drawRow('Activities', activity1);
  drawRow('', activity2);
  drawRow('Employees', employees);

  // Establishment
  drawSectionTitle('Establishment');
  drawRow('Establishment number', establishmentNumber);
  drawRow('Trade names', tradeNamesLines.length ? tradeNamesLines : (formData.tradeName || ''));
  drawRow('Visiting address', visitingAddress);
  drawRow('Date of incorporation', `${incDate} (registration date: ${incReg})`);
  drawRow('Activities', activity1);
  drawRow('', activity2);
  drawRow('Employees', employees);

  // Owner
  drawSectionTitle('Owner');
  drawRow('Name', ownerName);
  drawRow('Date of birth', ownerDOB);
  drawRow('Date of entry into office', `${entryDate} (registration date: ${entryReg})`);

  // Footer geometry first to place extract line exactly 8 mm above
  const gradientHeight = mm(15);
  const gapAboveGradient = mm(4);
  // Move footer baseline up by additional 4 mm to avoid clipping
  const footerBaseY = gradientHeight + gapAboveGradient + mm(6);
  const extractY = footerBaseY + mm(8);
  const extractLine = `Extract was made on ${formatDateDDMMYYYY(now)} at ${formatTimeHHdotMM(now)} hours.`;
  page.drawText(extractLine, { x: left, y: extractY, size: TYPO.value, font: regular, color: COLORS.text });

  // Footer
  page.drawText('WAARMERK', { x: left, y: footerBaseY, size: TYPO.waarmerk, font: bold, color: COLORS.waarmerk });

  // Exact certification paragraph, color #374151
  const certText = 'This extract has been certified with a digital signature and is an official proof of registration in the Business Register. You can check the integrity of this document and validate the signature in Adobe at the top of your screen. The Chamber of Commerce recommends that this document be viewed in digital form so that its integrity is safeguarded and the signature remains verifiable.';
  const certWidth = width * 0.62;
  const certX = right - certWidth;
  const certLines = wrapText({ text: certText, maxWidth: certWidth, font: regular, size: TYPO.notes });
  let certY = footerBaseY;
  certLines.forEach((line) => {
    page.drawText(line, { x: certX, y: certY, size: TYPO.notes, font: regular, color: COLORS.certText });
    certY -= TYPO.notes * TYPO.lineHeight;
  });

  // Bottom gradient bar
  const slices = 140;
  const sliceW = PAGE.width / slices;
  const magenta = [0x9c / 255, 0x2a / 255, 0xa0 / 255];
  const mid = [0xc9 / 255, 0x3a / 255, 0x68 / 255];
  const orange = [0xf5 / 255, 0x9e / 255, 0x0b / 255];
  for (let i = 0; i < slices; i++) {
    const t = i / (slices - 1);
    let c;
    if (t <= 0.15) c = magenta;
    else if (t <= 0.6) {
      const u = (t - 0.15) / 0.45;
      c = [magenta[0] + (mid[0] - magenta[0]) * u, magenta[1] + (mid[1] - magenta[1]) * u, magenta[2] + (mid[2] - magenta[2]) * u];
    } else {
      const u = (t - 0.6) / 0.4;
      c = [mid[0] + (orange[0] - mid[0]) * u, mid[1] + (orange[1] - mid[1]) * u, mid[2] + (orange[2] - mid[2]) * u];
    }
    page.drawRectangle({ x: i * sliceW, y: 0, width: sliceW + 0.5, height: gradientHeight, color: rgb(c[0], c[1], c[2]) });
  }

  // Rotated timestamp strip (22 mm from bottom)
  const stamp = formatTimestampStrip(now);
  page.drawText(stamp, { x: PAGE.width - mm(6), y: mm(22), size: TYPO.timestamp, font: regular, color: COLORS.timestamp, rotate: degrees(90) });

  const pdfBytes = await pdfDoc.save({ addDefaultPage: false });
  return pdfBytes;
}

// Backward compatibility for other imports
export default generatePDF;

