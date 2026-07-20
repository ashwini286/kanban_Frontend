import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NotFound.module.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* Animated Background Blobs */}
      <div className={`${styles.blob} ${styles.blob1}`} />
      <div className={`${styles.blob} ${styles.blob2}`} />
      <div className={`${styles.blob} ${styles.blob3}`} />

      <div className={styles.container}>
        {/* Large 404 */}
        <div className={styles.error_code}>404</div>

        {/* Icon */}
        <div className={styles.icon_wrap}>
          <span className={styles.icon}>🗂️</span>
        </div>

        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.subtitle}>
          Oops! The page you're looking for doesn't exist or has been moved.
          <br />
          Let's get you back on track.
        </p>

        <div className={styles.actions}>
          <button
            id="go-home-btn"
            className={styles.primary_btn}
            onClick={() => navigate("/home")}
          >
            🏠 Go to Dashboard
          </button>
          <button
            id="go-back-btn"
            className={styles.secondary_btn}
            onClick={() => navigate(-1)}
          >
            ← Go Back
          </button>
        </div>

        <div className={styles.footer_author}>
          TaskPilot &mdash; Designed &amp; Developed by <span>Ashwini</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
