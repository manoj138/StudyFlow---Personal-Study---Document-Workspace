import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const token = localStorage.getItem("studyflow_token");
      if (token) {
        try {
          const res = await API.get("/auth/me");
          if (res.data.success) {
            setUser(res.data.data);
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem("studyflow_token");
        }
      }
      setLoading(false);
    };

    checkLoggedInUser();
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    if (res.data.success) {
      localStorage.setItem("studyflow_token", res.data.data.token);
      setUser(res.data.data);
      return res.data;
    }
  };

  const register = async (name, email, password) => {
    const res = await API.post("/auth/register", { name, email, password });
    if (res.data.success) {
      localStorage.setItem("studyflow_token", res.data.data.token);
      setUser(res.data.data);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem("studyflow_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
