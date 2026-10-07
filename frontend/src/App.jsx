
import { HashRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import HRInterview from "./pages/HRInterview";
import Feedback from "./pages/Feedback";
import Assistant from "./pages/Assistant";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/interview" element={<Interview />} />
        <Route path="/hr-interview" element={<HRInterview />} />

        <Route path="/feedback" element={<Feedback />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </HashRouter>
  );
}
