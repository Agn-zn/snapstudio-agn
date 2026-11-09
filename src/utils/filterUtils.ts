import type { FilterId, PhotoAdjustments } from '../types';
import { FILTERS } from '../data/filters';

/**
 * Scales a single CSS filter function by the filter intensity (0..1).
 * Functions with a neutral value of 1 (brightness/contrast/saturate) are
 * interpolated around 1, the others around 0.
 */
function scaleFilterFn(fn: string, intensity: number): string | null {
  const match = /^([a-zA-Z-]+)\(([^)]*)\)$/.exec(fn.trim());
  if (!match) return null;

  const name = match[1].toLowerCase();
  const raw = match[2].trim();
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return `${name}(${raw})`;

  const neutralOne = name === 'brightness' || name === 'contrast' || name === 'saturate' || name === 'opacity';
  const scaled = neutralOne ? 1 + (value - 1) * intensity : value * intensity;

  const unit = raw.endsWith('deg') ? 'deg' : raw.endsWith('%') ? '%' : '';
  return `${name}(${Number(scaled.toFixed(4))}${unit})`;
}

/**
 * Builds one CSS/canvas filter string for a photo, combining the selected
 * filter (at its intensity) with the manual brightness / contrast / saturation
 * / exposure / warmth / blur adjustments. Used by both the live preview and
 * the canvas exporter so they always match.
 */
export function buildPhotoFilter(
  filterId: FilterId | string,
  intensity: number,
  adjustments: PhotoAdjustments
): string {
  const parts: string[] = [];
  const filter = FILTERS.find(f => f.id === filterId);
  const strength = Math.max(0, Math.min(1, intensity / 100));

  if (filter && filter.cssFilter !== 'none' && strength > 0) {
    const fns = filter.cssFilter.match(/[a-z-]+\([^)]*\)/gi) ?? [];
    for (const fn of fns) {
      const scaled = scaleFilterFn(fn, strength);
      if (scaled) parts.push(scaled);
    }
  }

  const { brightness, contrast, saturation, exposure, warmth, blur } = adjustments;

  // exposure: 0 → 0.5×, 100 → 1×, 200 → 1.5×
  const bright = (brightness / 100) * (0.5 + exposure / 200);
  if (Math.abs(bright - 1) > 0.002) parts.push(`brightness(${bright.toFixed(4)})`);
  if (contrast !== 100) parts.push(`contrast(${(contrast / 100).toFixed(4)})`);
  if (saturation !== 100) parts.push(`saturate(${(saturation / 100).toFixed(4)})`);

  if (warmth > 0) {
    const w = warmth / 50;
    parts.push(`sepia(${(0.35 * w).toFixed(3)})`, `saturate(${(1 + 0.15 * w).toFixed(3)})`);
  } else if (warmth < 0) {
    parts.push(`hue-rotate(${((warmth / 50) * 20).toFixed(1)}deg)`);
  }

  if (blur > 0) parts.push(`blur(${blur}px)`);

  return parts.length > 0 ? parts.join(' ') : 'none';
}
