import * as THREE from 'three';
import type { TextureMap } from '../utils/loadTextures';

export function createScene(textures: TextureMap): THREE.Scene {
  const scene = new THREE.Scene();
  const starsTexture = textures['/textures/stars.jpg'];

  if (starsTexture) {
    scene.background = starsTexture;
  }

  return scene;
}
