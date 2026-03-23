import React, { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { checkPopupSupport, handlePopupError } from "../utils/popupHelper";
import { signInWithGoogleRedirect } from "../utils/redirectAuth";
import styles from "./styles/styles";

function GoogleAuthButton({ onSuccess, onError, buttonText = "Continue with Google" }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setLoading(true);
    onError({});

    try {
      // First try popup method
      if (checkPopupSupport()) {
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        const result = await signInWithPopup(auth, provider);
        onSuccess(result.user);
      } else {
        // Fallback to redirect method
        await signInWithGoogleRedirect();
        // Note: The redirect will reload the page, so we won't reach here
      }
    } catch (err) {
      // Handle popup-specific errors
      if (!handlePopupError(err, onError)) {
        // If popup fails, try redirect as fallback
        if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
          try {
            await signInWithGoogleRedirect();
          } catch (redirectErr) {
            onError({
              general: "Authentication failed. Please try again or contact support.",
            });
          }
        } else {
          onError({
            general:
              err.code === "auth/internal-error"
                ? "Authentication service unavailable. Please try again later."
                : err.message,
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      disabled={loading}
      style={{
        width: "100%",
        padding: "12px",
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        fontSize: "14px",
        fontWeight: "500",
        opacity: loading ? 0.7 : 1,
      }}
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="google"
        style={{ width: "18px", height: "18px" }}
      />
      {loading ? "Signing in..." : buttonText}
    </button>
  );
}

export default GoogleAuthButton;
