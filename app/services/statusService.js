import api from "lib/api";

class StatusService {
  /**
   * Check health of the monolith backend
   */
  async getStatus() {
    try {
      const data = await api.get("/api/status");

      return {
        success: true,
        healthy: data.healthy ?? true,
        details: data.details ?? {},
      };
    } catch (err) {
      return {
        success: false,
        healthy: false,
        details: {
          monolith: {
            service: "nextjs-backend",
            status: "down",
            error: err.message || "Cannot reach backend",
          },
        },
      };
    }
  }
}

export default new StatusService();
