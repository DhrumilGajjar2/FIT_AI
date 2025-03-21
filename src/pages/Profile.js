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
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Could not load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : (
        <div className="profile-card">
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Age:</strong> {user?.age}</p>
          <p><strong>Weight:</strong> {user?.weight} kg</p>
          <p><strong>Height:</strong> {user?.height} cm</p>
          <button onClick={handleLogout} className="btn-danger">Logout</button>
        </div>
      )}
    </div>
  );
}

export default Profile;
