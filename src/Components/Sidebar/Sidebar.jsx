import React, { useState } from "react";
import { FiGrid, FiPlus, FiLogOut, FiChevronLeft, FiChevronRight, FiEdit2, FiTrash2 } from "react-icons/fi";
import styles from "./Sidebar.module.css";
import Cookies from "js-cookie";
import axios from "axios";
import { API_BASE_URL } from "../../url.js";

const Sidebar = ({ 
  boards, 
  setBoards, 
  fetchBoards, 
  activeBoardId, 
  setActiveBoardId, 
  createBoard, 
  logout, 
  userEmail, 
  userId, 
  socket, 
  collapsed, 
  setCollapsed 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");
  const [editingBoardId, setEditingBoardId] = useState("");
  const [editingTitle, setEditingTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!boardTitle.trim()) return;
    createBoard(boardTitle.trim());
    setBoardTitle("");
    setShowAddForm(false);
  };

  const saveBoardTitle = async (boardId) => {
    if (!editingTitle.trim()) {
      setEditingBoardId("");
      return;
    }

    try {
      const token = Cookies.get("authToken");
      await axios.put(`${API_BASE_URL}/api/board/${boardId}`, { title: editingTitle }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEditingBoardId("");
      
      if (socket) {
        socket.emit("workspace-changed", { userId });
        socket.emit("board-changed", { boardId });
      }

      fetchBoards();
    } catch (err) {
      console.error("Failed to rename board:", err);
      setEditingBoardId("");
    }
  };

  const handleDeleteBoard = async (boardId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this board? This action will permanently remove all columns and tasks!");
    if (!confirmDelete) return;

    try {
      const token = Cookies.get("authToken");
      await axios.delete(`${API_BASE_URL}/api/board/${boardId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (activeBoardId === boardId) {
        setActiveBoardId("");
        localStorage.removeItem("activeBoardId");
      }

      if (socket) {
        socket.emit("workspace-changed", { userId });
      }
      
      fetchBoards();
    } catch (err) {
      console.error("Failed to delete board:", err);
    }
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
          {boards.map((b, index) => {
            const boardId = b._id || b.id;
            const isEditing = editingBoardId === boardId;
            return (
              <div
                key={boardId}
                className={`${styles.board_item} ${activeBoardId === boardId ? styles.active : ""} ${isEditing ? styles.is_editing : ""}`}
                onClick={() => !isEditing && setActiveBoardId(boardId)}
                title={b.title}
              >
                {isEditing ? (
                  <form 
                    onSubmit={(e) => { e.preventDefault(); saveBoardTitle(boardId); }} 
                    className={styles.edit_form} 
                    onClick={e => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      className={styles.edit_input}
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => saveBoardTitle(boardId)}
                      autoFocus
                    />
                  </form>
                ) : (
                  <>
                    <div className={styles.board_item_left}>
                      <FiGrid size={16} className={styles.grid_icon} />
                      {!collapsed && <span className={styles.board_name}>{b.title}</span>}
                    </div>
                    
                    {!collapsed && (
                      <div className={styles.board_actions} onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => { setEditingBoardId(boardId); setEditingTitle(b.title); }}
                          className={styles.action_btn}
                          title="Rename Board"
                        >
                          <FiEdit2 size={12} />
                        </button>
                        <button 
                          onClick={() => handleDeleteBoard(boardId)}
                          className={styles.action_btn}
                          title="Delete Board"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
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
