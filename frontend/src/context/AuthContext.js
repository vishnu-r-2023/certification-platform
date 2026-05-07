import { createContext, useContext, useMemo, useState } from "react";
import { loginUser, registerUser } from "../services/authService";

const AuthContext = createContext(null);
const STORAGE_KEY = "skillforge_auth";
const EMPTY_AUTH = { token: "", user: null };

const readStoredAuth = () => {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : EMPTY_AUTH;

    return parsedValue?.token && parsedValue?.user ? parsedValue : EMPTY_AUTH;
  } catch (_error) {
    return EMPTY_AUTH;
  }
};

const normalizeAuthResponse = (response) => {
  const nextToken = response?.token || response?.data?.token || "";
  const nextUser = response?.user || response?.data?.user || null;

  return {
    ...response,
    token: nextToken,
    user: nextUser
  };
};

export function AuthProvider({ children }) {
  const [storedAuth] = useState(readStoredAuth);
  const [token, setToken] = useState(storedAuth.token || "");
  const [user, setUser] = useState(storedAuth.user || null);

  const saveAuth = (nextToken, nextUser) => {
    if (!nextToken || !nextUser) {
      clearAuth();
      return;
    }

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
    const authResponse = normalizeAuthResponse(response);
    saveAuth(authResponse.token, authResponse.user);
    return authResponse;
  };

  const register = async (payload) => {
    const response = await registerUser(payload);
    const authResponse = normalizeAuthResponse(response);
    saveAuth(authResponse.token, authResponse.user);
    return authResponse;
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

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
      updateUser,
      markCourseEnrolled
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
