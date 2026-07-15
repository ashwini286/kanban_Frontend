import React from "react";
import { FiSearch, FiMenu } from "react-icons/fi";
import styles from "./Navbar.module.css";

const Navbar = ({ 
  boardTitle, 
  searchQuery, 
  setSearchQuery, 
  sidebarCollapsed, 
  setSidebarCollapsed,
  priorityFilter,
  setPriorityFilter,
  dueDateFilter,
  setDueDateFilter
}) => {
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
      </div>
    </div>
  );
};

export default Navbar;
