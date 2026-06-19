# Solar System Simulator 3D

<p align="center">
  <img src="public/logo.png" alt="Solar System Simulator 3D logo" width="220" />
</p>

![Solar System Simulator 3D screenshot](public/screenshot.png)

A bilingual Three.js solar system simulator built with Vite, TypeScript, and vanilla Three.js. It renders the Sun and the eight planets with real equirectangular textures, self-rotation, orbital motion, focused camera travel, Earth clouds, Saturn rings, orbit paths, and glass-style UI.

## Install

```bash
npm install
```

## Textures

The simulator expects real texture files in `public/textures/`. Download the included 2k Solar System Scope texture set from Wikimedia Commons with:

```bash
npm run textures:download
```

Required files:

- `public/textures/sun.jpg`
- `public/textures/mercury.jpg`
- `public/textures/venus.jpg`
- `public/textures/earth.jpg`
- `public/textures/earth_clouds.png`
- `public/textures/mars.jpg`
- `public/textures/jupiter.jpg`
- `public/textures/saturn.jpg`
- `public/textures/saturn_ring.png`
- `public/textures/uranus.jpg`
- `public/textures/neptune.jpg`
- `public/textures/stars.jpg`

Recommended sources are [Solar System Scope Textures](https://www.solarsystemscope.com/textures/) and NASA public planetary imagery. The bundled download script uses Solar System Scope 2k files mirrored on [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Solar_System_Scope), licensed as Creative Commons Attribution 4.0. Credit: Solar System Scope.

If a texture is missing, the loading screen shows the missing filename and the console logs a clear error.

## Run

```bash
npm run dev
```

Open the local URL printed by Vite.

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Controls

- Desktop: scroll to switch focus planet, drag to orbit around the current focus.
- Mobile: swipe vertically to switch focus planet, drag to orbit around the current focus.
- Bottom navigation: click or tap a planet name to focus it.
The default language follows `navigator.language`; languages beginning with `zh` use Chinese. All other browser languages fall back to English.

## Adjusting The Simulation

All visual sizes, orbit distances, speeds, axial tilts, texture paths, camera distances, Earth clouds, and Saturn rings live in `src/data/solarSystem.ts`.

- Change planet size: edit `radius`.
- Change orbit distance: edit `orbitRadius`.
- Change self-rotation speed: edit `rotationSpeed`.
- Change revolution speed: edit `orbitSpeed`.
- Change global speed: edit `SIMULATION_CONFIG.timeScale`.
- Hide orbit paths: set `SIMULATION_CONFIG.enableOrbitPaths` to `false`.
- Disable bloom: set `SIMULATION_CONFIG.enableBloom` to `false`.

To improve mobile performance, lower sphere segments in `src/objects/createSun.ts` and `src/objects/createPlanet.ts`, reduce pixel ratio in `src/scene/createRenderer.ts`, or disable bloom in the simulation config.
