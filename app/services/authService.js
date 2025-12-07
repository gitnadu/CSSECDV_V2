import api from "../lib/api";

class AuthService {
  async login(username, password) {
    try {
      const response = await api.post("/api/auth/login", { username, password });

      return {
        success: true,
        user: response.user,
      };
    } catch (err) {
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
      const response = await api.get("/api/auth/me");

      return {
        success: true,
        user: response.user,
      };
    } catch {
      return {
        success: false,
        user: null,
      };
    }
  }

  async verifySession() {
    try {
      const response = await api.get("/api/auth/me");
      return { valid: true, user: response.user };
    } catch {
      return { valid: false };
    }
  }
}

export default new AuthService();
