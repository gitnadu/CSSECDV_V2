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
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",   // << REQUIRED to send cookies!
      });

      return await res.json();
    } catch (err) {
      console.error("Logout failed:", err);
      return { success: false, error: err.message };
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


  /**
   * Change user password
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const data = await api.put("/api/auth/user", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      return {
        success: true,
        message: data.message || "Password changed successfully",
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Failed to change password",
      };
    }
  }

  /**
   * Update user profile (first_name, last_name, email)
   */
  async updateProfile(profileData) {
    try {
      const data = await api.put("/api/auth/user", {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
      });

      return {
        success: true,
        user: data.user,
        message: data.message || "Profile updated successfully",
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Failed to update profile",
      };
    }
  }


}

export default new AuthService();

  

  
  
