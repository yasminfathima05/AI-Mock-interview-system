import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [user] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F3EDE3",
      color: "#30271F",
      fontFamily:
        "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      paddingBottom: "60px",
    },

    navbar: {
      maxWidth: "1180px",
      margin: "0 auto",
      padding: "32px 30px 25px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "20px",
    },

    brand: {
      margin: 0,
      fontSize: "12px",
      fontWeight: "700",
      letterSpacing: "3px",
      textTransform: "uppercase",
      color: "#B89B7A",
    },

    heading: {
      margin: "6px 0 0",
      fontSize: "42px",
      lineHeight: "1.1",
      fontWeight: "600",
      color: "#493B30",
    },

    main: {
      maxWidth: "1180px",
      margin: "0 auto",
      padding: "0 30px",
    },

    welcomeCard: {
      background: "#FBF8F2",
      border: "1px solid #E1D5C5",
      borderRadius: "28px",
      padding: "55px 35px",
      textAlign: "center",
      boxShadow: "0 18px 50px rgba(73, 59, 48, 0.09)",
    },

    welcomeSmall: {
      margin: 0,
      fontSize: "17px",
      color: "#7D7063",
    },

    email: {
      margin: "12px 0 0",
      fontSize: "30px",
      lineHeight: "1.3",
      fontWeight: "600",
      color: "#493B30",
      wordBreak: "break-word",
    },

    welcomeText: {
      margin: "12px auto 0",
      fontSize: "16px",
      lineHeight: "1.6",
      color: "#7D7063",
      maxWidth: "600px",
    },

    startButton: {
      marginTop: "30px",
      border: "none",
      background: "#493B30",
      color: "#FBF8F2",
      borderRadius: "13px",
      padding: "15px 28px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      boxShadow: "0 8px 20px rgba(73, 59, 48, 0.18)",
    },

    hrButton: {
      marginTop: "14px",
      border: "1px solid #D8C5AC",
      background: "#FBF8F2",
      color: "#493B30",
      borderRadius: "13px",
      padding: "14px 28px",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "18px",
      marginTop: "22px",
    },

    statCard: {
      background: "#FBF8F2",
      border: "1px solid #E1D5C5",
      borderRadius: "22px",
      padding: "28px 20px",
      textAlign: "center",
      boxShadow: "0 10px 30px rgba(73, 59, 48, 0.06)",
    },

    statLabel: {
      margin: 0,
      color: "#7D7063",
      fontSize: "14px",
      fontWeight: "600",
    },

    statNumber: {
      margin: "12px 0 0",
      color: "#493B30",
      fontSize: "38px",
      lineHeight: "1",
      fontWeight: "700",
    },

    actionsSection: {
      marginTop: "22px",
      background: "#FBF8F2",
      border: "1px solid #E1D5C5",
      borderRadius: "28px",
      padding: "32px",
      boxShadow: "0 10px 30px rgba(73, 59, 48, 0.06)",
    },

    actionsTitle: {
      margin: "0 0 25px",
      textAlign: "center",
      fontSize: "24px",
      fontWeight: "600",
      color: "#493B30",
    },

    actionsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "16px",
    },

    actionCard: {
      border: "1px solid #E1D5C5",
      background: "#FBF8F2",
      borderRadius: "18px",
      padding: "24px",
      textAlign: "left",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },

    icon: {
      fontSize: "30px",
      marginBottom: "15px",
    },

    actionTitle: {
      margin: 0,
      fontSize: "18px",
      fontWeight: "600",
      color: "#493B30",
    },

    actionText: {
      margin: "8px 0 0",
      fontSize: "14px",
      lineHeight: "1.6",
      color: "#7D7063",
    },
  };

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <div>
          <p style={styles.brand}>AI Mock Interview</p>

          <h1 style={styles.heading}>Dashboard</h1>
        </div>
      </nav>

      <main style={styles.main}>
        <section style={styles.welcomeCard}>
          <p style={styles.welcomeSmall}>
            Welcome back 👋
          </p>

          <h2 style={styles.email}>
            {user?.email || "User"}
          </h2>

          <p style={styles.welcomeText}>
            Ready to practice, improve, and become
            more confident in your interviews?
          </p>

          <button
            onClick={() => navigate("/interview")}
            style={styles.startButton}
          >
            🎯 Start Technical Interview →
          </button>

          <br />

          <button
            onClick={() => navigate("/hr-interview")}
            style={styles.hrButton}
          >
            👔 Start HR Round — 20 Questions
          </button>
        </section>

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>
              Interviews Completed
            </p>

            <div style={styles.statNumber}>
              —
            </div>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statLabel}>
              Average Score
            </p>

            <div style={styles.statNumber}>
              —
            </div>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statLabel}>
              Latest Score
            </p>

            <div style={styles.statNumber}>
              —
            </div>
          </div>
        </section>

        <section style={styles.actionsSection}>
          <h2 style={styles.actionsTitle}>
            Quick Actions
          </h2>

          <div style={styles.actionsGrid}>
            <button
              onClick={() => navigate("/assistant")}
              style={styles.actionCard}
            >
              <div style={styles.icon}>
                🤖
              </div>

              <h3 style={styles.actionTitle}>
                AI Assistant
              </h3>

              <p style={styles.actionText}>
                Get help preparing for interviews
                and improving your answers.
              </p>
            </button>

            <button
              onClick={() => navigate("/profile")}
              style={styles.actionCard}
            >
              <div style={styles.icon}>
                👤
              </div>

              <h3 style={styles.actionTitle}>
                Profile
              </h3>

              <p style={styles.actionText}>
                View and manage your account
                information.
              </p>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;