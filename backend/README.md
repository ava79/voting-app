# Backend API Deployment

This document provides instructions for deploying the Node.js/Express.js backend API for the Voting DApp.

## Prerequisites
- Node.js & npm (or yarn)
- A deployed instance of the `Voting.sol` smart contract on the Polygon Mumbai Testnet (see `../blockchain/README.md` for deployment instructions). You will need its deployed address.
- A Firebase project set up with Firebase Authentication enabled.
- Firebase Admin SDK credentials (service account key JSON file) obtained from your Firebase project console.
- A wallet private key for the backend to interact with the smart contract (e.g., adding candidates, potentially casting votes if designed that way). This wallet must be funded with MATIC on the Polygon Mumbai Testnet to cover gas fees.

## Environment Variables
The backend requires several environment variables to be configured for it to function correctly. Create a `.env` file in the root of the `backend` project or configure these variables directly in your chosen deployment platform's environment settings.

```env
# Server Configuration
PORT=3001 # Or any port your deployment platform assigns

# Firebase Admin SDK Configuration
# Option 1: Path to your service account key JSON file
GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/serviceAccountKey.json"
# Option 2: If your platform supports multi-line env vars or you have another way to provide it to the SDK:
# FIREBASE_ADMIN_SDK_CONFIG_JSON='{"type": "service_account", "project_id": "...", ...}'
# (The index.js currently uses admin.initializeApp() which relies on GOOGLE_APPLICATION_CREDENTIALS by default if no argument is passed)

# Polygon Mumbai Network Configuration
MUMBAI_RPC_URL="YOUR_POLYGON_MUMBAI_RPC_URL" # e.g., from Alchemy, Infura
CONTRACT_ADDRESS="DEPLOYED_VOTING_CONTRACT_ADDRESS_ON_MUMBAI"

# Backend Wallet for Smart Contract Interaction
BACKEND_WALLET_PRIVATE_KEY="YOUR_BACKEND_WALLET_PRIVATE_KEY" # Wallet for signing transactions
# This wallet must have MATIC for gas on the Mumbai Testnet.

# Application Admin Configuration
ADMIN_FIREBASE_UID="FIREBASE_UID_OF_THE_DESIGNATED_ADMIN_USER"
# This UID is used to grant admin privileges for actions like adding candidates.
```

**Important Notes on Environment Variables:**
-   Replace all placeholder values (`YOUR_...`, `DEPLOYED_...`, `/path/to/...`) with your actual credentials and configuration details.
-   **`GOOGLE_APPLICATION_CREDENTIALS`**: If you deploy the `serviceAccountKey.json` file with your application, ensure its path is correctly specified. For security, it's often better if the deployment platform provides a secure way to manage this key (e.g., as a secret or by directly pasting JSON content into an environment variable if supported). If deploying to Google Cloud services like Cloud Run or App Engine, the SDK might automatically pick up credentials if the service account has appropriate IAM roles.
-   **`BACKEND_WALLET_PRIVATE_KEY`**: This key is sensitive and should be kept secure. Do not commit it to version control.
-   The `.env` file is typically ignored by Git (check `.gitignore`).

## Deployment Platforms

Choose a platform that supports Node.js applications. Here are a few examples:

-   **Render:**
    1.  Connect your Git repository to Render.
    2.  Create a new "Web Service".
    3.  Select your Node.js environment.
    4.  Set Build Command: `npm install` (or `yarn install`).
    5.  Set Start Command: `npm start`.
    6.  Configure all necessary environment variables in the Render dashboard under the "Environment" section for your service.

-   **Heroku (Note: Free tier changes):**
    1.  Install the Heroku CLI and log in.
    2.  Create a new Heroku app: `heroku create your-app-name`.
    3.  Add your code to a Git repository and push to Heroku: `git push heroku main`.
    4.  Configure environment variables: `heroku config:set VAR_NAME="value"`.

-   **Vercel:**
    1.  Connect your Git repository. Vercel often auto-detects Node.js/Express.
    2.  Configure environment variables in the Vercel project settings.
    3.  Vercel typically deploys Node.js backends as serverless functions. Ensure your application structure is compatible or configure `vercel.json` if needed.

-   **Google Cloud Run / App Engine / AWS Elastic Beanstalk / Azure App Service:** These platforms also offer robust Node.js hosting with various configuration options for environment variables and scaling.

## Running Locally for Development
1.  Navigate to the `backend` directory: `cd backend`
2.  Install dependencies: `npm install`
3.  Create a `.env` file in the `backend` directory and populate it with all the required environment variables listed above.
4.  Start the server: `npm start`
    The server will typically run on `http://localhost:3001` (or the port specified in your `.env` or `index.js`).
