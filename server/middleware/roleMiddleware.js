/**
 * ══════════════════════════════════════════════════════════════
 *  Role-Based Access Control (RBAC) Middleware
 *  (PO6 — Engineer & Society: Access control & Privilege separation)
 * ══════════════════════════════════════════════════════════════
 */

/**
 * Restricts route access to one or more allowed roles
 * Allowed roles: 'user', 'admin', 'operator'
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to permission verification',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};

const requireAdmin = requireRole('admin');
const requireOperatorOrAdmin = requireRole('operator', 'admin');

module.exports = {
  requireRole,
  requireAdmin,
  requireOperatorOrAdmin,
};
