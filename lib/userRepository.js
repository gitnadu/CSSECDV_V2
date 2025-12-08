import { query, getClient } from "lib/db";
import bcrypt from "bcryptjs";

export const UserRepository = {
  /**
   * Find all users
   */
  async findAll() {
    const result = await query(`SELECT * FROM users ORDER BY id`);
    return result.rows;
  },

  /**
   * Find user by ID
   */
  async findById(id) {
    const result = await query(`SELECT * FROM users WHERE id = $1`, [id]);
    return result.rows[0] || null;
  },
  
  /**
   * Find user by username
   */
  async findByUsername(username) {
    const result = await query(`SELECT * FROM users WHERE username = $1`, [
      username,
    ]);
    return result.rows[0] || null;
  },

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const result = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    return result.rows[0] || null;
  },

  /**
   * Authenticate user using username + password
   * CSSECDV RULES MET:
   * - No detailed error message (2.1.3)
   * - Password hash is never returned
   */
  async authenticate(username, password) {
    console.log("Authenticating:", username);
    const user = await this.findByUsername(username);
    console.log("DB returned user:", user);

    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password_hash);
     console.log("Password match:", isValid);
    if (!isValid) return null;

    // Remove password hash before returning
    const { password_hash, ...userWithoutHash } = user;
    return userWithoutHash;
  },

  /**
   * Create new user
   * CSSECDV RULES MET:
   * - Password hashing (2.1.2)
   * - Minimum validation should happen in API route
   */
  async create(userData) {
    const {
      username,
      password,
      role,
      first_name,
      last_name,
      email,
    } = userData;

    const password_hash = await bcrypt.hash(password, 10);

    const result = await query(
      `
      INSERT INTO users (username, password_hash, role, first_name, last_name, email)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, role, first_name, last_name, email, created_at, updated_at
      `,
      [username, password_hash, role, first_name, last_name, email]
    );

    return result.rows[0];
  },

  /**
   * Update user
   */
  async update(id, userData) {
    const { first_name, last_name, email, password } = userData;

    let updateFields = [];
    let params = [];
    let p = 1;

    if (first_name !== undefined) {
      updateFields.push(`first_name = $${p++}`);
      params.push(first_name);
    }

    if (last_name !== undefined) {
      updateFields.push(`last_name = $${p++}`);
      params.push(last_name);
    }

    if (email !== undefined) {
      updateFields.push(`email = $${p++}`);
      params.push(email);
    }

    if (password !== undefined) {
      const password_hash = await bcrypt.hash(password, 10);
      updateFields.push(`password_hash = $${p++}`);
      params.push(password_hash);
    }

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    params.push(id);

    const result = await query(
      `
      UPDATE users
      SET ${updateFields.join(", ")}
      WHERE id = $${p}
      RETURNING id, username, role, first_name, last_name, email, created_at, updated_at
      `,
      params
    );

    return result.rows[0] || null;
  },

  /**
   * Delete user by ID
   */
  async delete(id) {
    const result = await query(`DELETE FROM users WHERE id = $1`, [id]);
    return result.rowCount > 0;
  },

  /**
   * Find users by role
   */
  async findByRole(role) {
    const result = await query(
      `
      SELECT id, username, role, first_name, last_name, email, created_at
      FROM users
      WHERE role = $1
      `,
      [role]
    );
    return result.rows;
  },

  /**
   * Store refresh token securely (hashed)
   * CSSECDV RULES MET:
   * - Token hashing = prevents database leakage attacks
   * - Refresh token expiration (sessions handling)
   */
  async storeRefreshToken(userId, refreshToken, expiresAt) {
    const token_hash = await bcrypt.hash(refreshToken, 10);

    const result = await query(
      `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, expires_at, created_at
      `,
      [userId, token_hash, expiresAt]
    );

    return result.rows[0];
  },

  /**
   * Validate refresh token
   */
  async validateRefreshToken(userId, refreshToken) {
    const result = await query(
      `
      SELECT token_hash
      FROM refresh_tokens
      WHERE user_id = $1
        AND expires_at > NOW()
        AND revoked = FALSE
      ORDER BY created_at DESC
      `,
      [userId]
    );

    for (const row of result.rows) {
      const isValid = await bcrypt.compare(refreshToken, row.token_hash);
      if (isValid) return true;
    }

    return false;
  },

  /**
   * Revoke a single refresh token
   */
  async revokeRefreshToken(userId, refreshToken) {
    const result = await query(
      `
      SELECT id, token_hash
      FROM refresh_tokens
      WHERE user_id = $1 AND revoked = FALSE
      `,
      [userId]
    );

    for (const row of result.rows) {
      const isValid = await bcrypt.compare(refreshToken, row.token_hash);
      if (isValid) {
        await query(
          `
          UPDATE refresh_tokens
          SET revoked = TRUE, revoked_at = NOW()
          WHERE id = $1
          `,
          [row.id]
        );
        return true;
      }
    }

    return false;
  },

  /**
   * Revoke ALL refresh tokens for user
   */
  async revokeAllRefreshTokens(userId) {
    const result = await query(
      `
      UPDATE refresh_tokens
      SET revoked = TRUE, revoked_at = NOW()
      WHERE user_id = $1 AND revoked = FALSE
      `,
      [userId]
    );

    return result.rowCount;
  },

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens() {
    const result = await query(
      `
      DELETE FROM refresh_tokens
      WHERE expires_at < NOW()
      `
    );

    return result.rowCount;
  },
};
