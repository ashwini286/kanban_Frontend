import React, { useState } from "react";
import { AiOutlineClear, AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import styles from "./Navbar.module.css";

const Navbar = ({ changeTheme, deleteAllCards }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove("authToken");
    window.location.reload();
    navigate("/");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <h4 className={styles.title}>
          Made with <span className={styles.heart}>💕</span>
        </h4>

        <div className={styles.menuIcon} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
        </div>

        <div className={`${styles.buttonContainer} ${isOpen ? styles.showMenu : ""}`}>
          <button onClick={changeTheme} className={`${styles.button } ${styles.changebutton}`}>
            Change Theme
          </button>

          <button onClick={deleteAllCards} className={`${styles.button} ${styles.clearButton}`}>
            <AiOutlineClear /> Clear Data
          </button>

          <button onClick={handleLogout} className={`${styles.button} ${styles.logoutButton}`}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
