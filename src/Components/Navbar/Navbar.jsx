import React from "react";
import { FiSearch, FiMenu } from "react-icons/fi";
import styles from "./Navbar.module.css";

const Navbar = ({ boardTitle, searchQuery, setSearchQuery, sidebarCollapsed, setSidebarCollapsed }) => {
  return (
    <div className={styles.navbar}>
      {/* Left: Board Title */}
      <div className={styles.left}>
        {sidebarCollapsed && (
          <button 
            className={styles.menu_toggle_btn}
            onClick={() => setSidebarCollapsed(false)}
            title="Open Sidebar"
          >
            <FiMenu size={18} />
          </button>
        )}
        <h1 className={styles.title}>{boardTitle || "Select a Board"}</h1>
      </div>

      {/* Center: Search input */}
      <div className={styles.center}>
        <div className={styles.search_bar}>
          <FiSearch className={styles.search_icon} />
          <input
            type="text"
            className={styles.search_input}
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
