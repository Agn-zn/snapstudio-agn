import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Download, Printer, Undo2, Redo2, RotateCcw,
  Layers, Palette, Smile, SlidersHorizontal, Type, Frame
} from 'lucide-react';
import type { Layout, Frame as FrameType } from '../types';
import { useApp } from '../store/appStore';
import { usePhotoEditor } from '../hooks/usePhotoEditor';
import { renderComposition, exportToPng, exportToJpeg } from '../utils/canvasRenderer';
import WorkflowStepper from '../components/WorkflowStepper';
import BackgroundSelector from '../components/BackgroundSelector';
import FilterSelector from '../components/FilterSelector';
import StickerPicker from '../components/StickerPicker';
import FrameSelector from '../components/FrameSelector';
import TextEditor from '../components/TextEditor';
import PhotoAdjustments from '../components/PhotoAdjustments';
import PhotoCanvas from '../components/PhotoCanvas';
import { savePhoto } from '../utils/galleryDb';

type SidebarTab = 'filters' | 'backgrounds' | 'stickers' | 'frames' | 'text' | 'adjustments';

const TABS: { id: SidebarTab; label: string; icon: React.ElementType }[] = [
  { id: 'filters', label: 'Filters', icon: Layers },
  { id: 'backgrounds', label: 'Backgrounds', icon: Palette },
  { id: 'stickers', label: 'Stickers', icon: Smile },
  { id: 'frames', label: 'Frames', icon: Frame },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'adjustments', label: 'Adjust', icon: SlidersHorizontal },
];

interface EditorPageProps {
  layout: Layout;
  photos: string[];
}

export default function EditorPage({ layout, photos }: EditorPageProps) {
  const { goToDownload, updateEditorState, state: appState } = useApp();
  const editor = usePhotoEditor(layout, photos);
  const [activeTab, setActiveTab] = useState<SidebarTab>('filters');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Sync editor state up to App
  useEffect(() => {
    updateEditorState(editor.state);
  }, [editor.state]);

  const handleExport = useCallback(async (format: 'png' | 'jpeg') => {
    setIsExporting(true);
    try {
      const dataUrl = format === 'png'
        ? await exportToPng(editor.state)
        : await exportToJpeg(editor.state);

      // Save to gallery
      const thumbnail = await renderComposition(editor.state, 0.15);
      const thumbnailUrl = thumbnail.toDataURL('image/jpeg', 0.7);

      await savePhoto({
        id: `snap-${Date.now()}`,
        dataUrl,
        thumbnail: thumbnailUrl,
        createdAt: Date.now(),
        layout: layout.name,
      });

      goToDownload(dataUrl);
    } catch (e) {
      console.error('Export failed', e);
    } finally {
      setIsExporting(false);
    }
  }, [editor.state, layout.name, goToDownload]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 glass border-b border-white/60 px-4 py-3 flex items-center gap-3"
      >
        <button
          onClick={() => window.history.back()}
          className="btn-ghost text-sm p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="font-display font-bold text-charcoal-800 flex items-center gap-2">
          <span className="text-blush-400">📷</span>
          SnapStudio Editor
        </div>

        <div className="flex-1" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={editor.undo}
            disabled={editor.history.length === 0}
            title="Undo"
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 disabled:opacity-30 transition-all"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={editor.redo}
            disabled={editor.future.length === 0}
            title="Redo"
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 disabled:opacity-30 transition-all"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={editor.resetAll}
            title="Reset all"
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {/* Export buttons */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleExport('png')}
          disabled={isExporting}
          className="btn-primary text-sm px-4 py-2 disabled:opacity-70"
        >
          {isExporting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Export
        </motion.button>
      </motion.div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Tab icons */}
        <div className="w-16 bg-white border-r border-gray-100 flex flex-col items-center py-4 gap-1 shadow-soft">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
              className={`sidebar-tab w-12 ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Sidebar: Tab content */}
        <div className="w-72 bg-white border-r border-gray-100 flex flex-col overflow-hidden shadow-soft">
          <div className="px-4 pt-4 pb-2 border-b border-gray-100">
            <h3 className="font-semibold text-charcoal-800 text-sm">
              {TABS.find(t => t.id === activeTab)?.label}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'filters' && (
                  <FilterSelector
                    selectedId={editor.state.filterId}
                    intensity={editor.state.filterIntensity}
                    onSelect={editor.setFilter}
                    onIntensityChange={editor.setFilterIntensity}
                    samplePhoto={photos[0]}
                  />
                )}
                {activeTab === 'backgrounds' && (
                  <BackgroundSelector
                    selected={editor.state.background}
                    onSelect={editor.setBackground}
                  />
                )}
                {activeTab === 'stickers' && (
                  <StickerPicker
                    onAdd={editor.addSticker}
                    stickers={editor.state.stickers}
                    selectedId={selectedSticker}
                    onSelect={setSelectedSticker}
                    onDelete={editor.deleteSticker}
                    onDuplicate={editor.duplicateSticker}
                    onBringForward={editor.bringForward}
                    onSendBackward={editor.sendBackward}
                    onUpdate={editor.updateSticker}
                  />
                )}
                {activeTab === 'frames' && (
                  <FrameSelector
                    selected={editor.state.frame}
                    onSelect={editor.setFrame}
                  />
                )}
                {activeTab === 'text' && (
                  <TextEditor
                    texts={editor.state.texts}
                    selectedId={selectedText}
                    onSelect={setSelectedText}
                    onAdd={editor.addText}
                    onUpdate={editor.updateText}
                    onDelete={editor.deleteText}
                  />
                )}
                {activeTab === 'adjustments' && (
                  <PhotoAdjustments
                    adjustments={editor.state.adjustments}
                    onChange={editor.setAdjustments}
                    onReset={editor.resetAdjustments}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Main canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto bg-gray-100">
            <div ref={canvasContainerRef} className="w-full h-full flex items-center justify-center">
              <PhotoCanvas
                state={editor.state}
                selectedStickerId={selectedSticker}
                selectedTextId={selectedText}
                onSelectSticker={setSelectedSticker}
                onSelectText={setSelectedText}
                onUpdateSticker={editor.updateSticker}
                onUpdateText={editor.updateText}
              />
            </div>
          </div>

          {/* Bottom toolbar */}
          <div className="bg-white border-t border-gray-100 px-6 py-3 flex items-center justify-between">
            <div className="text-xs text-gray-400">
              {layout.name} · {layout.canvasWidth}×{layout.canvasHeight}px
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleExport('jpeg')}
                disabled={isExporting}
                className="btn-secondary text-sm px-4 py-2"
              >
                <Download className="w-4 h-4" />
                JPEG
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleExport('png')}
                disabled={isExporting}
                className="btn-primary text-sm px-4 py-2"
              >
                <Download className="w-4 h-4" />
                PNG
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
