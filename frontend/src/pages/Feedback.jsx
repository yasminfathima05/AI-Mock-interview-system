import React from "react";

const Feedback = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Interview Feedback
        </h1>

        <p className="mb-8 text-gray-600">
          Review your interview performance and improve your answers.
        </p>

        {/* Overall Score */}
        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            Overall Score
          </h2>

          <p className="text-4xl font-bold text-gray-900">
            -- / 100
          </p>

          <p className="mt-2 text-gray-600">
            Your AI-generated score will appear here.
          </p>
        </section>

        {/* What You Did Well */}
        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            What You Did Well
          </h2>

          <p className="text-gray-600">
            Your strengths will appear here after the AI evaluates your
            interview answers.
          </p>
        </section>

        {/* Areas to Improve */}
        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            Areas to Improve
          </h2>

          <p className="text-gray-600">
            Your improvement areas will appear here after AI evaluation.
          </p>
        </section>

        {/* Suggested Better Answer */}
        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            Suggested Better Answer
          </h2>

          <p className="text-gray-600">
            A better version of your answer will appear here after AI
            evaluation.
          </p>
        </section>

      </div>
    </div>
  );
};

export default Feedback;
