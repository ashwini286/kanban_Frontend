import React, { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import Column from "./Column";
import TaskModal from "./TaskModal";
import styles from "./BoardArea.module.css";

const BoardArea = ({ board, addCard, removeCard, updateCard, addColumn, deleteColumn, updateColumn, reorderColumns, dragStart, dragEnter, dragEnd, reorderTasks }) => {
  const { columns = [] } = board;
  const [showAddCol, setShowAddCol] = useState(false);
  const [colTitle, setColTitle] = useState("");

  const [activeTask, setActiveTask] = useState(null);
  const [activeTaskColId, setActiveTaskColId] = useState("");
  const [activeTaskColTitle, setActiveTaskColTitle] = useState("");

  const handleAddColumn = (e) => {
    e.preventDefault();
    if (!colTitle.trim()) return;
    addColumn(colTitle.trim());
    setColTitle("");
    setShowAddCol(false);
  };

  const openCardDetails = (card, columnId) => {
    const col = columns.find(c => c.id === columnId);
    setActiveTask(card);
    setActiveTaskColId(columnId);
    setActiveTaskColTitle(col ? col.title : "");
  };

  return (
    <div className={styles.board_container}>
      <div className={styles.board_canvas}>
        {columns.map((col) => (
          <Column
            key={col.id}
            column={col}
            addCard={addCard}
            deleteColumn={deleteColumn}
            updateColumn={updateColumn}
            dragStart={dragStart}
            dragEnter={dragEnter}
            dragEnd={dragEnd}
            openCardDetails={openCardDetails}
          />
        ))}

        {/* Add Column Button */}
        <div className={styles.add_column_container}>
          {showAddCol ? (
            <form onSubmit={handleAddColumn} className={styles.add_col_form}>
              <input
                type="text"
                placeholder="Column title..."
                className={styles.add_col_input}
                value={colTitle}
                onChange={(e) => setColTitle(e.target.value)}
                autoFocus
              />
              <div className={styles.form_actions}>
                <button type="submit" className={styles.submit_btn}>Add List</button>
                <button 
                  type="button" 
                  className={styles.cancel_btn}
                  onClick={() => {
                    setShowAddCol(false);
                    setColTitle("");
                  }}
                >
                  <FiX size={16} />
                </button>
              </div>
            </form>
          ) : (
            <button 
              className={styles.add_column_btn}
              onClick={() => setShowAddCol(true)}
            >
              <FiPlus size={14} />
              <span>Add Column</span>
            </button>
          )}
        </div>
      </div>

      {activeTask && (
        <TaskModal
          card={activeTask}
          columnId={activeTaskColId}
          columnTitle={activeTaskColTitle}
          onClose={() => {
            setActiveTask(null);
            setActiveTaskColId("");
            setActiveTaskColTitle("");
          }}
          updateCard={(colId, cardId, data) => {
            updateCard(colId, cardId, data);
            setActiveTask(prev => ({ ...prev, ...data }));
          }}
        />
      )}
    </div>
  );
};

export default BoardArea;
