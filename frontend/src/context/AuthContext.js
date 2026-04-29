import { createContext, useContext, useState } from "react";
import { loginUser, registerUser } from "../services/authService";

const AuthContext = createContext(null);
const STORAGE_KEY = "skillforge_auth";

const readStoredAuth = () => {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : { token: "", user: null };
  } catch (_error) {
    return { token: "", user: null };
  }
};

export function AuthProvider({ children }) {
  const storedAuth = readStoredAuth();
  const [token, setToken] = useState(storedAuth.token || "");
  const [user, setUser] = useState(storedAuth.user || null);

  const saveAuth = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: nextToken,
        user: nextUser
      })
    );
  };

  const clearAuth = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem("latestQuizAttempt");
  };

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    saveAuth(response.token, response.user);
    return response;
  };

  const register = async (payload) => {
    const response = await registerUser(payload);
    saveAuth(response.token, response.user);
    return response;
  };

  const logout = () => {
    clearAuth();
  };

  const updateUser = (nextUser) => {
    saveAuth(token, nextUser);
  };

  const markCourseEnrolled = (courseId) => {
    if (!user || !courseId) {
      return;
    }

    const currentCourses = Array.isArray(user.enrolledCourses) ? user.enrolledCourses : [];

    if (currentCourses.includes(courseId)) {
      return;
    }

    updateUser({
      ...user,
      enrolledCourses: [...currentCourses, courseId]
    });
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
    updateUser,
    markCourseEnrolled
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
