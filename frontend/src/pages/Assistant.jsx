import { useState } from "react";
import api from "../services/api";

function Assistant() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your AI Interview Assistant. Ask me anything about interview preparation, technical questions, HR questions, or improving your answers."
    }
  ]);
  const [loading, setLoading] = useState(false);

  const suggestions = [
    "How can I improve my interview answers?",
    "How should I answer 'Tell me about yourself'?",
    "Give me Python interview tips.",
    "How do I answer my weakness question?"
  ];

  const sendMessage = async (text = message) => {
    const trimmedMessage = text.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    setMessage("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: trimmedMessage
      }
    ]);

    try {
      setLoading(true);

      const token = localStorage.getItem("access_token");

      const response = await api.post(
        "/api/ai/assistant",
        {
          message: trimmedMessage
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: response.data.reply
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Sorry, I couldn't process that. Please try again."
          }
        ]);
      }

    } catch (error) {
      console.error("Assistant error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            error.response?.data?.message ||
            "Something went wrong. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div style={styles.page}>

      {/* HEADER */}

      <div style={styles.header}>

        <div>
          <p style={styles.eyebrow}>
            AI INTERVIEW ASSISTANT
          </p>

          <h1 style={styles.title}>
            Your interview companion.
          </h1>

          <p style={styles.subtitle}>
            Ask questions, practise answers and get
            personalised interview guidance.
          </p>
        </div>

        <div style={styles.aiBadge}>
          <span style={styles.aiDot}></span>
          Gemini AI
        </div>

      </div>


      {/* CHAT CARD */}

      <div style={styles.chatCard}>

        {/* MESSAGES */}

        <div style={styles.messages}>

          {messages.map((item, index) => (
            <div
              key={index}
              style={{
                ...styles.messageRow,
                justifyContent:
                  item.role === "user"
                    ? "flex-end"
                    : "flex-start"
              }}
            >

              {item.role === "assistant" && (
                <div style={styles.avatar}>
                  ✦
                </div>
              )}

              <div
                style={
                  item.role === "user"
                    ? styles.userMessage
                    : styles.assistantMessage
                }
              >
                {item.text}
              </div>

            </div>
          ))}


          {/* LOADING */}

          {loading && (
            <div style={styles.messageRow}>

              <div style={styles.avatar}>
                ✦
              </div>

              <div style={styles.assistantMessage}>
                <span style={styles.loadingText}>
                  Thinking...
                </span>
              </div>

            </div>
          )}

        </div>


        {/* SUGGESTIONS */}

        {messages.length === 1 && !loading && (
          <div style={styles.suggestionsSection}>

            <p style={styles.suggestionTitle}>
              Try asking
            </p>

            <div style={styles.suggestions}>

              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(suggestion)}
                  style={styles.suggestionButton}
                >
                  {suggestion}
                </button>
              ))}

            </div>

          </div>
        )}


        {/* INPUT */}

        <form
          onSubmit={handleSubmit}
          style={styles.inputArea}
        >

          <input
            type="text"
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            placeholder="Ask your interview question..."
            disabled={loading}
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading || !message.trim()}
            style={{
              ...styles.sendButton,
              ...(loading || !message.trim()
                ? styles.disabledButton
                : {})
            }}
          >
            {loading ? "..." : "Send"}
          </button>

        </form>

      </div>


      {/* FOOTER NOTE */}

      <p style={styles.footer}>
        AI-generated responses are for interview
        preparation and practice.
      </p>

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
    padding: "50px 7%",
    boxSizing: "border-box",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#30271F"
  },

  header: {
    maxWidth: "1050px",
    margin: "0 auto 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px"
  },

  eyebrow: {
    margin: "0 0 8px",
    fontSize: "10px",
    letterSpacing: "2.5px",
    fontWeight: "800",
    color: "#9A7854"
  },

  title: {
    margin: 0,
    fontSize: "34px",
    lineHeight: "1.15",
    fontWeight: "800",
    color: "#30271F"
  },

  subtitle: {
    margin: "10px 0 0",
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#7D7063"
  },

  aiBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 14px",
    borderRadius: "30px",
    background: "#FBF8F2",
    border: "1px solid #E1D5C5",
    fontSize: "12px",
    fontWeight: "700",
    color: "#493B30",
    whiteSpace: "nowrap"
  },

  aiDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#9A7854"
  },

  chatCard: {
    maxWidth: "1050px",
    height: "650px",
    margin: "0 auto",
    background: "#FBF8F2",
    border: "1px solid #E1D5C5",
    borderRadius: "24px",
    boxShadow:
      "0 20px 55px rgba(73,59,48,0.10)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },

  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  },

  messageRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    width: "100%"
  },

  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "11px",
    background: "#493B30",
    color: "#D8C5AC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "15px",
    flexShrink: 0
  },

  assistantMessage: {
    maxWidth: "70%",
    background: "#F3EDE3",
    border: "1px solid #E1D5C5",
    borderRadius: "4px 16px 16px 16px",
    padding: "13px 16px",
    fontSize: "14px",
    lineHeight: "1.65",
    color: "#493B30",
    whiteSpace: "pre-wrap"
  },

  userMessage: {
    maxWidth: "70%",
    background: "#493B30",
    color: "#FBF8F2",
    borderRadius: "16px 4px 16px 16px",
    padding: "13px 16px",
    fontSize: "14px",
    lineHeight: "1.65",
    whiteSpace: "pre-wrap"
  },

  loadingText: {
    color: "#8B7D70",
    fontStyle: "italic"
  },

  suggestionsSection: {
    padding: "0 30px 20px"
  },

  suggestionTitle: {
    margin: "0 0 10px",
    fontSize: "11px",
    fontWeight: "800",
    color: "#8B7D70",
    textTransform: "uppercase",
    letterSpacing: "1px"
  },

  suggestions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px"
  },

  suggestionButton: {
    background: "#FFFDF9",
    border: "1px solid #DCCFBE",
    color: "#493B30",
    borderRadius: "20px",
    padding: "9px 13px",
    fontSize: "12px",
    cursor: "pointer"
  },

  inputArea: {
    display: "flex",
    gap: "10px",
    padding: "18px 20px",
    borderTop: "1px solid #E1D5C5",
    background: "#FFFDF9"
  },

  input: {
    flex: 1,
    minWidth: 0,
    border: "1px solid #DCCFBE",
    borderRadius: "13px",
    padding: "13px 15px",
    fontSize: "14px",
    color: "#30271F",
    background: "#FBF8F2",
    outline: "none"
  },

  sendButton: {
    border: "none",
    borderRadius: "13px",
    padding: "0 23px",
    background: "#493B30",
    color: "#FBF8F2",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer"
  },

  disabledButton: {
    opacity: 0.45,
    cursor: "not-allowed"
  },

  footer: {
    maxWidth: "1050px",
    margin: "14px auto 0",
    textAlign: "center",
    fontSize: "11px",
    color: "#9A8C7D"
  }
};

export default Assistant;