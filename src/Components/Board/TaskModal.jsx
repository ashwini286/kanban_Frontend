import React, { useState, useEffect } from "react";
import { FiX, FiCalendar, FiCheckSquare, FiTrash2, FiPlus, FiAlertCircle, FiMessageSquare, FiPaperclip, FiActivity } from "react-icons/fi";
import Cookies from "js-cookie";
import axios from "axios";
import { API_BASE_URL } from "../../url.js";
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
  const [attachments, setAttachments] = useState(card.attachments || []);
  
  // Activities logs states
  const [activities, setActivities] = useState(card.activities || []);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  useEffect(() => {
    setTitle(card.title || "");
    setDescription(card.description || "");
    setPriority(card.priority || "LOW");
    setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().substr(0, 10) : "");
    setSubtasks(card.tasks || []);
    setComments(card.comments || []);
    setAttachments(card.attachments || []);
    setActivities(card.activities || []);
  }, [card]);

  const handleSave = (updatedFields) => {
    updateCard(columnId, card.id, {
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      tasks: subtasks,
      comments,
      attachments,
      activities,
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

  // Upload Logic
  const uploadFile = async (file) => {
    const token = Cookies.get("authToken");
    if (!token) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/task/${card.id}/attachment`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setAttachments(res.data.attachments || []);
      setActivities(res.data.activities || []);
      updateCard(columnId, card.id, { 
        attachments: res.data.attachments || [],
        activities: res.data.activities || []
      });
    } catch (err) {
      console.error("Error uploading file attachment:", err);
      alert("Upload failed. Make sure the file is less than 10MB.");
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    const token = Cookies.get("authToken");
    if (!token) return;

    try {
      const res = await axios.delete(`${API_BASE_URL}/api/task/${card.id}/attachment/${attachmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttachments(res.data.attachments || []);
      setActivities(res.data.activities || []);
      updateCard(columnId, card.id, { 
        attachments: res.data.attachments || [],
        activities: res.data.activities || []
      });
    } catch (err) {
      console.error("Error deleting file attachment:", err);
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Activity Messages Formatter
  const renderActivityMessage = (act) => {
    const user = act.user?.email || "Someone";
    switch (act.actionType) {
      case "CREATE":
        return <span><strong>{user}</strong> created this card.</span>;
      case "MOVE":
        return <span><strong>{user}</strong> moved card from <strong>{act.details?.from}</strong> to <strong>{act.details?.to}</strong>.</span>;
      case "UPDATE_PRIORITY":
        return <span><strong>{user}</strong> changed priority from <strong>{act.details?.from}</strong> to <strong>{act.details?.to}</strong>.</span>;
      case "UPDATE_DUE_DATE":
        return <span><strong>{user}</strong> changed due date to <strong>{act.details?.to === "None" ? "no due date" : act.details?.to}</strong>.</span>;
      case "CHECKLIST_ADD":
        return <span><strong>{user}</strong> added checklist step <em>"{act.details?.itemText}"</em>.</span>;
      case "CHECKLIST_DELETE":
        return <span><strong>{user}</strong> deleted checklist step <em>"{act.details?.itemText}"</em>.</span>;
      case "CHECKLIST_TOGGLE":
        return <span><strong>{user}</strong> marked checklist step <em>"{act.details?.itemText}"</em> as <strong>{act.details?.to.toLowerCase()}</strong>.</span>;
      case "EDIT_TITLE":
        return <span><strong>{user}</strong> renamed card to <em>"{act.details?.to}"</em>.</span>;
      case "EDIT_DESCRIPTION":
        return <span><strong>{user}</strong> updated description.</span>;
      case "ADD_COMMENT":
        return <span><strong>{user}</strong> commented <em>"{act.details?.itemText}"</em>.</span>;
      default:
        return <span><strong>{user}</strong> edited task card.</span>;
    }
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

            {/* File Attachments Section */}
            <div className={styles.section}>
              <h4 className={styles.section_title}>
                <FiPaperclip size={14} />
                <span>Attachments</span>
              </h4>
              
              {/* Dropzone */}
              <div 
                className={`${styles.dropzone} ${isDraggingFile ? styles.dropzone_active : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={handleFileDrop}
              >
                <span>Drag & drop files here, or </span>
                <input
                  type="file"
                  className={styles.file_input_hidden}
                  onChange={(e) => {
                    if (e.target.files.length > 0) {
                      uploadFile(e.target.files[0]);
                    }
                  }}
                  id="task-file-input"
                />
                <label htmlFor="task-file-input" className={styles.dropzone_label_btn}>
                  browse file
                </label>
              </div>

              {/* Attachments List */}
              <div className={styles.attachments_list}>
                {attachments.map((att) => {
                  const isImg = att.fileType && att.fileType.startsWith("image/");
                  // Build full URL: if stored as relative path, prefix with API_BASE_URL
                  const fullUrl = att.url && att.url.startsWith("/") ? `${API_BASE_URL}${att.url}` : att.url;
                  return (
                    <div key={att.id} className={styles.attachment_card}>
                      {isImg ? (
                        <div className={styles.attachment_thumb_wrapper}>
                          <img src={fullUrl} alt={att.name} className={styles.attachment_thumb} />
                        </div>
                      ) : (
                        <div className={styles.attachment_file_icon}>📄</div>
                      )}
                      
                      <div className={styles.attachment_info}>
                        <span className={styles.attachment_name}>{att.name}</span>
                        <span className={styles.attachment_meta}>
                          {formatBytes(att.size)} • {new Date(att.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className={styles.attachment_actions}>
                        <a 
                          href={fullUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={styles.download_btn}
                          download
                        >
                          Download
                        </a>
                        <button 
                          className={styles.delete_attachment_btn}
                          onClick={() => handleDeleteAttachment(att.id)}
                          title="Delete attachment"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activity History Log */}
            <div className={styles.section}>
              <h4 className={styles.section_title}>
                <FiActivity size={14} />
                <span>Activity History</span>
              </h4>
              <div className={styles.activity_timeline}>
                {activities.slice().reverse().map((act) => (
                  <div key={act.id || act._id} className={styles.activity_item}>
                    <div className={styles.activity_dot} />
                    <div className={styles.activity_info_box}>
                      <p className={styles.activity_desc}>{renderActivityMessage(act)}</p>
                      <span className={styles.activity_time_stamp}>{formatCommentDate(act.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
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
                      comments,
                      attachments,
                      activities
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
                      comments,
                      attachments,
                      activities
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
