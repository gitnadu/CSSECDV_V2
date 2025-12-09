import api from "lib/api";

class AuthService {
    async login(username, password) {
      try {
        const response = await api.post("/api/auth/login", { username, password });
        

        return {
          success: true,
          user: response.user,
        };
      } catch (err) {
        console.error("ERROR");

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
      console.error("ERROR");
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
      console.error("ERROR");
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
   async changePassword (currentPassword, newPassword) {
    try {
      const response = await api.put("/api/auth/user", { 
        current_password: currentPassword, 
        new_password: newPassword 
      });

      return {
        success: true,
        message: response.message || "Password changed successfully"
      };
    } catch (err) {
      console.error("ERROR");
      return {
        success: false,
        error: err.message || "Failed to change password"
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put("/api/auth/user", profileData);

      return {
        success: true,
        user: response.user,
        message: response.message || "Profile updated successfully"
      };
    } catch (err) {
      console.error("ERROR");
      return {
        success: false,
        error: err.message || "Failed to update profile"
      };
    }
  }


}

export default new AuthService();

  

  
  
