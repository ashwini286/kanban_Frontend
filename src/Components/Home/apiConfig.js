const BASE_URL = "http://localhost:8000/api";

const API = {
  LOGIN: `${BASE_URL}/auth/login`,
  SIGNUP: `${BASE_URL}/auth/signup`,
  BOARDS: `${BASE_URL}/board`,
  CREATE_BOARD: `${BASE_URL}/board`,
  ADD_CARD: `${BASE_URL}/task`,
  UPDATE_CARD: (id) => `${BASE_URL}/task/${id}`,
  DELETE_CARD: (id) => `${BASE_URL}/task/${id}`,
  REORDER_CARDS: `${BASE_URL}/task/reorder/bulk`
};

export default API;
