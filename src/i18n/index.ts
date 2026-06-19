import type { BodyId } from '../data/solarSystem';

export type Lang = 'zh' | 'en';

export const translations = {
  zh: {
    loading: '正在加载太阳系...',
    loadingFailed: '纹理加载失败',
    webglUnsupported: '当前浏览器不支持 WebGL，无法显示 3D 太阳系。',
    scrollHint: '拖拽环绕观察，滚动缩放',
    swipeHint: '拖拽环绕观察，双指缩放',
    currentFocus: '当前聚焦',
    navigation: '星球导航',
    missingTexture: '缺失纹理',
    bodyAria: '切换到',
    bodies: {
      sun: {
        name: '太阳',
        description: '太阳是太阳系的中心恒星，为行星提供光和热。'
      },
      mercury: {
        name: '水星',
        description: '水星是距离太阳最近的行星，表面布满撞击坑。'
      },
      venus: {
        name: '金星',
        description: '金星拥有厚重大气层，是太阳系中最炎热的行星之一。'
      },
      earth: {
        name: '地球',
        description: '地球是目前已知唯一拥有生命的行星，云层独立缓慢旋转。'
      },
      mars: {
        name: '火星',
        description: '火星因富含氧化铁而呈现红色，也被称为红色星球。'
      },
      jupiter: {
        name: '木星',
        description: '木星是太阳系中最大的行星，拥有醒目的条纹云带。'
      },
      saturn: {
        name: '土星',
        description: '土星以壮观的行星环而闻名，星环会跟随行星运动。'
      },
      uranus: {
        name: '天王星',
        description: '天王星拥有明显倾斜的自转轴，呈现冰蓝色调。'
      },
      neptune: {
        name: '海王星',
        description: '海王星是太阳系中最远的行星，拥有深蓝色外观。'
      }
    },
    labels: {
      rotation: '自转',
      orbit: '公转',
      distance: '轨道距离',
      radius: '半径'
    },
    units: {
      visual: '视觉单位',
      stationary: '无公转'
    }
  },
  en: {
    loading: 'Loading Solar System...',
    loadingFailed: 'Texture loading failed',
    webglUnsupported: 'This browser does not support WebGL, so the 3D solar system cannot be displayed.',
    scrollHint: 'Drag to orbit. Scroll to zoom.',
    swipeHint: 'Drag to orbit. Pinch to zoom.',
    currentFocus: 'Current Focus',
    navigation: 'Planet Navigation',
    missingTexture: 'Missing texture',
    bodyAria: 'Travel to',
    bodies: {
      sun: {
        name: 'Sun',
        description: 'The Sun is the central star of the Solar System, providing light and heat to the planets.'
      },
      mercury: {
        name: 'Mercury',
        description: 'Mercury is the closest planet to the Sun, with a cratered rocky surface.'
      },
      venus: {
        name: 'Venus',
        description: 'Venus has a thick atmosphere and is one of the hottest planets in the Solar System.'
      },
      earth: {
        name: 'Earth',
        description: 'Earth is the only known planet that supports life, with a separate slowly rotating cloud layer.'
      },
      mars: {
        name: 'Mars',
        description: 'Mars appears red because of iron oxide on its surface and is known as the red planet.'
      },
      jupiter: {
        name: 'Jupiter',
        description: 'Jupiter is the largest planet in the Solar System, with striking banded clouds.'
      },
      saturn: {
        name: 'Saturn',
        description: 'Saturn is famous for its spectacular ring system, which moves with the planet.'
      },
      uranus: {
        name: 'Uranus',
        description: 'Uranus has a strongly tilted rotation axis and a pale ice-blue appearance.'
      },
      neptune: {
        name: 'Neptune',
        description: 'Neptune is the farthest planet in the Solar System and has a deep blue appearance.'
      }
    },
    labels: {
      rotation: 'Rotation',
      orbit: 'Orbit',
      distance: 'Orbit Distance',
      radius: 'Radius'
    },
    units: {
      visual: 'visual units',
      stationary: 'stationary'
    }
  }
} as const;

const currentLanguage: Lang = getInitialLanguage();

export function getInitialLanguage(): Lang {
  return window.navigator.language.startsWith('zh') ? 'zh' : 'en';
}

export function getLanguage(): Lang {
  return currentLanguage;
}

export function t(path: string): string {
  const parts = path.split('.');
  let value: unknown = translations[currentLanguage];

  for (const part of parts) {
    if (typeof value !== 'object' || value === null || !(part in value)) {
      return path;
    }

    value = (value as Record<string, unknown>)[part];
  }

  return typeof value === 'string' ? value : path;
}

export function getBodyName(bodyId: BodyId): string {
  return t(`bodies.${bodyId}.name`);
}

export function getBodyDescription(bodyId: BodyId): string {
  return t(`bodies.${bodyId}.description`);
}
