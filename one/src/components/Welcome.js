import React from "react";
import styles from "./styles/styles";

function Welcome({ user, logout }) {
  const displayName = user.fullName || user.email?.split("@")[0] || "User";

  return (
    <div style={styles.center}>
      <div style={styles.welcome}>
        <h1 style={styles.welcomeTitle}>
          Welcome, {displayName} <span style={styles.wave}>👋</span>
        </h1>

        <p style={styles.welcomeText}>You are successfully logged in.</p>
        {user.email && <p style={styles.welcomeText}>Email: {user.email}</p>}
        {user.location && <p style={styles.welcomeText}>Location: {user.location}</p>}
        {user.phone && <p style={styles.welcomeText}>Phone: {user.phone}</p>}

        <button style={styles.logoutButton} onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Welcome;