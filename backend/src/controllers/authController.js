const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT with user ID
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "secret123", {
        expiresIn: "30d",
    });
};

/* ------------------------------------------------------
   REGISTER USER
   POST /api/auth/register
------------------------------------------------------ */
exports.register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            phone,
            address,
            latitude,
            longitude
        } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Ensure only authorized setup can create admins (security)
        const assignedRole = role === "admin" || role === "superadmin"
            ? "citizen"
            : role || "citizen";

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: assignedRole,
            phone,
            address,
            latitude,
            longitude,
            isEmailVerified: false,
            lastLoginAt: null
        });

        res.status(201).json({
            message: "Registration successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                latitude: user.latitude,
                longitude: user.longitude,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt,
                aiSettings: user.aiSettings,
                notificationPrefs: user.notificationPrefs
            },
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

/* ------------------------------------------------------
   LOGIN USER
   POST /api/auth/login
------------------------------------------------------ */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        // Check for existing user
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Update last login timestamp
        user.lastLoginAt = new Date();
        await user.save();

        res.json({
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                latitude: user.latitude,
                longitude: user.longitude,
                avatar: user.avatar,
                lastLoginAt: user.lastLoginAt,
                aiSettings: user.aiSettings,
                notificationPrefs: user.notificationPrefs,
                isEmailVerified: user.isEmailVerified
            },
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error("Login Error Details:", error);
        res.status(500).json({ message: "Server Error: " + error.message });
    }
};

/* ------------------------------------------------------
   UPDATE USER PROFILE
   PUT /api/auth/me
------------------------------------------------------ */
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update allowed fields
        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address
            }
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

