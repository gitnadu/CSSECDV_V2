import api from "lib/api";

class AuthService {
    async login(username, password) {
      try {
        const response = await api.post("/api/auth/login", { username, password });
        console.log("response from api.post:", response);

        return {
          success: true,
          user: response.user,
        };
      } catch (err) {
        console.error("AuthService.login error:", err);

        return {
          success: false,
          error: err.message,
        };
      }
    }

  async logout() {
    try {
      await api.post("/api/auth/logout", {});
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  async getCurrentUser() {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      const data = await response.json();  // <-- REAL JSON PARSING

      return {
        success: data.success,
        user: data.user || null,
      };

    } catch (err) {
      console.error("getCurrentUser() failed:", err);
      return {
        success: false,
        user: null,
      };
    }
  }

  async verifySession() {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();

      return {
        valid: data.success,
        user: data.user || null,
      };
    } catch {
      return { valid: false };
    }
  }
}

export default new AuthService();
