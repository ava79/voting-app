# Blockchain Deployment (Voting.sol)

This document provides instructions for deploying the `Voting.sol` smart contract to the Polygon Mumbai Testnet.

## Prerequisites
- Node.js & npm (or yarn)
- A private key for an Ethereum-compatible wallet. This wallet must be funded with MATIC tokens on the Polygon Mumbai Testnet to cover gas fees for deployment.
- An RPC URL for the Polygon Mumbai Testnet. You can obtain one from services like Alchemy, Infura, or QuickNode, or use a public RPC if available (though public RPCs may have rate limits).

## Environment Variables
Before deployment, you need to set up environment variables to store your sensitive credentials.

1.  **Navigate to the `blockchain` directory:**
    ```bash
    cd path/to/your/project/blockchain
    ```
2.  **Create a `.env` file:**
    -   In the `blockchain` directory, create a file named `.env`.
    -   Add the following variables to this file:
        ```env
        MUMBAI_RPC_URL="YOUR_POLYGON_MUMBAI_RPC_URL"
        PRIVATE_KEY="YOUR_WALLET_PRIVATE_KEY_WITH_TEST_MATIC"
        # Optional: POLYGONSCAN_API_KEY="YOUR_POLYGONSCAN_API_KEY" (if you plan to verify the contract on PolygonScan)
        ```
    -   **Important:** Replace the placeholder values (`YOUR_...`) with your actual credentials.
        -   `MUMBAI_RPC_URL`: Your RPC endpoint for the Polygon Mumbai network.
        -   `PRIVATE_KEY`: The private key of the account you will use to deploy the contract. **Do not include the `0x` prefix.**
        -   `POLYGONSCAN_API_KEY`: (Optional) If you want to verify your contract on PolygonScan, you'll need an API key from them. The `hardhat.config.js` is set up for this but it's not a mandatory step for deployment itself.

    **Never commit your `.env` file to version control.** The `.gitignore` file in this directory should already be configured to ignore `.env`.

## Deployment Steps
1.  **Install dependencies (if not already done):**
    Ensure you are in the `blockchain` directory, then run:
    ```bash
    npm install
    ```
    (or `yarn install` if you prefer yarn)

2.  **Compile Contracts (Optional - deploy script usually does this):**
    This step ensures your contracts are compiled correctly before deployment.
    ```bash
    npx hardhat compile
    ```

3.  **Run the Deployment Script:**
    Execute the deployment script, targeting the Mumbai network:
    ```bash
    npx hardhat run scripts/deploy.js --network mumbai
    ```

4.  **Note the Deployed Contract Address:**
    -   Upon successful deployment, the script will output the address of the deployed `Voting` contract to the console.
    -   This address is **crucial**. You will need to use it as the `CONTRACT_ADDRESS` environment variable in your backend configuration (`backend/.env`).

## Contract Verification (Optional)
If you have set `POLYGONSCAN_API_KEY` in your `.env` file and configured it in `hardhat.config.js` (which it might be by default with `hardhat-toolbox`), you can attempt to verify your contract on PolygonScan:
```bash
npx hardhat verify --network mumbai DEPLOYED_CONTRACT_ADDRESS
```
Replace `DEPLOYED_CONTRACT_ADDRESS` with the actual address obtained in step 4. Verification makes your contract's source code public and easier for users to trust and interact with via block explorers.
