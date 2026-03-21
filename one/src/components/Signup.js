import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import styles from "./styles/styles";

function Signup({ goLogin }) {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    phone: "",
    email: "",
    location: "",
    birthdate: "",
    password: "",
  });

  const [popup, setPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors({});

    let newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.username.trim()) newErrors.username = 'Username is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.location.trim()) newErrors.location = 'Location is required';
    if (!form.birthdate) newErrors.birthdate = 'Birthdate is required';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      await addDoc(collection(db, "users"), {
        uid: res.user.uid,
        fullName: form.fullName,
        username: form.username,
        phone: form.phone,
        email: form.email,
        location: form.location,
        birthdate: form.birthdate,
      });

      setSuccessMessage("Account created successfully! Please log in.");

      setTimeout(() => {
        setSuccessMessage("");
        goLogin();
      }, 2000);

    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setErrors({general: "Email already in use"});
      } else {
        setErrors({general: err.message});
      }
    }
  };

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <h2>Create Account</h2>
        <p style={{color:'green', fontSize:'14px'}}>{successMessage}</p>
        <p style={{color:'red', fontSize:'12px'}}>{errors.general}</p>

        <form style={styles.form} onSubmit={handleSignup}>
          <input style={styles.input} placeholder="Full Name" value={form.fullName}
            onChange={(e)=>setForm({...form, fullName:e.target.value})}/>
          <p style={{color:'red', fontSize:'12px'}}>{errors.fullName}</p>
          <input style={styles.input} placeholder="Username" value={form.username}
            onChange={(e)=>setForm({...form, username:e.target.value})}/>
          <p style={{color:'red', fontSize:'12px'}}>{errors.username}</p>
          <input style={styles.input} placeholder="Phone" value={form.phone}
            onChange={(e)=>setForm({...form, phone:e.target.value})}/>
          <p style={{color:'red', fontSize:'12px'}}>{errors.phone}</p>
          <input style={styles.input} placeholder="Email" value={form.email}
            onChange={(e)=>setForm({...form, email:e.target.value})}/>
          <p style={{color:'red', fontSize:'12px'}}>{errors.email}</p>
          <input style={styles.input} placeholder="Location" value={form.location}
            onChange={(e)=>setForm({...form, location:e.target.value})}/>
          <p style={{color:'red', fontSize:'12px'}}>{errors.location}</p>
          <input style={styles.input} type="date" value={form.birthdate}
            onChange={(e)=>setForm({...form, birthdate:e.target.value})}/>
          <p style={{color:'red', fontSize:'12px'}}>{errors.birthdate}</p>
          <input style={styles.input} type="password" placeholder="Password" value={form.password}
            onChange={(e)=>setForm({...form, password:e.target.value})}/>
          <p style={{color:'red', fontSize:'12px'}}>{errors.password}</p>

          <button style={styles.button}>Signup</button>
        </form>

        <p style={styles.link} onClick={goLogin}>
          Already have an account?
        </p>
      </div>
    </div>
  );
}

export default Signup;