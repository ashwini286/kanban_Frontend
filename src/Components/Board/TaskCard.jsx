import React from "react";
import { FiClock, FiCheckSquare } from "react-icons/fi";
import styles from "./TaskCard.module.css";

const TaskCard = ({ card, columnId, dragStart, dragEnter, dragEnd, onClick }) => {
  const { id, title, description, priority = "LOW", dueDate, tasks = [] } = card;

  const formatDate = (val) => {
    if (!val) return "";
    const d = new Date(val);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getPriorityStyle = (pr) => {
    switch (pr.toUpperCase()) {
      case "CRITICAL": return styles.priority_critical;
      case "HIGH": return styles.priority_high;
      case "MEDIUM": return styles.priority_medium;
      default: return styles.priority_low;
    }
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div
      className={styles.card}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", id);
        dragStart(columnId, id);
      }}
      onDragEnd={dragEnd}
      onDragEnter={() => dragEnter(columnId, id)}
      onClick={onClick}
    >
      <div className={styles.header}>
        <span className={`${styles.priority} ${getPriorityStyle(priority)}`}>
          {priority}
        </span>
      </div>

      <h4 className={styles.title}>{title}</h4>
      {description && <p className={styles.desc}>{description}</p>}

      {totalCount > 0 && (
        <div className={styles.progress_row}>
          <div className={styles.progress_info}>
            <FiCheckSquare size={12} />
            <span>{completedCount}/{totalCount} Checklist</span>
          </div>
          <div className={styles.progress_bar_track}>
            <div className={styles.progress_bar_fill} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}

      <div className={styles.footer}>
        {dueDate && (
          <div className={styles.due_date} title="Due Date">
            <FiClock size={12} />
            <span>{formatDate(dueDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
