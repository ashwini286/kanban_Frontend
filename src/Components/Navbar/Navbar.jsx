import React from "react";
import { FiSearch, FiShare2, FiUsers } from "react-icons/fi";
import styles from "./Navbar.module.css";

const Navbar = ({ boardTitle, searchQuery, setSearchQuery, activeUsers = [] }) => {
  return (
    <div className={styles.navbar}>
      {/* Left: Board Title */}
      <div className={styles.left}>
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

      {/* Right: Active members & share actions */}
      <div className={styles.right}>
        {/* Active Avatars */}
        {activeUsers.length > 0 && (
          <div className={styles.active_members} title={`${activeUsers.length} active users viewing this board`}>
            <FiUsers className={styles.users_icon} />
            <div className={styles.avatar_group}>
              {activeUsers.slice(0, 3).map((user, idx) => (
                <div 
                  key={user.userId || idx} 
                  className={styles.member_avatar} 
                  style={{ zIndex: 3 - idx }}
                  title={user.username || "Collaborator"}
                >
                  {user.username ? user.username[0].toUpperCase() : "C"}
                </div>
              ))}
              {activeUsers.length > 3 && (
                <div className={styles.more_avatars}>+{activeUsers.length - 3}</div>
              )}
            </div>
          </div>
        )}

        <button 
          className={styles.share_btn} 
          onClick={() => alert("Share feature coming soon! You can invite members via emails.")}
        >
          <FiShare2 size={14} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
