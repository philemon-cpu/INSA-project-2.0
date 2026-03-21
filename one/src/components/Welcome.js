import React from "react";
import styles from "./styles/styles";

function Welcome({ user, logout }) {
  const displayName = user.fullName || user.email.split('@')[0] || 'User';

  return (
    <div style={styles.center}>
      <style>{`
        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
      <div style={styles.welcome}>
        <h1 style={styles.welcomeTitle}>Welcome, {displayName} <span style={styles.wave}>👋</span>!</h1>
        <p style={styles.welcomeText}>You are successfully logged in.</p>
        {user.email && <p style={styles.welcomeText}>Email: {user.email}</p>}
        {user.location && <p style={styles.welcomeText}>Location: {user.location}</p>}
        {user.phone && <p style={styles.welcomeText}>Phone: {user.phone}</p>}
        <button style={{...styles.button, marginTop: '20px', fontSize: '1.2em', padding: '15px 30px'}} onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

export default Welcome;