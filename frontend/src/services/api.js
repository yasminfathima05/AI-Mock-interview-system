import axios from "axios";

const api = axios.create({
  baseURL: "https://ai-mock-interview-system-9nyq.onrender.com",
});

export default api;