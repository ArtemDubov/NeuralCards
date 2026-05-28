import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsLeftRight } from "../../../utils/icons";

/**
 * Matching arrows column - static visual divider between left and right columns.
 * No logic, just decorative arrows for visual separation.
 */
export default function MatchingArrows({ leftItems }) {
  return (
    <div className="matching-arrows-column">
      {leftItems.map((item) => (
        <div key={`arrow-${item.id}`} className="matching-arrow-cell">
          <FontAwesomeIcon
            icon={faArrowsLeftRight}
            style={{ color: "#ccc", fontSize: "14px" }}
          />
        </div>
      ))}
    </div>
  );
}
