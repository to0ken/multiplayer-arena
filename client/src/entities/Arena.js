import * as THREE from 'three';
import { SCENE_CONFIG } from '../config/scene.js';

export class Arena {
  constructor() {
    this.group = new THREE.Group();
    this._createFloor();
    this._createGrid();
  }

  _createFloor() {
    const geometry = new THREE.PlaneGeometry(SCENE_CONFIG.arenaSize, SCENE_CONFIG.arenaSize);
    const material = new THREE.MeshStandardMaterial({ 
      color: SCENE_CONFIG.colors.floor,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.group.add(floor);
  }

  _createGrid() {
    const gridHelper = new THREE.GridHelper(
      SCENE_CONFIG.arenaSize, 
      SCENE_CONFIG.arenaSize, 
      SCENE_CONFIG.colors.grid, 
      SCENE_CONFIG.colors.grid
    );
    gridHelper.position.y = 0.01; // Чуть выше пола, чтобы не было z-fighting
    this.group.add(gridHelper);
  }

  addToScene(scene) {
    scene.add(this.group);
  }
}
