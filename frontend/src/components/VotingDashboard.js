// src/components/VotingDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { useWallet } from '../WalletContext'; // To ensure wallet is connected

function VotingDashboard() {
  const { currentUser } = useAuth(); // For getting ID token
  const { currentAccount, provider } = useWallet(); // To ensure wallet is connected
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);

  const fetchCandidates = useCallback(async () => {
    setError('');
    // Keep existing message if any, or clear it: setMessage('');
    setLoadingCandidates(true);
    try {
      const response = await fetch('/api/candidates'); // Using relative path for proxy
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
        throw new Error(errData.error || `Failed to fetch candidates: ${response.statusText} (${response.status})`);
      }
      const data = await response.json();
      setCandidates(data);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setError(err.message);
      setCandidates([]); // Clear candidates on error
    } finally {
      setLoadingCandidates(false);
    }
  }, []);

  useEffect(() => {
    if (currentAccount) { // Fetch candidates if wallet is connected
        console.log("VotingDashboard: Wallet connected, fetching candidates.");
        fetchCandidates();
    } else {
        console.log("VotingDashboard: Wallet not connected, clearing candidates.");
        setCandidates([]); // Clear candidates if wallet disconnects
        setError("Please connect your wallet to interact with the voting system.");
    }
  }, [currentAccount, fetchCandidates]);

  const handleVote = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) {
      setError("Please select a candidate to vote for.");
      return;
    }
    if (!currentUser) {
      setError("You must be logged in to vote.");
      // This case should ideally be prevented by UI structure in App.js
      return;
    }
    if (!currentAccount || !provider) { // Also check for provider for completeness, though currentAccount implies provider
      setError("MetaMask wallet must be connected to vote.");
      return;
    }

    setError('');
    setMessage('');
    setIsSubmittingVote(true);

    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ candidateId: parseInt(selectedCandidate) }),
      });

      const responseData = await response.json().catch(() => ({ error: "Failed to parse response from server." }));
      if (!response.ok) {
        throw new Error(responseData.error || `Failed to cast vote: ${response.statusText} (${response.status})`);
      }
      setMessage(`Vote cast successfully! Transaction Hash: ${responseData.transactionHash}`);
      // Refresh candidates to show updated vote counts
      fetchCandidates();
    } catch (err) {
      console.error("Error casting vote:", err);
      setError(err.message);
    } finally {
      setIsSubmittingVote(false);
    }
  };

  if (!currentAccount) {
    return (
      <div style={{ padding: '20px', border: '1px dashed #ccc', margin: '20px 0' }}>
        <h3>Voting System</h3>
        <p>Please connect your MetaMask wallet to view candidates and participate in voting.</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  if (loadingCandidates) {
    return <p>Loading candidates...</p>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px 0', borderRadius: '8px' }}>
      <h2>Vote for your Favorite Candidate</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      {candidates.length === 0 && !loadingCandidates && (
        <p>No candidates are currently available or failed to load. Try refreshing.</p>
      )}

      {candidates.length > 0 && (
        <form onSubmit={handleVote} style={{ margin: '20px 0' }}>
          <select
            value={selectedCandidate}
            onChange={(e) => setSelectedCandidate(e.target.value)}
            required
            style={{ padding: '10px', marginRight: '10px', minWidth: '200px', borderRadius: '4px' }}
          >
            <option value="" disabled>Select a candidate</option>
            {candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name} (Votes: {candidate.voteCount})
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isSubmittingVote || !selectedCandidate || !currentUser}
            style={{ padding: '10px 15px', borderRadius: '4px', cursor: 'pointer' }}
          >
            {isSubmittingVote ? 'Submitting Vote...' : 'Cast Vote'}
          </button>
        </form>
      )}
      <button
        onClick={fetchCandidates}
        disabled={loadingCandidates || isSubmittingVote}
        style={{ padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
      >
        Refresh Candidates
      </button>
    </div>
  );
}
export default VotingDashboard;
