const express = require("express");
const { createWorkoutPlan, storeAiWorkoutPlan, getUserWorkoutPlans } = require("../controllers/workoutController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Middleware to validate workout plan input
const validateWorkoutPlan = (req, res, next) => {
  const { exercises, totalDuration, healthCondition } = req.body;

  if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
    return res.status(400).json({ error: "Exercises must be a non-empty array." });
  }

  if (!totalDuration || typeof totalDuration !== "number" || totalDuration <= 0) {
    return res.status(400).json({ error: "Total duration must be a positive number (in minutes)." });
  }

  next();
};

// ✅ Manual workout plan creation (Authenticated)
router.post("/create", protect, validateWorkoutPlan, createWorkoutPlan);

// ✅ AI-generated workout plan storage
router.post("/store-ai", protect, storeAiWorkoutPlan);

// ✅ Fetch user's workout plans
router.get("/user", protect, getUserWorkoutPlans);

module.exports = router;
