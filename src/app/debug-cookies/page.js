'use client';
import { useState, useEffect } from 'react';

export default function DebugCookies() {
  const [cookies, setCookies] = useState('');
  const [apiResult, setApiResult] = useState('');

  useEffect(() => {
    // Check what cookies are available in the browser
    setCookies(document.cookie);
  }, []);

  const testAPI = async () => {
    try {
      console.log('Testing API call with cookies...');
      console.log('Document cookies:', document.cookie);
      
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: 'Test Skill',
          description: 'Testing API call',
          level: 'Beginner'
        })
      });

      const data = await response.json();
      console.log('API Response:', response.status, data);
      
      setApiResult(`Status: ${response.status}, Message: ${data.message}`);
    } catch (error) {
      console.error('API Error:', error);
      setApiResult(`Error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Cookie Debug Page</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Browser Cookies:</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {cookies || 'No cookies found'}
          </pre>
        </div>

        <button 
          onClick={testAPI}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test API Call
        </button>

        {apiResult && (
          <div>
            <h3 className="font-semibold">API Result:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {apiResult}
            </pre>
          </div>
        )}

        <div>
          <h3 className="font-semibold">Instructions:</h3>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li>First, make sure you&apos;re logged in</li>
            <li>Check if the token cookie appears above</li>
            <li>Click "Test API Call" to see if the API works</li>
            <li>Check the console for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
