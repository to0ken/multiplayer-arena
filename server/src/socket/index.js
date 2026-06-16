const GameRoom = require('./GameRoom');
const ChatManager = require('./ChatManager');
const { getRecentMessages } = require('../database/database');
const config = require('../config');

const rooms = new Map();

module.exports = (io) => {
  const chatManager = new ChatManager(io);
  
  io.on('connection', (socket) => {
    console.log(`🔌 Player connected: ${socket.id}`);
    
    let currentPlayer = null;
    let currentRoom = null;
    
    // Присоединение к игре
    socket.on('join-game', async (userData) => {
      try {
        console.log(' Join request from:', userData.username, 'userId:', userData.id);
        
        // Найти комнату с свободным местом
        let room = null;
        for (const [roomId, r] of rooms) {
          if (r.players.size < config.game.maxPlayersPerRoom) {
            room = r;
            break;
          }
        }
        
        // Если нет свободных комнат - создаём новую
        if (!room) {
          const roomId = `room-${rooms.size + 1}`;
          room = new GameRoom(roomId, io);
          rooms.set(roomId, room);
          console.log(`🆕 Created new room: ${roomId}`);
        }
        
        // Добавить игрока в комнату
        room.addPlayer(socket.id, userData);
        socket.join(room.id);
        
        currentPlayer = room.players.get(socket.id);
        currentRoom = room;
        
        console.log(`✅ Player ${userData.username} joined room ${room.id} (${room.players.size}/${config.game.maxPlayersPerRoom})`);
        
        // Отправить текущее состояние комнаты
        socket.emit('room-joined', {
          roomId: room.id,
          players: Array.from(room.players.values()),
          arenaSize: config.game.arenaSize
        });
        
        // Уведомить других игроков
        socket.to(room.id).emit('player-joined', currentPlayer);
        
        // Отправить историю чата
        const messages = await getRecentMessages();
        socket.emit('chat-history', messages);
        
      } catch (error) {
        console.error('❌ Error joining game:', error);
        socket.emit('error', { message: 'Failed to join game' });
      }
    });
    
    // Движение игрока
    socket.on('player-move', (data) => {
      if (!currentRoom || !currentPlayer) return;
      
      currentPlayer.position = data.position;
      currentPlayer.rotation = data.rotation;
      
      socket.to(currentRoom.id).emit('player-moved', {
        id: socket.id,
        position: data.position,
        rotation: data.rotation
      });
    });
    
    // Сообщения чата
    socket.on('chat-message', async (message) => {
      if (!currentPlayer) return;
      await chatManager.handleMessage(socket, currentPlayer, message);
    });
    
    // Отключение
    socket.on('disconnect', () => {
      console.log(`🔌 Player disconnected: ${socket.id}`);
      
      if (currentRoom) {
        currentRoom.removePlayer(socket.id);
        socket.to(currentRoom.id).emit('player-left', { id: socket.id });
        
        console.log(` Room ${currentRoom.id} now has ${currentRoom.players.size} players`);
        
        // Удалить комнату если пуста
        if (currentRoom.players.size === 0) {
          rooms.delete(currentRoom.id);
          console.log(`🗑️ Room ${currentRoom.id} removed`);
        }
      }
    });
  });
};
