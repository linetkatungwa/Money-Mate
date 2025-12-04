import ActivityLog from '../models/ActivityLog.js';

/**
 * Middleware to log user activities
 * This should be used after protect middleware so req.user is available
 */
export const logActivity = (action, entityType, options = {}) => {
  return async (req, res, next) => {
    // Store the original json method
    const originalJson = res.json;

    // Override res.json to log after successful response
    res.json = function(data) {
      // Only log if the request was successful
      if (data && data.success) {
        // Capture the entity ID from the response data or request params
        const entityId = options.getEntityId 
          ? options.getEntityId(req, data) 
          : data.data?._id || req.params.id || null;

        // Capture description
        const description = options.getDescription 
          ? options.getDescription(req, data)
          : options.description || `${action.replace(/_/g, ' ')}`;

        // Create activity log (async, don't wait)
        ActivityLog.create({
          userId: req.user?.id || null,
          action,
          entityType,
          entityId,
          description,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          metadata: options.includeMetadata ? {
            method: req.method,
            path: req.originalUrl,
            body: sanitizeBody(req.body)
          } : undefined
        }).catch(err => {
          console.error('Activity logging error:', err);
          // Don't fail the request if logging fails
        });
      }

      // Call the original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Helper to create activity log manually
 * Use this for custom logging scenarios
 */
export const createActivityLog = async (userId, action, entityType, options = {}) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      entityType,
      entityId: options.entityId || null,
      description: options.description || `${action.replace(/_/g, ' ')}`,
      ipAddress: options.ipAddress || null,
      userAgent: options.userAgent || null,
      metadata: options.metadata || null
    });
  } catch (error) {
    console.error('Manual activity logging error:', error);
  }
};

/**
 * Sanitize request body to remove sensitive information
 */
const sanitizeBody = (body) => {
  if (!body) return null;
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.confirmPassword;
  delete sanitized.currentPassword;
  delete sanitized.newPassword;
  delete sanitized.token;
  
  return sanitized;
};

export default { logActivity, createActivityLog };
