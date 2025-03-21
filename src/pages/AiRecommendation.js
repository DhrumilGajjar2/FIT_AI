import React, { useState } from "react";
import UserDataForm from "../components/UserDataForm"; // ✅ Fixed Import

function AiRecommendation() {
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <div className="ai-recommend-wrapper">
      <div className="ai-recommend-container" style={{backgroundColor: "red", border: "2px solid black"}}>
        <h2>AI Diet & Workout Recommendation</h2>

        {/* ✅ Progress Bar */}
        {progress > 0 && progress < 100 && (
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        {/* ✅ Pass required props correctly */}
        <UserDataForm
          setRecommendation={setRecommendation}
          setLoading={setLoading} // ✅ Pass function directly
          setProgress={setProgress}
        />

        {/* ✅ Display Recommendation, Error, or Loading Spinner */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Generating your personalized recommendation...</p>
          </div>
        ) : recommendation ? (
          <div className="recommendation-box">
            <h3>Your AI Recommendation:</h3>
            <p>{recommendation}</p>
          </div>
        ) : (
          <p className="placeholder-text">Fill in your details to get recommendations.</p>
        )}
      </div>
    </div>
  );
}

export default AiRecommendation;
