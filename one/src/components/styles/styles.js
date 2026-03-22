const styles = {
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: "40px 15px",
    background: "#0f0f0f",
  },

  card: {
    background: "#1a1a1a",
    padding: "30px",
    borderRadius: "15px",
    width: "90%",
    maxWidth: "420px", // ✅ wider + responsive
    textAlign: "center",
    boxShadow: "0 0 25px rgba(0,0,0,0.6)",
    border: "1px solid #2a2a2a",
  },

  welcome: {
    background: "#1a1a1a",
    padding: "50px",
    borderRadius: "15px",
    width: "90%",
    maxWidth: "480px", // ✅ wider
    textAlign: "center",
    boxShadow: "0 0 25px rgba(0,0,0,0.6)",
    border: "1px solid #2a2a2a",
  },

  welcomeTitle: {
    fontSize: "2.5em",
    color: "#00bcd4",
    marginBottom: "20px",
  },

  welcomeText: {
    fontSize: "1.2em",
    color: "#ccc",
    marginBottom: "10px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
  },

  input: {
    padding: "12px",
    margin: "8px 0",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "#0f0f0f",
    color: "#fff",
    outline: "none",
    fontSize: "14px",
  },

  button: {
    padding: "12px",
    marginTop: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#00bcd4",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "15px",
  },

  logoutButton: {
    marginTop: "20px",
    fontSize: "1.05em",
    padding: "12px 18px",
    borderRadius: "8px",
    border: "none",
    background: "#ff4d4d",
    color: "#fff",
    cursor: "pointer",
  },

  link: {
    marginTop: "15px",
    color: "#00bcd4",
    cursor: "pointer",
    fontSize: "14px",
  },

  error: {
    color: "#ff6b6b",
    fontSize: "0.85rem",
    margin: "4px 0",
    textAlign: "left",
  },

  success: {
    color: "#4caf50",
    fontSize: "0.9rem",
    margin: "4px 0",
  },

  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  popupBox: {
    background: "#1a1a1a",
    padding: "25px",
    borderRadius: "12px",
    border: "1px solid #333",
    width: "90%",
    maxWidth: "350px",
    textAlign: "center",
  },

  wave: {
    display: "inline-block",
    animation: "wave 1s infinite",
  },
};

export default styles;