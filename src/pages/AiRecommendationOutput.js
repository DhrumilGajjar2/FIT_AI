import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AiRecommendationOutput() {
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    const storedRecommendation = localStorage.getItem("recommendation");

    try {
      const parsedRecommendation =
        typeof storedRecommendation === "string"
          ? JSON.parse(storedRecommendation)
          : null;

      if (parsedRecommendation && typeof parsedRecommendation === "object") {
        setRecommendation(parsedRecommendation);
      } else {
        console.warn("⚠️ Invalid recommendation format:", storedRecommendation);
        setRecommendation(null);
      }
    } catch (error) {
      console.error("❌ Error parsing recommendation:", error);
      setRecommendation(null);
    }
  }, []);

  return (
    <div className="ai-recommend-container">
      <h2>Your AI Recommendation</h2>
      {recommendation ? (
        <div className="recommendation-box">
          <h3>
            Diet Preference:{" "}
            {recommendation.dietPreference
              ? recommendation.dietPreference.charAt(0).toUpperCase() +
                recommendation.dietPreference.slice(1)
              : ""}
          </h3>
          <h3>Calories: {recommendation.calories ?? "N/A"}</h3>
          <h3>Protein: {recommendation.protein ?? "N/A"}g</h3>
          <h3>Carbs: {recommendation.carbs ?? "N/A"}g</h3>
          <h3>Fats: {recommendation.fats ?? "N/A"}g</h3>
          <h4>Meal Plan:</h4>
          <ul>
            <li>
              <strong>Breakfast:</strong>{" "}
              {recommendation.meal_plan?.breakfast ?? "N/A"}
            </li>
            <li>
              <strong>Lunch:</strong> {recommendation.meal_plan?.lunch ?? "N/A"}
            </li>
            <li>
              <strong>Dinner:</strong>{" "}
              {recommendation.meal_plan?.dinner ?? "N/A"}
            </li>
            <li>
              <strong>Snacks:</strong>{" "}
              {recommendation.meal_plan?.snacks ?? "N/A"}
            </li>
          </ul>
          <h4>Workout Plan:</h4>
          <p>
            <strong>Type:</strong>{" "}
            {recommendation.workout_plan?.workout_type ?? "N/A"}
          </p>
          <p>
            <strong>Duration:</strong>{" "}
            {recommendation.workout_plan?.duration ?? "N/A"} min
          </p>
          <p>
            <strong>Exercises:</strong>{" "}
            {recommendation.workout_plan?.exercises ?? "N/A"}
          </p>
        </div>
      ) : (
        <p>No recommendation found.</p>
      )}
      <button onClick={() => navigate("/dashboard")} className="btn-primary">
        Go to Dashboard
      </button>
    </div>
  );
}

export default AiRecommendationOutput;
