import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import Feedback from "./pages/Feedback";
import History from "./pages/History";
import Assistant from "./pages/Assistant";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Main pages */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/interview"
          element={<Interview />}
        />

        <Route
          path="/feedback"
          element={<Feedback />}
        />

        <Route
          path="/history"
          element={<History />}
        />

        {/* AI Assistant */}
        <Route
          path="/assistant"
          element={<Assistant />}
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={<Profile />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;