const DietPlan = require("../models/DietPlan");

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

    // ✅ Prevent duplicate diet plans for the same user on the same day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existingPlan = await DietPlan.findOne({
      user: userId,
      createdAt: { $gte: startOfDay },
    });

    if (existingPlan) {
      return res.status(400).json({ error: "A diet plan for today already exists." });
    }

    // ✅ Modify diet based on health condition if applicable
    const modifiedMeals = healthCondition
      ? modifyDietForHealthCondition(meals, healthCondition)
      : meals;

    const newDietPlan = new DietPlan({
      user: userId,
      meals: modifiedMeals,
      totalCalories,
    });

    await newDietPlan.save();
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

    console.log("📥 Storing AI Diet Plan for user:", userId);

    // ✅ Convert AI response format to array
    const formattedMeals = Object.entries(meal_plan).map(([mealType, food]) => ({
      mealType,
      foodItems: Array.isArray(food) ? food : [food], // Ensure it's an array
      calories: Math.round(calories / 4), // Approximate calories per meal
    }));

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existingPlan = await DietPlan.findOne({
      user: userId,
      createdAt: { $gte: startOfDay },
    });

    if (existingPlan) {
      return res.status(400).json({ error: "A diet plan for today already exists." });
    }

    const newDietPlan = new DietPlan({
      user: userId,
      meals: formattedMeals,
      totalCalories: calories,
    });

    await newDietPlan.save();
    console.log("✅ AI Diet Plan stored successfully.");
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

    console.log("📥 Fetching diet plans for user:", userId);
    const dietPlans = await DietPlan.find({ user: userId });

    if (!dietPlans.length) {
      return res.status(404).json({ error: "No diet plans found for this user." });
    }

    res.json(dietPlans);
  } catch (error) {
    console.error("❌ Error fetching diet plans:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

// ✅ Function to modify meals based on health condition
const modifyDietForHealthCondition = (meals, condition) => {
  const dietAdjustments = {
    diabetes: (foods) => foods.map((food) => food.replace(/sugar/g, "stevia").replace(/white rice/g, "brown rice")),
    hypertension: (foods) => foods.map((food) => food.replace(/salt/g, "low-sodium salt")),
    "heart-disease": (foods) => foods.map((food) => food.replace(/red meat/g, "fish").replace(/fried/g, "grilled")),
    obesity: (foods) => foods.map((food) => food.replace(/fast food/g, "salads")),
    pcos: (foods) => foods.map((food) => food.replace(/processed carbs/g, "whole grains")),
  };

  return meals.map((meal) => ({
    ...meal,
    foodItems: dietAdjustments[condition] ? dietAdjustments[condition](meal.foodItems) : meal.foodItems,
  }));
};

module.exports = { createDietPlan, storeAiDietPlan, getUserDietPlans };
