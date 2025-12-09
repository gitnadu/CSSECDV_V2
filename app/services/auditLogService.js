/**
 * AuditLogService - Business logic for audit logging
 * Provides helpers to extract request context and log events
 */

import { AuditLogRepository } from "lib/auditLogRepository";

class AuditLogService {
  /**
   * Extract IP address from NextJS request
   */
  static getClientIp(req) {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "unknown";
    return ip;
  }

  /**
   * Extract User-Agent from request
   */
  static getUserAgent(req) {
    return req.headers.get("user-agent") || "unknown";
  }

  /**
   * Log validation failure
   */
  async logValidationFailure(req, username, resource, details) {
    try {
      const result = await AuditLogRepository.create({
        event_type: "VALIDATION_FAILURE",
        username,
        ip_address: AuditLogService.getClientIp(req),
        user_agent: AuditLogService.getUserAgent(req),
        resource,
        action: req.method,
        details,
        status: "FAILURE",
      });
      
      return result;
    } catch (err) {
      console.error("ERROR");
    }
  }

  /**
   * Log successful authentication
   */
  async logAuthSuccess(req, userId, username) {
    try {
      const result = await AuditLogRepository.create({
        event_type: "AUTH_SUCCESS",
        user_id: userId,
        username,
        ip_address: AuditLogService.getClientIp(req),
        user_agent: AuditLogService.getUserAgent(req),
        resource: "/api/auth/login",
        action: "POST",
        status: "SUCCESS",
      });
      
      return result;
    } catch (err) {
      console.error("ERROR");
    }
  }

  /**
   * Log failed authentication attempt
   */
  async logAuthFailure(req, username, reason = "Invalid credentials") {
    try {
      const result = await AuditLogRepository.create({
        event_type: "AUTH_FAILURE",
        username,
        ip_address: AuditLogService.getClientIp(req),
        user_agent: AuditLogService.getUserAgent(req),
        resource: "/api/auth/login",
        action: "POST",
        details: { reason },
        status: "FAILURE",
      });

      return result;
    } catch (err) {
      console.error("ERROR");
    }
  }

  /**
   * Log account lockout
   */
  async logAuthLockout(req, username, attemptCount) {
    try {
      const result = await AuditLogRepository.create({
        event_type: "AUTH_LOCKOUT",
        username,
        ip_address: AuditLogService.getClientIp(req),
        user_agent: AuditLogService.getUserAgent(req),
        resource: "/api/auth/login",
        action: "POST",
        details: { reason: "Too many failed attempts", attemptCount },
        status: "BLOCKED",
      });

      return result;
    } catch (err) {
      console.error("ERROR");
    }
  }

  /**
   * Log access control failure
   */
  async logAccessDenied(req, userId, username, resource, reason = "Unauthorized") {
    try {
      const result = await AuditLogRepository.create({
        event_type: "ACCESS_DENIED",
        user_id: userId,
        username,
        ip_address: AuditLogService.getClientIp(req),
        user_agent: AuditLogService.getUserAgent(req),
        resource,
        action: req.method,
        details: { reason },
        status: "FAILURE",
      });
      
      return result;
    } catch (err) {
     console.error("ERROR");
    }
  }

  /**
   * Log password change
   */
  async logPasswordChange(req, userId, username) {
    try {
      const result = await AuditLogRepository.create({
        event_type: "PASSWORD_CHANGE",
        user_id: userId,
        username,
        ip_address: AuditLogService.getClientIp(req),
        user_agent: AuditLogService.getUserAgent(req),
        resource: "/api/auth/change-password",
        action: "POST",
        status: "SUCCESS",
      });
      
      return result;
    } catch (err) {
      console.error("ERROR");
    }
  }

  /**
   * Log account creation
   */
  async logAccountCreated(req, userId, username, role) {
    try {
      const result = await AuditLogRepository.create({
        event_type: "ACCOUNT_CREATED",
        user_id: userId,
        username,
        ip_address: AuditLogService.getClientIp(req),
        user_agent: AuditLogService.getUserAgent(req),
        resource: "/api/auth/register",
        action: "POST",
        details: { role },
        status: "SUCCESS",
      });
      
      return result;
    } catch (err) {
      console.error("ERROR");
    }
  }

  /**
   * Log role change
   */
  async logRoleChange(req, adminId, adminUsername, targetUserId, targetUsername, newRole) {
    try {
      const result = await AuditLogRepository.create({
        event_type: "ROLE_CHANGE",
        user_id: adminId,
        username: adminUsername,
        ip_address: AuditLogService.getClientIp(req),
        user_agent: AuditLogService.getUserAgent(req),
        resource: `/api/admin/users/${targetUserId}`,
        action: "PATCH",
        details: { targetUserId, targetUsername, newRole },
        status: "SUCCESS",
      });
      
      return result;
    } catch (err) {
      console.error("ERROR");
    }
  }

  /**
   * Log data modification (create/update/delete)
   */
  async logDataModification(req, userId, username, resource, action, details) {
    try {
      const result = await AuditLogRepository.create({
        event_type: "DATA_MODIFICATION",
        user_id: userId,
        username,
        ip_address: AuditLogService.getClientIp(req),
        user_agent: AuditLogService.getUserAgent(req),
        resource,
        action,
        details,
        status: "SUCCESS",
      });
      
      return result;
    } catch (err) {
      console.error("ERROR");
    }
  }

  /**
   * Get recent audit logs (admin view)
   */
  async getRecentLogs(hours = 24, limit = 100) {
    try {
      return await AuditLogRepository.getRecentLogs(hours, limit);
    } catch (err) {
      console.error("ERROR");
      return [];
    }
  }

  /**
   * Get all audit logs paginated (admin view)
   */
  async getAllLogs(limit = 100, offset = 0) {
    try {
      return await AuditLogRepository.findAll(limit, offset);
    } catch (err) {
      console.error("ERROR");
      return [];
    }
  }

  /**
   * Get logs by event type (admin view)
   */
  async getLogsByEventType(eventType, limit = 50, offset = 0) {
    try {
      return await AuditLogRepository.findByEventType(eventType, limit, offset);
    } catch (err) {
      console.error("ERROR");
      return [];
    }
  }
}

export default new AuditLogService();
