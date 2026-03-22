import React, { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import styles from "./styles/styles";

const initialLoginState = {
  email: "",
  password: "",
};

function Login({ setUser, goSignup }) {
  const [form, setForm] = useState(initialLoginState);
  const [errors, setErrors] = useState({});
  const [disabled, setDisabled] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const validate = () => {
    const newErrors = {};

    if (!form.email.trim()) newErrors.email = "Email is required.";
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
      await signInWithEmailAndPassword(auth, form.email, form.password);

      if (!auth.currentUser.emailVerified) {
        setErrors({ general: "Please verify your email before logging in." });
        return;
      }

      const userSnapshot = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userSnapshot.exists()) {
        setUser(userSnapshot.data());
      } else {
        setUser({
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          fullName: auth.currentUser.displayName || auth.currentUser.email.split("@")[0],
        });
      }
      setFailedAttempts(0); // reset on success
    } catch (error) {
      setFailedAttempts(prev => prev + 1);
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

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <h2>Login</h2>
        {errors.general && <p style={styles.error}>{errors.general}</p>}

        <form style={styles.form} onSubmit={handleLogin}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange("email")}
          />
          {errors.email && <p style={styles.error}>{errors.email}</p>}

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

        <p style={styles.link} onClick={goSignup}>
          Create account
        </p>
      </div>
    </div>
  );
}

export default Login;