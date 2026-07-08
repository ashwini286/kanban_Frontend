const BASE_URL = "http://localhost:8000/api";

const API = {
  LOGIN: `${BASE_URL}/auth/login`,
  SIGNUP: `${BASE_URL}/auth/signup`,
  BOARDS: `${BASE_URL}/board`,
  CREATE_BOARD: `${BASE_URL}/board`,
  DELETE_BOARD: (boardId) => `${BASE_URL}/board/${boardId}`,
  ADD_CARD: `${BASE_URL}/task`,
  DELETE_CARD: (cardId) => `${BASE_URL}/task/${cardId}`,
  UPDATE_CARD: (cardId) => `${BASE_URL}/task/${cardId}`,
  REORDER_CARDS: `${BASE_URL}/task/reorder/bulk`
};

export default API;
