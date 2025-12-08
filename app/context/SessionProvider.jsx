'use client';

import React, { createContext, useContext, useEffect, useState } from "react";
import AuthService from "@/services/authService";

const SessionContext = createContext();

export function useSession() {

  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);       // user object
  const [loading, setLoading] = useState(true);       // initial load
  const [checking, setChecking] = useState(false);    // session refresh flag

  // Load session on first mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const result = await AuthService.getCurrentUser();
        if (result.success) {
          setSession(result.user);
        } else {
          setSession(null);
        }
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  // ----- LOGIN -----
  const login = async (username, password) => {
    const result = await AuthService.login(username, password);
    console.log("result from AuthService:", result);
    if (result.success) {
      // Backend sets HttpOnly cookie; just store user object
      setSession(result.user);
    }
    return result;
  };

  // ----- LOGOUT -----
  const logout = async () => {
    try {
      await AuthService.logout();  // backend clears cookies
    } finally {
      setSession(null);
    }
  };

  // ----- REFRESH SESSION (manual validate) -----
  const refreshSession = async () => {
    setChecking(true);
    try {
      const result = await AuthService.getCurrentUser();
      if (result.success) {
        setSession(result.user);
        return { success: true };
      } else {
        setSession(null);
        return { success: false };
      }
    } catch (err) {
      setSession(null);
      return { success: false, error: err.message };
    } finally {
      setChecking(false);
    }
  };

  const value = {
    session,
    loading,
    checking,
    login,
    logout,
    refreshSession,
    isAuthenticated: !!session,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}
