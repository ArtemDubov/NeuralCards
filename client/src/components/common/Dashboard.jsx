import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { profileApi } from "../../features/auth/api/profileApi";
import ActivityCalendar from "./ActivityCalendar";
import {
  faChartBar,
  faChartLine,
  faBullseye,
  faFire,
  faClock,
  faBrain,
  faCalendar,
} from "../../utils/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { getGridColor, getAxisColor, getTickLineColor, getAxisTickColor, adjustHeatmapColorForTheme, getSafeTextSecondary, getSafeTextMuted } from "../../utils/chartTheme";

// Стили
import '../../styles/design-system/pages/dashboard.css';

const Dashboard = React.memo(function DashboardComponent({ currentTheme }) {
  const [stats, setProfileStats] = useState(null);
  const [progress, setProgress] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      // Основные данные — если один упадёт, всё упадёт
      const [statsRes, progressRes, analyticsRes] =
        await Promise.all([
          profileApi.getStats(),
          profileApi.getProgress(7),
          profileApi.getAnalytics(),
        ]);

      setProfileStats(statsRes.data);
      setProgress(progressRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      // Ошибка загрузки данных дашборда обрабатывается через toast в API слое
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="dashboard-container" style={{ textAlign: "center", color: currentTheme?.text || "#333" }}>
        Загрузка дашборда...
      </div>
    );
  }

  const summary = analytics?.summary || {};
  const dayOfWeek = analytics?.day_of_week || [];
  const modeDist = analytics?.mode_distribution || {};
  const topSets = analytics?.top_sets || [];

  const modeNames = {
    practice: "Practice",
    quiz: "Quiz",
    marathon: "Marathon",
    dictation: "Dictation",
    matching: "Matching"
  };

  // Цвета режимов соответствуют TrainingModeSelectPage
  const modeColors = {
    practice: "#3498db",   // Голубой
    quiz: "#9b59b6",       // Фиолетовый
    marathon: "#2ecc71",   // Зеленый
    dictation: "#e67e22",  // Оранжевый
    matching: "#1abc9c",   // Бирюзовый
  };

  const totalCards = summary?.total_cards || stats?.total_cards_learned || 0;
  const isDark = currentTheme?.mode === "dark";

  return (
    <div className="dashboard-container">
      {/* Заголовок страницы */}
      <div className="page-header-section" style={{ marginBottom: "24px" }}>
        <h1 className="page-title" style={{ color: currentTheme.text, display: "flex", alignItems: "center" }}>
          <FontAwesomeIcon
            icon={faChartBar}
            style={{ marginRight: "8px", color: currentTheme?.primary || "var(--nt-primary)" }}
          />
          Статистика
        </h1>
      </div>

      {/* === ОБЪЕДИНЁННАЯ СТАТИСТИКА И АНАЛИТИКА === */}
      <section className="nt-stat-section">
        {/* Прогресс за неделю + Активность по дням */}
        <div className="progress-charts">
          <div className="progress-chart-card">
            <h3 className="sub-section-title">
              <FontAwesomeIcon
                icon={faChartLine}
                style={{ marginRight: "6px", color: "var(--nt-primary)" }}
              />
              За неделю
            </h3>
            <DayOfWeekChart 
              dayOfWeek={(progress || []).map(p => ({ name: p.day, cards: p.cards }))} 
              currentTheme={currentTheme} 
            />
          </div>
          <div className="progress-chart-card">
            <h3 className="sub-section-title">
              <FontAwesomeIcon
                icon={faChartBar}
                style={{ marginRight: "6px", color: "var(--nt-secondary)" }}
              />
              По дням недели
            </h3>
            <DayOfWeekChart dayOfWeek={dayOfWeek} currentTheme={currentTheme} />
          </div>
        </div>

        {/* Календарь активности */}
        <div className="white-card">
          <h3 className="sub-section-title">
            <FontAwesomeIcon icon={faCalendar} style={{ marginRight: "6px" }} />
            Календарь активности
          </h3>
          <ActivityCalendar
            data={analytics?.activity_calendar || []}
            currentTheme={currentTheme}
          />
        </div>

        {/* Блок точности - отдельный красивый блок */}
        <div className="accuracy-block">
          <div className="accuracy-content">
            <div className="accuracy-icon">
              <FontAwesomeIcon icon={faBullseye} style={{ fontSize: "32px", color: "var(--nt-success)" }} />
            </div>
            <div className="accuracy-info">
              <div className="accuracy-title">Точность ответов</div>
              <div className="accuracy-percentage">
                {summary.accuracy || stats?.accuracy || 0}%
              </div>
              <div className="accuracy-bar">
                <div 
                  className="accuracy-bar-fill"
                  style={{
                    width: `${summary.accuracy || stats?.accuracy || 0}%`,
                    background: "linear-gradient(90deg, var(--nt-success) 0%, var(--nt-success-light, #2ecc71) 100%)"
                  }}
                />
              </div>
              <div className="accuracy-description">
                {(() => {
                  const acc = summary.accuracy || stats?.accuracy || 0;
                  if (acc >= 90) return 'Отличный результат! Вы мастерски владеете материалом';
                  if (acc >= 75) return 'Хороший уровень! Продолжайте в том же духе';
                  if (acc >= 60) return 'Неплохо, но есть куда расти. Повторите сложные карточки';
                  return 'Рекомендуем повторить материал для улучшения результатов';
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Распределение по режимам + Распределение по наборам */}
        <div className="detail-grid">
          <div className="white-card">
            <h3 className="sub-section-title">Распределение по режимам</h3>
            {Object.keys(modeDist).length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={Object.entries(modeDist).map(([key, val]) => ({
                        name: modeNames[key] || key,
                        value: val.sessions,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {Object.entries(modeDist).map(([key]) => (
                        <Cell key={key} fill={modeColors[key] || "#999"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: isDark
                          ? `${currentTheme.surface || "var(--nt-surface)"}ee`
                          : "rgba(255,255,255,0.98)",
                        border: `1px solid ${isDark ? (currentTheme.border || "var(--nt-border)") : "rgba(0,0,0,0.08)"}`,
                        borderRadius: "8px",
                        color: currentTheme.text || "var(--nt-text)",
                      }}
                      itemStyle={{
                        color: currentTheme.text || "var(--nt-text)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mode-legend">
                  {Object.entries(modeDist).map(([key, val]) => (
                    <div key={key} className="mode-legend-item">
                      <span
                        className="mode-dot"
                        style={{
                          background: modeColors[key] || "#999",
                        }}
                      />
                      <span className="mode-label">
                        {modeNames[key] || key}: {val.sessions} сессий
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-chart">
                <span className="empty-chart-text">
                  Начните тренировки, чтобы увидеть распределение
                </span>
              </div>
            )}
          </div>
          <div className="white-card">
            <h3 className="sub-section-title">Распределение по наборам</h3>
            {topSets.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={topSets.map((set) => ({
                        name: set.name || set.title || set.setName || "Набор",
                        value: set.cards,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {topSets.map((entry, i) => {
                        const primaryColor = currentTheme?.primary || "#667eea";
                        return (
                          <Cell
                            key={i}
                            fill={entry.cards > 0 ? primaryColor : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}
                            opacity={entry.cards > 0 ? 0.9 : 0.5}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: isDark
                          ? `${currentTheme.surface || "var(--nt-surface)"}ee`
                          : "rgba(255,255,255,0.98)",
                        border: `1px solid ${isDark ? (currentTheme.border || "var(--nt-border)") : "rgba(0,0,0,0.08)"}`,
                        borderRadius: "8px",
                        color: currentTheme.text || "var(--nt-text)",
                      }}
                      itemStyle={{
                        color: currentTheme.text || "var(--nt-text)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mode-legend">
                  {topSets.map((set, i) => {
                    const setName = set.name || set.title || set.setName || `Набор ${i + 1}`;
                    return (
                      <div key={i} className="mode-legend-item">
                        <span
                          className="mode-dot"
                          style={{
                            background: set.cards > 0 ? (currentTheme?.primary || "var(--nt-primary)") : "var(--nt-text-muted)",
                          }}
                        />
                        <span className="mode-label">
                          {setName}: {set.cards} карточек
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="empty-chart">
                <span className="empty-chart-text">
                  Начните тренировки, чтобы увидеть распределение
                </span>
              </div>
            )}
          </div>
        </div>

      </section>
    </div>
  );
});

export default Dashboard;

/* ============================================================
   DayOfWeekChart - График активности по дням недели
   ============================================================ */

const DayOfWeekChart = React.memo(function DayOfWeekChart({ dayOfWeek, currentTheme }) {
  const chartData =
    dayOfWeek && dayOfWeek.length > 0
      ? dayOfWeek
      : [
          { name: "Пн", cards: 0 },
          { name: "Вт", cards: 0 },
          { name: "Ср", cards: 0 },
          { name: "Чт", cards: 0 },
          { name: "Пт", cards: 0 },
          { name: "Сб", cards: 0 },
          { name: "Вс", cards: 0 },
        ];

  const isEmpty = chartData.every((d) => d.cards === 0);
  const isDark = currentTheme?.mode === "dark";
  const primaryColor = currentTheme?.primary || "#667eea";

  return (
    <div className="chart-container" style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={getGridColor(isDark)}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{
              fontSize: 12,
              fill: getAxisTickColor(isDark),
            }}
            axisLine={{
              stroke: getAxisColor(isDark),
            }}
            tickLine={{
              stroke: getTickLineColor(isDark),
            }}
          />
          <YAxis
            tick={{
              fontSize: 12,
              fill: getAxisTickColor(isDark),
            }}
            axisLine={{
              stroke: getAxisColor(isDark),
            }}
            tickLine={{
              stroke: getTickLineColor(isDark),
            }}
            domain={[0, isEmpty ? 10 : Math.max(10, ...chartData.map((d) => d.cards))]}
            allowDecimals={false}
            width={40}
            tickCount={6}
          />
          <Tooltip
            cursor={{
              fill: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
            }}
            contentStyle={{
              background: isDark
                ? `${currentTheme.surface || "rgba(28,28,28,0.96)"}ee`
                : "rgba(255,255,255,0.98)",
              border: `1px solid ${isDark ? (currentTheme.border || "rgba(255,255,255,0.15)") : "rgba(0,0,0,0.1)"}`,
              borderRadius: "8px",
              boxShadow: currentTheme.cardShadow || "0 4px 12px rgba(0,0,0,0.12)",
              color: currentTheme.text || "var(--nt-text)",
            }}
            labelStyle={{
              color: currentTheme.textSecondary || "var(--nt-text-secondary)",
              fontWeight: 600,
            }}
            itemStyle={{
              color: currentTheme.text || "var(--nt-text)",
            }}
          />
          <Bar
            dataKey="cards"
            name="Карточек"
            radius={[6, 6, 0, 0]}
            barSize={32}
          >
            {chartData.map((entry, i) => {
              const cards = entry?.cards || 0;
              return (
                <Cell
                  key={i}
                  fill={
                    cards > 0
                      ? primaryColor
                      : isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.06)"
                  }
                  opacity={cards > 0 ? 0.9 : 0.5}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

/* ============================================================
   TripleHeatmap - Тепловой график соотношения карточек/времени/точности
   ============================================================ */

const TripleHeatmap = React.memo(function TripleHeatmap({ modeDist, summary, currentTheme }) {
  const isDark = currentTheme?.mode === "dark";
  
  // Преобразуем mode_distribution в массив для тепловой карты
  const modeEntries = Object.entries(modeDist || {});
  
  // Если данных нет, показываем заглушку
  if (modeEntries.length === 0) {
    return (
      <div style={{ 
        width: "100%", 
        minHeight: 250,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "4px",
          padding: "20px",
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
          borderRadius: "8px"
        }}>
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "40px",
                height: "40px",
                background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                borderRadius: "4px",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: "13px", color: getSafeTextMuted(currentTheme) }}>
          Начните тренировки, чтобы увидеть соотношение метрик
        </span>
      </div>
    );
  }

  // Создаем данные для тепловой карты на основе режимов тренировок
  const heatmapData = [];
  const modes = ['practice', 'quiz', 'marathon', 'dictation', 'matching'];
  const metrics = ['cards', 'sessions', 'accuracy'];
  
  // Находим максимальные значения для нормализации
  let maxValue = 0;
  modes.forEach(mode => {
    const modeData = modeDist[mode] || { cards: 0, sessions: 0, accuracy: 0 };
    metrics.forEach(metric => {
      const value = modeData[metric] || 0;
      if (value > maxValue) maxValue = value;
    });
  });
  
  // Если все нули, устанавливаем минимум для корректного отображения
  if (maxValue === 0) maxValue = 1;
  
  modes.forEach((mode, modeIdx) => {
    const modeData = modeDist[mode] || { cards: 0, sessions: 0, accuracy: 0 };
    
    metrics.forEach((metric, metricIdx) => {
      const value = modeData[metric] || 0;
      
      // Нормализуем относительно максимального значения (0-1)
      const normalizedValue = value / maxValue;
      
      heatmapData.push({
        mode,
        metric,
        value,
        normalizedValue,
        row: modeIdx,
        col: metricIdx
      });
    });
  });

  // Функция для вычисления цвета теплового графика
  const getHeatmapColor = (normalizedValue) => {
    // Тепловая карта: синий -> голубой -> зеленый -> желтый -> оранжевый -> красный
    let color;
    
    if (normalizedValue < 0.2) {
      // Синий -> Голубой
      const ratio = normalizedValue / 0.2;
      const r = Math.round(30 + (70 * ratio));
      const g = Math.round(144 + (106 * ratio));
      const b = Math.round(255 - (55 * ratio));
      color = `rgb(${r}, ${g}, ${b})`;
    } else if (normalizedValue < 0.4) {
      // Голубой -> Зеленый
      const ratio = (normalizedValue - 0.2) / 0.2;
      const r = Math.round(100 + (50 * ratio));
      const g = Math.round(250 - (50 * ratio));
      const b = Math.round(200 * (1 - ratio));
      color = `rgb(${r}, ${g}, ${b})`;
    } else if (normalizedValue < 0.6) {
      // Зеленый -> Желтый
      const ratio = (normalizedValue - 0.4) / 0.2;
      const r = Math.round(150 + (105 * ratio));
      const g = Math.round(200);
      const b = Math.round(0);
      color = `rgb(${r}, ${g}, ${b})`;
    } else if (normalizedValue < 0.8) {
      // Желтый -> Оранжевый
      const ratio = (normalizedValue - 0.6) / 0.2;
      const r = Math.round(255);
      const g = Math.round(200 - (100 * ratio));
      const b = Math.round(0);
      color = `rgb(${r}, ${g}, ${b})`;
    } else {
      // Оранжевый -> Красный
      const ratio = (normalizedValue - 0.8) / 0.2;
      const r = Math.round(255);
      const g = Math.round(100 * (1 - ratio));
      const b = Math.round(0);
      color = `rgb(${r}, ${g}, ${b})`;
    }
    
    // Корректируем цвет для тёмной темы
    return adjustHeatmapColorForTheme(color, isDark);
  };

  const modeNames = {
    practice: "Practice",
    quiz: "Quiz",
    marathon: "Marathon",
    dictation: "Dictation",
    matching: "Matching",
    interval: "Интервалы"
  };

  const metricNames = {
    cards: "Карточки",
    sessions: "Сессии",
    accuracy: "Точность %"
  };

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto repeat(3, 1fr)",
          gap: "3px",
          padding: "16px",
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
          borderRadius: "8px",
          maxWidth: "400px",
          margin: "0 auto"
        }}
      >
        {/* Заголовки столбцов */}
        <div style={{ padding: "6px 4px", fontWeight: "600", fontSize: "11px", color: getSafeTextSecondary(currentTheme) }}></div>
        {metrics.map(metric => (
          <div key={metric} style={{ 
            padding: "6px 4px", 
            fontWeight: "600", 
            fontSize: "11px", 
            textAlign: "center",
            color: getSafeTextSecondary(currentTheme)
          }}>
            {metricNames[metric]}
          </div>
        ))}
        
        {/* Строки с данными */}
        {modes.map((mode, rowIdx) => (
          <React.Fragment key={mode}>
            {/* Название режима */}
            <div style={{ 
              padding: "6px 8px", 
              fontSize: "11px", 
              fontWeight: "500",
              color: currentTheme?.text || "var(--nt-text)",
              display: "flex",
              alignItems: "center"
            }}>
              {modeNames[mode] || mode}
            </div>
            
            {/* Ячейки с данными */}
            {metrics.map((metric, colIdx) => {
              const cellData = heatmapData.find(d => d.row === rowIdx && d.col === colIdx);
              const value = cellData?.value || 0;
              const normalizedValue = cellData?.normalizedValue || 0;
              
              return (
                <div
                  key={`${mode}-${metric}`}
                  title={`${modeNames[mode]} - ${metricNames[metric]}: ${value}`}
                  style={{
                    aspectRatio: "1/1",
                    background: getHeatmapColor(normalizedValue),
                    borderRadius: "3px",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.1)"}`,
                    cursor: "pointer",
                    transition: "transform 0.15s, box-shadow 0.15s",
                    opacity: value > 0 ? 0.95 : 0.25,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: "600",
                    color: normalizedValue > 0.5 ? "var(--nt-text-inverse)" : (isDark ? "var(--nt-text)" : "var(--nt-text)"),
                    textShadow: normalizedValue > 0.4 ? (isDark ? "0 1px 2px rgba(0,0,0,0.4)" : "0 1px 2px rgba(0,0,0,0.2)") : "none"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.15)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.25)";
                    e.currentTarget.style.zIndex = "10";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.zIndex = "1";
                  }}
                >
                  {value > 0 ? value : "-"}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      
      {/* Легенда теплового графика */}
      <div style={{ 
        marginTop: "12px",
        padding: "0 16px"
      }}>
        <div style={{ 
          fontSize: "11px", 
          color: getSafeTextSecondary(currentTheme),
          marginBottom: "6px",
          textAlign: "center"
        }}>
          Интенсивность активности
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          justifyContent: "center"
        }}>
          <span style={{ fontSize: "10px", color: getSafeTextSecondary(currentTheme) }}>0</span>
          <div style={{
            width: "200px",
            height: "12px",
            borderRadius: "6px",
            background: "linear-gradient(to right, rgb(30, 144, 255), rgb(100, 250, 200), rgb(255, 200, 0), rgb(255, 100, 0), rgb(255, 0, 0))",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`
          }} />
          <span style={{ fontSize: "10px", color: getSafeTextSecondary(currentTheme) }}>{maxValue}</span>
        </div>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "9px",
          color: getSafeTextMuted(currentTheme),
          marginTop: "4px",
          padding: "0 4px"
        }}>
          <span>Минимум</span>
          <span>Максимум</span>
        </div>
      </div>
    </div>
  );
});

/* ============================================================
   Стили удалены - перенесены в dashboard.css
   ============================================================ */
