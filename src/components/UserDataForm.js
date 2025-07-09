import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setAuthToken } from "../utils/api"; // Import setAuthToken

function UserDataForm({ setRecommendation, setLoading, setProgress }) {
  const navigate = useNavigate();
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [healthCondition, setHealthCondition] = useState("");
  const [dietPreference, setDietPreference] = useState("");
  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("userData"));
    if (savedData) {
      setAge(savedData.age || "");
      setWeight(savedData.weight || "");
      setHeight(savedData.height || "");
      setGoal(savedData.goal || "");
      setActivityLevel(savedData.activityLevel || "");
      setHealthCondition(savedData.healthCondition || "");
      setDietPreference(savedData.dietPreference || "");
    }

    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
    }
  }, []);

  const validateInput = () => {
    if (!age || !weight || !height || !goal || !activityLevel || !dietPreference) {
      setError("All fields are required.");
      return false;
    }
    if (age < 10 || age > 100) {
      setError("Age must be between 10 and 100.");
      return false;
    }
    if (weight < 20 || weight > 300) {
      setError("Weight must be between 20kg and 300kg.");
      return false;
    }
    if (height < 50 || height > 250) {
      setError("Height must be between 50cm and 250cm.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInput()) return;

    const userData = {
      age: Number(age),
      weight: Number(weight),
      height: Number(height),
      goal,
      activityLevel,
      healthCondition,
      dietPreference,
    };

    localStorage.setItem("userData", JSON.stringify(userData));

    try {
      if (typeof setLoading === "function") setLoading(true);
      setFormLoading(true);
      if (typeof setProgress === "function") setProgress(20);
      if (typeof setRecommendation === "function") setRecommendation("");

      const token = localStorage.getItem("token");

      if (process.env.NODE_ENV === "development") {
        console.log("📡 Sending user data with token:", token);
      }

      const response = await axios.post(
        "http://localhost:5000/api/ai/ai-recommend",
        userData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (process.env.NODE_ENV === "development") {
        console.log("✅ Received AI Response:", response.data);
      }

      if (typeof setProgress === "function") setProgress(70);

      localStorage.setItem("recommendation", JSON.stringify(response.data.recommendation));

      if (typeof setProgress === "function") setProgress(100);

      setTimeout(() => {
        navigate("/ai-recommendation-output");
      }, 500);
    } catch (error) {
      console.error("❌ API Error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Error getting recommendation.");
    } finally {
      if (typeof setLoading === "function") setLoading(false);
      setFormLoading(false);
      if (typeof setProgress === "function") {
        setTimeout(() => setProgress(0), 500);
      }
    }
  };

  return (
    <div className="form-container">
      <h2>Enter Your Details</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Age</label>
        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required />

        <label>Weight (kg)</label>
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} required />

        <label>Height (cm)</label>
        <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} required />

        <label>Goal</label>
        <select value={goal} onChange={(e) => setGoal(e.target.value)} required>
          <option value="">Select Goal</option>
          <option value="weight-loss">Weight Loss</option>
          <option value="muscle-gain">Muscle Gain</option>
          <option value="maintenance">Maintenance</option>
        </select>

        <label>Activity Level</label>
        <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} required>
          <option value="">Select Activity Level</option>
          <option value="sedentary">Sedentary</option>
          <option value="light">Light</option>
          <option value="moderate">Moderate</option>
          <option value="active">Active</option>
        </select>

        <label>Health Condition (Optional)</label>
        <select value={healthCondition} onChange={(e) => setHealthCondition(e.target.value)}>
          <option value="">None</option>
          <option value="diabetes">Diabetes</option>
          <option value="hypertension">Hypertension</option>
          <option value="heart-disease">Heart Disease</option>
          <option value="obesity">Obesity</option>
          <option value="pcos">PCOS</option>
        </select>

        <label>Diet Preference</label>
        <select value={dietPreference} onChange={(e) => setDietPreference(e.target.value)} required>
          <option value="">Select Preference</option>
          <option value="veg">Veg</option>
          <option value="non-veg">Non-Veg</option>
        </select>

        <button type="submit" disabled={formLoading}>
          {formLoading ? "Processing..." : "Get AI Recommendation"}
        </button>
      </form>
    </div>
  );
}

export default UserDataForm;
