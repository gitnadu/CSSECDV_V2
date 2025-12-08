import api from "lib/api";

class GradeService {
  /**
   * Upload or update grade for an enrollment (faculty only)
   */
  async uploadGrade(enrollmentId, grade) {
    try {
      const data = await api.post("/api/grades/upload", {
        enrollmentId,
        grade,
      });

      return {
        success: true,
        enrollment: data.enrollment,
        message: data.message || "Grade submitted",
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Failed to upload grade",
      };
    }
  }

  /**
   * Remove a grade (set to NULL)
   */
  async removeGrade(enrollmentId) {
    try {
      const data = await api.post("/api/grades/remove", {
        enrollmentId,
      });

      return {
        success: true,
        enrollment: data.enrollment,
        message: data.message || "Grade removed",
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Failed to remove grade",
      };
    }
  }

  /**
   * Get grades for the currently logged-in student
   */
  async getMyGrades() {
    try {
      const data = await api.get("/api/grades/me");

      return {
        success: true,
        grades: data.grades || [],
      };
    } catch (err) {
      return {
        success: false,
        grades: [],
        error: err.message || "Failed to fetch grades",
      };
    }
  }

  /**
   * Get grades for a section (faculty only)
   */
  async getSectionGrades(sectionId) {
    try {
      const data = await api.get(`/api/grades/section/${sectionId}`);

      return {
        success: true,
        grades: data.grades || [],
      };
    } catch (err) {
      return {
        success: false,
        grades: [],
        error: err.message || "Failed to fetch section grades",
      };
    }
  }
}

export default new GradeService();
