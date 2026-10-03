import { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      console.log("Login form ready:", {
        email,
        password
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome Back
          </h1>

          <p className="text-gray-500 mt-2">
            Login to your AI Mock Interview account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-lg py-3 font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-black hover:underline"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
