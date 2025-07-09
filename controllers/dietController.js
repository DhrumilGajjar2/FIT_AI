const DietPlan = require("../models/DietPlan");
const User = require("../models/User");

const createDietPlan = async (req, res) => {
  try {
    const { meals, totalCalories, healthCondition } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Please log in." });
    }

    if (!Array.isArray(meals) || meals.length === 0) {
      return res.status(400).json({ error: "Meals must be a non-empty array." });
    }

    if (!totalCalories || typeof totalCalories !== "number" || totalCalories <= 0) {
      return res.status(400).json({ error: "Total calories must be a positive number." });
    }

    // Helper function to get the start of the current day
    const getStartOfToday = () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      return startOfDay;
    };

    const startOfDay = getStartOfToday();

    const existingPlan = await DietPlan.findOne({
      user: userId,
      createdAt: { $gte: startOfDay },
    });

    if (existingPlan) {
      return res.status(400).json({ error: "A diet plan for today already exists.", existingPlan });
    }

    const modifiedMeals = healthCondition
      ? modifyDietForHealthCondition(meals, healthCondition)
      : meals;

    const newDietPlan = new DietPlan({
      user: userId,
      meals: modifiedMeals,
      totalCalories,
    });

    await newDietPlan.save();

    const existingRecommendation = await User.findOne({
      _id: userId,
      "recommendationHistory.date": { $gte: startOfDay },
    });

    if (!existingRecommendation) {
      await User.findByIdAndUpdate(userId, {
        $push: {
          recommendationHistory: {
            dietPlan: newDietPlan._id,
            date: new Date(),
          },
        },
      });
    }

    console.log(`[${new Date().toISOString()}] ✅ Diet Plan created for user: ${userId}`);
    res.status(201).json({ message: "Diet plan created successfully.", dietPlan: newDietPlan });
  } catch (error) {
    console.error("❌ Create Diet Plan Error:", error.message);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

const storeAiDietPlan = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Please log in." });
    }

    const { meal_plan, calories } = req.body;

    if (!meal_plan || typeof meal_plan !== "object") {
      return res.status(400).json({ error: "Invalid AI diet plan received." });
    }

    console.log(`[${new Date().toISOString()}] 📥 Storing AI Diet Plan for user: ${userId}`);

    const formattedMeals = Object.entries(meal_plan).map(([mealType, food]) => ({
      mealType,
      foodItems: Array.isArray(food) ? food : [food],
      calories: Math.round(calories / 4), // Approximate per meal
    }));

    // Helper function to get the start of the current day
    const getStartOfToday = () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      return startOfDay;
    };

    const startOfDay = getStartOfToday();

    const existingPlan = await DietPlan.findOne({
      user: userId,
      createdAt: { $gte: startOfDay },
    });

    if (existingPlan) {
      return res.status(400).json({ error: "A diet plan for today already exists.", existingPlan });
    }

    const newDietPlan = new DietPlan({
      user: userId,
      meals: formattedMeals,
      totalCalories: calories,
    });

    await newDietPlan.save();

    const existingRecommendation = await User.findOne({
      _id: userId,
      "recommendationHistory.date": { $gte: startOfDay },
    });

    if (!existingRecommendation) {
      await User.findByIdAndUpdate(userId, {
        $push: {
          recommendationHistory: {
            dietPlan: newDietPlan._id,
            date: new Date(),
          },
        },
      });
    }

    console.log(`[${new Date().toISOString()}] ✅ AI Diet Plan stored successfully.`);
    res.status(201).json({ message: "AI Diet Plan stored successfully.", dietPlan: newDietPlan });
  } catch (error) {
    console.error("❌ AI Diet Plan Store Error:", error.message);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

const getUserDietPlans = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Please log in." });
    }

    console.log(`[${new Date().toISOString()}] 📥 Fetching diet plans for user: ${userId}`);

    // Helper function to get the start of the current day
    const getStartOfToday = () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      return startOfDay;
    };

    const startOfDay = getStartOfToday();

    const dietPlans = await DietPlan.find({
      user: userId,
      createdAt: { $gte: startOfDay },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!dietPlans.length) {
      return res.status(404).json({ error: "No diet plans found for this user." });
    }

    res.json(dietPlans);
  } catch (error) {
    console.error("❌ Error fetching diet plans:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

// ✅ Helper function to modify diet based on health conditions
const modifyDietForHealthCondition = (meals, condition) => {
  const dietAdjustments = {
    diabetes: (foods) =>
      foods.map((food) =>
        food.replace(/sugar/gi, "stevia").replace(/white rice/gi, "brown rice")
      ),
    hypertension: (foods) =>
      foods.map((food) => food.replace(/salt/gi, "low-sodium salt")),
    "heart-disease": (foods) =>
      foods.map((food) =>
        food.replace(/red meat/gi, "fish").replace(/fried/gi, "grilled")
      ),
    obesity: (foods) =>
      foods.map((food) => food.replace(/fast food/gi, "salads")),
    pcos: (foods) =>
      foods.map((food) =>
        food.replace(/processed carbs/gi, "whole grains")
      ),
  };

  return meals.map((meal) => ({
    ...meal,
    foodItems: dietAdjustments[condition]
      ? dietAdjustments[condition](meal.foodItems)
      : meal.foodItems,
  }));
};

module.exports = {
  createDietPlan,
  storeAiDietPlan,
  getUserDietPlans,
};
