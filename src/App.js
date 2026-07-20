import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/auth/Login.jsx";
import Signup from "./Components/auth/SingUp";
import ForgotPassword from "./Components/auth/ForgotPassword";
import Home from "./Components/Home/Home";
import NotFound from "./Components/NotFound/NotFound";
import Cookies from "js-cookie";
import axios from "axios";
import { API_BASE_URL } from "./url";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const currentToken = Cookies.get("authToken");
      if (!currentToken) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${currentToken}` }
        });
        if (response.data.valid) {
          setIsAuthenticated(true);
        } else {
          Cookies.remove("authToken", { path: "/" });
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Token verification failed:", err);
        Cookies.remove("authToken", { path: "/" });
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh", 
        background: "#0f172a", 
        color: "#f8fafc"
      }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/home" /> : <Signup />} />
        <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/home" /> : <ForgotPassword />} />
        <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
