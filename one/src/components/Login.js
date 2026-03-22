import React, { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { ref, get, set } from "firebase/database";
import styles from "./styles/styles";

const initialLoginState = {
  identifier: "",
  password: "",
};

function Login({ setUser, goSignup }) {
  const [form, setForm] = useState(initialLoginState);
  const [errors, setErrors] = useState({});
  const [disabled, setDisabled] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const validate = () => {
    const newErrors = {};

    if (!form.identifier.trim()) newErrors.identifier = "Email, Username, or Phone is required.";
    if (!form.password) newErrors.password = "Password is required.";

    return newErrors;
  };

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (disabled) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setDisabled(true);
    setTimeout(() => setDisabled(false), 10000); // 10 second cooldown

    try {
      let email = form.identifier;

      if (form.identifier.includes("@")) {
        // identifier is email
      } else if (/^\+?\d+$/.test(form.identifier.replace(/\s/g, ""))) {
        // identifier is phone
        const phoneRef = ref(db, "phones/" + form.identifier.replace(/\s/g, ""));
        const phoneSnapshot = await get(phoneRef);
        if (!phoneSnapshot.exists()) {
          throw new Error("Phone not found");
        }
        const uid = phoneSnapshot.val();
        const userSnapshot = await get(ref(db, "users/" + uid));
        if (!userSnapshot.exists()) {
          throw new Error("User data not found");
        }
        email = userSnapshot.val().email;
      } else {
        // identifier is username
        const usernameRef = ref(db, "usernames/" + form.identifier);
        const usernameSnapshot = await get(usernameRef);
        if (!usernameSnapshot.exists()) {
          throw new Error("Username not found");
        }
        const uid = usernameSnapshot.val();
        const userSnapshot = await get(ref(db, "users/" + uid));
        if (!userSnapshot.exists()) {
          throw new Error("User data not found");
        }
        email = userSnapshot.val().email;
      }

      await signInWithEmailAndPassword(auth, email, form.password);

      if (!auth.currentUser.emailVerified) {
        setErrors({ general: "Please verify your email before logging in." });
        return;
      }

      const loggedInUser = await get(ref(db, "users/" + auth.currentUser.uid));
      if (loggedInUser.exists()) {
        setUser(loggedInUser.val());
      } else {
        setUser({
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          fullName: auth.currentUser.displayName || auth.currentUser.email.split("@")[0],
        });
      }

      setFailedAttempts(0); // reset on success
    } catch (error) {
      setFailedAttempts((prev) => prev + 1);
      if (failedAttempts + 1 >= 5) {
        setDisabled(true);
        setTimeout(() => {
          setDisabled(false);
          setFailedAttempts(0);
        }, 300000); // 5 minutes lock
        setErrors({ general: "Too many failed attempts. Try again in 5 minutes." });
      } else {
        setErrors({ general: error.code === "auth/wrong-password" ? "Invalid password." : error.code === "auth/user-not-found" ? "User not found." : error.message });
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);

      // Sync user into Realtime DB if not exist
      const userRef = ref(db, 'users/' + user.uid);
      const userSnapshot = await get(userRef);
      if (!userSnapshot.exists()) {
        await set(userRef, {
          uid: user.uid,
          fullName: user.displayName || '',
          username: user.email ? user.email.split('@')[0] : '',
          phone: user.phoneNumber || '',
          email: user.email,
          location: '',
          birthdate: '',
        });

        if (user.displayName) {
          await set(ref(db, 'usernames/' + (user.displayName.replace(/\s+/g, '').toLowerCase())), user.uid);
        }
        if (user.phoneNumber) {
          await set(ref(db, 'phones/' + user.phoneNumber.replace(/\s/g, '')), user.uid);
        }
      }

      const authenticatedUser = await get(ref(db, 'users/' + user.uid));
      if (authenticatedUser.exists()) {
        setUser(authenticatedUser.val());
      } else {
        setUser({ uid: user.uid, email: user.email, fullName: user.displayName || user.email.split('@')[0] });
      }

      setFailedAttempts(0);
    } catch (error) {
      setErrors({ general: error.message });
    }
  };

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <h2>Login</h2>
        {errors.general && <p style={styles.error}>{errors.general}</p>}

        <form style={styles.form} onSubmit={handleLogin}>
          <input
            style={styles.input}
            type="text"
            placeholder="Email, Username, or Phone"
            value={form.identifier}
            onChange={handleChange("identifier")}
          />
          {errors.identifier && <p style={styles.error}>{errors.identifier}</p>}

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange("password")}
          />
          {errors.password && <p style={styles.error}>{errors.password}</p>}

          <button style={styles.button} type="submit" disabled={disabled}>
            {disabled ? "Please wait..." : "Login"}
          </button>
        </form>

        <button 
          style={{ 
            ...styles.button, 
            marginTop: '10px', 
            backgroundColor: '#4285F4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }} 
          onClick={handleGoogleLogin}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p style={styles.link} onClick={goSignup}>
          Create account
        </p>
      </div>
    </div>
  );
}

export default Login;