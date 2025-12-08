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
   async changePassword (currentPassword, newPassword) {
    try {
      const result = await AuthService.changePassword(currentPassword, newPassword);

      if (!result.success) {
        return result; // caller will show error
      }

      // Ensure server invalidates sessions/tokens (best practice).
      // If your backend already invalidates on changePassword you can skip this,
      // but calling logout ensures cookies are cleared client-side too.
      try {
        await AuthService.logout();
      } catch (e) {
        // still continue to client-side cleanup even if logout fails
        console.warn("logout after pw change failed:", e);
      }

      // Clear sensitive client state
      setSession(null);
      setSections([]);
      setEnrollments([]);
      setFaculty([]);
      setStudents([]);
      setCourses([]);

      // Clear any persisted client tokens/data (if used)
      try {
        localStorage.removeItem("someAuthTokenKey"); // adjust keys you use
        sessionStorage.removeItem("someTempDataKey");
      } catch (e) {
        // ignore if storage not available
      }

      // Optionally clear/rotate any CSRF token stored in memory/storage here

      // Inform user and force re-login
      // (use your preferred toast/notification; simple alert for example)
      // show success message then redirect
      alert("Password changed. Please sign in again with your new password.");

      router.push("/login");

      // Return the original success result so caller can handle UI
      return result;
    } catch (err) {
      console.error("changePassword error:", err);
      return { success: false, error: err?.message || "Unknown error" };
    }
  };

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

  

  
  
