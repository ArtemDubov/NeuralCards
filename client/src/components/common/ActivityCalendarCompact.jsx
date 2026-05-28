import React from "react";

/**
 * Компактный календарь активности для публичных профилей
 * Упрощенная версия ActivityCalendar
 */
export default function ActivityCalendarCompact({ data = [], currentTheme }) {
  const isDark = currentTheme?.mode === "dark";
  const primary = currentTheme?.primary || "#667eea";
  
  // Получаем последние 90 дней активности
  const recentData = data.slice(-90);
  
  if (!recentData || recentData.length === 0) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "20px", 
        color: currentTheme?.textMuted || "#999",
        fontSize: "14px"
      }}>
        Нет данных об активности
      </div>
    );
  }

  // Группируем по месяцам
  const months = {};
  recentData.forEach(day => {
    const date = new Date(day.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });
    
    if (!months[monthKey]) {
      months[monthKey] = { name: monthName, days: [] };
    }
    months[monthKey].days.push(day);
  });

  // Функция для получения цвета в зависимости от уровня активности
  const getColor = (count) => {
    if (count === 0) return isDark ? "#2a2a3e" : "#ebedf0";
    if (count <= 2) return isDark ? "#0e4429" : "#c6e48b";
    if (count <= 5) return isDark ? "#006d32" : "#7bc96f";
    if (count <= 8) return isDark ? "#26a641" : "#239a3b";
    return isDark ? "#39d353" : "#196127";
  };

  return (
    <div className="activity-calendar-compact">
      {Object.entries(months).map(([monthKey, month]) => (
        <div key={monthKey} className="calendar-month-compact">
          <div className="month-label-compact" style={{ 
            color: currentTheme?.textSecondary || "#666",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "8px"
          }}>
            {month.name}
          </div>
          <div className="days-grid-compact" style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "3px"
          }}>
            {month.days.map((day, idx) => (
              <div
                key={idx}
                className="day-cell-compact"
                title={`${day.count} карточек - ${new Date(day.date).toLocaleDateString('ru-RU')}`}
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "2px",
                  background: getColor(day.count),
                  transition: "transform 0.2s",
                  cursor: "pointer"
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
