require('dotenv').config();
const User = require('../../models/User');
const { createToken } = require('../../utils/jwt');
const dbConnect = require('../../utils/dbConnect');
const corsMiddleware = require('../../utils/cors');

module.exports = async (req, res) => {
    try {
        // Handle CORS
        await corsMiddleware(req, res);

        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Method not allowed' });
        }

        // Connect to database
        await dbConnect();
        console.log('Database connected in login endpoint');

        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create token
        const token = createToken(user._id);

        // Send response
        return res.status(200).json({
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
        return res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === 'development' 
                ? error.message 
                : 'Error in login'
        });
    }
}; 