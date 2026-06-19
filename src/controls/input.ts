import type { BodyId } from '../data/solarSystem';
import type { CameraFocusController } from './cameraFocus';

interface InputOptions {
  canvas: HTMLCanvasElement;
  focusController: CameraFocusController;
  onNavigate: (bodyId: BodyId) => void;
}

export function setupInputHandlers({ canvas, focusController, onNavigate }: InputOptions): void {
  document.querySelectorAll<HTMLButtonElement>('[data-body-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const bodyId = button.dataset.bodyId as BodyId | undefined;

      if (!bodyId || focusController.animating || bodyId === focusController.currentBodyId) {
        return;
      }

      onNavigate(bodyId);
    });
  });
}
