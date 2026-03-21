const styles = {
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: "100px 0",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
  },

  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "15px",
    width: "340px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },

  welcome: {
    background: "#fff",
    padding: "50px",
    borderRadius: "15px",
    width: "400px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },

  welcomeTitle: {
    fontSize: "2.5em",
    color: "#667eea",
    marginBottom: "20px",
  },

  welcomeText: {
    fontSize: "1.2em",
    color: "#333",
    marginBottom: "10px",
  },

  wave: {
    display: "inline-block",
    animation: "wave 1.5s ease-in-out infinite",
  },

  form: {
    display: "flex",
    flexDirection: "column",
  },

  input: {
    padding: "12px",
    margin: "8px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },

  button: {
    padding: "12px",
    marginTop: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#667eea",
    color: "#fff",
    cursor: "pointer",
  },

  logoutButton: {
    marginTop: "20px",
    fontSize: "1.05em",
    padding: "12px 18px",
    borderRadius: "8px",
    border: "none",
    background: "#f35454",
    color: "#fff",
    cursor: "pointer",
  },

  link: {
    marginTop: "15px",
    color: "#667eea",
    cursor: "pointer",
  },

  error: {
    color: "#c53030",
    fontSize: "0.85rem",
    margin: "2px 0",
  },

  success: {
    color: "#2d7b2f",
    fontSize: "0.9rem",
    margin: "2px 0",
  },

  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  popupBox: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
  },

  wave: {
    display: "inline-block",
    animation: "wave 1s infinite",
  },
};

export default styles;