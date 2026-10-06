import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [user] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  return (
    <div>
      <h1>Dashboard</h1>

      <h2>
        Welcome, {user?.email || "User"}!
      </h2>

      <p>Ready for your mock interview?</p>

      <button onClick={() => navigate("/interview")}>
        Start Mock Interview
      </button>
    </div>
  );
}

export default Dashboard;