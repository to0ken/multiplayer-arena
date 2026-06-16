class GameRoom {
  constructor(id, io) {
    this.id = id;
    this.io = io;
    this.players = new Map();
    this.createdAt = Date.now();
  }
  
  addPlayer(socketId, userData) {
    const player = {
      id: socketId,           // Socket ID (для идентификации в комнате)
      userId: userData.id, 
      username: userData.username,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      color: this.getRandomColor(),
      joinedAt: Date.now()
    };
    
    this.players.set(socketId, player);
    return player;
  }
  
  removePlayer(socketId) {
    this.players.delete(socketId);
  }
  
  getRandomColor() {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', 
      '#6c5ce7', '#a29bfe', '#fd79a8', '#00b894'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  getPlayer(socketId) {
    return this.players.get(socketId);
  }
  
  getAllPlayers() {
    return Array.from(this.players.values());
  }
}

module.exports = GameRoom;
