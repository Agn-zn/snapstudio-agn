import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Copy, ArrowUp, ArrowDown, Search, Plus } from 'lucide-react';
import { STICKERS, STICKER_CATEGORIES } from '../data/stickers';
import type { StickerItem } from '../types';

interface StickerPickerProps {
  onAdd: (emoji: string) => void;
  stickers: StickerItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<StickerItem>) => void;
}

export default function StickerPicker({
  onAdd, stickers, selectedId, onSelect, onDelete, onDuplicate, onBringForward, onSendBackward, onUpdate
}: StickerPickerProps) {
  const [activeCategory, setActiveCategory] = useState('hearts');
  const [query, setQuery] = useState('');
  const [custom, setCustom] = useState('');

  const search = query.trim().toLowerCase();
  const filtered = search
    ? STICKERS.filter(s => s.label.toLowerCase().includes(search) || s.emoji.includes(search))
    : STICKERS.filter(s => s.category === activeCategory);
  const selectedSticker = stickers.find(s => s.id === selectedId);

  const addCustom = () => {
    const emoji = custom.trim();
    if (!emoji) return;
    onAdd(emoji);
    setCustom('');
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search stickers…"
          className="input-base text-sm pl-9"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
        {STICKER_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setQuery('');
              setActiveCategory(cat.id);
            }}
            className={`filter-chip whitespace-nowrap text-xs ${!search && activeCategory === cat.id ? 'active' : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sticker grid */}
      <div className="grid grid-cols-5 gap-2">
        {filtered.map(sticker => (
          <motion.button
            key={sticker.id}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onAdd(sticker.emoji)}
            title={sticker.label}
            className="aspect-square rounded-xl bg-gray-50 hover:bg-blush-50 flex items-center justify-center text-2xl transition-all border border-transparent hover:border-blush-200"
          >
            {sticker.emoji}
          </motion.button>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">No sticker matches “{query}”.</p>
      )}

      {/* Custom emoji */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Add any emoji</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
            placeholder="Type or paste an emoji"
            maxLength={8}
            className="input-base text-sm"
          />
          <button
            onClick={addCustom}
            disabled={!custom.trim()}
            className="btn-primary text-xs px-3 disabled:opacity-40"
            title="Add emoji sticker"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Placed stickers */}
      {stickers.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <div className="text-xs font-medium text-gray-500 mb-2">On Canvas ({stickers.length})</div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {stickers.map(sticker => (
              <motion.div
                key={sticker.id}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                  selectedId === sticker.id ? 'bg-blush-50 border border-blush-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => onSelect(sticker.id === selectedId ? null : sticker.id)}
              >
                <span className="text-xl flex-shrink-0">{sticker.emoji}</span>
                <span className="text-xs text-gray-500 flex-1 truncate">
                  {Math.round(sticker.width)}px
                </span>
                <div className="flex gap-0.5">
                  <button
                    onClick={e => { e.stopPropagation(); onBringForward(sticker.id); }}
                    className="p-1 rounded hover:bg-blush-100 text-gray-400 hover:text-blush-500"
                    title="Bring forward"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onSendBackward(sticker.id); }}
                    className="p-1 rounded hover:bg-blush-100 text-gray-400 hover:text-blush-500"
                    title="Send backward"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDuplicate(sticker.id); }}
                    className="p-1 rounded hover:bg-blush-100 text-gray-400 hover:text-blush-500"
                    title="Duplicate"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(sticker.id); }}
                    className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Controls for selected sticker */}
      <AnimatePresence>
        {selectedSticker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-100 pt-3 space-y-3"
          >
            <div className="text-xs font-medium text-gray-600">Sticker Controls</div>

            <div>
              <label className="text-xs text-gray-500">Size: {Math.round(selectedSticker.width)}px</label>
              <input
                type="range"
                min={20}
                max={600}
                value={Math.min(selectedSticker.width, 600)}
                onChange={e => {
                  const size = Number(e.target.value);
                  onUpdate?.(selectedSticker.id, { width: size, height: size });
                }}
                className="w-full accent-pink-400"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Rotation: {Math.round(selectedSticker.rotation)}°</label>
              <input
                type="range"
                min={-180}
                max={180}
                value={selectedSticker.rotation}
                onChange={e => {
                  onUpdate?.(selectedSticker.id, { rotation: Number(e.target.value) });
                }}
                className="w-full accent-pink-400"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onDelete(selectedSticker.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-red-400 border border-red-200 rounded-lg hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
              <button
                onClick={() => onDuplicate(selectedSticker.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-blush-500 border border-blush-200 rounded-lg hover:bg-blush-50 transition-all"
              >
                <Copy className="w-3 h-3" />
                Duplicate
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
