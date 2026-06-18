const { saveChatMessage } = require('../database/database');

class ChatManager {
  constructor(io) {
    this.io = io;
  }
  
  async handleMessage(socket, player, message) {
    try {
      if (!message || message.trim().length === 0) {
        return;
      }
      
      if (message.length > 500) {
        socket.emit('error', { message: 'Message too long (max 500 chars)' });
        return;
      }
      
      const userId = player.userId || null;
      
      // Сохранить в БД
      const savedMessage = await saveChatMessage(
        userId,
        player.username,
        message.trim()
      );
      
      // Создать объект сообщения
      const chatMessage = {
        id: savedMessage.id,
        username: player.username,
        message: savedMessage.message,
        timestamp: savedMessage.created_at,
        userId: userId
      };
      
    // всем 
      this.io.emit('new-chat-message', chatMessage);
      
      console.log('💬 Chat message sent:', chatMessage.username, '-', chatMessage.message);
      
    } catch (error) {
      console.error('❌ Error handling chat message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }
}

module.exports = ChatManager;
