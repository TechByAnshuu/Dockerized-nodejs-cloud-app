const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/complaint_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));

// DB Connection Check Middleware
app.use((req, res, next) => {
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: 'Service Unavailable: Unable to connect to MongoDB Atlas. Please check your internet connection and IP whitelist.'
        });
    }
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes Placeholder
app.get('/api/health', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.db.admin().ping();
            res.json({ status: 'ok', message: 'Backend and Database are running' });
        } else {
            res.status(503).json({ status: 'error', message: 'Database disconnected' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Database ping failed', error: error.message });
    }
});

// TEMPORARY: Create Admin Config
app.get('/api/setup-admin', async (req, res) => {
    try {
        const User = require('./models/User');
        const email = 'ansh777@admin.com';
        const password = 'qwerty@123';
        const name = 'Admin Ansh';

        let user = await User.findOne({ email });

        if (user) {
            user.role = 'admin';
            user.password = password;
            await user.save();
            return res.json({ message: 'User updated to Admin successfully', email });
        } else {
            user = await User.create({
                name,
                email,
                password,
                role: 'admin'
            });
            return res.json({ message: 'Admin user created successfully', email });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
});

module.exports = app;
