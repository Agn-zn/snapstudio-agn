import type { EditorState } from '../types';
import { buildPhotoFilter } from './filterUtils';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function applyFilterToCanvas(
  ctx: CanvasRenderingContext2D,
  filterId: string,
  intensity: number,
  adjustments: EditorState['adjustments']
): void {
  ctx.filter = buildPhotoFilter(filterId, intensity, adjustments);
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// ─── Background Renderer ─────────────────────────────────────────────────────

function renderBackground(ctx: CanvasRenderingContext2D, bg: EditorState['background'], width: number, height: number) {
  ctx.save();
  ctx.filter = 'none';

  if (bg.type === 'color') {
    ctx.fillStyle = bg.value;
    ctx.fillRect(0, 0, width, height);
  } else if (bg.type === 'gradient') {
    // Parse linear-gradient CSS
    const grad = ctx.createLinearGradient(0, 0, width, height);
    // Extract colors from the gradient value
    const colorMatches = bg.value.match(/#[0-9A-Fa-f]{3,8}|rgb[a]?\([^)]+\)/g);
    if (colorMatches && colorMatches.length >= 2) {
      colorMatches.forEach((color, i) => {
        grad.addColorStop(i / (colorMatches.length - 1), color);
      });
    } else {
      grad.addColorStop(0, '#FDFAF6');
      grad.addColorStop(1, '#FFD6DE');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (bg.type === 'pattern') {
    renderPattern(ctx, bg.value, width, height);
  }

  ctx.restore();
}

function renderPattern(ctx: CanvasRenderingContext2D, pattern: string, width: number, height: number) {
  // Base fill
  ctx.fillStyle = '#FDFAF6';
  ctx.fillRect(0, 0, width, height);

  if (pattern === 'dots') {
    ctx.fillStyle = '#FFB3C1';
    const spacing = 60;
    const radius = 8;
    for (let x = spacing / 2; x < width; x += spacing) {
      for (let y = spacing / 2; y < height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pattern === 'stripes') {
    ctx.strokeStyle = '#FFD6DE';
    ctx.lineWidth = 15;
    const step = 50;
    for (let i = -height; i < width + height; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }
  } else if (pattern === 'grid') {
    ctx.strokeStyle = '#EDE0FF';
    ctx.lineWidth = 2;
    const step = 80;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  } else if (pattern === 'hearts') {
    ctx.fillStyle = '#FFD6DE';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#FFB3C1';
    ctx.font = '48px serif';
    const step = 100;
    for (let x = 0; x < width; x += step) {
      for (let y = 0; y < height; y += step) {
        ctx.fillText('♡', x + (y % (step * 2) === 0 ? 0 : step / 2), y);
      }
    }
  }
}

// ─── Photo Layout Renderers ───────────────────────────────────────────────────

interface PhotoRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function getPhotoRects(layoutId: string, canvasWidth: number, canvasHeight: number, photoCount: number): PhotoRect[] {
  const padding = Math.round(canvasWidth * 0.03);
  const gap = Math.round(canvasWidth * 0.02);

  switch (layoutId) {
    case 'strip-4':
    case 'strip-3':
    case 'film-strip': {
      const count = Math.min(photoCount, 4);
      const photoH = Math.round((canvasHeight - padding * 2 - gap * (count - 1)) / count);
      const photoW = canvasWidth - padding * 2;
      return Array.from({ length: count }, (_, i) => ({
        x: padding,
        y: padding + i * (photoH + gap),
        width: photoW,
        height: photoH,
      }));
    }

    case 'horizontal-2': {
      const photoW = Math.round((canvasWidth - padding * 2 - gap) / 2);
      const photoH = canvasHeight - padding * 2;
      return [
        { x: padding, y: padding, width: photoW, height: photoH },
        { x: padding + photoW + gap, y: padding, width: photoW, height: photoH },
      ];
    }

    case 'grid-2x2': {
      const photoW = Math.round((canvasWidth - padding * 2 - gap) / 2);
      const photoH = Math.round((canvasHeight - padding * 2 - gap) / 2);
      return [
        { x: padding, y: padding, width: photoW, height: photoH },
        { x: padding + photoW + gap, y: padding, width: photoW, height: photoH },
        { x: padding, y: padding + photoH + gap, width: photoW, height: photoH },
        { x: padding + photoW + gap, y: padding + photoH + gap, width: photoW, height: photoH },
      ];
    }

    case 'grid-3x2': {
      const cols = 3;
      const rows = 2;
      const photoW = Math.round((canvasWidth - padding * 2 - gap * (cols - 1)) / cols);
      const photoH = Math.round((canvasHeight - padding * 2 - gap * (rows - 1)) / rows);
      const rects: PhotoRect[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          rects.push({
            x: padding + c * (photoW + gap),
            y: padding + r * (photoH + gap),
            width: photoW,
            height: photoH,
          });
        }
      }
      return rects;
    }

    case 'polaroid': {
      const border = Math.round(canvasWidth * 0.06);
      const bottomBorder = Math.round(canvasWidth * 0.22);
      return [{
        x: border,
        y: border,
        width: canvasWidth - border * 2,
        height: canvasHeight - border - bottomBorder,
      }];
    }

    case 'collage': {
      const photoW = Math.round((canvasWidth - padding * 2 - gap) / 2);
      const photoH = Math.round((canvasHeight - padding * 2 - gap) / 2);
      return [
        { x: padding, y: padding, width: canvasWidth - padding * 2, height: photoH },
        { x: padding, y: padding + photoH + gap, width: photoW, height: photoH },
        { x: padding + photoW + gap, y: padding + photoH + gap, width: photoW, height: photoH },
      ];
    }

    default: {
      // single
      return [{
        x: padding,
        y: padding,
        width: canvasWidth - padding * 2,
        height: canvasHeight - padding * 2,
      }];
    }
  }
}

// ─── Main Renderer ───────────────────────────────────────────────────────────

export async function renderComposition(state: EditorState, scale = 1): Promise<HTMLCanvasElement> {
  const { layout, photos, background, frame, filterId, filterIntensity, adjustments, stickers, texts } = state;

  const W = Math.round(layout.canvasWidth * scale);
  const H = Math.round(layout.canvasHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { alpha: false })!;

  // 1. Background
  renderBackground(ctx, background, W, H);

  // 2. Film strip decorations
  if (layout.id === 'film-strip') {
    ctx.save();
    ctx.fillStyle = '#1A1A1A';
    const holeSize = Math.round(W * 0.04);
    const holeSpacing = Math.round(W * 0.08);
    const holeY = Math.round(H * 0.008);
    for (let x = holeSpacing / 2; x < W; x += holeSpacing) {
      drawRoundedRect(ctx, x - holeSize / 2, holeY, holeSize, holeSize, 3);
      ctx.fill();
      drawRoundedRect(ctx, x - holeSize / 2, H - holeY - holeSize, holeSize, holeSize, 3);
      ctx.fill();
    }
    ctx.restore();
  }

  // 3. Polaroid frame
  if (layout.id === 'polaroid') {
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = Math.round(W * 0.03);
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // 4. Photos
  const rects = getPhotoRects(layout.id, W, H, photos.length);

  for (let i = 0; i < rects.length; i++) {
    const photo = photos[i];
    if (!photo) continue;
    const rect = rects[i];

    try {
      const img = await loadImage(photo);
      ctx.save();

      // Clip to rect
      ctx.beginPath();
      const radius = frame.style === 'rounded' ? Math.round(W * 0.02) : 0;
      drawRoundedRect(ctx, rect.x, rect.y, rect.width, rect.height, radius);
      ctx.clip();

      // Apply filters
      applyFilterToCanvas(ctx, filterId, filterIntensity, adjustments);

      // Draw image covering the rect (cover fit)
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const rectAspect = rect.width / rect.height;
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      if (imgAspect > rectAspect) {
        sw = img.naturalHeight * rectAspect;
        sx = (img.naturalWidth - sw) / 2;
      } else {
        sh = img.naturalWidth / rectAspect;
        sy = (img.naturalHeight - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, rect.x, rect.y, rect.width, rect.height);

      ctx.restore();
    } catch {
      // Photo failed to load — draw placeholder
      ctx.save();
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      ctx.restore();
    }
  }

  // 5. Frame overlay
  if (frame.style !== 'none') {
    ctx.save();
    ctx.filter = 'none';
    const t = Math.round(frame.thickness * scale * 10);
    if (frame.style === 'white' || frame.style === 'black') {
      ctx.strokeStyle = frame.color;
      ctx.lineWidth = t;
      rects.forEach(rect => {
        ctx.strokeRect(rect.x + t / 2, rect.y + t / 2, rect.width - t, rect.height - t);
      });
    } else if (frame.style === 'film') {
      ctx.strokeStyle = '#1A1A1A';
      ctx.lineWidth = Math.round(W * 0.025);
      ctx.strokeRect(0, 0, W, H);
    } else if (frame.style === 'decorative') {
      ctx.strokeStyle = frame.color;
      ctx.lineWidth = t;
      ctx.setLineDash([t * 2, t]);
      rects.forEach(rect => {
        ctx.strokeRect(rect.x + t / 2, rect.y + t / 2, rect.width - t, rect.height - t);
      });
    }
    ctx.restore();
  }

  // 6. Stickers
  ctx.filter = 'none';
  const sortedStickers = [...stickers].sort((a, b) => a.zIndex - b.zIndex);
  for (const sticker of sortedStickers) {
    if (!sticker.emoji) continue;
    ctx.save();
    const cx = sticker.x * scale + (sticker.width * scale) / 2;
    const cy = sticker.y * scale + (sticker.height * scale) / 2;
    ctx.translate(cx, cy);
    ctx.rotate((sticker.rotation * Math.PI) / 180);
    ctx.font = `${Math.round(sticker.width * scale * 0.85)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sticker.emoji, 0, 0);
    ctx.restore();
  }

  // 7. Text items
  const sortedTexts = [...texts].sort((a, b) => a.zIndex - b.zIndex);
  for (const textItem of sortedTexts) {
    ctx.save();
    const cx = textItem.x * scale + (textItem.width * scale) / 2;
    const cy = textItem.y * scale + textItem.fontSize * scale / 2;
    ctx.translate(cx, cy);
    ctx.rotate((textItem.rotation * Math.PI) / 180);

    const fontStyle = [
      textItem.italic ? 'italic' : '',
      textItem.bold ? 'bold' : '',
      `${Math.round(textItem.fontSize * scale)}px`,
      `"${textItem.fontFamily}", sans-serif`,
    ].filter(Boolean).join(' ');

    ctx.font = fontStyle;
    ctx.fillStyle = textItem.color;
    ctx.textAlign = textItem.align;
    ctx.textBaseline = 'middle';

    // Text shadow
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 4;

    const tx = textItem.align === 'center' ? 0 : textItem.align === 'left' ? -(textItem.width * scale) / 2 : (textItem.width * scale) / 2;
    ctx.fillText(textItem.text, tx, 0);
    ctx.restore();
  }

  // 8. Polaroid caption area
  if (layout.id === 'polaroid') {
    const border = Math.round(W * 0.06);
    const photoH = rects[0]?.height ?? H;
    const captionY = border + photoH + Math.round(W * 0.04);
    ctx.save();
    ctx.filter = 'none';
    ctx.font = `italic ${Math.round(W * 0.06)}px "Playfair Display", serif`;
    ctx.fillStyle = '#888888';
    ctx.textAlign = 'center';
    ctx.fillText('— SnapStudio', W / 2, captionY + Math.round(W * 0.06));
    ctx.restore();
  }

  return canvas;
}

export async function exportToPng(state: EditorState): Promise<string> {
  const canvas = await renderComposition(state, 1);
  return canvas.toDataURL('image/png', 1.0);
}

export async function exportToJpeg(state: EditorState, quality = 0.92): Promise<string> {
  const canvas = await renderComposition(state, 1);
  return canvas.toDataURL('image/jpeg', quality);
}
