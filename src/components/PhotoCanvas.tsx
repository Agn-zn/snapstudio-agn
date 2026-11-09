import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { EditorState, StickerItem, TextItem } from '../types';
import { buildPhotoFilter } from '../utils/filterUtils';

type ItemType = 'sticker' | 'text';

interface DragGesture {
  kind: 'drag';
  type: ItemType;
  id: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
}

interface ResizeGesture {
  kind: 'resize';
  type: ItemType;
  id: string;
  startX: number;
  startY: number;
  startSize: number;
  startFontSize: number;
}

interface RotateGesture {
  kind: 'rotate';
  type: ItemType;
  id: string;
  centerX: number;
  centerY: number;
  startAngle: number;
  startRotation: number;
}

type Gesture = DragGesture | ResizeGesture | RotateGesture;

interface Props {
  state: EditorState;
  selectedStickerId: string | null;
  selectedTextId: string | null;
  onSelectSticker: (id: string | null) => void;
  onSelectText: (id: string | null) => void;
  onUpdateSticker: (id: string, updates: Partial<StickerItem>) => void;
  onUpdateText: (id: string, updates: Partial<TextItem>) => void;
  onDeleteSticker: (id: string) => void;
  onDeleteText: (id: string) => void;
}

// Compute the display canvas size maintaining aspect ratio
function computeDisplaySize(canvasW: number, canvasH: number, containerW: number, containerH: number) {
  const scaleW = containerW / canvasW;
  const scaleH = containerH / canvasH;
  const scale = Math.min(scaleW, scaleH, 1);
  return {
    width: Math.round(canvasW * scale),
    height: Math.round(canvasH * scale),
    scale,
  };
}

function getBackgroundStyle(bg: EditorState['background']): React.CSSProperties {
  if (bg.type === 'color') return { background: bg.value };
  if (bg.type === 'gradient') return { background: bg.value };
  if (bg.type === 'pattern') {
    const patternStyles: Record<string, React.CSSProperties> = {
      dots: {
        background: '#FDFAF6',
        backgroundImage: 'radial-gradient(circle, #FFB3C1 2px, transparent 2px)',
        backgroundSize: '24px 24px',
      },
      stripes: {
        background: 'repeating-linear-gradient(45deg, #FFD6DE 0, #FFD6DE 5px, #FDFAF6 0, #FDFAF6 25px)',
      },
      grid: {
        background: '#FDFAF6',
        backgroundImage: 'linear-gradient(#EDE0FF 1px, transparent 1px), linear-gradient(90deg, #EDE0FF 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      },
      hearts: {
        background: '#FFD6DE',
      },
    };
    return patternStyles[bg.value] ?? { background: '#FDFAF6' };
  }
  return { background: '#FFFFFF' };
}

function getPhotoRects(layoutId: string, W: number, H: number, photoCount: number) {
  const padding = Math.round(W * 0.03);
  const gap = Math.round(W * 0.02);

  switch (layoutId) {
    case 'strip-4':
    case 'strip-3':
    case 'film-strip': {
      const count = Math.min(photoCount, layoutId === 'strip-3' ? 3 : 4);
      const photoH = Math.round((H - padding * 2 - gap * (count - 1)) / count);
      return Array.from({ length: count }, (_, i) => ({
        x: padding, y: padding + i * (photoH + gap),
        w: W - padding * 2, h: photoH,
      }));
    }
    case 'horizontal-2': {
      const photoW = Math.round((W - padding * 2 - gap) / 2);
      return [
        { x: padding, y: padding, w: photoW, h: H - padding * 2 },
        { x: padding + photoW + gap, y: padding, w: photoW, h: H - padding * 2 },
      ];
    }
    case 'grid-2x2': {
      const photoW = Math.round((W - padding * 2 - gap) / 2);
      const photoH = Math.round((H - padding * 2 - gap) / 2);
      return [
        { x: padding, y: padding, w: photoW, h: photoH },
        { x: padding + photoW + gap, y: padding, w: photoW, h: photoH },
        { x: padding, y: padding + photoH + gap, w: photoW, h: photoH },
        { x: padding + photoW + gap, y: padding + photoH + gap, w: photoW, h: photoH },
      ];
    }
    case 'grid-3x2': {
      const cols = 3;
      const rows = 2;
      const photoW = Math.round((W - padding * 2 - gap * (cols - 1)) / cols);
      const photoH = Math.round((H - padding * 2 - gap * (rows - 1)) / rows);
      const rects = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          rects.push({ x: padding + c * (photoW + gap), y: padding + r * (photoH + gap), w: photoW, h: photoH });
        }
      }
      return rects;
    }
    case 'polaroid': {
      const border = Math.round(W * 0.06);
      const bottomBorder = Math.round(W * 0.22);
      return [{ x: border, y: border, w: W - border * 2, h: H - border - bottomBorder }];
    }
    case 'collage': {
      const photoW = Math.round((W - padding * 2 - gap) / 2);
      const photoH = Math.round((H - padding * 2 - gap) / 2);
      return [
        { x: padding, y: padding, w: W - padding * 2, h: photoH },
        { x: padding, y: padding + photoH + gap, w: photoW, h: photoH },
        { x: padding + photoW + gap, y: padding + photoH + gap, w: photoW, h: photoH },
      ];
    }
    default:
      return [{ x: padding, y: padding, w: W - padding * 2, h: H - padding * 2 }];
  }
}

export default function PhotoCanvas({
  state,
  selectedStickerId,
  selectedTextId,
  onSelectSticker,
  onSelectText,
  onUpdateSticker,
  onUpdateText,
  onDeleteSticker,
  onDeleteText,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<Gesture | null>(null);
  const [displaySize, setDisplaySize] = useState({ width: 500, height: 600, scale: 0.4 });

  const { layout, photos, background, frame, filterId, filterIntensity, stickers, texts, adjustments } = state;
  const W = layout.canvasWidth;
  const H = layout.canvasHeight;

  useEffect(() => {
    const el = containerRef.current?.parentElement;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      const padding = 48;
      setDisplaySize(computeDisplaySize(W, H, rect.width - padding, rect.height - padding));
    });
    observer.observe(el);
    const rect = el.getBoundingClientRect();
    const padding = 48;
    setDisplaySize(computeDisplaySize(W, H, rect.width - padding, rect.height - padding));
    return () => observer.disconnect();
  }, [W, H]);

  const photoRects = getPhotoRects(layout.id, displaySize.width, displaySize.height, photos.length);
  const filterStr = buildPhotoFilter(filterId, filterIntensity, adjustments);

  // ─── Gestures ──────────────────────────────────────────────────────────────
  const beginDrag = useCallback((e: React.PointerEvent, type: ItemType, id: string, origX: number, origY: number) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.stopPropagation();
    if (type === 'sticker') onSelectSticker(id);
    else onSelectText(id);
    gestureRef.current = { kind: 'drag', type, id, startX: e.clientX, startY: e.clientY, origX, origY };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Pointer capture is best-effort; the gesture already tracks moves on the canvas.
    }
  }, [onSelectSticker, onSelectText]);

  const beginResize = useCallback((e: React.PointerEvent, type: ItemType, id: string, startSize: number, startFontSize: number) => {
    e.stopPropagation();
    e.preventDefault();
    gestureRef.current = {
      kind: 'resize', type, id,
      startX: e.clientX, startY: e.clientY,
      startSize, startFontSize,
    };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Best-effort, see beginDrag.
    }
  }, []);

  const beginRotate = useCallback((e: React.PointerEvent, type: ItemType, id: string, startRotation: number) => {
    e.stopPropagation();
    e.preventDefault();
    const itemEl = (e.currentTarget as HTMLElement).closest('[data-item]') as HTMLElement | null;
    const rect = itemEl?.getBoundingClientRect();
    const centerX = rect ? rect.left + rect.width / 2 : e.clientX;
    const centerY = rect ? rect.top + rect.height / 2 : e.clientY;
    gestureRef.current = {
      kind: 'rotate', type, id, centerX, centerY,
      startAngle: (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI,
      startRotation,
    };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Best-effort, see beginDrag.
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const gesture = gestureRef.current;
    if (!gesture) return;

    if (gesture.kind === 'drag') {
      const dx = (e.clientX - gesture.startX) / displaySize.scale;
      const dy = (e.clientY - gesture.startY) / displaySize.scale;
      if (gesture.type === 'sticker') {
        onUpdateSticker(gesture.id, { x: gesture.origX + dx, y: gesture.origY + dy });
      } else {
        onUpdateText(gesture.id, { x: gesture.origX + dx, y: gesture.origY + dy });
      }
    } else if (gesture.kind === 'resize') {
      const dx = (e.clientX - gesture.startX) / displaySize.scale;
      const dy = (e.clientY - gesture.startY) / displaySize.scale;
      if (gesture.type === 'sticker') {
        const size = Math.min(900, Math.max(20, gesture.startSize + Math.max(dx, dy)));
        onUpdateSticker(gesture.id, { width: size, height: size });
      } else {
        const fontSize = Math.min(240, Math.max(8, gesture.startFontSize + Math.max(dx, dy) * 0.8));
        onUpdateText(gesture.id, { fontSize: Math.round(fontSize) });
      }
    } else {
      const angle = (Math.atan2(e.clientY - gesture.centerY, e.clientX - gesture.centerX) * 180) / Math.PI;
      let rotation = Math.round(gesture.startRotation + angle - gesture.startAngle);
      rotation = (((rotation + 180) % 360) + 360) % 360 - 180;
      if (gesture.type === 'sticker') {
        onUpdateSticker(gesture.id, { rotation });
      } else {
        onUpdateText(gesture.id, { rotation });
      }
    }
  }, [displaySize.scale, onUpdateSticker, onUpdateText]);

  const endGesture = useCallback((e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    try {
      if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore: the pointer may already be released.
    }
    gestureRef.current = null;
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-item]')) return;
    onSelectSticker(null);
    onSelectText(null);
  }, [onSelectSticker, onSelectText]);

  const renderHandles = (type: ItemType, id: string, rotation: number, size: number, fontSize: number) => (
    <>
      <div
        onPointerDown={e => beginRotate(e, type, id, rotation)}
        title="Rotate"
        style={{
          position: 'absolute', top: -34, left: '50%', width: 18, height: 18, marginLeft: -9,
          borderRadius: '50%', background: '#fff', border: '2px solid #FF85A1',
          boxShadow: '0 2px 6px rgba(0,0,0,0.25)', cursor: 'grab', touchAction: 'none', zIndex: 2,
        }}
      >
        <span style={{ position: 'absolute', top: '100%', left: '50%', width: 2, height: 14, marginLeft: -1, background: '#FF85A1' }} />
      </div>
      <div
        onPointerDown={e => beginResize(e, type, id, size, fontSize)}
        title="Resize"
        style={{
          position: 'absolute', bottom: -9, right: -9, width: 20, height: 20, borderRadius: 6,
          background: '#fff', border: '2px solid #FF85A1', boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
          cursor: 'nwse-resize', touchAction: 'none', zIndex: 2,
        }}
      />
      <button
        onPointerDown={e => e.stopPropagation()}
        onClick={e => {
          e.stopPropagation();
          if (type === 'sticker') onDeleteSticker(id);
          else onDeleteText(id);
        }}
        title="Remove"
        style={{
          position: 'absolute', top: -34, right: -30, width: 22, height: 22, padding: 0,
          borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: 14, lineHeight: '18px',
          textAlign: 'center', border: '2px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
          cursor: 'pointer', zIndex: 2,
        }}
      >
        ×
      </button>
    </>
  );

  return (
    <div ref={containerRef} className="relative select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="canvas-shadow rounded-lg overflow-hidden"
        style={{
          width: displaySize.width,
          height: displaySize.height,
          touchAction: 'none',
          ...getBackgroundStyle(background),
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        onClick={handleCanvasClick}
      >
        {/* Film strip decoration */}
        {layout.id === 'film-strip' && (
          <div className="absolute inset-0 pointer-events-none" style={{ background: '#1A1A1A', opacity: 0.95 }} />
        )}

        {/* Polaroid background */}
        {layout.id === 'polaroid' && (
          <div className="absolute inset-0 bg-white pointer-events-none" />
        )}

        {/* Photos */}
        {photoRects.map((rect, i) => {
          const photo = photos[i];
          if (!photo) return null;
          return (
            <div
              key={i}
              className="absolute overflow-hidden"
              style={{
                left: rect.x,
                top: rect.y,
                width: rect.w,
                height: rect.h,
                borderRadius: frame.style === 'rounded' ? 8 : 0,
              }}
            >
              <img
                src={photo}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover pointer-events-none"
                style={{ filter: filterStr }}
              />
              {/* Frame overlay per photo */}
              {frame.style !== 'none' && frame.style !== 'film' && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 0 ${frame.thickness * 2}px ${frame.color}`,
                    borderRadius: frame.style === 'rounded' ? 8 : 0,
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Global film frame */}
        {frame.style === 'film' && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: `inset 0 0 0 ${frame.thickness * 3}px ${frame.color}`,
            }}
          />
        )}

        {/* Polaroid text */}
        {layout.id === 'polaroid' && photoRects[0] && (
          <div
            className="absolute text-gray-400 italic text-center"
            style={{
              top: photoRects[0].y + photoRects[0].h + 12,
              left: 0,
              right: 0,
              fontSize: Math.round(displaySize.width * 0.05),
              fontFamily: '"Playfair Display", serif',
            }}
          >
            — SnapStudio
          </div>
        )}

        {/* Stickers */}
        {[...stickers].sort((a, b) => a.zIndex - b.zIndex).map(sticker => {
          const isSelected = sticker.id === selectedStickerId;
          const scaledW = sticker.width * displaySize.scale;
          const scaledH = sticker.height * displaySize.scale;
          const scaledX = sticker.x * displaySize.scale;
          const scaledY = sticker.y * displaySize.scale;

          return (
            <div
              key={sticker.id}
              data-item="sticker"
              onPointerDown={e => beginDrag(e, 'sticker', sticker.id, sticker.x, sticker.y)}
              onClick={e => { e.stopPropagation(); onSelectSticker(sticker.id); }}
              style={{
                position: 'absolute',
                left: scaledX,
                top: scaledY,
                width: scaledW,
                height: scaledH,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `rotate(${sticker.rotation}deg)`,
                transformOrigin: 'center',
                fontSize: scaledW * 0.85,
                lineHeight: 1,
                zIndex: sticker.zIndex + 10,
                userSelect: 'none',
                cursor: 'move',
                touchAction: 'none',
                outline: isSelected ? '2px dashed #FF85A1' : 'none',
                outlineOffset: 2,
              }}
            >
              {sticker.emoji}
              {isSelected && renderHandles('sticker', sticker.id, sticker.rotation, sticker.width, 0)}
            </div>
          );
        })}

        {/* Text items */}
        {[...texts].sort((a, b) => a.zIndex - b.zIndex).map(textItem => {
          const isSelected = textItem.id === selectedTextId;
          const scaledX = textItem.x * displaySize.scale;
          const scaledY = textItem.y * displaySize.scale;
          const scaledW = textItem.width * displaySize.scale;
          const scaledFontSize = textItem.fontSize * displaySize.scale;

          return (
            <div
              key={textItem.id}
              data-item="text"
              onPointerDown={e => beginDrag(e, 'text', textItem.id, textItem.x, textItem.y)}
              onClick={e => { e.stopPropagation(); onSelectText(textItem.id); }}
              style={{
                position: 'absolute',
                left: scaledX,
                top: scaledY,
                width: scaledW,
                transform: `rotate(${textItem.rotation}deg)`,
                transformOrigin: 'center',
                zIndex: textItem.zIndex + 10,
                fontFamily: `"${textItem.fontFamily}", sans-serif`,
                fontSize: scaledFontSize,
                color: textItem.color,
                fontWeight: textItem.bold ? 'bold' : 'normal',
                fontStyle: textItem.italic ? 'italic' : 'normal',
                textAlign: textItem.align,
                whiteSpace: 'nowrap',
                textShadow: '0 1px 3px rgba(0,0,0,0.15)',
                userSelect: 'none',
                cursor: 'move',
                touchAction: 'none',
                outline: isSelected ? '2px dashed #FF85A1' : 'none',
                outlineOffset: 2,
              }}
            >
              {textItem.text}
              {isSelected && renderHandles('text', textItem.id, textItem.rotation, 0, textItem.fontSize)}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
