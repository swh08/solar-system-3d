# Texture files

The app loads real equirectangular planet textures from this directory.
Moon texture files under `moons/` are downloaded from NASA 3D Resources.

Run this from the project root to download the expected 2k Solar System Scope texture set from Wikimedia Commons:

```bash
npm run textures:download
```

Required files:

- `sun.jpg`
- `mercury.jpg`
- `venus.jpg`
- `earth.jpg`
- `earth_clouds.png`
- `mars.jpg`
- `jupiter.jpg`
- `saturn.jpg`
- `saturn_ring.png`
- `moon.jpg`
- `moons/phobos.jpg`
- `moons/deimos.jpg`
- `moons/io.jpg`
- `moons/europa.jpg`
- `moons/ganymede.jpg`
- `moons/callisto.jpg`
- `moons/titan.jpg`
- `moons/rhea.jpg`
- `moons/titania.jpg`
- `moons/oberon.jpg`
- `moons/triton.jpg`
- `uranus.jpg`
- `neptune.jpg`
- `stars.jpg`

The simulator intentionally does not generate fake planet textures. If any file is missing or cannot be loaded, the loading screen reports the missing filename.
