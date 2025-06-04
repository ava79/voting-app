const express = require('express');
const admin = require('firebase-admin');
const { ethers } = require("ethers"); // Added ethers

// ---- FIREBASE ADMIN INITIALIZATION ----
// User needs to:
// 1. Go to Firebase console, create a project.
// 2. Go to Project settings > Service accounts.
// 3. Generate a new private key and download the JSON file.
// 4. Set the GOOGLE_APPLICATION_CREDENTIALS environment variable
//    to the path of this JSON file.
//    Alternatively, initialize with a serviceAccount object:
/*
const serviceAccount = require('./path/to/your-service-account-key.json'); // User will need to provide this path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: "https://<YOUR_PROJECT_ID>.firebaseio.com" // Optional: if using Realtime Database
});
*/

// Placeholder initialization - The application will not fully work until configured with actual credentials
try {
  admin.initializeApp();
  console.log("Firebase Admin SDK initialized with Application Default Credentials (if available).");
} catch (error) {
  console.error("Firebase Admin SDK initialization failed during initial attempt:", error.message);
  console.log("This may be expected if GOOGLE_APPLICATION_CREDENTIALS is not set.");
  console.log("Please ensure you have set up Firebase Admin credentials (e.g., GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to your service account key).");
}
// ---- END FIREBASE ADMIN INITIALIZATION ----

// ---- SMART CONTRACT CONFIGURATION ----
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE";
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com";
const BACKEND_WALLET_PRIVATE_KEY = process.env.BACKEND_WALLET_PRIVATE_KEY || "YOUR_BACKEND_WALLET_PRIVATE_KEY_HERE";

const contractABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "candidateId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        }
      ],
      "name": "CandidateAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "voterAddress",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "candidateId",
          "type": "uint256"
        }
      ],
      "name": "Voted",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        }
      ],
      "name": "addCandidate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "allCandidatesList",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "candidates",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "voteCount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "candidatesCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllCandidates",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "voteCount",
              "type": "uint256"
            }
          ],
          "internalType": "struct Voting.Candidate[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_candidateId",
          "type": "uint256"
        }
      ],
      "name": "getCandidate",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "voteCount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_voterAddress",
          "type": "address"
        }
      ],
      "name": "getVoterInfo",
      "outputs": [
        {
          "internalType": "bool",
          "name": "hasVoted",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "votedForCandidateId",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_candidateId",
          "type": "uint256"
        }
      ],
      "name": "vote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "voters",
      "outputs": [
        {
          "internalType": "bool",
          "name": "hasVoted",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "votedForCandidateId",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]; // ABI pasted here

let contract;
let signer;

try {
    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE") {
        console.warn("CONTRACT_ADDRESS is a placeholder. Backend interactions with the smart contract may fail or use a default/incorrect address until it's updated with a deployed contract address.");
    }
    if (!BACKEND_WALLET_PRIVATE_KEY || BACKEND_WALLET_PRIVATE_KEY === "YOUR_BACKEND_WALLET_PRIVATE_KEY_HERE") {
        console.warn("BACKEND_WALLET_PRIVATE_KEY is a placeholder. Backend cannot sign transactions for contract interaction.");
    }

    const provider = new ethers.JsonRpcProvider(MUMBAI_RPC_URL);

    if (BACKEND_WALLET_PRIVATE_KEY && BACKEND_WALLET_PRIVATE_KEY !== "YOUR_BACKEND_WALLET_PRIVATE_KEY_HERE") {
        const wallet = new ethers.Wallet(BACKEND_WALLET_PRIVATE_KEY, provider);
        signer = wallet;
        contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
        console.log("Smart contract interface initialized with signer for backend interaction.");
    } else {
        contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
        console.log("Smart contract interface initialized for read-only operations (no backend signer configured).");
    }
} catch (error) {
    console.error("Failed to initialize Ethers for smart contract interaction:", error);
    contract = null;
}
// ---- END SMART CONTRACT CONFIGURATION ----

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json()); // Middleware to parse JSON bodies

app.get('/', (req, res) => {
  res.send('Hello World from the Voting App Backend!');
});

// Example: Test route for Firebase Admin SDK (from previous step)
app.get('/api/test-firebase', async (req, res) => {
  if (admin.apps.length === 0) {
    console.error("Firebase Admin SDK is not initialized. Cannot access Firebase services.");
    return res.status(500).json({ error: "Firebase Admin SDK not initialized. Please check server logs for details on credential setup." });
  }
  try {
    const listUsersResult = await admin.auth().listUsers(5);
    res.json({
      message: "Firebase Admin SDK test endpoint reached. Attempted to list users.",
      usersListed: listUsersResult.users.length,
      note: "If usersListed is 0, it might mean no users are in Firebase Auth or there was an issue during the call that didn't throw an error."
    });
  } catch (error) {
    console.error("Error accessing Firebase service (/api/test-firebase):", error.code, error.message);
    let errorMessage = "Firebase Admin SDK not properly configured or error accessing service.";
    if (error.code === 'auth/insufficient-permission') {
        errorMessage = "Firebase Admin SDK has insufficient permissions. Ensure your service account has the necessary roles (e.g., 'Firebase Authentication Admin').";
    } else if (error.message.includes('credential')) {
        errorMessage = "Credential error with Firebase Admin SDK. Ensure GOOGLE_APPLICATION_CREDENTIALS is set correctly or the service account key is valid.";
    }
    res.status(500).json({ error: errorMessage, details: error.message });
  }
});

// ---- AUTHENTICATION ENDPOINTS ----
// Registration Endpoint
app.post('/auth/register', async (req, res) => {
  if (admin.apps.length === 0) { return res.status(500).json({ error: "Firebase Admin SDK not initialized." }); }
  const { email, password } = req.body;
  if (!email || !password) { return res.status(400).json({ error: 'Email and password are required.' }); }
  try {
    const userRecord = await admin.auth().createUser({ email: email, password: password });
    res.status(201).json({ message: 'User registered successfully!', uid: userRecord.uid });
  } catch (error) {
    console.error('Error registering user:', error);
    if (error.code === 'auth/email-already-exists') { return res.status(400).json({ error: 'Email already exists.' }); }
    if (error.code === 'auth/invalid-password' || error.code === 'auth/weak-password') { return res.status(400).json({ error: 'Password is too weak or invalid (must be at least 6 characters).' }); }
    res.status(500).json({ error: 'Failed to register user. ' + error.message });
  }
});

// Login Endpoint (Conceptual)
app.post('/auth/login', async (req, res) => {
  if (admin.apps.length === 0) { return res.status(500).json({ error: "Firebase Admin SDK not initialized." }); }
  const { email, password } = req.body;
  if (!email || !password) { return res.status(400).json({ error: 'Email and password are required.' }); }
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    res.status(200).json({ message: 'User exists. Client should now proceed with Firebase client-side sign-in.', uid: userRecord.uid });
  } catch (error) {
    console.error('Error during login check:', error);
    if (error.code === 'auth/user-not-found') { return res.status(404).json({ error: 'User not found.' }); }
    res.status(500).json({ error: 'Login check failed. ' + error.message });
  }
});
// ---- END AUTHENTICATION ENDPOINTS ----

// ---- TOKEN VERIFICATION MIDDLEWARE ----
async function verifyFirebaseToken(req, res, next) {
  if (admin.apps.length === 0) {
    console.error("Attempted to verify token, but Firebase Admin SDK is not initialized.");
    return res.status(500).json({ error: 'Authentication system not ready.' });
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) { return res.status(401).json({ error: 'Unauthorized: No token provided or invalid format.' }); }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    if (error.code === 'auth/id-token-expired') { return res.status(401).json({ error: 'Unauthorized: Token expired.' }); }
    return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
  }
}
// ---- END TOKEN VERIFICATION MIDDLEWARE ----

// Example of a protected route using the middleware:
app.get('/api/protected-route', verifyFirebaseToken, (req, res) => {
  res.json({ message: `Hello user ${req.user.uid}, you have accessed a protected route!` });
});

// ---- VOTING API ENDPOINTS ----
// GET All Candidates (Public)
app.get('/api/candidates', async (req, res) => {
  if (!contract) { return res.status(500).json({ error: 'Smart contract interface not initialized.' }); }
  try {
    const candidates = await contract.getAllCandidates();
    const formattedCandidates = candidates.map(candidate => ({
      id: Number(candidate.id),
      name: candidate.name,
      voteCount: Number(candidate.voteCount)
    }));
    res.json(formattedCandidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates from blockchain. Details: ' + error.message });
  }
});

// POST Vote (Protected Route - User must be authenticated)
app.post('/api/vote', verifyFirebaseToken, async (req, res) => {
  if (!contract) { return res.status(500).json({ error: 'Smart contract interface not initialized.' }); }
  if (!signer) { return res.status(500).json({ error: 'Backend signer not available. Contract interaction for voting is disabled.' }); }
  if (CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE") { return res.status(500).json({ error: "Voting is disabled: Smart contract address not configured by admin." }); }

  const { candidateId } = req.body;
  if (candidateId === undefined || candidateId === null) { return res.status(400).json({ error: 'Candidate ID is required.' }); }

  try {
    console.log(`User ${req.user.uid} is attempting to vote for candidate ${candidateId} via backend wallet ${signer.address}.`);
    const tx = await contract.vote(candidateId);
    await tx.wait();
    res.status(200).json({ message: 'Vote cast successfully!', transactionHash: tx.hash });
  } catch (error) {
    console.error(`Error casting vote for user ${req.user.uid}, candidate ${candidateId}:`, error);
    let specificError = "Failed to cast vote on blockchain.";
    if (error.reason) { // Ethers v6 often includes reason
        specificError = error.reason;
    } else if (error.data && error.data.message) { // Check for Hardhat/Ganache style error messages
        specificError = error.data.message;
    } else if (error.message) {
        if (error.message.includes("You have already voted")) { specificError = "This account (backend wallet) has already voted."; }
        else if (error.message.includes("Invalid candidate ID")) { specificError = "Invalid candidate ID."; }
    }
    // Check for common contract revert reasons if possible
    if (specificError.includes("You have already voted")) {
        return res.status(400).json({ error: "Vote failed: This account (backend wallet) has already voted for this election." });
    }
    if (specificError.includes("Invalid candidate ID")) {
        return res.status(400).json({ error: "Vote failed: Invalid candidate ID." });
    }
    res.status(500).json({ error: 'Failed to cast vote on blockchain. Details: ' + specificError });
  }
});

// GET Results (Public - similar to /api/candidates for now)
app.get('/api/results', async (req, res) => {
    if (!contract) { return res.status(500).json({ error: 'Smart contract interface not initialized.' }); }
    try {
        const candidates = await contract.getAllCandidates();
        const formattedCandidates = candidates.map(candidate => ({
            id: Number(candidate.id),
            name: candidate.name,
            voteCount: Number(candidate.voteCount)
        }));
        res.json(formattedCandidates);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: 'Failed to fetch results from blockchain. Details: ' + error.message });
    }
});
// ---- END VOTING API ENDPOINTS ----

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
