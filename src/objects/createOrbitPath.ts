import * as THREE from 'three';

export function createOrbitPath(radius: number): THREE.LineLoop {
  const segments = 192;
  const points: THREE.Vector3[] = [];

  for (let i = 0; i < segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0xb7c7db,
    transparent: true,
    opacity: 0.16,
    depthWrite: false
  });

  return new THREE.LineLoop(geometry, material);
}
