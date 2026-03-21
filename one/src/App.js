import React, { useState } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Welcome from "./components/Welcome";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

function App() {
  // 👤 Logged-in user
  const [user, setUser] = useState(null);

  // 📄 Current page
  const [page, setPage] = useState("login");

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // 🎉 IF USER LOGGED IN → SHOW WELCOME
  if (user) {
    return <Welcome user={user} logout={logout} />;
  }

  // 🔐 LOGIN PAGE
  if (page === "login") {
    return (
      <Login
        setUser={setUser}
        goSignup={() => setPage("signup")}
      />
    );
  }

  // 📝 SIGNUP PAGE
  if (page === "signup") {
    return (
      <Signup
        goLogin={() => setPage("login")}
      />
    );
  }

  // fallback (just in case)
  return <h1>Loading...</h1>;
}

export default App;