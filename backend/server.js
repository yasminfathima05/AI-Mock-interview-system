const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


// =====================================================
// SUPABASE
// =====================================================

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);


// =====================================================
// GEMINI
// =====================================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});


// =====================================================
// HELPERS
// =====================================================

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));


function parseFeedbackArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }

  return [];
}


function parseGeminiJSON(text) {
  let cleaned = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    cleaned = cleaned.slice(
      firstBrace,
      lastBrace + 1
    );
  }

  return JSON.parse(cleaned);
}


function normalizeScore(score) {
  const number = Number(score);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, Math.round(number))
  );
}


// =====================================================
// GEMINI FEEDBACK HELPER
// =====================================================

async function generateGeminiFeedback(prompt) {
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt
      });

      return result.text;

    } catch (error) {
      lastError = error;

      console.error(
        `Gemini attempt ${attempt} failed:`,
        error.message
      );

      if (attempt < 3) {
        await sleep(1500);
      }
    }
  }

  throw lastError;
}


// =====================================================
// ROOT
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Mock Interview Backend is running!"
  });
});


// =====================================================
// TEST DATABASE
// =====================================================

app.get("/api/test-db", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .limit(5);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// =====================================================
// REGISTER
// =====================================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters."
      });
    }

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password
      });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    const user = data.user;
    const session = data.session;

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "User registration failed."
      });
    }

    if (session) {
      const userSupabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY,
        {
          global: {
            headers: {
              Authorization:
                `Bearer ${session.access_token}`
            }
          }
        }
      );

      const { error: profileError } =
        await userSupabase
          .from("profiles")
          .insert({
            id: user.id,
            name,
            email
          });

      if (profileError) {
        console.error(
          "Profile creation error:",
          profileError.message
        );
      }
    }

    res.json({
      success: true,
      message:
        "Registration successful!",
      user: {
        id: user.id,
        email: user.email,
        name
      }
    });

  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Something went wrong during registration.",
      error: error.message
    });
  }
});


// =====================================================
// LOGIN
// =====================================================

app.post("/api/auth/login", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required."
      });
    }

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password."
      });
    }

    const user = data.user;
    const session = data.session;

    res.json({
      success: true,
      message:
        "Login successful!",
      user: {
        id: user.id,
        email: user.email
      },
      access_token:
        session.access_token,
      refresh_token:
        session.refresh_token
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Something went wrong during login.",
      error: error.message
    });
  }
});


// =====================================================
// GET INTERVIEW QUESTIONS
// =====================================================

app.get(
  "/api/interview/questions",
  async (req, res) => {
    try {
      const round =
        req.query.round || "technical";

      if (
        !["technical", "hr"].includes(round)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid interview round."
        });
      }

      const { data, error } =
        await supabase
          .from("interview_questions")
          .select("*")
          .eq("round", round);

      if (error) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }

      res.json({
        success: true,
        questions: data
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);


// =====================================================
// START INTERVIEW
// =====================================================

app.post(
  "/api/interview/start",
  async (req, res) => {
    try {
      const round =
        req.body.round || "technical";

      let count =
        Number(req.body.count) || 20;

      if (
        !["technical", "hr"].includes(round)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid interview round."
        });
      }

      if (round === "hr") {
        count = 20;
      }

      const allowedCounts = [
        20,
        30,
        40,
        50
      ];

      if (
        round === "technical" &&
        !allowedCounts.includes(count)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Interview length must be 20, 30, 40 or 50."
        });
      }

      const { data, error } =
        await supabase
          .from("interview_questions")
          .select("*")
          .eq("round", round);

      if (error) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            `No ${round} interview questions found.`
        });
      }

      const shuffled =
        [...data].sort(
          () => Math.random() - 0.5
        );

      const selectedQuestions =
        shuffled.slice(0, count);

      res.json({
        success: true,
        round,
        questions:
          selectedQuestions
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);


// =====================================================
// CREATE INTERVIEW SESSION
// =====================================================

app.post(
  "/api/interview/session",
  async (req, res) => {
    try {
      const accessToken =
        req.headers.authorization?.replace(
          "Bearer ",
          ""
        );

      if (!accessToken) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required."
        });
      }

      const {
        data: { user },
        error: userError
      } =
        await supabase.auth.getUser(
          accessToken
        );

      if (userError || !user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid or expired session."
        });
      }

      const interviewType =
        req.body.interview_type ||
        "technical";

      if (
        !["technical", "hr"].includes(
          interviewType
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid interview type."
        });
      }

      const userSupabase =
        createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_KEY,
          {
            global: {
              headers: {
                Authorization:
                  `Bearer ${accessToken}`
              }
            }
          }
        );

      const { data, error } =
        await userSupabase
          .from("interview_sessions")
          .insert({
            user_id: user.id,
            status: "started",
            interview_type:
              interviewType
          })
          .select()
          .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }

      res.json({
        success: true,
        session: data
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);


// =====================================================
// SAVE INTERVIEW ANSWER
// =====================================================

app.post(
  "/api/interview/answer",
  async (req, res) => {
    try {
      const accessToken =
        req.headers.authorization?.replace(
          "Bearer ",
          ""
        );

      if (!accessToken) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required."
        });
      }

      const {
        data: { user },
        error: userError
      } =
        await supabase.auth.getUser(
          accessToken
        );

      if (userError || !user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid or expired session."
        });
      }

      const {
        session_id,
        question_id,
        answer
      } = req.body;

      if (
        !session_id ||
        !question_id
      ) {
        return res.status(400).json({
          success: false,
          message:
            "session_id and question_id are required."
        });
      }

      const userSupabase =
        createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_KEY,
          {
            global: {
              headers: {
                Authorization:
                  `Bearer ${accessToken}`
              }
            }
          }
        );

      const { data: session } =
        await userSupabase
          .from("interview_sessions")
          .select("id")
          .eq("id", session_id)
          .eq("user_id", user.id)
          .single();

      if (!session) {
        return res.status(403).json({
          success: false,
          message:
            "Session does not belong to user."
        });
      }

      const { data, error } =
        await userSupabase
          .from("interview_answers")
          .insert({
            session_id,
            question_id,
            answer: answer || ""
          })
          .select()
          .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }

      res.json({
        success: true,
        answer: data
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);


// =====================================================
// FINISH INTERVIEW
// =====================================================

app.put(
  "/api/interview/session/:sessionId/finish",
  async (req, res) => {
    try {
      const accessToken =
        req.headers.authorization?.replace(
          "Bearer ",
          ""
        );

      if (!accessToken) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required."
        });
      }

      const {
        data: { user },
        error: userError
      } =
        await supabase.auth.getUser(
          accessToken
        );

      if (userError || !user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid or expired session."
        });
      }

      const sessionId =
        req.params.sessionId;

      const userSupabase =
        createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_KEY,
          {
            global: {
              headers: {
                Authorization:
                  `Bearer ${accessToken}`
              }
            }
          }
        );

      const { data, error } =
        await userSupabase
          .from("interview_sessions")
          .update({
            status: "completed"
          })
          .eq("id", sessionId)
          .eq("user_id", user.id)
          .select()
          .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }

      res.json({
        success: true,
        session: data
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);


// =====================================================
// GET SESSION ANSWERS
// =====================================================

app.get(
  "/api/interview/session/:sessionId/answers",
  async (req, res) => {
    try {
      const accessToken =
        req.headers.authorization?.replace(
          "Bearer ",
          ""
        );

      if (!accessToken) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required."
        });
      }

      const {
        data: { user },
        error: userError
      } =
        await supabase.auth.getUser(
          accessToken
        );

      if (userError || !user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid or expired session."
        });
      }

      const sessionId =
        req.params.sessionId;

      const userSupabase =
        createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_KEY,
          {
            global: {
              headers: {
                Authorization:
                  `Bearer ${accessToken}`
              }
            }
          }
        );

      const { data: session } =
        await userSupabase
          .from("interview_sessions")
          .select("id")
          .eq("id", sessionId)
          .eq("user_id", user.id)
          .single();

      if (!session) {
        return res.status(403).json({
          success: false,
          message:
            "Session not found."
        });
      }

      const { data, error } =
        await userSupabase
          .from("interview_answers")
          .select("*")
          .eq("session_id", sessionId)
          .order("id", {
            ascending: true
          });

      if (error) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }

      res.json({
        success: true,
        answers: data
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);


// =====================================================
// PROFILE - UPDATE NAME
// =====================================================

app.put(
  "/api/profile",
  async (req, res) => {
    try {
      const accessToken =
        req.headers.authorization?.replace(
          "Bearer ",
          ""
        );

      if (!accessToken) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required."
        });
      }

      const {
        data: { user },
        error: userError
      } =
        await supabase.auth.getUser(
          accessToken
        );

      if (userError || !user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid or expired session."
        });
      }

      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Name is required."
        });
      }

      const userSupabase =
        createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_KEY,
          {
            global: {
              headers: {
                Authorization:
                  `Bearer ${accessToken}`
              }
            }
          }
        );

      const { data, error } =
        await userSupabase
          .from("profiles")
          .update({
            name: name.trim()
          })
          .eq("id", user.id)
          .select()
          .single();

      if (error) {
        console.error(
          "Profile update error:",
          error.message
        );

        return res.status(500).json({
          success: false,
          message:
            "Could not update profile.",
          error: error.message
        });
      }

      res.json({
        success: true,
        message:
          "Profile updated successfully!",
        profile: data
      });

    } catch (error) {
      console.error(
        "Profile API error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Something went wrong while updating profile.",
        error: error.message
      });
    }
  }
);


// =====================================================
// GEMINI TEST
// =====================================================

app.post(
  "/api/ai/test",
  async (req, res) => {
    try {
      const result =
        await ai.models.generateContent({
          model:
            "gemini-3.5-flash-lite",
          contents:
            "Say hello and confirm that the AI Mock Interview system is connected to Gemini."
        });

      res.json({
        success: true,
        response: result.text
      });

    } catch (error) {
      console.error(
        "Gemini test error:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);


// =====================================================
// AI ASSISTANT
// =====================================================

app.post(
  "/api/ai/assistant",
  async (req, res) => {
    try {
      const accessToken =
        req.headers.authorization?.replace(
          "Bearer ",
          ""
        );

      if (!accessToken) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required."
        });
      }

      const {
        data: { user },
        error: userError
      } =
        await supabase.auth.getUser(
          accessToken
        );

      if (userError || !user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid or expired session."
        });
      }

      const { message } = req.body;

      if (
        !message ||
        !message.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Message is required."
        });
      }

      const prompt = `
You are the AI Interview Assistant inside an AI Mock Interview System.

The user is preparing for job interviews.

Help the user with:

- Technical interview preparation
- HR interview questions
- Behavioural interview questions
- Improving interview answers
- Python
- SQL
- AI and Machine Learning
- APIs
- Git and GitHub
- General IT topics
- Communication
- Interview confidence

Give clear, practical and beginner-friendly answers.

If the user asks an interview-related question,
give advice that can actually be used in an interview.

Use examples when useful.

Do not pretend to be a human interviewer.

Avoid unnecessarily long answers.

User's question:

${message.trim()}
`;

      const result =
        await ai.models.generateContent({
          model:
            "gemini-3.5-flash-lite",
          contents: prompt
        });

      res.json({
        success: true,
        reply: result.text
      });

    } catch (error) {
      console.error(
        "AI Assistant error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "AI Assistant could not process your request."
      });
    }
  }
);


// =====================================================
// AI FEEDBACK - SINGLE
// =====================================================

app.post(
  "/api/ai/feedback",
  async (req, res) => {
    try {
      const accessToken =
        req.headers.authorization?.replace(
          "Bearer ",
          ""
        );

      if (!accessToken) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required."
        });
      }

      const {
        data: { user },
        error: userError
      } =
        await supabase.auth.getUser(
          accessToken
        );

      if (userError || !user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid or expired session."
        });
      }

      const {
        session_id,
        question_id,
        question,
        answer
      } = req.body;

      if (
        !session_id ||
        !question_id ||
        !question ||
        !answer
      ) {
        return res.status(400).json({
          success: false,
          message:
            "session_id, question_id, question and answer are required."
        });
      }

      const userSupabase =
        createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_KEY,
          {
            global: {
              headers: {
                Authorization:
                  `Bearer ${accessToken}`
              }
            }
          }
        );

      const { data: session } =
        await userSupabase
          .from("interview_sessions")
          .select("id")
          .eq("id", session_id)
          .eq("user_id", user.id)
          .single();

      if (!session) {
        return res.status(403).json({
          success: false,
          message:
            "Session does not belong to user."
        });
      }

      /*
       * Check for existing feedback.
       * This prevents duplicate evaluations.
       */

      const {
        data: existingFeedback,
        error: existingError
      } =
        await userSupabase
          .from("interview_feedback")
          .select("*")
          .eq(
            "session_id",
            session_id
          )
          .eq(
            "question_id",
            question_id
          )
          .order("id", {
            ascending: false
          })
          .limit(1);

      if (existingError) {
        console.error(
          "Existing feedback check error:",
          existingError.message
        );
      }

      if (
        existingFeedback &&
        existingFeedback.length > 0
      ) {
        const existing =
          existingFeedback[0];

        return res.json({
          success: true,
          feedback: {
            score:
              normalizeScore(
                existing.score
              ),

            strengths:
              parseFeedbackArray(
                existing.strengths
              ),

            improvements:
              parseFeedbackArray(
                existing.improvements
              ),

            better_answer:
              existing.better_answer ||
              "",

            id: existing.id
          }
        });
      }

      const prompt = `
Evaluate this interview answer.

Question:
${question}

Candidate answer:
${answer}

Return ONLY valid JSON in this format:

{
  "score": 85,
  "strengths": [
    "Strength 1",
    "Strength 2"
  ],
  "improvements": [
    "Improvement 1",
    "Improvement 2"
  ],
  "better_answer": "A concise improved version of the candidate's answer."
}

Give a score from 0 to 100.
`;

      const text =
        await generateGeminiFeedback(
          prompt
        );

      const feedback =
        parseGeminiJSON(text);

      feedback.score =
        normalizeScore(
          feedback.score
        );

      feedback.strengths =
        Array.isArray(
          feedback.strengths
        )
          ? feedback.strengths
          : [];

      feedback.improvements =
        Array.isArray(
          feedback.improvements
        )
          ? feedback.improvements
          : [];

      feedback.better_answer =
        feedback.better_answer ||
        "";

      const { data, error } =
        await userSupabase
          .from("interview_feedback")
          .insert({
            session_id,
            question_id,
            score:
              feedback.score,
            strengths:
              JSON.stringify(
                feedback.strengths
              ),
            improvements:
              JSON.stringify(
                feedback.improvements
              ),
            better_answer:
              feedback.better_answer
          })
          .select()
          .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }

      res.json({
        success: true,
        feedback: {
          ...feedback,
          id: data.id
        }
      });

    } catch (error) {
      console.error(
        "AI feedback error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Could not generate interview feedback."
      });
    }
  }
);


// =====================================================
// AI FEEDBACK BATCH
// =====================================================

app.post(
  "/api/ai/feedback-batch",
  async (req, res) => {
    try {
      const accessToken =
        req.headers.authorization?.replace(
          "Bearer ",
          ""
        );

      if (!accessToken) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required."
        });
      }

      const {
        data: { user },
        error: userError
      } =
        await supabase.auth.getUser(
          accessToken
        );

      if (userError || !user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid or expired session."
        });
      }

      const session_id =
        req.body.session_id;

      /*
       * Accept both:
       * answers = current frontend
       * items   = older format
       */

      const items =
        Array.isArray(req.body.answers)
          ? req.body.answers
          : Array.isArray(req.body.items)
          ? req.body.items
          : [];

      if (
        !session_id ||
        items.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "session_id and answers are required."
        });
      }

      const userSupabase =
        createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_KEY,
          {
            global: {
              headers: {
                Authorization:
                  `Bearer ${accessToken}`
              }
            }
          }
        );

      const { data: session } =
        await userSupabase
          .from("interview_sessions")
          .select("id")
          .eq("id", session_id)
          .eq("user_id", user.id)
          .single();

      if (!session) {
        return res.status(403).json({
          success: false,
          message:
            "Session does not belong to user."
        });
      }

      const results = [];

      for (const item of items) {
        if (
          !item.question_id ||
          !item.question ||
          !item.answer ||
          !String(item.answer).trim()
        ) {
          continue;
        }

        try {
          /*
           * Check whether this question
           * already has feedback.
           */

          const {
            data: existingFeedback,
            error: existingError
          } =
            await userSupabase
              .from("interview_feedback")
              .select("*")
              .eq(
                "session_id",
                session_id
              )
              .eq(
                "question_id",
                item.question_id
              )
              .order("id", {
                ascending: false
              })
              .limit(1);

          if (existingError) {
            console.error(
              "Existing batch feedback check error:",
              existingError.message
            );
          }

          /*
           * Reuse existing feedback.
           */

          if (
            existingFeedback &&
            existingFeedback.length > 0
          ) {
            const existing =
              existingFeedback[0];

            results.push({
              question_id:
                item.question_id,

              score:
                normalizeScore(
                  existing.score
                ),

              strengths:
                parseFeedbackArray(
                  existing.strengths
                ),

              improvements:
                parseFeedbackArray(
                  existing.improvements
                ),

              better_answer:
                existing.better_answer ||
                "",

              id: existing.id
            });

            continue;
          }

          const prompt = `
Evaluate this interview answer.

Question:
${item.question}

Candidate answer:
${item.answer}

Return ONLY valid JSON:

{
  "score": 85,
  "strengths": [
    "Strength 1",
    "Strength 2"
  ],
  "improvements": [
    "Improvement 1",
    "Improvement 2"
  ],
  "better_answer": "A concise improved version of the candidate's answer."
}

Score from 0 to 100.
`;

          const text =
            await generateGeminiFeedback(
              prompt
            );

          const feedback =
            parseGeminiJSON(text);

          feedback.score =
            normalizeScore(
              feedback.score
            );

          feedback.strengths =
            Array.isArray(
              feedback.strengths
            )
              ? feedback.strengths
              : [];

          feedback.improvements =
            Array.isArray(
              feedback.improvements
            )
              ? feedback.improvements
              : [];

          feedback.better_answer =
            feedback.better_answer ||
            "";

          /*
           * Save feedback.
           */

          const { data, error } =
            await userSupabase
              .from("interview_feedback")
              .insert({
                session_id,
                question_id:
                  item.question_id,
                score:
                  feedback.score,
                strengths:
                  JSON.stringify(
                    feedback.strengths
                  ),
                improvements:
                  JSON.stringify(
                    feedback.improvements
                  ),
                better_answer:
                  feedback.better_answer
              })
              .select()
              .single();

          if (error) {
            console.error(
              "Feedback database error:",
              error.message
            );

            continue;
          }

          results.push({
            question_id:
              item.question_id,

            ...feedback,

            id: data.id
          });

        } catch (itemError) {
          console.error(
            "Batch feedback item error:",
            itemError.message
          );
        }

        /*
         * Small delay between Gemini requests.
         */

        await sleep(700);
      }

      /*
       * Frontend expects `results`.
       * `feedback` is also returned
       * for compatibility.
       */

      res.json({
        success: true,
        results,
        feedback: results
      });

    } catch (error) {
      console.error(
        "Batch feedback error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Could not generate batch feedback."
      });
    }
  }
);


// =====================================================
// START SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});