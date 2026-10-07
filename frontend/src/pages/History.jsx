import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function History() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await api.get("/api/interview/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setHistory(response.data.history || []);
      } catch (err) {
        console.error(err);

        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }

        setError("Unable to load interview history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const openFeedback = (sessionId) => {
    localStorage.setItem("completed_session_id", sessionId);
    navigate("/feedback");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F3EDE3",
        color: "#30271F",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "35px",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "34px",
                color: "#493B30",
              }}
            >
              Interview History
            </h1>

            <p
              style={{
                color: "#7D7063",
                marginTop: "8px",
              }}
            >
              Review your previous mock interview sessions.
            </p>
          </div>

          <Link
            to="/interview"
            style={{
              textDecoration: "none",
              background: "#B89B7A",
              color: "#FBF8F2",
              padding: "12px 20px",
              borderRadius: "10px",
              fontWeight: "600",
            }}
          >
            + New Interview
          </Link>
        </div>

        {loading && (
          <div
            style={{
              background: "#FBF8F2",
              padding: "30px",
              borderRadius: "16px",
              textAlign: "center",
            }}
          >
            Loading your history...
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              background: "#FBF8F2",
              padding: "25px",
              borderRadius: "16px",
              color: "#9B3D32",
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div
            style={{
              background: "#FBF8F2",
              padding: "50px 30px",
              borderRadius: "16px",
              textAlign: "center",
              border: "1px solid #E1D5C5",
            }}
          >
            <h2>No interviews yet</h2>

            <p style={{ color: "#7D7063" }}>
              Complete your first mock interview and it will appear here.
            </p>

            <Link
              to="/interview"
              style={{
                display: "inline-block",
                marginTop: "15px",
                textDecoration: "none",
                background: "#B89B7A",
                color: "#FBF8F2",
                padding: "12px 22px",
                borderRadius: "10px",
                fontWeight: "600",
              }}
            >
              Start Interview
            </Link>
          </div>
        )}

        {!loading &&
          !error &&
          history.map((item, index) => (
            <div
              key={item.session_id}
              style={{
                background: "#FBF8F2",
                border: "1px solid #E1D5C5",
                borderRadius: "16px",
                padding: "25px",
                marginBottom: "18px",
                boxShadow: "0 5px 18px rgba(73, 59, 48, 0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      color: "#493B30",
                    }}
                  >
                    Interview #{history.length - index}
                  </h2>

                  <p
                    style={{
                      color: "#7D7063",
                      margin: "8px 0",
                    }}
                  >
                    {new Date(item.started_at).toLocaleString()}
                  </p>
                </div>

                <div
                  style={{
                    fontSize: "30px",
                    fontWeight: "700",
                    color: "#493B30",
                  }}
                >
                  {item.overall_score !== null
                    ? `${item.overall_score}/100`
                    : "N/A"}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "25px",
                  flexWrap: "wrap",
                  marginTop: "20px",
                  color: "#7D7063",
                }}
              >
                <span>
                  📝 {item.question_count} questions
                </span>

                <span>
                  🤖 {item.evaluated_count} evaluated
                </span>

                <span>
                  📌 {item.status}
                </span>
              </div>

              {item.overall_score !== null && (
                <button
                  onClick={() => openFeedback(item.session_id)}
                  style={{
                    marginTop: "20px",
                    border: "none",
                    background: "#D8C5AC",
                    color: "#493B30",
                    padding: "11px 18px",
                    borderRadius: "9px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  View Feedback →
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default History;