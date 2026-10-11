// ==========================================
// 1. IMPORTS & CONFIGURATION
// ==========================================
// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");

// Initialize express application
const app = express();

// Set server port from environment variables or default to 5001
const PORT = process.env.PORT || 5001;

// ==========================================
// 2. GLOBAL MIDDLEWARE
// ==========================================
// Enable Cross-Origin Resource Sharing (CORS)
// Allows requests from local Vite frontend and deployed production frontend (FRONTEND_URL)
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
];

if (process.env.FRONTEND_URL) {
    const customOrigins = process.env.FRONTEND_URL.split(",")
        .map((origin) => origin.trim().replace(/\/$/, ""))
        .filter(Boolean);
    customOrigins.forEach((origin) => {
        if (!allowedOrigins.includes(origin)) {
            allowedOrigins.push(origin);
        }
    });
}

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g., mobile apps, curl, server-to-server, Node test runners)
            if (!origin) return callback(null, true);
            const normalized = origin.replace(/\/$/, "");
            if (allowedOrigins.includes(normalized) || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(null, false);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

// Parse incoming requests with JSON payloads (replaces bodyParser.json)
app.use(express.json());

// ==========================================
// 3. ROUTES
// ==========================================
// Basic health check endpoint to verify backend status
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Course Management API is running"
    });
});

// Authentication routes (Register, Login)
app.use("/api/auth", authRoutes);

// Course routes (List & Detail)
app.use("/api/courses", courseRoutes);

// ==========================================
// 4. START SERVER (Connect DB First)
// ==========================================
const startServer = async () => {
    try {
        // Connect to MongoDB before starting Express server
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

// Start server when run directly
if (require.main === module) {
    startServer();
}

// Export app for testing or modular route imports
module.exports = app;
