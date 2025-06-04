// src/App.js
import React from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import AuthDetails from './components/AuthDetails';
import ConnectWalletButton from './components/ConnectWalletButton';
import VotingDashboard from './components/VotingDashboard';
import ResultsLeaderboard from './components/ResultsLeaderboard';
import AdminDashboard from './components/AdminDashboard'; // Import AdminDashboard
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';

function App() {
  const { currentUser, loading: authLoading } = useAuth();
  const { currentAccount, error: walletError } = useWallet();

  // Check if current user is admin for UI purposes
  // Security is enforced by the backend.
  // Ensure REACT_APP_ADMIN_FIREBASE_UID is defined and not the placeholder.
  const isAdminUser = currentUser?.uid === process.env.REACT_APP_ADMIN_FIREBASE_UID &&
                      process.env.REACT_APP_ADMIN_FIREBASE_UID !== "YOUR_ADMIN_FIREBASE_UID_HERE";


  if (authLoading) {
    return (
      <div className="App">
        <header className="App-header" style={{ justifyContent: 'center', alignItems: 'center', padding: '20px', backgroundColor: '#282c34', color: 'white', minHeight: '100vh' }}>
          <h1>Voting Application</h1>
          <p>Authenticating...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        borderBottom: '1px solid #444',
        backgroundColor: '#282c34',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5em' }}>Voting DApp</h1>
        <ConnectWalletButton />
      </header>

      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {!currentUser ? (
          <>
            <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.1em' }}>
              Welcome! Please log in or register to vote. The results leaderboard is visible to everyone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '30px' }}>
              <section style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', margin: '10px', minWidth: '320px', background: '#f9f9f9', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Register />
              </section>
              <section style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', margin: '10px', minWidth: '320px', background: '#f9f9f9', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Login />
              </section>
            </div>
          </>
        ) : (
          <>
            <AuthDetails />
            <hr style={{ margin: '20px 0', borderColor: '#eee' }}/>

            {/* Admin Dashboard - only if current user is admin */}
            {isAdminUser && (
                <>
                  <AdminDashboard />
                  <hr style={{ margin: '20px 0', borderColor: '#007bff' }}/>
                </>
            )}

            {walletError && <p style={{color: 'red', textAlign: 'center', fontWeight: 'bold'}}>Wallet Error: {walletError}</p>}

            {currentAccount ? (
              <VotingDashboard />
            ) : (
              !walletError &&
              <div style={{textAlign: 'center', padding: '20px', border: '1px dashed #ccc', margin: '20px auto', maxWidth: '500px', borderRadius: '8px'}}>
                <p style={{fontSize: '1.1em'}}>Your Firebase account is authenticated.</p>
                <p>Please connect your MetaMask wallet to participate in voting.</p>
              </div>
            )}
          </>
        )}
        <hr style={{ margin: '30px 0', borderColor: '#ddd' }}/>
        <ResultsLeaderboard />
      </main>

      <footer style={{ textAlign: 'center', padding: '20px', marginTop: '40px', borderTop: '1px solid #eee', background: '#f8f9fa' }}>
        <p>&copy; 2024 Voting DApp. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
