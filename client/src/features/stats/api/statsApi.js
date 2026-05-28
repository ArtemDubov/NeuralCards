import axiosClient from "../../../shared/api/axiosClient";
import { API_ENDPOINTS } from "../../../shared/api/apiConfig";

export const statsApi = {
  getLeaderboard: (limit = 50, periodDays = 30) =>
    axiosClient.get(API_ENDPOINTS.STATS.LEADERBOARD, { params: { limit, period_days: periodDays } }),

  getWeeklyReport: (weeks = 4) =>
    axiosClient.get(API_ENDPOINTS.STATS.WEEKLY_REPORT, { params: { weeks } }),

  getHourlyHeatmap: (days = 30) =>
    axiosClient.get(API_ENDPOINTS.STATS.HOURLY_HEATMAP, { params: { days } }),

  getForecast: () =>
    axiosClient.get(API_ENDPOINTS.STATS.FORECAST),

  getStatsForExport: () =>
    axiosClient.get(API_ENDPOINTS.STATS.EXPORT),
};
