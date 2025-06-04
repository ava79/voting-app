// src/components/ResultsLeaderboard.js
import React, { useState, useEffect, useCallback } from 'react';

function ResultsLeaderboard() {
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchResults = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      // Assuming '/api/results' endpoint exists and returns candidate data with vote counts
      const response = await fetch('/api/results'); // Using relative path due to proxy
      if (!response.ok) {
        const errData = await response.json().catch(() => ({error: "Failed to parse error from server"}));
        throw new Error(errData.error || `Failed to fetch results: ${response.statusText} (${response.status})`);
      }
      const data = await response.json();
      // Sort data by voteCount in descending order
      const sortedData = data.sort((a, b) => b.voteCount - a.voteCount);
      setResults(sortedData);
    } catch (err) {
      console.error("Error fetching results:", err);
      setError(err.message);
      setResults([]); // Clear results on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(); // Initial fetch

    // Optional: Set up a timer to periodically refresh results
    const intervalId = setInterval(fetchResults, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [fetchResults]);

  const renderContent = () => {
    if (isLoading && results.length === 0) {
      return <p>Loading results...</p>;
    }

    if (error) {
      return <p style={{ color: 'red' }}>Error loading results: {error}</p>;
    }

    if (results.length === 0 && !isLoading) {
        return <p>No results available yet, or no candidates have been added.</p>
    }

    return (
      <ol style={{ listStyleType: 'decimal', paddingLeft: '20px' }}>
        {results.map((candidate, index) => (
          <li key={candidate.id} style={{ marginBottom: '10px', padding: '5px', borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 'bold', marginRight: '10px' }}>{index + 1}. {candidate.name}</span>:
            <span style={{ color: '#007bff', fontWeight: 'bold' }}> {candidate.voteCount} vote(s)</span>
          </li>
        ))}
      </ol>
    );
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px 0', borderRadius: '8px', background: '#f9f9f9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: '0' }}>Voting Results & Leaderboard</h2>
        <button
          onClick={fetchResults}
          disabled={isLoading}
          style={{ padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isLoading ? 'Refreshing...' : 'Refresh Results'}
        </button>
      </div>
      {renderContent()}
    </div>
  );
}
export default ResultsLeaderboard;
