import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useApp } from '../store/appStore';
import { LAYOUTS } from '../data/layouts';
import type { Layout } from '../types';
import WorkflowStepper from '../components/WorkflowStepper';

function LayoutThumbnail({ layout, selected }: { layout: Layout; selected: boolean }) {
  const baseClass = 'bg-gradient-to-br from-blush-100 to-lavender-100 rounded';

  const renderSlots = () => {
    switch (layout.id) {
      case 'strip-4':
        return (
          <div className="flex flex-col gap-0.5 h-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${baseClass} flex-1`} />
            ))}
          </div>
        );
      case 'strip-3':
        return (
          <div className="flex flex-col gap-0.5 h-full">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`${baseClass} flex-1`} />
            ))}
          </div>
        );
      case 'horizontal-2':
        return (
          <div className="flex gap-0.5 h-full">
            <div className={`${baseClass} flex-1`} />
            <div className={`${baseClass} flex-1`} />
          </div>
        );
      case 'grid-2x2':
        return (
          <div className="grid grid-cols-2 gap-0.5 h-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${baseClass}`} />
            ))}
          </div>
        );
      case 'grid-3x2':
        return (
          <div className="grid grid-cols-3 gap-0.5 h-full">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`${baseClass}`} />
            ))}
          </div>
        );
      case 'single':
        return <div className={`${baseClass} h-full w-full`} />;
      case 'polaroid':
        return (
          <div className="h-full w-full bg-white rounded-sm flex flex-col p-1 shadow-sm">
            <div className={`${baseClass} flex-1`} />
            <div className="h-5 flex items-center justify-center">
              <div className="w-8 h-1 bg-gray-200 rounded" />
            </div>
          </div>
        );
      case 'film-strip':
        return (
          <div className="h-full w-full bg-gray-800 rounded-sm flex flex-col gap-0.5 p-0.5">
            <div className="flex justify-around py-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-1 h-1 bg-gray-600 rounded-sm" />
              ))}
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-blush-200 to-lavender-200 rounded-sm flex-1" />
            ))}
            <div className="flex justify-around py-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-1 h-1 bg-gray-600 rounded-sm" />
              ))}
            </div>
          </div>
        );
      case 'collage':
        return (
          <div className="h-full w-full flex flex-col gap-0.5">
            <div className={`${baseClass} h-1/2 w-full`} />
            <div className="flex gap-0.5 h-1/2">
              <div className={`${baseClass} flex-1`} />
              <div className={`${baseClass} flex-1`} />
            </div>
          </div>
        );
      default:
        return <div className={`${baseClass} h-full w-full`} />;
    }
  };

  return (
    <div className={`w-full aspect-[3/4] p-2 rounded-xl border-2 transition-all ${
      selected ? 'border-blush-400 bg-blush-50' : 'border-transparent bg-gray-50'
    }`}>
      {renderSlots()}
    </div>
  );
}

export default function LayoutPage() {
  const { goHome, goToPhotobooth } = useApp();
  const [selected, setSelected] = useState<Layout>(LAYOUTS[0]);

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 glass border-b border-white/40 px-6 py-4 flex items-center justify-between"
      >
        <button onClick={goHome} className="btn-ghost gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blush-400 to-lavender-400 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs">📷</span>
          </div>
          <span className="font-display font-bold text-charcoal-800">SnapStudio</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => goToPhotobooth(selected)}
          className="btn-primary text-sm"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <WorkflowStepper currentStep={0} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal-800 mb-3">
            Choose Your Layout
          </h1>
          <p className="text-gray-500">Select how your photos will be arranged</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {LAYOUTS.map((layout, i) => (
            <motion.button
              key={layout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(layout)}
              className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                selected.id === layout.id
                  ? 'border-blush-400 shadow-glow-pink'
                  : 'border-transparent shadow-soft hover:border-blush-200 hover:shadow-medium'
              } bg-white p-3`}
            >
              <LayoutThumbnail layout={layout} selected={selected.id === layout.id} />

              <div className="mt-3 text-left">
                <div className="font-semibold text-charcoal-800 text-sm">{layout.name}</div>
                <div className="text-gray-400 text-xs mt-0.5">{layout.description}</div>
                <div className="text-xs text-blush-400 mt-1 font-medium">
                  {layout.photoCount} photo{layout.photoCount !== 1 ? 's' : ''}
                </div>
              </div>

              {selected.id === layout.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 bg-blush-400 rounded-full flex items-center justify-center shadow-glow-pink"
                >
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Selected layout info card */}
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 card max-w-md mx-auto"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blush-100 to-lavender-100 rounded-xl flex items-center justify-center text-2xl">
              📸
            </div>
            <div>
              <div className="font-semibold text-charcoal-800">{selected.name}</div>
              <div className="text-gray-500 text-sm">{selected.description}</div>
              <div className="text-blush-400 text-sm font-medium mt-0.5">
                {selected.photoCount} photo{selected.photoCount !== 1 ? 's' : ''} · {selected.canvasWidth}×{selected.canvasHeight}px
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-center mt-8">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => goToPhotobooth(selected)}
            className="btn-primary text-base px-10 py-4"
          >
            Start Taking Photos
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
