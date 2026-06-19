import * as THREE from 'three';

export function addLights(scene: THREE.Scene): void {
  const sunLight = new THREE.PointLight(0xffddaa, 360, 240, 1.58);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  const ambientLight = new THREE.AmbientLight(0x344055, 0.045);
  scene.add(ambientLight);
}
