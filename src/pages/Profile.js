import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState(null);
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

    async function fetchUserProfile() {
      try {
        const response = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data) {
          throw new Error("Failed to fetch profile. Please try again.");
        }

        setUser(response.data);
        localStorage.setItem("userProfile", JSON.stringify(response.data));
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Could not load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  if (loading) {
    return <p className="loading-text">Loading...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <div className="profile-card">
        <p><strong>Name:</strong> {user?.name || "N/A"}</p>
        <p><strong>Email:</strong> {user?.email || "N/A"}</p>
        <p><strong>Age:</strong> {user?.age || "N/A"}</p>
        <p><strong>Weight:</strong> {user?.weight ? `${user.weight} kg` : "N/A"}</p>
        <p><strong>Height:</strong> {user?.height ? `${user.height} cm` : "N/A"}</p>

        {/* Recommendation History */}
        {user?.recommendationHistory?.length > 0 ? (
          <div className="history-section">
            <h3>Recommendation History</h3>

            {Object.entries(
              user.recommendationHistory
                .sort((a, b) => new Date(b.date) - new Date(a.date)) // Latest first
                .reduce((acc, entry) => {
                  const dateKey = new Date(entry.date).toLocaleDateString();
                  if (!acc[dateKey]) {
                    acc[dateKey] = entry; // Keep only the first entry of each date
                  }
                  return acc;
                }, {})
            ).map(([date, entry], index) => (
              <div key={index} className="history-card">
                <p><strong>Date:</strong> {date}</p>

                {entry.dietPlan ? (
                  <div>
                    <h4>Diet Plan</h4>
                    <p>Plan ID: {entry.dietPlan}</p>
                  </div>
                ) : (
                  <p>diet plan for this day.</p>
                )}

                {entry.workoutPlan ? (
                  <div>
                    <h4>Workout Plan</h4>
                    <p>Plan ID: {entry.workoutPlan}</p>
                  </div>
                ) : (
                  <p>workout plan for this day.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p></p>
        )}

        <button onClick={handleLogout} className="btn-danger">Logout</button>
      </div>
    </div>
  );
}

export default Profile;
