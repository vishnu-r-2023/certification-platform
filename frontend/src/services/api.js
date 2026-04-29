import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  try {
    const storedAuth = localStorage.getItem("skillforge_auth");

    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth);

      if (parsedAuth?.token) {
        config.headers.Authorization = `Bearer ${parsedAuth.token}`;
      }
    }
  } catch (_error) {
    localStorage.removeItem("skillforge_auth");
  }

  return config;
});

export const getApiErrorMessage = (error, fallbackMessage = "Something went wrong.") =>
  error?.response?.data?.message || error?.message || fallbackMessage;

export default api;
