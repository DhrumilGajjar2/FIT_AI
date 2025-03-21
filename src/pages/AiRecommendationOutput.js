import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AiRecommendationOutput() {
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    const storedRecommendation = localStorage.getItem("recommendation");

    try {
      // ✅ Ensure it's a valid JSON string before parsing
      const parsedRecommendation = 
        typeof storedRecommendation === "string" ? JSON.parse(storedRecommendation) : storedRecommendation;

      if (parsedRecommendation && typeof parsedRecommendation === "object") {
        setRecommendation(parsedRecommendation);
      } else {
        console.error("❌ Invalid recommendation format:", storedRecommendation);
        setRecommendation(null);
      }
    } catch (error) {
      console.error("❌ Error parsing recommendation:", error);
      setRecommendation(null);
    }
  }, [navigate]);

  return (
    <div className="ai-recommend-container">
      <h2>Your AI Recommendation</h2>
      {recommendation ? (
        <div className="recommendation-box">
          <h3>Calories: {recommendation.calories}</h3>
          <h3>Protein: {recommendation.protein}g</h3>
          <h3>Carbs: {recommendation.carbs}g</h3>
          <h3>Fats: {recommendation.fats}g</h3>
          <h4>Meal Plan:</h4>
          <ul>
            <li><strong>Breakfast:</strong> {recommendation.meal_plan.breakfast}</li>
            <li><strong>Lunch:</strong> {recommendation.meal_plan.lunch}</li>
            <li><strong>Dinner:</strong> {recommendation.meal_plan.dinner}</li>
            <li><strong>Snacks:</strong> {recommendation.meal_plan.snacks}</li>
          </ul>
          <h4>Workout Plan:</h4>
          <p><strong>Type:</strong> {recommendation.workout_plan.workout_type}</p>
          <p><strong>Duration:</strong> {recommendation.workout_plan.duration} min</p>
          <p><strong>Exercises:</strong> {recommendation.workout_plan.exercises}</p>
        </div>
      ) : (
        <p>No recommendation found.</p>
      )}
      <button onClick={() => navigate("/dashboard")} className="btn-primary">Go to Dashboard</button>
    </div>
  );
}

export default AiRecommendationOutput;
