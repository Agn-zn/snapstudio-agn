import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import type { PhotoAdjustments as PhotoAdjustmentsType } from '../types';

interface PhotoAdjustmentsProps {
  adjustments: PhotoAdjustmentsType;
  onChange: (adj: Partial<PhotoAdjustmentsType>) => void;
  onReset: () => void;
}

const CONTROLS: { key: keyof PhotoAdjustmentsType; label: string; min: number; max: number; default: number; unit: string }[] = [
  { key: 'brightness', label: 'Brightness', min: 0, max: 200, default: 100, unit: '%' },
  { key: 'contrast', label: 'Contrast', min: 0, max: 200, default: 100, unit: '%' },
  { key: 'saturation', label: 'Saturation', min: 0, max: 200, default: 100, unit: '%' },
  { key: 'exposure', label: 'Exposure', min: 0, max: 200, default: 100, unit: '%' },
  { key: 'warmth', label: 'Warmth', min: -50, max: 50, default: 0, unit: '' },
  { key: 'blur', label: 'Blur', min: 0, max: 10, default: 0, unit: 'px' },
];

export default function PhotoAdjustments({ adjustments, onChange, onReset }: PhotoAdjustmentsProps) {
  const hasChanges = Object.entries(adjustments).some(([key, val]) => {
    const ctrl = CONTROLS.find(c => c.key === key);
    return ctrl && val !== ctrl.default;
  });

  return (
    <div className="space-y-5">
      {hasChanges && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs text-blush-500 border border-blush-200 rounded-xl hover:bg-blush-50 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All
        </motion.button>
      )}

      {CONTROLS.map(ctrl => {
        const val = adjustments[ctrl.key] as number;
        const isDefault = val === ctrl.default;

        return (
          <div key={ctrl.key}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700">{ctrl.label}</label>
              <span className={`text-xs font-medium ${isDefault ? 'text-gray-400' : 'text-blush-500'}`}>
                {val}{ctrl.unit}
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={ctrl.min}
                max={ctrl.max}
                value={val}
                onChange={e => onChange({ [ctrl.key]: Number(e.target.value) })}
                className="w-full accent-pink-400"
              />
              {/* Center tick for controls with center default */}
              {ctrl.default === 100 && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-2 bg-gray-300 rounded pointer-events-none"
                  style={{ left: `${((ctrl.default - ctrl.min) / (ctrl.max - ctrl.min)) * 100}%`, transform: 'translateX(-50%) translateY(-50%)' }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
