
const jwt = require("jsonwebtoken");

// Verify JWT token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access token required. Please login.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token. Please login again.",
    });
  }
};

// Check the authenticated user's role
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        message: "Authenticated user role is missing.",
      });
    }

    const userRole = String(req.user.role).toLowerCase();
    const roles = allowedRoles.map((role) => role.toLowerCase());

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

// Export both middlewares
module.exports = authMiddleware;
module.exports.roleMiddleware = roleMiddleware;
