const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is missing in environment variables. Please check your .env file.");
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, { bufferCommands: false });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle disconnection
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Reconnecting...");
      connectDB(); // Auto-reconnect on disconnection
    });

  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to application termination.");
  process.exit(0);
});

module.exports = connectDB;
