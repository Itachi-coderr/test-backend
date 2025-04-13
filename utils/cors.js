function initMiddleware(middleware) {
    return (req, res) =>
        new Promise((resolve, reject) => {
            middleware(req, res, (result) => {
                if (result instanceof Error) {
                    return reject(result);
                }
                return resolve(result);
            });
        });
}

const cors = require('cors');

// Initialize the cors middleware with specific options
const corsMiddleware = initMiddleware(
    cors({
        origin: ['https://test-backend-f2c3lh8w5-muhammad-umars-projects-1e4bc850.vercel.app', 'http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
    })
);

module.exports = corsMiddleware; 