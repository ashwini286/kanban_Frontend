import React, { useState } from "react";
import axios from "axios";
import styles from "./Signup.module.css";
import { AiFillEye, AiFillEyeInvisible, AiOutlineMail, AiOutlineLock } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../url.js";

const Signup = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const password = formData.password;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/auth/signup`, formData);
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
      {/* Decorative Floating Blobs */}
      <div className={`${styles.blob} ${styles.blob1}`} />
      <div className={`${styles.blob} ${styles.blob2}`} />
      <div className={`${styles.blob} ${styles.blob3}`} />

      <div className={styles.glassContainer}>
        <div className={styles.logo_wrapper}>
          <div className={styles.logo_icon}>C</div>
          <h2 className={styles.heading}>Create Account</h2>
          <p className={styles.subheading}>Sign up to start organizing project cards.</p>
        </div>

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

          {/* Password complexity tip */}
          <div className={styles.pwd_requirements}>
            💡 Must be 8+ chars, have 1 uppercase, 1 lowercase, 1 digit, and 1 symbol.
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Signing Up..." : "SIGN UP"}
          </button>
        </form>

        <div className={styles.loginLink}>
          <p>Already have an account? <a href="/">Login</a></p>
        </div>

        <div className={styles.footer_author}>
          Designed & Developed by <span>Ashwini</span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
