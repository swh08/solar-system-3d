import * as THREE from 'three';
import type { MoonData, SolarBodyData } from '../data/solarSystem';
import type { TextureMap } from '../utils/loadTextures';
import { degToRad } from '../utils/math';

export interface CreatedMoon {
  data: MoonData;
  pivot: THREE.Object3D;
  mesh: THREE.Mesh;
}

export interface CreatedPlanet {
  group: THREE.Group;
  mesh: THREE.Mesh;
  clouds?: THREE.Mesh;
  ring?: THREE.Mesh;
  moons: CreatedMoon[];
}

export function createPlanet(data: SolarBodyData, textures: TextureMap): CreatedPlanet {
  const group = new THREE.Group();
  group.position.x = data.orbitRadius;

  const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    map: textures[data.texture],
    roughness: 0.82,
    metalness: 0.02
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = data.id;
  mesh.rotation.z = degToRad(data.axialTilt);
  group.add(mesh);

  const created: CreatedPlanet = { group, mesh, moons: [] };

  if (data.hasClouds && data.cloudTexture) {
    const cloudGeometry = new THREE.SphereGeometry(data.radius * 1.025, 64, 64);
    const cloudMaterial = new THREE.MeshStandardMaterial({
      map: textures[data.cloudTexture],
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      roughness: 0.9
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    clouds.name = `${data.id}-clouds`;
    clouds.rotation.z = degToRad(data.axialTilt);
    group.add(clouds);
    created.clouds = clouds;
  }

  if (data.hasRing && data.ringTexture && data.ringInnerRadius && data.ringOuterRadius) {
    const ringGeometry = new THREE.RingGeometry(data.ringInnerRadius, data.ringOuterRadius, 160);
    const position = ringGeometry.attributes.position;
    const uv = ringGeometry.attributes.uv;
    const vector = new THREE.Vector3();

    for (let i = 0; i < position.count; i += 1) {
      vector.fromBufferAttribute(position, i);
      const radius = vector.length();
      const normalized = (radius - data.ringInnerRadius) / (data.ringOuterRadius - data.ringInnerRadius);
      uv.setXY(i, normalized, 0.5);
    }

    const ringMaterial = new THREE.MeshBasicMaterial({
      map: textures[data.ringTexture],
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.name = `${data.id}-ring`;
    ring.rotation.x = Math.PI / 2;
    ring.rotation.z = degToRad(data.axialTilt);
    group.add(ring);
    created.ring = ring;
  }

  if (data.moons) {
    data.moons.forEach((moonData) => {
      const moon = createMoon(moonData, textures[moonData.texture]);
      group.add(moon.pivot);
      created.moons.push(moon);
    });
  }

  return created;
}

function createMoon(data: MoonData, texture: THREE.Texture): CreatedMoon {
  const pivot = new THREE.Object3D();
  pivot.rotation.y = degToRad(data.initialOrbitAngle);
  pivot.rotation.z = degToRad(data.inclination);

  const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.9,
    metalness: 0
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = data.name;
  mesh.position.x = data.orbitRadius;
  pivot.add(mesh);

  return { data, pivot, mesh };
}
