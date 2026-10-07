import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      const storedUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (storedUser) {
        setUser(storedUser);
        setEmail(storedUser.email || "");
        setUserId(storedUser.id || "");
      }

      const response = await api.get("/api/interview/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Keep the stored login information as the main profile source.
      // The request above also confirms that the session is still valid.
      if (response.data && storedUser) {
        setName(
          storedUser.name ||
          localStorage.getItem("user_name") ||
          ""
        );
      }
    } catch (error) {
      console.error("Profile loading error:", error);

      const storedUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (storedUser) {
        setUser(storedUser);
        setName(storedUser.name || "");
        setEmail(storedUser.email || "");
        setUserId(storedUser.id || "");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const token = localStorage.getItem("access_token");

      const response = await api.put(
        "/api/profile",
        {
          name: name.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const storedUser = JSON.parse(
          localStorage.getItem("user") || "null"
        );

        const updatedUser = {
          ...(storedUser || {}),
          name: name.trim(),
        };

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

        localStorage.setItem("user_name", name.trim());

        setUser(updatedUser);
        setMessage("Profile updated successfully! ✓");
      }
    } catch (error) {
      console.error("Profile update error:", error);

      setMessage(
        error.response?.data?.message ||
          "Could not update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_name");
    localStorage.removeItem("completed_session_id");

    navigate("/login");
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F3EDE3",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#493B30",
          fontSize: "18px",
        }}
      >
        Loading profile...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F3EDE3",
        color: "#30271F",
        padding: "40px 20px",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "850px",
          margin: "0 auto",
        }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            background: "transparent",
            border: "none",
            color: "#7D7063",
            fontSize: "15px",
            cursor: "pointer",
            marginBottom: "25px",
            padding: "0",
          }}
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <p
            style={{
              margin: "0 0 8px",
              color: "#B89B7A",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "2px",
            }}
          >
            YOUR ACCOUNT
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "38px",
              color: "#493B30",
              letterSpacing: "-1px",
            }}
          >
            Profile
          </h1>

          <p
            style={{
              marginTop: "10px",
              color: "#7D7063",
              fontSize: "15px",
            }}
          >
            Manage your interview account and personal details.
          </p>
        </div>

        {/* Profile card */}
        <div
          style={{
            background: "#FBF8F2",
            border: "1px solid #E1D5C5",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 15px 40px rgba(73, 59, 48, 0.08)",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              paddingBottom: "28px",
              borderBottom: "1px solid #E1D5C5",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "#B89B7A",
                color: "#FBF8F2",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "28px",
                fontWeight: "700",
              }}
            >
              {name
                ? name.charAt(0).toUpperCase()
                : "U"}
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#493B30",
                  fontSize: "23px",
                }}
              >
                {name || "Your Name"}
              </h2>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#7D7063",
                }}
              >
                Interview Candidate
              </p>
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: "22px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#493B30",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Full Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px solid #D8C5AC",
                background: "#F3EDE3",
                color: "#30271F",
                fontSize: "15px",
                outline: "none",
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "22px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#493B30",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Email
            </label>

            <input
              value={email}
              disabled
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px solid #E1D5C5",
                background: "#EDE6DA",
                color: "#7D7063",
                fontSize: "15px",
              }}
            />

            <p
              style={{
                margin: "7px 0 0",
                color: "#9A8D80",
                fontSize: "12px",
              }}
            >
              Email is managed by your account authentication.
            </p>
          </div>

          {/* User ID */}
          <div style={{ marginBottom: "28px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#493B30",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              User ID
            </label>

            <div
              style={{
                padding: "14px 16px",
                borderRadius: "12px",
                background: "#F3EDE3",
                border: "1px solid #E1D5C5",
                color: "#7D7063",
                fontSize: "13px",
                wordBreak: "break-all",
              }}
            >
              {userId || "Not available"}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px 15px",
                borderRadius: "10px",
                background: "#EFE5D7",
                color: "#493B30",
                fontSize: "14px",
              }}
            >
              {message}
            </div>
          )}

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                border: "none",
                borderRadius: "12px",
                padding: "13px 22px",
                background: "#493B30",
                color: "#FBF8F2",
                fontSize: "14px",
                fontWeight: "600",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={handleLogout}
              style={{
                border: "1px solid #C9B8A2",
                borderRadius: "12px",
                padding: "13px 22px",
                background: "transparent",
                color: "#7A4035",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Bottom navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginTop: "25px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              border: "none",
              background: "transparent",
              color: "#7D7063",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/history")}
            style={{
              border: "none",
              background: "transparent",
              color: "#7D7063",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            History
          </button>

          <button
            onClick={() => navigate("/assistant")}
            style={{
              border: "none",
              background: "transparent",
              color: "#7D7063",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            AI Assistant
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;