import * as THREE from 'three';
import type { SolarSystemInstance } from '../objects/createSolarSystem';
import { SIMULATION_CONFIG } from '../data/solarSystem';

export function updateSolarSystem(system: SolarSystemInstance, delta: number): void {
  const scaledDelta = delta * SIMULATION_CONFIG.timeScale;

  system.bodies.forEach((body) => {
    body.mesh.rotation.y += body.data.rotationSpeed * scaledDelta;

    if (body.data.orbitRadius > 0) {
      body.pivot.rotation.y += body.data.orbitSpeed * scaledDelta;
    }

    if (body.clouds) {
      body.clouds.rotation.y += body.data.rotationSpeed * 0.62 * scaledDelta;
    }

    body.moons?.forEach((moon) => {
      moon.pivot.rotation.y += moon.data.orbitSpeed * scaledDelta;
      moon.mesh.rotation.y += moon.data.rotationSpeed * scaledDelta;
    });

    if (body.sunLayers) {
      const elapsedTime = performance.now() * 0.001 * SIMULATION_CONFIG.timeScale;
      const material = body.mesh.material;
      if (material instanceof THREE.ShaderMaterial && material.uniforms.uTime) {
        material.uniforms.uTime.value = elapsedTime;
      }
      body.sunLayers.texture.offset.x = (body.sunLayers.texture.offset.x + scaledDelta * 0.035) % 1;
      body.sunLayers.plasmaTexture.offset.x = (body.sunLayers.plasmaTexture.offset.x - scaledDelta * 0.055) % 1;
      const plasmaMaterial = body.sunLayers.plasma.material;
      if (plasmaMaterial instanceof THREE.ShaderMaterial && plasmaMaterial.uniforms.uTime) {
        plasmaMaterial.uniforms.uTime.value = elapsedTime;
      }
      body.sunLayers.plasma.rotation.y -= body.data.rotationSpeed * 0.62 * scaledDelta;
      body.sunLayers.corona.rotation.y += scaledDelta * 0.035;
      body.sunLayers.corona.material.uniforms.uTime.value = elapsedTime;
      body.sunLayers.halos.forEach((halo, index) => {
        const material = halo.material;
        const baseOpacity = [0.68, 0.56, 0.36][index] ?? 0.36;
        const pulse = [0.055, 0.045, 0.03][index] ?? 0.03;
        const rate = [1.05, 0.72, 0.48][index] ?? 0.48;
        material.opacity = baseOpacity + Math.sin(elapsedTime * rate + index * 1.7) * pulse;
      });
    }
  });
}
