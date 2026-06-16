// Определяем базовый URL для сокетов
// В разработке Vite проксирует запросы, в продакшене используем относительный путь
export const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin;

export const NETWORK_CONFIG = {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000
};
