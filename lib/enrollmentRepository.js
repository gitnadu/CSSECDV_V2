import { query, getClient } from "./db";

/**
 * EnrollmentRepository - Handles enrollment operations
 * Enrollments link students to SECTIONS (not courses directly)
 */
export const EnrollmentRepository = {
  // ========================= BASIC QUERIES ========================= //

  async findAll() {
    const result = await query(
      "SELECT * FROM enrollments ORDER BY enrolled_at DESC"
    );
    return result.rows;
  },

  async findById(id) {
    const result = await query(
      "SELECT * FROM enrollments WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  },

  async findByStudentId(studentId) {
    const result = await query(
      "SELECT * FROM enrollments WHERE student_id = $1 ORDER BY enrolled_at DESC",
      [studentId]
    );
    return result.rows;
  },

  async findBySectionId(sectionId) {
    const result = await query(
      "SELECT * FROM enrollments WHERE section_id = $1 ORDER BY enrolled_at DESC",
      [sectionId]
    );
    return result.rows;
  },

  async findByStudentAndSection(studentId, sectionId) {
    const result = await query(
      "SELECT * FROM enrollments WHERE student_id = $1 AND section_id = $2",
      [studentId, sectionId]
    );
    return result.rows[0] || null;
  },

  // ==================== COURSE HISTORY CHECK (IMPORTANT RULE) ==================== //

  /**
   * Check if student has taken ANY section of a course.
   * Since sections belong to courses, this enforces:
   * - One-record-per-course rule
   */
  async checkStudentCourseHistory(studentId, courseId, getSectionsByCourse) {
    // Get all sections for this course
    const sections = await getSectionsByCourse(courseId);
    if (!sections || sections.length === 0) {
      return { hasRecord: false, isActive: false, isGraded: false, enrollment: null };
    }

    const sectionIds = sections.map(s => s.id);

    const result = await query(
      `
        SELECT * FROM enrollments
        WHERE student_id = $1 AND section_id = ANY($2)
        LIMIT 1
      `,
      [studentId, sectionIds]
    );

    if (result.rows.length === 0) {
      return { hasRecord: false, isActive: false, isGraded: false, enrollment: null };
    }

    const enrollment = result.rows[0];
    return {
      hasRecord: true,
      isActive: enrollment.grade === null,
      isGraded: enrollment.grade !== null,
      enrollment
    };
  },

  // ========================= CREATE + UPDATE ========================= //

  async create(studentId, sectionId) {
    const result = await query(
      `
        INSERT INTO enrollments (student_id, section_id)
        VALUES ($1, $2)
        RETURNING *
      `,
      [studentId, sectionId]
    );

    return result.rows[0];
  },

  async updateGrade(id, grade) {
    const result = await query(
      `
        UPDATE enrollments
        SET grade = $1, graded_at = NOW()
        WHERE id = $2
        RETURNING *
      `,
      [grade, id]
    );

    return result.rows[0] || null;
  },

  async removeGrade(id) {
    const result = await query(
      `
        UPDATE enrollments
        SET grade = NULL, graded_at = NULL
        WHERE id = $1
        RETURNING *
      `,
      [id]
    );

    return result.rows[0] || null;
  },

  // ========================= DELETE (DROPPING) ========================= //

  /**
   * Only allowed if grade is NULL.
   * Uses transactions to prevent race conditions.
   */
  async delete(id) {
    const client = await getClient();

    try {
      await client.query("BEGIN");

      const checkResult = await client.query(
        "SELECT * FROM enrollments WHERE id = $1 FOR UPDATE",
        [id]
      );

      const enrollment = checkResult.rows[0];

      if (!enrollment) {
        await client.query("ROLLBACK");
        return {
          success: false,
          message: "Enrollment not found",
          enrollment: null
        };
      }

      if (enrollment.grade !== null) {
        await client.query("ROLLBACK");
        return {
          success: false,
          message: "Cannot unenroll from a graded course",
          enrollment
        };
      }

      await client.query(
        "DELETE FROM enrollments WHERE id = $1",
        [id]
      );

      await client.query("COMMIT");

      return {
        success: true,
        message: "Enrollment deleted",
        enrollment
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // ========================= GRADE RETRIEVAL ========================= //

  async getStudentGrades(studentId) {
    const result = await query(
      `
        SELECT * FROM enrollments
        WHERE student_id = $1
        ORDER BY enrolled_at DESC
      `,
      [studentId]
    );

    return result.rows;
  },

  async getSectionGrades(sectionId) {
    const result = await query(
      `
        SELECT * FROM enrollments
        WHERE section_id = $1
        ORDER BY grade DESC NULLS LAST
      `,
      [sectionId]
    );

    return result.rows;
  },

  // ========================= UTILITY METHODS ========================= //

  async isEnrolledInSection(studentId, sectionId) {
    const result = await query(
      `
        SELECT id FROM enrollments
        WHERE student_id = $1 AND section_id = $2
      `,
      [studentId, sectionId]
    );

    return result.rows.length > 0;
  },

  async getEnrollmentCount(sectionId) {
    const result = await query(
      `
        SELECT COUNT(*) AS count
        FROM enrollments
        WHERE section_id = $1
      `,
      [sectionId]
    );

    return parseInt(result.rows[0].count);
  },

  async getStudentGradeStats(studentId) {
    const result = await query(
      `
        SELECT
          COUNT(*) AS total_courses,
          COUNT(CASE WHEN grade IS NOT NULL THEN 1 END) AS graded_courses,
          ROUND(AVG(grade), 2) AS average_grade,
          MAX(grade) AS highest_grade,
          MIN(grade) AS lowest_grade
        FROM enrollments
        WHERE student_id = $1
      `,
      [studentId]
    );

    return result.rows[0];
  },

  async getSectionGradeStats(sectionId) {
    const result = await query(
      `
        SELECT
          COUNT(*) AS total_students,
          COUNT(CASE WHEN grade IS NOT NULL THEN 1 END) AS graded_students,
          ROUND(AVG(grade), 2) AS average_grade,
          MAX(grade) AS highest_grade,
          MIN(grade) AS lowest_grade
        FROM enrollments
        WHERE section_id = $1
      `,
      [sectionId]
    );

    return result.rows[0];
  },
};
