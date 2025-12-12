import React from "react";

const StarIcon = ({ filled = false, size = 20 }) => {
  if (filled) {
    // Полностью желтая звезда
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{
          cursor: "pointer",
          filter: "drop-shadow(0 0 3px rgba(255, 215, 0, 0.8))",
          animation: "star-glow 1.5s ease-in-out infinite alternate",
        }}
      >
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="#FFD700"
        />
      </svg>
    );
  } else {
    // Только контур
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{ cursor: "pointer" }}
      >
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="none"
          stroke="#FFD700"
          strokeWidth="2"
        />
      </svg>
    );
  }
};

export default StarIcon;
