const callPythonModel = require("../utils/callPython");
const axios = require("axios");

const getAIRecommendations = async (req, res) => {
  try {
    const { age, weight, height, goal, activityLevel, healthCondition } = req.body;
    const userId = req.user?._id; // Get user ID from authentication

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Please log in." });
    }

    console.log("📡 Sending data to AI Model:", JSON.stringify(req.body, null, 2));

    let recommendations;
    try {
      recommendations = await callPythonModel(req.body);
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
    const BASE_URL = process.env.BASE_URL || "http://localhost:5000"; // Default to localhost if not set

    // ✅ Store AI-generated diet plan
    if (diet_plan) {
      try {
        await axios.post(
          `${BASE_URL}/api/diet/store-ai`,
          { diet_plan },
          { headers: { Authorization: req.headers.authorization } }
        );
        console.log("✅ AI Diet Plan stored successfully.");
      } catch (dietError) {
        console.error("❌ Failed to store AI Diet Plan:", dietError.response?.data || dietError.message);
      }
    }

    // ✅ Store AI-generated workout plan
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
