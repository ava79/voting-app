// src/WalletContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }) {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [network, setNetwork] = useState(null);
  const [error, setError] = useState(null);

  const connectWallet = useCallback(async () => {
    setError(null);
    if (window.ethereum) {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);

        // Request account access
        const accounts = await web3Provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0]);
          const web3Signer = await web3Provider.getSigner();
          setSigner(web3Signer);
          console.log("Wallet connected:", accounts[0]);
        } else {
          setError("No accounts found. Please create an account in MetaMask or unlock it.");
          console.warn("No accounts found after requesting.");
        }

        // Get network
        const net = await web3Provider.getNetwork();
        setNetwork(net);
        console.log("Network detected:", net.name, net.chainId);

      } catch (err) {
        console.error("Error connecting to MetaMask:", err);
        if (err.code === 4001) { // User rejected the request
          setError("Connection rejected. Please connect to MetaMask.");
        } else if (err.code === -32002) { // Request already pending
            setError("MetaMask request already pending. Please check your MetaMask extension.");
        }
        else {
          setError(err.message || "An unknown error occurred while connecting.");
        }
      }
    } else {
      setError("MetaMask not detected. Please install the MetaMask extension.");
      console.warn("MetaMask is not installed.");
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        console.log("Accounts changed:", accounts);
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0]);
          if (provider) {
             try {
                const web3Signer = await provider.getSigner();
                setSigner(web3Signer);
             } catch (e) {
                console.error("Error getting signer after account change:", e);
                setSigner(null); // Could fail if provider is stale or permissions lost
             }
          }
        } else {
          setCurrentAccount(null);
          setSigner(null);
          setError("Account disconnected or none selected in MetaMask.");
          console.log("Wallet disconnected or no accounts available.");
        }
      };

      const handleChainChanged = async (_chainId) => {
        console.log("Network chainChanged to:", _chainId);
        if (provider) {
            try {
                const net = await provider.getNetwork();
                setNetwork(net);
                const web3Signer = await provider.getSigner(); // Re-fetch signer for the new network
                setSigner(web3Signer);
                console.log("Network updated to:", net.name, net.chainId);
            } catch (e) {
                console.error("Error updating network or signer after chain change:", e);
                // May need to prompt user to reconnect or refresh
                setError("Network changed. Please verify connection or reconnect wallet if issues persist.");
            }
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup listeners on component unmount
      return () => {
        if (window.ethereum.removeListener) { // Check if removeListener is available
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [provider]); // Rerun effect if provider changes

  const value = {
    currentAccount,
    provider,
    signer,
    network,
    error,
    connectWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}
