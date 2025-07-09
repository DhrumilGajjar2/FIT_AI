import React, { useState, useEffect } from "react";
import { getUserDietPlans } from "../utils/api";

function DietPlan() {
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDietPlan = async () => {
      try {
        const response = await getUserDietPlans(token);
        console.log("📌 Diet Plan API Response:", response); // ✅ Debug API Response

        // ✅ Handle API response format correctly
        if (!response || (Array.isArray(response) && response.length === 0)) {
          throw new Error("No diet plans found.");
        }

        setDietPlans(Array.isArray(response) ? response : (response.dietPlans ? response.dietPlans : []));

      } catch (err) {
        console.error("❌ Error fetching diet plan:", err);
        setError(err.message || "Could not load diet plans. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDietPlan();
  }, [token]);

  return (
    <div className="diet-plan-container">
      <h2>Your Diet Plans 🍎</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : dietPlans.length === 0 ? (
        <p>No diet plans available. 🥗</p>
      ) : (
        dietPlans.map((plan, index) => (
          <div key={index} className="diet-card">
            <h4>Total Calories: {plan.totalCalories} kcal</h4>
            <p><strong>Generated On:</strong> {new Date(plan.createdAt).toLocaleString()}</p>
            {plan.meals?.length > 0 ? (
              plan.meals.map((meal, idx) => (
                <p key={idx}>
                  {meal.mealType}: {meal.foodItems?.join(", ")} ({meal.calories} kcal)
                </p>
              ))
            ) : (
              <p>No meals listed. 🥗</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default DietPlan;
