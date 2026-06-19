export type BodyId =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune';

export interface SolarBodyData {
  id: BodyId;
  radius: number;
  orbitRadius: number;
  realStats: Record<'en' | 'zh', {
    rotation: string;
    orbit: string;
    radius: string;
    distance: string;
  }>;
  texture: string;
  rotationSpeed: number;
  orbitSpeed: number;
  axialTilt: number;
  cameraDistance: number;
  initialOrbitAngle: number;
  hasRing?: boolean;
  ringTexture?: string;
  ringInnerRadius?: number;
  ringOuterRadius?: number;
  hasClouds?: boolean;
  cloudTexture?: string;
  moons?: MoonData[];
}

export interface MoonData {
  id: string;
  name: string;
  texture: string;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  initialOrbitAngle: number;
  inclination: number;
}

export const SIMULATION_CONFIG = {
  timeScale: 0.25,
  enableBloom: true,
  enableOrbitPaths: true
} as const;

export const BODY_ORDER: BodyId[] = [
  'sun',
  'mercury',
  'venus',
  'earth',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune'
];

export const SOLAR_SYSTEM_DATA: SolarBodyData[] = [
  {
    id: 'sun',
    radius: 4.2,
    orbitRadius: 0,
    realStats: {
      en: {
        rotation: '25.4 days',
        orbit: 'N/A',
        radius: '696,340 km',
        distance: '0 km'
      },
      zh: {
        rotation: '25.4天',
        orbit: '不适用',
        radius: '696,340公里',
        distance: '0公里'
      }
    },
    texture: '/textures/sun.jpg',
    rotationSpeed: 0.08,
    orbitSpeed: 0,
    axialTilt: 7.25,
    cameraDistance: 28,
    initialOrbitAngle: 0
  },
  {
    id: 'mercury',
    radius: 0.42,
    orbitRadius: 8,
    realStats: {
      en: {
        rotation: '58.6 days',
        orbit: '88 days',
        radius: '2,440 km',
        distance: '57.9M km'
      },
      zh: {
        rotation: '58.6天',
        orbit: '88天',
        radius: '2,440公里',
        distance: '5,790万公里'
      }
    },
    texture: '/textures/mercury.jpg',
    rotationSpeed: 0.22,
    orbitSpeed: 0.48,
    axialTilt: 0.03,
    cameraDistance: 2.4,
    initialOrbitAngle: 208
  },
  {
    id: 'venus',
    radius: 0.78,
    orbitRadius: 11,
    realStats: {
      en: {
        rotation: '243 days retrograde',
        orbit: '225 days',
        radius: '6,052 km',
        distance: '108.2M km'
      },
      zh: {
        rotation: '243天逆行',
        orbit: '225天',
        radius: '6,052公里',
        distance: '1.082亿公里'
      }
    },
    texture: '/textures/venus.jpg',
    rotationSpeed: -0.1,
    orbitSpeed: 0.35,
    axialTilt: 177.4,
    cameraDistance: 3.1,
    initialOrbitAngle: 328
  },
  {
    id: 'earth',
    radius: 0.82,
    orbitRadius: 14.5,
    realStats: {
      en: {
        rotation: '23.9 hours',
        orbit: '365 days',
        radius: '6,371 km',
        distance: '149.6M km'
      },
      zh: {
        rotation: '23.9小时',
        orbit: '365天',
        radius: '6,371公里',
        distance: '1.496亿公里'
      }
    },
    texture: '/textures/earth.jpg',
    rotationSpeed: 0.55,
    orbitSpeed: 0.28,
    axialTilt: 23.44,
    cameraDistance: 5,
    initialOrbitAngle: 66,
    hasClouds: true,
    cloudTexture: '/textures/earth_clouds.png',
    moons: [
      {
        id: 'moon',
        name: 'Moon',
        texture: '/textures/moon.jpg',
        radius: 0.28,
        orbitRadius: 1.95,
        orbitSpeed: 1.28,
        rotationSpeed: 0.26,
        initialOrbitAngle: 35,
        inclination: 5.1
      }
    ]
  },
  {
    id: 'mars',
    radius: 0.58,
    orbitRadius: 18,
    realStats: {
      en: {
        rotation: '24.6 hours',
        orbit: '687 days',
        radius: '3,390 km',
        distance: '227.9M km'
      },
      zh: {
        rotation: '24.6小时',
        orbit: '687天',
        radius: '3,390公里',
        distance: '2.279亿公里'
      }
    },
    texture: '/textures/mars.jpg',
    rotationSpeed: 0.5,
    orbitSpeed: 0.22,
    axialTilt: 25.19,
    cameraDistance: 4,
    initialOrbitAngle: 136,
    moons: [
      {
        id: 'phobos',
        name: 'Phobos',
        texture: '/textures/moons/phobos.jpg',
        radius: 0.14,
        orbitRadius: 1,
        orbitSpeed: 2.4,
        rotationSpeed: 0.42,
        initialOrbitAngle: 118,
        inclination: 1.1
      },
      {
        id: 'deimos',
        name: 'Deimos',
        texture: '/textures/moons/deimos.jpg',
        radius: 0.12,
        orbitRadius: 1.35,
        orbitSpeed: 1.7,
        rotationSpeed: 0.32,
        initialOrbitAngle: 288,
        inclination: 1.8
      }
    ]
  },
  {
    id: 'jupiter',
    radius: 2.25,
    orbitRadius: 24,
    realStats: {
      en: {
        rotation: '9.9 hours',
        orbit: '11.9 years',
        radius: '69,911 km',
        distance: '778.6M km'
      },
      zh: {
        rotation: '9.9小时',
        orbit: '11.9年',
        radius: '69,911公里',
        distance: '7.786亿公里'
      }
    },
    texture: '/textures/jupiter.jpg',
    rotationSpeed: 0.95,
    orbitSpeed: 0.13,
    axialTilt: 3.13,
    cameraDistance: 15,
    initialOrbitAngle: 28,
    moons: [
      {
        id: 'io',
        name: 'Io',
        texture: '/textures/moons/io.jpg',
        radius: 0.32,
        orbitRadius: 3.8,
        orbitSpeed: 1.35,
        rotationSpeed: 0.34,
        initialOrbitAngle: 28,
        inclination: 0.2
      },
      {
        id: 'europa',
        name: 'Europa',
        texture: '/textures/moons/europa.jpg',
        radius: 0.3,
        orbitRadius: 4.6,
        orbitSpeed: 1.05,
        rotationSpeed: 0.28,
        initialOrbitAngle: 112,
        inclination: 0.5
      },
      {
        id: 'ganymede',
        name: 'Ganymede',
        texture: '/textures/moons/ganymede.jpg',
        radius: 0.38,
        orbitRadius: 5.4,
        orbitSpeed: 0.82,
        rotationSpeed: 0.24,
        initialOrbitAngle: 204,
        inclination: 0.3
      },
      {
        id: 'callisto',
        name: 'Callisto',
        texture: '/textures/moons/callisto.jpg',
        radius: 0.34,
        orbitRadius: 6.2,
        orbitSpeed: 0.62,
        rotationSpeed: 0.2,
        initialOrbitAngle: 316,
        inclination: 0.2
      }
    ]
  },
  {
    id: 'saturn',
    radius: 1.9,
    orbitRadius: 31,
    realStats: {
      en: {
        rotation: '10.7 hours',
        orbit: '29.4 years',
        radius: '58,232 km',
        distance: '1.43B km'
      },
      zh: {
        rotation: '10.7小时',
        orbit: '29.4年',
        radius: '58,232公里',
        distance: '14.3亿公里'
      }
    },
    texture: '/textures/saturn.jpg',
    rotationSpeed: 0.82,
    orbitSpeed: 0.1,
    axialTilt: 26.73,
    cameraDistance: 15,
    initialOrbitAngle: 342,
    hasRing: true,
    ringTexture: '/textures/saturn_ring.png',
    ringInnerRadius: 2.25,
    ringOuterRadius: 3.65,
    moons: [
      {
        id: 'titan',
        name: 'Titan',
        texture: '/textures/moons/titan.jpg',
        radius: 0.34,
        orbitRadius: 5,
        orbitSpeed: 0.74,
        rotationSpeed: 0.2,
        initialOrbitAngle: 62,
        inclination: 0.3
      },
      {
        id: 'rhea',
        name: 'Rhea',
        texture: '/textures/moons/rhea.jpg',
        radius: 0.24,
        orbitRadius: 5.7,
        orbitSpeed: 0.94,
        rotationSpeed: 0.22,
        initialOrbitAngle: 238,
        inclination: 0.35
      }
    ]
  },
  {
    id: 'uranus',
    radius: 1.28,
    orbitRadius: 38,
    realStats: {
      en: {
        rotation: '17.2 hours retrograde',
        orbit: '83.7 years',
        radius: '25,362 km',
        distance: '2.87B km'
      },
      zh: {
        rotation: '17.2小时逆行',
        orbit: '83.7年',
        radius: '25,362公里',
        distance: '28.7亿公里'
      }
    },
    texture: '/textures/uranus.jpg',
    rotationSpeed: -0.62,
    orbitSpeed: 0.075,
    axialTilt: 97.77,
    cameraDistance: 7.5,
    initialOrbitAngle: 56,
    moons: [
      {
        id: 'titania',
        name: 'Titania',
        texture: '/textures/moons/titania.jpg',
        radius: 0.23,
        orbitRadius: 2.4,
        orbitSpeed: 0.86,
        rotationSpeed: 0.2,
        initialOrbitAngle: 82,
        inclination: 1.1
      },
      {
        id: 'oberon',
        name: 'Oberon',
        texture: '/textures/moons/oberon.jpg',
        radius: 0.22,
        orbitRadius: 2.9,
        orbitSpeed: 0.7,
        rotationSpeed: 0.18,
        initialOrbitAngle: 252,
        inclination: 0.9
      }
    ]
  },
  {
    id: 'neptune',
    radius: 1.24,
    orbitRadius: 45,
    realStats: {
      en: {
        rotation: '16.1 hours',
        orbit: '163.7 years',
        radius: '24,622 km',
        distance: '4.50B km'
      },
      zh: {
        rotation: '16.1小时',
        orbit: '163.7年',
        radius: '24,622公里',
        distance: '45.0亿公里'
      }
    },
    texture: '/textures/neptune.jpg',
    rotationSpeed: 0.58,
    orbitSpeed: 0.06,
    axialTilt: 28.32,
    cameraDistance: 7.4,
    initialOrbitAngle: 18,
    moons: [
      {
        id: 'triton',
        name: 'Triton',
        texture: '/textures/moons/triton.jpg',
        radius: 0.24,
        orbitRadius: 2.55,
        orbitSpeed: -0.82,
        rotationSpeed: -0.2,
        initialOrbitAngle: 134,
        inclination: 23.0
      }
    ]
  }
];

export const TEXTURE_PATHS = [
  '/textures/sun.jpg',
  '/textures/mercury.jpg',
  '/textures/venus.jpg',
  '/textures/earth.jpg',
  '/textures/earth_clouds.png',
  '/textures/mars.jpg',
  '/textures/jupiter.jpg',
  '/textures/saturn.jpg',
  '/textures/saturn_ring.png',
  '/textures/moon.jpg',
  '/textures/moons/phobos.jpg',
  '/textures/moons/deimos.jpg',
  '/textures/moons/io.jpg',
  '/textures/moons/europa.jpg',
  '/textures/moons/ganymede.jpg',
  '/textures/moons/callisto.jpg',
  '/textures/moons/titan.jpg',
  '/textures/moons/rhea.jpg',
  '/textures/moons/titania.jpg',
  '/textures/moons/oberon.jpg',
  '/textures/moons/triton.jpg',
  '/textures/uranus.jpg',
  '/textures/neptune.jpg',
  '/textures/stars.jpg'
] as const;
