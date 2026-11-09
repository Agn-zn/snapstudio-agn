import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Trash2, X, Camera, AlertTriangle, Pencil, Layers } from 'lucide-react';
import { useApp } from '../store/appStore';
import { getAllPhotos, deletePhoto, clearAllPhotos } from '../utils/galleryDb';
import { getAllDrafts, deleteDraft } from '../utils/draftDb';
import type { GalleryItem, DraftItem } from '../types';

type GalleryTab = 'photos' | 'drafts';

export default function GalleryPage() {
  const { goHome, goToLayout, resumeDraft } = useApp();
  const [tab, setTab] = useState<GalleryTab>('photos');
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [items, saved] = await Promise.all([getAllPhotos(), getAllDrafts()]);
      setPhotos(items);
      setDrafts(saved);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleDelete = useCallback(async (id: string) => {
    await deletePhoto(id);
    setPhotos(prev => prev.filter(p => p.id !== id));
    if (selectedPhoto?.id === id) setSelectedPhoto(null);
  }, [selectedPhoto]);

  const handleDeleteDraft = useCallback(async (id: string) => {
    await deleteDraft(id);
    setDrafts(prev => prev.filter(d => d.id !== id));
  }, []);

  const handleClearAll = useCallback(async () => {
    await clearAllPhotos();
    setPhotos([]);
    setShowClearConfirm(false);
  }, []);

  const handleDownload = useCallback((photo: GalleryItem) => {
    const date = new Date(photo.createdAt).toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = photo.dataUrl;
    link.download = `snapstudio-photo-${date}.png`;
    link.click();
  }, []);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const tabs: { id: GalleryTab; label: string; count: number }[] = [
    { id: 'photos', label: 'Creations', count: photos.length },
    { id: 'drafts', label: 'Saved edits', count: drafts.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 glass border-b border-white/60 px-6 py-4 flex items-center justify-between"
      >
        <button onClick={goHome} className="btn-ghost text-sm">
          <ArrowLeft className="w-4 h-4" />
          Home
        </button>
        <div className="font-display font-bold text-charcoal-800 flex items-center gap-2">
          <span>🖼️</span>
          My Gallery
        </div>
        <div className="flex items-center gap-2">
          {tab === 'photos' && photos.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-sm text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={goToLayout}
            className="btn-primary text-sm px-4"
          >
            <Camera className="w-4 h-4" />
            New Photo
          </motion.button>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-3xl font-bold text-charcoal-800 mb-2">Your Photos</h1>
          <p className="text-gray-500">
            {tab === 'photos'
              ? photos.length === 0
                ? 'No photos yet'
                : `${photos.length} photo${photos.length !== 1 ? 's' : ''} saved`
              : drafts.length === 0
                ? 'No saved edits yet'
                : `${drafts.length} saved edit${drafts.length !== 1 ? 's' : ''} — photos you took, kept for later`}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`filter-chip text-sm flex items-center gap-1.5 ${tab === t.id ? 'active' : ''}`}
            >
              {t.id === 'drafts' ? <Layers className="w-3.5 h-3.5" /> : null}
              {t.label}
              <span className={`text-xs ${tab === t.id ? 'text-white/80' : 'text-gray-400'}`}>({t.count})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-2 border-blush-400 border-t-transparent rounded-full"
            />
          </div>
        ) : tab === 'photos' ? (
          photos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">📷</div>
              <h3 className="font-display text-xl text-charcoal-800 mb-2">No photos yet</h3>
              <p className="text-gray-400 mb-8">Start creating beautiful memories</p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={goToLayout}
                className="btn-primary"
              >
                <Camera className="w-4 h-4" />
                Take Your First Photo
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {photos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all cursor-pointer bg-white"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={photo.thumbnail || photo.dataUrl}
                      alt="Saved photo"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); handleDownload(photo); }}
                        className="p-1.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(photo.id); }}
                        className="p-1.5 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-gray-400">{photo.layout}</div>
                    <div className="text-xs text-gray-300">{formatDate(photo.createdAt)}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : drafts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">💾</div>
            <h3 className="font-display text-xl text-charcoal-800 mb-2">No saved edits yet</h3>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">
              Photos you take are saved here automatically, with your stickers and edits — so you can come back and keep working.
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={goToLayout}
              className="btn-primary"
            >
              <Camera className="w-4 h-4" />
              Start a Photo Session
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {drafts.map((draft, i) => (
              <motion.div
                key={draft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all bg-white"
              >
                <div className="aspect-[3/4] overflow-hidden bg-gray-50">
                  {draft.thumbnail ? (
                    <img
                      src={draft.thumbnail}
                      alt={`${draft.layoutName} edit`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🖼️</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-xs text-gray-500">{draft.layoutName} · {draft.photoCount} photo{draft.photoCount !== 1 ? 's' : ''}</div>
                  <div className="text-xs text-gray-300 mb-2">{formatDate(draft.savedAt)}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => resumeDraft(draft.id, draft.state)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-white bg-blush-400 hover:bg-blush-500 rounded-lg transition-all"
                    >
                      <Pencil className="w-3 h-3" />
                      Continue
                    </button>
                    <button
                      onClick={() => handleDeleteDraft(draft.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 border border-gray-200 rounded-lg transition-all"
                      title="Delete saved edit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Full-size photo lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-2xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.dataUrl}
                alt="Full size"
                className="w-full rounded-2xl shadow-strong"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => handleDownload(selectedPhoto)}
                  className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-white/70 text-sm">{selectedPhoto.layout} · {formatDate(selectedPhoto.createdAt)}</div>
                <button
                  onClick={() => handleDelete(selectedPhoto.id)}
                  className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear all confirmation */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="card max-w-sm w-full text-center"
            >
              <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold text-charcoal-800 mb-2">Clear all photos?</h3>
              <p className="text-gray-500 text-sm mb-6">
                This will permanently delete all {photos.length} photos from your gallery. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 bg-red-500 text-white font-semibold py-2.5 px-4 rounded-full hover:bg-red-600 transition-all"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
