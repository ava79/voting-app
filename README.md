# Full-Stack Blockchain Voting Application

This application allows users to vote on various categories using a blockchain-backed system. It features a React frontend, a Node.js/Express backend, and Solidity smart contracts deployed on the Polygon Mumbai Testnet.

## Prerequisites
- Node.js (v16+ recommended)
- npm (v8+ recommended)
- Git
- MetaMask browser extension

## Project Structure
- `/blockchain`: Contains the Solidity smart contract, Hardhat configuration, tests, and deployment scripts.
- `/backend`: Contains the Node.js/Express API server.
- `/frontend`: Contains the React user interface.

## Setup and Local Development
(Detailed instructions for local setup, including concurrent running of frontend and backend, and any necessary initial setup for Firebase/Blockchain, should be added here by the user/developer. For now, this section is a placeholder.)

To get started with local development:
1. Clone the repository.
2. Configure environment variables as per the README files in each subdirectory (`/blockchain`, `/backend`, `/frontend`).
3. Install dependencies in each subdirectory:
   ```bash
   cd blockchain && npm install && cd ..
   cd backend && npm install && cd ..
   cd frontend && npm install && cd ..
   ```
4. Refer to individual READMEs for running each component.

## Deployment
This project is deployed in three main parts: Smart Contract, Backend API, and Frontend UI.

1.  **Smart Contract (`/blockchain`):**
    -   Detailed instructions in `blockchain/README.md`.
    -   You will need a private key with Polygon Mumbai Testnet MATIC and a Mumbai RPC URL.
2.  **Backend API (`/backend`):**
    -   Detailed instructions and required environment variables in `backend/README.md`.
    -   Platforms like Render, Heroku, or Google Cloud Run can be used.
3.  **Frontend UI (`/frontend`):**
    -   Detailed instructions and required environment variables in `frontend/README.md`.
    -   Platforms like Netlify, Vercel, or GitHub Pages can be used.

Please refer to the README file in each subdirectory for specific deployment steps and environment variable configurations. It is crucial to set up all required environment variables for each part of the application to function correctly.
