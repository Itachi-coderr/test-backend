const express = require('express');
const cors = require('cors');
const app = express();

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("Server is Ready");
});

// Auth routes
app.post("/api/auth/login", (req, res) => {
    // TODO: Implement login logic
    res.json({ message: "Login endpoint" });
});

app.post("/api/auth/register", (req, res) => {
    // TODO: Implement register logic
    res.json({ message: "Register endpoint" });
});

app.get("/api/auth/me", (req, res) => {
    // TODO: Implement get current user logic
    res.json({ message: "Get current user endpoint" });
});

app.post("/api/auth/logout", (req, res) => {
    // TODO: Implement logout logic
    res.json({ message: "Logout endpoint" });
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
