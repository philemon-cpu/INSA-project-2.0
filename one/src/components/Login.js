import React, { useState } from "react";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
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
  const [loadingGoogle, setLoadingGoogle] = useState(false); 

  // Validate
  const validate = () => {
    const newErrors = {};

    if (!form.identifier.trim()) {
      newErrors.identifier = "Email, Username, or Phone is required";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  // Handle input
  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (disabled) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setDisabled(true);
    setTimeout(() => setDisabled(false), 10000);

    try {
      let email = form.identifier;

      if (!form.identifier.includes("@")) {
        if (/^\+?\d+$/.test(form.identifier.replace(/\s/g, ""))) {
          const phoneRef = ref(
            db,
            "phones/" + form.identifier.replace(/\s/g, "")
          );
          const phoneSnap = await get(phoneRef);
          if (!phoneSnap.exists()) throw new Error("Phone not found");

          const uid = phoneSnap.val();
          const userSnap = await get(ref(db, "users/" + uid));
          email = userSnap.val().email;
        } else {
          const userRef = ref(db, "usernames/" + form.identifier);
          const userSnap = await get(userRef);
          if (!userSnap.exists()) throw new Error("Username not found");

          const uid = userSnap.val();
          const dataSnap = await get(ref(db, "users/" + uid));
          email = dataSnap.val().email;
        }
      }

      await signInWithEmailAndPassword(auth, email, form.password);

      if (!auth.currentUser.emailVerified) {
        setErrors({ general: "Please verify your email first" });
        return;
      }

      const userData = await get(ref(db, "users/" + auth.currentUser.uid));

      if (userData.exists()) {
        setUser(userData.val());
      } else {
        setUser({
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          fullName: auth.currentUser.email.split("@")[0],
        });
      }

      setFailedAttempts(0);
    } catch (err) {
      setFailedAttempts((prev) => prev + 1);

      if (failedAttempts + 1 >= 5) {
        setDisabled(true);
        setTimeout(() => {
          setDisabled(false);
          setFailedAttempts(0);
        }, 300000);

        setErrors({
          general: "Too many attempts. Try again in 5 minutes.",
        });
      } else {
        setErrors({
          general:
            err.code === "auth/wrong-password"
              ? "Wrong password"
              : err.code === "auth/user-not-found"
              ? "User not found"
              : err.message,
        });
      }
    }
  };

  // Google login (FIXED)
  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setErrors({});

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = ref(db, "users/" + user.uid);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        await set(userRef, {
          uid: user.uid,
          fullName: user.displayName || "",
          username: user.email ? user.email.split("@")[0] : "",
          phone: user.phoneNumber || "",
          email: user.email,
          location: "",
          birthdate: "",
        });
      }

      const finalUser = await get(userRef);
      setUser(finalUser.val());

      setFailedAttempts(0);
    } catch (err) {
      setErrors({ general: err.message });
    }

    setLoadingGoogle(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>

        {errors.general && <p style={styles.error}>{errors.general}</p>}

        <form style={styles.form} onSubmit={handleLogin}>
          <input
            style={styles.input}
            type="text"
            placeholder="Email, Username, or Phone"
            value={form.identifier}
            onChange={handleChange("identifier")}
          />
          {errors.identifier && (
            <p style={styles.error}>{errors.identifier}</p>
          )}

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange("password")}
          />
          {errors.password && (
            <p style={styles.error}>{errors.password}</p>
          )}

          <button style={styles.button} disabled={disabled}>
            {disabled ? "Please wait..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <p style={{ margin: "15px 0", color: "#999" }}>or</p>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loadingGoogle}
          style={{
            width: "100%",
            padding: "12px",
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            style={{ width: "18px", height: "18px" }}
          />
          {loadingGoogle ? "Signing in..." : "Continue with Google"}
        </button>

        <p style={styles.link} onClick={goSignup}>
          Create account
        </p>
      </div>
    </div>
  );
}

export default Login;