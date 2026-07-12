import React, { useState, useEffect } from "react";
import { FiX, FiCalendar, FiCheckSquare, FiTrash2, FiPlus, FiAlertCircle, FiMessageSquare } from "react-icons/fi";
import Cookies from "js-cookie";
import styles from "./TaskModal.module.css";

const TaskModal = ({ card, columnId, columnTitle, onClose, updateCard }) => {
  const [title, setTitle] = useState(card.title || "");
  const [description, setDescription] = useState(card.description || "");
  const [priority, setPriority] = useState(card.priority || "LOW");
  const [dueDate, setDueDate] = useState(card.dueDate ? new Date(card.dueDate).toISOString().substr(0, 10) : "");
  const [subtasks, setSubtasks] = useState(card.tasks || []);
  const [newSubtask, setNewSubtask] = useState("");
  const [comments, setComments] = useState(card.comments || []);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    setTitle(card.title || "");
    setDescription(card.description || "");
    setPriority(card.priority || "LOW");
    setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().substr(0, 10) : "");
    setSubtasks(card.tasks || []);
    setComments(card.comments || []);
  }, [card]);

  const handleSave = (updatedFields) => {
    updateCard(columnId, card.id, {
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      tasks: subtasks,
      comments,
      ...updatedFields
    });
  };

  const handleBlur = () => {
    handleSave();
  };

  const addSubtask = (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;

    const newItem = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      content: newSubtask.trim(),
      isCompleted: false
    };

    const updated = [...subtasks, newItem];
    setSubtasks(updated);
    setNewSubtask("");
    handleSave({ tasks: updated });
  };

  const toggleSubtask = (subId) => {
    const updated = subtasks.map(t => t.id === subId ? { ...t, isCompleted: !t.isCompleted } : t);
    setSubtasks(updated);
    handleSave({ tasks: updated });
  };

  const deleteSubtask = (subId) => {
    const updated = subtasks.filter(t => t.id !== subId);
    setSubtasks(updated);
    handleSave({ tasks: updated });
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const token = Cookies.get("authToken");
    let userEmail = "Me";
    let userId = "";

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.id;
      // If backend token contains email, decode it, otherwise fallback
      userEmail = payload.email || "User";
    } catch (err) {
      console.error(err);
    }

    const comment = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      user: { _id: userId, email: userEmail },
      content: newComment.trim(),
      createdAt: new Date()
    };

    const updated = [...comments, comment];
    setComments(updated);
    setNewComment("");
    handleSave({ comments: updated });
  };

  const formatCommentDate = (dateVal) => {
    const d = new Date(dateVal);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.column_info}>Status column: <strong>{columnTitle}</strong></span>
          <button className={styles.close_btn} onClick={onClose} title="Close Panel">
            <FiX size={18} />
          </button>
        </div>

        {/* Title Input */}
        <input
          type="text"
          className={styles.title_input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlur}
          placeholder="Enter task title..."
        />

        {/* Modal Grid */}
        <div className={styles.grid}>
          {/* Left panel: details */}
          <div className={styles.left_pane}>
            {/* Description */}
            <div className={styles.section}>
              <h4 className={styles.section_title}>Description</h4>
              <textarea
                className={styles.description_area}
                placeholder="Add a detailed description for this task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleBlur}
                rows="4"
              />
            </div>

            {/* Checklist subtasks */}
            <div className={styles.section}>
              <h4 className={styles.section_title}>
                <FiCheckSquare size={14} />
                <span>Checklist Steps</span>
              </h4>
              <div className={styles.subtask_list}>
                {subtasks.map((sub) => (
                  <div key={sub.id} className={styles.subtask_item}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={sub.isCompleted}
                      onChange={() => toggleSubtask(sub.id)}
                    />
                    <span className={`${styles.subtask_text} ${sub.isCompleted ? styles.completed : ""}`}>
                      {sub.content}
                    </span>
                    <button 
                      className={styles.delete_subtask}
                      onClick={() => deleteSubtask(sub.id)}
                      title="Remove step"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={addSubtask} className={styles.add_subtask_form}>
                <input
                  type="text"
                  placeholder="Add checklist step..."
                  className={styles.subtask_input}
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                />
                <button type="submit" className={styles.add_subtask_btn}>
                  <FiPlus size={14} />
                </button>
              </form>
            </div>

            {/* Comments Feed */}
            <div className={styles.section}>
              <h4 className={styles.section_title}>
                <FiMessageSquare size={14} />
                <span>Comments Feed</span>
              </h4>
              
              <div className={styles.comments_list}>
                {comments.map((c) => (
                  <div key={c.id || c._id} className={styles.comment_card}>
                    <div className={styles.comment_meta}>
                      <span className={styles.comment_author}>{c.user?.email || "Collaborator"}</span>
                      <span className={styles.comment_time}>{formatCommentDate(c.createdAt)}</span>
                    </div>
                    <p className={styles.comment_text}>{c.content}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className={styles.comment_form}>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className={styles.comment_input}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className={styles.comment_btn}>Comment</button>
              </form>
            </div>
          </div>

          {/* Right panel: actions/settings */}
          <div className={styles.right_pane}>
            <div className={styles.settings_card}>
              <h5 className={styles.settings_title}>Task Settings</h5>
              
              {/* Priority */}
              <div className={styles.settings_item}>
                <label className={styles.settings_label}>
                  <FiAlertCircle size={13} />
                  <span>Priority</span>
                </label>
                <select
                  value={priority}
                  className={styles.select}
                  onChange={(e) => {
                    setPriority(e.target.value);
                    updateCard(columnId, card.id, {
                      title,
                      description,
                      priority: e.target.value,
                      dueDate: dueDate ? new Date(dueDate) : null,
                      tasks: subtasks,
                      comments
                    });
                  }}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              {/* Due date */}
              <div className={styles.settings_item}>
                <label className={styles.settings_label}>
                  <FiCalendar size={13} />
                  <span>Due Date</span>
                </label>
                <input
                  type="date"
                  className={styles.date_input}
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    updateCard(columnId, card.id, {
                      title,
                      description,
                      priority,
                      dueDate: e.target.value ? new Date(e.target.value) : null,
                      tasks: subtasks,
                      comments
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
