const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ---------------------------------------------
// Middleware to protect private routes
// ---------------------------------------------
exports.protect = async (req, res, next) => {
    let token;

    try {
        // Extract token from Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        // If no token, deny access
        if (!token) {
            return res.status(401).json({
                message: "Not authorized. Token missing.",
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");

        // Fetch user from database (excluding password)
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                message: "Not authorized. User not found.",
            });
        }

        // Deny access if account was disabled (future feature)
        if (user.status === "disabled") {
            return res.status(403).json({
                message: "Account disabled. Contact support.",
            });
        }

        // Attach user to request object
        req.user = user;

        next();
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(401).json({
            message: "Not authorized. Invalid or expired token.",
        });
    }
};
