import api from "lib/api";

class EnrollmentService {
  /**
   * Enroll logged-in student in a section
   * Backend determines student from HttpOnly session cookie
   */
  async enrollInSection(sectionId) {
    try {
      const data = await api.post("/api/enrollment/add", { sectionId });

      return {
        success: true,
        enrollment: data.enrollment,
        message: data.message || "Enrollment successful",
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Enrollment failed",
      };
    }
  }

  /**
   * Drop an enrolled section
   * Backend checks:
   *  - if user owns the enrollment
   *  - if grade is NULL
   */
  async unenrollStudent(sectionId) {
    try {
      const data = await api.post("/api/enrollment/drop", { sectionId });

      return {
        success: true,
        message: data.message || "Successfully dropped",
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Failed to drop section",
      };
    }
  }

  /**
   * Get all enrollments for the current logged-in student
   */
  async getMyEnrollments() {
    try {
      const data = await api.get("/api/enrollment/me");

      return {
        success: true,
        enrollments: data.enrollments || [],
      };
    } catch (err) {
      return {
        success: false,
        enrollments: [],
        error: err.message || "Failed to load enrollments",
      };
    }
  }

  async getMyEnrollmentsFaculty() {
    try {
      const data = await api.get("/api/enrollment/faculty");

      return {
        success: true,
        enrollments: data.enrollments || [],
      };
    } catch (err) {
      return {
        success: false,
        enrollments: [],
        error: err.message || "Failed to load enrollments",
      };
    }
  }

  /**
   * Check if logged-in student has taken this course before
   * Useful for UI rules (whether student can retake)
   */
  async checkCourseHistory(courseId) {
    try {
      const data = await api.get(`/api/enrollment/check/${courseId}`);

      return {
        success: true,
        hasRecord: data.hasRecord,
        isActive: data.isActive,
        isGraded: data.isGraded,
        enrollment: data.enrollment || null,
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Failed to check course history",
      };
    }
  }
}

export default new EnrollmentService();
