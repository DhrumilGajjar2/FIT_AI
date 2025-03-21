const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

dotenv.config();

// ✅ Validate required environment variables
const requiredEnvVars = ["PORT", "MONGO_URI", "JWT_SECRET"];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing environment variable: ${envVar}. Check .env file.`);
    process.exit(1);
  }
});

// ✅ Connect to database
connectDB()
  .then(() => console.log("✅ Database connected successfully!"))
  .catch((err) => {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  });

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true })); // Adjust for production
app.use(helmet());
app.use(morgan("dev"));

// ✅ Improved Rate Limiting (Prevents API abuse)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 150, // Adjust based on user traffic
  message: "Too many requests. Please try again later.",
  standardHeaders: true, // Sends rate limit info in headers
  legacyHeaders: false, // Disables X-RateLimit headers
});
app.use("/api", limiter); // Apply to all API routes

// ✅ Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/diet", require("./routes/dietRoutes"));
app.use("/api/workout", require("./routes/workoutRoutes"));
app.use("/api/chatbot", require("./routes/chatbotRoutes"));

// ✅ Handle undefined routes
app.use((req, res, next) => {
  res.status(404).json({ error: `❌ Route not found: ${req.originalUrl}` });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({
    error: "Internal Server Error",
    details: err.message, // Useful for debugging
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

// ✅ Graceful Shutdown (Handles CTRL+C or process termination)
const shutdown = async (signal) => {
  console.log(`⚠️ Received ${signal}. Closing server...`);
  server.close(async () => {
    console.log("✅ Server closed.");
    try {
      await mongoose.connection.close(); // Properly close MongoDB connection
      console.log("✅ Database connection closed.");
    } catch (error) {
      console.error("❌ Error closing database connection:", error.message);
    }
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
