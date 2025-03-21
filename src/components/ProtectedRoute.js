import React, { useState, useEffect, useMemo } from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token); // ✅ Convert token existence to boolean
    setLoading(false); // ✅ Set loading to false after checking
  }, []);

  // ✅ Use `useMemo` to prevent unnecessary re-renders
  const content = useMemo(() => {
    if (loading) {
      return <div className="loading-spinner">🔄 Loading...</div>; // ✅ Improved loading UI
    }
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
  }, [loading, isAuthenticated]);

  return content;
};

export default ProtectedRoute;
