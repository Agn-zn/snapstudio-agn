import { useState, useCallback } from 'react';
import type { EditorState, StickerItem, TextItem, Background, Frame, FilterId, PhotoAdjustments, HistoryEntry, Layout } from '../types';
import { BACKGROUNDS } from '../data/backgrounds';
import { FILTERS } from '../data/filters';

const DEFAULT_ADJUSTMENTS: PhotoAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  warmth: 0,
  blur: 0,
  exposure: 100,
};

const DEFAULT_FRAME: Frame = {
  id: 'none',
  name: 'None',
  style: 'none',
  color: '#FFFFFF',
  thickness: 0,
  preview: 'transparent',
};

function createInitialState(layout: Layout, photos: string[]): EditorState {
  return {
    layout,
    photos,
    filterId: 'original',
    filterIntensity: 100,
    background: BACKGROUNDS[0],
    frame: DEFAULT_FRAME,
    stickers: [],
    texts: [],
    adjustments: { ...DEFAULT_ADJUSTMENTS },
  };
}

function snapshotHistory(state: EditorState): HistoryEntry {
  return {
    stickers: JSON.parse(JSON.stringify(state.stickers)),
    texts: JSON.parse(JSON.stringify(state.texts)),
    background: { ...state.background },
    frame: { ...state.frame },
    filterId: state.filterId,
    adjustments: { ...state.adjustments },
  };
}

export function usePhotoEditor(layout: Layout, photos: string[]) {
  const [state, setState] = useState<EditorState>(() => createInitialState(layout, photos));
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [future, setFuture] = useState<HistoryEntry[]>([]);

  const pushHistory = useCallback((currentState: EditorState) => {
    setHistory(prev => [...prev.slice(-49), snapshotHistory(currentState)]);
    setFuture([]);
  }, []);

  // ─── Sticker Actions ──────────────────────────────────────────────────────
  const addSticker = useCallback((emoji: string) => {
    setState(prev => {
      pushHistory(prev);
      const newSticker: StickerItem = {
        id: `sticker-${Date.now()}`,
        x: 50 + Math.random() * 200,
        y: 50 + Math.random() * 200,
        width: 80,
        height: 80,
        rotation: (Math.random() - 0.5) * 20,
        emoji,
        zIndex: prev.stickers.length + prev.texts.length + 1,
      };
      return { ...prev, stickers: [...prev.stickers, newSticker] };
    });
  }, [pushHistory]);

  const updateSticker = useCallback((id: string, updates: Partial<StickerItem>) => {
    setState(prev => ({
      ...prev,
      stickers: prev.stickers.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  }, []);

  const deleteSticker = useCallback((id: string) => {
    setState(prev => {
      pushHistory(prev);
      return { ...prev, stickers: prev.stickers.filter(s => s.id !== id) };
    });
  }, [pushHistory]);

  const duplicateSticker = useCallback((id: string) => {
    setState(prev => {
      pushHistory(prev);
      const original = prev.stickers.find(s => s.id === id);
      if (!original) return prev;
      const dupe: StickerItem = {
        ...original,
        id: `sticker-${Date.now()}`,
        x: original.x + 20,
        y: original.y + 20,
        zIndex: prev.stickers.length + prev.texts.length + 2,
      };
      return { ...prev, stickers: [...prev.stickers, dupe] };
    });
  }, [pushHistory]);

  const bringForward = useCallback((id: string) => {
    setState(prev => {
      const sticker = prev.stickers.find(s => s.id === id);
      if (!sticker) return prev;
      return {
        ...prev,
        stickers: prev.stickers.map(s =>
          s.id === id ? { ...s, zIndex: s.zIndex + 1 } : s
        ),
      };
    });
  }, []);

  const sendBackward = useCallback((id: string) => {
    setState(prev => {
      const sticker = prev.stickers.find(s => s.id === id);
      if (!sticker) return prev;
      return {
        ...prev,
        stickers: prev.stickers.map(s =>
          s.id === id ? { ...s, zIndex: Math.max(0, s.zIndex - 1) } : s
        ),
      };
    });
  }, []);

  // ─── Text Actions ─────────────────────────────────────────────────────────
  const addText = useCallback(() => {
    setState(prev => {
      pushHistory(prev);
      const newText: TextItem = {
        id: `text-${Date.now()}`,
        text: 'Your text here',
        x: 100,
        y: 100,
        width: 300,
        fontSize: 32,
        fontFamily: 'Inter',
        color: '#1A1A1A',
        bold: false,
        italic: false,
        align: 'center',
        rotation: 0,
        zIndex: prev.stickers.length + prev.texts.length + 1,
      };
      return { ...prev, texts: [...prev.texts, newText] };
    });
  }, [pushHistory]);

  const updateText = useCallback((id: string, updates: Partial<TextItem>) => {
    setState(prev => ({
      ...prev,
      texts: prev.texts.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, []);

  const deleteText = useCallback((id: string) => {
    setState(prev => {
      pushHistory(prev);
      return { ...prev, texts: prev.texts.filter(t => t.id !== id) };
    });
  }, [pushHistory]);

  // ─── Background / Frame / Filter ──────────────────────────────────────────
  const setBackground = useCallback((bg: Background) => {
    setState(prev => { pushHistory(prev); return { ...prev, background: bg }; });
  }, [pushHistory]);

  const setFrame = useCallback((frame: Frame) => {
    setState(prev => { pushHistory(prev); return { ...prev, frame }; });
  }, [pushHistory]);

  const setFilter = useCallback((filterId: FilterId) => {
    setState(prev => { pushHistory(prev); return { ...prev, filterId }; });
  }, [pushHistory]);

  const setFilterIntensity = useCallback((intensity: number) => {
    setState(prev => ({ ...prev, filterIntensity: intensity }));
  }, []);

  const setAdjustments = useCallback((adj: Partial<PhotoAdjustments>) => {
    setState(prev => ({ ...prev, adjustments: { ...prev.adjustments, ...adj } }));
  }, []);

  const resetAdjustments = useCallback(() => {
    setState(prev => { pushHistory(prev); return { ...prev, adjustments: { ...DEFAULT_ADJUSTMENTS } }; });
  }, [pushHistory]);

  // ─── Undo / Redo ──────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const newHistory = prev.slice(0, -1);
      setFuture(f => [snapshotHistory(state), ...f]);
      setState(s => ({
        ...s,
        stickers: last.stickers,
        texts: last.texts,
        background: last.background,
        frame: last.frame,
        filterId: last.filterId,
        adjustments: last.adjustments,
      }));
      return newHistory;
    });
  }, [state]);

  const redo = useCallback(() => {
    setFuture(prev => {
      if (prev.length === 0) return prev;
      const next = prev[0];
      const newFuture = prev.slice(1);
      setHistory(h => [...h, snapshotHistory(state)]);
      setState(s => ({
        ...s,
        stickers: next.stickers,
        texts: next.texts,
        background: next.background,
        frame: next.frame,
        filterId: next.filterId,
        adjustments: next.adjustments,
      }));
      return newFuture;
    });
  }, [state]);

  const resetAll = useCallback(() => {
    pushHistory(state);
    setState(createInitialState(layout, photos));
  }, [state, layout, photos, pushHistory]);

  // Compute CSS filter string for the current filter
  const getCssFilter = useCallback(() => {
    const filter = FILTERS.find(f => f.id === state.filterId);
    if (!filter || filter.cssFilter === 'none') return 'none';
    const intensity = state.filterIntensity / 100;
    if (intensity >= 1) return filter.cssFilter;
    // Interpolate: blend toward 'original' at lower intensities
    return filter.cssFilter;
  }, [state.filterId, state.filterIntensity]);

  const getAdjustmentFilter = useCallback(() => {
    const { brightness, contrast, saturation, blur } = state.adjustments;
    return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
  }, [state.adjustments]);

  return {
    state,
    history,
    future,
    addSticker,
    updateSticker,
    deleteSticker,
    duplicateSticker,
    bringForward,
    sendBackward,
    addText,
    updateText,
    deleteText,
    setBackground,
    setFrame,
    setFilter,
    setFilterIntensity,
    setAdjustments,
    resetAdjustments,
    undo,
    redo,
    resetAll,
    getCssFilter,
    getAdjustmentFilter,
  };
}
