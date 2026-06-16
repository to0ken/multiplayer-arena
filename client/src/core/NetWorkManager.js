import { io } from 'socket.io-client';
import { SOCKET_URL, NETWORK_CONFIG } from '../config/network.js';

export class NetworkManager {
  constructor() {
    this.socket = null;
    this.callbacks = {
      onRoomJoined: null,
      onPlayerJoined: null,
      onPlayerLeft: null,
      onPlayerMoved: null,
      onChatHistory: null,
      onNewChatMessage: null,
      onError: null
    };
  }

  connect(userData) {
    this.socket = io(SOCKET_URL, NETWORK_CONFIG);

    this.socket.on('connect', () => {
      console.log(' Connected to server');
      this.socket.emit('join-game', userData);
    });

    this.socket.on('room-joined', (data) => {
      if (this.callbacks.onRoomJoined) this.callbacks.onRoomJoined(data);
    });

    this.socket.on('player-joined', (player) => {
      if (this.callbacks.onPlayerJoined) this.callbacks.onPlayerJoined(player);
    });

    this.socket.on('player-left', (data) => {
      if (this.callbacks.onPlayerLeft) this.callbacks.onPlayerLeft(data);
    });

    this.socket.on('player-moved', (data) => {
      if (this.callbacks.onPlayerMoved) this.callbacks.onPlayerMoved(data);
    });

    this.socket.on('chat-history', (messages) => {
      if (this.callbacks.onChatHistory) this.callbacks.onChatHistory(messages);
    });

    this.socket.on('new-chat-message', (message) => {
      if (this.callbacks.onNewChatMessage) this.callbacks.onNewChatMessage(message);
    });

    this.socket.on('error', (err) => {
      console.error('Socket error:', err);
      if (this.callbacks.onError) this.callbacks.onError(err);
    });
  }

  sendMove(position, rotation) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('player-move', { position, rotation });
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.connected) {
        console.log('📤 Sending message:', message); // Добавьте эту строку
        this.socket.emit('chat-message', message);
  } else {
        console.error('❌ Socket not connected'); // И эту
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
