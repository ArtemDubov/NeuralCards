// Уровни сложности пароля
export const PASSWORD_STRENGTH_LEVELS = [
  { level: 0, label: "Не введён", color: "#e0e0e0" },
  { level: 1, label: "Очень слабый", color: "#e74c3c" },
  { level: 2, label: "Слабый", color: "#e67e22" },
  { level: 3, label: "Средний", color: "#f39c12" },
  { level: 4, label: "Надёжный", color: "#27ae60" },
  { level: 5, label: "Очень надёжный", color: "#2ecc71" },
];

/**
 * Рассчитывает сложность пароля (0-5)
 * @param {string} password - Пароль для проверки
 * @returns {number} Уровень сложности от 0 до 5
 */
export function calculatePasswordStrength(password) {
  let level = 0;

  if (password.length >= 6) level++;
  if (password.length >= 10) level++;
  if (password.length >= 16) level++;
  if (/[a-z]/.test(password)) level++;
  if (/[A-Z]/.test(password)) level++;
  if (/\d/.test(password)) level++;
  if (/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'"`~]/.test(password)) level++;

  return Math.min(level, 5);
}
