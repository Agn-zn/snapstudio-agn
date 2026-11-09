// ─── Layout Types ────────────────────────────────────────────────────────────
export type LayoutId =
  | 'strip-4'
  | 'strip-3'
  | 'horizontal-2'
  | 'grid-2x2'
  | 'grid-3x2'
  | 'single'
  | 'polaroid'
  | 'film-strip'
  | 'collage';

export interface Layout {
  id: LayoutId;
  name: string;
  description: string;
  photoCount: number;
  canvasWidth: number;
  canvasHeight: number;
  thumbnail: string; // SVG data URI
}

// ─── Filter Types ─────────────────────────────────────────────────────────────
export type FilterId =
  | 'original'
  | 'vintage'
  | 'bw'
  | 'warm'
  | 'cool'
  | 'retro'
  | 'sepia'
  | 'film'
  | 'soft'
  | 'bright'
  | 'contrast'
  | 'dreamy';

export interface Filter {
  id: FilterId;
  name: string;
  cssFilter: string;
  canvasFilter?: string; // For canvas rendering
}

// ─── Sticker Types ────────────────────────────────────────────────────────────
export interface StickerItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  emoji?: string;
  svgContent?: string;
  zIndex: number;
}

// ─── Text Types ───────────────────────────────────────────────────────────────
export interface TextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
  rotation: number;
  zIndex: number;
}

// ─── Background Types ─────────────────────────────────────────────────────────
export type BackgroundType = 'color' | 'gradient' | 'pattern';

export interface Background {
  id: string;
  name: string;
  type: BackgroundType;
  value: string; // CSS color, gradient, or pattern identifier
  preview: string; // CSS for thumbnail
}

// ─── Frame Types ──────────────────────────────────────────────────────────────
export interface Frame {
  id: string;
  name: string;
  style: 'none' | 'white' | 'black' | 'polaroid' | 'film' | 'rounded' | 'decorative';
  color: string;
  thickness: number;
  preview: string;
}

// ─── Photo Adjustments ────────────────────────────────────────────────────────
export interface PhotoAdjustments {
  brightness: number;  // 0-200 (100 = normal)
  contrast: number;    // 0-200
  saturation: number;  // 0-200
  warmth: number;      // -50 to +50
  blur: number;        // 0-10
  exposure: number;    // 0-200
}

// ─── Editor State ─────────────────────────────────────────────────────────────
export interface EditorState {
  layout: Layout;
  photos: string[];           // data URLs
  filterId: FilterId;
  filterIntensity: number;    // 0-100
  background: Background;
  frame: Frame;
  stickers: StickerItem[];
  texts: TextItem[];
  adjustments: PhotoAdjustments;
}

// ─── Gallery Item ─────────────────────────────────────────────────────────────
export interface GalleryItem {
  id: string;
  dataUrl: string;
  thumbnail: string;
  createdAt: number;
  layout: string;
}

// ─── Draft (saved editing session) ───────────────────────────────────────────
export interface DraftItem {
  id: string;
  thumbnail: string;
  layoutName: string;
  layoutId: string;
  photoCount: number;
  savedAt: number;
  state: EditorState;
}

// ─── App State ────────────────────────────────────────────────────────────────
export type AppStep = 'home' | 'layout' | 'photobooth' | 'editor' | 'download' | 'gallery';

export interface AppState {
  step: AppStep;
  selectedLayout: Layout | null;
  capturedPhotos: string[];
  editorState: EditorState | null;
  finalImageUrl: string | null;
  resumeDraftId: string | null;
  resumeEditorState: EditorState | null;
}

// ─── History ──────────────────────────────────────────────────────────────────
export interface HistoryEntry {
  stickers: StickerItem[];
  texts: TextItem[];
  background: Background;
  frame: Frame;
  filterId: FilterId;
  adjustments: PhotoAdjustments;
}
