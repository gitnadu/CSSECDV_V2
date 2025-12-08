# Audit Logging System

The audit logging system tracks and records all security-relevant events including:
- **Validation Failures**: Invalid input (out of range, incorrect characters, etc.)
- **Authentication Events**: Successful/failed login attempts and account lockouts
- **Access Control Failures**: Unauthorized attempts to access resources
- **Account Management**: Role changes, password changes, account creation
- **Data Modifications**: Create, update, delete operations on sensitive data

## Database Schema

### `audit_logs` Table

Created by migration: `007_create_audit_logs.sql`

```sql
- id: Primary key
- event_type: Type of audit event (enum: VALIDATION_FAILURE, AUTH_SUCCESS, AUTH_FAILURE, AUTH_LOCKOUT, ACCESS_DENIED, PASSWORD_CHANGE, ACCOUNT_CREATED, ROLE_CHANGE, DATA_MODIFICATION)
- user_id: Foreign key to users table (nullable for pre-auth events)
- username: Username of the actor (useful for failed auth where user_id unknown)
- ip_address: IP address of the request origin
- user_agent: Browser/client user agent string
- resource: API endpoint or resource being accessed
- action: HTTP method (GET, POST, PUT, DELETE, etc.)
- details: JSONB field for event-specific details (validation errors, failure reasons, etc.)
- status: SUCCESS, FAILURE, or BLOCKED
- created_at: Timestamp of the event
```

Indexes are created on `user_id`, `event_type`, `created_at`, `username`, and `ip_address` for efficient querying.

## Service Layer

### `AuditLogService` (`app/services/auditLogService.js`)

High-level service for logging events with automatic request context extraction.

**Methods:**

```javascript
// Validation failures
logValidationFailure(req, username, resource, details)

// Authentication events
logAuthSuccess(req, userId, username)
logAuthFailure(req, username, reason)
logAuthLockout(req, username, attemptCount)

// Access control
logAccessDenied(req, userId, username, resource, reason)

// Account management
logPasswordChange(req, userId, username)
logAccountCreated(req, userId, username, role)
logRoleChange(req, adminId, adminUsername, targetUserId, targetUsername, newRole)

// Data modifications
logDataModification(req, userId, username, resource, action, details)

// Retrieval (admin)
getRecentLogs(hours, limit)
getAllLogs(limit, offset)
getLogsByEventType(eventType, limit, offset)
```

### `AuditLogRepository` (`lib/auditLogRepository.js`)

Low-level database access layer.

**Methods:**

```javascript
create(auditData)
findAll(limit, offset)
findByUserId(userId, limit, offset)
findByEventType(eventType, limit, offset)
findByIpAddress(ipAddress, limit, offset)
getFailedAuthAttempts(username, withinHours)
getAccessDenials(limit, offset)
getValidationFailures(limit, offset)
getRecentLogs(hours, limit)
count()
countByEventType(eventType)
```

## Integration Points

### 1. Authentication Logging

In `app/api/auth/login/route.js`:

```javascript
import AuditLogService from "@/services/auditLogService";

// After successful authentication
await AuditLogService.logAuthSuccess(req, user.id, user.username);

// On failed authentication
await AuditLogService.logAuthFailure(req, username, "Invalid credentials");

// On account lockout (when implementing rate limiting)
await AuditLogService.logAuthLockout(req, username, attemptCount);
```

### 2. Validation Logging

In any validation-heavy API route:

```javascript
import AuditLogService from "@/services/auditLogService";

if (!isValidInput(data)) {
  await AuditLogService.logValidationFailure(req, username, "/api/endpoint", {
    field: "email",
    error: "Invalid email format"
  });
  return NextResponse.json({ error: "Validation failed" }, { status: 400 });
}
```

### 3. Access Control Logging

In API routes with role checks:

```javascript
import AuditLogService from "@/services/auditLogService";

if (decoded.role !== 'admin') {
  await AuditLogService.logAccessDenied(
    req,
    decoded.id,
    decoded.username,
    "/api/admin/audit-logs",
    "Non-admin attempted to access admin resource"
  );
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

### 4. Admin Operations Logging

When admins change roles or modify data:

```javascript
import AuditLogService from "@/services/auditLogService";

await AuditLogService.logRoleChange(
  req,
  adminId,
  adminUsername,
  targetUserId,
  targetUsername,
  newRole
);
```

## API Endpoints

### GET `/api/admin/audit-logs`

Admin-only endpoint to retrieve audit logs.

**Query Parameters:**
- `limit`: Number of results per page (default: 100)
- `offset`: Pagination offset (default: 0)
- `eventType`: Filter by event type (optional)

**Example:**

```bash
# Get all audit logs
curl "http://localhost:3000/api/admin/audit-logs?limit=50" \
  -H "Cookie: session=<token>"

# Get failed auth attempts
curl "http://localhost:3000/api/admin/audit-logs?eventType=AUTH_FAILURE&limit=50" \
  -H "Cookie: session=<token>"

# Get access denials
curl "http://localhost:3000/api/admin/audit-logs?eventType=ACCESS_DENIED&limit=50" \
  -H "Cookie: session=<token>"

# Get validation failures
curl "http://localhost:3000/api/admin/audit-logs?eventType=VALIDATION_FAILURE&limit=50" \
  -H "Cookie: session=<token>"
```

**Response:**

```json
{
  "success": true,
  "logs": [
    {
      "id": 1,
      "event_type": "AUTH_FAILURE",
      "user_id": null,
      "username": "student1",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "resource": "/api/auth/login",
      "action": "POST",
      "details": {
        "reason": "Invalid credentials"
      },
      "status": "FAILURE",
      "created_at": "2025-12-09T15:30:45.123Z"
    }
  ],
  "limit": 50,
  "offset": 0
}
```

## Admin UI

### AuditLogsView Component

Located at: `app/views/components/AuditLogsView.jsx`

The admin dashboard includes an "Audit Logs" tab that displays:

- **Tabs for filtering by event type:**
  - All Events
  - Auth Failures
  - Access Denied
  - Validation Failures
  - Lockouts

- **Table columns:**
  - Timestamp
  - Event Type (with color-coded badges)
  - Username
  - IP Address
  - Resource
  - Status
  - Details (expandable JSON view)

- **Pagination:** Next/Previous buttons for browsing large log sets

**Access Control:** Only users with `admin` role can view audit logs. Non-admins see an access denied message and their attempt is logged.

## Usage Examples

### Scenario 1: Monitor Failed Login Attempts

Admin navigates to Dashboard → Admin View → Audit Logs tab:
1. Click "Auth Failures" filter
2. View all failed login attempts with timestamps, usernames, and IP addresses
3. Click "Show" in Details column to see failure reasons

### Scenario 2: Track Unauthorized Access Attempts

1. Filter by "Access Denied" event type
2. Review which resources were attempted and from which IP addresses
3. Identify potential security threats or misconfigured clients

### Scenario 3: Audit Input Validation Issues

1. Filter by "Validation" event type
2. View which fields are causing validation errors
3. Identify patterns in invalid submissions (potential attacks or UX problems)

### Scenario 4: Review Admin Actions

Filter by "ROLE_CHANGE" or "DATA_MODIFICATION" to see:
- Who made changes
- What changed
- When it occurred
- From which IP address

## Implementation Checklist

- [x] Create `audit_logs` table migration
- [x] Create `AuditLogRepository` for database access
- [x] Create `AuditLogService` for event logging
- [x] Create `AdminAuditService` for admin queries
- [x] Create `/api/admin/audit-logs` endpoint
- [x] Create `AuditLogsView` component
- [x] Integrate `AuditLogsView` into `AdminView`
- [ ] Add logging to authentication routes
- [ ] Add logging to validation handlers
- [ ] Add logging to access control checks
- [ ] Add logging to admin operations
- [ ] Add logging to data modification endpoints

## Security Notes

1. **Audit logs are immutable** - once created, they should not be modified
2. **Access control is enforced** - only admins can view audit logs
3. **PII is logged cautiously** - usernames, IPs, and user agents are logged for security analysis
4. **Details field is flexible** - JSONB allows storing event-specific information without schema changes
5. **Indexes are optimized** - for efficient filtering by event type, user, IP, and timestamp

## Best Practices

1. **Always log before returning errors** - capture the security event first
2. **Include context in details** - reason for failure, validation errors, etc.
3. **Use consistent event types** - makes filtering and analysis easier
4. **Review logs regularly** - admin should monitor for suspicious patterns
5. **Archive old logs** - implement a retention policy to manage database size
