import React, { useState } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Welcome from "./components/Welcome";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("login");

  const openLogin = () => setPage("login");
  const openSignup = () => setPage("signup");

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (currentUser) {
    return <Welcome user={currentUser} logout={logout} />;
  }

  return page === "signup" ? (
    <Signup goLogin={openLogin} />
  ) : (
    <Login setUser={setCurrentUser} goSignup={openSignup} />
  );
}

export default App;