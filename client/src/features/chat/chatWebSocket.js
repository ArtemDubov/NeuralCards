/**
 * WebSocket клиент для real-time чата.
 * Auto-reconnect с exponential backoff.
 */

const WS_URL = (process.env.REACT_APP_API_URL || "http://localhost:8081")
  .replace("http", "ws")
  .replace("https", "wss");

class ChatWS {
  constructor() {
    this.ws = null;
    this.token = null;
    this.uid = null;
    this.reconnectTimer = null;
    this.attempts = 0;
    this.maxAttempts = 5;
    this.handlers = new Map();
    this.idCounter = 0;
  }

  /** Подключиться. Вызывать при входе на страницу чата. */
  connect(token, userId) {
    this.token = token;
    this.uid = userId;
    this._open();
  }

  _open() {
    if (!this.token || this.ws?.readyState === WebSocket.OPEN) return;
    if (this.ws) this._close();

    // Примечание: токен передаётся в query param. Для продакшена
    // рекомендуется отправлять auth первым сообщением вместо URL.
    this.ws = new WebSocket(
      `${WS_URL}/ws/chat?token=${encodeURIComponent(this.token)}`,
    );
    this.ws.onopen = () => {
      this.attempts = 0;
    };
    this.ws.onmessage = (ev) => {
      try {
        const d = JSON.parse(ev.data);
        for (const [, fn] of this.handlers) fn(d);
      } catch (err) {
        // Ошибка парсинга WebSocket сообщения - тихо игнорируем
      }
    };
    this.ws.onclose = () => {
      this._reconnect();
    };
    this.ws.onerror = () => {
      // Ошибка WebSocket обрабатывается через переподключение
    };
  }

  _close() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.close(1000);
      } catch {
        // ignore close errors
      }
      this.ws = null;
    }
  }

  _reconnect() {
    this.ws = null;
    if (!this.token || this.attempts >= this.maxAttempts) return;
    this.attempts++;
    this.reconnectTimer = setTimeout(
      () => this._open(),
      1000 * this.attempts * this.attempts,
    );
  }

  /** Отключиться. Вызывать при уходе со страницы чата. */
  disconnect() {
    this.token = null;
    this.uid = null;
    this._close();
    this.handlers.clear();
  }

  /** Подписаться на события. Возвращает unsubscribe fn. */
  on(type, fn) {
    const id = ++this.idCounter;
    this.handlers.set(id, (d) => {
      if (d.type === type) fn(d);
    });
    return () => this.handlers.delete(id);
  }

  /** Отправить действие. */
  send(action, data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action, ...data }));
      return true;
    }
    return false;
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const chatWS = new ChatWS();
