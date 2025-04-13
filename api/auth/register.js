require('dotenv').config();
const User = require('../../models/User');
const { createToken } = require('../../utils/jwt');
const dbConnect = require('../../utils/dbConnect');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Connect to database
        await dbConnect();
        console.log('Database connected in register endpoint');

        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
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

        // Create token
        const token = createToken(user._id);

        // Send response
        return res.status(201).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === 'development' 
                ? error.message 
                : 'Error in registration'
        });
    }
}; 