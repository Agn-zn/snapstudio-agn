import type { Filter } from '../types';

export const FILTERS: Filter[] = [
  { id: 'original', name: 'Original', cssFilter: 'none', canvasFilter: '' },
  { id: 'vintage', name: 'Vintage', cssFilter: 'sepia(0.4) contrast(1.1) brightness(1.05) saturate(0.8)', canvasFilter: 'sepia(0.4) contrast(1.1) brightness(1.05) saturate(0.8)' },
  { id: 'bw', name: 'B&W', cssFilter: 'grayscale(1) contrast(1.1)', canvasFilter: 'grayscale(1) contrast(1.1)' },
  { id: 'warm', name: 'Warm', cssFilter: 'saturate(1.2) sepia(0.2) brightness(1.05)', canvasFilter: 'saturate(1.2) sepia(0.2) brightness(1.05)' },
  { id: 'cool', name: 'Cool', cssFilter: 'saturate(0.9) hue-rotate(20deg) brightness(1.05)', canvasFilter: 'saturate(0.9) hue-rotate(20deg) brightness(1.05)' },
  { id: 'retro', name: 'Retro', cssFilter: 'sepia(0.6) saturate(1.5) contrast(1.2) brightness(0.9)', canvasFilter: 'sepia(0.6) saturate(1.5) contrast(1.2) brightness(0.9)' },
  { id: 'sepia', name: 'Sepia', cssFilter: 'sepia(0.8)', canvasFilter: 'sepia(0.8)' },
  { id: 'film', name: 'Film', cssFilter: 'contrast(1.15) brightness(0.95) saturate(0.85) sepia(0.15)', canvasFilter: 'contrast(1.15) brightness(0.95) saturate(0.85) sepia(0.15)' },
  { id: 'soft', name: 'Soft', cssFilter: 'brightness(1.1) contrast(0.9) saturate(0.9)', canvasFilter: 'brightness(1.1) contrast(0.9) saturate(0.9)' },
  { id: 'bright', name: 'Bright', cssFilter: 'brightness(1.2) contrast(1.05) saturate(1.1)', canvasFilter: 'brightness(1.2) contrast(1.05) saturate(1.1)' },
  { id: 'contrast', name: 'Contrast', cssFilter: 'contrast(1.4) brightness(0.95)', canvasFilter: 'contrast(1.4) brightness(0.95)' },
  { id: 'dreamy', name: 'Dreamy', cssFilter: 'brightness(1.15) saturate(1.2) contrast(0.85) hue-rotate(-10deg)', canvasFilter: 'brightness(1.15) saturate(1.2) contrast(0.85) hue-rotate(-10deg)' },
];
