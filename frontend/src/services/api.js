import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");
export const SERVER_BASE_URL = API_URL.startsWith("/") ? "" : API_URL.replace(/\/api\/?$/, "");

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
