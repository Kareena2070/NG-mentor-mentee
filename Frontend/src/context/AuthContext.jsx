import { useContext, useEffect, useState } from "react";
import { createContext } from "react";
// import axios from "axios";
import API from "../api/axios"

const authContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const register = async (
    name,
    email,
    password,
    role,
    menteeEmail = null,
    expertise = []
  ) => {
    try {
      const payload = {
        name,
        email,
        password,
        role,
      };

      // include optional fields when provided (mentor flow)
      if (menteeEmail) payload.menteeEmail = menteeEmail;
      if (expertise && Array.isArray(expertise)) payload.expertise = expertise;

      // const res = await axios.post(
      //   "http://localhost:5000/api/auth/register",
      //   payload
      // );
      const res = await API.post("/auth/register", payload);
      const { user, token } = res.data;

      setUser(user);
      localStorage.setItem("mentee-mentor-user", JSON.stringify(user));
      localStorage.setItem("token", token);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      }
    }
  };

  const login = async (email, password) => {
    try {
      // const res = await axios.post("http://localhost:5000/api/auth/login", {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      const { user, token } = res.data;

      setUser(user);
      localStorage.setItem("mentee-mentor-user", JSON.stringify(user));
      localStorage.setItem("token", token);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("mentee-mentor-user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mentee-mentor-user");
    localStorage.removeItem("token");
  };

  return (
    <authContext.Provider value={{ user, login, register, logout }}>
      {children}
    </authContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(authContext);
  if (!context) {
    throw new Error("AuthProvider is not wraps on main");
  }
  return context;
};
