// src/components/ProtectedRoute.jsx

import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { resetAuthState } from "../redux/slices/authSlice";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, isReady, user } = useAuth();

  const isAdmin = Boolean(
    user?.role && String(user.role).trim().toLowerCase() === "admin",
  );

  // ========================================
  // ADMIN IS NOT ALLOWED ON USER SIDE.
  // Clear the stale admin session, otherwise the Login page
  // (isAuthenticated true) and this redirect (admin role) keep
  // bouncing between "/" and "/login" forever.
  // ========================================
  useEffect(() => {
    if (isReady && isAdmin) {
      dispatch(resetAuthState());
    }
  }, [isReady, isAdmin, dispatch]);

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
  if (!isAuthenticated || isAdmin) {
    return <Navigate to="/login" replace />;
  }

  // ========================================
  // USER AUTHENTICATED
  // ========================================
  return children;
};

export default ProtectedRoute;
