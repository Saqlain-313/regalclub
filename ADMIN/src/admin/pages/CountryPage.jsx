import React from "react";
import { useParams, Navigate } from "react-router-dom";
import AdminGameCount from "./AdminGameCount";
import AdminGameEntries from "./AdminGameEntries";
import PowerballResult from "./PowerballResult";
import PowerballDivisions from "./PowerballDivisions";

const SUPPORTED = ["india","uae","nepal","pakistan","australia","canada"];

export default function CountryPage({ type }) {
  const { country } = useParams();
  if (!SUPPORTED.includes(String(country).toLowerCase())) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  localStorage.setItem("adminCountry", String(country).toLowerCase());
  if (type === "game-count") return <AdminGameCount />;
  if (type === "game-entries") return <AdminGameEntries />;
  if (type === "powerball-results") return <PowerballResult />;
  if (type === "powerball-divisions") return <PowerballDivisions />;
  return <Navigate to="/admin/dashboard" replace />;
}
