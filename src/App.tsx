import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { AppState, Layout, EditorState } from './types';
import { AppContext } from './store/appStore';
import HomePage from './pages/HomePage';
import LayoutPage from './pages/LayoutPage';
import PhotoboothPage from './pages/PhotoboothPage';
import EditorPage from './pages/EditorPage';
import DownloadPage from './pages/DownloadPage';
import GalleryPage from './pages/GalleryPage';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
};

export default function App() {
  const [state, setState] = useState<AppState>({
    step: 'home',
    selectedLayout: null,
    capturedPhotos: [],
    editorState: null,
    finalImageUrl: null,
    resumeDraftId: null,
    resumeEditorState: null,
  });

  const goHome = useCallback(() => setState(s => ({ ...s, step: 'home' })), []);
  const goToLayout = useCallback(() => setState(s => ({ ...s, step: 'layout' })), []);

  const goToPhotobooth = useCallback((layout: Layout) => {
    setState(s => ({ ...s, step: 'photobooth', selectedLayout: layout }));
  }, []);

  const goToEditor = useCallback((photos: string[]) => {
    setState(s => ({
      ...s,
      step: 'editor',
      capturedPhotos: photos,
      resumeDraftId: null,
      resumeEditorState: null,
    }));
  }, []);

  const resumeDraft = useCallback((draftId: string, editorState: EditorState) => {
    setState(s => ({
      ...s,
      step: 'editor',
      selectedLayout: editorState.layout,
      capturedPhotos: editorState.photos,
      resumeDraftId: draftId,
      resumeEditorState: editorState,
    }));
  }, []);

  const goToDownload = useCallback((imageUrl: string) => {
    setState(s => ({ ...s, step: 'download', finalImageUrl: imageUrl }));
  }, []);

  const goToGallery = useCallback(() => setState(s => ({ ...s, step: 'gallery' })), []);

  const setFinalImage = useCallback((url: string) => {
    setState(s => ({ ...s, finalImageUrl: url }));
  }, []);

  const updateEditorState = useCallback((editorState: EditorState) => {
    setState(s => ({ ...s, editorState }));
  }, []);

  const renderPage = () => {
    switch (state.step) {
      case 'home':
        return <HomePage key="home" />;
      case 'layout':
        return <LayoutPage key="layout" />;
      case 'photobooth':
        return state.selectedLayout
          ? <PhotoboothPage key="photobooth" layout={state.selectedLayout} />
          : <LayoutPage key="layout" />;
      case 'editor':
        return state.selectedLayout
          ? (
            <EditorPage
              key={`editor-${state.resumeDraftId ?? 'new'}`}
              layout={state.selectedLayout}
              photos={state.capturedPhotos}
              initialState={state.resumeEditorState}
              draftId={state.resumeDraftId}
            />
          )
          : <HomePage key="home" />;
      case 'download':
        return state.finalImageUrl
          ? <DownloadPage key="download" imageUrl={state.finalImageUrl} editorState={state.editorState} />
          : <HomePage key="home" />;
      case 'gallery':
        return <GalleryPage key="gallery" />;
      default:
        return <HomePage key="home" />;
    }
  };

  return (
    <AppContext.Provider value={{
      state,
      goHome,
      goToLayout,
      goToPhotobooth,
      goToEditor,
      resumeDraft,
      goToDownload,
      goToGallery,
      setFinalImage,
      updateEditorState,
    }}>
      <div className="min-h-screen bg-cream font-body">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.step}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>
    </AppContext.Provider>
  );
}
