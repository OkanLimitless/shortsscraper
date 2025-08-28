import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generatePDF } from '../src/lib/kvkGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const formData = {
    tradeName: 'Demo Trade Name\nDemo Secondary Name',
    kvkNumber: '12345678',
    address: 'Hoofdstraat 12 7051 XJ Varsseveld',
    establishmentNumber: '000012345678',
    legalForm: 'Eenmanszaak (comparable with One-man business)',
    employees: '0',
    ownerName: 'Jansen, Piet',
    ownerDOB: '1986-02-14',
    activities: 'SBI-code: 6202 – Computer consultancy activities\nSBI-code: 6311 – Data processing, hosting and related activities',
    companyStartDate: '2020-05-14',
    companyRegistrationDate: '2020-05-19',
    dateOfIncorporation: '2020-05-14',
    establishmentRegistrationDate: '2020-05-19',
    dateOfEntryIntoOffice: '2020-05-14',
    ownerRegistrationDate: '2020-05-19',
  };

  const bytes = await generatePDF(formData);
  const outDir = '/workspace/output';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'kvk_test.pdf');
  fs.writeFileSync(outPath, bytes);
  console.log('Wrote', outPath, bytes.length, 'bytes');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

