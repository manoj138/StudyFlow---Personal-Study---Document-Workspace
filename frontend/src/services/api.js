import axios from "axios";

const resolveApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== "undefined" && window.location) {
    const origin = window.location.origin;
    // On production (Render live) or any non-localhost domain / IP address, use relative /api endpoint
    if (import.meta.env.PROD || (!origin.includes("localhost:5173") && !origin.includes("127.0.0.1:5173"))) {
      return origin.endsWith("/") ? `${origin}api` : `${origin}/api`;
    }
  }
  return "http://localhost:5000/api";
};

export const API_URL = resolveApiUrl();
export const SERVER_BASE_URL = API_URL.startsWith("/") 
  ? (typeof window !== "undefined" ? window.location.origin : "") 
  : API_URL.replace(/\/api\/?$/, "");

const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor to inject JWT token in request headers
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("studyflow_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
