'use client';

import { useState } from 'react';
import styles from './KVKForm.module.css';

export default function KVKForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  const [formData, setFormData] = useState({
    tradeName: '',
    legalForm: 'Eenmanszaak (comparable with One-man business)', // Default value
    kvkNumber: '',
    address: '',
    establishmentNumber: '',
    ownerName: '',
    ownerDOB: '',
  });
  
  // Single combined input for company information
  const [companyRaw, setCompanyRaw] = useState('');
  const [detected, setDetected] = useState({ tradeName: '', kvkNumber: '', establishmentNumber: '', legalForm: '', address: '' });
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    
    // Clear validation error for this field when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };
  
  // Handle combined textarea input
  const handleCompanyRawChange = (e) => {
    const value = e.target.value;
    setCompanyRaw(value);
    // Parse and auto-fill detected fields
    const lines = value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const text = value;
    const firstLine = lines[0] || '';
    // KVK number (8 digits)
    const kvkMatch = text.match(/KVK[-\s]?nummer\s*:\s*(\d{8})/i);
    const kvkNumber = kvkMatch ? kvkMatch[1] : '';
    // Establishment number (12 digits)
    const estMatch = text.match(/Vestigingsnummer\s*:\s*(\d{12})/i);
    const establishmentNumber = estMatch ? estMatch[1] : '';
    // Legal form mapping
    const legalFormMap = [
      { re: /eenmanszaak/i, val: 'Eenmanszaak (comparable with One-man business)' },
      { re: /besloten\s+vennootschap|\bBV\b/i, val: 'Besloten vennootschap (comparable with Private limited company)' },
      { re: /naamloze\s+vennootschap|\bNV\b/i, val: 'Naamloze vennootschap (comparable with Public limited company)' },
      { re: /vennootschap\s+onder\s+firma|\bVOF\b/i, val: 'Vennootschap onder firma (comparable with General partnership)' },
      { re: /commanditaire\s+vennootschap|\bCV\b/i, val: 'Commanditaire vennootschap (comparable with Limited partnership)' },
      { re: /stichting/i, val: 'Stichting (comparable with Foundation)' },
      { re: /vereniging/i, val: 'Vereniging (comparable with Association)' },
      { re: /co[oö]peratie/i, val: 'Coöperatie (comparable with Cooperative)' },
    ];
    let legalForm = '';
    for (const { re, val } of legalFormMap) {
      if (re.test(text)) { legalForm = val; break; }
    }
    // Address: find a line with Dutch postcode
    let address = '';
    for (let i = lines.length - 1; i >= 0; i--) {
      if (/\b\d{4}\s?[A-Za-z]{2}\b/.test(lines[i])) { address = lines[i]; break; }
    }
    // Trade name: first non-empty line
    const tradeName = firstLine;
    const nextDetected = { tradeName, kvkNumber, establishmentNumber, legalForm, address };
    setDetected(nextDetected);
    setFormData((prev) => ({ ...prev, ...nextDetected }));
  };
  
  // Format date for display - stable across server/client
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Return the date string as-is if it's already in YYYY-MM-DD format
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    // For other formats, use a stable conversion
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch (e) {
      return '';
    }
  };

  // Basic form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.tradeName && !formData.kvkNumber) {
      errors.general = 'Please provide either a trade name or KVK number';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const generatePDF = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Generate PDF using pdf-lib method with advanced anti-detection
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      // Get the PDF blob and create download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
        : 'kvk_extract.pdf';

      // Create download link
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(true);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert HTML to PDF (client-side fallback)
  const convertToPDF = () => {
    if (generatedHtml) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(generatedHtml);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>KVK Business Register Extract Generator</h1>
      <p className={styles.subtitle}>
        Generate authentic KVK business register extracts with advanced anti-detection features
      </p>
      
      <form onSubmit={generatePDF} className={styles.form}>
        {/* Company Information Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Company Information</h2>
          
          <div className={styles.inputGroup}>
            <label htmlFor="companyRaw" className={styles.label}>
              Paste company extract text
            </label>
            <textarea
              id="companyRaw"
              name="companyRaw"
              rows={8}
              value={companyRaw}
              onChange={handleCompanyRawChange}
              className={styles.input}
              placeholder={`e.g.\nVerkeersschool Timmer\nAuto- en motor- en bromfietsrijschool.\nKVK-nummer: 30214916\nEenmanszaak\nHoofdvestiging\nVestigingsnummer: 000001818309\nTexasdreef 24, 3565CL Utrecht`}
            />
          </div>

          {/* Detected summary */}
          <div className={styles.note}>
            <strong>Detected:</strong>
            <div>Trade Name: {detected.tradeName || '—'}</div>
            <div>KVK: {detected.kvkNumber || '—'}</div>
            <div>Establishment: {detected.establishmentNumber || '—'}</div>
            <div>Legal Form: {detected.legalForm || '—'}</div>
            <div>Address: {detected.address || '—'}</div>
          </div>

        </div>

        {/* Owner Information Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Owner Information</h2>
          
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="ownerName" className={styles.label}>
                Owner Name
              </label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Last name, First name"
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="ownerDOB" className={styles.label}>
                Owner Date of Birth
              </label>
              <input
                type="date"
                id="ownerDOB"
                name="ownerDOB"
                value={formatDate(formData.ownerDOB)}
                onChange={handleInputChange}
                className={styles.input}
                suppressHydrationWarning={true}
              />
            </div>
          </div>
        </div>

                {/* Error Display */}
        {validationErrors.general && (
          <div className={styles.error} suppressHydrationWarning={true}>
            {validationErrors.general}
          </div>
        )}
        
        {error && (
          <div className={styles.error} suppressHydrationWarning={true}>
            Error: {error}
          </div>
        )}
        
        {/* Success Message */}
        {success && (
          <div className={styles.success} suppressHydrationWarning={true}>
            PDF generated successfully and downloaded!
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`${styles.button} ${loading ? styles.buttonLoading : ''}`}
          suppressHydrationWarning={true}
        >
          {loading ? 'Generating PDF...' : 'Generate KVK Extract PDF'}
        </button>
      </form>

      {/* Convert to PDF Button (if HTML was generated) */}
      {generatedHtml && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Generated Document</h2>
          <button onClick={convertToPDF} className={styles.button}>
            Open & Print PDF
          </button>
        </div>
      )}
    </div>
  );
} 