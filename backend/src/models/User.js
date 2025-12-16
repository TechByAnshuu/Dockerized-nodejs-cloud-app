const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    // BASIC INFORMATION
    name: {
        type: String,
        required: [true, "Please provide your name"],
    },

    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
            "Please provide a valid email",
        ],
    },

    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 6,
        select: false,
    },

    // ROLE MANAGEMENT
    role: {
        type: String,
        enum: ["citizen", "staff", "admin", "superadmin"],
        default: "citizen",
    },

    // CONTACT & PROFILE INFO
    phone: {
        type: String,
    },

    avatar: {
        type: String, // profile photo URL or filename
        default: "/uploads/default-user.png",
    },

    // LOCATION (FOR SMART DEFAULTS IN COMPLAINT FORM)
    address: {
        type: String,
    },

    latitude: {
        type: Number,
    },

    longitude: {
        type: Number,
    },

    // VERIFICATION FLAGS
    isEmailVerified: {
        type: Boolean,
        default: false,
    },

    isPhoneVerified: {
        type: Boolean,
        default: false,
    },

    // LOGIN METADATA
    lastLoginAt: {
        type: Date,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    // NOTIFICATION SETTINGS
    notificationPrefs: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
    },

    // AI PERSONALIZATION PREFERENCES
    aiSettings: {
        autoSuggestCategory: { type: Boolean, default: true },
        autoDetectLocation: { type: Boolean, default: true },
        voiceInputEnabled: { type: Boolean, default: true },
    }
});


// PASSWORD HASHING
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// MATCH PASSWORD
userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
