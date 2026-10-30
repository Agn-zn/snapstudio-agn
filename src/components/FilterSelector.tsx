import { motion } from 'framer-motion';
import type { FilterId } from '../types';
import { FILTERS } from '../data/filters';

interface FilterSelectorProps {
  selectedId: FilterId;
  intensity: number;
  onSelect: (id: FilterId) => void;
  onIntensityChange: (v: number) => void;
  samplePhoto?: string;
}

export default function FilterSelector({ selectedId, intensity, onSelect, onIntensityChange, samplePhoto }: FilterSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {FILTERS.map(filter => {
          const isActive = filter.id === selectedId;
          return (
            <motion.button
              key={filter.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(filter.id)}
              className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl border-2 transition-all ${
                isActive ? 'border-blush-400 bg-blush-50' : 'border-transparent hover:border-blush-200'
              }`}
            >
              <div
                className="w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-blush-100 to-lavender-100"
                style={{ filter: filter.cssFilter !== 'none' ? filter.cssFilter : undefined }}
              >
                {samplePhoto ? (
                  <img
                    src={samplePhoto}
                    alt={filter.name}
                    className="w-full h-full object-cover"
                    style={{ filter: filter.cssFilter !== 'none' ? filter.cssFilter : undefined }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📷</div>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-blush-500' : 'text-gray-600'}`}>
                {filter.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {selectedId !== 'original' && (
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600">Intensity</label>
            <span className="text-xs text-blush-400 font-medium">{intensity}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={intensity}
            onChange={e => onIntensityChange(Number(e.target.value))}
            className="w-full accent-pink-400"
          />
        </div>
      )}
    </div>
  );
}
