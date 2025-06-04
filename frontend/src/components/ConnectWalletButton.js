// src/components/ConnectWalletButton.js
import React from 'react';
import { useWallet } from '../WalletContext'; // Adjust path if WalletContext is elsewhere

function ConnectWalletButton() {
  const { currentAccount, network, error, connectWallet } = useWallet();

  const handleConnect = () => {
    // Check if already connecting or an error exists that user should clear first
    // For this basic version, just call connectWallet.
    // More advanced logic could prevent multiple rapid clicks or manage states.
    if (!currentAccount) {
      connectWallet();
    }
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #eee', margin: '10px 0', borderRadius: '8px' }}>
      <h4>Wallet Status</h4>
      {error && <p style={{ color: 'red', fontSize: '0.9em' }}>Error: {error}</p>}
      {currentAccount ? (
        <div>
          <p style={{ fontSize: '0.9em', wordBreak: 'break-all' }}>
            Connected: {currentAccount}
          </p>
          {network && (
            <p style={{ fontSize: '0.8em' }}>
              Network: {network.name} (ID: {String(network.chainId)})
            </p>
          )}
        </div>
      ) : (
        <button onClick={handleConnect}>
          Connect MetaMask Wallet
        </button>
      )}
    </div>
  );
}
export default ConnectWalletButton;
