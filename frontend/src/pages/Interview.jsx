import { useState } from "react";
import api from "../services/api";

function Interview() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sessionId, setSessionId] = useState(null);

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");

  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // ==============================
  // START TECHNICAL INTERVIEW
  // ==============================

  const startInterview = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("You are not logged in. Please login first.");
        return;
      }

      // Create TECHNICAL session
      const sessionResponse = await api.post(
        "/api/interview/session",
        {
          interview_type: "technical",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!sessionResponse.data.success) {
        setError("Failed to create technical interview session.");
        return;
      }

      const newSessionId = sessionResponse.data.session.id;

      setSessionId(newSessionId);

      // Load TECHNICAL questions
      const questionResponse = await api.post(
        "/api/interview/start",
        {
          count: 20,
          round: "technical",
        }
      );

      if (!questionResponse.data.success) {
        setError("Failed to load technical interview questions.");
        return;
      }

      setQuestions(questionResponse.data.questions);
      setCurrentIndex(0);
      setAnswers({});
      setInterviewStarted(true);

    } catch (error) {
      console.error("Technical interview start error:", error);

      setError(
        error.response?.data?.message ||
          "Something went wrong while starting the technical interview."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // ANSWER CHANGE
  // ==============================

  const handleAnswerChange = (event) => {
    const newAnswer = event.target.value;

    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questions[currentIndex].id]: newAnswer,
    }));
  };

  // ==============================
  // VOICE INPUT
  // ==============================

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      setAnswers((previousAnswers) => ({
        ...previousAnswers,
        [questions[currentIndex].id]: transcript,
      }));
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      if (event.error === "not-allowed") {
        setError(
          "Microphone permission was denied. Please allow microphone access."
        );
      } else {
        setError(
          "Voice input could not be started. Please try again."
        );
      }

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // ==============================
  // SAVE ANSWER
  // ==============================

  const saveCurrentAnswer = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      return false;
    }

    const currentQuestion = questions[currentIndex];

    const currentAnswer =
      answers[currentQuestion.id] || "";

    try {
      setSaving(true);

      const response = await api.post(
        "/api/interview/answer",
        {
          session_id: sessionId,
          question_id: currentQuestion.id,
          answer: currentAnswer,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        setError("Failed to save your answer.");
        return false;
      }

      return true;

    } catch (error) {
      console.error(
        "Technical answer save error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Something went wrong while saving your answer."
      );

      return false;

    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // NEXT
  // ==============================

  const handleNext = async () => {
    const saved = await saveCurrentAnswer();

    if (!saved) {
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // ==============================
  // PREVIOUS
  // ==============================

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // ==============================
  // FINISH
  // ==============================

  const handleFinish = async () => {
    try {
      setFinishing(true);
      setError("");

      const saved = await saveCurrentAnswer();

      if (!saved) {
        return;
      }

      const token = localStorage.getItem("access_token");

      const response = await api.put(
        `/api/interview/session/${sessionId}/finish`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        setError(
          "Failed to finish the technical interview."
        );
        return;
      }

      localStorage.setItem(
        "completed_session_id",
        String(sessionId)
      );

      alert(
        "Technical Interview completed successfully! 🎉"
      );

      // HashRouter navigation
      window.location.hash = "#/feedback";

    } catch (error) {
      console.error(
        "Technical interview finish error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Something went wrong while finishing the technical interview."
      );

    } finally {
      setFinishing(false);
    }
  };

  // ==============================
  // STYLES
  // ==============================

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F3EDE3",
      color: "#30271F",
      fontFamily:
        "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: "35px 20px 60px",
      boxSizing: "border-box",
    },

    wrapper: {
      width: "100%",
      maxWidth: "900px",
      margin: "0 auto",
    },

    brand: {
      textAlign: "center",
      marginBottom: "30px",
    },

    brandSmall: {
      margin: 0,
      fontSize: "12px",
      fontWeight: "700",
      letterSpacing: "3px",
      textTransform: "uppercase",
      color: "#B89B7A",
    },

    brandTitle: {
      margin: "7px 0 0",
      fontSize: "38px",
      fontWeight: "600",
      color: "#493B30",
    },

    card: {
      background: "#FBF8F2",
      border: "1px solid #E1D5C5",
      borderRadius: "28px",
      padding: "42px",
      boxShadow:
        "0 20px 55px rgba(73, 59, 48, 0.10)",
    },

    centerCard: {
      textAlign: "center",
      padding: "65px 45px",
    },

    subtitle: {
      color: "#7D7063",
      fontSize: "16px",
      lineHeight: "1.6",
      margin: "10px auto 30px",
      maxWidth: "550px",
    },

    primaryButton: {
      border: "none",
      borderRadius: "13px",
      padding: "15px 30px",
      background: "#493B30",
      color: "#FBF8F2",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      boxShadow:
        "0 8px 20px rgba(73, 59, 48, 0.18)",
    },

    error: {
      background: "#F5E0DC",
      border: "1px solid #D8A9A0",
      color: "#8A4035",
      borderRadius: "11px",
      padding: "12px 15px",
      fontSize: "14px",
      lineHeight: "1.5",
      marginBottom: "20px",
    },

    progressTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "18px",
      gap: "15px",
    },

    questionNumber: {
      margin: 0,
      fontSize: "14px",
      fontWeight: "700",
      color: "#B89B7A",
      letterSpacing: "1px",
      textTransform: "uppercase",
    },

    sessionText: {
      margin: 0,
      fontSize: "12px",
      color: "#9B8D7D",
    },

    progressBar: {
      height: "7px",
      background: "#E8DECF",
      borderRadius: "20px",
      overflow: "hidden",
      marginBottom: "35px",
    },

    progressFill: {
      height: "100%",
      background: "#B89B7A",
      borderRadius: "20px",
      transition: "width 0.3s ease",
    },

    question: {
      margin: "0 0 25px",
      fontSize: "28px",
      lineHeight: "1.4",
      fontWeight: "600",
      color: "#493B30",
    },

    textarea: {
      width: "100%",
      minHeight: "220px",
      boxSizing: "border-box",
      resize: "vertical",
      border: "1px solid #D8C5AC",
      borderRadius: "16px",
      background: "#F3EDE3",
      color: "#30271F",
      padding: "18px",
      fontSize: "16px",
      lineHeight: "1.7",
      outline: "none",
      fontFamily: "inherit",
    },

    voiceRow: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginTop: "15px",
      flexWrap: "wrap",
    },

    voiceButton: {
      border: "1px solid #D8C5AC",
      borderRadius: "12px",
      background: "#FBF8F2",
      color: "#493B30",
      padding: "12px 18px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
    },

    listeningButton: {
      background: "#493B30",
      color: "#FBF8F2",
    },

    voiceInfo: {
      fontSize: "13px",
      color: "#7D7063",
    },

    navigation: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "30px",
      gap: "15px",
    },

    secondaryButton: {
      border: "1px solid #D8C5AC",
      borderRadius: "12px",
      background: "#FBF8F2",
      color: "#493B30",
      padding: "13px 22px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
    },

    finishButton: {
      border: "none",
      borderRadius: "12px",
      background: "#493B30",
      color: "#FBF8F2",
      padding: "13px 25px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
    },

    disabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  };

  // ==============================
  // START SCREEN
  // ==============================

  if (!interviewStarted && !loading) {
    return (
      <div style={styles.page}>
        <div style={styles.wrapper}>

          <div style={styles.brand}>
            <p style={styles.brandSmall}>
              AI Mock Interview
            </p>

            <h1 style={styles.brandTitle}>
              Technical Interview
            </h1>
          </div>

          <div
            style={{
              ...styles.card,
              ...styles.centerCard,
            }}
          >
            <div style={{ fontSize: "48px" }}>
              🎯
            </div>

            <h2
              style={{
                margin: "15px 0 0",
                color: "#493B30",
                fontSize: "30px",
                fontWeight: "600",
              }}
            >
              Technical Round
            </h2>

            <p style={styles.subtitle}>
              Practice technical interview questions
              covering programming, databases, APIs,
              and core IT concepts.
            </p>

            <p
              style={{
                color: "#7D7063",
                fontSize: "15px",
                marginBottom: "28px",
              }}
            >
              <strong>20 questions</strong> · Voice input · AI feedback
            </p>

            {error && (
              <div style={styles.error}>
                {error}
              </div>
            )}

            <button
              onClick={startInterview}
              style={styles.primaryButton}
            >
              Start Technical Interview →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.wrapper}>
          <div
            style={{
              ...styles.card,
              ...styles.centerCard,
            }}
          >
            <div style={{ fontSize: "45px" }}>
              ⏳
            </div>

            <h1
              style={{
                color: "#493B30",
                fontSize: "30px",
                margin: "20px 0 10px",
              }}
            >
              Starting Technical Interview...
            </h1>

            <p style={styles.subtitle}>
              Preparing your technical questions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // ERROR
  // ==============================

  if (error && questions.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.wrapper}>
          <div
            style={{
              ...styles.card,
              ...styles.centerCard,
            }}
          >
            <div style={{ fontSize: "45px" }}>
              ⚠️
            </div>

            <h1
              style={{
                color: "#493B30",
                fontSize: "30px",
                margin: "20px 0 10px",
              }}
            >
              Technical Interview Error
            </h1>

            <p style={styles.subtitle}>
              {error}
            </p>

            <button
              onClick={startInterview}
              style={styles.primaryButton}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // NO QUESTIONS
  // ==============================

  if (questions.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.wrapper}>
          <div
            style={{
              ...styles.card,
              ...styles.centerCard,
            }}
          >
            <div style={{ fontSize: "45px" }}>
              📭
            </div>

            <h1
              style={{
                color: "#493B30",
                fontSize: "30px",
              }}
            >
              No Technical Questions Available
            </h1>

            <p style={styles.subtitle}>
              Technical questions are not available right now.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const progress =
    ((currentIndex + 1) / questions.length) * 100;

  // ==============================
  // INTERVIEW SCREEN
  // ==============================

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>

        <div style={styles.brand}>
          <p style={styles.brandSmall}>
            AI Mock Interview
          </p>

          <h1 style={styles.brandTitle}>
            Technical Interview
          </h1>
        </div>

        <div style={styles.card}>

          <div style={styles.progressTop}>
            <p style={styles.questionNumber}>
              Technical Question {currentIndex + 1} /{" "}
              {questions.length}
            </p>

            <p style={styles.sessionText}>
              Session #{sessionId}
            </p>
          </div>

          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${progress}%`,
              }}
            />
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <h2 style={styles.question}>
            {currentQuestion.questions}
          </h2>

          <textarea
            value={answers[currentQuestion.id] || ""}
            onChange={handleAnswerChange}
            placeholder="Type your technical answer here..."
            style={styles.textarea}
          />

          <div style={styles.voiceRow}>
            <button
              onClick={startVoiceInput}
              disabled={
                saving ||
                finishing ||
                isListening
              }
              style={{
                ...styles.voiceButton,
                ...(isListening
                  ? styles.listeningButton
                  : {}),
                ...(saving ||
                finishing ||
                isListening
                  ? styles.disabled
                  : {}),
              }}
            >
              {isListening
                ? "🎤 Listening..."
                : "🎤 Speak Answer"}
            </button>

            <span style={styles.voiceInfo}>
              Speak your answer and edit the transcript if needed.
            </span>
          </div>

          {!speechSupported && (
            <div
              style={{
                ...styles.error,
                marginTop: "15px",
              }}
            >
              Voice input is not supported in this browser.
            </div>
          )}

          <div style={styles.navigation}>

            <button
              onClick={handlePrevious}
              disabled={
                currentIndex === 0 ||
                saving ||
                finishing ||
                isListening
              }
              style={{
                ...styles.secondaryButton,
                ...(currentIndex === 0 ||
                saving ||
                finishing ||
                isListening
                  ? styles.disabled
                  : {}),
              }}
            >
              ← Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={
                  saving ||
                  finishing ||
                  isListening
                }
                style={{
                  ...styles.finishButton,
                  ...(saving ||
                  finishing ||
                  isListening
                    ? styles.disabled
                    : {}),
                }}
              >
                {saving ? "Saving..." : "Next →"}
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={
                  saving ||
                  finishing ||
                  isListening
                }
                style={{
                  ...styles.finishButton,
                  ...(saving ||
                  finishing ||
                  isListening
                    ? styles.disabled
                    : {}),
                }}
              >
                {finishing
                  ? "Finishing..."
                  : "Finish Technical Interview ✓"}
              </button>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

export default Interview;