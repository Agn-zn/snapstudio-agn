import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import type { TextItem } from '../types';

const FONTS = [
  { label: 'Inter (Modern)', value: 'Inter' },
  { label: 'Playfair (Serif)', value: 'Playfair Display' },
  { label: 'Pacifico (Fun)', value: 'Pacifico' },
  { label: 'Georgia (Classic)', value: 'Georgia' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Courier New (Mono)', value: 'Courier New' },
];

interface TextEditorProps {
  texts: TextItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<TextItem>) => void;
  onDelete: (id: string) => void;
}

export default function TextEditor({ texts, selectedId, onSelect, onAdd, onUpdate, onDelete }: TextEditorProps) {
  const selected = texts.find(t => t.id === selectedId);

  return (
    <div className="space-y-4">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onAdd}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blush-200 rounded-xl text-blush-400 hover:bg-blush-50 text-sm font-medium transition-all"
      >
        <Plus className="w-4 h-4" />
        Add Text
      </motion.button>

      {/* Text items list */}
      {texts.length > 0 && (
        <div className="space-y-1.5">
          {texts.map(text => (
            <motion.div
              key={text.id}
              layout
              className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                selectedId === text.id ? 'border-blush-300 bg-blush-50' : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
              onClick={() => onSelect(text.id === selectedId ? null : text.id)}
            >
              <span
                className="flex-1 truncate text-sm"
                style={{
                  fontFamily: text.fontFamily,
                  color: text.color,
                  fontWeight: text.bold ? 'bold' : 'normal',
                  fontStyle: text.italic ? 'italic' : 'normal',
                }}
              >
                {text.text}
              </span>
              <button
                onClick={e => { e.stopPropagation(); onDelete(text.id); }}
                className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Text editing controls */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-100 pt-3 space-y-3"
          >
            <div className="text-xs font-semibold text-gray-600">Edit Text</div>

            {/* Text content */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Content</label>
              <input
                type="text"
                value={selected.text}
                onChange={e => onUpdate(selected.id, { text: e.target.value })}
                className="input-base text-sm"
                placeholder="Enter text..."
              />
            </div>

            {/* Font */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Font</label>
              <select
                value={selected.fontFamily}
                onChange={e => onUpdate(selected.id, { fontFamily: e.target.value })}
                className="input-base text-sm"
              >
                {FONTS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Font size */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-500">Size</label>
                <span className="text-xs text-blush-400">{selected.fontSize}px</span>
              </div>
              <input
                type="range"
                min={12}
                max={120}
                value={selected.fontSize}
                onChange={e => onUpdate(selected.id, { fontSize: Number(e.target.value) })}
                className="w-full accent-pink-400"
              />
            </div>

            {/* Color */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selected.color}
                  onChange={e => onUpdate(selected.id, { color: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <div className="flex gap-1">
                  {['#000000', '#FFFFFF', '#FF85A1', '#B894FF', '#7BBFA4', '#FED7AA'].map(c => (
                    <button
                      key={c}
                      onClick={() => onUpdate(selected.id, { color: c })}
                      className="w-7 h-7 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Style buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onUpdate(selected.id, { bold: !selected.bold })}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                  selected.bold ? 'bg-blush-50 border-blush-300 text-blush-500' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Bold className="w-3.5 h-3.5" />
                Bold
              </button>
              <button
                onClick={() => onUpdate(selected.id, { italic: !selected.italic })}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                  selected.italic ? 'bg-blush-50 border-blush-300 text-blush-500' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Italic className="w-3.5 h-3.5" />
                Italic
              </button>
            </div>

            {/* Alignment */}
            <div className="flex gap-1 bg-gray-50 p-1 rounded-xl">
              {(['left', 'center', 'right'] as const).map(align => {
                const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
                return (
                  <button
                    key={align}
                    onClick={() => onUpdate(selected.id, { align })}
                    className={`flex-1 py-1.5 flex items-center justify-center rounded-lg transition-all ${
                      selected.align === align ? 'bg-white shadow-soft text-blush-500' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Rotation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-500">Rotation</label>
                <span className="text-xs text-blush-400">{selected.rotation}°</span>
              </div>
              <input
                type="range"
                min={-180}
                max={180}
                value={selected.rotation}
                onChange={e => onUpdate(selected.id, { rotation: Number(e.target.value) })}
                className="w-full accent-pink-400"
              />
            </div>

            {/* Delete */}
            <button
              onClick={() => { onDelete(selected.id); onSelect(null); }}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs text-red-400 border border-red-200 rounded-xl hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Text
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {texts.length === 0 && (
        <div className="text-center py-6">
          <div className="text-3xl mb-2">✍️</div>
          <p className="text-gray-400 text-xs">Add text to your photo</p>
        </div>
      )}
    </div>
  );
}
