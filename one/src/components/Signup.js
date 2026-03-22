import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
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

  const handleSignup = async (event) => {
    event.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    try {
      const created = await createUserWithEmailAndPassword(auth, form.email, form.password);

      await addDoc(collection(db, "users"), {
        uid: created.user.uid,
        fullName: form.fullName,
        username: form.username,
        phone: form.phone,
        email: form.email,
        location: form.location,
        birthdate: form.birthdate,
      });

      await sendEmailVerification(created.user);

      setMessage("Account created. Please check your email and verify before logging in.");
      setForm(initialForm);
      console.log("Sign up successful:", {
        uid: created.user.uid,
        email: created.user.email,
      });

      setTimeout(() => {
        setMessage("");
        goLogin();
      }, 1500);
    } catch (error) {
      setErrors({ general: error.code === "auth/email-already-in-use" ? "Email already exists." : error.message });
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

          <button style={styles.button} type="submit">Signup</button>
        </form>

        <p style={styles.link} onClick={goLogin}>Already have an account?</p>
      </div>
    </div>
  );
}

export default Signup;