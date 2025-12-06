/* src/utils/theme-init.js */
(function () {
  // Приоритет: сохранённый в localStorage → системный prefers‑color‑scheme → ocean (по‑умолчанию)
  const stored = localStorage.getItem("nt-theme");
  if (stored) {
    document.documentElement.setAttribute("data-theme", stored);
    return;
  }

  // Если пользователь не задал тему явно, полагаемся на системный запрос
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute(
    "data-theme",
    prefersDark ? "dark" : "ocean"
  );
})();
