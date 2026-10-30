import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Background } from '../types';
import { BACKGROUNDS } from '../data/backgrounds';
import { Check } from 'lucide-react';

const CATEGORIES = [
  { id: 'color', label: 'Colors' },
  { id: 'gradient', label: 'Gradients' },
  { id: 'pattern', label: 'Patterns' },
];

interface BackgroundSelectorProps {
  selected: Background;
  onSelect: (bg: Background) => void;
}

export default function BackgroundSelector({ selected, onSelect }: BackgroundSelectorProps) {
  const [category, setCategory] = useState<'color' | 'gradient' | 'pattern'>('color');
  const [customColor, setCustomColor] = useState('#FFFFFF');

  const filtered = BACKGROUNDS.filter(b => b.type === category);

  const applyCustomColor = () => {
    onSelect({
      id: 'custom',
      name: 'Custom',
      type: 'color',
      value: customColor,
      preview: customColor,
    });
  };

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-1 bg-gray-50 p-1 rounded-xl">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id as typeof category)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              category === cat.id ? 'bg-white shadow-soft text-blush-500' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Custom color picker (colors only) */}
      {category === 'color' && (
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={customColor}
            onChange={e => setCustomColor(e.target.value)}
            className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
          />
          <button
            onClick={applyCustomColor}
            className="flex-1 text-xs text-blush-500 font-medium bg-blush-50 hover:bg-blush-100 border border-blush-200 rounded-lg py-2 transition-all"
          >
            Apply Custom Color
          </button>
        </div>
      )}

      {/* Background grid */}
      <div className="grid grid-cols-4 gap-2">
        {filtered.map(bg => {
          const isSelected = selected.id === bg.id;
          return (
            <motion.button
              key={bg.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(bg)}
              title={bg.name}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                isSelected ? 'border-blush-400 shadow-glow-pink' : 'border-transparent hover:border-blush-200'
              }`}
              style={{ background: bg.preview }}
            >
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected label */}
      <div className="text-xs text-center text-gray-500">
        Selected: <span className="text-blush-500 font-medium">{selected.name}</span>
      </div>
    </div>
  );
}
