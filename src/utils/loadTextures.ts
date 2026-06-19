import * as THREE from 'three';
import { TEXTURE_PATHS } from '../data/solarSystem';

export type TextureMap = Record<string, THREE.Texture>;

export interface TextureProgress {
  loaded: number;
  total: number;
  percent: number;
}

export class TextureLoadError extends Error {
  constructor(public readonly missingFiles: string[]) {
    super(`Missing texture files: ${missingFiles.join(', ')}`);
  }
}

export function loadTextures(onProgress: (progress: TextureProgress) => void): Promise<TextureMap> {
  const manager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(manager);
  const textures: TextureMap = {};
  const missingFiles = new Set<string>();

  manager.onProgress = (_url, loaded, total) => {
    onProgress({
      loaded,
      total,
      percent: total > 0 ? Math.round((loaded / total) * 100) : 0
    });
  };

  manager.onError = (url) => {
    console.error(`Texture failed to load: ${url}`);
    missingFiles.add(url);
  };

  const texturePromises = TEXTURE_PATHS.map(
    (path) =>
      new Promise<void>((resolve) => {
        loader.load(
          path,
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = 8;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            textures[path] = texture;
            resolve();
          },
          undefined,
          () => {
            missingFiles.add(path);
            resolve();
          }
        );
      })
  );

  return Promise.all(texturePromises).then(() => {
    if (missingFiles.size > 0) {
      throw new TextureLoadError([...missingFiles]);
    }

    return textures;
  });
}
