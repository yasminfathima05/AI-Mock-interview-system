import { useEffect, useState } from "react";
import api from "../services/api";

function Feedback() {
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [overallScore, setOverallScore] = useState(0);

  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");
      const sessionId = localStorage.getItem(
        "completed_session_id"
      );

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      if (!sessionId) {
        setError("No completed interview was found.");
        return;
      }

      console.log(
        "Loading answers for session:",
        sessionId
      );

      const response = await api.get(
        `/api/interview/session/${sessionId}/answers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        setError(
          "Could not load your interview answers."
        );
        return;
      }

      const answers = response.data.answers || [];

      console.log(
        "Answers received:",
        answers.length
      );

      if (answers.length === 0) {
        setError(
          "No answers were found for this interview."
        );
        return;
      }

      await evaluateAnswers(
        answers,
        sessionId,
        token
      );
    } catch (error) {
      console.error(
        "Feedback loading error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Something went wrong while loading feedback."
      );
    } finally {
      setLoading(false);
    }
  };

  const createFailedFeedback = () => ({
    evaluationFailed: true,
    score: null,
    strengths: [
      "AI evaluation was unavailable for this response.",
    ],
    improvements: [
      "This answer could not be evaluated because the AI service did not return feedback.",
    ],
    better_answer:
      "No improved answer is available.",
  });

  const createEmptyAnswerFeedback = () => ({
    evaluationFailed: false,
    score: 0,
    strengths: [
      "No answer was provided.",
    ],
    improvements: [
      "Try to answer every interview question.",
    ],
    better_answer:
      "Provide a clear and relevant answer to the question.",
  });

  const evaluateSingleAnswer = async (
    item,
    sessionId,
    token
  ) => {
    try {
      console.log(
        "Trying individual evaluation for question:",
        item.question_id
      );

      const response = await api.post(
        "/api/ai/feedback",
        {
          session_id: Number(sessionId),
          question_id: item.question_id,
          question: item.question,
          answer: item.answer,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.data?.success &&
        response.data?.feedback
      ) {
        const feedback =
          response.data.feedback;

        return {
          score:
            typeof feedback.score === "number"
              ? feedback.score
              : Number(feedback.score),

          strengths: Array.isArray(
            feedback.strengths
          )
            ? feedback.strengths
            : [],

          improvements: Array.isArray(
            feedback.improvements
          )
            ? feedback.improvements
            : [],

          better_answer:
            feedback.better_answer ||
            "No improved answer available.",

          evaluationFailed: false,
        };
      }

      return createFailedFeedback();
    } catch (error) {
      console.error(
        "Individual evaluation failed:",
        error
      );

      return createFailedFeedback();
    }
  };

  const evaluateAnswers = async (
    answers,
    sessionId,
    token
  ) => {
    try {
      setEvaluating(true);
      setError("");

      const allResults = [];
      const nonEmptyAnswers = [];

      answers.forEach((item) => {
        if (
          !item.answer ||
          !item.answer.trim()
        ) {
          allResults.push({
            ...item,
            feedback:
              createEmptyAnswerFeedback(),
          });
        } else {
          nonEmptyAnswers.push(item);
        }
      });

      console.log(
        "Answers requiring AI evaluation:",
        nonEmptyAnswers.length
      );

      const batchSize = 5;

      for (
        let i = 0;
        i < nonEmptyAnswers.length;
        i += batchSize
      ) {
        const batch =
          nonEmptyAnswers.slice(
            i,
            i + batchSize
          );

        const batchNumber =
          Math.floor(i / batchSize) + 1;

        const totalBatches =
          Math.ceil(
            nonEmptyAnswers.length /
              batchSize
          );

        console.log(
          `Evaluating batch ${batchNumber}/${totalBatches}`
        );

        let batchWorked = false;

        try {
          const response =
            await api.post(
              "/api/ai/feedback-batch",
              {
                session_id:
                  Number(sessionId),

                answers: batch.map(
                  (item) => ({
                    question_id:
                      item.question_id,
                    question:
                      item.question,
                    answer:
                      item.answer,
                  })
                ),
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

          console.log(
            "Batch response:",
            response.data
          );

          if (
            response.data?.success &&
            Array.isArray(
              response.data?.results
            ) &&
            response.data.results
              .length > 0
          ) {
            batchWorked = true;

            batch.forEach((item) => {
              const generatedFeedback =
                response.data.results.find(
                  (result) =>
                    Number(
                      result.question_id
                    ) ===
                    Number(
                      item.question_id
                    )
                );

              if (
                generatedFeedback &&
                generatedFeedback.evaluationFailed !==
                  true
              ) {
                allResults.push({
                  ...item,

                  feedback: {
                    score: Number(
                      generatedFeedback.score
                    ),

                    strengths:
                      Array.isArray(
                        generatedFeedback.strengths
                      )
                        ? generatedFeedback.strengths
                        : [],

                    improvements:
                      Array.isArray(
                        generatedFeedback.improvements
                      )
                        ? generatedFeedback.improvements
                        : [],

                    better_answer:
                      generatedFeedback.better_answer ||
                      "No improved answer available.",

                    evaluationFailed: false,
                  },
                });
              } else {
                allResults.push({
                  ...item,
                  feedback:
                    createFailedFeedback(),
                });
              }
            });
          }
        } catch (error) {
          console.error(
            `Batch ${batchNumber} failed:`,
            error
          );
        }

        if (!batchWorked) {
          console.log(
            `Batch ${batchNumber} failed. Using individual evaluation fallback.`
          );

          for (const item of batch) {
            const feedback =
              await evaluateSingleAnswer(
                item,
                sessionId,
                token
              );

            allResults.push({
              ...item,
              feedback,
            });

            await new Promise(
              (resolve) =>
                setTimeout(resolve, 700)
            );
          }
        }

        if (
          i + batchSize <
          nonEmptyAnswers.length
        ) {
          await new Promise(
            (resolve) =>
              setTimeout(resolve, 1000)
          );
        }
      }

      const orderedResults =
        answers.map(
          (originalItem) => {
            const matchingResult =
              allResults.find(
                (result) =>
                  Number(
                    result.question_id
                  ) ===
                  Number(
                    originalItem.question_id
                  )
              );

            return (
              matchingResult || {
                ...originalItem,
                feedback:
                  createFailedFeedback(),
              }
            );
          }
        );

      console.log(
        "Final feedback results:",
        orderedResults
      );

      setFeedbackItems(
        orderedResults
      );

      const validScores =
        orderedResults
          .filter(
            (item) =>
              item.feedback &&
              item.feedback
                .evaluationFailed !==
                true &&
              typeof item.feedback
                .score === "number" &&
              Number.isFinite(
                item.feedback.score
              )
          )
          .map(
            (item) =>
              item.feedback.score
          );

      console.log(
        "Valid AI scores:",
        validScores
      );

      if (
        validScores.length > 0
      ) {
        const total =
          validScores.reduce(
            (sum, score) =>
              sum + score,
            0
          );

        const average =
          total /
          validScores.length;

        const roundedAverage =
          Math.round(average);

        console.log(
          "AI evaluated questions:",
          validScores.length
        );

        console.log(
          "Overall score:",
          roundedAverage
        );

        setOverallScore(
          roundedAverage
        );
      } else {
        setOverallScore(0);
      }
    } catch (error) {
      console.error(
        "AI evaluation error:",
        error
      );

      setError(
        "Unable to generate interview feedback."
      );
    } finally {
      setEvaluating(false);
    }
  };

  if (loading || evaluating) {
    return (
      <div style={styles.page}>
        <div style={styles.decorOne}></div>
        <div style={styles.decorTwo}></div>

        <div style={styles.loadingCard}>
          <div style={styles.aiIcon}>
            ✦
          </div>

          <p style={styles.eyebrow}>
            AI INTERVIEW ANALYSIS
          </p>

          <h1 style={styles.loadingTitle}>
            {evaluating
              ? "Your answers are being evaluated..."
              : "Preparing your feedback..."}
          </h1>

          <p style={styles.loadingText}>
            Gemini is reviewing your
            interview responses and
            preparing personalised
            feedback.
          </p>

          <div
            style={styles.loadingLine}
          ></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.errorIcon}>
            !
          </div>

          <p style={styles.eyebrow}>
            INTERVIEW FEEDBACK
          </p>

          <h1 style={styles.loadingTitle}>
            We couldn't load your feedback
          </h1>

          <p style={styles.errorText}>
            {error}
          </p>

          <button
            onClick={loadFeedback}
            style={styles.primaryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.decorOne}></div>
      <div style={styles.decorTwo}></div>

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>
              AI INTERVIEW FEEDBACK
            </p>

            <h1 style={styles.title}>
              Your Interview Review
            </h1>

            <p style={styles.subtitle}>
              A detailed look at your
              answers, strengths and
              areas to improve.
            </p>
          </div>

          <div style={styles.scoreCard}>
            <p style={styles.scoreLabel}>
              OVERALL SCORE
            </p>

            <div style={styles.score}>
              {overallScore}

              <span
                style={
                  styles.scoreCardSpan
                }
              >
                /100
              </span>
            </div>

            <p style={styles.scoreCaption}>
              AI evaluated
            </p>
          </div>
        </div>

        <div style={styles.overviewCard}>
          <div>
            <p
              style={
                styles.overviewLabel
              }
            >
              INTERVIEW SUMMARY
            </p>

            <h2
              style={
                styles.overviewTitle
              }
            >
              You've completed your
              interview.
            </h2>

            <p
              style={
                styles.overviewText
              }
            >
              Review each response below
              to understand what you did
              well and where you can
              improve.
            </p>
          </div>

          <div
            style={
              styles.summaryNumber
            }
          >
            <strong
              style={
                styles.summaryNumberStrong
              }
            >
              {feedbackItems.length}
            </strong>

            <span>Questions</span>
          </div>
        </div>

        <div style={styles.sectionHeader}>
          <div>
            <p style={styles.eyebrow}>
              QUESTION BY QUESTION
            </p>

            <h2 style={styles.sectionTitle}>
              Detailed Feedback
            </h2>
          </div>
        </div>

        {feedbackItems.map(
          (item, index) => {
            const feedback =
              item.feedback || {};

            const score =
              typeof feedback.score ===
              "number"
                ? feedback.score
                : null;

            const evaluationFailed =
              feedback.evaluationFailed ===
              true;

            return (
              <div
                key={
                  item.answer_id ||
                  item.question_id ||
                  index
                }
                style={
                  styles.feedbackCard
                }
              >
                <div
                  style={
                    styles.questionTop
                  }
                >
                  <div>
                    <span
                      style={
                        styles.questionNumber
                      }
                    >
                      QUESTION{" "}
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <h3
                      style={
                        styles.question
                      }
                    >
                      {item.question}
                    </h3>
                  </div>

                  <div
                    style={{
                      ...styles.questionScore,

                      ...(evaluationFailed
                        ? styles.unavailableScore
                        : score >= 70
                        ? styles.goodScore
                        : score >= 40
                        ? styles.mediumScore
                        : styles.lowScore),
                    }}
                  >
                    {evaluationFailed
                      ? "N/A"
                      : score}
                  </div>
                </div>

                <div
                  style={
                    styles.answerBox
                  }
                >
                  <p
                    style={
                      styles.boxLabel
                    }
                  >
                    YOUR ANSWER
                  </p>

                  <p
                    style={
                      styles.answerText
                    }
                  >
                    {item.answer ||
                      "No answer provided."}
                  </p>
                </div>

                <div
                  style={
                    styles.feedbackGrid
                  }
                >
                  <div
                    style={
                      styles.feedbackSection
                    }
                  >
                    <p
                      style={
                        styles.boxLabel
                      }
                    >
                      WHAT YOU DID WELL
                    </p>

                    <ul
                      style={styles.list}
                    >
                      {(
                        feedback.strengths ||
                        []
                      ).map(
                        (
                          strength,
                          strengthIndex
                        ) => (
                          <li
                            key={
                              strengthIndex
                            }
                            style={
                              styles.listItem
                            }
                          >
                            {strength}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div
                    style={
                      styles.feedbackSection
                    }
                  >
                    <p
                      style={
                        styles.boxLabel
                      }
                    >
                      AREAS TO IMPROVE
                    </p>

                    <ul
                      style={styles.list}
                    >
                      {(
                        feedback.improvements ||
                        []
                      ).map(
                        (
                          improvement,
                          improvementIndex
                        ) => (
                          <li
                            key={
                              improvementIndex
                            }
                            style={
                              styles.listItem
                            }
                          >
                            {improvement}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>

                <div
                  style={
                    styles.betterAnswer
                  }
                >
                  <p
                    style={
                      styles.boxLabel
                    }
                  >
                    SUGGESTED BETTER ANSWER
                  </p>

                  <p
                    style={
                      styles.betterAnswerText
                    }
                  >
                    {feedback.better_answer ||
                      "No improved answer available."}
                  </p>
                </div>
              </div>
            );
          }
        )}

        <div
          style={styles.navigation}
        >
          <button
            onClick={() => {
              window.location.hash =
                "#/dashboard";
            }}
            style={styles.navButton}
          >
            ← Dashboard
          </button>

          <button
            onClick={() => {
              window.location.hash =
                "#/interview";
            }}
            style={
              styles.primaryNavButton
            }
          >
            🎤 New Interview
          </button>
        </div>

        <div style={styles.footer}>
          <p>
            ✦ Feedback generated by your
            AI interview evaluator
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F3EDE3",
    color: "#30271F",
    padding: "50px 20px",
    boxSizing: "border-box",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  },

  decorOne: {
    position: "fixed",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "#D8C5AC",
    opacity: 0.25,
    filter: "blur(100px)",
    top: "-180px",
    left: "-150px",
    pointerEvents: "none",
  },

  decorTwo: {
    position: "fixed",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "#B89B7A",
    opacity: 0.15,
    filter: "blur(110px)",
    bottom: "-160px",
    right: "-100px",
    pointerEvents: "none",
  },

  container: {
    maxWidth: "1050px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "30px",
    marginBottom: "35px",
  },

  eyebrow: {
    fontSize: "11px",
    letterSpacing: "3px",
    color: "#9A7854",
    fontWeight: "800",
    margin: "0 0 10px",
  },

  title: {
    fontSize: "38px",
    lineHeight: "1.15",
    margin: 0,
    color: "#30271F",
    fontWeight: "800",
  },

  subtitle: {
    color: "#7D7063",
    fontSize: "15px",
    marginTop: "12px",
    lineHeight: "1.6",
  },

  scoreCard: {
    minWidth: "170px",
    padding: "24px",
    background: "#FBF8F2",
    border: "1px solid #E1D5C5",
    borderRadius: "22px",
    textAlign: "center",
    boxShadow:
      "0 15px 40px rgba(73,59,48,0.08)",
  },

  scoreLabel: {
    fontSize: "10px",
    letterSpacing: "2px",
    color: "#9A7854",
    fontWeight: "800",
    margin: 0,
  },

  score: {
    fontSize: "45px",
    fontWeight: "800",
    color: "#493B30",
    marginTop: "5px",
  },

  scoreCardSpan: {
    fontSize: "16px",
    color: "#9A8C7D",
  },

  scoreCaption: {
    margin: "3px 0 0",
    color: "#9A8C7D",
    fontSize: "12px",
  },

  overviewCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "30px",
    padding: "30px",
    background: "#493B30",
    color: "#FBF8F2",
    borderRadius: "24px",
    marginBottom: "45px",
    boxShadow:
      "0 20px 50px rgba(73,59,48,0.15)",
  },

  overviewLabel: {
    fontSize: "10px",
    letterSpacing: "2px",
    color: "#D8C5AC",
    fontWeight: "800",
    margin: "0 0 8px",
  },

  overviewTitle: {
    fontSize: "23px",
    margin: "0 0 8px",
  },

  overviewText: {
    color: "#D9CEC0",
    margin: 0,
    lineHeight: "1.6",
    maxWidth: "650px",
  },

  summaryNumber: {
    minWidth: "100px",
    textAlign: "center",
    padding: "18px",
    borderRadius: "18px",
    background:
      "rgba(255,255,255,0.08)",
  },

  summaryNumberStrong: {
    display: "block",
    fontSize: "30px",
  },

  sectionHeader: {
    marginBottom: "20px",
  },

  sectionTitle: {
    fontSize: "28px",
    margin: 0,
    color: "#493B30",
  },

  feedbackCard: {
    background: "#FBF8F2",
    border: "1px solid #E1D5C5",
    borderRadius: "24px",
    padding: "30px",
    marginBottom: "25px",
    boxShadow:
      "0 12px 35px rgba(73,59,48,0.07)",
  },

  questionTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "25px",
    alignItems: "flex-start",
    marginBottom: "25px",
  },

  questionNumber: {
    fontSize: "10px",
    letterSpacing: "2px",
    color: "#A98255",
    fontWeight: "800",
  },

  question: {
    fontSize: "20px",
    lineHeight: "1.5",
    color: "#30271F",
    margin: "8px 0 0",
  },

  questionScore: {
    width: "60px",
    height: "60px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
    flexShrink: 0,
  },

  goodScore: {
    background: "#E4E9DD",
    color: "#536044",
  },

  mediumScore: {
    background: "#EFE2C9",
    color: "#8A693E",
  },

  lowScore: {
    background: "#EAD8D0",
    color: "#895B4A",
  },

  unavailableScore: {
    background: "#E7E0D7",
    color: "#8A7B6B",
    fontSize: "14px",
  },

  answerBox: {
    background: "#F3EDE3",
    borderRadius: "18px",
    padding: "20px",
    marginBottom: "22px",
  },

  boxLabel: {
    fontSize: "10px",
    letterSpacing: "2px",
    color: "#9A7854",
    fontWeight: "800",
    margin: "0 0 10px",
  },

  answerText: {
    margin: 0,
    color: "#5E5145",
    lineHeight: "1.7",
    whiteSpace: "pre-wrap",
  },

  feedbackGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },

  feedbackSection: {
    borderTop: "1px solid #E6DBCC",
    paddingTop: "18px",
  },

  list: {
    margin: 0,
    paddingLeft: "20px",
    color: "#5E5145",
  },

  listItem: {
    marginBottom: "8px",
    lineHeight: "1.5",
  },

  betterAnswer: {
    background: "#EEE4D5",
    borderLeft: "4px solid #B89B7A",
    padding: "20px",
    borderRadius: "0 16px 16px 0",
  },

  betterAnswerText: {
    margin: 0,
    color: "#493B30",
    lineHeight: "1.7",
  },

  navigation: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "14px",
    marginTop: "35px",
    marginBottom: "10px",
    flexWrap: "wrap",
  },

  navButton: {
    border: "1px solid #D8C5AC",
    borderRadius: "12px",
    padding: "13px 22px",
    background: "#FBF8F2",
    color: "#493B30",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
  },

  primaryNavButton: {
    border: "none",
    borderRadius: "12px",
    padding: "13px 22px",
    background: "#493B30",
    color: "#FBF8F2",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
  },

  footer: {
    textAlign: "center",
    color: "#9A8C7D",
    fontSize: "12px",
    padding: "30px 0 10px",
  },

  loadingCard: {
    maxWidth: "600px",
    margin: "140px auto",
    padding: "50px 40px",
    background: "#FBF8F2",
    border: "1px solid #E1D5C5",
    borderRadius: "28px",
    textAlign: "center",
    boxShadow:
      "0 20px 60px rgba(73,59,48,0.1)",
    position: "relative",
    zIndex: 1,
  },

  aiIcon: {
    width: "65px",
    height: "65px",
    margin: "0 auto 25px",
    borderRadius: "20px",
    background: "#493B30",
    color: "#D8C5AC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
  },

  loadingTitle: {
    fontSize: "28px",
    color: "#493B30",
    margin: "0 0 15px",
  },

  loadingText: {
    color: "#7D7063",
    lineHeight: "1.6",
  },

  loadingLine: {
    width: "80px",
    height: "4px",
    borderRadius: "5px",
    background: "#B89B7A",
    margin: "30px auto 0",
  },

  errorIcon: {
    width: "55px",
    height: "55px",
    margin: "0 auto 20px",
    borderRadius: "50%",
    background: "#EAD8D0",
    color: "#895B4A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "800",
  },

  errorText: {
    color: "#895B4A",
    marginBottom: "25px",
  },

  primaryButton: {
    border: "none",
    borderRadius: "12px",
    padding: "13px 25px",
    background: "#493B30",
    color: "#FBF8F2",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default Feedback;