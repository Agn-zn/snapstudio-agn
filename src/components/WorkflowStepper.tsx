import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const steps = [
  { label: 'Layout', emoji: '🖼️' },
  { label: 'Photos', emoji: '📸' },
  { label: 'Customize', emoji: '🎨' },
  { label: 'Download', emoji: '💾' },
];

interface WorkflowStepperProps {
  currentStep: number; // 0-3
}

export default function WorkflowStepper({ currentStep }: WorkflowStepperProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;

        return (
          <div key={i} className="flex items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-1.5"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                isDone
                  ? 'bg-blush-400 text-white shadow-glow-pink'
                  : isActive
                  ? 'bg-blush-400 text-white shadow-glow-pink ring-4 ring-blush-100'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {isDone ? <Check className="w-4 h-4" strokeWidth={3} /> : <span>{step.emoji}</span>}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${
                isActive ? 'text-blush-500' : isDone ? 'text-blush-400' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </motion.div>

            {i < steps.length - 1 && (
              <div className={`h-0.5 w-8 sm:w-16 mx-1 sm:mx-2 rounded-full transition-all duration-300 ${
                i < currentStep ? 'bg-blush-400' : 'bg-gray-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
