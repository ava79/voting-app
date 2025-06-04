// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore"; // Uncomment if you use Firestore

// Firebase configuration will be loaded from environment variables
// User must create a .env file in the frontend root with their Firebase project settings
// (e.g., REACT_APP_FIREBASE_API_KEY="your-key-here")
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  // measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID // Optional
};

// Initialize Firebase
let app;
let auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("Firebase SDK initialized successfully.");
  // Check if any config values are still placeholders (basic check)
  if (firebaseConfig.apiKey === "YOUR_API_KEY" || !firebaseConfig.apiKey) {
    console.warn("Firebase configuration appears to be using placeholder values. Please update your .env file with actual Firebase project credentials.");
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
  console.error("Please ensure your Firebase project configuration in .env is correct and all required environment variables are set.");
  // Provide dummy exports or handle the error as appropriate for your app
  // For now, auth will be undefined if initialization fails.
}


// Initialize Cloud Firestore and get a reference to the service (Uncomment if needed)
// const db = getFirestore(app);

// Export the auth instance, and db instance if you're using Firestore
// export { auth, db };
export { auth }; // Export auth for now

// You can also export 'app' if you need it directly elsewhere
// export default app;
