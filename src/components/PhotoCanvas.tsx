import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { EditorState, StickerItem, TextItem } from '../types';
import { FILTERS } from '../data/filters';

interface DragState {
  type: 'sticker' | 'text';
  id: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
}

interface Props {
  state: EditorState;
  selectedStickerId: string | null;
  selectedTextId: string | null;
  onSelectSticker: (id: string | null) => void;
  onSelectText: (id: string | null) => void;
  onUpdateSticker: (id: string, updates: Partial<StickerItem>) => void;
  onUpdateText: (id: string, updates: Partial<TextItem>) => void;
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

function getCssFilter(filterId: string): string {
  const filter = FILTERS.find(f => f.id === filterId);
  return filter?.cssFilter ?? 'none';
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

export default function PhotoCanvas({ state, selectedStickerId, selectedTextId,
  onSelectSticker, onSelectText, onUpdateSticker, onUpdateText }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displaySize, setDisplaySize] = useState({ width: 500, height: 600, scale: 0.4 });
  const dragRef = useRef<DragState | null>(null);

  const { layout, photos, background, frame, filterId, stickers, texts, adjustments } = state;
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
    // Initial
    const rect = el.getBoundingClientRect();
    const padding = 48;
    setDisplaySize(computeDisplaySize(W, H, rect.width - padding, rect.height - padding));
    return () => observer.disconnect();
  }, [W, H]);

  const photoRects = getPhotoRects(layout.id, displaySize.width, displaySize.height, photos.length);

  const getFilterStr = useCallback(() => {
    const f = getCssFilter(filterId);
    const { brightness, contrast, saturation, blur } = adjustments;
    let combined = '';
    if (brightness !== 100) combined += ` brightness(${brightness}%)`;
    if (contrast !== 100) combined += ` contrast(${contrast}%)`;
    if (saturation !== 100) combined += ` saturate(${saturation}%)`;
    if (blur > 0) combined += ` blur(${blur}px)`;
    if (f !== 'none') combined = `${f}${combined}`;
    return combined || 'none';
  }, [filterId, adjustments]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'sticker' | 'text', id: string, origX: number, origY: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'sticker') onSelectSticker(id);
    else onSelectText(id);
    dragRef.current = { type, id, startX: e.clientX, startY: e.clientY, origX, origY };
  }, [onSelectSticker, onSelectText]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const { type, id, startX, startY, origX, origY } = dragRef.current;
    const dx = (e.clientX - startX) / displaySize.scale;
    const dy = (e.clientY - startY) / displaySize.scale;
    if (type === 'sticker') onUpdateSticker(id, { x: origX + dx, y: origY + dy });
    else onUpdateText(id, { x: origX + dx, y: origY + dy });
  }, [displaySize.scale, onUpdateSticker, onUpdateText]);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.item) return;
    onSelectSticker(null);
    onSelectText(null);
  }, [onSelectSticker, onSelectText]);

  const filterStr = getFilterStr();

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
          ...getBackgroundStyle(background),
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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
            <motion.div
              key={sticker.id}
              data-item="sticker"
              className={`absolute cursor-move flex items-center justify-center ${isSelected ? 'sticker-selected' : ''}`}
              style={{
                left: scaledX,
                top: scaledY,
                width: scaledW,
                height: scaledH,
                transform: `rotate(${sticker.rotation}deg)`,
                transformOrigin: 'center',
                fontSize: scaledW * 0.85,
                lineHeight: 1,
                zIndex: sticker.zIndex + 10,
                userSelect: 'none',
              }}
              onMouseDown={(e) => handleMouseDown(e, 'sticker', sticker.id, sticker.x, sticker.y)}
              whileHover={{ scale: 1.05 }}
            >
              {sticker.emoji}
            </motion.div>
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
            <motion.div
              key={textItem.id}
              data-item="text"
              className={`absolute cursor-move ${isSelected ? 'sticker-selected' : ''}`}
              style={{
                left: scaledX,
                top: scaledY,
                width: scaledW,
                transform: `rotate(${textItem.rotation}deg)`,
                transformOrigin: 'top left',
                zIndex: textItem.zIndex + 10,
                fontFamily: `"${textItem.fontFamily}", sans-serif`,
                fontSize: scaledFontSize,
                color: textItem.color,
                fontWeight: textItem.bold ? 'bold' : 'normal',
                fontStyle: textItem.italic ? 'italic' : 'normal',
                textAlign: textItem.align,
                whiteSpace: 'nowrap',
                textShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }}
              onMouseDown={(e) => handleMouseDown(e, 'text', textItem.id, textItem.x, textItem.y)}
              whileHover={{ scale: 1.02 }}
            >
              {textItem.text}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
