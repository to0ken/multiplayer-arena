import * as THREE from 'three';
import { SCENE_CONFIG } from '../config/scene.js';

export class Player {
  constructor(id, username, color, isLocal = false) {
    this.id = id;
    this.username = username;
    this.isLocal = isLocal;
    
    // Целевые значения для плавной интерполяции
    this.targetPosition = new THREE.Vector3(0, SCENE_CONFIG.playerRadius, 0);
    this.targetRotation = 0;
    
    this.mesh = this._createMesh(color);
    this.label = this._createLabel(username);
    
    this.mesh.add(this.label);
    this.label.position.y = SCENE_CONFIG.playerRadius + 0.5;
  }

  _createMesh(color) {
    const geometry = new THREE.BoxGeometry(
      SCENE_CONFIG.playerRadius * 2, 
      SCENE_CONFIG.playerRadius * 2, 
      SCENE_CONFIG.playerRadius * 2
    );
    const material = new THREE.MeshStandardMaterial({ color: color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.copy(this.targetPosition);
    return mesh;
  }

  _createLabel(text) {
    // Создаем текстуру из Canvas для имени игрока (легковесная альтернатива TextGeometry)
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    context.font = 'Bold 32px Arial';
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = 'Bold 32px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(4, 1, 1);
    
    return sprite;
  }

  updatePosition(position, rotation) {
    if (this.isLocal) {
      this.mesh.position.set(position.x, SCENE_CONFIG.playerRadius, position.z);
      this.mesh.rotation.y = rotation.y;
    } else {
      // Плавная интерполяция для удаленных игроков
      this.targetPosition.set(position.x, SCENE_CONFIG.playerRadius, position.z);
      this.targetRotation = rotation.y;
    }
  }

  interpolate(delta) {
    if (!this.isLocal) {
      const lerpFactor = Math.min(delta * 10, 1); // Скорость сглаживания
      this.mesh.position.lerp(this.targetPosition, lerpFactor);
      
      // Плавный поворот
      let currentRot = this.mesh.rotation.y;
      let diff = this.targetRotation - currentRot;
      // Нормализация угла
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.mesh.rotation.y += diff * lerpFactor;
    }
  }

  addToScene(scene) {
    scene.add(this.mesh);
  }

  removeFromScene(scene) {
    scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
