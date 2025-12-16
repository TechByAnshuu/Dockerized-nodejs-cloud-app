const express = require("express");
const router = express.Router();

const {
    createComplaint,
    getMyComplaints,
    getComplaintById,
    deleteComplaint,
    updateMyComplaint,
} = require("../controllers/complaintController");

const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

// ------------------------------------------
// Citizen Complaint Routes
// ------------------------------------------

// Create a new complaint (AI category, urgency, image upload, GPS support)
router.post("/", protect, upload.array('images', 3), createComplaint);

// Get logged-in user's complaints (with filtering, sorting later)
router.get("/", protect, getMyComplaints);

// Get a single complaint (to show complaint-details.html)
router.get("/:id", protect, getComplaintById);

// Update user's own complaint (allowed only before admin picks it up)
router.put("/:id", protect, upload.array('images', 3), updateMyComplaint);

// Allow citizen to delete complaints (optional, only if status is Pending)
router.delete("/:id", protect, deleteComplaint);

module.exports = router;
