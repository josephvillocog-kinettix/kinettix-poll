import React, { useState, useEffect } from 'react';

const API_URL = 'https://script.google.com/macros/s/AKfycbyoIV6jfTE_ZG_PIaXoqAjh0gu-xJEFui40F-IfSCynERTZAaNBg9xGHIkudiB6IIC0/exec';

const ApiDebugPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [parsedResponse, setParsedResponse] = useState<any | null>(null);

  useEffect(() => {
    const fetchApiData = async () => {
      setLoading(true);
      setError(null);
      setRawResponse(null);
      setParsedResponse(null);

      try {
        const response = await fetch(API_URL);
        const text = await response.text();
        setRawResponse(text);

        if (!response.ok) {
          throw new Error(`Network response was not ok. Status: ${response.status}. Body: ${text}`);
        }

        try {
          const json = JSON.parse(text);
          setParsedResponse(json);
        } catch (jsonError) {
          throw new Error(`Failed to parse response as JSON. Error: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
        }

      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : String(fetchError));
      } finally {
        setLoading(false);
      }
    };

    fetchApiData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold sm:text-4xl">Unified API Debug Tool</h2>
        <p className="mt-4 text-lg text-gray-300">This page shows the direct response from the unified data API.</p>
        <p className="text-sm text-gray-500 font-mono break-all">{API_URL}</p>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-xl shadow-2xl backdrop-blur-md space-y-8">
        {loading && (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {error && (
          <div>
            <h3 className="text-xl font-bold text-red-400 mb-2">Error Encountered</h3>
            <pre className="bg-gray-900 p-4 rounded-lg text-red-300 whitespace-pre-wrap break-all">{error}</pre>
          </div>
        )}

        {rawResponse && (
          <div>
            <h3 className="text-xl font-bold text-gray-200 mb-2">Raw API Response (Text)</h3>
            <pre className="bg-gray-900 p-4 rounded-lg text-gray-300 max-h-96 overflow-auto whitespace-pre-wrap break-all">{rawResponse}</pre>
          </div>
        )}

        {parsedResponse && (
          <div>
            <h3 className="text-xl font-bold text-gray-200 mb-2">Parsed API Response (JSON)</h3>
            <pre className="bg-gray-900 p-4 rounded-lg text-green-300 max-h-96 overflow-auto whitespace-pre-wrap break-all">
              {JSON.stringify(parsedResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiDebugPage;
