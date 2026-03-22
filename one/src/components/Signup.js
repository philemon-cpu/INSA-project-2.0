import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, addDoc, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { ref, set, get } from "firebase/database";
import styles from "./styles/styles";

const initialForm = {
  fullName: "",
  username: "",
  phone: "",
  email: "",
  location: "",
  birthdate: "",
  password: "",
};

function Signup({ goLogin }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const validate = () => {
    const newErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!form.username.trim()) newErrors.username = "Username is required.";
    if (!form.phone.trim()) newErrors.phone = "Phone is required.";
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Enter a valid email.";
    }

    if (!form.location.trim()) newErrors.location = "Location is required.";
    if (!form.birthdate) newErrors.birthdate = "Birthdate is required.";
    if (!form.password) newErrors.password = "Password is required.";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters.";

    return newErrors;
  };

  const updateField = (name) => (event) => {
    setForm((prev) => ({ ...prev, [name]: event.target.value }));
  };

  const handleGoogleSignup = async () => {
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

      setMessage("Account created with Google. You can now login!");
      setTimeout(() => {
        setMessage("");
        goLogin();
      }, 1500);
    } catch (error) {
      setErrors({ general: error.message });
    }
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
    setTimeout(() => setDisabled(false), 10000); // 10 second cooldown

    try {
      // Check if username is already taken
      const usernameRef = ref(db, 'usernames/' + form.username);
      const usernameSnapshot = await get(usernameRef);
      if (usernameSnapshot.exists()) {
        setErrors({ general: "Username already taken." });
        return;
      }

      const created = await createUserWithEmailAndPassword(auth, form.email, form.password);

      await set(ref(db, 'users/' + created.user.uid), {
        uid: created.user.uid,
        fullName: form.fullName,
        username: form.username,
        phone: form.phone,
        email: form.email,
        location: form.location,
        birthdate: form.birthdate,
      });

      // Save username and phone indexes
      await set(ref(db, 'usernames/' + form.username), created.user.uid);
      await set(ref(db, 'phones/' + form.phone.replace(/\s/g, '')), created.user.uid);

      await sendEmailVerification(created.user);

      await sendEmailVerification(created.user);

      setMessage("Account created. Please check your email and verify before logging in.");
      setForm(initialForm);
      console.log("Sign up successful:", {
        uid: created.user.uid,
        email: created.user.email,
      });
      setFailedAttempts(0); // reset on success

      setTimeout(() => {
        setMessage("");
        goLogin();
      }, 1500);
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
        setErrors({ general: error.code === "auth/email-already-in-use" ? "Email already exists." : error.message });
      }
    }
  };

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <h2>Create Account</h2>
        {message && <p style={styles.success}>{message}</p>}
        {errors.general && <p style={styles.error}>{errors.general}</p>}

        <form style={styles.form} onSubmit={handleSignup}>
          <input style={styles.input} placeholder="Full Name" value={form.fullName} onChange={updateField("fullName")} />
          {errors.fullName && <p style={styles.error}>{errors.fullName}</p>}

          <input style={styles.input} placeholder="Username" value={form.username} onChange={updateField("username")} />
          {errors.username && <p style={styles.error}>{errors.username}</p>}

          <input style={styles.input} placeholder="Phone" value={form.phone} onChange={updateField("phone")} />
          {errors.phone && <p style={styles.error}>{errors.phone}</p>}

          <input style={styles.input} placeholder="Email" value={form.email} onChange={updateField("email")} />
          {errors.email && <p style={styles.error}>{errors.email}</p>}

          <input style={styles.input} placeholder="Location" value={form.location} onChange={updateField("location")} />
          {errors.location && <p style={styles.error}>{errors.location}</p>}

          <input style={styles.input} type="date" value={form.birthdate} onChange={updateField("birthdate")} />
          {errors.birthdate && <p style={styles.error}>{errors.birthdate}</p>}

          <input style={styles.input} type="password" placeholder="Password" value={form.password} onChange={updateField("password")} />
          {errors.password && <p style={styles.error}>{errors.password}</p>}

          <button style={styles.button} type="submit" disabled={disabled}>
            {disabled ? "Please wait..." : "Signup"}
          </button>
        </form>

        <p style={styles.link} onClick={goLogin}>Already have an account?</p>
      </div>
    </div>
  );
}

export default Signup