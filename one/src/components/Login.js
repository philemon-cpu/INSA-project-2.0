import React, { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import styles from "./styles/styles";

function Login({ setUser, goSignup }) {
  const [login, setLogin] = useState({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    let newErrors = {};
    if (!login.identifier.trim()) newErrors.identifier = 'Email is required';
    if (!login.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await signInWithEmailAndPassword(
        auth,
        login.identifier,
        login.password
      );

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        setUser(userDoc.data());
      } else {
        // If no Firestore data, use basic info from Auth
        setUser({
          email: auth.currentUser.email,
          uid: auth.currentUser.uid,
          fullName: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
        });
      }
    } catch (error) {
      setErrors({general: "Login failed: " + error.message});
    }
  };

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <h2>Login</h2>
        <p style={{color:'red', fontSize:'12px'}}>{errors.general}</p>

        <form style={styles.form} onSubmit={handleLogin}>
          <input
            style={styles.input}
            placeholder="Email"
            value={login.identifier}
            onChange={(e) =>
              setLogin({ ...login, identifier: e.target.value })
            }
          />
          <p style={{color:'red', fontSize:'12px'}}>{errors.identifier}</p>

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={login.password}
            onChange={(e) =>
              setLogin({ ...login, password: e.target.value })
            }
          />
          <p style={{color:'red', fontSize:'12px'}}>{errors.password}</p>

          <button style={styles.button}>Login</button>
        </form>

        <p style={styles.link} onClick={goSignup}>
          Create account
        </p>
      </div>
    </div>
  );
}

export default Login;