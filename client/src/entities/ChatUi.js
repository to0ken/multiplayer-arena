export class ChatUI {
  constructor(networkManager, inputManager) {
      this.networkManager = networkManager;
    this.inputManager = inputManager;  // Добавляем ссылку на InputManager
    this.messagesContainer = document.getElementById('chat-messages');
    this.input = document.getElementById('chat-input');
    this.sendBtn = document.getElementById('chat-send');
    
    this._bindEvents();
  }

  _bindEvents() {
    this.sendBtn.addEventListener('click', () => this._sendMessage());
  
    this.input.addEventListener('keydown', (e) => {
        if (e.code === 'Enter') {
        e.preventDefault();
        this._sendMessage();
    }
    
    // Закрытие чата по ESC когда фокус на input
    if (e.code === 'Escape') {
      e.preventDefault();
      this.input.blur();
      if (this.inputManager) {
        this.inputManager.isChatOpen = false;
        this.inputManager._toggleChatUI(false);
      }
    }
  });
  }

  _sendMessage() {
    const text = this.input.value.trim();
    if (text) {
      this.networkManager.sendMessage(text);
      this.input.value = '';
    }
  }

  addMessage(message, isHistory = false) {
    const div = document.createElement('div');
    div.className = 'chat-message';
    
    const time = new Date(message.created_at || Date.now()).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    div.innerHTML = `
      <span class="username">${this._escapeHtml(message.username)}:</span>
      <span class="text">${this._escapeHtml(message.message)}</span>
      <span class="time">${time}</span>
    `;
    
    this.messagesContainer.appendChild(div);
    
    // Автопрокрутка вниз (только для новых сообщений)
    if (!isHistory) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  loadHistory(messages) {
    this.messagesContainer.innerHTML = '';
    messages.forEach(msg => this.addMessage(msg, true));
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
