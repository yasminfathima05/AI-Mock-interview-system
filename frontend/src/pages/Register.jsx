import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/api/auth/register", {
        name,
        email,
        password
      });

      if (response.data.success) {
        alert("Registration successful! Please login.");
        navigate("/login");
      } else {
        setError(
          response.data.message ||
          "Registration failed."
        );
      }
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      {/* Decorative background */}

      <div style={styles.decorOne}></div>
      <div style={styles.decorTwo}></div>

      <div style={styles.card}>

        {/* LEFT BRANDING */}

        <div style={styles.leftPanel}>

          <div style={styles.brandIcon}>
            ✦
          </div>

          <p style={styles.brandSmall}>
            AI MOCK INTERVIEW
          </p>

          <h1 style={styles.brandTitle}>
            Start preparing
            <br />
            with confidence.
          </h1>

          <p style={styles.brandText}>
            Practice interviews, receive
            AI-powered feedback and
            improve your answers before
            the real interview.
          </p>

          <div style={styles.featureBox}>
            <div style={styles.featureIcon}>
              ✓
            </div>

            <div>
              <strong style={styles.featureTitle}>
                AI-powered practice
              </strong>

              <p style={styles.featureText}>
                Get personalised feedback
                on every answer.
              </p>
            </div>
          </div>

        </div>


        {/* RIGHT FORM */}

        <div style={styles.formPanel}>

          <div style={styles.formHeader}>

            <p style={styles.eyebrow}>
              CREATE ACCOUNT
            </p>

            <h2 style={styles.title}>
              Welcome aboard.
            </h2>

            <p style={styles.subtitle}>
              Create your account to begin
              your interview practice.
            </p>

          </div>


          <form
            onSubmit={handleRegister}
            style={styles.form}
          >

            {/* NAME */}

            <div style={styles.field}>

              <label style={styles.label}>
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your name"
                style={styles.input}
              />

            </div>


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
                placeholder="Create a password"
                style={styles.input}
              />

              <p style={styles.helperText}>
                Minimum 6 characters
              </p>

            </div>


            {/* ERROR */}

            {error && (
              <div style={styles.errorBox}>
                <span style={styles.errorIcon}>
                  !
                </span>

                <span>
                  {error}
                </span>
              </div>
            )}


            {/* REGISTER */}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.registerButton,
                ...(loading
                  ? styles.disabledButton
                  : {})
              }}
            >
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>

          </form>


          {/* LOGIN */}

          <p style={styles.loginText}>
            Already have an account?{" "}

            <Link
              to="/login"
              style={styles.loginLink}
            >
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}


// ==========================================
// STYLES
// ==========================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#F3EDE3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 20px",
    boxSizing: "border-box",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden"
  },

  decorOne: {
    position: "fixed",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "#D8C5AC",
    opacity: 0.3,
    filter: "blur(100px)",
    top: "-180px",
    left: "-150px",
    pointerEvents: "none"
  },

  decorTwo: {
    position: "fixed",
    width: "380px",
    height: "380px",
    borderRadius: "50%",
    background: "#B89B7A",
    opacity: 0.16,
    filter: "blur(110px)",
    bottom: "-180px",
    right: "-120px",
    pointerEvents: "none"
  },

  card: {
    width: "100%",
    maxWidth: "920px",
    minHeight: "590px",
    display: "grid",
    gridTemplateColumns:
      "42% 58%",
    background: "#FBF8F2",
    border:
      "1px solid #E1D5C5",
    borderRadius: "28px",
    overflow: "hidden",
    boxShadow:
      "0 25px 70px rgba(73,59,48,0.14)",
    position: "relative",
    zIndex: 1
  },

  // ========================================
  // LEFT PANEL
  // ========================================

  leftPanel: {
    background: "#493B30",
    padding: "55px 45px",
    color: "#FBF8F2",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },

  brandIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "18px",
    background: "#B89B7A",
    color: "#493B30",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px",
    fontWeight: "800",
    marginBottom: "28px"
  },

  brandSmall: {
    fontSize: "10px",
    letterSpacing: "3px",
    color: "#D8C5AC",
    fontWeight: "800",
    margin: "0 0 15px"
  },

  brandTitle: {
    fontSize: "36px",
    lineHeight: "1.12",
    margin: "0 0 20px",
    fontWeight: "800",
    letterSpacing: "-0.5px"
  },

  brandText: {
    color: "#D9CEC0",
    fontSize: "14px",
    lineHeight: "1.7",
    maxWidth: "320px",
    margin: 0
  },

  featureBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    marginTop: "45px",
    padding:
      "17px 18px",
    borderRadius: "16px",
    background:
      "rgba(255,255,255,0.07)",
    border:
      "1px solid rgba(255,255,255,0.08)"
  },

  featureIcon: {
    width: "28px",
    height: "28px",
    borderRadius: "9px",
    background: "#D8C5AC",
    color: "#493B30",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    flexShrink: 0
  },

  featureTitle: {
    fontSize: "13px",
    color: "#FBF8F2"
  },

  featureText: {
    fontSize: "12px",
    color: "#BFB1A2",
    margin:
      "5px 0 0",
    lineHeight: "1.5"
  },

  // ========================================
  // RIGHT PANEL
  // ========================================

  formPanel: {
    padding: "55px 60px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },

  formHeader: {
    marginBottom: "30px"
  },

  eyebrow: {
    fontSize: "10px",
    letterSpacing: "2.5px",
    color: "#9A7854",
    fontWeight: "800",
    margin: "0 0 9px"
  },

  title: {
    fontSize: "30px",
    color: "#30271F",
    margin: 0,
    fontWeight: "800"
  },

  subtitle: {
    fontSize: "14px",
    color: "#7D7063",
    lineHeight: "1.6",
    margin:
      "9px 0 0"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  },

  field: {
    display: "flex",
    flexDirection: "column"
  },

  label: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#493B30",
    marginBottom: "7px"
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border:
      "1px solid #DCCFBE",
    borderRadius: "12px",
    padding: "13px 15px",
    background: "#FFFDF9",
    color: "#30271F",
    fontSize: "14px",
    outline: "none"
  },

  helperText: {
    fontSize: "11px",
    color: "#9A8C7D",
    margin:
      "6px 0 0"
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    background: "#F3E1DB",
    color: "#895B4A",
    border:
      "1px solid #E4C8BD",
    borderRadius: "10px",
    padding: "11px 13px",
    fontSize: "12px"
  },

  errorIcon: {
    width: "19px",
    height: "19px",
    borderRadius: "50%",
    background: "#895B4A",
    color: "#FFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "800",
    flexShrink: 0
  },

  registerButton: {
    width: "100%",
    border: "none",
    borderRadius: "12px",
    padding: "14px",
    background: "#493B30",
    color: "#FBF8F2",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "4px",
    boxShadow:
      "0 8px 20px rgba(73,59,48,0.15)"
  },

  disabledButton: {
    opacity: 0.55,
    cursor: "not-allowed"
  },

  loginText: {
    textAlign: "center",
    color: "#7D7063",
    fontSize: "12px",
    margin:
      "25px 0 0"
  },

  loginLink: {
    color: "#493B30",
    fontWeight: "800",
    textDecoration: "none"
  }
};

export default Register;