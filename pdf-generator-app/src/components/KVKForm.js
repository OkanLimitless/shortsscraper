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
    tradeNameAlias: '',
    legalForm: 'Eenmanszaak (comparable with One-man business)', // Default value
    kvkNumber: '',
    address: '',
    establishmentNumber: '',
    employees: '0', // Default value
    dateOfIncorporation: '',
    activities: '',
    ownerName: '',
    ownerDOB: '',
  });
  
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
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
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
            
            <div className={styles.inputGroup}>
              <label htmlFor="tradeNameAlias" className={styles.label}>
                Trade Name Alias
              </label>
              <input
                type="text"
                id="tradeNameAlias"
                name="tradeNameAlias"
                value={formData.tradeNameAlias}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Alternative trade name (optional)"
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
            
            <div className={styles.inputGroup}>
              <label htmlFor="employees" className={styles.label}>
                Number of Employees
              </label>
              <input
                type="number"
                id="employees"
                name="employees"
                value={formData.employees}
                onChange={handleInputChange}
                className={styles.input}
                min="0"
                max="10000"
                placeholder="Number of employees"
              />
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

          <div className={styles.inputGroup}>
            <label htmlFor="activities" className={styles.label}>
              Business Activities
            </label>
            <textarea
              id="activities"
              name="activities"
              value={formData.activities}
              onChange={handleInputChange}
              className={styles.textarea}
              placeholder="Describe business activities and SBI codes"
              rows="3"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="dateOfIncorporation" className={styles.label}>
              Date of Incorporation
            </label>
            <input
              type="date"
              id="dateOfIncorporation"
              name="dateOfIncorporation"
              value={formatDate(formData.dateOfIncorporation)}
              onChange={handleInputChange}
              className={styles.input}
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
              />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {validationErrors.general && (
          <div className={styles.error}>
            {validationErrors.general}
          </div>
        )}
        
        {error && (
          <div className={styles.error}>
            Error: {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className={styles.success}>
            PDF generated successfully and downloaded!
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`${styles.button} ${loading ? styles.buttonLoading : ''}`}
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