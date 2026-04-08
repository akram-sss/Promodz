// middleware/authorize.js
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      console.warn("Unauthorized request: no user info on req");
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(userRole)) {
      console.warn(`Forbidden: user role '${userRole}' not allowed. Allowed: ${allowedRoles}`);
      return res.status(403).json({ error: "Forbidden: insufficient permissions" });
    }

    next();
  };
}
