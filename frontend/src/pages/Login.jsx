import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/api/auth/login", {
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem(
          "access_token",
          response.data.access_token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );

        navigate("/dashboard");
      } else {
        setError(response.data.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
        "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F3EDE3",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      boxSizing: "border-box",
      fontFamily:
        "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },

    container: {
      width: "100%",
      maxWidth: "1050px",
      minHeight: "620px",
      background: "#FBF8F2",
      border: "1px solid #E1D5C5",
      borderRadius: "28px",
      overflow: "hidden",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      boxShadow: "0 25px 70px rgba(73, 59, 48, 0.15)"
    },

    left: {
      background: "#493B30",
      padding: "60px",
      color: "#FBF8F2",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      boxSizing: "border-box"
    },

    brand: {
      fontSize: "13px",
      fontWeight: "700",
      letterSpacing: "3px",
      textTransform: "uppercase",
      color: "#D8C5AC",
      margin: 0
    },

    leftTitle: {
      fontSize: "52px",
      lineHeight: "1.08",
      fontWeight: "600",
      margin: "55px 0 25px",
      color: "#FBF8F2"
    },

    highlight: {
      color: "#D8C5AC"
    },

    leftDescription: {
      fontSize: "17px",
      lineHeight: "1.7",
      color: "#D8C5AC",
      maxWidth: "390px",
      margin: 0
    },

    leftBottom: {
      borderTop: "1px solid #756455",
      paddingTop: "22px",
      marginTop: "50px"
    },

    leftBottomText: {
      fontSize: "13px",
      color: "#CDBBA6",
      margin: 0
    },

    right: {
      padding: "60px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      boxSizing: "border-box"
    },

    smallHeading: {
      fontSize: "13px",
      fontWeight: "700",
      letterSpacing: "3px",
      textTransform: "uppercase",
      color: "#B89B7A",
      margin: 0
    },

    title: {
      fontSize: "42px",
      lineHeight: "1.15",
      fontWeight: "600",
      color: "#493B30",
      margin: "10px 0 10px"
    },

    subtitle: {
      fontSize: "16px",
      color: "#7D7063",
      margin: "0 0 35px",
      lineHeight: "1.5"
    },

    form: {
      display: "flex",
      flexDirection: "column",
      gap: "20px"
    },

    field: {
      display: "flex",
      flexDirection: "column",
      gap: "8px"
    },

    label: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#493B30"
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "15px 16px",
      borderRadius: "12px",
      border: "1px solid #D8C5AC",
      background: "#F3EDE3",
      color: "#30271F",
      fontSize: "15px",
      outline: "none"
    },

    error: {
      background: "#F5E0DC",
      border: "1px solid #D8A9A0",
      color: "#8A4035",
      padding: "12px 14px",
      borderRadius: "10px",
      fontSize: "13px",
      lineHeight: "1.5"
    },

    button: {
      width: "100%",
      border: "none",
      borderRadius: "12px",
      padding: "16px",
      background: "#493B30",
      color: "#FBF8F2",
      fontSize: "16px",
      fontWeight: "600",
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.65 : 1,
      marginTop: "4px"
    },

    registerText: {
      textAlign: "center",
      color: "#7D7063",
      fontSize: "14px",
      marginTop: "25px",
      lineHeight: "1.5"
    },

    registerLink: {
      color: "#493B30",
      fontWeight: "700",
      textDecoration: "none"
    },

    divider: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginTop: "40px"
    },

    line: {
      height: "1px",
      background: "#E1D5C5",
      flex: 1
    },

    dividerText: {
      fontSize: "10px",
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: "#B89B7A",
      whiteSpace: "nowrap"
    }
  };

  return (
    <div style={styles.page}>

      <div style={styles.container}>

        {/* LEFT BRANDING PANEL */}
        <div style={styles.left}>

          <div>
            <p style={styles.brand}>
              AI Mock Interview
            </p>

            <h1 style={styles.leftTitle}>
              Practice.
              <br />
              Improve.
              <br />
              <span style={styles.highlight}>
                Get confident.
              </span>
            </h1>

            <p style={styles.leftDescription}>
              Prepare for your next interview with realistic
              questions, AI-powered feedback and focused
              practice sessions.
            </p>
          </div>

          <div style={styles.leftBottom}>
            <p style={styles.leftBottomText}>
              Your personal interview preparation space.
            </p>
          </div>

        </div>

        {/* LOGIN PANEL */}
        <div style={styles.right}>

          <div>
            <p style={styles.smallHeading}>
              Welcome back
            </p>

            <h2 style={styles.title}>
              Sign in
            </h2>

            <p style={styles.subtitle}>
              Continue your interview preparation.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            style={styles.form}
          >

            {/* EMAIL */}
            <div style={styles.field}>

              <label style={styles.label}>
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                style={styles.input}
              />

            </div>

            {/* PASSWORD */}
            <div style={styles.field}>

              <label style={styles.label}>
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                style={styles.input}
              />

            </div>

            {/* ERROR */}
            {error && (
              <div style={styles.error}>
                {error}
              </div>
            )}

            {/* LOGIN */}
            <button
              type="submit"
              disabled={loading}
              style={styles.button}
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

          {/* REGISTER */}
          <p style={styles.registerText}>
            Don't have an account?{" "}

            <Link
              to="/register"
              style={styles.registerLink}
            >
              Create an account
            </Link>
          </p>

          {/* DIVIDER */}
          <div style={styles.divider}>
            <div style={styles.line} />

            <span style={styles.dividerText}>
              AI Interview
            </span>

            <div style={styles.line} />
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;