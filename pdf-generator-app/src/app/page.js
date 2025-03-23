'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PDFPreview from '../components/PDFPreview';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    tradeName: '',
    legalForm: 'Eenmanszaak', // Default value
    address: '',
    kvkNumber: '',
    activities: '',
    dateOfIncorporation: formatDate(new Date()),
    ownerName: '',
    ownerDOB: '',
  });

  // Load data from localStorage if available (for examples)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('exampleData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setFormData(parsedData);
          // Clear the localStorage after loading to prevent reloading on refresh
          localStorage.removeItem('exampleData');
        } catch (err) {
          console.error('Error parsing saved data:', err);
        }
      }
    }
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Send the form data to the API
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate document');
      }
      
      // Get the HTML content
      const htmlContent = await response.text();
      
      // Create a Blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Open the HTML document in a new tab
      window.open(url, '_blank');
      
      // Create a link and click it to trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kvk_register_extract.html';
      document.body.appendChild(a);
      a.click();
      
      // Store the HTML content in state for potential conversion
      setHtmlContent(htmlContent);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setPreview(true);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900">KVK Business Register Extract Generator</h1>
            <p className="text-gray-600 mt-2">Generate exact replicas of KVK business register extracts</p>
          </div>
          
          <div className="w-full max-w-2xl flex justify-end mb-4">
            <Link href="/examples" className="text-blue-600 hover:underline">
              View Examples
            </Link>
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="w-full space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Trade Name */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trade Name (Handelsnaam) *
                    </label>
                    <input
                      type="text"
                      name="tradeName"
                      value={formData.tradeName}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  
                  {/* Legal Form */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Legal Form (Rechtsvorm)
                    </label>
                    <select
                      name="legalForm"
                      value={formData.legalForm}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="Eenmanszaak">Eenmanszaak</option>
                      <option value="B.V.">B.V.</option>
                      <option value="V.O.F.">V.O.F.</option>
                      <option value="Maatschap">Maatschap</option>
                      <option value="Stichting">Stichting</option>
                      <option value="Vereniging">Vereniging</option>
                    </select>
                  </div>
                  
                  {/* KVK Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      KVK Number *
                    </label>
                    <input
                      type="text"
                      name="kvkNumber"
                      value={formData.kvkNumber}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="12345678"
                    />
                  </div>
                  
                  {/* Address */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Visiting Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="Streetname 123, 1234AB City"
                    />
                  </div>
                  
                  {/* Activities */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activities
                    </label>
                    <textarea
                      name="activities"
                      value={formData.activities}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="Describe business activities..."
                    />
                  </div>
                  
                  {/* Date of Incorporation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Incorporation
                    </label>
                    <input
                      type="date"
                      name="dateOfIncorporation"
                      value={formData.dateOfIncorporation}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  
                  {/* Owner Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  
                  {/* Owner Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Date of Birth
                    </label>
                    <input
                      type="date"
                      name="ownerDOB"
                      value={formData.ownerDOB}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
                
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-semibold"
                  >
                    {loading ? 'Generating...' : 'Generate KVK Extract'}
                  </button>
                  <p className="mt-4 text-sm text-gray-500">
                    The generated document will exactly match the official KVK layout.
                  </p>
                </div>
              </form>
            </div>
            
            <div className="md:col-span-1">
              <PDFPreview 
                title="KVK Document"
                description="Chamber of Commerce business extract with your information"
              />
              
              <div className="mt-4 text-sm text-gray-500">
                <p>This generator creates a PDF document based on the Dutch Chamber of Commerce (KVK) format.</p>
                <p>Fields marked with * are required.</p>
                <p className="mt-4">After filling the form, click "Generate PDF" to download the document.</p>
              </div>

              {preview && (
                <div className="mt-4">
                  <p className="text-green-600 font-semibold mb-2">KVK Extract generated successfully!</p>
                  {htmlContent && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">To save as a perfect PDF:</p>
                      <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-1">
                        <li>Use the Print button in the opened HTML page</li>
                        <li>Select "Save as PDF" as the destination</li>
                        <li>Set paper size to A4</li>
                        <li>Set margins to "None"</li>
                        <li>Disable headers and footers</li>
                      </ol>
                      <button
                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        onClick={() => {
                          // Prepare data for online conversion
                          const encodedHtml = encodeURIComponent(htmlContent);
                          window.open(`https://www.sejda.com/html-to-pdf?content=${encodedHtml}`, '_blank');
                        }}
                      >
                        Convert to PDF Online (Alternative)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
} 