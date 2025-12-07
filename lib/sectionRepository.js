// lib/sectionRepository.js
import { query, getClient } from "@/lib/db";

export const SectionRepository = {
  /**
   * Find all sections with course + professor info
   */
  async findAll() {
    const result = await query(`
      SELECT s.*, 
             c.code AS course_code, 
             c.name AS course_name,
             CONCAT(u.first_name, ' ', u.last_name) AS professor_name
      FROM sections s
      JOIN courses c ON s.course_id = c.id
      LEFT JOIN users u ON s.professor_id = u.id
      ORDER BY c.code, s.section_name
    `);

    return result.rows;
  },

  /**
   * Find section by ID
   */
  async findById(id) {
    const result = await query(
      `
      SELECT s.*, 
             c.code AS course_code, 
             c.name AS course_name,
             CONCAT(u.first_name, ' ', u.last_name) AS professor_name
      FROM sections s
      JOIN courses c ON s.course_id = c.id
      LEFT JOIN users u ON s.professor_id = u.id
      WHERE s.id = $1
      `,
      [id]
    );

    return result.rows[0] || null;
  },

  /**
   * Find all sections under a specific course
   */
  async findByCourseId(courseId) {
    const result = await query(
      `
      SELECT s.*, 
             c.code AS course_code, 
             c.name AS course_name,
             CONCAT(u.first_name, ' ', u.last_name) AS professor_name
      FROM sections s
      JOIN courses c ON s.course_id = c.id
      LEFT JOIN users u ON s.professor_id = u.id
      WHERE s.course_id = $1
      ORDER BY s.section_name
      `,
      [courseId]
    );

    return result.rows;
  },

  /**
   * Find all sections taught by a professor
   */
  async findByProfessorId(professorId) {
    const result = await query(
      `
      SELECT s.*, 
             c.code AS course_code, 
             c.name AS course_name,
             CONCAT(u.first_name, ' ', u.last_name) AS professor_name
      FROM sections s
      JOIN courses c ON s.course_id = c.id
      LEFT JOIN users u ON s.professor_id = u.id
      WHERE s.professor_id = $1
      ORDER BY c.code, s.section_name
      `,
      [professorId]
    );

    return result.rows;
  },

  /**
   * Find available sections (capacity not reached)
   */
  async findAvailable() {
    const result = await query(`
      SELECT s.*, 
             c.code AS course_code, 
             c.name AS course_name,
             CONCAT(u.first_name, ' ', u.last_name) AS professor_name
      FROM sections s
      JOIN courses c ON s.course_id = c.id
      LEFT JOIN users u ON s.professor_id = u.id
      WHERE s.enrolled_count < s.capacity
      ORDER BY c.code, s.section_name
    `);

    return result.rows;
  },

  /**
   * Create a section
   */
  async create(sectionData) {
    const { course_id, section_name, professor_id, capacity = 5, schedule } =
      sectionData;

    const result = await query(
      `
      INSERT INTO sections (course_id, section_name, professor_id, capacity, schedule)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [course_id, section_name.toUpperCase(), professor_id, capacity, schedule]
    );

    return result.rows[0];
  },

  /**
   * Transaction: Increment enrollment count safely
   */
  async incrementEnrollment(sectionId) {
    const client = await getClient();

    try {
      await client.query("BEGIN");

      const sectionResult = await client.query(
        `SELECT * FROM sections WHERE id = $1 FOR UPDATE`,
        [sectionId]
      );

      const section = sectionResult.rows[0];

      if (!section) throw new Error("Section not found");

      if (section.enrolled_count >= section.capacity) {
        throw new Error("Section is full");
      }

      const updateResult = await client.query(
        `
        UPDATE sections 
        SET enrolled_count = enrolled_count + 1
        WHERE id = $1
        RETURNING *
        `,
        [sectionId]
      );

      await client.query("COMMIT");

      return updateResult.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Decrement enrollment (non-transactional)
   */
  async decrementEnrollment(sectionId) {
    const result = await query(
      `
      UPDATE sections
      SET enrolled_count = GREATEST(enrolled_count - 1, 0)
      WHERE id = $1
      RETURNING *
      `,
      [sectionId]
    );

    return result.rows[0] || null;
  },

  /**
   * Check if section has available capacity
   */
  async hasAvailableCapacity(sectionId) {
    const result = await query(
      `
      SELECT enrolled_count < capacity AS has_capacity
      FROM sections 
      WHERE id = $1
      `,
      [sectionId]
    );

    return result.rows[0]?.has_capacity || false;
  },

  /**
   * Get the course_id associated with a section
   */
  async getCourseId(sectionId) {
    const result = await query(
      `
      SELECT course_id FROM sections 
      WHERE id = $1
      `,
      [sectionId]
    );

    return result.rows[0]?.course_id || null;
  },

  /**
   * Toggle whether a section is open for enrollment
   */
  async toggleEnrollmentStatus(sectionId, isOpen) {
    const result = await query(
      `
      UPDATE sections
      SET is_open = $2
      WHERE id = $1
      RETURNING *
      `,
      [sectionId, isOpen]
    );

    return result.rows[0] || null;
  },

  /**
   * Check if a section is open for enrollment
   */
  async isEnrollmentOpen(sectionId) {
    const result = await query(
      `
      SELECT is_open FROM sections 
      WHERE id = $1
      `,
      [sectionId]
    );

    return result.rows[0]?.is_open || false;
  },
};
