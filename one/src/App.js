import React, { useState, useEffect } from "react";
import GoogleAuth from "./components/GoogleAuth";
import Dashboard from "./components/Dashboard";
import { api } from "./api";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkExistingAuth = async () => {
      try {
        if (api.isAuthenticated()) {
          const user = await api.getCurrentUser();
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        api.logout();
      } finally {
        setLoading(false);
      }
    };

    checkExistingAuth();
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading...</h2>
          <p>Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return currentUser ? (
    <Dashboard user={currentUser} onLogout={handleLogout} />
  ) : (
    <GoogleAuth onAuthSuccess={handleAuthSuccess} onLogout={handleLogout} />
  );
}

export default App;