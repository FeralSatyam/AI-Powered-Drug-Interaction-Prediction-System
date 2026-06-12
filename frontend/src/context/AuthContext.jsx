import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { authApi } from "@/lib/api/auth";

const AuthContext = createContext(null);

// Holds the signed-in doctor and exposes login/register/logout. On mount it
// asks the server who we are (via the httpOnly session cookie) so a returning
// doctor lands straight in the app without re-entering credentials.
export function AuthProvider({ children }) {
  const [doctor, setDoctor] = useState(null);
  // "loading" until the initial /me check resolves, then "ready".
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();
    authApi
      .getMe({ signal: controller.signal })
      .then((data) => setDoctor(data.doctor))
      .catch(() => setDoctor(null))
      .finally(() => setStatus("ready"));
    return () => controller.abort();
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    setDoctor(data.doctor);
    return data.doctor;
  }, []);

  const register = useCallback(async (details) => {
    const data = await authApi.register(details);
    setDoctor(data.doctor);
    return data.doctor;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setDoctor(null);
    }
  }, []);

  const value = {
    doctor,
    isAuthenticated: !!doctor,
    isLoading: status === "loading",
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
