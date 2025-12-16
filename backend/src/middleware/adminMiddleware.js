// Middleware: Allow only Admin-level users to access admin routes
exports.adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized. No user found." });
    }

    // Allowed roles for admin dashboard
    const allowedRoles = ["admin", "superadmin"];

    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            message: "Access denied. Admin or Superadmin role required.",
            yourRole: req.user.role
        });
    }

    next();
};
