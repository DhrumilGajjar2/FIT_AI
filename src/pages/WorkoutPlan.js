import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getUserWorkoutPlans } from "../utils/api";

function WorkoutPlan() {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      alert("Please log in first");
      navigate("/login");
      return;
    }

    async function fetchPlan() {
      try {
        const response = await getUserWorkoutPlans(token);
        console.log("📌 Workout Plan API Response:", response); // ✅ Debug API Response

        // ✅ Handle API response format correctly
        if (!response || (Array.isArray(response) && response.length === 0)) {
          throw new Error("No workout plans found.");
        }

        setWorkoutPlans(Array.isArray(response) ? response : response.workoutPlans || []);
      } catch (error) {
        console.error("❌ Error fetching workout plan:", error);
        setError(error.message || "Failed to load workout plan.");
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();
  }, [token, navigate]);

  // ✅ Calculate Total Duration
  const workoutSummary = useMemo(() => {
    if (workoutPlans.length === 0) return { totalDuration: 0 };

    const totalDuration = workoutPlans.reduce(
      (sum, workout) => sum + (workout.totalDuration || 0),
      0
    );

    return { totalDuration };
  }, [workoutPlans]);

  return (
    <div className="plan-container">
      <h2>Your Workout Plans 🏋️</h2>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : workoutPlans.length === 0 ? (
        <p>No workout plan available. Try setting your fitness goal.</p>
      ) : (
        <>
          {/* Workout Summary */}
          <div className="workout-summary">
            <h3>Total Workouts: {workoutPlans.length}</h3>
            <h3>Total Workout Duration: {workoutSummary.totalDuration} minutes</h3>
          </div>

          {/* Workout Details */}
          {workoutPlans.map((plan, idx) => (
            <div key={idx} className="workout-item">
              <h4>Workout Plan - {new Date(plan.createdAt).toLocaleString()}</h4>
              {plan.exercises?.length > 0 ? (
                plan.exercises.map((exercise, i) => (
                  <p key={i}>
                    {exercise.name} - {exercise.sets} sets x {exercise.reps} reps
                    ({exercise.duration} min)
                  </p>
                ))
              ) : (
                <p>No exercises listed. 🏃</p>
              )}
            </div>
          ))}
        </>
      )}

      {/* Back to Dashboard Button */}
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        ⬅ Back to Dashboard
      </button>
    </div>
  );
}

export default React.memo(WorkoutPlan);
