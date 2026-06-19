import { createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';

const root = resolve(new URL('..', import.meta.url).pathname);
const textureDir = resolve(root, 'public/textures');

const files = [
  ['sun.jpg', 'Solarsystemscope texture 2k sun.jpg'],
  ['mercury.jpg', 'Solarsystemscope texture 2k mercury.jpg'],
  ['venus.jpg', 'Solarsystemscope texture 2k venus surface.jpg'],
  ['earth.jpg', 'Solarsystemscope texture 2k earth daymap.jpg'],
  ['earth_clouds.png', 'https://upload.wikimedia.org/wikipedia/commons/d/df/Earth-clouds.png'],
  ['mars.jpg', 'Solarsystemscope texture 2k mars.jpg'],
  ['jupiter.jpg', 'Solarsystemscope texture 2k jupiter.jpg'],
  ['saturn.jpg', 'Solarsystemscope texture 2k saturn.jpg'],
  ['saturn_ring.png', 'https://www.solarsystemscope.com/textures/download/2k_saturn_ring_alpha.png'],
  ['moon.jpg', 'Solarsystemscope texture 2k moon.jpg'],
  ['moons/phobos.jpg', 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/image/mars---phobos/Mars%20-%20Phobos.jpg'],
  ['moons/deimos.jpg', 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/image/mars---deimos/Mars%20-%20Deimos.jpg'],
  ['moons/io.jpg', 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/image/jupiter---io-(b)/Jupiter%20-%20Io%20(B).jpg'],
  ['moons/europa.jpg', 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/image/jupiter---europa/Jupiter%20-%20Europa.jpg'],
  ['moons/ganymede.jpg', 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/image/jupiter---ganymede/Jupiter%20-%20Ganymede.jpg'],
  ['moons/callisto.jpg', 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/image/jupiter---callisto/Jupiter%20-%20Callisto.jpg'],
  ['moons/titan.jpg', 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/image/saturn---titan/Saturn%20-%20Titan.jpg'],
  ['moons/rhea.jpg', 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/image/saturn---rhea/Saturn%20-%20Rhea.jpg'],
  ['moons/titania.jpg', 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/image/uranus---titania/Uranus%20-%20Titania.jpg'],
  ['moons/oberon.jpg', 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/image/uranus---oberon/Uranus%20-%20Oberon.jpg'],
  ['moons/triton.jpg', 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/image/neptune---triton/Neptune%20-%20Triton.jpg'],
  ['uranus.jpg', 'https://www.solarsystemscope.com/textures/download/2k_uranus.jpg'],
  ['neptune.jpg', 'https://www.solarsystemscope.com/textures/download/2k_neptune.jpg'],
  ['stars.jpg', 'https://www.solarsystemscope.com/textures/download/2k_stars_milky_way.jpg']
];

mkdirSync(textureDir, { recursive: true });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function download(outputName, source) {
  const outputPath = resolve(textureDir, outputName);
  const url = source.startsWith('https://')
    ? source
    : `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(source)}`;
  let response;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    response = await fetch(url, {
      headers: {
        'User-Agent': 'solar-system-simulator-3d texture downloader'
      },
      redirect: 'follow'
    });

    if (response.ok) {
      break;
    }

    if (response.status !== 429 || attempt === 3) {
      break;
    }

    await delay(1500 * attempt);
  }

  if (!response.ok || !response.body) {
    throw new Error(`Failed to download ${source}: ${response.status} ${response.statusText}`);
  }

  mkdirSync(dirname(outputPath), { recursive: true });
  await pipeline(response.body, createWriteStream(outputPath));
  console.log(`Downloaded ${outputName}`);
}

for (const [outputName, source] of files) {
  if (existsSync(resolve(textureDir, outputName))) {
    console.log(`Skipping ${outputName}; already exists`);
    continue;
  }

  await download(outputName, source);
  await delay(400);
}
