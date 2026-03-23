import React, { useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import styles, { tokens } from "./styles/styles";

const initialForm = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  // optional
  phone: "",
  location: "",
  birthdate: "",
};

function Signup({ goLogin }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!form.username.trim()) {
      newErrors.username = "Username is required.";
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) {
      newErrors.username = "3–20 chars: letters, numbers, underscore only.";
    }
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Enter a valid email.";
    }
    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    return newErrors;
  };

  const updateField = (name) => (event) => {
    setForm((prev) => ({ ...prev, [name]: event.target.value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    if (disabled) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setDisabled(true);
    setTimeout(() => setDisabled(false), 10000);

    try {
      // Check username uniqueness
      const usernameRef = ref(db, "usernames/" + form.username);
      const usernameSnapshot = await get(usernameRef);
      if (usernameSnapshot.exists()) {
        setErrors({ general: "Username already taken. Choose another." });
        setDisabled(false);
        return;
      }

      const created = await createUserWithEmailAndPassword(auth, form.email, form.password);

      // Save user profile
      await set(ref(db, "users/" + created.user.uid), {
        uid: created.user.uid,
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        phone: form.phone,
        location: form.location,
        birthdate: form.birthdate,
      });

      // Save username index
      await set(ref(db, "usernames/" + form.username), created.user.uid);

      // Save phone index only if provided
      if (form.phone.trim()) {
        await set(ref(db, "phones/" + form.phone.replace(/\s/g, "")), created.user.uid);
      }

      await sendEmailVerification(created.user);

      setMessage("Account created! Check your email to verify before logging in.");
      setForm(initialForm);
      setFailedAttempts(0);
      setTimeout(() => { setMessage(""); goLogin(); }, 2000);
    } catch (error) {
      setFailedAttempts((prev) => prev + 1);
      if (failedAttempts + 1 >= 5) {
        setDisabled(true);
        setTimeout(() => { setDisabled(false); setFailedAttempts(0); }, 300000);
        setErrors({ general: "Too many failed attempts. Try again in 5 minutes." });
      } else {
        setErrors({
          general:
            error.code === "auth/email-already-in-use" ? "Email already in use. Try logging in." :
            error.code === "auth/internal-error" ? "Service unavailable. Try again later." :
            error.message,
        });
      }
    }
  };

  const inputStyle = (field) => ({
    ...styles.input,
    borderColor: errors[field] ? tokens.error : tokens.border,
    boxShadow: errors[field] ? `0 0 0 3px rgba(239,68,68,0.10)` : "none",
  });

  return (
    <div style={styles.authPage}>
      {/* ── Left panel ── */}
      <div style={styles.authLeft}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(108,99,255,0.15)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "40px", left: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(167,139,250,0.12)", filter: "blur(50px)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: tokens.gradientBrand, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "24px", boxShadow: `0 8px 24px ${tokens.brandGlow}` }}>✦</div>

        <div style={styles.authBrand}>Join Vibe.</div>
        <p style={styles.authTagline}>Create your profile, share your world, connect with people who get you.</p>
        <div style={styles.authBadge}>✨ Free forever</div>

        <div style={{ marginTop: "48px" }}>
          {[
            { icon: "👤", text: "Build your unique profile" },
            { icon: "✍️", text: "Share posts & moments" },
            { icon: "🌐", text: "Connect with your community" },
            { icon: "🔒", text: "Safe & secure sign-in" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px", color: "rgba(255,255,255,0.70)", fontSize: "14px" }}>
              <span style={{ fontSize: "18px", width: "28px", textAlign: "center" }}>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ ...styles.authRight, width: "500px", minWidth: "400px", padding: "48px 52px" }}>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: tokens.brandLight, color: tokens.brand, padding: "4px 12px", borderRadius: "50px", fontSize: "12px", fontWeight: "700", marginBottom: "12px" }}>
            Create Account
          </div>
          <h2 style={{ ...styles.title, marginBottom: "4px" }}>Set up your profile ✨</h2>
          <p style={styles.subtitle}>Tell the world who you are</p>
        </div>

        {message && <div style={styles.success}>✅ {message}</div>}
        {errors.general && <div style={styles.errorBanner}>⚠️ {errors.general}</div>}

        <form style={styles.form} onSubmit={handleSignup}>
          {/* Full name + Username */}
          <div style={styles.signupGrid}>
            <div style={styles.inputWrap}>
              <label style={styles.inputLabel}>Full Name</label>
              <input style={inputStyle("fullName")} placeholder="Your name" value={form.fullName} onChange={updateField("fullName")} />
              {errors.fullName && <p style={styles.error}>{errors.fullName}</p>}
            </div>
            <div style={styles.inputWrap}>
              <label style={styles.inputLabel}>@Username</label>
              <input style={inputStyle("username")} placeholder="your_handle" value={form.username} onChange={updateField("username")} />
              {errors.username && <p style={styles.error}>{errors.username}</p>}
            </div>
          </div>


          {/* Email */}
          <div style={styles.inputWrap}>
            <label style={styles.inputLabel}>Email</label>
            <input style={inputStyle("email")} type="email" placeholder="you@example.com" value={form.email} onChange={updateField("email")} />
            {errors.email && <p style={styles.error}>{errors.email}</p>}
          </div>

          {/* Password */}
          <div style={styles.inputWrap}>
            <label style={styles.inputLabel}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                style={{ ...inputStyle("password"), paddingRight: "44px" }}
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={updateField("password")}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: tokens.textSecondary, padding: 0 }} aria-label={showPassword ? "Hide" : "Show"}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <p style={styles.error}>{errors.password}</p>}
          </div>

          {/* Optional details toggle */}
          <button
            type="button"
            onClick={() => setShowOptional((v) => !v)}
            style={{ background: "none", border: `1.5px dashed ${tokens.border}`, borderRadius: tokens.radiusSm, padding: "10px", color: tokens.textSecondary, fontSize: "13px", fontWeight: "600", cursor: "pointer", width: "100%", textAlign: "center" }}
          >
            {showOptional ? "▲ Hide" : "▼ Add"} optional details (phone, location, birthday)
          </button>

          {showOptional && (
            <>
              <div style={styles.signupGrid}>
                <div style={styles.inputWrap}>
                  <label style={styles.inputLabel}>Phone</label>
                  <input style={styles.input} placeholder="+251 9…" value={form.phone} onChange={updateField("phone")} />
                </div>
                <div style={styles.inputWrap}>
                  <label style={styles.inputLabel}>Location</label>
                  <input style={styles.input} placeholder="City, Country" value={form.location} onChange={updateField("location")} />
                </div>
              </div>
              <div style={styles.inputWrap}>
                <label style={styles.inputLabel}>Date of Birth</label>
                <input style={styles.input} type="date" value={form.birthdate} onChange={updateField("birthdate")} />
              </div>
            </>
          )}

          <button style={{ ...styles.button, opacity: disabled ? 0.7 : 1, cursor: disabled ? "not-allowed" : "pointer" }} type="submit" disabled={disabled}>
            {disabled ? "Creating your profile…" : "Create My Profile →"}
          </button>
        </form>

        <p style={styles.link} onClick={goLogin}>Already have a Vibe? Sign in →</p>
      </div>
    </div>
  );
}

export default Signup;
