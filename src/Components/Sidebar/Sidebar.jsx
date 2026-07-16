import React, { useState } from "react";
import { FiGrid, FiPlus, FiLogOut, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import styles from "./Sidebar.module.css";

const Sidebar = ({ boards, activeBoardId, setActiveBoardId, createBoard, logout, userEmail, collapsed, setCollapsed }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!boardTitle.trim()) return;
    createBoard(boardTitle.trim());
    setBoardTitle("");
    setShowAddForm(false);
  };

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      {/* Sidebar Header */}
      <div className={styles.header}>
        {!collapsed && (
          <div className={styles.brand_wrapper}>
            <h2 className={styles.brand}>Cibanna</h2>
            <span className={styles.brand_subtitle}>by Ashwini</span>
          </div>
        )}
        <button 
          className={styles.toggle_btn}
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
        </button>
      </div>

      {/* User Profile Info */}
      {!collapsed && (
        <div className={styles.profile_card}>
          <div className={styles.avatar}>
            {userEmail ? userEmail[0].toUpperCase() : "U"}
          </div>
          <div className={styles.user_info}>
            <span className={styles.user_email}>{userEmail || "user@example.com"}</span>
            <span className={styles.user_role}>Workspace Owner: Ashwini</span>
          </div>
        </div>
      )}

      {/* Navigation Section */}
      <div className={styles.nav_section}>
        <div className={styles.section_title_row}>
          {!collapsed && <span className={styles.section_title}>My Boards</span>}
          <button 
            className={styles.add_board_btn}
            onClick={() => setShowAddForm(!showAddForm)}
            title="Create New Board"
          >
            <FiPlus size={14} />
          </button>
        </div>

        {showAddForm && !collapsed && (
          <form onSubmit={handleSubmit} className={styles.add_board_form}>
            <input
              type="text"
              className={styles.add_board_input}
              placeholder="Board Name..."
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
              autoFocus
            />
            <div className={styles.form_actions}>
              <button type="submit" className={styles.submit_btn}>Create</button>
              <button 
                type="button" 
                className={styles.cancel_btn} 
                onClick={() => {
                  setShowAddForm(false);
                  setBoardTitle("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className={styles.boards_list}>
          {boards.map((b) => (
            <div
              key={b._id || b.id}
              className={`${styles.board_item} ${activeBoardId === (b._id || b.id) ? styles.active : ""}`}
              onClick={() => setActiveBoardId(b._id || b.id)}
              title={b.title}
            >
              <FiGrid size={16} />
              {!collapsed && <span className={styles.board_name}>{b.title}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Footer Logout */}
      <div className={styles.footer}>
        <button className={styles.logout_btn} onClick={logout} title="Log Out">
          <FiLogOut size={16} />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
