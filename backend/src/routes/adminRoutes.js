const express = require("express");
const router = express.Router();

const {
    getAllComplaints,
    updateComplaint,
    getAnalytics,
    deleteComplaint,
    generateResponse,
    getAllUsers,
    updateUserRole,
    deleteUser
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// ----------------------------------------------------
// ADMIN ROUTES (Protected, Admin or SuperAdmin Access)
// ----------------------------------------------------

// GET all complaints (with advanced filtering)
router.get("/complaints", protect, adminOnly, getAllComplaints);

// UPDATE complaint (status, category, urgency, assign staff, admin notes)
// UPDATE complaint (status, category, urgency, assign staff, admin notes)
router.put("/complaints/:id/update", protect, adminOnly, updateComplaint);

// Convenience route to only update status (used by admin UI)
router.put("/complaints/:id/status", protect, adminOnly, updateComplaint);

// DELETE complaint
router.delete("/complaints/:id", protect, adminOnly, deleteComplaint);

// Generate AI Response
router.post("/generate-response", protect, adminOnly, generateResponse);

// GET full analytics dashboard data
router.get("/analytics", protect, adminOnly, getAnalytics);

// ----------------------------------------------------
// USER MANAGEMENT ROUTES
// ----------------------------------------------------

// GET all users
router.get("/users", protect, adminOnly, getAllUsers);

// UPDATE user role
router.put("/users/:id/role", protect, adminOnly, updateUserRole);

// DELETE user
router.delete("/users/:id", protect, adminOnly, deleteUser);

module.exports = router;
