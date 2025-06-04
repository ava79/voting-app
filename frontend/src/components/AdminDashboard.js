// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react'; // Added useEffect for potential future use
import { useAuth } from '../AuthContext'; // To get current user and ID token

function AdminDashboard() {
  const { currentUser } = useAuth();
  const [candidateName, setCandidateName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if the current user is the admin based on UID from environment variable
  // This is for UI display only. Backend enforces actual admin rights.
  const isAdmin = currentUser?.uid === process.env.REACT_APP_ADMIN_FIREBASE_UID;
  const isLocalAdminEnvVarSet = process.env.REACT_APP_ADMIN_FIREBASE_UID &&
                                process.env.REACT_APP_ADMIN_FIREBASE_UID !== "YOUR_ADMIN_FIREBASE_UID_HERE";


  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!candidateName.trim()) {
      setError("Candidate name cannot be empty.");
      return;
    }
    if (!currentUser) { // Should be caught by UI logic in App.js, but good to have
      setError("You must be logged in as an admin to perform this action.");
      return;
    }
    if (!isLocalAdminEnvVarSet || !isAdmin) { // Double check for safety
        setError("Admin privileges required.");
        return;
    }


    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch('/api/admin/add-candidate', { // Using proxy
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ name: candidateName.trim() }),
      });

      const responseData = await response.json().catch(() => ({ error: "Failed to parse server response."}));
      if (!response.ok) {
        throw new Error(responseData.error || `Failed to add candidate: ${response.statusText} (${response.status})`);
      }
      setMessage(`Candidate "${responseData.candidateName || candidateName.trim()}" added successfully! Tx: ${responseData.transactionHash}. Candidate ID: ${responseData.candidateId}`);
      setCandidateName(''); // Clear input after success
    } catch (err) {
      console.error("Error adding candidate:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // This component should ideally only be rendered if the user is an admin.
  // The check in App.js handles this. If direct routing were possible, this internal check would be more critical.
  if (!isLocalAdminEnvVarSet) {
      // This console log helps the developer setting up the .env file.
      console.warn("Frontend Admin Dashboard: REACT_APP_ADMIN_FIREBASE_UID is not set in .env. Admin UI will not be displayed.");
      return null;
  }
  if (!isAdmin) {
      // This case should not be reached if App.js correctly gates access,
      // but it's a fallback or for direct component usage scenarios.
      return <p>Access to admin features is restricted.</p>;
  }


  return (
    <div style={{ padding: '20px', border: '1px solid #007bff', margin: '20px 0', borderRadius: '8px', background: '#e7f3ff' }}>
      <h2 style={{ color: '#007bff', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>Admin Dashboard</h2>
      <h3 style={{ marginTop: '20px' }}>Add New Candidate</h3>
      {error && <p style={{ color: 'red', background: '#ffebee', padding: '10px', borderRadius: '4px' }}>Error: {error}</p>}
      {message && <p style={{ color: 'green', background: '#e8f5e9', padding: '10px', borderRadius: '4px' }}>{message}</p>}
      <form onSubmit={handleAddCandidate} style={{ marginTop: '15px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="candidateName" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Candidate Name:</label>
          <input
            type="text"
            id="candidateName"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            required
            disabled={isSubmitting}
            style={{ padding: '10px', width: 'calc(100% - 22px)', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ padding: '10px 20px', borderRadius: '4px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {isSubmitting ? 'Adding Candidate...' : 'Add Candidate'}
        </button>
      </form>
    </div>
  );
}
export default AdminDashboard;
