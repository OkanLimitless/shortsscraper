'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Examples() {
  const [activeExample, setActiveExample] = useState(null);
  
  const examples = [
    {
      id: 1,
      name: 'Life-artcoaching',
      data: {
        tradeName: 'Life-artcoaching',
        legalForm: 'Eenmanszaak',
        address: 'Niesternweg 14, 9962TC Schouwerzijl',
        kvkNumber: '58095292',
        activities: 'Maatschappelijke dienstverlening. Persoonlijke begeleiding en coaching gezinsondersteuning (AWBZ). Specifieke doelgroepen en particulieren, onder andere ASS, AD(H)D, burn-out. Paramedische dienstverlening, voedingscoaching. Herstel en arbeid.',
        dateOfIncorporation: '2015-01-01',
        ownerName: 'Jane Doe',
        ownerDOB: '1980-05-15',
      }
    },
    {
      id: 2,
      name: 'Tech Solutions B.V.',
      data: {
        tradeName: 'Tech Solutions B.V.',
        legalForm: 'B.V.',
        address: 'Stationsplein 45, 3013AK Rotterdam',
        kvkNumber: '72365489',
        activities: 'Software development, IT consultancy, web development, app development, and digital transformation services.',
        dateOfIncorporation: '2018-03-22',
        ownerName: 'John Smith',
        ownerDOB: '1975-11-30',
      }
    },
    {
      id: 3,
      name: 'Green Garden V.O.F.',
      data: {
        tradeName: 'Green Garden V.O.F.',
        legalForm: 'V.O.F.',
        address: 'Dorpsstraat 12, 8431ET Oosterwolde',
        kvkNumber: '63215478',
        activities: 'Landscaping, garden design, garden maintenance, garden supplies retail, and tree care services.',
        dateOfIncorporation: '2016-05-10',
        ownerName: 'Sarah Johnson & Michael Brown',
        ownerDOB: '1982-08-15',
      }
    }
  ];
  
  const handleLoadExample = (example) => {
    setActiveExample(example);
    
    // Store the example data in localStorage to be used in the main form
    localStorage.setItem('exampleData', JSON.stringify(example.data));
  };
  
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-8">Example Documents</h1>
      
      <div className="w-full max-w-4xl mb-8">
        <p className="text-gray-600 mb-4">
          Below are examples of business information that can be used to generate PDF documents.
          Click on "Load example" to see the details, or "Use this example" to pre-fill the form with this data.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {examples.map((example) => (
            <div key={example.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <h2 className="font-bold text-lg">{example.name}</h2>
              <p className="text-sm text-gray-500 mb-3">{example.data.legalForm}</p>
              <p className="text-sm mb-1">KVK: {example.data.kvkNumber}</p>
              <p className="text-sm mb-4 truncate">{example.data.address}</p>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleLoadExample(example)}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Load example
                </button>
                <Link 
                  href="/"
                  onClick={() => handleLoadExample(example)}
                  className="text-green-600 text-sm hover:underline"
                >
                  Use this example
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {activeExample && (
        <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-2xl font-bold mb-4">{activeExample.name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Trade Name</h3>
              <p className="mb-3">{activeExample.data.tradeName}</p>
              
              <h3 className="font-semibold text-gray-700 mb-1">Legal Form</h3>
              <p className="mb-3">{activeExample.data.legalForm}</p>
              
              <h3 className="font-semibold text-gray-700 mb-1">KVK Number</h3>
              <p className="mb-3">{activeExample.data.kvkNumber}</p>
              
              <h3 className="font-semibold text-gray-700 mb-1">Address</h3>
              <p className="mb-3">{activeExample.data.address}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Activities</h3>
              <p className="mb-3 text-sm">{activeExample.data.activities}</p>
              
              <h3 className="font-semibold text-gray-700 mb-1">Date of Incorporation</h3>
              <p className="mb-3">{activeExample.data.dateOfIncorporation}</p>
              
              <h3 className="font-semibold text-gray-700 mb-1">Owner</h3>
              <p className="mb-1">{activeExample.data.ownerName}</p>
              <p className="mb-3 text-sm">Born: {activeExample.data.ownerDOB}</p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Link
              href="/"
              onClick={() => localStorage.setItem('exampleData', JSON.stringify(activeExample.data))}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Use this data
            </Link>
          </div>
        </div>
      )}
    </main>
  );
} 