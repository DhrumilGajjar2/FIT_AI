import React, { useEffect, useState, useMemo } from "react";
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

    // ✅ Load from localStorage for instant UI
    const cached = localStorage.getItem("userProfile");
    if (cached) {
      setUser(JSON.parse(cached));
      setLoading(false);
    }

    // ✅ Fetch fresh profile in background
    async function fetchUserProfile() {
      try {
        const response = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data) {
          throw new Error("Failed to fetch profile.");
        }

        setUser(response.data);
        localStorage.setItem("userProfile", JSON.stringify(response.data));
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (!cached) setError("Could not load profile. Please try again.");
      }
    }

    fetchUserProfile();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  // ✅ Memoized History Grouping
  const groupedHistory = useMemo(() => {
    if (!user?.recommendationHistory) return [];

    const sorted = [...user.recommendationHistory].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    const reduced = sorted.reduce((acc, entry) => {
      const dateKey = new Date(entry.date).toLocaleDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = entry;
      }
      return acc;
    }, {});

    return Object.entries(reduced);
  }, [user?.recommendationHistory]);

  if (loading && !user) {
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
        {groupedHistory.length > 0 && (
          <div className="history-section">
            <h3>Recommendation History</h3>
            {groupedHistory.map(([date, entry], index) => (
              <div key={index} className="history-card">
                <p><strong>Date:</strong> {date}</p>

                {entry.dietPlan ? (
                  <div>
                    <h4>Diet Plan</h4>
                    <p>Plan ID: {entry.dietPlan}</p>
                  </div>
                ) : (
                  <p>No diet plan for this day.</p>
                )}

                {entry.workoutPlan ? (
                  <div>
                    <h4>Workout Plan</h4>
                    <p>Plan ID: {entry.workoutPlan}</p>
                  </div>
                ) : (
                  <p>No workout plan for this day.</p>
                )}
              </div>
            ))}
          </div>
        )}

        <button onClick={handleLogout} className="btn-danger">Logout</button>
      </div>
    </div>
  );
}

export default Profile;
