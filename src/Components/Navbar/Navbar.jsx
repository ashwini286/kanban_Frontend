import React, { useState } from "react";
import { FiSearch, FiMenu, FiGrid, FiLogOut } from "react-icons/fi";
import styles from "./Navbar.module.css";

const Navbar = ({ 
  boardTitle, 
  boards = [], 
  setActiveBoardId, 
  sidebarCollapsed, 
  setSidebarCollapsed,
  priorityFilter,
  setPriorityFilter,
  dueDateFilter,
  setDueDateFilter,
  onLogout
}) => {
  const [query, setQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = (val) => {
    setQuery(val);
    const trimmed = val.trim();
    if (trimmed.length === 0) {
      setErrorMsg("");
      setShowDropdown(false);
    } else if (trimmed.length < 3) {
      setErrorMsg("You must type at least 3 characters to search");
      setShowDropdown(false);
    } else {
      setErrorMsg("");
      setShowDropdown(true);
    }
  };

  const matches = boards.filter(b => 
    b.title.toLowerCase().includes(query.toLowerCase().trim())
  );

  const handleSelectBoard = (boardId) => {
    setActiveBoardId(boardId);
    setQuery("");
    setShowDropdown(false);
  };

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

      {/* Center: Search input with dynamic board dropdown */}
      <div className={styles.center}>
        <div className={styles.search_bar}>
          <FiSearch className={styles.search_icon} />
          <input
            type="text"
            className={styles.search_input}
            placeholder="Search by Board Name Only..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (query.trim().length >= 3) {
                setShowDropdown(true);
              } else if (query.trim().length > 0) {
                setErrorMsg("You must type at least 3 characters to search");
              }
            }}
          />

          {errorMsg && (
            <div className={styles.search_error}>
              {errorMsg}
            </div>
          )}

          {showDropdown && (
            <div 
              className={styles.search_dropdown}
              onMouseLeave={() => setShowDropdown(false)}
            >
              {matches.length > 0 ? (
                matches.map((b) => (
                  <button
                    key={b._id || b.id}
                    className={styles.dropdown_item}
                    onClick={() => handleSelectBoard(b._id || b.id)}
                  >
                    <FiGrid size={14} style={{ color: "var(--accent-blue)" }} />
                    <span>{b.title}</span>
                  </button>
                ))
              ) : (
                <div className={styles.dropdown_empty}>No matching boards found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Advanced Filters */}
      <div className={styles.right}>
        {/* Priority Filter */}
        <div className={styles.filter_group}>
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)} 
            className={styles.filter_select}
            title="Filter by Priority"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        {/* Due Date Filter */}
        <div className={styles.filter_group}>
          <select 
            value={dueDateFilter} 
            onChange={(e) => setDueDateFilter(e.target.value)} 
            className={styles.filter_select}
            title="Filter by Due Date"
          >
            <option value="ALL">All Dates</option>
            <option value="OVERDUE">Overdue</option>
            <option value="TODAY">Due Today</option>
            <option value="WEEK">Due This Week</option>
            <option value="NONE">No Due Date</option>
          </select>
        </div>

        {/* Logout Button */}
        <button
          id="logout-btn"
          className={styles.logout_btn}
          onClick={onLogout}
          title="Logout"
        >
          <FiLogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
