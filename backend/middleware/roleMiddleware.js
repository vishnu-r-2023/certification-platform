const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    res.status(403);
    throw new Error("Access denied. You do not have permission to perform this action.");
  }

  next();
};

module.exports = { authorizeRoles };
