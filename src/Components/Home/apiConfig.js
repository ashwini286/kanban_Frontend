const BASE_URL = "http://localhost:8000/api";

const API = {
  LOGIN: `${BASE_URL}/auth/login`,
  SIGNUP: `${BASE_URL}/auth/signup`,
  BOARDS: `${BASE_URL}/board`,
  CREATE_BOARD: `${BASE_URL}/board`,
  DELETE_BOARD: (boardId) => `${BASE_URL}/boards/${boardId}`,
  ADD_CARD: (boardId) => `${BASE_URL}/task`,
  DELETE_CARD: (boardId, cardId) => `${BASE_URL}/task/${boardId}`,
  UPDATE_CARD: (boardId, cardId) => `${BASE_URL}/task/${boardId}`,
};

export default API;
