import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BODY_ORDER, type BodyId } from '../data/solarSystem';
import type { SolarSystemInstance } from '../objects/createSolarSystem';
import { wrapIndex } from '../utils/math';

type FocusListener = (bodyId: BodyId) => void;

export class CameraFocusController {
  private readonly currentTarget = new THREE.Vector3();
  private readonly previousTarget = new THREE.Vector3();
  private readonly cameraOffset = new THREE.Vector3();
  private readonly transitionStartCamera = new THREE.Vector3();
  private readonly transitionEndCamera = new THREE.Vector3();
  private readonly transitionControlCameraA = new THREE.Vector3();
  private readonly transitionControlCameraB = new THREE.Vector3();
  private readonly transitionLiveTarget = new THREE.Vector3();
  private readonly transitionStartTarget = new THREE.Vector3();
  private readonly transitionEndTarget = new THREE.Vector3();
  private readonly travelMidpoint = new THREE.Vector3();
  private readonly direction = new THREE.Vector3();
  private readonly targetDirection = new THREE.Vector3();
  private readonly sunwardDirection = new THREE.Vector3();
  private focusBodyId: BodyId = 'sun';
  private transitionBodyId: BodyId | undefined;
  private transitionCameraDistance = 0;
  private transitionStartedAt = 0;
  private transitionDurationMs = 0;
  private transitionCruiseDistance = 0;
  private transitionLift = 0;
  private transitionResolve?: () => void;
  private isTransitioning = false;
  private listener?: FocusListener;

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly controls: OrbitControls,
    private readonly system: SolarSystemInstance
  ) {
    this.getBodyWorldPosition('sun', this.currentTarget);
    this.previousTarget.copy(this.currentTarget);
    this.controls.target.copy(this.currentTarget);
    this.controls.update();
  }

  get currentBodyId(): BodyId {
    return this.focusBodyId;
  }

  get animating(): boolean {
    return this.isTransitioning;
  }

  onFocusChange(listener: FocusListener): void {
    this.listener = listener;
  }

  goToNextBody(): void {
    if (this.isTransitioning) {
      return;
    }

    const index = BODY_ORDER.indexOf(this.focusBodyId);
    void this.focusBody(BODY_ORDER[wrapIndex(index + 1, BODY_ORDER.length)]);
  }

  goToPreviousBody(): void {
    if (this.isTransitioning) {
      return;
    }

    const index = BODY_ORDER.indexOf(this.focusBodyId);
    void this.focusBody(BODY_ORDER[wrapIndex(index - 1, BODY_ORDER.length)]);
  }

  async focusBody(bodyId: BodyId): Promise<void> {
    if (bodyId === this.focusBodyId || this.isTransitioning) {
      return;
    }

    const currentBody = this.system.bodies.get(this.focusBodyId);
    const targetBody = this.system.bodies.get(bodyId);

    if (!currentBody || !targetBody) {
      return;
    }

    this.isTransitioning = true;
    this.controls.enabled = false;
    this.focusBodyId = bodyId;
    this.listener?.(bodyId);

    this.getBodyWorldPosition(currentBody.data.id, this.currentTarget);
    this.direction.copy(this.camera.position).sub(this.currentTarget);

    if (this.direction.lengthSq() < 0.001) {
      this.direction.set(0, 0.25, 1);
    }

    this.direction.normalize();

    this.targetDirection.copy(this.direction);
    this.getBodyWorldPosition(bodyId, this.currentTarget);
    this.setTargetViewDirection(bodyId);

    const travelDistance = this.controls.target.distanceTo(this.currentTarget);
    const durationMs = THREE.MathUtils.clamp(980 + travelDistance * 22, 1250, 2200);

    await this.animateTravel(
      this.camera.position,
      this.controls.target,
      bodyId,
      targetBody.data.cameraDistance,
      durationMs
    );
  }

  updateFocusedBodyTracking(): void {
    if (this.isTransitioning) {
      this.updateTransitionFrame();
      return;
    }

    this.getBodyWorldPosition(this.focusBodyId, this.currentTarget);
    this.cameraOffset.copy(this.currentTarget).sub(this.previousTarget);
    this.camera.position.add(this.cameraOffset);
    this.controls.target.copy(this.currentTarget);
    this.previousTarget.copy(this.currentTarget);
  }

  private getBodyWorldPosition(bodyId: BodyId, target: THREE.Vector3): THREE.Vector3 {
    const body = this.system.bodies.get(bodyId);

    if (!body) {
      return target.set(0, 0, 0);
    }

    body.group.getWorldPosition(target);
    return target;
  }

  private finishTransition(): void {
    if (!this.transitionBodyId) {
      return;
    }

    const body = this.system.bodies.get(this.transitionBodyId);

    if (!body) {
      return;
    }

    this.getBodyWorldPosition(this.transitionBodyId, this.currentTarget);
    this.camera.position.copy(this.currentTarget).addScaledVector(this.targetDirection, body.data.cameraDistance);
    this.previousTarget.copy(this.currentTarget);
    this.controls.target.copy(this.currentTarget);
    this.controls.enabled = true;
    this.isTransitioning = false;
    this.transitionBodyId = undefined;
    this.transitionResolve?.();
    this.transitionResolve = undefined;
  }

  private updateTransitionFrame(): void {
    if (!this.transitionBodyId) {
      return;
    }

    const progress = Math.min((performance.now() - this.transitionStartedAt) / this.transitionDurationMs, 1);
    const eased = easeInOutSine(progress);

    this.getBodyWorldPosition(this.transitionBodyId, this.transitionLiveTarget);
    this.transitionEndTarget.copy(this.transitionLiveTarget);
    this.transitionEndCamera.copy(this.transitionLiveTarget).addScaledVector(this.targetDirection, this.transitionCameraDistance);
    this.travelMidpoint.lerpVectors(this.transitionStartTarget, this.transitionLiveTarget, 0.5);
    this.transitionControlCameraB
      .copy(this.transitionLiveTarget)
      .addScaledVector(this.targetDirection, this.transitionCruiseDistance)
      .lerp(this.travelMidpoint, 0.18);
    this.transitionControlCameraB.y += this.transitionLift;

    this.setCubicBezierPoint(eased, this.camera.position);
    this.controls.target.lerpVectors(this.transitionStartTarget, this.transitionLiveTarget, eased);

    if (progress >= 1) {
      this.finishTransition();
    }
  }

  private setTargetViewDirection(bodyId: BodyId): void {
    if (bodyId === 'sun') {
      this.targetDirection.copy(this.direction);
      return;
    }

    this.getBodyWorldPosition('sun', this.sunwardDirection);
    this.sunwardDirection.sub(this.currentTarget);

    if (this.sunwardDirection.lengthSq() > 0.001) {
      this.sunwardDirection.normalize();
      this.sunwardDirection.y += 0.22;
      this.sunwardDirection.normalize();
      this.targetDirection.copy(this.direction).lerp(this.sunwardDirection, 0.72).normalize();
    }
  }

  private animateTravel(
    fromCamera: THREE.Vector3,
    fromTarget: THREE.Vector3,
    bodyId: BodyId,
    cameraDistance: number,
    durationMs: number
  ): Promise<void> {
    this.transitionStartCamera.copy(fromCamera);
    this.transitionStartTarget.copy(fromTarget);
    this.transitionBodyId = bodyId;
    this.transitionCameraDistance = cameraDistance;
    this.getBodyWorldPosition(bodyId, this.transitionEndTarget);
    this.transitionEndCamera.copy(this.transitionEndTarget).addScaledVector(this.targetDirection, cameraDistance);
    this.travelMidpoint.lerpVectors(this.transitionStartTarget, this.transitionEndTarget, 0.5);

    const targetDistance = this.transitionStartTarget.distanceTo(this.transitionEndTarget);
    const currentDistance = this.transitionStartCamera.distanceTo(this.transitionStartTarget);
    const finalDistance = this.transitionEndCamera.distanceTo(this.transitionEndTarget);
    this.transitionCruiseDistance = Math.max(currentDistance, finalDistance, targetDistance * 0.32, 10);
    this.transitionLift = Math.max(targetDistance * 0.08, 1.2);

    this.transitionControlCameraA
      .copy(this.transitionStartTarget)
      .addScaledVector(this.direction, this.transitionCruiseDistance)
      .lerp(this.travelMidpoint, 0.18);
    this.transitionControlCameraA.y += this.transitionLift;

    this.transitionControlCameraB
      .copy(this.transitionEndTarget)
      .addScaledVector(this.targetDirection, this.transitionCruiseDistance)
      .lerp(this.travelMidpoint, 0.18);
    this.transitionControlCameraB.y += this.transitionLift;
    this.transitionStartedAt = performance.now();
    this.transitionDurationMs = durationMs;

    return new Promise((resolve) => {
      this.transitionResolve = resolve;
    });
  }

  private setCubicBezierPoint(t: number, target: THREE.Vector3): void {
    const inverse = 1 - t;
    const inverseSquared = inverse * inverse;
    const tSquared = t * t;

    target
      .copy(this.transitionStartCamera)
      .multiplyScalar(inverseSquared * inverse)
      .addScaledVector(this.transitionControlCameraA, 3 * inverseSquared * t)
      .addScaledVector(this.transitionControlCameraB, 3 * inverse * tSquared)
      .addScaledVector(this.transitionEndCamera, tSquared * t);
  }
}

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}
