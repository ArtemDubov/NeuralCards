import React, { useState, useMemo } from "react";
import { getCellOutline } from "../../utils/chartTheme";

/**
 * Календарь активности в стиле GitHub contributions.
 * Показывает последние 12 месяцев. Даже без данных — показывает пустую сетку.
 */
const ActivityCalendar = React.memo(function ActivityCalendarComponent({ data = [], currentTheme }) {
  const [hoveredDate, setHoveredDate] = useState(null);
  const [hoveredPos, setHoveredPos] = useState({ x: 0, y: 0 });

  // Генерируем пустые данные за 365 дней
  const fullData = useMemo(() => {
    if (data.length === 365) return data;

    const today = new Date();
    const map = {};
    for (const d of data) {
      map[d.date] = d;
    }

    const result = [];
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      result.push(
        map[key] || {
          date: key,
          cards: 0,
          sessions: 0,
          level: 0,
        },
      );
    }
    return result;
  }, [data]);

  // Группируем данные по месяцам
  const monthsData = useMemo(() => {
    const months = [];
    let currentMonth = null;
    let currentWeeks = [];
    let currentWeek = [];

    for (const day of fullData) {
      const date = new Date(day.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (monthKey !== currentMonth) {
        if (currentWeek.length) currentWeeks.push(currentWeek);
        if (currentWeeks.length) {
          months.push({ key: currentMonth, weeks: currentWeeks });
        }
        currentMonth = monthKey;
        currentWeeks = [];
        currentWeek = [];
      }

      const dow = date.getDay();
      if (dow === 0 && currentWeek.length) {
        currentWeeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    }

    if (currentWeek.length) currentWeeks.push(currentWeek);
    if (currentWeeks.length) {
      months.push({ key: currentMonth, weeks: currentWeeks });
    }

    return months;
  }, [fullData]);

  // Цвета для уровней активности — яркие, контрастные
  const isDark = currentTheme?.mode === "dark";
  const baseColor = currentTheme?.primary || "#667eea";

  const levelColors = isDark
    ? [
        "rgba(255,255,255,0.06)",
        `${baseColor}50`,
        `${baseColor}80`,
        `${baseColor}cc`,
        baseColor,
      ]
    : [
        "rgba(0,0,0,0.05)",
        `${baseColor}40`,
        `${baseColor}70`,
        `${baseColor}aa`,
        baseColor,
      ];

  const monthNames = [
    "Янв",
    "Фев",
    "Мар",
    "Апр",
    "Май",
    "Июн",
    "Июл",
    "Авг",
    "Сен",
    "Окт",
    "Ноя",
    "Дек",
  ];

  const hasAnyActivity = fullData.some((d) => d.cards > 0);

  // Вычисляем ширину каждой колонки месяца (неделя = 13px + 3px gap = 16px)
  const CELL_WIDTH = 13;
  const GAP_WIDTH = 3;
  const WEEK_WIDTH = CELL_WIDTH + GAP_WIDTH;

  return (
    <div style={styles.container}>
      {/* Месяцы */}
      <div style={styles.monthsRow}>
        {monthsData.map((month) => {
          const firstWeek = month.weeks[0];
          if (!firstWeek || !firstWeek.length) return null;
          const firstDate = new Date(firstWeek[0].date);
          const monthName = monthNames[firstDate.getMonth()];
          const weekCount = month.weeks.length;
          const monthWidth = weekCount * WEEK_WIDTH - GAP_WIDTH; // последняя неделя без gap справа
          
          return (
            <div
              key={month.key}
              style={{
                ...styles.monthLabel,
                color: currentTheme?.textMuted || "#666",
                width: `${monthWidth}px`,
                minWidth: `${monthWidth}px`,
              }}
            >
              {monthName}
            </div>
          );
        })}
      </div>

      {/* Дни недели */}
      <div style={styles.gridWrapper}>
        <div style={styles.daysColumn}>
          {["", "Пн", "", "Ср", "", "Пт", ""].map((d, i) => (
            <div
              key={i}
              style={{
                ...styles.dayLabel,
                color: currentTheme?.textMuted || "#666",
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Сетка */}
        <div style={styles.grid}>
          {monthsData.map((month) => (
            <div key={month.key} style={styles.monthColumn}>
              {month.weeks.map((week, wi) => (
                <div key={wi} style={styles.weekColumn}>
                  {week.map((day) => {
                    const isDark = currentTheme?.mode === "dark";
                    return (
                      <div
                        key={day.date}
                        style={{
                          ...styles.cell,
                          background: levelColors[day.level] || levelColors[0],
                          borderRadius: "3px",
                          outline: getCellOutline(isDark, currentTheme?.border),
                        }}
                        onMouseEnter={(e) => {
                          setHoveredDate(day);
                          setHoveredPos({ x: e.clientX, y: e.clientY });
                        }}
                        onMouseLeave={() => setHoveredDate(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Тултип */}
      {hoveredDate && (
        <div
          style={{
            ...styles.tooltip,
            top: hoveredPos.y - 50,
            left: hoveredPos.x - 60,
            background: currentTheme?.surface || "var(--nt-surface)",
            color: currentTheme?.text || "var(--nt-text)",
            border: `1px solid ${currentTheme?.border || "var(--nt-border)"}`,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: "12px" }}>
            {new Date(hoveredDate.date).toLocaleDateString("ru-RU")}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: currentTheme?.textSecondary || "#666",
            }}
          >
            {hoveredDate.cards} карточек, {hoveredDate.sessions} сессий
          </div>
        </div>
      )}

      {/* Легенда */}
      <div style={styles.legend}>
        <span
          style={{ fontSize: "11px", color: currentTheme?.textMuted || "#666" }}
        >
          Меньше
        </span>
        {levelColors.map((color, i) => (
          <div key={i} style={{ ...styles.legendCell, background: color }} />
        ))}
        <span
          style={{ fontSize: "11px", color: currentTheme?.textMuted || "#666" }}
        >
          Больше
        </span>
        {!hasAnyActivity && (
          <span
            style={{
              fontSize: "11px",
              color: currentTheme?.textMuted || "#999",
              marginLeft: "8px",
            }}
          >
            Нет активности за последний год
          </span>
        )}
      </div>
    </div>
  );
});

export default ActivityCalendar;

const styles = {
  container: {
    overflowX: "auto",
    paddingBottom: "8px",
  },
  monthsRow: {
    display: "flex",
    marginLeft: "20px",
    marginBottom: "4px",
    gap: "3px",
  },
  monthLabel: {
    fontSize: "10px",
    textAlign: "left",
  },
  gridWrapper: {
    display: "flex",
    gap: "4px",
  },
  daysColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  dayLabel: {
    fontSize: "9px",
    height: "12px",
    lineHeight: "12px",
  },
  grid: {
    display: "flex",
    gap: "3px",
  },
  monthColumn: {
    display: "flex",
    gap: "3px",
    minWidth: "fit-content",
  },
  weekColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  cell: {
    width: "13px",
    height: "13px",
    borderRadius: "3px",
    cursor: "pointer",
    transition: "transform 0.15s, outline 0.15s",
    outline: "1px solid rgba(128,128,128,0.08)",
    outlineOffset: "-1px",
  },
  tooltip: {
    position: "fixed",
    padding: "6px 10px",
    borderRadius: "6px",
    boxShadow: "var(--nt-card-shadow, 0 2px 8px rgba(0,0,0,0.15))",
    zIndex: 1000,
    pointerEvents: "none",
  },
  legend: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
    marginTop: "8px",
    justifyContent: "flex-end",
  },
  legendCell: {
    width: "12px",
    height: "12px",
    borderRadius: "2px",
  },
};
