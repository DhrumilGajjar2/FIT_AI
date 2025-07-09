const callPythonModel = require("../utils/callPython");
const axios = require("axios");

const getAIRecommendations = async (req, res) => {
  try {
    const { age, weight, height, goal, activityLevel, healthCondition, dietPreference } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Please log in." });
    }

    // ✅ Validate required fields including dietPreference
    if (!age || !weight || !height || !goal || !activityLevel || !dietPreference) {
      return res.status(400).json({ error: "Missing required fields including dietPreference (Veg/Non-Veg)." });
    }

    const inputData = {
      age,
      weight,
      height,
      goal,
      activityLevel,
      healthCondition,
      dietPreference, // ✅ Include in request to Python model
    };

    console.log("📡 Sending data to AI Model:", JSON.stringify(inputData, null, 2));

    let recommendations;
    try {
      recommendations = await callPythonModel(inputData);
      console.log("✅ AI Model Response:", recommendations);
    } catch (modelError) {
      console.error("❌ AI Model Execution Error:", modelError.message || modelError);
      return res.status(500).json({ error: "AI Model Error: " + (modelError.message || "Unexpected error.") });
    }

    if (!recommendations || typeof recommendations !== "object" || !recommendations.recommendation) {
      console.error("❌ Invalid AI Model Response:", recommendations);
      return res.status(500).json({ error: "Failed to generate AI recommendations." });
    }

    const { diet_plan, workout_plan } = recommendations.recommendation;
    const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

    // ✅ Store Diet Plan
    if (diet_plan) {
      try {
        await axios.post(
          `${BASE_URL}/api/diet/store-ai`,
          { diet_plan, dietPreference }, // Optional: store dietPreference if needed
          { headers: { Authorization: req.headers.authorization } }
        );
        console.log("✅ AI Diet Plan stored successfully.");
      } catch (dietError) {
        console.error("❌ Failed to store AI Diet Plan:", dietError.response?.data || dietError.message);
      }
    }

    // ✅ Store Workout Plan
    if (workout_plan) {
      try {
        await axios.post(
          `${BASE_URL}/api/workout/store-ai`,
          { workout_plan },
          { headers: { Authorization: req.headers.authorization } }
        );
        console.log("✅ AI Workout Plan stored successfully.");
      } catch (workoutError) {
        console.error("❌ Failed to store AI Workout Plan:", workoutError.response?.data || workoutError.message);
      }
    }

    res.json({ recommendation: recommendations.recommendation });
  } catch (error) {
    console.error("❌ Controller Error:", error.message);
    res.status(500).json({ error: "Internal Server Error. Please try again later." });
  }
};

module.exports = { getAIRecommendations };
