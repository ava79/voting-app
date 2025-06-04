const express = require('express');
const admin = require('firebase-admin');
const { ethers } = require("ethers");
const helmet = require('helmet'); // Require helmet

// ---- ADMIN CONFIGURATION ----
const ADMIN_FIREBASE_UID = process.env.ADMIN_FIREBASE_UID || "YOUR_ADMIN_FIREBASE_UID_HERE";

// ---- FIREBASE ADMIN INITIALIZATION ----
try {
  admin.initializeApp();
  console.log("Firebase Admin SDK initialized with Application Default Credentials (if available).");
  if (ADMIN_FIREBASE_UID === "YOUR_ADMIN_FIREBASE_UID_HERE") {
    console.warn("ADMIN_FIREBASE_UID is not set or is using the placeholder value. Admin functionalities will be restricted.");
  }
} catch (error) {
  console.error("Firebase Admin SDK initialization failed during initial attempt:", error.message);
  console.log("This may be expected if GOOGLE_APPLICATION_CREDENTIALS is not set.");
  console.log("Please ensure you have set up Firebase Admin credentials.");
}
// ---- END FIREBASE ADMIN INITIALIZATION ----

// ---- SMART CONTRACT CONFIGURATION ----
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE";
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com";
const BACKEND_WALLET_PRIVATE_KEY = process.env.BACKEND_WALLET_PRIVATE_KEY || "YOUR_BACKEND_WALLET_PRIVATE_KEY_HERE";

const contractABI = [
    { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
    { "inputs": [{"internalType": "address", "name": "owner", "type": "address"}], "name": "OwnableInvalidOwner", "type": "error" },
    { "inputs": [{"internalType": "address", "name": "account", "type": "address"}], "name": "OwnableUnauthorizedAccount", "type": "error" },
    { "anonymous": false, "inputs": [{"indexed": true, "internalType": "uint256", "name": "candidateId", "type": "uint256"}, {"indexed": false, "internalType": "string", "name": "name", "type": "string"}], "name": "CandidateAdded", "type": "event" },
    { "anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"}, {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}], "name": "OwnershipTransferred", "type": "event" },
    { "anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "voterAddress", "type": "address"}, {"indexed": true, "internalType": "uint256", "name": "candidateId", "type": "uint256"}], "name": "Voted", "type": "event" },
    { "inputs": [{"internalType": "string", "name": "_name", "type": "string"}], "name": "addCandidate", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "name": "allCandidatesList", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "name": "candidates", "outputs": [{"internalType": "uint256", "name": "id", "type": "uint256"}, {"internalType": "string", "name": "name", "type": "string"}, {"internalType": "uint256", "name": "voteCount", "type": "uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "candidatesCount", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getAllCandidates", "outputs": [{"components": [{"internalType": "uint256", "name": "id", "type": "uint256"}, {"internalType": "string", "name": "name", "type": "string"}, {"internalType": "uint256", "name": "voteCount", "type": "uint256"}], "internalType": "struct Voting.Candidate[]", "name": "", "type": "tuple[]"}], "stateMutability": "view", "type": "function" },
    { "inputs": [{"internalType": "uint256", "name": "_candidateId", "type": "uint256"}], "name": "getCandidate", "outputs": [{"internalType": "uint256", "name": "id", "type": "uint256"}, {"internalType": "string", "name": "name", "type": "string"}, {"internalType": "uint256", "name": "voteCount", "type": "uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [{"internalType": "address", "name": "_voterAddress", "type": "address"}], "name": "getVoterInfo", "outputs": [{"internalType": "bool", "name": "hasVoted", "type": "bool"}, {"internalType": "uint256", "name": "votedForCandidateId", "type": "uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "owner", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{"internalType": "uint256", "name": "_candidateId", "type": "uint256"}], "name": "vote", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{"internalType": "address", "name": "", "type": "address"}], "name": "voters", "outputs": [{"internalType": "bool", "name": "hasVoted", "type": "bool"}, {"internalType": "uint256", "name": "votedForCandidateId", "type": "uint256"}], "stateMutability": "view", "type": "function" }
];

let contract;
let signer;

try {
    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE") {
        console.warn("CONTRACT_ADDRESS is a placeholder...");
    }
    if (!BACKEND_WALLET_PRIVATE_KEY || BACKEND_WALLET_PRIVATE_KEY === "YOUR_BACKEND_WALLET_PRIVATE_KEY_HERE") {
        console.warn("BACKEND_WALLET_PRIVATE_KEY is a placeholder...");
    }

    const provider = new ethers.JsonRpcProvider(MUMBAI_RPC_URL);

    if (BACKEND_WALLET_PRIVATE_KEY && BACKEND_WALLET_PRIVATE_KEY !== "YOUR_BACKEND_WALLET_PRIVATE_KEY_HERE") {
        const wallet = new ethers.Wallet(BACKEND_WALLET_PRIVATE_KEY, provider);
        signer = wallet;
        contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
        console.log("Smart contract interface initialized with signer.");
    } else {
        contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
        console.log("Smart contract interface initialized for read-only operations.");
    }
} catch (error) {
    console.error("Failed to initialize Ethers for smart contract interaction:", error);
    contract = null;
}
// ---- END SMART CONTRACT CONFIGURATION ----

const app = express();
const port = process.env.PORT || 3001;

app.use(helmet()); // Use helmet - sets various security HTTP headers
app.use(express.json()); // Middleware to parse JSON bodies

app.get('/', (req, res) => {
  res.send('Hello World from the Voting App Backend!');
});

app.get('/api/test-firebase', async (req, res) => {
  if (admin.apps.length === 0) { return res.status(500).json({ error: "Firebase Admin SDK not initialized." }); }
  try {
    const listUsersResult = await admin.auth().listUsers(5);
    res.json({ message: "Firebase Admin SDK test successful.", usersListed: listUsersResult.users.length });
  } catch (error) {
    res.status(500).json({ error: "Firebase Admin SDK error. Details: " + error.message });
  }
});

// ---- AUTHENTICATION ENDPOINTS ----
app.post('/auth/register', async (req, res) => {
  if (admin.apps.length === 0) { return res.status(500).json({ error: "Firebase Admin SDK not initialized." }); }
  const { email, password } = req.body;
  if (!email || !password) { return res.status(400).json({ error: 'Email and password are required.' }); }
  // Consider adding email format validation here if desired
  try {
    const userRecord = await admin.auth().createUser({ email: email, password: password });
    res.status(201).json({ message: 'User registered successfully!', uid: userRecord.uid });
  } catch (error) {
    console.error('Error registering user:', error);
    if (error.code === 'auth/email-already-exists') { return res.status(400).json({ error: 'Email already exists.' }); }
    if (error.code === 'auth/invalid-email') { return res.status(400).json({ error: 'Invalid email format.' }); }
    if (error.code === 'auth/invalid-password' || error.code === 'auth/weak-password') { return res.status(400).json({ error: 'Password is too weak or invalid (must be at least 6 characters).' }); }
    res.status(500).json({ error: 'Failed to register user. ' + error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  if (admin.apps.length === 0) { return res.status(500).json({ error: "Firebase Admin SDK not initialized." }); }
  const { email, password } = req.body;
  if (!email || !password) { return res.status(400).json({ error: 'Email and password are required.' }); }
  // Consider adding email format validation here if desired
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    res.status(200).json({  message: 'User exists. Client should now proceed with Firebase client-side sign-in.', uid: userRecord.uid  });
  } catch (error) {
    console.error('Error during login check:', error);
    if (error.code === 'auth/user-not-found') { return res.status(404).json({ error: 'User not found.' }); }
    if (error.code === 'auth/invalid-email') { return res.status(400).json({ error: 'Invalid email format provided for login check.' }); }
    res.status(500).json({ error: 'Login check failed. ' + error.message });
  }
});
// ---- END AUTHENTICATION ENDPOINTS ----

// ---- TOKEN VERIFICATION MIDDLEWARE ----
async function verifyFirebaseToken(req, res, next) {
  if (admin.apps.length === 0) { return res.status(500).json({ error: 'Authentication system not ready.' }); }
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

// ---- ADMIN AUTHORIZATION MIDDLEWARE ----
async function verifyAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: No user token provided (should be handled by verifyFirebaseToken first).' });
  }
  if (ADMIN_FIREBASE_UID === "YOUR_ADMIN_FIREBASE_UID_HERE" || !ADMIN_FIREBASE_UID) {
    console.warn("Admin functionality is disabled: ADMIN_FIREBASE_UID is not set by the administrator.");
    return res.status(503).json({ error: "Admin functionality temporarily disabled. Administrator needs to configure ADMIN_FIREBASE_UID." });
  }
  if (req.user.uid === ADMIN_FIREBASE_UID) {
    next();
  } else {
    console.warn(`User ${req.user.uid} attempted admin action without privileges.`);
    return res.status(403).json({ error: 'Forbidden: You do not have admin privileges.' });
  }
}
// ---- END ADMIN AUTHORIZATION MIDDLEWARE ----

// ---- VOTING API ENDPOINTS ----
app.get('/api/candidates', async (req, res) => {
  if (!contract) { return res.status(500).json({ error: 'Smart contract interface not initialized.' }); }
  try {
    const candidates = await contract.getAllCandidates();
    const formattedCandidates = candidates.map(candidate => ({ id: Number(candidate.id), name: candidate.name, voteCount: Number(candidate.voteCount) }));
    res.json(formattedCandidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates from blockchain. Details: ' + error.message });
  }
});

app.post('/api/vote', verifyFirebaseToken, async (req, res) => {
  if (!contract) { return res.status(500).json({ error: 'Smart contract interface not initialized.' }); }
  if (!signer) { return res.status(500).json({ error: 'Backend signer not available. Contract interaction for voting is disabled.' }); }
  if (CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE") { return res.status(500).json({ error: "Voting is disabled: Smart contract address not configured by admin." }); }

  const { candidateId } = req.body;
  // Enhanced validation for candidateId
  if (candidateId === undefined || typeof candidateId !== 'number' || !Number.isInteger(candidateId) || candidateId <= 0) {
    return res.status(400).json({ error: 'Candidate ID is required and must be a positive integer.' });
  }

  try {
    console.log(`User ${req.user.uid} is attempting to vote for candidate ${candidateId} via backend wallet ${signer.address}.`);
    const tx = await contract.vote(candidateId);
    await tx.wait();
    res.status(200).json({ message: 'Vote cast successfully!', transactionHash: tx.hash });
  } catch (error) {
    console.error(`Error casting vote for user ${req.user.uid}, candidate ${candidateId}:`, error);
    let specificError = "Failed to cast vote on blockchain.";
    if (error.reason) { specificError = error.reason; }
    else if (error.data && error.data.message) { specificError = error.data.message; }
    else if (error.message) {
      if (error.message.includes("You have already voted")) { specificError = "This account (backend wallet) has already voted."; }
      else if (error.message.includes("Invalid candidate ID")) { specificError = "Invalid candidate ID."; }
    }
    if (specificError.includes("You have already voted")) { return res.status(400).json({ error: "Vote failed: This account (backend wallet) has already voted for this election." }); }
    if (specificError.includes("Invalid candidate ID")) { return res.status(400).json({ error: "Vote failed: Invalid candidate ID." }); }
    res.status(500).json({ error: 'Failed to cast vote on blockchain. Details: ' + specificError });
  }
});

app.get('/api/results', async (req, res) => {
  if (!contract) { return res.status(500).json({ error: 'Smart contract interface not initialized.' }); }
  try {
    const candidates = await contract.getAllCandidates();
    const formattedCandidates = candidates.map(candidate => ({ id: Number(candidate.id), name: candidate.name, voteCount: Number(candidate.voteCount) }));
    res.json(formattedCandidates);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results from blockchain. Details: ' + error.message });
  }
});
// ---- END VOTING API ENDPOINTS ----

// ---- ADMIN API ENDPOINTS ----
app.post('/api/admin/add-candidate', verifyFirebaseToken, verifyAdmin, async (req, res) => {
  if (!contract) { return res.status(500).json({ error: 'Smart contract interface not initialized.' }); }
  if (!signer) { return res.status(500).json({ error: 'Backend signer not available. Admin actions requiring transactions are disabled.' }); }
  if (CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE") { return res.status(500).json({ error: "Action disabled: Smart contract address not configured by admin." }); }

  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Candidate name is required and must be a non-empty string.' });
  }
  const trimmedName = name.trim();
  const MAX_CANDIDATE_NAME_LENGTH = 100;
  if (trimmedName.length > MAX_CANDIDATE_NAME_LENGTH) {
    return res.status(400).json({ error: `Candidate name must not exceed ${MAX_CANDIDATE_NAME_LENGTH} characters.` });
  }

  try {
    console.log(`Admin user ${req.user.uid} is attempting to add candidate "${trimmedName}" via backend wallet ${signer.address}.`);

    const tx = await contract.addCandidate(trimmedName);
    const receipt = await tx.wait();

    let newCandidateId = "unknown";
    if (receipt.logs) {
        const eventInterface = new ethers.Interface(contractABI);
        for (const log of receipt.logs) {
            try {
                const parsedLog = eventInterface.parseLog(log);
                if (parsedLog && parsedLog.name === "CandidateAdded") {
                    newCandidateId = parsedLog.args.candidateId.toString();
                    break;
                }
            } catch (e) { /* ignore */ }
        }
    }

    res.status(201).json({
        message: `Candidate "${trimmedName}" added successfully!`,
        transactionHash: tx.hash,
        candidateId: newCandidateId
    });
  } catch (error) {
    console.error(`Admin user ${req.user.uid} failed to add candidate "${trimmedName}":`, error);
    let specificError = "Failed to add candidate on blockchain.";
    if (error.reason) { specificError = error.reason; }
    else if (error.data && error.data.message) { specificError = error.data.message; }
    res.status(500).json({ error: `${specificError} Details: ${error.message}` });
  }
});
// ---- END ADMIN API ENDPOINTS ----

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
