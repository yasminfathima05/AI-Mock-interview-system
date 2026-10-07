import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div style={styles.page}>

      {/* Decorative circles */}
      <div style={styles.decorOne}></div>
      <div style={styles.decorTwo}></div>

      <nav style={styles.nav}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>✦</span>
          AI Mock Interview
        </div>

        <div style={styles.navLinks}>
          <Link to="/login" style={styles.loginLink}>
            Login
          </Link>

          <Link to="/register" style={styles.registerButton}>
            Get Started
          </Link>
        </div>
      </nav>


      <main style={styles.hero}>

        <div style={styles.badge}>
          ✦ AI-POWERED INTERVIEW PRACTICE
        </div>

        <h1 style={styles.title}>
          Practice.
          <br />
          <span style={styles.titleAccent}>
            Improve.
          </span>
          <br />
          Get Interview Ready.
        </h1>

        <p style={styles.description}>
          Practice realistic interview questions,
          speak your answers, and receive
          personalised AI feedback to improve
          your confidence and performance.
        </p>

        <div style={styles.buttons}>

          <Link
            to="/register"
            style={styles.primaryButton}
          >
            Start Practicing
            <span style={styles.arrow}>→</span>
          </Link>

          <Link
            to="/login"
            style={styles.secondaryButton}
          >
            I already have an account
          </Link>

        </div>


        {/* Feature cards */}

        <div style={styles.features}>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              🎤
            </div>

            <h3 style={styles.featureTitle}>
              Voice Practice
            </h3>

            <p style={styles.featureText}>
              Speak your answers naturally
              using your microphone.
            </p>
          </div>


          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              ✦
            </div>

            <h3 style={styles.featureTitle}>
              AI Feedback
            </h3>

            <p style={styles.featureText}>
              Get personalised feedback
              on every answer.
            </p>
          </div>


          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              ◎
            </div>

            <h3 style={styles.featureTitle}>
              Track Progress
            </h3>

            <p style={styles.featureText}>
              Review your performance and
              improve over time.
            </p>
          </div>

        </div>

      </main>


      <footer style={styles.footer}>
        <span>AI Mock Interview System</span>
        <span>Built for better interview preparation ✦</span>
      </footer>

    </div>
  );
}


const styles = {

  page: {
    minHeight: "100vh",
    background: "#F3EDE3",
    color: "#30271F",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box"
  },


  decorOne: {
    position: "fixed",
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    background: "#D8C5AC",
    opacity: 0.28,
    filter: "blur(110px)",
    top: "-220px",
    left: "-170px",
    pointerEvents: "none"
  },


  decorTwo: {
    position: "fixed",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "#B89B7A",
    opacity: 0.14,
    filter: "blur(120px)",
    bottom: "-220px",
    right: "-160px",
    pointerEvents: "none"
  },


  nav: {
    maxWidth: "1150px",
    margin: "0 auto",
    padding: "25px 25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    zIndex: 2
  },


  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "17px",
    fontWeight: "800",
    color: "#493B30"
  },


  logoIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    background: "#493B30",
    color: "#D8C5AC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "17px"
  },


  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "22px"
  },


  loginLink: {
    textDecoration: "none",
    color: "#5E5145",
    fontWeight: "600",
    fontSize: "14px"
  },


  registerButton: {
    textDecoration: "none",
    background: "#493B30",
    color: "#FBF8F2",
    padding: "11px 20px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "700"
  },


  hero: {
    maxWidth: "1050px",
    margin: "0 auto",
    padding:
      "80px 25px 60px",
    textAlign: "center",
    position: "relative",
    zIndex: 1
  },


  badge: {
    display: "inline-block",
    padding: "9px 16px",
    borderRadius: "30px",
    background: "#E9DECF",
    color: "#896C4C",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "2px",
    marginBottom: "25px"
  },


  title: {
    fontSize: "64px",
    lineHeight: "1.05",
    letterSpacing: "-2px",
    margin: 0,
    color: "#30271F",
    fontWeight: "850"
  },


  titleAccent: {
    color: "#9A7854"
  },


  description: {
    maxWidth: "650px",
    margin:
      "25px auto 0",
    color: "#75695E",
    fontSize: "17px",
    lineHeight: "1.7"
  },


  buttons: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "14px",
    marginTop: "35px",
    flexWrap: "wrap"
  },


  primaryButton: {
    textDecoration: "none",
    background: "#493B30",
    color: "#FBF8F2",
    padding: "15px 23px",
    borderRadius: "14px",
    fontSize: "14px",
    fontWeight: "750",
    boxShadow:
      "0 12px 25px rgba(73,59,48,0.18)",
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },


  arrow: {
    fontSize: "18px"
  },


  secondaryButton: {
    textDecoration: "none",
    background: "#FBF8F2",
    color: "#493B30",
    border:
      "1px solid #DCCFBE",
    padding: "14px 21px",
    borderRadius: "14px",
    fontSize: "14px",
    fontWeight: "650"
  },


  features: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "18px",
    marginTop: "75px",
    textAlign: "left"
  },


  featureCard: {
    background: "#FBF8F2",
    border:
      "1px solid #E1D5C5",
    borderRadius: "22px",
    padding: "25px",
    boxShadow:
      "0 12px 35px rgba(73,59,48,0.06)"
  },


  featureIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "13px",
    background: "#EEE4D5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    marginBottom: "18px"
  },


  featureTitle: {
    margin: 0,
    color: "#493B30",
    fontSize: "17px"
  },


  featureText: {
    margin:
      "8px 0 0",
    color: "#7D7063",
    fontSize: "13px",
    lineHeight: "1.6"
  },


  footer: {
    maxWidth: "1050px",
    margin: "0 auto",
    padding:
      "20px 25px 30px",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    color: "#9A8C7D",
    fontSize: "11px",
    position: "relative",
    zIndex: 1
  }
};


export default LandingPage;