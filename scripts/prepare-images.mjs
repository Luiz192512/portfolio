// Prepares raster assets for the portfolio: strips metadata and writes WebP (quality 80).
// Run with: npm run prepare:images (or node scripts/prepare-images.mjs)
import sharp from 'sharp';
import { access, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const QUALITY = 80;
const COVER_MAX_WIDTH = 1600;
const COVER_CANVAS = { width: 1600, height: 1000 }; // 16:10
const DARK_BG = { r: 13, g: 13, b: 13, alpha: 1 }; // #0D0D0D

const PHOTO_SRC = join(ROOT, 'assets', 'photo.jpg');

// Covers: exact source paths, outside the repo. Do not search elsewhere.
const COVERS = [
  { slug: 'curbside', src: 'C:/Users/forti/Documents/Projetos/pessoal/curbside/public/icones/icone-512.png', icon: true },
  { slug: 'enz-softwares', src: 'C:/Users/forti/Documents/Projetos/pessoal/enzsoftwares-site/public/img/og.png' },
  { slug: 'tszr15', src: 'C:/Users/forti/Documents/Projetos/pessoal/TSZR15/public/brand/tszr15-hero-r15-dark.webp' },
  { slug: 'msx-baterias', src: 'C:/Users/forti/Documents/Projetos/clientes/arthur/msx-baterias/app/opengraph-image.png' },
  { slug: 'g7-padel-crm', src: 'C:/Users/forti/Documents/Projetos/clientes/G7-padle/assets/brand/g7-padel-apresentacao.png' },
];

const OUTPUTS = [];

async function assertExists(path) {
  try {
    await access(path);
  } catch {
    throw new Error(`Missing source file: ${path}`);
  }
}

async function writeWebp(pipeline, outPath) {
  await mkdir(dirname(outPath), { recursive: true });
  // sharp drops all metadata by default (no withMetadata call), so EXIF, XMP and text chunks are removed.
  await pipeline.webp({ quality: QUALITY }).toFile(outPath);
  OUTPUTS.push(outPath);
}

async function preparePhoto() {
  await assertExists(PHOTO_SRC);
  const meta = await sharp(PHOTO_SRC).metadata();
  if (meta.width !== meta.height) {
    throw new Error(`Photo is not square: ${meta.width}x${meta.height}`);
  }
  // Source is 400x400. 480 and 512 are mild upscales (1.2x and 1.28x), acceptable for a portrait.
  const base = () => sharp(PHOTO_SRC).rotate();
  await writeWebp(base().resize(480, 480, { fit: 'cover', kernel: 'lanczos3' }), join(ROOT, 'public', 'images', 'photo-480.webp'));
  await writeWebp(base().resize(512, 512, { fit: 'cover', kernel: 'lanczos3' }), join(ROOT, 'public', 'lanyard', 'card-photo-512.webp'));
}

async function prepareCover({ slug, src, icon }) {
  await assertExists(src);
  const out = join(ROOT, 'public', 'projects', slug, 'cover.webp');
  if (icon) {
    // Small square icon: centre it on a dark 16:10 canvas at native size.
    const iconBuffer = await sharp(src).rotate().resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    const canvas = sharp({
      create: { ...COVER_CANVAS, channels: 4, background: DARK_BG },
    }).composite([{ input: iconBuffer, gravity: 'centre' }]);
    await writeWebp(canvas, out);
    return;
  }
  await writeWebp(sharp(src).rotate().resize({ width: COVER_MAX_WIDTH, withoutEnlargement: true }), out);
}

async function main() {
  await preparePhoto();
  for (const cover of COVERS) {
    await prepareCover(cover);
  }

  console.log('Output                                                   KB');
  for (const file of OUTPUTS) {
    const { statSync } = await import('node:fs');
    const kb = (statSync(file).size / 1024).toFixed(1);
    console.log(`${file.slice(ROOT.length + 1).padEnd(56)} ${kb.padStart(8)}`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
