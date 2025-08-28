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
  black: rgb(0, 0, 0),
  furniture: hexToRgb('#8A8A8A'),
  lightRule: hexToRgb('#000000'),
};

// Page and grid
const PAGE = {
  width: 595.28,
  height: 841.89,
  margins: { top: mm(26), right: mm(22), bottom: mm(28), left: mm(22) },
  grid: { labelWidth: mm(58), gutter: mm(4) },
};

// Typography
const TYPO = {
  h1: 21,
  h2: 13.5,
  section: 10.5,
  label: 10,
  value: 10,
  furniture: 10,
  notes: 9.5,
  waarmerk: 10,
  timestamp: 9,
  paraLinePt: 13, // paragraph line height in pt
  valueLinePt: 14, // desired value line height
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
  return `${yyyy}-${MM}-${DD} ${hh}:${mi}:${ss}`;
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

  // Logo at top-left; baseline 30 mm below top margin
  const logoPath = path.join(process.cwd(), 'public', 'images', 'kvklogo.png');
  const logoBytes = await loadImage(logoPath);
  if (logoBytes) {
    const img = await pdfDoc.embedPng(logoBytes);
    const targetW = mm(22);
    const scale = targetW / img.width;
    const targetH = img.height * scale;
    // Place so top of letters is 26 mm from top edge
    const topY = PAGE.height - mm(26);
    const logoY = topY - targetH; // bottom position
    page.drawImage(img, { x: left, y: logoY, width: targetW, height: targetH });
    // Treat logo baseline as bottom of image
    y = logoY - mm(10); // 10 mm to H1 baseline
  } else {
    page.drawText('KVK', { x: left, y: PAGE.height - mm(26) - TYPO.h1, size: TYPO.h1, font: bold, color: COLORS.logoBlue });
    const logoBottom = PAGE.height - mm(26) - TYPO.h1;
    y = logoBottom - mm(10);
  }

  // Titles
  page.drawText('Business Register extract', { x: left, y, size: TYPO.h1, font: bold, color: COLORS.black });
  // 2.5 mm gap below H1 to H2 baseline
  y -= (mm(2.5) + TYPO.h2);
  page.drawText('Netherlands Chamber of Commerce', { x: left, y, size: TYPO.h2, font: bold, color: COLORS.black });

  // Metadata block: CCI bold line, then Page line with 3 mm gap
  y -= mm(6);
  const kvkNumber = (formData.kvkNumber || '').toString().trim();
  const cciText = `CCI number ${kvkNumber}`;
  page.drawText(cciText, { x: left, y, size: TYPO.label + 0.5, font: bold, color: COLORS.black });
  y -= mm(3);
  page.drawText('Page 1 (of 1)', { x: left, y, size: TYPO.furniture, font: regular, color: COLORS.furniture });

  // Info note line (wrapped), 10 pt furniture color
  y -= mm(6);
  const disclaimer = 'The company / organisation does not want its address details to be used for unsolicited postal advertising or visits from sales representatives.';
  const discLines = wrapText({ text: disclaimer, maxWidth: width, font: regular, size: TYPO.furniture });
  const discLineAdvance = mm(TYPO.paraLinePt * (25.4 / 72));
  discLines.forEach((line, idx) => {
    page.drawText(line, { x: left, y, size: TYPO.furniture, font: regular, color: COLORS.furniture });
    if (idx < discLines.length - 1) y -= discLineAdvance;
  });

  // Section helpers
  const drawSectionTitle = (title) => {
    y -= mm(12);
    page.drawText(title, { x: left, y, size: TYPO.section, font: bold, color: COLORS.kvkBlue });
    y -= mm(6);
  };
  const rowGap = mm(TYPO.valueLinePt * (25.4 / 72));
  const valueColumnWidth = right - valueX;
  const drawRow = (label, value, options = {}) => {
    const { wrap = false, activityTight = false } = options;
    if (label) page.drawText(label, { x: labelX, y, size: TYPO.label, font: bold, color: rgb(0, 0, 0) });
    const writeValue = (val, yy) => page.drawText(val || '', { x: valueX, y: yy, size: TYPO.value, font: regular, color: COLORS.valueText });
    if (Array.isArray(value)) {
      let yy = y;
      if (value.length > 0) writeValue(value[0], yy);
      for (let i = 1; i < value.length; i++) {
        if (activityTight) {
          yy -= mm(2);
        } else {
          const lh = mm(TYPO.valueLinePt * (25.4 / 72));
          yy -= lh;
        }
        writeValue(value[i], yy);
      }
      y = yy - rowGap;
    } else if (typeof value === 'string' && value.includes('\n')) {
      const lines = value.split('\n');
      drawRow(label, lines, options);
    } else if (wrap) {
      const lines = wrapText({ text: value || '', maxWidth: valueColumnWidth, font: regular, size: TYPO.value });
      drawRow(label, lines, options);
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

  // Divider above Company (black, 0.6 pt), then heading after 6 mm
  y -= mm(6);
  page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 0.6, color: COLORS.lightRule });
  y -= mm(6);
  page.drawText('COMPANY', { x: left, y, size: TYPO.section, font: bold, color: COLORS.black });
  y -= mm(3);
  drawRow('Trade names', tradeNamesLines.length ? tradeNamesLines : (formData.tradeName || ''));
  drawRow('Legal form', legalForm);
  drawRow('Company start date', `${companyStart} (registration date: ${companyReg})`);
  drawRow('Activities', activity1, { activityTight: true });
  drawRow('', activity2, { activityTight: true });
  drawRow('Employees', employees);

  // Divider above Establishment
  y -= mm(6);
  page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 0.6, color: COLORS.lightRule });
  y -= mm(6);
  page.drawText('ESTABLISHMENT', { x: left, y, size: TYPO.section, font: bold, color: COLORS.black });
  y -= mm(3);
  drawRow('Establishment number', establishmentNumber);
  drawRow('Trade names', tradeNamesLines.length ? tradeNamesLines : (formData.tradeName || ''));
  drawRow('Visiting address', visitingAddress);
  drawRow('Date of incorporation', `${incDate} (registration date: ${incReg})`);
  drawRow('Activities', activity1, { activityTight: true });
  drawRow('', activity2, { activityTight: true });
  if (formData.activitiesNote) {
    // Muted helper line
    const note = 'For further information on activities, see Dutch extract.';
    page.drawText(note, { x: valueX, y, size: TYPO.furniture, font: regular, color: COLORS.furniture });
    y -= rowGap;
  }
  drawRow('Employees', employees);

  // Divider above Owner
  y -= mm(6);
  page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 0.6, color: COLORS.lightRule });
  y -= mm(6);
  page.drawText('OWNER', { x: left, y, size: TYPO.section, font: bold, color: COLORS.black });
  y -= mm(3);
  drawRow('Name', ownerName);
  drawRow('Date of birth', ownerDOB);
  drawRow('Date of entry into office', `${entryDate} (registration date: ${entryReg})`);

  // Footer geometry first: gradient at bottom, then extract line 10 mm above
  const gradientHeight = mm(20);
  const gapAboveGradient = mm(4);
  const footerBaseY = gradientHeight + gapAboveGradient + mm(6);
  const extractY = gradientHeight + mm(10);
  const extractLine = `Extract was made on ${formatDateDDMMYYYY(now)} at ${formatTimeHHdotMM(now)} hours.`;
  page.drawText(extractLine, { x: left, y: extractY, size: TYPO.value, font: regular, color: COLORS.furniture });

  // Footer
  // Position WAARMERK block 6 mm below the extract line; WAARMERK top baseline flush with first paragraph line
  const footerStackY = extractY - mm(6);

  // Exact certification paragraph, color #374151
  const certText = 'This extract has been certified with a digital signature and is an official proof of registration in the Business Register. You can check the integrity of this document and validate the signature in Adobe at the top of your screen. The Chamber of Commerce recommends that this document be viewed in digital form so that its integrity is safeguarded and the signature remains verifiable.';
  const certWidth = mm(110);
  // Compute label block width to offset paragraph by label width + 12 mm
  const waarmerkWidth = bold.widthOfTextAtSize('WAARMERK', TYPO.waarmerk);
  const kamerWidth = bold.widthOfTextAtSize('KAMER VAN KOOPHANDEL', TYPO.waarmerk);
  const labelBlockWidth = Math.max(waarmerkWidth, kamerWidth);
  const certX = left + labelBlockWidth + mm(12);
  const certLines = wrapText({ text: certText, maxWidth: certWidth, font: regular, size: TYPO.notes });
  // Ensure paragraph bottom sits at least 2 mm above gradient; adjust baseline if needed
  const paraAdvance = mm(TYPO.paraLinePt * (25.4 / 72));
  const linesCount = certLines.length;
  const desiredFooterY = footerStackY;
  const paragraphBottomIfDesired = desiredFooterY - (linesCount - 1) * paraAdvance;
  const minBottom = gradientHeight + mm(2);
  const shiftUp = paragraphBottomIfDesired < minBottom ? (minBottom - paragraphBottomIfDesired) : 0;
  const adjustedFooterY = desiredFooterY + shiftUp;
  let certY = adjustedFooterY;
  certLines.forEach((line) => {
    page.drawText(line, { x: certX, y: certY, size: TYPO.notes, font: regular, color: COLORS.furniture });
    certY -= paraAdvance;
  });
  // Draw WAARMERK stack aligned with first paragraph line baseline (not bold)
  page.drawText('WAARMERK', { x: left, y: adjustedFooterY, size: TYPO.waarmerk, font: regular, color: COLORS.furniture });
  const kvkStackY = adjustedFooterY - mm(3.5);
  page.drawText('KAMER VAN KOOPHANDEL', { x: left, y: kvkStackY, size: TYPO.waarmerk, font: regular, color: COLORS.furniture });

  // Bottom gradient bar
  const slices = 160;
  const sliceW = PAGE.width / slices;
  const leftC = [0xa0 / 255, 0x29 / 255, 0x74 / 255];
  const mid = [0xc6 / 255, 0x58 / 255, 0x46 / 255];
  const rightC = [0xec / 255, 0x92 / 255, 0x36 / 255];
  for (let i = 0; i < slices; i++) {
    const t = i / (slices - 1);
    let c;
    if (t <= 0.5) {
      const u = t / 0.5;
      c = [leftC[0] + (mid[0] - leftC[0]) * u, leftC[1] + (mid[1] - leftC[1]) * u, leftC[2] + (mid[2] - leftC[2]) * u];
    } else {
      const u = (t - 0.5) / 0.5;
      c = [mid[0] + (rightC[0] - mid[0]) * u, mid[1] + (rightC[1] - mid[1]) * u, mid[2] + (rightC[2] - mid[2]) * u];
    }
    page.drawRectangle({ x: i * sliceW, y: 0, width: sliceW + 0.5, height: gradientHeight, color: rgb(c[0], c[1], c[2]) });
  }

  // Rotated timestamp strip (6 mm from right, vertically centered)
  const stamp = formatTimestampStrip(now);
  page.drawText(stamp, { x: PAGE.width - mm(6), y: PAGE.height / 2, size: TYPO.timestamp, font: regular, color: COLORS.furniture, rotate: degrees(90) });

  const pdfBytes = await pdfDoc.save({ addDefaultPage: false });
  return pdfBytes;
}

// Backward compatibility for other imports
export default generatePDF;

