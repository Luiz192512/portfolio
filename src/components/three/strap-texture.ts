import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { loadFonts } from './card-texture';

export const STRAP_TEX_W = 1024;
export const STRAP_TEX_H = 192;

/**
 * Strap texture: accent background, DM Mono text in the near-black on-accent color (same
 * look as the static strap). One repeat holds the text once; the material repeats it.
 * The caller owns the returned texture and must dispose it.
 */
export async function createStrapTexture(text: string, accent: string, onAccent: string): Promise<CanvasTexture> {
  const fonts = await loadFonts();
  const canvas = document.createElement('canvas');
  canvas.width = STRAP_TEX_W;
  canvas.height = STRAP_TEX_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');

  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, STRAP_TEX_W, STRAP_TEX_H);

  let size = 84;
  ctx.font = `400 ${size}px ${fonts.mono}`;
  const target = STRAP_TEX_W - 120;
  const measured = ctx.measureText(text).width;
  if (measured > target) {
    size = Math.floor((size * target) / measured);
    ctx.font = `400 ${size}px ${fonts.mono}`;
  }
  ctx.fillStyle = onAccent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, STRAP_TEX_W / 2, STRAP_TEX_H / 2 + 4);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.flipY = false;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}
