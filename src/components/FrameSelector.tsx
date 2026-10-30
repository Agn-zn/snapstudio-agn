import { motion } from 'framer-motion';
import type { Frame } from '../types';
import { Check } from 'lucide-react';

const FRAMES: Frame[] = [
  { id: 'none', name: 'None', style: 'none', color: 'transparent', thickness: 0, preview: 'none' },
  { id: 'white-thin', name: 'White Thin', style: 'white', color: '#FFFFFF', thickness: 2, preview: 'white' },
  { id: 'white-thick', name: 'White', style: 'white', color: '#FFFFFF', thickness: 5, preview: 'white' },
  { id: 'black-thin', name: 'Black Thin', style: 'black', color: '#1A1A1A', thickness: 2, preview: '#1A1A1A' },
  { id: 'black-thick', name: 'Black', style: 'black', color: '#1A1A1A', thickness: 5, preview: '#1A1A1A' },
  { id: 'rounded', name: 'Rounded', style: 'rounded', color: '#FFFFFF', thickness: 3, preview: 'rounded' },
  { id: 'film', name: 'Film', style: 'film', color: '#1A1A1A', thickness: 5, preview: 'film' },
  { id: 'decorative-pink', name: 'Deco Pink', style: 'decorative', color: '#FF85A1', thickness: 2, preview: '#FF85A1' },
  { id: 'decorative-lavender', name: 'Deco Lilac', style: 'decorative', color: '#B894FF', thickness: 2, preview: '#B894FF' },
  { id: 'polaroid', name: 'Polaroid', style: 'polaroid', color: '#FFFFFF', thickness: 6, preview: 'polaroid' },
];

interface FrameSelectorProps {
  selected: Frame;
  onSelect: (frame: Frame) => void;
}

export default function FrameSelector({ selected, onSelect }: FrameSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {FRAMES.map(frame => {
          const isSelected = selected.id === frame.id;
          return (
            <motion.button
              key={frame.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(frame)}
              className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                isSelected ? 'border-blush-400 bg-blush-50' : 'border-gray-100 hover:border-blush-200 bg-white'
              }`}
            >
              {/* Frame preview */}
              <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-blush-100 to-lavender-100 mb-2 relative flex items-center justify-center">
                <div className="text-2xl">📷</div>
                {frame.style !== 'none' && (
                  <div
                    className="absolute inset-0"
                    style={{
                      boxShadow: frame.style === 'decorative'
                        ? `inset 0 0 0 4px ${frame.color}`
                        : frame.style === 'rounded'
                        ? 'inset 0 0 0 4px white'
                        : frame.style === 'film'
                        ? 'inset 0 0 0 6px #1A1A1A'
                        : `inset 0 0 0 ${frame.thickness * 3}px ${frame.color}`,
                      borderRadius: frame.style === 'rounded' ? '8px' : '4px',
                    }}
                  />
                )}
              </div>
              <div className={`text-xs font-medium ${isSelected ? 'text-blush-500' : 'text-gray-700'}`}>
                {frame.name}
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blush-400 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Custom color and thickness */}
      {selected.style !== 'none' && selected.style !== 'film' && (
        <div className="border-t border-gray-100 pt-3 space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Border Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selected.color}
                onChange={e => onSelect({ ...selected, color: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <span className="text-xs text-gray-500">{selected.color}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-500">Thickness</label>
              <span className="text-xs text-blush-400">{selected.thickness}</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={selected.thickness}
              onChange={e => onSelect({ ...selected, thickness: Number(e.target.value) })}
              className="w-full accent-pink-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}
