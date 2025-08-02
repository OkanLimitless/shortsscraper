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

  // Veriftools state for Croatian passport generation
  const [generatePassport, setGeneratePassport] = useState(false);
  const [passportSex, setPassportSex] = useState('M'); // Default to M
  const [verriftoolsCredentials, setVeriftoolsCredentials] = useState({
    username: '',
    password: '',
    generatorSlug: 'croatia-passport' // Croatian passport generator slug
  });
  const [passportGenerating, setPassportGenerating] = useState(false);
  const [passportError, setPassportError] = useState(null);
  const [passportSuccess, setPassportSuccess] = useState(false);
  
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

  // Handle Veriftools credentials change
  const handleVeriftoolsCredentialsChange = (e) => {
    const { name, value } = e.target;
    setVeriftoolsCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate Croatian passport with Veriftools (separate from KVK generation)
  const generateCroatianPassport = async () => {
    setPassportGenerating(true);
    setPassportError(null);
    setPassportSuccess(false);

    try {
      const response = await fetch('/api/generate-veriftools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          generatorSlug: verriftoolsCredentials.generatorSlug,
          sex: passportSex,
          credentials: {
            username: verriftoolsCredentials.username,
            password: verriftoolsCredentials.password
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate Croatian passport');
      }

      // Get the PDF blob and create download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
        : 'croatian_passport.pdf';

      // Create download link
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setPassportSuccess(true);
    } catch (err) {
      console.error('Croatian passport generation error:', err);
      setPassportError(err.message || 'Failed to generate Croatian passport');
    } finally {
      setPassportGenerating(false);
    }
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
      // Always generate KVK PDF using existing method
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

      // Additionally generate Croatian passport if enabled
      if (generatePassport && verriftoolsCredentials.username && verriftoolsCredentials.password) {
        // Generate Croatian passport in the background
        setTimeout(() => {
          generateCroatianPassport();
        }, 1000); // Small delay to let KVK download start first
      }
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
          
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="tradeName" className={styles.label}>
                Trade Name *
              </label>
              <input
                type="text"
                id="tradeName"
                name="tradeName"
                value={formData.tradeName}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter company trade name"
              />
            </div>
            

          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="kvkNumber" className={styles.label}>
                KVK Number *
              </label>
              <input
                type="text"
                id="kvkNumber"
                name="kvkNumber"
                value={formData.kvkNumber}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="8-digit KVK number"
                maxLength="8"
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="establishmentNumber" className={styles.label}>
                Establishment Number
              </label>
              <input
                type="text"
                id="establishmentNumber"
                name="establishmentNumber"
                value={formData.establishmentNumber}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="12-digit establishment number"
                maxLength="12"
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="legalForm" className={styles.label}>
                Legal Form
              </label>
              <select
                id="legalForm"
                name="legalForm"
                value={formData.legalForm}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="Eenmanszaak (comparable with One-man business)">Eenmanszaak (One-man business)</option>
                <option value="Besloten vennootschap (comparable with Private limited company)">BV (Private Limited Company)</option>
                <option value="Naamloze vennootschap (comparable with Public limited company)">NV (Public Limited Company)</option>
                <option value="Vennootschap onder firma (comparable with General partnership)">VOF (General Partnership)</option>
                <option value="Commanditaire vennootschap (comparable with Limited partnership)">CV (Limited Partnership)</option>
                <option value="Stichting (comparable with Foundation)">Stichting (Foundation)</option>
                <option value="Vereniging (comparable with Association)">Vereniging (Association)</option>
                <option value="Coöperatie (comparable with Cooperative)">Coöperatie (Cooperative)</option>
              </select>
            </div>
            

          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="address" className={styles.label}>
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Street address, postal code, city"
            />
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

        {/* Croatian Passport Generation Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Additional Document Generation</h2>
          
          <div className={styles.inputGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={generatePassport}
                onChange={(e) => setGeneratePassport(e.target.checked)}
                className={styles.checkbox}
              />
              Also generate Croatian Passport using Veriftools API
            </label>
            <p className={styles.description}>
              Generate a Croatian passport document using the name and birth date from the KVK form.
              This will create a separate document with Croatian passport format.
            </p>
          </div>

          {generatePassport && (
            <div className={styles.verriftoolsConfig}>
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label htmlFor="verriftoolsUsername" className={styles.label}>
                    Veriftools Username *
                  </label>
                  <input
                    type="text"
                    id="verriftoolsUsername"
                    name="username"
                    value={verriftoolsCredentials.username}
                    onChange={handleVeriftoolsCredentialsChange}
                    className={styles.input}
                    placeholder="Your Veriftools username"
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="verriftoolsPassword" className={styles.label}>
                    Veriftools Password *
                  </label>
                  <input
                    type="password"
                    id="verriftoolsPassword"
                    name="password"
                    value={verriftoolsCredentials.password}
                    onChange={handleVeriftoolsCredentialsChange}
                    className={styles.input}
                    placeholder="Your Veriftools password"
                  />
                </div>
              </div>
              
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label htmlFor="generatorSlug" className={styles.label}>
                    Croatian Passport Generator Slug
                  </label>
                  <input
                    type="text"
                    id="generatorSlug"
                    name="generatorSlug"
                    value={verriftoolsCredentials.generatorSlug}
                    onChange={handleVeriftoolsCredentialsChange}
                    className={styles.input}
                    placeholder="croatia-passport"
                  />
                  <p className={styles.description}>
                    The generator slug for Croatian passport documents. Contact Veriftools support for the correct slug.
                  </p>
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="passportSex" className={styles.label}>
                    Sex
                  </label>
                  <select
                    id="passportSex"
                    value={passportSex}
                    onChange={(e) => setPassportSex(e.target.value)}
                    className={styles.select}
                  >
                    <option value="M">M (Male)</option>
                    <option value="F">F (Female)</option>
                  </select>
                </div>
              </div>

              <div className={styles.passportPreview}>
                <h4>Croatian Passport Data Preview:</h4>
                <p><strong>Surname:</strong> {formData.ownerName ? formData.ownerName.split(' ').pop() : 'N/A'}</p>
                <p><strong>Given Names:</strong> {formData.ownerName ? formData.ownerName.split(' ').slice(0, -1).join(' ') : 'N/A'}</p>
                <p><strong>Sex:</strong> {passportSex}</p>
                <p><strong>Date of Birth:</strong> {formData.ownerDOB ? new Date(formData.ownerDOB).toLocaleDateString('hr-HR') : 'N/A'}</p>
                <p><strong>Date of Issue:</strong> 15.12.2020</p>
                <p><strong>Date of Expiry:</strong> 15.12.2030</p>
                <p><strong>Nationality:</strong> HRVATSKO</p>
                <p><strong>Place of Birth:</strong> ZAGREB</p>
                <p><strong>Issued by:</strong> PU/ZAGREB</p>
              </div>
            </div>
          )}

          {/* Croatian Passport Status */}
          {passportGenerating && (
            <div className={styles.info}>
              Generating Croatian passport...
            </div>
          )}
          
          {passportError && (
            <div className={styles.error}>
              Croatian Passport Error: {passportError}
            </div>
          )}
          
          {passportSuccess && (
            <div className={styles.success}>
              Croatian passport generated and downloaded successfully!
            </div>
          )}
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