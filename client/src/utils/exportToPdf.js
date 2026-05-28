/**
 * Generate PDF report from stats data using browser print API
 * @param {Object} data - Stats data from /api/stats/export
 */
export async function generatePdfReport(data) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Разрешите всплывающие окна для генерации PDF');
    return;
  }

  const {
    user = {},
    summary = {},
    weeklyTrends = [],
    myRank = {},
    forecast = {},
  } = data;

  const now = new Date().toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const userName = user.name || 'Пользователь';
  const userEmail = user.email || '';

  // Format weekly trends table rows
  const trendsRows = weeklyTrends
    .map(
      (w) => `
      <tr>
        <td>${w.week}</td>
        <td>${w.cardsStudied}</td>
        <td>${w.timeSpentMin} мин</td>
        <td>${w.streak} дн.</td>
        <td>${w.accuracy}%</td>
      </tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>NeuralTrident — Отчёт</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1a1a2e;
      padding: 30px;
      background: #fff;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3498db;
    }

    .header h1 {
      font-size: 28px;
      color: #2c3e50;
      margin-bottom: 8px;
    }

    .header .subtitle {
      font-size: 14px;
      color: #7f8c8d;
    }

    .user-info {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 24px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .user-info div { font-size: 14px; }
    .user-info strong { color: #2c3e50; }

    .section {
      margin-bottom: 28px;
    }

    .section h2 {
      font-size: 20px;
      color: #2c3e50;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #ecf0f1;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 14px;
    }

    .summary-card {
      padding: 16px;
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: #fff;
      border-radius: 10px;
      text-align: center;
    }

    .summary-card:nth-child(2) {
      background: linear-gradient(135deg, #9b59b6, #8e44ad);
    }
    .summary-card:nth-child(3) {
      background: linear-gradient(135deg, #e74c3c, #c0392b);
    }
    .summary-card:nth-child(4) {
      background: linear-gradient(135deg, #27ae60, #229954);
    }

    .summary-card .value {
      font-size: 28px;
      font-weight: bold;
    }

    .summary-card .label {
      font-size: 12px;
      opacity: 0.85;
      margin-top: 4px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    thead th {
      background: #2c3e50;
      color: #fff;
      padding: 10px 8px;
      text-align: left;
    }

    tbody td {
      padding: 9px 8px;
      border-bottom: 1px solid #ecf0f1;
    }

    tbody tr:nth-child(even) {
      background: #f8f9fa;
    }

    .rank-box {
      padding: 16px;
      background: #f8f9fa;
      border-left: 4px solid #f39c12;
      border-radius: 6px;
    }

    .rank-box .rank-position {
      font-size: 32px;
      font-weight: bold;
      color: #f39c12;
    }

    .forecast-box {
      padding: 16px;
      background: #eaf2f8;
      border-radius: 8px;
      border-left: 4px solid #3498db;
    }

    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 11px;
      color: #95a5a6;
      border-top: 1px solid #ecf0f1;
      padding-top: 12px;
    }

    @media print {
      body { padding: 15px; }
      .summary-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      thead th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>NeuralTrident — Статистика обучения</h1>
    <div class="subtitle">Автоматический отчёт</div>
  </div>

  <div class="user-info">
    <div><strong>Пользователь:</strong> ${userName}</div>
    ${userEmail ? `<div><strong>Email:</strong> ${userEmail}</div>` : ''}
    <div><strong>Дата формирования:</strong> ${now}</div>
  </div>

  <div class="section">
    <h2>Общая сводка</h2>
    <div class="summary-grid">
      <div class="summary-card">
        <div class="value">${summary.totalCards ?? '—'}</div>
        <div class="label">Карточек изучено</div>
      </div>
      <div class="summary-card">
        <div class="value">${summary.totalTimeMin ?? '—'} мин</div>
        <div class="label">Время обучения</div>
      </div>
      <div class="summary-card">
        <div class="value">${summary.currentStreak ?? '—'} дн.</div>
        <div class="label">Текущая серия</div>
      </div>
      <div class="summary-card">
        <div class="value">${summary.accuracy ?? '—'}%</div>
        <div class="label">Точность ответов</div>
      </div>
    </div>
  </div>

  ${weeklyTrends.length > 0 ? `
  <div class="section">
    <h2>Еженедельная динамика</h2>
    <table>
      <thead>
        <tr>
          <th>Неделя</th>
          <th>Карточек</th>
          <th>Время</th>
          <th>Серия (дн.)</th>
          <th>Точность</th>
        </tr>
      </thead>
      <tbody>
        ${trendsRows}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${myRank.rank ? `
  <div class="section">
    <h2>Мой рейтинг</h2>
    <div class="rank-box">
      <div class="rank-position">#${myRank.rank}</div>
      <div>XP за период: <strong>${myRank.xp ?? '—'}</strong></div>
    </div>
  </div>
  ` : ''}

  ${forecast.message ? `
  <div class="section">
    <h2>Прогноз</h2>
    <div class="forecast-box">
      <p>${forecast.message}</p>
      ${forecast.predictedLevel ? `<p><strong>Ожидаемый уровень:</strong> ${forecast.predictedLevel}</p>` : ''}
    </div>
  </div>
  ` : ''}

  <div class="footer">
    Сгенерировано NeuralTrident &bull; ${now}
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}
