import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserDietPlans,
  getUserWorkoutPlans,
  setAuthToken,
  getAIRecommendations,
} from "../utils/api";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [userData, setUserData] = useState({
    username: "User",
    age: "N/A",
    weight: "N/A",
    height: "N/A",
  });

  const [plans, setPlans] = useState({ dietPlans: [], workoutPlans: [] });
  const [aiRecommendation, setAIRecommendation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Memoized BMI Calculation
  const bmi = useMemo(() => {
    const weightNum = parseFloat(userData.weight);
    const heightNum = parseFloat(userData.height);
    return !isNaN(weightNum) && !isNaN(heightNum) && heightNum > 0
      ? (weightNum / ((heightNum / 100) ** 2)).toFixed(1)
      : "N/A";
  }, [userData.weight, userData.height]);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    if (!token) {
      alert("Please log in first");
      navigate("/login");
      return;
    }

    setAuthToken(token);

    // ✅ Fetch User Profile
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          const user = {
            username: response.data.name || "User",
            age: response.data.age || "N/A",
            weight: response.data.weight || "N/A",
            height: response.data.height || "N/A",
          };

          setUserData(user);
          // Optional: localStorage.setItem("userProfile", JSON.stringify(user));
        } else {
          setError("Failed to fetch profile.");
        }
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
        setError("Could not load profile. Please try again.");
      }
    };

    // ✅ Fetch Diet and Workout Plans
    const fetchPlans = async () => {
      try {
        const dietResponse = await getUserDietPlans(token);
        const workoutResponse = await getUserWorkoutPlans(token);

        setPlans({
          dietPlans: Array.isArray(dietResponse) ? dietResponse : [],
          workoutPlans: Array.isArray(workoutResponse) ? workoutResponse : [],
        });
      } catch (err) {
        console.error("❌ Error fetching plans:", err);
        setError("Could not load workout or diet plans.");
      }
    };

    // ✅ Fetch All Critical Data in Parallel
    const fetchEssentialData = async () => {
      try {
        await Promise.all([fetchUserData(), fetchPlans()]);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error("❌ Error loading dashboard:", err);
      }
    };

    fetchEssentialData();

    // ✅ Lazy Load AI Recommendation
    const fetchAIRecommendation = async () => {
      try {
        const storedData = JSON.parse(localStorage.getItem("userData"));
        if (!storedData) {
          console.warn("⚠️ No user data found for AI recommendation.");
          return;
        }

        const aiResponse = await getAIRecommendations(storedData, token);
        setAIRecommendation(aiResponse?.recommendation || null);
      } catch (err) {
        console.error("❌ Error fetching AI recommendation:", err);
      }
    };

    fetchAIRecommendation();
  }, [token, navigate]);

  return (
    <div className="dashboard-container">
      <h1>Welcome, {userData.username}!</h1>

      <div className="profile-summary">
        <h3>Your Profile</h3>
        <p><strong>Age:</strong> {userData.age}</p>
        <p><strong>Weight:</strong> {userData.weight} kg</p>
        <p><strong>Height:</strong> {userData.height} cm</p>
        <p><strong>BMI:</strong> {bmi}</p>
      </div>

      {error && <p className="error">{error}</p>}

      {/* ✅ Loading UI for Plans */}
      {loading ? (
        <div className="loading-spinner">Loading your health plans...</div>
      ) : (
        <>
          <div className="section">
            <h2>Diet & Workout Plans</h2>
            <ul>
              {plans.dietPlans.length > 0 ? (
                plans.dietPlans.map((plan, idx) => (
                  <li key={`diet-${idx}`}>{plan.title || "Diet Plan"}</li>
                ))
              ) : (
                <li>No diet plans available.</li>
              )}
              {plans.workoutPlans.length > 0 ? (
                plans.workoutPlans.map((plan, idx) => (
                  <li key={`workout-${idx}`}>{plan.title || "Workout Plan"}</li>
                ))
              ) : (
                <li>No workout plans available.</li>
              )}
            </ul>
          </div>
        </>
      )}

      {/* ✅ Lazy Loaded AI Recommendation Section */}
      <div className="section">
        <h2>AI-Generated Health Plan</h2>
        {aiRecommendation ? (
          <div className="ai-recommendation">
            <h3>Calories: {aiRecommendation.calories}</h3>
            <h3>Protein: {aiRecommendation.protein}g</h3>
            <h3>Carbs: {aiRecommendation.carbs}g</h3>
            <h3>Fats: {aiRecommendation.fats}g</h3>
            <h4>Meal Plan:</h4>
            <ul>
              <li><strong>Breakfast:</strong> {aiRecommendation.meal_plan?.breakfast}</li>
              <li><strong>Lunch:</strong> {aiRecommendation.meal_plan?.lunch}</li>
              <li><strong>Dinner:</strong> {aiRecommendation.meal_plan?.dinner}</li>
              <li><strong>Snacks:</strong> {aiRecommendation.meal_plan?.snacks}</li>
            </ul>
            <h4>Workout Plan:</h4>
            <p><strong>Type:</strong> {aiRecommendation.workout_plan?.workout_type}</p>
            <p><strong>Duration:</strong> {aiRecommendation.workout_plan?.duration} min</p>
            <p><strong>Exercises:</strong> {aiRecommendation.workout_plan?.exercises}</p>
          </div>
        ) : (
          <p>Fetching your AI health plan...</p>
        )}
      </div>

      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
