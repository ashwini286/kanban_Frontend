import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/auth/Login.jsx";
import Signup from "./Components/auth/SingUp";
import Home from "./Components/Home/Home";
import Cookies from "js-cookie";

const App = () =>{
  
  const [token, setToken] = useState(Cookies.get("authToken"));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      setLoading(false);
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, [token]);

  if(loading){
    return <h1>Loading...</h1>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/home" /> : <Signup />} />y
        <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


