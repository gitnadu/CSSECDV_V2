import api from "lib/api";

class CourseService {
  // ========= COURSES ========= //

  async getAllCourses() {
    try {
      const data = await api.get("/api/courses");
      return { success: true, courses: data.courses };
    } catch (err) {
      return { success: false, courses: [], error: "Failed to load courses" };
    }
  }

  async getCourseById(courseId) {
    try {
      const data = await api.get(`/api/courses/${courseId}`);
      return { success: true, course: data.course };
    } catch (err) {
      return { success: false, error: "Course not found" };
    }
  }

  // ========= SECTIONS ========= //

  async getAllSections() {
    try {
      
      const data = await api.get("/api/sections");

      return { success: true, sections: data.sections };
    } catch (err) {
      return { success: false, sections: [], error: "Failed to fetch sections" };
    }
  }

  async getAvailableSections() {
    try {
      const data = await api.get("/api/sections/available");
      return { success: true, sections: data.sections };
    } catch (err) {
      return { success: false, sections: [], error: "Failed to fetch available sections" };
    }
  }

  async getSectionById(sectionId) {
    try {
      const data = await api.get(`/api/sections/${sectionId}`);
      return { success: true, section: data.section };
    } catch (err) {
      return { success: false, error: "Section not found" };
    }
  }

  async getCourseSections(courseId) {
    try {
      const data = await api.get(`/api/sections/course/${courseId}`);
      return { success: true, sections: data.sections };
    } catch (err) {
      return { success: false, sections: [], error: "Failed to fetch sections" };
    }
  }

  async getSectionsByProfessor(professorId) {
    try {
      const data = await api.get(`/api/sections/professor/${professorId}`);
      return { success: true, sections: data.sections };
    } catch (err) {
      return { success: false, sections: [], error: "Failed to fetch professor sections" };
    }
  }

  // ========= ENROLLMENT CONTROLS ========= //

  async toggleSectionEnrollment(sectionId, isOpen) {
    try {
      const data = await api.post(`/api/sections/${sectionId}/toggle`, {
        is_open: isOpen,
      });

      return {
        success: true,
        section: data.section,
      };
    } catch (err) {
      return {
        success: false,
        error: "Failed to update enrollment status",
      };
    }
  }
}

export default new CourseService();
