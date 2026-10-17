const assert = require("node:assert/strict");
const {
  after,
  before,
  beforeEach,
  test
} = require("node:test");

const state = {
  answers: [],
  feedback: [],
  generatedRequests: [],
  failPrimaryModel: false,
  failAllModels: false,
  geminiResponse: null
};

const tables = {
  interview_sessions: [
    { id: 7, user_id: "test-user" }
  ],
  interview_questions: [
    { id: 101, questions: "How do you design a reliable API?" },
    { id: 102, questions: "How do you handle service failures?" }
  ]
};

class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.filters = {};
    this.operation = "select";
    this.inserted = null;
  }

  select() {
    return this;
  }

  eq(field, value) {
    this.filters[field] = value;
    return this;
  }

  in(field, values) {
    this.filters[field] = values;
    return this;
  }

  order() {
    return this;
  }

  limit() {
    return this;
  }

  insert(row) {
    this.operation = "insert";
    this.inserted = row;
    return this;
  }

  update(row) {
    this.operation = "update";
    this.inserted = row;
    return this;
  }

  async execute() {
    if (this.operation === "update") {
      const source = state.feedback;
      const matching = source.filter((row) =>
        Object.entries(this.filters).every(
          ([field, value]) => String(row[field]) === String(value)
        )
      );
      matching.forEach((row) => Object.assign(row, this.inserted));
      return { data: matching, error: null };
    }

    if (this.operation === "insert") {
      const row = {
        ...this.inserted,
        id: state.feedback.length + 1
      };
      state.feedback.push(row);
      return { data: [row], error: null };
    }

    const source =
      this.table === "interview_answers"
        ? state.answers
        : this.table === "interview_feedback"
          ? state.feedback
          : tables[this.table] || [];

    const data = source.filter((row) =>
      Object.entries(this.filters).every(([field, value]) =>
        Array.isArray(value)
          ? value.includes(row[field])
          : String(row[field]) === String(value)
      )
    );

    return { data, error: null };
  }

  async single() {
    const { data, error } = await this.execute();
    return {
      data: Array.isArray(data) ? data[0] || null : data,
      error
    };
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

const mockSupabase = {
  auth: {
    getUser: async () => ({
      data: { user: { id: "test-user" } },
      error: null
    })
  },
  from: (table) => new QueryBuilder(table)
};

const supabaseModulePath =
  require.resolve("@supabase/supabase-js");
const genaiModulePath =
  require.resolve("@google/genai");

require.cache[supabaseModulePath] = {
  id: supabaseModulePath,
  filename: supabaseModulePath,
  loaded: true,
  exports: { createClient: () => mockSupabase }
};

require.cache[genaiModulePath] = {
  id: genaiModulePath,
  filename: genaiModulePath,
  loaded: true,
  exports: {
    GoogleGenAI: class {
      constructor() {
        this.models = {
          generateContent: async (request) => {
            state.generatedRequests.push(request);
            if (state.failAllModels) {
              const error = new Error("Temporary service unavailable.");
              error.status = 503;
              throw error;
            }

            if (
              state.failPrimaryModel &&
              request.model === "gemini-3.5-flash-lite"
            ) {
              const error = new Error("Temporary service unavailable.");
              error.status = 503;
              throw error;
            }

            return {
              text: state.geminiResponse ||
                JSON.stringify({
                  score: 84,
                  strengths: ["The approach is clearly explained."],
                  improvements: ["Add a concrete example."],
                  better_answer:
                    "I would use validation, observability, and bounded retries for transient failures."
                })
            };
          }
        };
      }
    }
  }
};

process.env.GEMINI_API_KEY = "test-key";
const app = require("../server");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

beforeEach(() => {
  state.answers = [
    { id: 1, session_id: 7, question_id: 101, answer: "An earlier answer." },
    { id: 2, session_id: 7, question_id: 101, answer: "The latest answer." },
    { id: 3, session_id: 7, question_id: 102, answer: "" }
  ];
  state.feedback = [];
  state.generatedRequests = [];
  state.failPrimaryModel = false;
  state.failAllModels = false;
  state.geminiResponse = null;
});

test("answers include original question text and only the latest saved response", async () => {
  const response = await fetch(
    `${baseUrl}/api/interview/session/7/answers`,
    { headers: { Authorization: "Bearer test-token" } }
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.answers.length, 2);
  assert.equal(body.answers[0].answer, "The latest answer.");
  assert.equal(
    body.answers[0].question,
    "How do you design a reliable API?"
  );
  assert.equal(
    body.answers[1].question,
    "How do you handle service failures?"
  );
});

test("batch feedback returns the expected fields and reuses feedback on retry", async () => {
  const request = {
    session_id: 7,
    answers: [
      {
        question_id: 101,
        question: "How do you design a reliable API?",
        answer: "I add validation and monitoring."
      }
    ]
  };

  const firstResponse = await fetch(
    `${baseUrl}/api/ai/feedback-batch`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer test-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );
  const firstBody = await firstResponse.json();
  const feedback = firstBody.results[0];

  assert.equal(firstResponse.status, 200);
  assert.equal(firstBody.success, true);
  assert.equal(feedback.score, 84);
  assert.equal(feedback.strengths.length, 1);
  assert.equal(feedback.improvements.length, 1);
  assert.ok(feedback.better_answer);
  assert.equal(state.generatedRequests[0].config.responseMimeType, "application/json");
  assert.match(state.generatedRequests[0].contents, /How do you design a reliable API\?/);
  assert.match(state.generatedRequests[0].contents, /I add validation and monitoring\./);

  const retryResponse = await fetch(
    `${baseUrl}/api/ai/feedback-batch`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer test-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );
  const retryBody = await retryResponse.json();

  assert.equal(retryResponse.status, 200);
  assert.equal(retryBody.results[0].id, feedback.id);
  assert.equal(state.feedback.length, 1);
  assert.equal(state.generatedRequests.length, 1);
});

test("batch feedback marks unanswered responses without inventing feedback", async () => {
  const response = await fetch(
    `${baseUrl}/api/ai/feedback-batch`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer test-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        session_id: 7,
        answers: [
          { question_id: 102, question: "How do you handle service failures?", answer: "" }
        ]
      })
    }
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.results[0].unanswered, true);
  assert.equal(body.results[0].score, 0);
  assert.deepEqual(body.results[0].strengths, []);
  assert.deepEqual(body.results[0].improvements, []);
  assert.equal(body.results[0].better_answer, "");
  assert.equal(state.generatedRequests.length, 0);
  assert.equal(state.feedback.length, 0);
});

test("batch feedback explicitly marks missing question text as failed", async () => {
  const response = await fetch(
    `${baseUrl}/api/ai/feedback-batch`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer test-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        session_id: 7,
        answers: [
          { question_id: 101, answer: "An answer without question text." }
        ]
      })
    }
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.results[0].evaluationFailed, true);
  assert.equal(body.results[0].score, null);
  assert.equal(state.generatedRequests.length, 0);
  assert.equal(state.feedback.length, 0);
});

test("batch feedback reports API failure without a score or persisted feedback", async () => {
  state.failAllModels = true;
  const response = await fetch(
    `${baseUrl}/api/ai/feedback-batch`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer test-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        session_id: 7,
        answers: [
          {
            question_id: 101,
            question: "How do you design a reliable API?",
            answer: "I add validation and monitoring."
          }
        ]
      })
    }
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.results[0].evaluationFailed, true);
  assert.equal(body.results[0].score, null);
  assert.deepEqual(body.results[0].strengths, []);
  assert.deepEqual(body.results[0].improvements, []);
  assert.equal(body.results[0].better_answer, "");
  assert.equal(state.generatedRequests.length, 4);
  assert.equal(state.feedback.length, 0);
});

test("batch feedback parses JSON fences and rejects malformed or incomplete Gemini responses", async () => {
  state.geminiResponse = [
    "```json",
    JSON.stringify({
      score: 84,
      strengths: ["The approach is clearly explained."],
      improvements: ["Add a concrete example."],
      better_answer: "Use validation, monitoring, and bounded retries."
    }),
    "```"
  ].join("\n");

  const validResponse = await fetch(
    `${baseUrl}/api/ai/feedback-batch`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer test-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        session_id: 7,
        answers: [
          {
            question_id: 101,
            question: "How do you design a reliable API?",
            answer: "I add validation and monitoring."
          }
        ]
      })
    }
  );
  const validBody = await validResponse.json();

  assert.equal(validBody.results[0].score, 84);
  assert.equal(state.feedback.length, 1);

  state.feedback = [];
  state.geminiResponse = "This is not valid JSON.";

  const invalidResponse = await fetch(
    `${baseUrl}/api/ai/feedback-batch`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer test-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        session_id: 7,
        answers: [
          {
            question_id: 101,
            question: "How do you design a reliable API?",
            answer: "I add validation and monitoring."
          }
        ]
      })
    }
  );
  const invalidBody = await invalidResponse.json();

  assert.equal(invalidBody.results[0].evaluationFailed, true);
  assert.equal(invalidBody.results[0].score, null);
  assert.equal(state.feedback.length, 0);

  state.geminiResponse = JSON.stringify({
    score: 84,
    strengths: [],
    improvements: [],
    better_answer: ""
  });

  const incompleteResponse = await fetch(
    `${baseUrl}/api/ai/feedback-batch`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer test-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        session_id: 7,
        answers: [
          {
            question_id: 101,
            question: "How do you design a reliable API?",
            answer: "I add validation and monitoring."
          }
        ]
      })
    }
  );
  const incompleteBody = await incompleteResponse.json();

  assert.equal(incompleteBody.results[0].evaluationFailed, true);
  assert.equal(incompleteBody.results[0].score, null);
  assert.equal(state.feedback.length, 0);
});

test("batch feedback repairs incomplete saved feedback without inserting a duplicate", async () => {
  state.feedback = [
    {
      id: 9,
      session_id: 7,
      question_id: 101,
      score: 0,
      strengths: "[]",
      improvements: "[]",
      better_answer: ""
    }
  ];

  const response = await fetch(
    `${baseUrl}/api/ai/feedback-batch`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer test-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        session_id: 7,
        answers: [
          {
            question_id: 101,
            question: "How do you design a reliable API?",
            answer: "I add validation and monitoring."
          }
        ]
      })
    }
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.results[0].score, 84);
  assert.equal(body.results[0].id, 9);
  assert.equal(state.feedback.length, 1);
  assert.equal(state.feedback[0].score, 84);
});

test("batch feedback retries transient Gemini errors on the fallback model", async () => {
  state.failPrimaryModel = true;
  const response = await fetch(
    `${baseUrl}/api/ai/feedback-batch`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer test-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        session_id: 7,
        answers: [
          {
            question_id: 101,
            question: "How do you design a reliable API?",
            answer: "I add validation and monitoring."
          }
        ]
      })
    }
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.results[0].score, 84);
  assert.deepEqual(
    state.generatedRequests.map((request) => request.model),
    [
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash"
    ]
  );
  assert.equal(state.feedback.length, 1);
});
