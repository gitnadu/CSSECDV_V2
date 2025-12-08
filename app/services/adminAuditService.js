/**
 * AdminAuditService - Client-side service for fetching audit logs via API
 * Used by SessionProvider and components to retrieve audit logs
 */

import api from "lib/api";

class AdminAuditService {
  /**
   * Get all audit logs with pagination
   */
  async getAuditLogs(limit = 100, offset = 0) {
    try {
      const data = await api.get(`/api/admin/audit-logs?limit=${limit}&offset=${offset}`);
      if (process.env.NODE_ENV === 'development') {
        console.log('[AdminAuditService] getAuditLogs response:', data);
      }
      return { success: true, logs: data.logs || [] };
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[AdminAuditService] getAuditLogs error:', err);
      }
      return { success: false, logs: [], error: err.message || "Failed to fetch audit logs" };
    }
  }

  /**
   * Get audit logs filtered by event type
   */
  async getAuditLogsByEventType(eventType, limit = 50, offset = 0) {
    try {
      const data = await api.get(`/api/admin/audit-logs?eventType=${eventType}&limit=${limit}&offset=${offset}`);
      if (process.env.NODE_ENV === 'development') {
        console.log('[AdminAuditService] getAuditLogsByEventType response:', eventType, data);
      }
      return { success: true, logs: data.logs || [] };
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[AdminAuditService] getAuditLogsByEventType error:', eventType, err);
      }
      return { success: false, logs: [], error: err.message || "Failed to fetch audit logs" };
    }
  }

  /**
   * Get failed authentication attempts
   */
  async getFailedAuthAttempts(limit = 50, offset = 0) {
    try {
      const data = await api.get(`/api/admin/audit-logs?eventType=AUTH_FAILURE&limit=${limit}&offset=${offset}`);
      return { success: true, logs: data.logs || [] };
    } catch (err) {
      return { success: false, logs: [], error: err.message || "Failed to fetch auth failures" };
    }
  }

  /**
   * Get access control denials
   */
  async getAccessDenials(limit = 50, offset = 0) {
    try {
      const data = await api.get(`/api/admin/audit-logs?eventType=ACCESS_DENIED&limit=${limit}&offset=${offset}`);
      return { success: true, logs: data.logs || [] };
    } catch (err) {
      return { success: false, logs: [], error: err.message || "Failed to fetch access denials" };
    }
  }

  /**
   * Get validation failures
   */
  async getValidationFailures(limit = 50, offset = 0) {
    try {
      const data = await api.get(`/api/admin/audit-logs?eventType=VALIDATION_FAILURE&limit=${limit}&offset=${offset}`);
      return { success: true, logs: data.logs || [] };
    } catch (err) {
      return { success: false, logs: [], error: err.message || "Failed to fetch validation failures" };
    }
  }

  /**
   * Get auth lockout events
   */
  async getAuthLockouts(limit = 50, offset = 0) {
    try {
      const data = await api.get(`/api/admin/audit-logs?eventType=AUTH_LOCKOUT&limit=${limit}&offset=${offset}`);
      return { success: true, logs: data.logs || [] };
    } catch (err) {
      return { success: false, logs: [], error: err.message || "Failed to fetch auth lockouts" };
    }
  }
}

export default new AdminAuditService();
