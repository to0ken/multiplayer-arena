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
      
      // Используем userId из базы данных, а не socket.id!
      const userId = player.userId || null;
      
      console.log('💾 Saving message:', message, 'from:', player.username, 'userId:', userId);
      
      // Сохранить в БД
      const savedMessage = await saveChatMessage(
        userId,  // ← Теперь передаём числовой ID
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
      
      // Отправить всем в комнате
      this.io.to(socket.rooms).emit('new-chat-message', chatMessage);
      
      console.log(`💬 [${player.username}]: ${message}`);
    } catch (error) {
      console.error('❌ Error handling chat message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }
}

module.exports = ChatManager;
