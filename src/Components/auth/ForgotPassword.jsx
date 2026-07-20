import React, { useState } from "react";
import axios from "axios";
import { AiOutlineMail, AiOutlineLock, AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../url.js";
import styles from "./Login.module.css"; // Reuse the same premium styles

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password-direct`, {
        email,
        newPassword
      });

      setSuccess(response.data.message || "Password reset successfully!");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
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
          <h2 className={styles.heading}>Reset Password</h2>
          <p className={styles.subheading}>Enter your email and a new password below.</p>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success} style={{ color: "#4ade80", marginBottom: "16px", textAlign: "center" }}>{success}</p>}

        <form onSubmit={handleResetPassword}>
          <div className={styles.inputContainer}>
            <AiOutlineMail className={styles.icon} />
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputContainer}>
            <AiOutlineLock className={styles.icon} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <span className={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </span>
          </div>

          <div className={styles.inputContainer}>
            <AiOutlineLock className={styles.icon} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span className={styles.eyeIcon} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </span>
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Resetting..." : "RESET PASSWORD"}
          </button>
        </form>

        <div className={styles.signupLink}>
          <p>Remembered your password? <a href="/">Log In</a></p>
        </div>

        <div className={styles.footer_author}>
          Designed & Developed by <span>Ashwini</span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
