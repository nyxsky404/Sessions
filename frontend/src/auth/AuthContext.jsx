import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { setAccessToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const { data } = await api.get("/me/");
    setUser(data);
    return data;
  }, []);

  // On boot, try to restore a session via the refresh cookie.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.post("/auth/refresh/");
        setAccessToken(data.access);
        await loadMe();
      } catch {
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadMe]);

  const loginWithCode = async (code) => {
    const { data } = await api.post("/auth/github/", { code });
    setAccessToken(data.access);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout/");
    } catch {
      /* ignore */
    }
    setAccessToken(null);
    setUser(null);
  };

  const switchRole = async (role) => {
    const { data } = await api.post("/me/role/", { role });
    setUser(data);
    return data;
  };

  const value = { user, setUser, loading, loginWithCode, logout, switchRole, loadMe };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
