// src/components/ProtectedRoute.jsx

import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isReady, user } = useAuth();

  // ========================================
  // WAIT FOR INITIAL PROFILE CHECK ONLY
  // isReady already becomes true once profileLoaded (or user is a guest).
  // We NO LONGER gate on isLoading here — isLoading also flips true
  // for background thunks (getProfile refresh, updateProfile, logout, etc.)
  // that fire from WITHIN already-mounted protected pages.
  // Unmounting children on every such flip was causing pages like
  // Wingo/Mines to remount repeatedly, re-running their mount effects
  // and re-dispatching the same calls — an infinite request loop.
  // ========================================
  if (!isReady) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // ========================================
  // NOT AUTHENTICATED
  // ========================================
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ========================================
  // ADMIN IS NOT ALLOWED ON USER SIDE
  // ========================================
  if (user?.role && String(user.role).trim().toLowerCase() === "admin") {
    return <Navigate to="/login" replace />;
  }

  // ========================================
  // USER AUTHENTICATED
  // ========================================
  return children;
};

export default ProtectedRoute;
