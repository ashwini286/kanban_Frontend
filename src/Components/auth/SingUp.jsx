import React, { useState } from "react";
import axios from "axios"; // Import Axios for API requests
import styles from "./Signup.module.css";
import { AiFillEye, AiFillEyeInvisible, AiOutlineMail, AiOutlineLock } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../url.js";
/*************  ✨ Codeium Command ⭐  *************/
/******  9b1d0fb1-5f71-4669-9ca9-0f136c44f910  *******/
const Signup = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  // const API_BASE_URL = "https://kanbanproject-backend.onrender.com";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, formData);
      alert("Signup Successful! Please log in.");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.app}>
      <div className={styles.glassContainer}>
        <img 
          className={styles.avatar} 
          src="https://thumbs.dreamstime.com/b/man-profile-cartoon-smiling-vector-illustration-graphic-design-135443492.jpg" 
          alt="User Avatar"
        />
        <h2 className={styles.heading}>Sign Up</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className={styles.inputContainer}>
            <AiOutlineMail className={styles.icon} />
            <input
              type="email"
              name="email"
              placeholder="Email ID"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.inputContainer}>
            <AiOutlineLock className={styles.icon} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span className={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </span>
          </div>
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Signing Up..." : "SIGN UP"}
          </button>
        </form>
        <div className={styles.loginLink}>
          <p>Already have an account? <a href="/">Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
