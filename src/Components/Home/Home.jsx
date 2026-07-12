import React, { useEffect, useState, useCallback } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeUsers] = useState([
    { userId: "1", username: "Amit" },
    { userId: "2", username: "Pooja" }
  ]);
  const [userEmail, setUserEmail] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);

  // Drag states
  const [dragInfo, setDragInfo] = useState({ cardId: "", sourceColId: "" });
  const [targetInfo, setTargetInfo] = useState({ colId: "", cardId: "" });

  const logout = () => {
    Cookies.remove("authToken", { path: "/" });
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
      if (res.data.length > 0 && !activeBoardId) {
        // default select first board
        setActiveBoardId(res.data[0]._id || res.data[0].id);
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

      socket.connect();

      // Listen for socket events
      socket.on("board-changed", () => {
        if (activeBoardId) {
          fetchActiveBoardDetails(activeBoardId);
        }
      });
    } catch (err) {
      console.error("Socket startup failed:", err);
    }

    fetchBoards();

    return () => {
      socket.off("board-changed");
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

  // Join a board room when selection changes
  useEffect(() => {
    if (activeBoardId) {
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

  // Filter tasks based on global navbar search query
  const getFilteredBoard = () => {
    if (!activeBoard) return null;
    if (!searchQuery.trim()) return activeBoard;

    const query = searchQuery.toLowerCase().trim();
    const filteredCols = activeBoard.columns.map(col => ({
      ...col,
      cards: col.cards.filter(c => 
        c.title.toLowerCase().includes(query) || 
        (c.description && c.description.toLowerCase().includes(query))
      )
    }));

    return { ...activeBoard, columns: filteredCols };
  };

  const filteredBoard = getFilteredBoard();

  return (
    <div className={styles.app_layout}>
      {/* Collapsible Workspace Sidebar */}
      <Sidebar
        boards={boards}
        activeBoardId={activeBoardId}
        setActiveBoardId={setActiveBoardId}
        createBoard={handleCreateBoard}
        logout={logout}
        userEmail={userEmail}
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
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeUsers={activeUsers}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
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
