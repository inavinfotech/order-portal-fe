import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("oms_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  } catch (err) {
    console.error("Failed to read auth token", err);
  }
  return config;
});

// Auto-logout on 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("oms_token");
      localStorage.removeItem("oms_email");
      // Only redirect if not already on login page
      if (window.location.pathname !== "/order/login") {
        window.location.href = "/order/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
