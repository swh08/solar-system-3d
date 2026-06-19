import * as THREE from 'three';

export function createCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 300);
  const isMobileViewport = window.innerWidth <= 760;
  camera.position.set(0, isMobileViewport ? 13 : 11, isMobileViewport ? 25 : 20);
  return camera;
}
