import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import io from "socket.io-client";

import Navbar from "../Navbar/Navbar";
import Board from "../Board/Board";
import styles from "./Home.module.css";
import Editable from "../Editabled/Editable";
import API from "./apiConfig";

import a from "../images/a.jpg";
import b from "../images/b.jpg";
import c from "../images/c.jpg";
import d from "../images/d.jpg";
import e from "../images/e.jpg";
import f from "../images/f.jpg";
import g from "../images/g.jpg";
import i from "../images/i.jpg";
import j from "../images/j.jpg";
import k from "../images/k.jpg";
import l from "../images/l.jpg";
import m from "../images/m.jpg";
import n from "../images/n.jpg";
import o from "../images/o.jpg";
import p from "../images/p.jpg";
import q from "../images/q.jpg";

const socket = io("http://localhost:8000", { autoConnect: false });

export default function Home() {
  const navigate = useNavigate();
  const [changebg, setChangebg] = useState(10);
  const [boards, setBoards] = useState([]);
  const [targetCard, setTargetCard] = useState({ bid: "", cid: "" });

  const backgroundImages = [a, b, c, d, e, f, g, i, j, k, l, m, n, o, p, q];

  const changeTheme = () => {
    if (backgroundImages.length - 1 > changebg) {
      setChangebg(changebg + 1);
    } else {
      setChangebg(0);
    }
  };

  const fetchBoards = async () => {
    const token = Cookies.get("authToken");
    if (!token) return;
    try {
      const res = await axios.get(API.BOARDS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoards(res.data);
    } catch (err) {
      console.error("Error fetching boards:", err);
    }
  };

  const notifyBoardChanged = () => {
    const token = Cookies.get("authToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.id;
        socket.emit("board-changed", { boardId: userId });
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.id;

      socket.connect();
      socket.emit("join-board", userId);

      socket.on("board-changed", () => {
        fetchBoards();
      });
    } catch (e) {
      console.error("Error initializing socket connection:", e);
    }

    fetchBoards();

    return () => {
      socket.off("board-changed");
      socket.disconnect();
    };
  }, [navigate]);

  const addboardHandler = async (name) => {
    const token = Cookies.get("authToken");
    if (!token) return;
    try {
      const res = await axios.post(API.CREATE_BOARD, { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoards(prev => [...prev, res.data]);
      notifyBoardChanged();
    } catch (err) {
      console.error("Error creating board column:", err);
    }
  };

  const removeBoard = async (id) => {
    const token = Cookies.get("authToken");
    if (!token) return;
    try {
      await axios.delete(API.DELETE_BOARD(id), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoards(prev => prev.filter(b => b.id !== id));
      notifyBoardChanged();
    } catch (err) {
      console.error("Error deleting board column:", err);
    }
  };

  const addCardHandler = async (boardId, title) => {
    const token = Cookies.get("authToken");
    if (!token) return;

    const col = boards.find(b => b.id === boardId);
    const position = col ? col.cards.length : 0;

    try {
      const res = await axios.post(API.ADD_CARD, {
        name: title,
        board: boardId,
        position
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newCard = { ...res.data, id: res.data._id };

      setBoards(prev => prev.map(b => {
        if (b.id === boardId) {
          return { ...b, cards: [...b.cards, newCard] };
        }
        return b;
      }));
      notifyBoardChanged();
    } catch (err) {
      console.error("Error adding task card:", err);
    }
  };

  const removeCard = async (boardId, cardId) => {
    const token = Cookies.get("authToken");
    if (!token) return;
    try {
      await axios.delete(API.DELETE_CARD(cardId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoards(prev => prev.map(b => {
        if (b.id === boardId) {
          return { ...b, cards: b.cards.filter(c => c.id !== cardId) };
        }
        return b;
      }));
      notifyBoardChanged();
    } catch (err) {
      console.error("Error deleting task card:", err);
    }
  };

  const dragEnded = async (bid, cid) => {
    let s_boardIndex = boards.findIndex((item) => item.id === bid);
    if (s_boardIndex < 0) return;

    let s_cardIndex = boards[s_boardIndex]?.cards?.findIndex(
      (item) => item.id === cid
    );
    if (s_cardIndex < 0) return;

    let t_boardIndex = boards.findIndex((item) => item.id === targetCard.bid);
    if (t_boardIndex < 0) return;

    let t_cardIndex = boards[t_boardIndex]?.cards?.findIndex(
      (item) => item.id === targetCard.cid
    );
    if (t_cardIndex < 0) return;

    const tempBoards = JSON.parse(JSON.stringify(boards));
    const sourceCard = tempBoards[s_boardIndex].cards[s_cardIndex];

    tempBoards[s_boardIndex].cards.splice(s_cardIndex, 1);
    tempBoards[t_boardIndex].cards.splice(t_cardIndex, 0, sourceCard);

    const updatedTasks = [];

    tempBoards[s_boardIndex].cards = tempBoards[s_boardIndex].cards.map((c, index) => {
      const updated = { ...c, position: index, board: tempBoards[s_boardIndex].id };
      updatedTasks.push({ _id: c.id, position: index, board: tempBoards[s_boardIndex].id });
      return updated;
    });

    tempBoards[t_boardIndex].cards = tempBoards[t_boardIndex].cards.map((c, index) => {
      const updated = { ...c, position: index, board: tempBoards[t_boardIndex].id };
      updatedTasks.push({ _id: c.id, position: index, board: tempBoards[t_boardIndex].id });
      return updated;
    });

    setBoards(tempBoards);
    setTargetCard({ bid: "", cid: "" });

    const token = Cookies.get("authToken");
    if (!token) return;
    try {
      await axios.put(API.REORDER_CARDS, { tasks: updatedTasks }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      notifyBoardChanged();
    } catch (err) {
      console.error("Error bulk reordering tasks:", err);
      fetchBoards();
    }
  };

  const dragEntered = (bid, cid) => {
    if (targetCard.cid === cid) return;
    setTargetCard({ bid, cid });
  };

  const updateCard = async (boardId, cardId, updatedCardData) => {
    const token = Cookies.get("authToken");
    if (!token) return;
    try {
      const res = await axios.put(API.UPDATE_CARD(cardId), {
        name: updatedCardData.title,
        description: updatedCardData.description,
        date: updatedCardData.date
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedCard = { ...res.data, id: res.data._id };

      setBoards(prev => prev.map(b => {
        if (b.id === boardId) {
          return {
            ...b,
            cards: b.cards.map(c => c.id === cardId ? updatedCard : c)
          };
        }
        return b;
      }));
      notifyBoardChanged();
    } catch (err) {
      console.error("Error updating task card:", err);
    }
  };

  const deleteAllCards = () => {
    setBoards([]);
  };

  return (
    <div className={styles.app}>
      <Navbar deleteAllCards={deleteAllCards} changeTheme={changeTheme} />
    
      <div className={styles.app_boards_container} style={{ backgroundImage: `url(${backgroundImages[changebg]})` }}>
        <div id="ol" className={styles.app_boards}>
          {boards.map((board) => (
            <Board
              key={board.id} 
              board={board}
              addCard={addCardHandler}
              removeBoard={() => removeBoard(board.id)}
              removeCard={removeCard}
              dragEnded={dragEnded}
              dragEntered={dragEntered}
              updateCard={updateCard}
            />
          ))}

          <div className={styles.app_boards_last}>
            <Editable
              displayClass={styles.app_boards_add_board}
              editClass={styles.app_boards_add_board_edit}
              placeholder="Enter Board Name"
              text="Add Board"
              buttonText="Add Board"
              onSubmit={addboardHandler}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
