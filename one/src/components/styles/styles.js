const styles = {
  // Page background (dark)
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#ffffff",
  },

  // Center without background
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },

  // White card
  card: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "420px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
    textAlign: "center",
  },

  // Title
  title: {
    marginBottom: "20px",
    color: "#333",
  },

  // Input fields
  input: {
    width: "100%",
    padding: "12px",
    margin: "8px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },

  // Button
  button: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#00bcd4",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  // Link text
  link: {
    marginTop: "15px",
    color: "#00bcd4",
    cursor: "pointer",
    fontSize: "14px",
  },

  // Form
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  // Error message
  error: {
    color: "red",
    fontSize: "13px",
    textAlign: "left",
  },

  // Success message
  success: {
    color: "green",
    fontSize: "13px",
  },
};

export default styles;