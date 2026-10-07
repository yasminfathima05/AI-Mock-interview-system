import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import HRInterview from "./pages/HRInterview";
import Feedback from "./pages/Feedback";
import History from "./pages/History";
import Assistant from "./pages/Assistant";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter basename="/AI-Mock-interview-system">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/interview" element={<Interview />} />
        <Route path="/hr-interview" element={<HRInterview />} />

        <Route path="/feedback" element={<Feedback />} />
        <Route path="/history" element={<History />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}