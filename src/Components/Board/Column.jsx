import React, { useState } from "react";
import { FiTrash2, FiPlus, FiX } from "react-icons/fi";
import TaskCard from "./TaskCard";
import styles from "./Column.module.css";

const Column = ({ column, addCard, deleteColumn, updateColumn, dragStart, dragEnter, dragEnd, openCardDetails }) => {
  const { id, title, wipLimit, cards = [] } = column;
  const [showAddForm, setShowAddForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [colTitle, setColTitle] = useState(title);
  const [showWipForm, setShowWipForm] = useState(false);
  const [wipValue, setWipValue] = useState(wipLimit || "");

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addCard(id, taskTitle.trim());
    setTaskTitle("");
    setShowAddForm(false);
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (colTitle.trim() && colTitle.trim() !== title) {
      updateColumn(id, { title: colTitle.trim() });
    }
  };

  const handleWipSubmit = (e) => {
    e.preventDefault();
    const limit = wipValue === "" ? null : parseInt(wipValue, 10);
    updateColumn(id, { wipLimit: limit });
    setShowWipForm(false);
  };

  const isOverWip = wipLimit && cards.length > wipLimit;

  return (
    <div 
      className={`${styles.column} ${isOverWip ? styles.wip_exceeded : ""}`}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => dragEnter(id, null)} // handle dragging over column background
    >
      {/* Column Header */}
      <div className={styles.header}>
        <div className={styles.title_container}>
          {isEditingTitle ? (
            <input
              type="text"
              className={styles.title_input}
              value={colTitle}
              onChange={(e) => setColTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
              autoFocus
            />
          ) : (
            <h3 
              className={styles.column_title}
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename"
            >
              {title}
            </h3>
          )}
          
          <div className={styles.wip_badge_container}>
            <span 
              className={styles.counter} 
              onClick={() => setShowWipForm(true)}
              title="Click to set WIP Limit"
            >
              {cards.length}{wipLimit ? ` / ${wipLimit}` : ""}
            </span>
            {showWipForm && (
              <form onSubmit={handleWipSubmit} className={styles.wip_form}>
                <input
                  type="number"
                  placeholder="Limit"
                  value={wipValue}
                  onChange={(e) => setWipValue(e.target.value)}
                  className={styles.wip_input}
                  autoFocus
                />
                <button type="submit" className={styles.wip_btn}>Set</button>
              </form>
            )}
          </div>
        </div>

        <button 
          className={styles.delete_btn}
          title="Delete Column"
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this column? All tasks inside will be deleted.")) {
              deleteColumn(id);
            }
          }}
        >
          <FiTrash2 size={13} />
        </button>
      </div>

      {/* Cards List */}
      <div className={styles.cards_list}>
        {cards.map((card) => (
          <TaskCard
            key={card.id}
            card={card}
            columnId={id}
            dragStart={dragStart}
            dragEnter={dragEnter}
            dragEnd={dragEnd}
            onClick={() => openCardDetails(card, id)}
          />
        ))}
      </div>

      {/* Footer Add Form */}
      {showAddForm ? (
        <form onSubmit={handleAddSubmit} className={styles.add_form}>
          <textarea
            className={styles.add_input}
            placeholder="Enter a title for this card..."
            rows="2"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddSubmit(e);
              }
            }}
          />
          <div className={styles.form_actions}>
            <button type="submit" className={styles.submit_btn}>Add Card</button>
            <button 
              type="button" 
              className={styles.cancel_btn}
              onClick={() => {
                setShowAddForm(false);
                setTaskTitle("");
              }}
            >
              <FiX size={16} />
            </button>
          </div>
        </form>
      ) : (
        <button 
          className={styles.add_btn}
          onClick={() => setShowAddForm(true)}
        >
          <FiPlus size={14} />
          <span>Add Card</span>
        </button>
      )}
    </div>
  );
};

export default Column;
