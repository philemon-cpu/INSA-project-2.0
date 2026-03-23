import React from "react";

function Welcome({ user, logout }) {
  const displayName = user.fullName || user.username || user.email?.split("@")[0] || "User";
  const username = user.username || "user";
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "40px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        maxWidth: "500px",
        width: "100%",
        textAlign: "center"
      }}>
        {/* Avatar */}
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6C63FF 0%, #a78bfa 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          color: "white",
          fontWeight: "bold",
          margin: "0 auto 24px"
        }}>
          {initials}
        </div>

        {/* Welcome Message */}
        <h1 style={{
          fontSize: "28px",
          fontWeight: "800",
          color: "#111827",
          marginBottom: "8px",
          letterSpacing: "-0.5px"
        }}>
          Welcome back, {displayName}! 👋
        </h1>

        <p style={{
          fontSize: "16px",
          color: "#6B7280",
          marginBottom: "32px",
          lineHeight: "1.5"
        }}>
          You're successfully logged in as <strong>@{username}</strong>
        </p>

        {/* User Info */}
        <div style={{
          background: "#f8f9fa",
          borderRadius: "12px",
          padding: "20px",
          textAlign: "left",
          marginBottom: "32px"
        }}>
          <div style={{ marginBottom: "12px" }}>
            <span style={{ color: "#9CA3AF", fontSize: "14px" }}>Full Name:</span>
            <div style={{ fontWeight: "600", color: "#111827", marginTop: "4px" }}>
              {user.fullName || "Not provided"}
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <span style={{ color: "#9CA3AF", fontSize: "14px" }}>Username:</span>
            <div style={{ fontWeight: "600", color: "#111827", marginTop: "4px" }}>
              @{username}
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <span style={{ color: "#9CA3AF", fontSize: "14px" }}>Email:</span>
            <div style={{ fontWeight: "600", color: "#111827", marginTop: "4px" }}>
              {user.email}
            </div>
          </div>

          {user.bio && (
            <div>
              <span style={{ color: "#9CA3AF", fontSize: "14px" }}>Bio:</span>
              <div style={{ fontWeight: "600", color: "#111827", marginTop: "4px" }}>
                {user.bio}
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: "14px 24px",
            background: "linear-gradient(135deg, #6C63FF 0%, #a78bfa 100%)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          onMouseOver={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 8px 20px rgba(108,99,255,0.3)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Welcome;
