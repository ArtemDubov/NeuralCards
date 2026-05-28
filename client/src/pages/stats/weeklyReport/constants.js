/**
 * Константы для страницы еженедельных отчетов
 */

import { faBrain, faCalendar, faClock, faBullseye } from "../../../utils/icons";

export const METRICS_CONFIG = [
  {
    key: "cards_reviewed",
    label: "Карточек пройдено",
    icon: faBrain,
    color: "#3498db",
  },
  {
    key: "sessions_count",
    label: "Сессий",
    icon: faCalendar,
    color: "#9b59b6",
  },
  {
    key: "total_time",
    label: "Время (мин)",
    icon: faClock,
    color: "#e67e22",
  },
  {
    key: "accuracy",
    label: "Точность (%)",
    icon: faBullseye,
    color: "#27ae60",
  },
];
