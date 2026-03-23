import React, { useState, useEffect } from "react";
import { auth, db, googleProvider } from "../firebase";
import {
  signInWithEmailAndPassword,
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
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.identifier.trim())
      newErrors.identifier = "Email, Username, or Phone is required";
    if (!form.password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

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
        setErrors({ general: "Too many attempts. Try again in 5 minutes." });
      } else {
        setErrors({
          general:
            err.code === "auth/wrong-password"
              ? "Wrong password. Please try again."
              : err.code === "auth/user-not-found"
              ? "No account found with that identifier."
              : err.code === "auth/internal-error"
              ? "Authentication service unavailable. Please try again later."
              : err.message,
        });
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (disabled) return;
    
    setDisabled(true);
    setTimeout(() => setDisabled(false), 10000);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in database
      const userData = await get(ref(db, "users/" + user.uid));
      
      if (userData.exists()) {
        setUser(userData.val());
      } else {
        // Create new user profile for Google sign-in
        const newUser = {
          uid: user.uid,
          email: user.email,
          fullName: user.displayName || user.email.split("@")[0],
          photoURL: user.photoURL || "",
          createdAt: new Date().toISOString(),
          provider: "google"
        };
        
        // Save to database
        await set(ref(db, "users/" + user.uid), newUser);
        setUser(newUser);
      }
      
      setFailedAttempts(0);
    } catch (err) {
      setErrors({
        general: 
          err.code === "auth/popup-closed-by-user"
            ? "Google sign-in was cancelled"
            : err.code === "auth/popup-blocked"
            ? "Pop-up was blocked by your browser. Please allow pop-ups and try again."
            : err.message || "Failed to sign in with Google"
      });
    }
  };

  return (
    <div style={styles.authPage}>
      {/* ── Left panel ── */}
      <div style={styles.authLeft}>
        <div style={{ textAlign: "center" }}>
          {/* Logo / brand mark */}
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "18px",
              background: "linear-gradient(135deg,#00bcd4,#0097a7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: "28px",
              boxShadow: "0 8px 24px rgba(0,188,212,0.35)",
            }}
          >
            ✦
          </div>

          <div style={styles.authBrand}>Vibe.</div>
          <p style={styles.authTagline}>
            Your mini social world. Share posts, build your profile, connect with people.
          </p>

          <div style={styles.authBadge}>✨ Free forever</div>

          {/* Feature list */}
          <div style={{ marginTop: "48px", textAlign: "left", maxWidth: "280px" }}>
            {[
              { icon: "👤", text: "Your unique social profile" },
              { icon: "✍️", text: "Share posts & moments" },
              { icon: "🌐", text: "Connect with your community" },
              { icon: "🔒", text: "Secure sign-in with Google" },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "14px",
                  color: "rgba(255,255,255,0.70)",
                  fontSize: "14px",
                }}
              >
                <span style={{ fontSize: "18px", width: "28px", textAlign: "center" }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div style={styles.authRight}>
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#EEF0FF", color: "#6C63FF", padding: "4px 12px", borderRadius: "50px", fontSize: "12px", fontWeight: "700", marginBottom: "12px" }}>Welcome back</div>
          <h2 style={{ ...styles.title, marginBottom: "4px" }}>Sign in to Vibe 👋</h2>
          <p style={styles.subtitle}>Good to see you again — your feed is waiting</p>
        </div>

        {errors.general && (
          <div style={styles.errorBanner}>⚠️ {errors.general}</div>
        )}

        <form style={styles.form} onSubmit={handleLogin}>
          <div style={styles.inputWrap}>
            <label style={styles.inputLabel}>Email / Username / Phone</label>
            <input
              style={{
                ...styles.input,
                borderColor: errors.identifier ? "#e53e3e" : "#e2e8f0",
              }}
              type="text"
              placeholder="Enter your email, username or phone"
              value={form.identifier}
              onChange={handleChange("identifier")}
            />
            {errors.identifier && (
              <p style={styles.error}>{errors.identifier}</p>
            )}
          </div>

          <div style={styles.inputWrap}>
            <label style={styles.inputLabel}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                style={{
                  ...styles.input,
                  borderColor: errors.password ? "#e53e3e" : "#e2e8f0",
                  paddingRight: "44px",
                }}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: "#718096",
                  padding: "0",
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <p style={styles.error}>{errors.password}</p>}
          </div>

          <button
            style={{
              ...styles.button,
              opacity: disabled ? 0.7 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
            }}
            type="submit"
            disabled={disabled}
          >
            {disabled ? "Please wait…" : "Sign In"}
          </button>

          <div style={{ textAlign: "center", margin: "24px 0" }}>
            <span style={{ color: "#718096", fontSize: "14px" }}>or</span>
          </div>

          <button
            style={{
              ...styles.button,
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              color: "#2d3748",
              opacity: disabled ? 0.7 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            type="button"
            onClick={handleGoogleSignIn}
            disabled={disabled}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8.8c-.1-.6-.4-1.2-.8-1.7l-.1-.1c-.5-.5-1.1-.8-1.8-.9-.6-.1-1.2 0-1.8.2l-.1.1c-.5.2-1 .6-1.3 1.1-.3.5-.5 1-.5 1.6v.1c0 .6.2 1.1.5 1.6.3.5.7.9 1.2 1.1l.1.1c.6.3 1.2.4 1.8.3.7-.1 1.3-.4 1.8-.9l.1-.1c.4-.5.7-1.1.8-1.7.1-.3.1-.6.1-.9 0-.3-.1-.6-.1-.9z"/>
              <path fill="#34A853" d="M9 18c2.1 0 3.7-.7 4.8-1.5l-2.3-1.8c-.6.4-1.5.7-2.5.7-1.9 0-3.5-1.3-4.1-3h-2.4v1.8C3.5 15.8 5.9 18 9 18z"/>
              <path fill="#FBBC05" d="M4.9 10.4c-.1-.3-.2-.6-.2-.9s.1-.6.2-.9V6.8H2.5c-.4.7-.5 1.5-.5 2.3s.2 1.6.5 2.3l2.4-1z"/>
              <path fill="#EA4335" d="M9 3.6c1.1 0 2.1.4 2.9 1.1l2.1-2.1C12.7 1.4 11.1.6 9 .6 5.9.6 3.5 2.8 2.5 6.8l2.4 1.8c.6-1.7 2.2-3 4.1-3z"/>
            </svg>
            {disabled ? "Please wait…" : "Continue with Google"}
          </button>
        </form>

        <p style={styles.link} onClick={goSignup}>New to Vibe? Create your profile →</p>
      </div>
    </div>
  );
}

export default Login;
