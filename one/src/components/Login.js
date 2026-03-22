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

        <button style={{ ...styles.button, marginTop: '10px', backgroundColor: '#4285F4' }} onClick={handleGoogleLogin}>
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