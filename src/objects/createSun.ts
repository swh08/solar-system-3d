import * as THREE from 'three';
import type { SolarBodyData } from '../data/solarSystem';
import type { TextureMap } from '../utils/loadTextures';
import { degToRad } from '../utils/math';

export interface CreatedSun {
  group: THREE.Group;
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>;
  plasma: THREE.Mesh;
  corona: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>;
  halos: THREE.Sprite[];
  texture: THREE.Texture;
  plasmaTexture: THREE.Texture;
}

export function createSun(data: SolarBodyData, textures: TextureMap): CreatedSun {
  const group = new THREE.Group();
  const texture = prepareAnimatedTexture(textures[data.texture]);
  const plasmaTexture = prepareAnimatedTexture(textures[data.texture]);
  const geometry = new THREE.SphereGeometry(data.radius, 96, 96);
  const material = createSunSurfaceMaterial(texture);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = data.id;
  mesh.rotation.z = degToRad(data.axialTilt);
  group.add(mesh);

  const plasmaGeometry = new THREE.SphereGeometry(data.radius * 1.008, 96, 96);
  const plasmaMaterial = createSunPlasmaMaterial(plasmaTexture);
  const plasma = new THREE.Mesh(plasmaGeometry, plasmaMaterial);
  plasma.name = `${data.id}-plasma`;
  plasma.rotation.z = degToRad(data.axialTilt);
  group.add(plasma);

  const coronaGeometry = new THREE.SphereGeometry(data.radius * 1.035, 96, 96);
  const coronaMaterial = createCoronaMaterial();
  const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
  corona.name = `${data.id}-corona`;
  corona.renderOrder = -1;
  group.add(corona);

  const halos = [
    createHalo(`${data.id}-halo-near`, data.radius * 3.15, 0xffd17a, createHaloTexture('near'), 0.68, -2),
    createHalo(`${data.id}-halo-mid`, data.radius * 5.7, 0xff9b3f, createHaloTexture('mid'), 0.62, -3),
    createHalo(`${data.id}-halo-far`, data.radius * 8.9, 0xff5a1d, createHaloTexture('far'), 0.42, -4)
  ];
  halos.forEach((halo) => group.add(halo));

  return { group, mesh, plasma, corona, halos, texture, plasmaTexture };
}

function prepareAnimatedTexture(texture: THREE.Texture): THREE.Texture {
  const animatedTexture = texture.clone();
  animatedTexture.wrapS = THREE.RepeatWrapping;
  animatedTexture.wrapT = THREE.ClampToEdgeWrapping;
  animatedTexture.repeat.set(1, 1);
  animatedTexture.needsUpdate = true;
  return animatedTexture;
}

function createSunSurfaceMaterial(texture: THREE.Texture): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture },
      uTime: { value: 0 },
      uHot: { value: new THREE.Color(0xffd978) },
      uBase: { value: new THREE.Color(0xff6514) },
      uLane: { value: new THREE.Color(0x601000) },
      uDeep: { value: new THREE.Color(0x240300) }
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vNormalView;
      varying vec3 vViewPosition;
      varying vec3 vObjectNormal;
      varying float vSurfaceLift;

      float hash(vec3 p) {
        return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
      }

      float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        vec3 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(
            mix(hash(i + vec3(0.0, 0.0, 0.0)), hash(i + vec3(1.0, 0.0, 0.0)), u.x),
            mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), u.x),
            u.y
          ),
          mix(
            mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), u.x),
            mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), u.x),
            u.y
          ),
          u.z
        );
      }

      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.52;
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p);
          p = p * 2.07 + vec3(3.7, 8.2, 1.9);
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vUv = uv;
        vObjectNormal = normalize(normal);
        vSurfaceLift = fbm(vObjectNormal * 4.2 + vec3(uTime * 0.09, -uTime * 0.064, uTime * 0.052));
        vec3 displacedPosition = position + normal * ((vSurfaceLift - 0.5) * 0.042);
        vec4 modelViewPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
        vNormalView = normalize(normalMatrix * normal);
        vViewPosition = -modelViewPosition.xyz;
        gl_Position = projectionMatrix * modelViewPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform vec3 uHot;
      uniform vec3 uBase;
      uniform vec3 uLane;
      uniform vec3 uDeep;
      varying vec2 vUv;
      varying vec3 vNormalView;
      varying vec3 vViewPosition;
      varying vec3 vObjectNormal;
      varying float vSurfaceLift;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 5; i++) {
          value += amplitude * noise(p);
          p = p * 2.03 + vec2(8.31, 2.17);
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 shear = vec2(uTime * 0.032, sin(vUv.y * 18.0 + uTime * 0.9) * 0.018);
        vec2 flowA = vUv + shear;
        vec2 flowB = vUv * 1.7 + vec2(-uTime * 0.055, uTime * 0.032);
        vec3 textureColor = texture2D(uTexture, flowA).rgb;
        float textureLight = dot(textureColor, vec3(0.42, 0.38, 0.2));
        vec3 textureBase = textureColor * vec3(1.18, 1.04, 0.82);
        float cells = fbm(flowB * 7.0);
        float fineBoil = fbm(flowA * 24.0 + cells * 1.55 + uTime * 0.18);
        float broadHeat = fbm(vObjectNormal.xy * 5.8 + vec2(uTime * 0.08, -uTime * 0.05));
        float softMottle = fbm(flowA * 13.0 + broadHeat * 1.2 + vec2(uTime * 0.065, -uTime * 0.04));
        float currentFlow = fbm(flowA * 10.0 + vec2(uTime * 0.16, -uTime * 0.09) + broadHeat * 0.8);
        float warmLanes = smoothstep(0.28, 0.86, softMottle) * 0.18;
        float hotKernels = smoothstep(0.72, 1.0, fineBoil + cells * 0.14);
        float currentHighlights = smoothstep(0.62, 0.96, currentFlow + broadHeat * 0.22);
        float heat = clamp(textureLight * 0.66 + cells * 0.16 + fineBoil * 0.08 + broadHeat * 0.18, 0.0, 1.0);

        vec3 color = textureBase;
        color = mix(color, uDeep, (1.0 - heat) * 0.1);
        color = mix(color, uBase, warmLanes * 0.08);
        color = mix(color, uHot, hotKernels * 0.25 + currentHighlights * 0.18 + smoothstep(0.72, 1.0, textureLight) * 0.16);
        color += vec3(1.0, 0.24, 0.02) * pow(max(fineBoil, 0.0), 3.0) * 0.24;
        color += uBase * (vSurfaceLift - 0.45) * 0.14;
        color += uHot * max(currentFlow - 0.48, 0.0) * 0.16;

        vec3 normalView = normalize(vNormalView);
        vec3 viewDirection = normalize(vViewPosition);
        float face = clamp(abs(dot(normalView, viewDirection)), 0.0, 1.0);
        color *= mix(0.58, 1.0, smoothstep(0.05, 0.5, face));
        float rim = 1.0 - abs(dot(normalView, viewDirection));
        color += uBase * pow(rim, 2.2) * 0.42;
        color += uHot * pow(rim, 5.0) * 0.28;

        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
}

function createSunPlasmaMaterial(texture: THREE.Texture): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture },
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0xff8f2b) }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormalView;
      varying vec3 vViewPosition;

      void main() {
        vUv = uv;
        vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
        vNormalView = normalize(normalMatrix * normal);
        vViewPosition = -modelViewPosition.xyz;
        gl_Position = projectionMatrix * modelViewPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform vec3 uColor;
      varying vec2 vUv;
      varying vec3 vNormalView;
      varying vec3 vViewPosition;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(41.1, 289.7))) * 95731.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 5; i++) {
          value += amplitude * noise(p);
          p = p * 2.05 + vec2(5.2, 1.7);
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 flow = vUv + vec2(-uTime * 0.055, sin(vUv.y * 24.0 + uTime * 1.25) * 0.02);
        vec3 texel = texture2D(uTexture, flow).rgb;
        float filaments = fbm(flow * 9.0 + fbm(flow * 3.5) * 1.45);
        float sparks = smoothstep(0.72, 1.0, filaments + texel.r * 0.16);
        vec3 normalView = normalize(vNormalView);
        vec3 viewDirection = normalize(vViewPosition);
        float rim = 1.0 - abs(dot(normalView, viewDirection));
        float alpha = (0.022 + sparks * 0.11) * (0.3 + pow(rim, 0.85) * 0.95);
        vec3 color = uColor * (0.75 + sparks * 0.5);
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
}

function createCoronaMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorCore: { value: new THREE.Color(0xff7a24) },
      uColorEdge: { value: new THREE.Color(0xffe2a0) }
    },
    vertexShader: `
      varying vec3 vNormalView;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;

      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
        vNormalView = normalize(normalMatrix * normal);
        vViewPosition = -modelViewPosition.xyz;
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorCore;
      uniform vec3 uColorEdge;
      varying vec3 vNormalView;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;

      float layeredWave(vec3 position) {
        float a = sin(position.y * 2.2 + uTime * 0.75);
        float b = sin((position.x + position.z) * 2.8 - uTime * 0.58);
        float c = sin(length(position.xz) * 3.7 + uTime * 0.42);
        return (a + b + c) / 3.0;
      }

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p);
          p = p * 2.08 + vec2(3.2, 7.4);
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec3 normalView = normalize(vNormalView);
        vec3 viewDirection = normalize(vViewPosition);
        float rim = 1.0 - abs(dot(normalView, viewDirection));
        float corona = smoothstep(0.06, 1.0, pow(rim, 1.15));
        float wave = layeredWave(normalize(vWorldPosition));
        float turbulence = fbm(normalize(vWorldPosition).xy * 6.5 + vec2(uTime * 0.08, -uTime * 0.04));
        float flare = smoothstep(-0.35, 0.85, wave + turbulence * 0.55) * 0.42;
        float alpha = clamp(corona * (0.032 + flare * 0.22), 0.0, 0.092);
        vec3 color = mix(uColorCore, uColorEdge, corona);
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
}

function createHalo(
  name: string,
  scale: number,
  color: number,
  texture: THREE.Texture,
  opacity: number,
  renderOrder: number
): THREE.Sprite {
  const material = new THREE.SpriteMaterial({
    map: texture,
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false
  });
  const halo = new THREE.Sprite(material);
  halo.name = name;
  halo.scale.setScalar(scale);
  halo.renderOrder = renderOrder;
  return halo;
}

function createHaloTexture(intensity: 'near' | 'mid' | 'far'): THREE.Texture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Unable to create sun halo texture.');
  }

  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  if (intensity === 'near') {
    gradient.addColorStop(0, 'rgba(255, 238, 180, 0.42)');
    gradient.addColorStop(0.28, 'rgba(255, 193, 85, 0.28)');
    gradient.addColorStop(0.62, 'rgba(255, 112, 28, 0.09)');
    gradient.addColorStop(1, 'rgba(255, 96, 24, 0)');
  } else if (intensity === 'mid') {
    gradient.addColorStop(0, 'rgba(255, 203, 105, 0.24)');
    gradient.addColorStop(0.26, 'rgba(255, 137, 42, 0.16)');
    gradient.addColorStop(0.58, 'rgba(255, 92, 20, 0.075)');
    gradient.addColorStop(1, 'rgba(255, 82, 18, 0)');
  } else {
    gradient.addColorStop(0, 'rgba(255, 146, 58, 0.13)');
    gradient.addColorStop(0.34, 'rgba(255, 88, 26, 0.072)');
    gradient.addColorStop(0.72, 'rgba(255, 56, 18, 0.026)');
    gradient.addColorStop(1, 'rgba(255, 56, 18, 0)');
  }

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const haloTexture = new THREE.CanvasTexture(canvas);
  haloTexture.needsUpdate = true;
  return haloTexture;
}
