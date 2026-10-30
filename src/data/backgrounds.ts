import type { Background } from '../types';

export const BACKGROUNDS: Background[] = [
  // Solid Colors
  { id: 'white', name: 'Pure White', type: 'color', value: '#FFFFFF', preview: '#FFFFFF' },
  { id: 'cream', name: 'Cream', type: 'color', value: '#FDFAF6', preview: '#FDFAF6' },
  { id: 'black', name: 'Midnight', type: 'color', value: '#1A1A1A', preview: '#1A1A1A' },
  { id: 'blush', name: 'Blush', type: 'color', value: '#FFD6DE', preview: '#FFD6DE' },
  { id: 'lavender', name: 'Lavender', type: 'color', value: '#EDE0FF', preview: '#EDE0FF' },
  { id: 'mint', name: 'Mint', type: 'color', value: '#D4EAE1', preview: '#D4EAE1' },
  { id: 'sky', name: 'Sky Blue', type: 'color', value: '#DBEAFE', preview: '#DBEAFE' },
  { id: 'peach', name: 'Peach', type: 'color', value: '#FED7AA', preview: '#FED7AA' },
  { id: 'lemon', name: 'Lemon', type: 'color', value: '#FEF08A', preview: '#FEF08A' },
  { id: 'rose', name: 'Rose', type: 'color', value: '#FECDD3', preview: '#FECDD3' },

  // Gradients
  {
    id: 'grad-sunset',
    name: 'Sunset',
    type: 'gradient',
    value: 'linear-gradient(135deg, #FFD6DE 0%, #FED7AA 50%, #FEF08A 100%)',
    preview: 'linear-gradient(135deg, #FFD6DE 0%, #FED7AA 50%, #FEF08A 100%)',
  },
  {
    id: 'grad-aurora',
    name: 'Aurora',
    type: 'gradient',
    value: 'linear-gradient(135deg, #D4EAE1 0%, #EDE0FF 100%)',
    preview: 'linear-gradient(135deg, #D4EAE1 0%, #EDE0FF 100%)',
  },
  {
    id: 'grad-candy',
    name: 'Candy',
    type: 'gradient',
    value: 'linear-gradient(135deg, #FFB3C1 0%, #EDE0FF 100%)',
    preview: 'linear-gradient(135deg, #FFB3C1 0%, #EDE0FF 100%)',
  },
  {
    id: 'grad-ocean',
    name: 'Ocean',
    type: 'gradient',
    value: 'linear-gradient(135deg, #DBEAFE 0%, #D4EAE1 100%)',
    preview: 'linear-gradient(135deg, #DBEAFE 0%, #D4EAE1 100%)',
  },
  {
    id: 'grad-rose-gold',
    name: 'Rose Gold',
    type: 'gradient',
    value: 'linear-gradient(135deg, #FECDD3 0%, #FED7AA 100%)',
    preview: 'linear-gradient(135deg, #FECDD3 0%, #FED7AA 100%)',
  },
  {
    id: 'grad-midnight',
    name: 'Midnight',
    type: 'gradient',
    value: 'linear-gradient(135deg, #1A1A2E 0%, #2D1B69 100%)',
    preview: 'linear-gradient(135deg, #1A1A2E 0%, #2D1B69 100%)',
  },
  {
    id: 'grad-spring',
    name: 'Spring',
    type: 'gradient',
    value: 'linear-gradient(135deg, #FDFAF6 0%, #FFD6DE 50%, #EDE0FF 100%)',
    preview: 'linear-gradient(135deg, #FDFAF6 0%, #FFD6DE 50%, #EDE0FF 100%)',
  },
  {
    id: 'grad-forest',
    name: 'Forest',
    type: 'gradient',
    value: 'linear-gradient(135deg, #D4EAE1 0%, #A8D4C2 100%)',
    preview: 'linear-gradient(135deg, #D4EAE1 0%, #A8D4C2 100%)',
  },

  // Patterns (CSS-rendered)
  {
    id: 'pat-dots',
    name: 'Polka Dots',
    type: 'pattern',
    value: 'dots',
    preview: 'radial-gradient(circle, #FFB3C1 2px, transparent 2px)',
  },
  {
    id: 'pat-stripes',
    name: 'Stripes',
    type: 'pattern',
    value: 'stripes',
    preview: 'repeating-linear-gradient(45deg, #FFD6DE 0, #FFD6DE 5px, #FDFAF6 0, #FDFAF6 25px)',
  },
  {
    id: 'pat-grid',
    name: 'Grid',
    type: 'pattern',
    value: 'grid',
    preview: 'linear-gradient(#EDE0FF 1px, transparent 1px), linear-gradient(90deg, #EDE0FF 1px, transparent 1px)',
  },
  {
    id: 'pat-hearts',
    name: 'Hearts',
    type: 'pattern',
    value: 'hearts',
    preview: 'linear-gradient(135deg, #FFD6DE 25%, transparent 25%) -20px 0, linear-gradient(225deg, #FFD6DE 25%, transparent 25%) -20px 0',
  },
];
