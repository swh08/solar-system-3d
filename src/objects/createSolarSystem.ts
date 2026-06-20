import * as THREE from 'three';
import { SOLAR_SYSTEM_DATA, type BodyId, type SolarBodyData } from '../data/solarSystem';
import type { TextureMap } from '../utils/loadTextures';
import { degToRad } from '../utils/math';
import { createPlanet, type CreatedMoon } from './createPlanet';
import { createSun } from './createSun';

export interface SunLayers {
  plasma: THREE.Mesh;
  corona: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>;
  halos: THREE.Sprite[];
  texture: THREE.Texture;
  plasmaTexture: THREE.Texture;
}

export interface SolarBodyInstance {
  data: SolarBodyData;
  pivot: THREE.Object3D;
  group: THREE.Group;
  mesh: THREE.Mesh;
  clouds?: THREE.Mesh;
  ring?: THREE.Mesh;
  moons?: CreatedMoon[];
  sunLayers?: SunLayers;
}

export interface SolarSystemInstance {
  bodies: Map<BodyId, SolarBodyInstance>;
  root: THREE.Group;
}

export function createSolarSystem(scene: THREE.Scene, textures: TextureMap): SolarSystemInstance {
  const root = new THREE.Group();
  const bodies = new Map<BodyId, SolarBodyInstance>();

  scene.add(root);

  for (const data of SOLAR_SYSTEM_DATA) {
    const pivot = new THREE.Object3D();
    pivot.rotation.y = degToRad(data.initialOrbitAngle);
    root.add(pivot);

    if (data.id === 'sun') {
      const sun = createSun(data, textures);
      pivot.add(sun.group);
      bodies.set(data.id, {
        data,
        pivot,
        group: sun.group,
        mesh: sun.mesh,
        sunLayers: {
          plasma: sun.plasma,
          corona: sun.corona,
          halos: sun.halos,
          texture: sun.texture,
          plasmaTexture: sun.plasmaTexture
        }
      });
      continue;
    }

    const planet = createPlanet(data, textures);
    pivot.add(planet.group);
    bodies.set(data.id, {
      data,
      pivot,
      group: planet.group,
      mesh: planet.mesh,
      clouds: planet.clouds,
      ring: planet.ring,
      moons: planet.moons
    });
  }

  return { bodies, root };
}
