const express = require("express");
const { createDietPlan, storeAiDietPlan, getUserDietPlans } = require("../controllers/dietController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Middleware to validate manual diet plan input
const validateDietPlan = (req, res, next) => {
  const { meals, totalCalories, healthCondition } = req.body;

  if (!meals || !Array.isArray(meals) || meals.length === 0) {
    return res.status(400).json({ error: "Meals must be a non-empty array." });
  }

  if (!totalCalories || typeof totalCalories !== "number" || totalCalories <= 0) {
    return res.status(400).json({ error: "Total calories must be a positive number." });
  }

  next();
};

// ✅ Manual diet plan creation (Authenticated)
router.post("/create", protect, validateDietPlan, createDietPlan);

// ✅ AI-generated diet plan storage
router.post("/store-ai", protect, storeAiDietPlan);

// ✅ Fetch user's diet plans
router.get("/user", protect, getUserDietPlans);

module.exports = router;
