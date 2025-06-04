// src/components/AuthDetails.js
import React from 'react';
import { useAuth } from '../AuthContext'; // Adjust path if AuthContext is elsewhere

function AuthDetails() {
  const { currentUser, logout, loading } = useAuth(); // Added loading from useAuth

  const handleLogout = async () => {
    try {
      await logout();
      // Logout successful, onAuthStateChanged in AuthContext will update UI
      console.log("User logged out successfully.");
    } catch (error) {
      console.error("Failed to log out:", error);
      // Optionally set an error state here to display to the user
    }
  };

  if (loading) {
    return <p>Loading user status...</p>; // Or a spinner component
  }

  if (!currentUser) {
    // This component might not even be rendered if currentUser is null,
    // depending on App.js logic, but this is a safe fallback.
    return <p>You are not logged in.</p>;
  }

  return (
    <div>
      <p>Logged in as: {currentUser.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
export default AuthDetails;
