import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "../../../../utils/icons";
import ActivityCalendar from "../../../../components/common/ActivityCalendar";

export default function ActivitySection({ activityCalendar, currentTheme }) {
  if (!activityCalendar || activityCalendar.length === 0) return null;

  return (
    <div className="profile-section">
      <h3 className="profile-section-title">
        <FontAwesomeIcon
          icon={faCalendar}
          style={{ marginRight: "8px", color: currentTheme?.primary }}
        />
        Календарь активности
      </h3>
      <ActivityCalendar
        data={activityCalendar}
        currentTheme={currentTheme}
      />
    </div>
  );
}
