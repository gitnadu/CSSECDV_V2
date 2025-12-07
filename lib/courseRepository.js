// lib/courseRepository.js
import { query } from "@/lib/db";

export const CourseRepository = {
  /**
   * Find all courses
   */
  async findAll() {
    const result = await query(`
      SELECT * 
      FROM courses 
      ORDER BY code
    `);
    return result.rows;
  },

  /**
   * Find course by ID
   */
  async findById(id) {
    const result = await query(
      `SELECT * FROM courses WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find course by code
   */
  async findByCode(code) {
    const result = await query(
      `SELECT * FROM courses WHERE code = $1`,
      [code]
    );
    return result.rows[0] || null;
  },

  /**
   * Create a new course
   */
  async create(courseData) {
    const { code, name, description } = courseData;

    const result = await query(
      `
      INSERT INTO courses (code, name, description)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [code, name, description]
    );

    return result.rows[0];
  },

  /**
   * Update course data
   */
  async update(id, courseData) {
    const { name, description } = courseData;

    let updateFields = [];
    let params = [];
    let index = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${index++}`);
      params.push(name);
    }

    if (description !== undefined) {
      updateFields.push(`description = $${index++}`);
      params.push(description);
    }

    // If nothing changed, return existing
    if (updateFields.length === 0) {
      return await this.findById(id);
    }

    params.push(id);

    const result = await query(
      `
      UPDATE courses
      SET ${updateFields.join(", ")}
      WHERE id = $${index}
      RETURNING *
      `,
      params
    );

    return result.rows[0] || null;
  },

  /**
   * Delete a course by ID
   */
  async delete(id) {
    const result = await query(
      `DELETE FROM courses WHERE id = $1`,
      [id]
    );
    return result.rowCount > 0;
  }
};
