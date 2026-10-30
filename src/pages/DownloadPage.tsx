import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Printer, Camera, ArrowLeft, Image, Check, Share2 } from 'lucide-react';
import type { EditorState } from '../types';
import { useApp } from '../store/appStore';
import { exportToPng, exportToJpeg } from '../utils/canvasRenderer';

const PAPER_SIZES = [
  { id: '4x6', label: '4×6 inches', desc: 'Standard photo print' },
  { id: '2x6', label: '2×6 inches', desc: 'Photo strip' },
  { id: 'a4', label: 'A4', desc: 'Full page' },
  { id: 'square', label: 'Square', desc: '5×5 inches' },
];

interface DownloadPageProps {
  imageUrl: string;
  editorState: EditorState | null;
}

export default function DownloadPage({ imageUrl, editorState }: DownloadPageProps) {
  const { goHome, goToGallery, state } = useApp();
  const [downloaded, setDownloaded] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState('4x6');
  const [copies, setCopies] = useState(1);
  const [showPrintPanel, setShowPrintPanel] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const getFilename = (ext: string) => {
    const date = new Date().toISOString().split('T')[0];
    return `snapstudio-photo-${date}.${ext}`;
  };

  const downloadFile = useCallback((dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  }, []);

  const downloadPNG = useCallback(async () => {
    if (editorState) {
      const url = await exportToPng(editorState);
      downloadFile(url, getFilename('png'));
    } else {
      downloadFile(imageUrl, getFilename('png'));
    }
  }, [editorState, imageUrl, downloadFile]);

  const downloadJPEG = useCallback(async () => {
    if (editorState) {
      const url = await exportToJpeg(editorState);
      downloadFile(url, getFilename('jpg'));
    } else {
      downloadFile(imageUrl, getFilename('jpg'));
    }
  }, [editorState, imageUrl, downloadFile]);

  const handlePrint = useCallback(() => {
    setIsPrinting(true);

    // Create print-specific content
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups to print');
      setIsPrinting(false);
      return;
    }

    const paperDimensions: Record<string, { width: string; height: string }> = {
      '4x6': { width: '4in', height: '6in' },
      '2x6': { width: '2in', height: '6in' },
      'a4': { width: '210mm', height: '297mm' },
      'square': { width: '5in', height: '5in' },
    };

    const dims = paperDimensions[selectedPaper] || paperDimensions['4x6'];

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>SnapStudio Print</title>
        <style>
          @page {
            size: ${dims.width} ${dims.height};
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${dims.width};
            height: ${dims.height};
            background: white;
          }
          img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
          .page-break {
            page-break-before: always;
          }
        </style>
      </head>
      <body>
        ${Array.from({ length: copies }).map((_, i) => `
          <div ${i > 0 ? 'class="page-break"' : ''} style="width:${dims.width};height:${dims.height};display:flex;align-items:center;justify-content:center;">
            <img src="${imageUrl}" alt="SnapStudio Photo" />
          </div>
        `).join('')}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 1000);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    setIsPrinting(false);
  }, [imageUrl, selectedPaper, copies]);

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 glass border-b border-white/60 px-6 py-4 flex items-center justify-between"
      >
        <button onClick={() => window.history.back()} className="btn-ghost text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Editor
        </button>
        <div className="font-display font-bold text-charcoal-800 flex items-center gap-2">
          <span className="text-blush-400">✨</span>
          SnapStudio
        </div>
        <button onClick={goToGallery} className="btn-ghost text-sm text-blush-500">
          <Image className="w-4 h-4" />
          Gallery
        </button>
      </motion.div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="font-display text-3xl font-bold text-charcoal-800 mb-2">
            Your photo is ready!
          </h1>
          <p className="text-gray-500">Download, print, or start a new session</p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          {/* Photo preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center"
          >
            <div className="relative">
              <img
                src={imageUrl}
                alt="Final photo"
                className="max-w-full max-h-[70vh] object-contain rounded-2xl canvas-shadow"
              />
              {/* Print area (hidden) */}
              <div id="print-area" ref={printRef} className="hidden">
                <img src={imageUrl} alt="Print" />
              </div>
            </div>
          </motion.div>

          {/* Download panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Download buttons */}
            <div className="card">
              <h3 className="font-semibold text-charcoal-800 mb-4 flex items-center gap-2">
                <Download className="w-4 h-4 text-blush-400" />
                Download
              </h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={downloadPNG}
                  className="w-full btn-primary"
                >
                  {downloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  Download PNG (High Quality)
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={downloadJPEG}
                  className="w-full btn-secondary"
                >
                  <Download className="w-4 h-4" />
                  Download JPEG (Smaller)
                </motion.button>
              </div>
            </div>

            {/* Print panel */}
            <div className="card">
              <button
                onClick={() => setShowPrintPanel(!showPrintPanel)}
                className="w-full flex items-center justify-between"
              >
                <h3 className="font-semibold text-charcoal-800 flex items-center gap-2">
                  <Printer className="w-4 h-4 text-blush-400" />
                  Print Photo
                </h3>
                <span className="text-gray-400 text-sm">{showPrintPanel ? '▲' : '▼'}</span>
              </button>

              {showPrintPanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 space-y-4"
                >
                  {/* Paper size */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">Paper Size</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PAPER_SIZES.map(size => (
                        <button
                          key={size.id}
                          onClick={() => setSelectedPaper(size.id)}
                          className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                            selectedPaper === size.id
                              ? 'border-blush-400 bg-blush-50'
                              : 'border-gray-100 hover:border-blush-200'
                          }`}
                        >
                          <div className="text-xs font-semibold text-charcoal-800">{size.label}</div>
                          <div className="text-xs text-gray-400">{size.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Copies */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">Copies: {copies}</label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={copies}
                      onChange={e => setCopies(Number(e.target.value))}
                      className="w-full accent-pink-400"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handlePrint}
                    disabled={isPrinting}
                    className="w-full bg-charcoal-800 hover:bg-charcoal-900 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    {isPrinting ? 'Opening Print...' : `Print ${copies > 1 ? `${copies} copies` : 'Photo'}`}
                  </motion.button>
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="card space-y-3">
              <h3 className="font-semibold text-charcoal-800 mb-1">What's next?</h3>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={goHome}
                className="w-full btn-secondary"
              >
                <Camera className="w-4 h-4" />
                New Photobooth Session
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={goToGallery}
                className="w-full btn-ghost justify-center"
              >
                <Image className="w-4 h-4" />
                View Gallery
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
