import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BODY_ORDER, SIMULATION_CONFIG, SOLAR_SYSTEM_DATA, type BodyId } from './data/solarSystem';
import { updateSolarSystem } from './animation/updateSolarSystem';
import { CameraFocusController } from './controls/cameraFocus';
import { setupInputHandlers } from './controls/input';
import { getBodyDescription, getBodyName, getLanguage, t, type Lang } from './i18n';
import { createSolarSystem } from './objects/createSolarSystem';
import type { SolarSystemInstance } from './objects/createSolarSystem';
import { createCamera } from './scene/createCamera';
import { createRenderer } from './scene/createRenderer';
import { createScene } from './scene/createScene';
import { addLights } from './scene/lights';
import { loadTextures, TextureLoadError } from './utils/loadTextures';

const canvas = getElement<HTMLCanvasElement>('solar-canvas');
const loadingScreen = getElement<HTMLDivElement>('loading-screen');
const loadingTitle = getElement<HTMLParagraphElement>('loading-title');
const loadingDetail = getElement<HTMLParagraphElement>('loading-detail');
const loadingProgress = getElement<HTMLParagraphElement>('loading-progress');
const loadingProgressBar = getElement<HTMLDivElement>('loading-progress-bar');
const loadingSteps = getElement<HTMLUListElement>('loading-steps');
const loadingError = getElement<HTMLParagraphElement>('loading-error');
const bodyName = getElement<HTMLHeadingElement>('body-name');
const bodyDescription = getElement<HTMLParagraphElement>('body-description');
const bodyRotation = getElement<HTMLElement>('body-rotation');
const bodyOrbit = getElement<HTMLElement>('body-orbit');
const bodyRadius = getElement<HTMLElement>('body-radius');
const bodyDistance = getElement<HTMLElement>('body-distance');
const bodySymbol = getElement<HTMLDivElement>('body-symbol');
const planetNavList = getElement<HTMLDivElement>('planet-nav-list');
const interactionHint = getElement<HTMLParagraphElement>('interaction-hint');

let currentFocus: BodyId = 'sun';
let focusController: CameraFocusController | undefined;

interface LoadingStage {
  progress: number;
  title: string;
  detail: string;
  step: string;
}

const MIN_LOADING_TIME_MS = 2600;
const LOADING_STAGES: Record<Lang, LoadingStage[]> = {
  en: [
    {
      progress: 0,
      title: 'Booting solar renderer',
      detail: 'Allocating WebGL context and display buffers',
      step: 'Renderer online'
    },
    {
      progress: 14,
      title: 'Reading orbital atlas',
      detail: 'Mapping planet paths and axial tilt data',
      step: 'Orbital data mapped'
    },
    {
      progress: 28,
      title: 'Decoding surface maps',
      detail: 'Streaming planetary textures into GPU memory',
      step: 'Planet textures decoded'
    },
    {
      progress: 44,
      title: 'Igniting stellar layers',
      detail: 'Preparing animated sun plasma and heat aura passes',
      step: 'Solar corona prepared'
    },
    {
      progress: 60,
      title: 'Building navigation probes',
      detail: 'Generating rotating planet thumbnails and focus targets',
      step: 'Navigation probes ready'
    },
    {
      progress: 76,
      title: 'Calibrating camera travel',
      detail: 'Tuning zoom limits, touch controls, and orbit damping',
      step: 'Camera controls calibrated'
    },
    {
      progress: 90,
      title: 'Warming final frame',
      detail: 'Compositing bloom, starfield, and lighting response',
      step: 'Scene composite warmed'
    },
    {
      progress: 100,
      title: 'Solar system ready',
      detail: 'Handing control to the simulator',
      step: 'Launch sequence complete'
    }
  ],
  zh: [
    {
      progress: 0,
      title: '启动太阳系渲染器',
      detail: '正在分配 WebGL 环境与显示缓冲区',
      step: '渲染器已联机'
    },
    {
      progress: 14,
      title: '读取轨道图谱',
      detail: '正在映射行星轨道与轴倾角数据',
      step: '轨道数据已映射'
    },
    {
      progress: 28,
      title: '解码表面贴图',
      detail: '正在将行星纹理写入 GPU 内存',
      step: '行星纹理已解码'
    },
    {
      progress: 44,
      title: '点亮恒星层',
      detail: '正在准备太阳等离子层与热光晕通道',
      step: '太阳日冕已准备'
    },
    {
      progress: 60,
      title: '构建导航探针',
      detail: '正在生成旋转星球缩略图与聚焦目标',
      step: '导航探针已就绪'
    },
    {
      progress: 76,
      title: '校准镜头航行',
      detail: '正在调试缩放限制、触控与轨道阻尼',
      step: '镜头控制已校准'
    },
    {
      progress: 90,
      title: '预热最终画面',
      detail: '正在合成辉光、星场与光照响应',
      step: '场景合成已预热'
    },
    {
      progress: 100,
      title: '太阳系已就绪',
      detail: '正在交接模拟器控制权',
      step: '启动序列完成'
    }
  ]
};

document.documentElement.lang = getLanguage();
renderStaticTexts();
renderPlanetNavigation();
renderBodyInfo(currentFocus);

void boot();

async function boot(): Promise<void> {
  if (!isWebGLAvailable()) {
    showFatalError(t('webglUnsupported'));
    return;
  }

  const loadingSequence = createLoadingSequence();

  try {
    const textures = await loadTextures(({ percent }) => {
      loadingSequence.updateRealProgress(percent);
    });

    const renderer = createRenderer(canvas);
    const scene = createScene(textures);
    const camera = createCamera();
    addLights(scene);

    const system = createSolarSystem(scene, textures);
    const updateGlassLighting = createGlassSunLightUpdater(camera, system);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 1.2;
    controls.maxDistance = 90;
    controls.rotateSpeed = 0.55;
    controls.zoomSpeed = 0.45;

    focusController = new CameraFocusController(camera, controls, system);
    focusController.onFocusChange((bodyId) => {
      currentFocus = bodyId;
      renderBodyInfo(bodyId);
      setupNavButtonState();
    });

    setupInputHandlers({
      canvas,
      focusController,
      onNavigate: (bodyId) => {
        void focusController?.focusBody(bodyId);
      }
    });

    const composer = createComposer(renderer, scene, camera);
    const clock = new THREE.Clock();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer?.setSize(window.innerWidth, window.innerHeight);
      composer?.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderStaticTexts();
    });

    await loadingSequence.complete();
    loadingScreen.classList.add('is-hidden');
    setupNavButtonState();

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      updateSolarSystem(system, delta);
      focusController?.updateFocusedBodyTracking();
      controls.update();
      updateGlassLighting();

      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }

      requestAnimationFrame(animate);
    };

    animate();
  } catch (error) {
    loadingSequence.stop();

    if (error instanceof TextureLoadError) {
      showFatalError(`${t('loadingFailed')}: ${error.missingFiles.map((file) => `${t('missingTexture')} ${file}`).join(', ')}`);
      return;
    }

    console.error(error);
    showFatalError(t('loadingFailed'));
  }
}

function createComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
): EffectComposer | undefined {
  if (!SIMULATION_CONFIG.enableBloom) {
    return undefined;
  }

  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.34, 0.34, 1.05);
  composer.addPass(bloom);
  return composer;
}

function createLoadingSequence(): {
  updateRealProgress: (percent: number) => void;
  complete: () => Promise<void>;
  stop: () => void;
} {
  const stages = LOADING_STAGES[getLanguage()];
  const startedAt = performance.now();
  let displayPercent = 0;
  let isComplete = false;
  let interval = window.setInterval(updateDisplayProgress, 140);

  renderLoadingSequence(stages, displayPercent);

  function updateDisplayProgress(): void {
    const elapsed = performance.now() - startedAt;
    const timedPercent = Math.min(94, Math.round((elapsed / MIN_LOADING_TIME_MS) * 94));
    const nextPercent = isComplete ? 100 : Math.max(displayPercent, timedPercent);

    displayPercent = Math.min(100, nextPercent);
    renderLoadingSequence(stages, displayPercent);
  }

  return {
    updateRealProgress(percent: number): void {
      if (percent > 0) {
        updateDisplayProgress();
      }
    },
    async complete(): Promise<void> {
      const remainingTime = MIN_LOADING_TIME_MS - (performance.now() - startedAt);

      if (remainingTime > 0) {
        await wait(remainingTime);
      }

      isComplete = true;
      updateDisplayProgress();
      window.clearInterval(interval);
      interval = 0;
      await wait(260);
    },
    stop(): void {
      if (interval !== 0) {
        window.clearInterval(interval);
        interval = 0;
      }
    }
  };
}

function renderLoadingSequence(stages: LoadingStage[], percent: number): void {
  const activeIndex = getLoadingStageIndex(stages, percent);
  const activeStage = stages[activeIndex];

  loadingTitle.textContent = activeStage.title;
  loadingDetail.textContent = activeStage.detail;
  loadingProgress.textContent = `${percent}%`;
  loadingProgressBar.style.width = `${percent}%`;
  loadingSteps.replaceChildren(
    ...stages.slice(0, -1).map((stage, index) => {
      const item = document.createElement('li');
      item.textContent = stage.step;
      item.classList.toggle('is-active', index === activeIndex);
      item.classList.toggle('is-complete', index < activeIndex);
      return item;
    })
  );
}

function getLoadingStageIndex(stages: LoadingStage[], percent: number): number {
  let activeIndex = 0;

  stages.forEach((stage, index) => {
    if (percent >= stage.progress) {
      activeIndex = index;
    }
  });

  return activeIndex;
}

function wait(duration: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

function renderStaticTexts(): void {
  document.title = t('appTitle');
  canvas.setAttribute('aria-label', t('canvasAria'));
  loadingSteps.setAttribute('aria-label', t('loadingStepsAria'));

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n;
    if (key) {
      element.textContent = t(key);
    }
  });

  document.querySelector<HTMLElement>('.planet-nav')?.setAttribute('aria-label', t('navigation'));
  interactionHint.textContent = isCoarsePointer() ? t('swipeHint') : t('scrollHint');
}

function renderPlanetNavigation(): void {
  planetNavList.replaceChildren();

  BODY_ORDER.forEach((bodyId) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.bodyId = bodyId;
    button.className = 'planet-nav-button';
    const bodyAriaLabel = getLanguage() === 'zh' ? `${t('bodyAria')}${getBodyName(bodyId)}` : `${t('bodyAria')} ${getBodyName(bodyId)}`;
    button.setAttribute('aria-label', bodyAriaLabel);
    const bodyData = SOLAR_SYSTEM_DATA.find((body) => body.id === bodyId);

    if (bodyData?.hasRing) {
      button.classList.add('has-ring');
    }

    const thumb = document.createElement('span');
    thumb.className = 'planet-thumb';
    thumb.style.setProperty('--planet-texture', `url(${bodyData?.texture ?? ''})`);

    const label = document.createElement('span');
    label.className = 'planet-label';
    label.textContent = getBodyName(bodyId);

    button.append(thumb, label);

    if (bodyId === currentFocus) {
      button.classList.add('is-active');
      button.setAttribute('aria-current', 'true');
    }

    button.addEventListener('click', () => {
      if (!focusController || focusController.animating || bodyId === focusController.currentBodyId) {
        return;
      }

      void focusController.focusBody(bodyId);
    });

    planetNavList.append(button);
  });
}

function renderBodyInfo(bodyId: BodyId): void {
  const data = SOLAR_SYSTEM_DATA.find((body) => body.id === bodyId);

  if (!data) {
    return;
  }

  bodyName.textContent = getBodyName(bodyId);
  bodySymbol.style.setProperty('--planet-texture', `url(${data.texture})`);
  bodySymbol.classList.toggle('is-sun', bodyId === 'sun');
  bodySymbol.classList.toggle('has-ring', Boolean(data.hasRing));
  bodyDescription.textContent = getBodyDescription(bodyId);
  const stats = data.realStats[getLanguage()];
  bodyRotation.textContent = stats.rotation;
  bodyOrbit.textContent = stats.orbit;
  bodyRadius.textContent = stats.radius;
  bodyDistance.textContent = stats.distance;
}

function setupNavButtonState(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-body-id]').forEach((button) => {
    const isActive = button.dataset.bodyId === currentFocus;
    button.classList.toggle('is-active', isActive);
    button.toggleAttribute('aria-current', isActive);
  });
}

function isCoarsePointer(): boolean {
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 760;
}

function isWebGLAvailable(): boolean {
  try {
    const testCanvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

function showFatalError(message: string): void {
  console.error(message);
  loadingScreen.classList.remove('is-hidden');
  loadingError.textContent = message;
  loadingProgress.textContent = '';
  loadingProgressBar.style.width = '100%';
}

function createGlassSunLightUpdater(camera: THREE.PerspectiveCamera, system: SolarSystemInstance): () => void {
  const surfaces = Array.from(document.querySelectorAll<HTMLElement>('.glass'));
  const sun = system.bodies.get('sun');
  const sunPosition = new THREE.Vector3();
  const projectedPosition = new THREE.Vector3();

  return () => {
    if (!sun) {
      return;
    }

    sun.group.getWorldPosition(sunPosition);
    projectedPosition.copy(sunPosition).project(camera);

    const viewportX = ((projectedPosition.x + 1) / 2) * window.innerWidth;
    const viewportY = ((1 - projectedPosition.y) / 2) * window.innerHeight;

    surfaces.forEach((surface) => {
      const rect = surface.getBoundingClientRect();
      const lightX = ((viewportX - rect.left) / rect.width) * 100;
      const lightY = ((viewportY - rect.top) / rect.height) * 100;
      surface.style.setProperty('--light-x', `${lightX.toFixed(2)}%`);
      surface.style.setProperty('--light-y', `${lightY.toFixed(2)}%`);
    });
  };
}

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing #${id} element.`);
  }

  return element as T;
}
