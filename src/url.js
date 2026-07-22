const hostname = window.location.hostname;
const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.") || hostname.startsWith("10.");

export const API_BASE_URL = isLocalhost 
  ? `http://${hostname}:8000` 
  : "https://kanbanproject-backend-1.onrender.com";