import { CanvasTexture, SRGBColorSpace } from 'three';

export const CARD_TEX_W = 1024;
export const CARD_TEX_H = 1434;

export interface CardTextureInput {
  photoUrl: string;
  name: string;
  role: string;
  location: string;
  badge: string;
  accent: string;
}

export interface Fonts {
  sans: string;
  mono: string;
}

/** Reads the resolved next/font families from CSS, then waits until they are loaded. */
export async function loadFonts(): Promise<Fonts> {
  const root = getComputedStyle(document.documentElement);
  const sans = root.getPropertyValue('--font-sans').trim() || 'system-ui, sans-serif';
  const mono = root.getPropertyValue('--font-mono').trim() || 'ui-monospace, monospace';
  try {
    await Promise.all([document.fonts.load(`700 64px ${sans}`), document.fonts.load(`400 32px ${mono}`)]);
  } catch {
    /* fall back to the system stack already in the family lists */
  }
  return { sans, mono };
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

/**
 * Draws the card front on a 1024 x 1434 canvas, same composition as StaticLanyard
 * (slot, photo, name, role, footer). The caller owns the returned texture and must dispose it.
 */
export async function createCardTexture(input: CardTextureInput): Promise<CanvasTexture> {
  const [img, fonts] = await Promise.all([loadImage(input.photoUrl), loadFonts()]);
  const canvas = document.createElement('canvas');
  canvas.width = CARD_TEX_W;
  canvas.height = CARD_TEX_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');

  const W = CARD_TEX_W;
  const H = CARD_TEX_H;
  const pad = 56;
  const radius = (22 / 300) * W;

  roundRectPath(ctx, 0, 0, W, H, radius);
  ctx.fillStyle = '#161616';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  roundRectPath(ctx, 2, 2, W - 4, H - 4, radius);
  ctx.stroke();

  // slot
  roundRectPath(ctx, W / 2 - 84, pad - 12, 168, 24, 12);
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fill();

  // photo, cover fit
  const px = pad;
  const py = pad + 36;
  const pw = W - pad * 2;
  const ph = 910;
  ctx.save();
  roundRectPath(ctx, px, py, pw, ph, 56);
  ctx.clip();
  const scale = Math.max(pw / img.naturalWidth, ph / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, px + (pw - dw) / 2, py + (ph - dh) / 2, dw, dh);
  ctx.restore();

  // name and role
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#F5F5F5';
  ctx.font = `700 76px ${fonts.sans}`;
  ctx.fillText(input.name, px, py + ph + 100);
  ctx.fillStyle = 'rgba(245,245,245,0.62)';
  ctx.font = `400 42px ${fonts.mono}`;
  ctx.fillText(input.role, px, py + ph + 160);

  // footer
  ctx.font = `400 36px ${fonts.mono}`;
  ctx.fillStyle = 'rgba(245,245,245,0.45)';
  ctx.fillText(input.location, px, H - pad - 4);
  ctx.fillStyle = input.accent;
  ctx.textAlign = 'right';
  ctx.fillText(input.badge, W - pad, H - pad - 4);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
