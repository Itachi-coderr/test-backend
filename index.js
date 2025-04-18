require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const User = require('./models/User');
const { createToken } = require('./utils/jwt');
const { protect } = require('./middleware/auth');

const app = express();

// Connect to MongoDB with more detailed logging
const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log('MongoDB already connected');
            return;
        }

        console.log('Attempting to connect to MongoDB...');
        console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI is set' : 'URI is missing');
        
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log('Connected to MongoDB Successfully');
        console.log('Database connection state:', mongoose.connection.readyState);
    } catch (err) {
        console.error('MongoDB connection error:', err);
        console.error('MongoDB URI:', process.env.MONGODB_URI ? 'URI is set' : 'URI is missing');
        // Don't throw the error, just log it
    }
};

// Call connectDB immediately
connectDB();

// Log MongoDB connection state changes
mongoose.connection.on('connected', () => console.log('MongoDB connected'));
mongoose.connection.on('error', err => console.log('MongoDB error:', err));
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected, attempting to reconnect...');
    setTimeout(connectDB, 5000);
});

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://test-frontend-nine.vercel.app',
        'https://test-frontend-d1c96wcgt-muhammad-umars-projects-1e4bc850.vercel.app',
        'https://test-frontend-*.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

// Test route with MongoDB status
app.get("/", (req, res) => {
    const dbState = mongoose.connection.readyState;
    res.json({
        message: "Server is Ready",
        mongoDBStatus: dbState === 1 ? 'Connected' : 'Not Connected',
        dbState: dbState
    });
});

// Auth routes
app.post("/api/auth/register", async (req, res) => {
    try {
        console.log('Registration attempt:', req.body);
        
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check MongoDB connection and attempt to reconnect if needed
        if (mongoose.connection.readyState !== 1) {
            console.log('MongoDB not connected, attempting to reconnect...');
            await connectDB();
            
            if (mongoose.connection.readyState !== 1) {
                console.error('MongoDB still not connected after retry');
                return res.status(500).json({
                    success: false,
                    message: 'Database connection error',
                    details: 'Unable to establish database connection'
                });
            }
        }

        // Check if user exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password
        });

        console.log('User created successfully:', user._id);

        // Create token
        const token = createToken(user._id);

        // Send response
        res.status(201).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error details:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error in registration',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email and password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create token
        const token = createToken(user._id);

        // Send response
        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error in login'
        });
    }
});

app.get("/api/auth/me", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error getting user info'
        });
    }
});

app.post("/api/auth/logout", (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export the Express API for Vercel
module.exports = app;
