const express = require("express");
const { getAIRecommendations } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware"); // ✅ Import authentication middleware

const router = express.Router();

// ✅ Middleware to validate request body
const validateAIRequest = (req, res, next) => {
  console.log("📥 Received AI request data:", req.body); // Debugging log

  const { age, weight, height, goal, activityLevel } = req.body;

  if (!age || !weight || !height || !goal || !activityLevel) {
    return res.status(400).json({ error: "All fields (age, weight, height, goal, activity level) are required." });
  }

  if (age < 10 || age > 100) {
    return res.status(400).json({ error: "Age must be between 10 and 100 years." });
  }
  if (weight < 20 || weight > 300) {
    return res.status(400).json({ error: "Weight must be between 20kg and 300kg." });
  }
  if (height < 50 || height > 250) {
    return res.status(400).json({ error: "Height must be between 50cm and 250cm." });
  }

  const validGoals = ["weight-loss", "muscle-gain", "maintenance"];
  if (!validGoals.includes(goal)) {
    return res.status(400).json({ error: "Invalid goal. Choose from: weight-loss, muscle-gain, maintenance." });
  }

  next();
};

// ✅ Require authentication before AI recommendations
router.post("/ai-recommend", protect, validateAIRequest, getAIRecommendations);

module.exports = router;
