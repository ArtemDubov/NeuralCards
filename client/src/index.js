import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
// Подключение модульной дизайн-системы
import "./styles/design-system/index.css";
import "./styles/theme-styles.css";
import "./styles/ui-enhancements.css";
import App from "./App";

// ===== СОХРАНЕНИЕ ЛОГОВ =====
const logs = [];

function saveLog(type, args) {
  logs.push({ type, args: Array.from(args), time: new Date().toISOString() });
  if (logs.length > 400) logs.shift(); // Храним последние 400 логов
  sessionStorage.setItem("app_logs", JSON.stringify(logs));
}

// Глобальная функция для просмотра логов
window.showLogs = function (count = 40) {
  const saved = JSON.parse(sessionStorage.getItem("app_logs") || "[]");
  console.log(`\n=== ПОСЛЕДНИЕ ${count} ЛОГОВ ===`);
  saved.slice(-count).forEach((l) => {
    const icon = l.type === "error" ? "❌" : l.type === "warn" ? "⚠️" : "📝";
    const time = l.time.split("T")[1].split(".")[0];
    console.log(`${icon} ${time} |`, ...l.args);
  });
  console.log("=== КОНЕЦ ЛОГОВ ===\n");
  return saved.slice(-count);
};

// Очистка логов
window.clearLogs = function () {
  sessionStorage.removeItem("app_logs");
  logs.length = 0;
  console.log("✅ Логи очищены");
};

// Экспорт логов в файл
window.exportLogs = function () {
  const saved = JSON.parse(sessionStorage.getItem("app_logs") || "[]");
  const blob = new Blob([JSON.stringify(saved, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `logs-${new Date().toISOString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  console.log("✅ Логи экспортированы в файл");
};

// Перехватываем логи
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.log = function (...args) {
  saveLog("log", args);
  originalConsoleLog.apply(console, args);
};

console.error = function (...args) {
  saveLog("error", args);
  originalConsoleError.apply(console, args);
};

console.warn = function (...args) {
  saveLog("warn", args);
  originalConsoleWarn.apply(console, args);
};

// Восстанавливаем логи (тихо, без сообщений)
const savedLogs = sessionStorage.getItem("app_logs");
if (savedLogs) {
  const parsed = JSON.parse(savedLogs);
  logs.push(...parsed);
}

// ===== ПРЕДОТВРАЩЕНИЕ ПЕРЕЗАГРУЗКИ =====
window.addEventListener("beforeunload", () => {
  // Тихая очистка
});

// Перехват ошибок (без дублирования в консоль)
window.addEventListener("error", (e) => {
  e.preventDefault();
  saveLog("error", [e.error?.message || e.message || "Unknown error"]);
});

window.addEventListener("unhandledrejection", (e) => {
  e.preventDefault();
  saveLog("error", ["Unhandled rejection:", e.reason]);
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
