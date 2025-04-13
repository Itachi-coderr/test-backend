const express = require('express');
const app = express();

app.get("/", (req, res) => {
    res.send("Server is Ready");
});

// Start the server if running directly (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export the Express API for Vercel
module.exports = app;
