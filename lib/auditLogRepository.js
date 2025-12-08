import { query } from "lib/db";

/**
 * AuditLogRepository - Handles audit log operations
 * Tracks validation failures, authentication attempts, and access control events
 */
export const AuditLogRepository = {
  /**
   * Create a new audit log entry
   */
  async create(logData) {
    const {
      event_type,
      user_id = null,
      username,
      ip_address,
      user_agent,
      resource,
      action,
      details = null,
      status,
    } = logData;

    const result = await query(
      `
        INSERT INTO audit_logs 
        (event_type, user_id, username, ip_address, user_agent, resource, action, details, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
      [event_type, user_id, username, ip_address, user_agent, resource, action, details ? JSON.stringify(details) : null, status]
    );

    return result.rows[0] || null;
  },

  /**
   * Find all audit logs with pagination
   */
  async findAll(limit = 100, offset = 0) {
    const result = await query(
      `
        SELECT * FROM audit_logs
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );
    return result.rows;
  },

  /**
   * Find audit log by ID
   */
  async findById(id) {
    const result = await query(
      `SELECT * FROM audit_logs WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find audit logs by user ID
   */
  async findByUserId(userId, limit = 50, offset = 0) {
    const result = await query(
      `
        SELECT * FROM audit_logs
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `,
      [userId, limit, offset]
    );
    return result.rows;
  },

  /**
   * Find audit logs by username
   */
  async findByUsername(username, limit = 50, offset = 0) {
    const result = await query(
      `
        SELECT * FROM audit_logs
        WHERE username = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `,
      [username, limit, offset]
    );
    return result.rows;
  },

  /**
   * Find audit logs by IP address
   */
  async findByIpAddress(ipAddress, limit = 50, offset = 0) {
    const result = await query(
      `
        SELECT * FROM audit_logs
        WHERE ip_address = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `,
      [ipAddress, limit, offset]
    );
    return result.rows;
  },

  /**
   * Get failed authentication attempts
   */
  async getFailedAuthAttempts(limit = 50, offset = 0) {
    const result = await query(
      `
        SELECT * FROM audit_logs
        WHERE event_type IN ('AUTH_FAILURE', 'AUTH_LOCKOUT')
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );
    return result.rows;
  },

  /**
   * Get access control denials
   */
  async getAccessDenials(limit = 50, offset = 0) {
    const result = await query(
      `
        SELECT * FROM audit_logs
        WHERE event_type = 'ACCESS_DENIED'
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );
    return result.rows;
  },

  /**
   * Get validation failures
   */
  async getValidationFailures(limit = 50, offset = 0) {
    const result = await query(
      `
        SELECT * FROM audit_logs
        WHERE event_type = 'VALIDATION_FAILURE'
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );
    return result.rows;
  },

  /**
   * Get recent logs within specified hours
   */
  async getRecentLogs(hours = 24, limit = 100) {
    const result = await query(
      `
        SELECT * FROM audit_logs
        WHERE created_at >= NOW() - INTERVAL '${hours} hours'
        ORDER BY created_at DESC
        LIMIT $1
      `,
      [limit]
    );
    return result.rows;
  },

  /**
   * Get total count of audit logs
   */
  async count() {
    const result = await query(`SELECT COUNT(*) FROM audit_logs`);
    return parseInt(result.rows[0].count, 10);
  },

  /**
   * Get count by event type
   */
  async countByEventType(eventType) {
    const result = await query(
      `SELECT COUNT(*) FROM audit_logs WHERE event_type = $1`,
      [eventType]
    );
    return parseInt(result.rows[0].count, 10);
  },

  /**
   * Delete audit logs older than specified days
   */
  async deleteOlderThan(days = 90) {
    const result = await query(
      `
        DELETE FROM audit_logs
        WHERE created_at < NOW() - INTERVAL '${days} days'
        RETURNING id
      `
    );
    return result.rowCount;
  },
};
