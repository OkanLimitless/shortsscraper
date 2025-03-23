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
  
  // Validate the form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.tradeName.trim()) {
      errors.tradeName = 'Trade name is required';
    }
    
    if (!formData.kvkNumber.trim()) {
      errors.kvkNumber = 'KVK number is required';
    } else if (!/^\d{8}$/.test(formData.kvkNumber.trim())) {
      errors.kvkNumber = 'KVK number must be exactly 8 digits';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Generate PDF from form data
  const generatePDF = async (e) => {
    e.preventDefault();
    
    // Validate form first
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      const htmlContent = await response.text();
      setGeneratedHtml(htmlContent);
      setSuccess(true);
      
      // Open the HTML content in a new window
      const newWindow = window.open();
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      
    } catch (err) {
      setError(err.message || 'An error occurred while generating the PDF');
    } finally {
      setLoading(false);
    }
  };
  
  // Open HTML-to-PDF converter
  const convertToPDF = () => {
    if (!generatedHtml) return;
    
    // Encode the HTML content
    const encodedHtml = encodeURIComponent(generatedHtml);
    // Open a converter in a new window
    window.open(`https://htmlpdfapi.com/export-to-pdf?html=${encodedHtml}`, '_blank');
  };
  
  return (
    <div className={styles.formContainer}>
      <h1 className={styles.formTitle}>KVK Business Register Extract Generator</h1>
      
      <form onSubmit={generatePDF} className={styles.form}>
        {/* Company Information Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Company Information</h2>
          
          <div className={styles.formGroup}>
            <label htmlFor="tradeName">
              Trade Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="tradeName"
              name="tradeName"
              value={formData.tradeName}
              onChange={handleInputChange}
              className={validationErrors.tradeName ? styles.errorInput : ''}
              placeholder="e.g. Diamond Sky Marketing"
            />
            {validationErrors.tradeName && (
              <p className={styles.errorText}>{validationErrors.tradeName}</p>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="tradeNameAlias">Trade Name Alias</label>
            <input
              type="text"
              id="tradeNameAlias"
              name="tradeNameAlias"
              value={formData.tradeNameAlias}
              onChange={handleInputChange}
              placeholder="e.g. AdWings"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="legalForm">Legal Form</label>
            <select
              id="legalForm"
              name="legalForm"
              value={formData.legalForm}
              onChange={handleInputChange}
            >
              <option value="Eenmanszaak (comparable with One-man business)">Eenmanszaak</option>
              <option value="Besloten Vennootschap (Private Limited Company)">BV</option>
              <option value="Naamloze Vennootschap (Public Limited Company)">NV</option>
              <option value="Stichting (Foundation)">Stichting</option>
              <option value="Vereniging (Association)">Vereniging</option>
              <option value="VOF (General Partnership)">VOF</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="kvkNumber">
              KVK Number <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="kvkNumber"
              name="kvkNumber"
              value={formData.kvkNumber}
              onChange={handleInputChange}
              className={validationErrors.kvkNumber ? styles.errorInput : ''}
              placeholder="e.g. 77678303 (8 digits)"
            />
            {validationErrors.kvkNumber && (
              <p className={styles.errorText}>{validationErrors.kvkNumber}</p>
            )}
          </div>
        </div>
        
        {/* Establishment Information Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Establishment Information</h2>
          
          <div className={styles.formGroup}>
            <label htmlFor="establishmentNumber">Establishment Number</label>
            <input
              type="text"
              id="establishmentNumber"
              name="establishmentNumber"
              value={formData.establishmentNumber}
              onChange={handleInputChange}
              placeholder="e.g. 000045362920"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="e.g. Spreeuwenhof 81, 7051XJ Varsseveld"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="activities">Activities</label>
            <textarea
              id="activities"
              name="activities"
              value={formData.activities}
              onChange={handleInputChange}
              placeholder="e.g. SBI-code: 74101 - Communication and graphic design"
              rows={3}
            />
          </div>
        </div>
        
        {/* Owner Information Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Owner Information</h2>
          
          <div className={styles.formGroup}>
            <label htmlFor="ownerName">Owner Name</label>
            <input
              type="text"
              id="ownerName"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleInputChange}
              placeholder="e.g. Piyirci, Okan"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="ownerDOB">Owner Date of Birth</label>
            <input
              type="date"
              id="ownerDOB"
              name="ownerDOB"
              value={formatDate(formData.ownerDOB)}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate KVK Extract'}
          </button>
        </div>
        
        <p className={styles.note}>
          The generated document will match the official KVK layout exactly. 
          You can save it as a PDF to share or print.
        </p>
      </form>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      {success && (
        <div className={styles.successMessage}>
          <h3>KVK Extract Generated!</h3>
          <p>
            Your KVK extract has been generated and should open in a new window.
            Follow these steps to save it as a perfect PDF:
          </p>
          <ol>
            <li>In the new window, click the &quot;Print/Save as PDF&quot; button</li>
            <li>Select &quot;Save as PDF&quot; as the destination</li>
            <li>Set paper size to A4</li>
            <li>Set margins to &quot;None&quot;</li>
            <li>Disable headers and footers</li>
            <li>Click Save</li>
          </ol>
          <p>
            Alternatively, you can use an online converter:
          </p>
          <button
            type="button"
            onClick={convertToPDF}
            className={styles.convertButton}
          >
            Convert HTML to PDF Online
          </button>
        </div>
      )}
    </div>
  );
} 