import { createContext, useContext } from 'react';
import type { AppState, Layout, EditorState } from '../types';

export interface AppContextType {
  state: AppState;
  goHome: () => void;
  goToLayout: () => void;
  goToPhotobooth: (layout: Layout) => void;
  goToEditor: (photos: string[]) => void;
  goToDownload: (imageUrl: string) => void;
  goToGallery: () => void;
  setFinalImage: (url: string) => void;
  updateEditorState: (state: EditorState) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
