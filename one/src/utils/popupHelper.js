// Utility to handle popup blocking and provide fallback
export const handlePopupError = (error, setErrors) => {
  if (error.code === 'auth/popup-blocked') {
    setErrors({
      general: (
        <div>
          <p>Popup was blocked by your browser. Please allow popups for this site and try again.</p>
          <button 
            onClick={() => window.open('/popup-instructions.html', '_blank', 'width=800,height=600')}
            style={{
              background: '#4285f4',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px',
              fontSize: '14px'
            }}
          >
            📖 How to Enable Popups
          </button>
        </div>
      )
    });
    return true; // Error was handled
  } else if (error.code === 'auth/popup-closed-by-user') {
    setErrors({
      general: "Sign-in popup was closed before completion. Please try again.",
    });
    return true; // Error was handled
  }
  return false; // Error was not a popup-related error
};

// Check if popup is likely to be blocked
export const checkPopupSupport = () => {
  // Check if we're in a browser that supports popups
  if (typeof window === 'undefined') return false;
  
  // Check if popup is blocked
  const testPopup = window.open('', '', 'width=1,height=1');
  if (testPopup) {
    testPopup.close();
    return true;
  }
  return false;
};

// Request popup permission
export const requestPopupPermission = () => {
  if (typeof window !== 'undefined') {
    // Show a user-friendly message to enable popups
    const message = "Please allow popups for this site to use Google sign-in. Look for the popup icon in your address bar.";
    
    // Try to open a test popup to trigger the browser's popup blocker UI
    const testPopup = window.open('', '', 'width=1,height=1');
    if (testPopup) {
      testPopup.close();
    } else {
      // If popup is blocked, show instructions
      alert(message);
    }
  }
};
