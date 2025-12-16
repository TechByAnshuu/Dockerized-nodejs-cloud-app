const Complaint = require("../models/Complaint");
const User = require("../models/User");

/* ----------------------------------------------------
   GET ALL COMPLAINTS (ADMIN / STAFF)
   Supports:
   - Filtering
   - Search
   - Sorting
   - Department-based view
   - Pagination
----------------------------------------------------- */
exports.getAllComplaints = async (req, res) => {
    try {
        const {
            status,
            category,
            urgency,
            search,
            assignedTo,
            sort = "-createdAt",
        } = req.query;

        let filter = {};

        // Department-based filtering for staff accounts
        if (req.user.role === "staff") {
            filter.category = req.user.department;
            // Staff cannot override category filter
        } else {
            // Admin can filter by category
            if (category) filter.category = category;
        }

        // Common filters
        if (status) filter.status = status;
        if (urgency) filter.urgency = Number(urgency);
        if (assignedTo) filter.assignedTo = assignedTo;

        // Search across title, description, location
        if (search) {
            filter.$or = [
                { title: new RegExp(search, "i") },
                { description: new RegExp(search, "i") },
                { location: new RegExp(search, "i") },
            ];
        }

        // Execute query with pagination manually
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;

        const complaints = await Complaint.find(filter)
            .populate("user", "name email")
            .populate("assignedTo", "name email role")
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await Complaint.countDocuments(filter);

        res.json({
            count: total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            complaints: complaints,
        });

    } catch (error) {
        console.error("GetAllComplaints Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

/* ----------------------------------------------------
   UPDATE COMPLAINT STATUS + STAFF ASSIGN + CATEGORY OVERRIDE
   PUT /api/admin/complaints/:id/update
----------------------------------------------------- */
exports.updateComplaint = async (req, res) => {
    try {
        const { status, category, urgency, severity, assignedTo, adminNote } = req.body;

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        // Authorization check: Only admin or superadmin can update
        if (!["admin", "superadmin"].includes(req.user.role)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Allowed update fields
        if (status) complaint.status = status;
        if (category) complaint.category = category;
        if (urgency) complaint.urgency = urgency;

        if (severity && typeof severity === "object") {
            complaint.severity = {
                ...complaint.severity,
                ...severity,
            };
        }

        // Assign case to staff
        if (assignedTo) {
            const staff = await User.findById(assignedTo);
            if (!staff || staff.role !== "staff") {
                return res.status(400).json({ message: "Invalid staff user" });
            }
            complaint.assignedTo = staff._id;
        }

        // Add admin notes (audit log)
        if (adminNote) {
            if (!complaint.adminNotes) complaint.adminNotes = [];
            complaint.adminNotes.push({
                note: adminNote,
                createdAt: new Date(),
                admin: req.user._id,
            });
        }

        // Add to Timeline (User Facing Updates)
        const { replyMessage } = req.body;
        if (replyMessage) {
            complaint.timeline.push({
                status: status || complaint.status,
                message: replyMessage,
                timestamp: new Date()
            });
        } else if (status && status !== complaint.status) {
            // If status changed but NO custom message, let the pre-save hook handle generic message,
            // OR handle it here and disable hook? The hook is good for simple updates.
            // We'll let the hook runs, BUT if we pushed above, the hook might push duplicate if status changed?
            // The hook checks `this.isModified('status')`.
            // If we set `complaint.status = status` earlier, it is modified.
        }

        await complaint.save();

        // Populate for response
        await complaint.populate("user", "name email");
        await complaint.populate("assignedTo", "name email role");

        res.json({
            message: "Complaint updated successfully",
            complaint,
        });

    } catch (error) {
        console.error("UpdateComplaint Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

/* ----------------------------------------------------
   ADVANCED ANALYTICS FOR DASHBOARD
   GET /api/admin/analytics
----------------------------------------------------- */
exports.getAnalytics = async (req, res) => {
    try {
        // Authorization check: Only admin or superadmin can access analytics
        if (!["admin", "superadmin"].includes(req.user.role)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const total = await Complaint.countDocuments();

        // STATUS BREAKDOWN (as object map)
        const byStatusArr = await Complaint.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        const byStatus = byStatusArr.reduce((acc, cur) => {
            acc[cur._id] = cur.count;
            return acc;
        }, {});

        // CATEGORY BREAKDOWN (as object map)
        const byCategoryArr = await Complaint.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
        ]);
        const byCategory = byCategoryArr.reduce((acc, cur) => {
            acc[cur._id] = cur.count;
            return acc;
        }, {});

        // URGENCY BREAKDOWN (as object map)
        const byUrgencyArr = await Complaint.aggregate([
            { $group: { _id: "$urgency", count: { $sum: 1 } } },
        ]);
        const byUrgency = byUrgencyArr.reduce((acc, cur) => {
            acc[cur._id] = cur.count;
            return acc;
        }, {});

        // SEVERITY HEATMAP
        const severity = await Complaint.aggregate([
            {
                $group: {
                    _id: null,
                    traffic_block: { $sum: { $cond: ["$severity.traffic_block", 1, 0] } },
                    water_leak: { $sum: { $cond: ["$severity.water_leak", 1, 0] } },
                    electricity_risk: { $sum: { $cond: ["$severity.electricity_risk", 1, 0] } },
                    fire_hazard: { $sum: { $cond: ["$severity.fire_hazard", 1, 0] } },
                },
            },
        ]);

        // GEO CLUSTERING
        const geoPoints = await Complaint.find(
            { latitude: { $exists: true }, longitude: { $exists: true } },
            { latitude: 1, longitude: 1, category: 1 }
        );

        res.json({
            total,
            byStatus,
            byCategory,
            byUrgency,
            severity: severity[0] || {},
            geoPoints,
        });

    } catch (error) {
        console.error("GetAnalytics Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

/* ----------------------------------------------------
   DELETE COMPLAINT
   DELETE /api/admin/complaints/:id
----------------------------------------------------- */
exports.deleteComplaint = async (req, res) => {
    try {
        // Authorization check: Only admin or superadmin can delete
        if (!["admin", "superadmin"].includes(req.user.role)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const complaintId = req.params.id;

        const deleted = await Complaint.findByIdAndDelete(complaintId);

        if (!deleted) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.json({ message: "Complaint deleted successfully" });

    } catch (error) {
        console.error("DeleteComplaint Error:", error);
        res.status(500).json({ message: "Server Error deleting complaint" });
    }
};

/* ----------------------------------------------------
   GENERATE AI RESPONSE
   POST /api/admin/generate-response
----------------------------------------------------- */
exports.generateResponse = async (req, res) => {
    try {
        // Authorization check
        if (!["admin", "superadmin"].includes(req.user.role)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const { complaintId, status } = req.body;
        const complaint = await Complaint.findById(complaintId).populate('user', 'name');

        if (!complaint) return res.status(404).json({ message: "Complaint not found" });
        // If GEMINI key is not configured or left as placeholder, return a concise templated response as fallback.
        const gKey = (process.env.GEMINI_API_KEY || '').trim();
        // Treat obvious placeholders or short/placeholder-like keys as 'not configured'
        if (!gKey || /your|change|test|example|dummy|xxx/i.test(gKey) || gKey.length < 30) {
            const text = `Hello ${complaint.user?.name || 'Resident'}, we have updated your complaint "${complaint.title}" to ${status}. ${status === 'Resolved' ? 'This issue is now resolved.' : status === 'In Progress' ? 'Our team is working on it and will update you soon.' : 'We have received it and will review it shortly.'}`;
            return res.json({ message: text });
        }

        // Initialize Gemini
        try {
            const { GoogleGenerativeAI } = require("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const prompt = `You are a helpful customer service AI for a civic complaint system. Write a polite, professional, and concise response to the user '${complaint.user.name}' regarding their complaint titled '${complaint.title}'. The complaint description: "${complaint.description}". The status is being updated to: '${status}'. Keep message under 50 words and return only the message body.`;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // If the model returns an empty message, fallback to templated message
            if (!text || text.trim().length === 0) {
                const fallback = `Hello ${complaint.user?.name || 'Resident'}, your complaint "${complaint.title}" status is now ${status}. We will keep you informed.`;
                return res.json({ message: fallback });
            }

            return res.json({ message: text });
        } catch (err) {
            console.error('AI Generation Error (fallback to template):', err);
            const fallback = `Hello ${complaint.user?.name || 'Resident'}, we updated your complaint "${complaint.title}" to ${status}. Thank you for reporting.`;
            return res.json({ message: fallback });
        }

    } catch (error) {
        console.error("Error generating response:", error);
        res.status(500).json({ message: "Failed to generate response", error: error.message });
    }
};

/* ----------------------------------------------------
   USER MANAGEMENT - GET ALL USERS
   GET /api/admin/users
----------------------------------------------------- */
exports.getAllUsers = async (req, res) => {
    try {
        const { search, role, page = 1, limit = 20 } = req.query;

        let filter = {};

        // Search by name or email
        if (search) {
            filter.$or = [
                { name: new RegExp(search, "i") },
                { email: new RegExp(search, "i") }
            ];
        }

        // Filter by role
        if (role) {
            filter.role = role;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await User.find(filter)
            .select("-password")
            .sort("-createdAt")
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(filter);

        res.json({
            users,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page)
        });

    } catch (error) {
        console.error("GetAllUsers Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

/* ----------------------------------------------------
   USER MANAGEMENT - UPDATE USER ROLE
   PUT /api/admin/users/:id/role
----------------------------------------------------- */
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.params.id;

        // Validate role
        if (!["citizen", "admin", "superadmin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        // Prevent changing own role
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ message: "Cannot change your own role" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.role = role;
        await user.save();

        res.json({
            message: "User role updated successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("UpdateUserRole Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

/* ----------------------------------------------------
   USER MANAGEMENT - DELETE USER
   DELETE /api/admin/users/:id
----------------------------------------------------- */
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Prevent deleting self
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ message: "Cannot delete your own account" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await User.findByIdAndDelete(userId);

        res.json({ message: "User deleted successfully" });

    } catch (error) {
        console.error("DeleteUser Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};