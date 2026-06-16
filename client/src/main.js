import { Game } from './core/Game.js';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    window.location.href = '/login.html';
    return;
  }

  try {
    const user = JSON.parse(userStr);
    
    const game = new Game();
    // Передаём userId из базы данных!
    game.start({ 
      id: user.id,          
      username: user.username 
    });
    
  } catch (error) {
    console.error('Failed to parse user data:', error);
    localStorage.clear();
    window.location.href = '/login.html';
  }
});

window.logout = () => {
  localStorage.clear();
  window.location.href = '/login.html';
};
