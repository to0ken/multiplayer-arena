import * as THREE from 'three';
import { SCENE_CONFIG } from '../config/scene.js';
import { InputManager } from './InputManager.js';
import { NetworkManager } from './NetworkManager.js';
import { Arena } from '../entities/Arena.js';
import { Player } from '../entities/Player.js';
import { ChatUI } from '../entities/ChatUI.js';

export class Game {
  constructor() {
    this.clock = new THREE.Clock();
    this.players = new Map();
    this.localPlayerId = null;
    
    this._initThree();
    this._initManagers();
    this._initEntities();
    this._setupNetworkCallbacks();
  }

  _initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(SCENE_CONFIG.colors.background);
    this.scene.fog = new THREE.Fog(SCENE_CONFIG.colors.background, 20, 50);

    this.camera = new THREE.PerspectiveCamera(
      SCENE_CONFIG.camera.fov,
      window.innerWidth / window.innerHeight,
      SCENE_CONFIG.camera.near,
      SCENE_CONFIG.camera.far
    );
    this.camera.position.set(
      SCENE_CONFIG.camera.position.x,
      SCENE_CONFIG.camera.position.y,
      SCENE_CONFIG.camera.position.z
    );
    this.camera.lookAt(SCENE_CONFIG.camera.lookAt.x, SCENE_CONFIG.camera.lookAt.y, SCENE_CONFIG.camera.lookAt.z);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    document.getElementById('game-container').appendChild(this.renderer.domElement);

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    this.scene.add(dirLight);

    window.addEventListener('resize', () => this._onWindowResize());
  }

  _initManagers() {
    this.input = new InputManager();
    this.network = new NetworkManager();
    this.chatUI = new ChatUI(this.network, this.input);
  }

  _initEntities() {
    this.arena = new Arena();
    this.arena.addToScene(this.scene);
  }

  _setupNetworkCallbacks() {
    this.network.callbacks.onRoomJoined = (data) => {
  this.localPlayerId = this.network.socket.id;
  const localData = data.players.find(p => p.id === this.localPlayerId);
  
  document.getElementById('username').textContent = `👤 ${localData.username}`;
  document.getElementById('room-info').textContent = `🏠 Комната: ${data.roomId} (${data.players.length}/2)`;
  
  // Создаем локального игрока (УБРАЛИ дублирование const localData)
  const localPlayer = new Player(localData.id, localData.username, localData.color, true);
  localPlayer.addToScene(this.scene);
  this.players.set(localData.id, localPlayer);

  // Создаем удаленных игроков
  data.players.forEach(p => {
    if (p.id !== this.localPlayerId) {
      this._addRemotePlayer(p);
    }
  });

  document.getElementById('loading').style.display = 'none';
};

    this.network.callbacks.onPlayerJoined = (playerData) => {
      this._addRemotePlayer(playerData);
      document.getElementById('room-info').textContent = `🏠 Комната: ${this.network.socket.id} (${this.players.size}/2)`;
    };

    this.network.callbacks.onPlayerLeft = (data) => {
      const player = this.players.get(data.id);
      if (player) {
        player.removeFromScene(this.scene);
        this.players.delete(data.id);
      }
    };

    this.network.callbacks.onPlayerMoved = (data) => {
      const player = this.players.get(data.id);
      if ( player) {
        player.updatePosition(data.position, data.rotation);
      }
    };

    this.network.callbacks.onChatHistory = (messages) => {
      this.chatUI.loadHistory(messages);
    };

    this.network.callbacks.onNewChatMessage = (message) => {
      this.chatUI.addMessage(message);
    };
  }

  _addRemotePlayer(data) {
    const player = new Player(data.id, data.username, data.color, false);
    player.updatePosition(data.position, data.rotation);
    player.addToScene(this.scene);
    this.players.set(data.id, player);
  }

  start(userData) {
    this.network.connect(userData);
    this._animate();
  }

  _animate() {
    requestAnimationFrame(() => this._animate());
    
    const delta = this.clock.getDelta();
    const localPlayer = this.players.get(this.localPlayerId);

    if (localPlayer && !this.input.isChatOpen) {
      let moved = false;
      const speed = SCENE_CONFIG.playerSpeed;
      const pos = localPlayer.mesh.position.clone();
      const halfSize = SCENE_CONFIG.arenaSize / 2 - SCENE_CONFIG.playerRadius;

      if (this.input.isKeyDown('KeyW') || this.input.isKeyDown('ArrowUp')) { pos.z -= speed; moved = true; }
      if (this.input.isKeyDown('KeyS') || this.input.isKeyDown('ArrowDown')) { pos.z += speed; moved = true; }
      if (this.input.isKeyDown('KeyA') || this.input.isKeyDown('ArrowLeft')) { pos.x -= speed; moved = true; }
      if (this.input.isKeyDown('KeyD') || this.input.isKeyDown('ArrowRight')) { pos.x += speed; moved = true; }

      // Ограничение границами арены
      pos.x = Math.max(-halfSize, Math.min(halfSize, pos.x));
      pos.z = Math.max(-halfSize, Math.min(halfSize, pos.z));

      if (moved) {
        // Вычисляем угол поворота в направлении движения
        const dx = pos.x - localPlayer.mesh.position.x;
        const dz = pos.z - localPlayer.mesh.position.z;
        const rotation = { x: 0, y: Math.atan2(dx, dz), z: 0 };
        
        localPlayer.updatePosition(pos, rotation);
        this.network.sendMove(pos, rotation);
      }
    }

    // Интерполяция всех удаленных игроков
    this.players.forEach(player => {
      if (!player.isLocal) {
        player.interpolate(delta);
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  _onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
