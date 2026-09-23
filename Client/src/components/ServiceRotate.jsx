import React, { useEffect, useState } from "react";
// import ServiceImg from "../assets/icon_sevice.png";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ServiceRotate = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Define a constant for the bottom margin in pixels
  const marginBottom = 60; // Equivalent to mb-10 if 1 unit = 4px

  const [position, setPosition] = useState({
    x: window.innerWidth - 70,
    y: window.innerHeight - 64 - marginBottom, // Adjust initial y to account for margin
  }); // Initial position
  const [dragging, setDragging] = useState(false); // Track dragging state
  const [dragStarted, setDragStarted] = useState(false); // Track if dragging occurred
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // Offset to ensure smooth dragging

  useEffect(() => {
    const handleMove = (e) => {
      if (!dragging) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      // Calculate new position
      let newX = clientX - offset.x;
      let newY = clientY - offset.y;

      // Ensure the new position stays within the viewport (boundaries)
      const maxX = window.innerWidth - 64; // 64 is the width of the image (adjust if needed)
      // Adjust maxY to account for the bottom margin
      const maxY = window.innerHeight - 64 - marginBottom; // 64 is the height of the image

      newX = Math.max(0, Math.min(newX, maxX)); // Constrain X to be within [0, maxX]
      newY = Math.max(0, Math.min(newY, maxY)); // Constrain Y to be within [0, maxY]

      setPosition({ x: newX, y: newY });
      setDragStarted(true); // Mark dragging as started

      e.preventDefault(); // Prevent default behavior to stop scrolling
    };

    const handleStopDragging = () => {
      setDragging(false); // Stop dragging when mouse/touch ends
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleStopDragging);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleStopDragging);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleStopDragging);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleStopDragging);
    };
  }, [dragging, offset]);

  const handleStartDragging = (e) => {
    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    setOffset({
      x: clientX - position.x,
      y: clientY - position.y,
    });

    setDragging(true);
    setDragStarted(false); // Reset drag started state when dragging starts
  };

  // Handle link click based on whether dragging occurred
  const handleClicks = (e) => {
    if (dragStarted) {
      e.preventDefault(); // Prevent navigation if the user dragged
      return;
    }

    if (userInfo) {
      const token = Cookies.get("auth");
      window.location.href = `https://h5.workorder.support.1xclube.com?token=${token}`;
    } else {
      navigate("/main/CustomerService");
    }
  };

  useEffect(() => {
    if (dragging) {
      // Disable background scroll
      document.body.style.overflow = "hidden";
    } else {
      // Enable background scroll
      document.body.style.overflow = "";
    }
    // Cleanup to enable scroll again when component unmounts or modal closes
    return () => {
      document.body.style.overflow = "";
    };
  }, [dragging]);

  return (
    <div
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 11,
        cursor: dragging ? "grabbing" : "pointer",
        transition: dragging ? "none" : "all 0.2s ease-out",
      }}
      onMouseDown={handleStartDragging}
      onTouchStart={handleStartDragging}
      onMouseMove={(e) => e.preventDefault()}
    >
      <div onClick={handleClicks} style={{ display: "inline-block" }}>
        <img
          src="https://i.ibb.co/0ptpQSsK/download-3.png"
          alt="Service"
          className="w-14"
        />
      </div>
    </div>
  );
};

export default ServiceRotate;
