import React, { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import AiRecommendationOutput from "./pages/AiRecommendationOutput";
import "./styles.css"; // Centralized styling

// Lazy load components
const Footer = lazy(() => import("./components/Footer"));
const Chatbot = lazy(() => import("./components/Chatbot"));
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DietPlan = lazy(() => import("./pages/DietPlan"));
const WorkoutPlan = lazy(() => import("./pages/WorkoutPlan"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const UserDataForm = lazy(() => import("./components/UserDataForm"));
const AiRecommendation = lazy(() => import("./pages/AiRecommendation")); // ✅ Added
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));

// ✅ Get authentication status
const getAuthStatus = () => !!localStorage.getItem("token");

// ✅ Protected Route Component
const ProtectedRoute = ({ children }) => {
  return getAuthStatus() ? children : <Navigate to="/login" replace />;
};

// ✅ Redirect Logged-In Users Away from Login & Signup
const AuthRedirect = ({ children }) => {
  return getAuthStatus() ? <Navigate to="/dashboard" replace /> : children;
};

// ✅ Loading Component for Suspense Fallback
const Loading = () => <div className="loading-screen">Loading...</div>;

function App() {
  // ✅ Fix: Add missing state
  const [isAuthenticated, setIsAuthenticated] = useState(getAuthStatus());

  // ✅ Fix: Define the missing function
  useEffect(() => {
    const handleStorageChange = () => setIsAuthenticated(getAuthStatus());

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  console.log("Auth Status:", isAuthenticated); // ✅ Debugging authentication

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="main-content">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              {/* ✅ Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/diet-plan" element={<ProtectedRoute><DietPlan /></ProtectedRoute>} />
              <Route path="/workout-plan" element={<ProtectedRoute><WorkoutPlan /></ProtectedRoute>} />
              <Route path="/user-data" element={<ProtectedRoute><UserDataForm /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/ai-recommendation" element={<ProtectedRoute><AiRecommendation /></ProtectedRoute>} /> {/* ✅ New Route */}
              <Route path="/ai-recommendation-output" element={<ProtectedRoute><AiRecommendationOutput /></ProtectedRoute>} />
              {/* ✅ Redirect Logged-In Users */}
              <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
              <Route path="/signup" element={<AuthRedirect><Signup /></AuthRedirect>} />
              {/* ✅ Not Found Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>

        {/* ✅ Ensure Chatbot is Available */}
        <Suspense fallback={<div></div>}>  {/* ✅ Prevents "null" issue */}
          <Chatbot /> {/* ✅ Chatbot is now always visible */}
          <Footer />
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
