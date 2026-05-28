import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHourglassHalf } from "../../utils/icons";

export default function Loading({ text = "Загрузка..." }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "24px", marginBottom: "16px" }}>
          <FontAwesomeIcon icon={faHourglassHalf} spin />
        </div>
        <div>{text}</div>
      </div>
    </div>
  );
}
