# Money Mate - Admin Roles & Permissions

## Overview
Money Mate uses a **single-tier admin system** with clearly defined boundaries to protect user financial privacy while enabling effective system management. The admin role is designed for **system operations, user support, and platform maintenance** — NOT for accessing individual financial data.

---

## Admin Role Definition

### Role: **System Administrator**

**Purpose**: Maintain platform health, manage users, monitor system performance, and provide technical support while respecting user financial privacy.

**Access Level**: System-wide administrative access with explicit restrictions on personal financial data.

---

## 🔐 Core Principles

1. **Privacy First**: Admin cannot view individual transaction details, amounts, or descriptions
2. **Aggregated Data Only**: Admin sees statistical summaries, never itemized personal data
3. **Need-to-Know Basis**: Access only to information necessary for system operations
4. **Audit Everything**: All admin actions are logged and timestamped
5. **User Consent Required**: Any access to personal data requires explicit user permission or legal obligation

---

## ✅ Admin Responsibilities

### 1. System Monitoring & Health
- Monitor server uptime and performance
- Track API response times and error rates
- Review system-wide usage statistics
- Identify and resolve technical issues
- Manage database backups and recovery

### 2. User Management
- Create, activate, or deactivate user accounts
- Reset user passwords (via secure token system)
- Verify user email addresses
- Handle account suspension/deletion requests
- Manage user roles (admin vs. regular user)

### 3. Platform Maintenance
- Apply security patches and updates
- Manage application configurations
- Monitor database performance
- Optimize system resources
- Schedule maintenance windows

### 4. Support & Troubleshooting
- Respond to user support tickets
- Investigate reported bugs
- Guide users through technical issues
- Escalate critical problems
- Document known issues and solutions

### 5. Analytics & Reporting
- Review platform-wide usage metrics
- Generate system health reports
- Track user growth and retention
- Monitor feature adoption rates
- Analyze performance trends

### 6. Security Management
- Review security logs for suspicious activity
- Monitor failed login attempts
- Manage IP blacklists/whitelists
- Respond to security incidents
- Enforce security policies

---

## ✅ Allowed Actions

### User Account Management
- ✓ View user list (name, email, join date, status, role)
- ✓ Search users by name or email
- ✓ Change user status (active/inactive/suspended)
- ✓ Assign/remove admin privileges
- ✓ Initiate password reset emails
- ✓ View user login history (dates/times only, not IP addresses unless investigating abuse)
- ✓ Delete user accounts (with confirmation, per user request)
- ✓ View account creation dates and last activity timestamps

### System Statistics (Aggregated Data Only)
- ✓ Total number of users (active, inactive, new)
- ✓ Total transaction count (system-wide)
- ✓ Total budgets and savings goals count
- ✓ Platform-wide income/expense totals (aggregated)
- ✓ Number of notifications sent
- ✓ Most popular transaction categories (aggregated across all users)
- ✓ Average user engagement metrics (logins per week, etc.)

### Activity Monitoring
- ✓ View admin activity logs (who did what, when)
- ✓ Track failed login attempts (to detect brute force attacks)
- ✓ Monitor API usage and rate limits
- ✓ Review error logs and exceptions
- ✓ Track system performance metrics (CPU, memory, database queries)

### Content Management
- ✓ Manage system notifications and announcements
- ✓ Update help documentation
- ✓ Configure app settings (currency formats, date formats, etc.)
- ✓ Manage default budget categories
- ✓ Configure email templates

### Technical Operations
- ✓ Run database migrations
- ✓ Clear application cache
- ✓ Trigger manual backups
- ✓ Export system logs for debugging
- ✓ Restart application services (if necessary)

---

## ❌ Restricted Actions (PROHIBITED)

### Personal Financial Data Access
- ✗ **View individual transaction amounts**
- ✗ **View transaction descriptions or merchant names**
- ✗ **See user account balances**
- ✗ **Access budget details or spending limits**
- ✗ **View savings goal amounts or progress**
- ✗ **See income/expense breakdowns for specific users**
- ✗ **Access transaction dates tied to specific users**
- ✗ **View user-created categories or notes**

### Account Credentials
- ✗ **View or access user passwords (encrypted)**
- ✗ **Decrypt stored sensitive data**
- ✗ **Access user authentication tokens**
- ✗ **Log in as another user (impersonation)**

### Data Modification (Without User Request)
- ✗ **Modify user transactions**
- ✗ **Change user budgets or goals**
- ✗ **Delete user financial records without explicit request**
- ✗ **Alter user preferences without consent**

### Bulk Operations (Privacy Risk)
- ✗ **Export user financial data in bulk**
- ✗ **Generate reports containing personal financial details**
- ✗ **Share user data with third parties without consent**
- ✗ **Run queries that expose individual user patterns**

---

## 🔒 Security Rules for Admins

### Authentication & Access
1. **Multi-Factor Authentication (MFA)**: Mandatory for all admin accounts
2. **Strong Password Policy**: Minimum 12 characters, alphanumeric + symbols
3. **Session Timeout**: Auto-logout after 30 minutes of inactivity
4. **IP Whitelisting**: Admin access restricted to approved IP addresses (optional but recommended)
5. **Single Active Session**: Only one admin session allowed at a time

### Data Handling
6. **No Screenshots**: Never capture or save screenshots of admin panels containing user data
7. **No Data Exports**: Personal financial data cannot be exported to local files
8. **Encrypted Communication**: All admin API calls use HTTPS with TLS 1.3+
9. **No Public Networks**: Admin access prohibited from public Wi-Fi or unsecured networks

### Operational Security
10. **Separate Admin Account**: Admin must use distinct credentials from personal user account
11. **Password Rotation**: Change admin password every 90 days
12. **Activity Reviews**: Monthly review of own admin actions
13. **Incident Reporting**: Immediately report any security concerns or data breaches
14. **No Sharing Credentials**: Admin credentials are personal and non-transferable

### Compliance
15. **GDPR/Privacy Laws**: Follow all applicable data protection regulations
16. **User Consent**: Obtain explicit consent before accessing personal data (exceptions: legal requirements, critical bugs)
17. **Data Retention**: Follow defined data retention policies (e.g., delete inactive accounts after 2 years)
18. **Right to Erasure**: Honor user data deletion requests within 30 days

---

## 📋 Audit & Logging Requirements

### What Gets Logged (Automatically)
Every admin action is logged with:
- **Admin User ID** and username
- **Action Type** (e.g., "User Suspended", "Password Reset", "Settings Changed")
- **Target User/Resource** (user ID, not personal data)
- **Timestamp** (UTC)
- **IP Address** (for security monitoring)
- **Success/Failure Status**
- **Reason/Notes** (if provided by admin)

### Logged Actions Include:
- User account modifications (create, update, delete, suspend)
- Role changes (promoting/demoting admins)
- Password reset requests
- System configuration changes
- Database query executions (for sensitive tables)
- Failed login attempts (admin dashboard)
- Data exports or report generations
- Bulk operations affecting multiple users

### Log Retention
- **Activity Logs**: Retained for **2 years**
- **Security Logs**: Retained for **5 years** (compliance requirement)
- **Logs Are Immutable**: Cannot be edited or deleted by admins
- **Regular Reviews**: Monthly audit of admin activity by designated reviewer

### Alerting
Automated alerts triggered for:
- Multiple failed login attempts (5+ within 10 minutes)
- Admin role granted to new user
- Bulk user deletions (10+ users in 1 hour)
- Database direct access outside maintenance windows
- Unusual activity patterns (e.g., logins at odd hours)

---

## 🛡️ Best-Practice Permissions

### Principle of Least Privilege
Admins have **minimal necessary permissions** to perform their duties. Default deny approach: if a permission isn't explicitly granted, it's denied.

### Permission Tiers (Future Scalability)
While Money Mate currently uses a single admin role, consider these tiers for growth:

| Tier | Role | Permissions |
|------|------|-------------|
| **Tier 1** | Support Agent | View user list, reset passwords, read-only analytics |
| **Tier 2** | System Admin | All Tier 1 + user management, system config, logs |
| **Tier 3** | Super Admin | All Tier 2 + database access, role management, exports |

**Current Implementation**: All admins operate at **Tier 2** level.

### Data Minimization
- Admin dashboards show only **aggregated, anonymized data**
- User identifiers are shown as **User IDs**, not names, when viewing transaction counts
- Financial amounts displayed as **ranges** (e.g., "500-1000") not exact values in reports

### Consent-Based Access
For rare cases requiring personal data access (e.g., critical bug affecting specific user):
1. Admin submits **access request** with justification
2. System sends **notification to user** requesting permission
3. User has **48 hours** to approve/deny
4. If approved, admin gets **temporary access** (24 hours max)
5. All actions during access window are **logged with heightened scrutiny**

### Regular Permission Reviews
- **Quarterly Review**: Verify admin still requires elevated access
- **Annual Recertification**: Admin must re-confirm understanding of policies
- **Post-Incident Review**: Any security event triggers permission audit

---

## 🔍 Sample Admin Dashboard Views

### ✅ What Admin CAN See

**User Management Panel:**
```
User ID  | Name            | Email               | Status  | Joined      | Last Login
---------|-----------------|---------------------|---------|-------------|------------
U12345   | John Doe        | john@example.com    | Active  | 2025-01-15  | 2025-11-27
U12346   | Jane Smith      | jane@example.com    | Active  | 2025-02-20  | 2025-11-26
```

**System Statistics Panel:**
```
Total Users: 1,234
Active Users (30 days): 987
New Users (This Month): 45
Total Transactions: 45,678 (aggregated across all users)
Total Budgets: 3,456
Platform-Wide Income: $1,234,567 (aggregated)
Platform-Wide Expenses: $987,654 (aggregated)
```

**Activity Log Panel:**
```
Timestamp            | Admin      | Action              | Target     | Status
---------------------|------------|---------------------|------------|--------
2025-11-27 10:30:00 | admin@app  | Password Reset      | U12345     | Success
2025-11-27 09:15:00 | admin@app  | User Suspended      | U12399     | Success
2025-11-26 14:20:00 | admin@app  | Role Changed        | U12400     | Success
```

### ❌ What Admin CANNOT See

**Individual Transaction View (BLOCKED):**
```
❌ PERMISSION DENIED
You do not have permission to view individual user transactions.
Reason: Privacy Protection - Personal Financial Data
```

**User Financial Details (BLOCKED):**
```
User: John Doe (U12345)
  ❌ Account Balance: [HIDDEN]
  ❌ Recent Transactions: [HIDDEN]
  ❌ Budget Details: [HIDDEN]
  ✓ Account Status: Active
  ✓ Joined: 2025-01-15
  ✓ Last Login: 2025-11-27
```

---

## 📊 Implementation Checklist

### Backend (Middleware & Database)
- [x] **Auth Middleware**: `protect` (authentication) + `admin` (role check)
- [x] **Role Field**: User model includes `role: 'admin' | 'user'`
- [x] **Activity Logging**: `ActivityLog` model tracks admin actions
- [ ] **Permission Guards**: Route-level checks for sensitive operations
- [ ] **Data Masking**: Aggregate queries hide personal details
- [ ] **Audit Triggers**: Database triggers log schema changes
- [ ] **Session Management**: Redis/JWT with expiration and revocation

### Frontend (Admin UI)
- [x] **Admin Routes**: Protected by `<AdminRoute>` component
- [x] **Dashboard Views**: Admin-specific pages (users, logs, stats)
- [ ] **Confirmation Dialogs**: For destructive actions (delete, suspend)
- [ ] **Activity Feed**: Real-time display of admin actions
- [ ] **Permission Badges**: Visual indicators of admin-only features
- [ ] **Data Redaction**: Personal data blurred/hidden in UI by default

### Security Measures
- [ ] **MFA Implementation**: TOTP-based two-factor authentication
- [ ] **Rate Limiting**: Prevent brute force (5 attempts per 15 min)
- [ ] **IP Whitelisting**: Optional firewall rules for admin endpoints
- [ ] **Encrypted Logs**: Activity logs encrypted at rest
- [ ] **Intrusion Detection**: Automated alerts for suspicious patterns
- [ ] **Regular Backups**: Daily encrypted backups with 30-day retention

### Compliance & Documentation
- [ ] **Privacy Policy Update**: Document admin access limitations
- [ ] **Terms of Service**: User agreement on data handling
- [ ] **Admin Handbook**: Detailed guide for admin operations
- [ ] **Incident Response Plan**: Protocol for security breaches
- [ ] **GDPR Compliance**: Data processing agreements, user rights
- [ ] **Annual Security Audit**: Third-party penetration testing

---

## 🚨 Incident Response Protocol

### If Admin Account is Compromised:
1. **Immediate Actions** (within 5 minutes):
   - Disable compromised admin account
   - Force logout of all admin sessions
   - Enable system-wide alert mode
   - Contact all other admins

2. **Investigation** (within 1 hour):
   - Review activity logs for unauthorized actions
   - Identify scope of breach (which data was accessed)
   - Check for data exfiltration attempts
   - Document timeline of events

3. **Containment** (within 24 hours):
   - Reset all admin passwords
   - Rotate API keys and secrets
   - Review and revoke suspicious sessions
   - Apply security patches if vulnerability identified

4. **User Notification** (within 72 hours, as legally required):
   - Notify affected users if personal data was accessed
   - Provide details on what happened and remediation steps
   - Offer credit monitoring if financial data was exposed

5. **Post-Incident Review** (within 1 week):
   - Conduct root cause analysis
   - Update security policies to prevent recurrence
   - Retrain admin on security best practices
   - Submit incident report to compliance team

---

## 📞 Admin Support & Escalation

### For Admin Users:
- **Technical Issues**: Open ticket at `admin-support@moneymate.app`
- **Permission Questions**: Review this document or consult development team
- **Security Concerns**: Email `security@moneymate.app` (urgent: call emergency hotline)
- **User Data Requests**: Submit formal request via admin panel with justification

### For Users:
- **Report Admin Abuse**: Email `privacy@moneymate.app` with details
- **Request Data Access Logs**: Users can request logs of admin actions on their account
- **Escalate Concerns**: Contact Data Protection Officer (DPO) if applicable

---

## 🎯 Summary: Admin Role at a Glance

| Category | What Admin CAN Do | What Admin CANNOT Do |
|----------|------------------|---------------------|
| **Users** | Manage accounts, reset passwords, view profiles | Access financial data, impersonate users |
| **Data** | View aggregated statistics, system-wide totals | See individual transactions, balances, budgets |
| **Security** | Monitor logs, track failed logins, manage alerts | View passwords, decrypt data, bypass audit logs |
| **Operations** | Configure system, manage backups, troubleshoot | Modify user data without request, export personal data |
| **Reporting** | Generate anonymized analytics, health reports | Create reports with personal financial details |

---

## ✅ Admin Oath (Optional but Recommended)

As an administrator of Money Mate, I pledge to:
- **Respect User Privacy**: Never access personal financial data without necessity or consent
- **Act Ethically**: Use admin privileges solely for platform improvement and user support
- **Maintain Security**: Follow all security protocols and report vulnerabilities promptly
- **Be Transparent**: Document actions and maintain accurate logs
- **Stay Compliant**: Adhere to all applicable laws, regulations, and company policies

---

## 📚 Related Documentation
- [API Documentation](./API_DOCUMENTATION.md) - Admin endpoints and permissions
- [Setup Guide](./SETUP.md) - Admin account creation and configuration
- [Security Best Practices](./SECURITY.md) - System-wide security guidelines
- [GDPR Compliance](./GDPR_COMPLIANCE.md) - Data protection regulations

---

**Document Version**: 1.0  
**Last Updated**: November 27, 2025  
**Next Review Date**: February 27, 2026  
**Owner**: Money Mate Development Team  
**Approved By**: [System Architect / Legal Counsel]

---

*For questions or clarifications on admin roles and permissions, contact the development team or consult the Money Mate Admin Handbook.*
