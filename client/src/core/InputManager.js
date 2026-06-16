export class InputManager {
  constructor() {
    this.keys = new Map();
    this.isChatOpen = false;
    
    this._bindEvents();
  }

  _bindEvents() {
    window.addEventListener('keydown', (e) => {
      this.keys.set(e.code, true);
      
      // Открытие/закрытие чата по Enter (если не в поле ввода)
      if (e.code === 'Enter' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        this.isChatOpen = !this.isChatOpen;
        this._toggleChatUI(this.isChatOpen);
      }
      
      // Закрытие чата по Esc
      if (e.code === 'Escape') {
        e.preventDefault();
        this.isChatOpen = false;
        this._toggleChatUI(false);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.set(e.code, false);
    });
  }

  _toggleChatUI(isOpen) {
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    
    if (isOpen) {
      chatContainer.classList.remove('hidden');
      setTimeout(() => {
        chatInput.focus();
      }, 100);
    } else {
      chatContainer.classList.add('hidden');
      chatInput.blur();
      // Возвращаем фокус на игру
      window.focus();
    }
  }

  isKeyDown(code) {
    return this.keys.get(code) === true;
  }
  
  getIsChatOpen() {
    return this.isChatOpen;
  }
}
