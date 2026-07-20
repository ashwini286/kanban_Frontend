import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import io from "socket.io-client";

import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import BoardArea from "../Board/BoardArea";
import API from "./apiConfig";
import styles from "./Home.module.css";
import { API_BASE_URL } from "../../url.js";

const socket = io(API_BASE_URL, { autoConnect: false });

export default function Home() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState("");
  const [activeBoard, setActiveBoard] = useState(null);
  
  // Presence and Query States
  const [userEmail, setUserEmail] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [dueDateFilter, setDueDateFilter] = useState("ALL");
  const [userId, setUserId] = useState("");

  // Drag states
  const [dragInfo, setDragInfo] = useState({ cardId: "", sourceColId: "" });
  const [targetInfo, setTargetInfo] = useState({ colId: "", cardId: "" });

  // Flag to skip socket-triggered re-fetch when WE are the ones who triggered the event
  const skipNextBoardFetch = useRef(false);

  const logout = () => {
    Cookies.remove("authToken", { path: "/" });
    localStorage.removeItem("activeBoardId");
    socket.disconnect();
    window.location.href = "/";
  };

  const fetchBoards = async () => {
    const token = Cookies.get("authToken");
    if (!token) return;
    try {
      const res = await axios.get(API.BOARDS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoards(res.data);
      if (res.data.length > 0) {
        // Restore last selected board from localStorage
        const savedBoardId = localStorage.getItem("activeBoardId");
        const savedExists = savedBoardId && res.data.some(b => (b._id || b.id) === savedBoardId);
        if (savedExists) {
          setActiveBoardId(savedBoardId);
        } else if (!activeBoardId) {
          // Default to first board only if none is selected
          setActiveBoardId(res.data[0]._id || res.data[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching boards list:", err);
    }
  };

  const fetchActiveBoardDetails = useCallback(async (boardId) => {
    if (!boardId) return;
    const token = Cookies.get("authToken");
    if (!token) return;
    try {
      const res = await axios.get(API.BOARDS + `/${boardId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveBoard(res.data);
    } catch (err) {
      console.error("Error loading board details:", err);
    }
  }, []);

  const notifyBoardChanged = useCallback(() => {
    if (activeBoardId) {
      // Set flag so our own socket echo is ignored (optimistic state already applied)
      skipNextBoardFetch.current = true;
      socket.emit("board-changed", { boardId: activeBoardId });
    }
  }, [activeBoardId]);

  // WebSocket Connection Lifecycles
  useEffect(() => {
    const token = Cookies.get("authToken");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserEmail(payload.email || "user@example.com");
      setUserId(payload.id || "");

      socket.connect();
      socket.emit("join-workspace", { userId: payload.id });

      // Listen for socket events
      socket.on("board-changed", () => {
        // Skip if we triggered this ourselves (optimistic update already applied)
        if (skipNextBoardFetch.current) {
          skipNextBoardFetch.current = false;
          return;
        }
        if (activeBoardId) {
          fetchActiveBoardDetails(activeBoardId);
        }
      });

      socket.on("workspace-changed", () => {
        fetchBoards();
      });
    } catch (err) {
      console.error("Socket startup failed:", err);
    }

    fetchBoards();

    return () => {
      socket.off("board-changed");
      socket.off("workspace-changed");
      socket.disconnect();
    };
  }, [navigate, activeBoardId, fetchActiveBoardDetails]);

  // Handle window resizing to collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Join a board room when selection changes + persist to localStorage
  useEffect(() => {
    if (activeBoardId) {
      localStorage.setItem("activeBoardId", activeBoardId);
      const token = Cookies.get("authToken");
      let userId = "user";
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userId = payload.id;
      } catch(e){}

      socket.emit("join-board", { boardId: activeBoardId, userId });
      fetchActiveBoardDetails(activeBoardId);
    }
  }, [activeBoardId, fetchActiveBoardDetails]);

  // Board CRUD
  const handleCreateBoard = async (title) => {
    const token = Cookies.get("authToken");
    if (!token) return;
    try {
      const res = await axios.post(API.CREATE_BOARD, { title }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoards(prev => [...prev, res.data]);
      setActiveBoardId(res.data._id || res.data.id);
    } catch (err) {
      console.error("Error creating board:", err);
    }
  };

  // Column CRUD
  const addColumn = async (title) => {
    if (!activeBoardId) return;
    const token = Cookies.get("authToken");
    if (!token) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/api/column`, {
        boardId: activeBoardId,
        title
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newCol = { ...res.data, id: res.data._id, cards: [] };
      setActiveBoard(prev => prev ? {
        ...prev,
        columns: [...prev.columns, newCol]
      } : null);

      notifyBoardChanged();
    } catch (err) {
      console.error("Error creating column:", err);
    }
  };

  const updateColumn = async (columnId, updateData) => {
    const token = Cookies.get("authToken");
    if (!token) return;
    try {
      const res = await axios.put(`${API_BASE_URL}/api/column/${columnId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setActiveBoard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          columns: prev.columns.map(c => c.id === columnId ? { ...c, ...res.data } : c)
        };
      });

      notifyBoardChanged();
    } catch (err) {
      console.error("Error updating column:", err);
    }
  };

  const deleteColumn = async (columnId) => {
    const token = Cookies.get("authToken");
    if (!token) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/column/${columnId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setActiveBoard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          columns: prev.columns.filter(c => c.id !== columnId)
        };
      });

      notifyBoardChanged();
    } catch (err) {
      console.error("Error deleting column:", err);
    }
  };

  // Task Card CRUD
  const addCard = async (columnId, title) => {
    const token = Cookies.get("authToken");
    if (!token) return;
    try {
      const res = await axios.post(API.ADD_CARD, {
        title,
        column: columnId,
        board: activeBoardId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newCard = { ...res.data, id: res.data._id };

      setActiveBoard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          columns: prev.columns.map(c => {
            if (c.id === columnId) {
              return { ...c, cards: [...c.cards, newCard] };
            }
            return c;
          })
        };
      });

      notifyBoardChanged();
    } catch (err) {
      console.error("Error adding card:", err);
    }
  };

  const removeCard = async (columnId, cardId) => {
    const token = Cookies.get("authToken");
    if (!token) return;
    try {
      await axios.delete(API.DELETE_CARD(cardId), {
        headers: { Authorization: `Bearer ${token}` }
      });

      setActiveBoard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          columns: prev.columns.map(c => {
            if (c.id === columnId) {
              return { ...c, cards: c.cards.filter(card => card.id !== cardId) };
            }
            return c;
          })
        };
      });

      notifyBoardChanged();
    } catch (err) {
      console.error("Error deleting card:", err);
    }
  };

  const updateCard = async (columnId, cardId, updatedData) => {
    const token = Cookies.get("authToken");
    if (!token) return;
    try {
      const res = await axios.put(API.UPDATE_CARD(cardId), updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedCard = { ...res.data, id: res.data._id };

      setActiveBoard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          columns: prev.columns.map(c => {
            if (c.id === columnId) {
              return {
                ...c,
                cards: c.cards.map(card => card.id === cardId ? updatedCard : card)
              };
            }
            return c;
          })
        };
      });

      notifyBoardChanged();
    } catch (err) {
      console.error("Error updating card:", err);
    }
  };

  // Drag and Drop Logic
  const dragStart = (columnId, cardId) => {
    setDragInfo({ cardId, sourceColId: columnId });
  };

  const dragEnter = (columnId, cardId) => {
    if (targetInfo.colId === columnId && targetInfo.cardId === cardId) return;
    setTargetInfo({ colId: columnId, cardId });
  };

  const dragEnd = async () => {
    const { cardId, sourceColId } = dragInfo;
    const { colId: targetColId, cardId: targetCardId } = targetInfo;

    if (!cardId || !targetColId) return;

    const sourceColIndex = activeBoard.columns.findIndex(c => c.id === sourceColId);
    const targetColIndex = activeBoard.columns.findIndex(c => c.id === targetColId);

    if (sourceColIndex < 0 || targetColIndex < 0) return;

    const sourceCardIndex = activeBoard.columns[sourceColIndex].cards.findIndex(c => c.id === cardId);
    if (sourceCardIndex < 0) return;

    const tempBoard = JSON.parse(JSON.stringify(activeBoard));
    const cardToMove = tempBoard.columns[sourceColIndex].cards[sourceCardIndex];

    // Remove from source list
    tempBoard.columns[sourceColIndex].cards.splice(sourceCardIndex, 1);

    // Find insertion index in target column
    let insertIndex = tempBoard.columns[targetColIndex].cards.length;
    if (targetCardId) {
      const idx = tempBoard.columns[targetColIndex].cards.findIndex(c => c.id === targetCardId);
      if (idx >= 0) insertIndex = idx;
    }

    // Insert into target list
    tempBoard.columns[targetColIndex].cards.splice(insertIndex, 0, cardToMove);

    const updatedTasksList = [];

    // Recalculate source positions
    tempBoard.columns[sourceColIndex].cards = tempBoard.columns[sourceColIndex].cards.map((c, index) => {
      updatedTasksList.push({ _id: c.id, position: index, column: tempBoard.columns[sourceColIndex].id });
      return { ...c, position: index, column: tempBoard.columns[sourceColIndex].id };
    });

    // Recalculate target positions
    tempBoard.columns[targetColIndex].cards = tempBoard.columns[targetColIndex].cards.map((c, index) => {
      updatedTasksList.push({ _id: c.id, position: index, column: tempBoard.columns[targetColIndex].id });
      return { ...c, position: index, column: tempBoard.columns[targetColIndex].id };
    });

    // Apply local state optimistically
    setActiveBoard(tempBoard);
    setDragInfo({ cardId: "", sourceColId: "" });
    setTargetInfo({ colId: "", cardId: "" });

    // If card moved to a different column, add activity log entry locally (optimistic)
    if (sourceColId !== targetColId) {
      const sourceColTitle = activeBoard.columns[sourceColIndex]?.title || "Unknown";
      const targetColTitle = activeBoard.columns[targetColIndex]?.title || "Unknown";
      const activityEntry = {
        id: Date.now().toString(),
        user: { _id: userId, email: userEmail },
        actionType: "MOVE",
        details: { from: sourceColTitle, to: targetColTitle },
        createdAt: new Date().toISOString()
      };
      setActiveBoard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          columns: prev.columns.map(col => {
            if (col.id === targetColId) {
              return {
                ...col,
                cards: col.cards.map(c => {
                  if (c.id === cardId) {
                    return {
                      ...c,
                      activities: [...(c.activities || []), activityEntry]
                    };
                  }
                  return c;
                })
              };
            }
            return col;
          })
        };
      });
    }

    // Put bulk update to API
    const token = Cookies.get("authToken");
    if (!token) return;
    try {
      await axios.put(API.REORDER_CARDS, { tasks: updatedTasksList }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      notifyBoardChanged();
    } catch (err) {
      console.error("Reorder failed, reverting:", err);
      if (activeBoardId) {
        fetchActiveBoardDetails(activeBoardId);
      }
    }
  };

  // Filter tasks based on advanced filters
  const getFilteredBoard = () => {
    if (!activeBoard) return null;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const weekEnd = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    const filteredCols = activeBoard.columns.map(col => {
      const filteredCards = col.cards.filter(c => {

        // 2. Priority Filter
        if (priorityFilter !== "ALL" && c.priority !== priorityFilter) {
          return false;
        }

        // 3. Due Date Filter
        if (dueDateFilter !== "ALL") {
          if (!c.dueDate) {
            return dueDateFilter === "NONE";
          }
          const due = new Date(c.dueDate);
          if (dueDateFilter === "OVERDUE") {
            return due < todayStart;
          }
          if (dueDateFilter === "TODAY") {
            return due >= todayStart && due <= todayEnd;
          }
          if (dueDateFilter === "WEEK") {
            return due >= todayStart && due <= weekEnd;
          }
          if (dueDateFilter === "NONE") {
            return false;
          }
        }

        return true;
      });

      return {
        ...col,
        cards: filteredCards
      };
    });

    return { ...activeBoard, columns: filteredCols };
  };

  const filteredBoard = getFilteredBoard();

  return (
    <div className={styles.app_layout}>
      <Sidebar
        boards={boards}
        setBoards={setBoards}
        fetchBoards={fetchBoards}
        activeBoardId={activeBoardId}
        setActiveBoardId={setActiveBoardId}
        createBoard={handleCreateBoard}
        logout={logout}
        userEmail={userEmail}
        userId={userId}
        socket={socket}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Backdrop overlay to close sidebar on mobile */}
      {!sidebarCollapsed && window.innerWidth < 768 && (
        <div 
          className={styles.sidebar_overlay} 
          onClick={() => setSidebarCollapsed(true)} 
        />
      )}

      {/* Main Board Viewport */}
      <div className={styles.board_viewport}>
        <Navbar
          boardTitle={activeBoard ? activeBoard.title : "Select a Board"}
          boards={boards}
          setActiveBoardId={setActiveBoardId}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          dueDateFilter={dueDateFilter}
          setDueDateFilter={setDueDateFilter}
          onLogout={logout}
        />

        {activeBoard ? (
          <BoardArea
            board={filteredBoard}
            addCard={addCard}
            removeCard={removeCard}
            updateCard={updateCard}
            addColumn={addColumn}
            deleteColumn={deleteColumn}
            updateColumn={updateColumn}
            dragStart={dragStart}
            dragEnter={dragEnter}
            dragEnd={dragEnd}
          />
        ) : (
          <div className={styles.empty_state}>
            <h3>No Board Selected</h3>
            <p>Select a board from the sidebar, or create a new board to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
