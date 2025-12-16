const express = require("express");
const router = express.Router();

const {
    register,
    login,
    updateProfile
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// ------------------------------------------
// AUTH ROUTES
// ------------------------------------------

// Register a new user
router.post("/register", register);

// Login user
router.post("/login", login);

// (Future Feature) Verify user token & return profile
router.get("/me", protect, (req, res) => {
    res.json({ user: req.user });
});

// Update user profile
router.put("/me", protect, updateProfile);

// (Future Feature) Logout (frontend will simply clear token)
router.post("/logout", (req, res) => {
    return res.json({ message: "Logged out successfully" });
});

module.exports = router;
