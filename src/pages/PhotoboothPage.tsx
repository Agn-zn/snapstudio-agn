import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, RotateCcw, Zap, ZapOff, RefreshCw, ArrowLeft,
  Play, X, ChevronRight, Check, AlertCircle, SwitchCamera
} from 'lucide-react';
import type { Layout } from '../types';
import { useApp } from '../store/appStore';
import { useCamera } from '../hooks/useCamera';
import { useCountdown } from '../hooks/useCountdown';
import WorkflowStepper from '../components/WorkflowStepper';

interface PhotoboothPageProps {
  layout: Layout;
}

export default function PhotoboothPage({ layout }: PhotoboothPageProps) {
  const { goToLayout, goToEditor } = useApp();
  const { videoRef, isActive, isLoading, error, devices, selectedDeviceId, isMirrored,
    startCamera, stopCamera, switchCamera, capturePhoto, toggleMirror } = useCamera();
  const { count, isRunning, startCountdown, cancelCountdown } = useCountdown();

  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [countdownDuration, setCountdownDuration] = useState(3);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef({ active: false });

  const totalPhotos = layout.photoCount;

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Play shutter click sound via Web Audio API
  const playShutter = useCallback(() => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }, [isMuted]);

  const triggerFlash = useCallback(() => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 700);
  }, []);

  const takePhoto = useCallback((): string | null => {
    const photo = capturePhoto();
    if (!photo) return null;
    playShutter();
    triggerFlash();
    return photo;
  }, [capturePhoto, playShutter, triggerFlash]);

  const startSession = useCallback(() => {
    setCapturedPhotos([]);
    setSessionStarted(true);
    sessionRef.current.active = true;

    const captureNext = (index: number) => {
      if (!sessionRef.current.active || index >= totalPhotos) return;

      startCountdown(
        countdownDuration,
        undefined,
        () => {
          const photo = takePhoto();
          if (photo) {
            setCapturedPhotos(prev => {
              const updated = [...prev, photo];
              if (updated.length >= totalPhotos) {
                sessionRef.current.active = false;
                // Short delay then move on
              }
              return updated;
            });
          }

          if (index + 1 < totalPhotos) {
            setTimeout(() => captureNext(index + 1), 1200);
          }
        }
      );
    };

    captureNext(0);
  }, [countdownDuration, totalPhotos, startCountdown, takePhoto]);

  const startRetake = useCallback((index: number) => {
    setRetakeIndex(index);
    sessionRef.current.active = true;

    startCountdown(
      countdownDuration,
      undefined,
      () => {
        const photo = takePhoto();
        if (photo) {
          setCapturedPhotos(prev => {
            const updated = [...prev];
            updated[index] = photo;
            return updated;
          });
        }
        setRetakeIndex(null);
        sessionRef.current.active = false;
      }
    );
  }, [countdownDuration, startCountdown, takePhoto]);

  const cancelSession = useCallback(() => {
    sessionRef.current.active = false;
    cancelCountdown();
    setSessionStarted(false);
    setRetakeIndex(null);
    setCapturedPhotos([]);
  }, [cancelCountdown]);

  const handleContinue = useCallback(() => {
    stopCamera();
    goToEditor(capturedPhotos);
  }, [capturedPhotos, stopCamera, goToEditor]);

  const allCaptured = capturedPhotos.length >= totalPhotos;
  const isCapturing = isRunning;

  return (
    <div className="min-h-screen bg-charcoal-900 text-white">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-charcoal-800/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between"
      >
        <button onClick={() => { cancelSession(); goToLayout(); }} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="font-display font-bold text-white flex items-center gap-2">
          <Camera className="w-4 h-4 text-blush-300" />
          SnapStudio
        </div>
        {allCaptured ? (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleContinue}
            className="btn-primary text-sm"
          >
            Edit Photos
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        ) : (
          <div className="w-28" />
        )}
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <WorkflowStepper currentStep={1} />
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Camera area */}
          <div className="flex flex-col gap-4">
            {/* Camera preview */}
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-video shadow-strong">
              {/* Video */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
                autoPlay
                muted
                playsInline
              />

              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-10 h-10 border-2 border-blush-400 border-t-transparent rounded-full"
                  />
                </div>
              )}

              {/* Error overlay */}
              {error && !isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4 p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-red-400" />
                  <p className="text-gray-300 text-sm">{error}</p>
                  <button onClick={() => startCamera()} className="btn-primary text-sm">
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                </div>
              )}

              {/* Camera not started overlay */}
              {!isActive && !isLoading && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-charcoal-900/90 gap-4">
                  <Camera className="w-16 h-16 text-gray-600" />
                  <p className="text-gray-400">Camera not started</p>
                  <button onClick={() => startCamera()} className="btn-primary">
                    <Camera className="w-4 h-4" />
                    Start Camera
                  </button>
                </div>
              )}

              {/* Flash overlay */}
              <AnimatePresence>
                {isFlashing && (
                  <motion.div
                    key="flash"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, times: [0, 0.1, 0.3, 1] }}
                    className="absolute inset-0 bg-white pointer-events-none z-20"
                  />
                )}
              </AnimatePresence>

              {/* Countdown overlay */}
              <AnimatePresence>
                {isCapturing && count !== null && count > 0 && (
                  <motion.div
                    key={`count-${count}`}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="absolute inset-0 flex items-center justify-center z-10"
                  >
                    <div className="relative">
                      {/* Pulsing ring */}
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-blush-400/30 blur-sm"
                        style={{ width: 160, height: 160, top: -30, left: -30 }}
                      />
                      <div className="w-28 h-28 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-blush-400">
                        <span className="text-white font-bold text-6xl font-display">
                          {count}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {isCapturing && count === 0 && (
                  <motion.div
                    key="smile"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center z-10"
                  >
                    <div className="bg-blush-400/90 backdrop-blur-sm rounded-2xl px-8 py-4 text-white font-bold text-3xl">
                      📸 Smile!
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Photo counter bar */}
              {sessionStarted && (
                <div className="absolute bottom-3 left-3 right-3 flex gap-1.5 z-10">
                  {Array.from({ length: totalPhotos }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        i < capturedPhotos.length
                          ? 'bg-blush-400'
                          : i === capturedPhotos.length && isCapturing
                          ? 'bg-blush-300 animate-pulse'
                          : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Mirror badge */}
              {isActive && (
                <div className="absolute top-3 left-3 text-xs bg-black/40 text-gray-300 rounded-full px-2.5 py-1 flex items-center gap-1">
                  {isMirrored ? '↔ Mirrored' : '→ Normal'}
                </div>
              )}
            </div>

            {/* Camera controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Countdown selector */}
              <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1">
                <span className="text-gray-400 text-xs px-2">Timer:</span>
                {[3, 5, 10].map(d => (
                  <button
                    key={d}
                    onClick={() => setCountdownDuration(d)}
                    disabled={isCapturing}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      countdownDuration === d
                        ? 'bg-blush-400 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {/* Mirror toggle */}
                <button
                  onClick={toggleMirror}
                  title="Toggle mirror"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Sound toggle */}
                <button
                  onClick={() => setIsMuted(m => !m)}
                  title={isMuted ? 'Unmute' : 'Mute'}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all"
                >
                  {isMuted ? <ZapOff className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                </button>

                {/* Switch camera */}
                {devices.length > 1 && (
                  <select
                    value={selectedDeviceId}
                    onChange={e => switchCamera(e.target.value)}
                    className="bg-white/10 text-gray-300 text-xs rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:border-blush-400"
                  >
                    {devices.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Main action button */}
            <div className="flex gap-3">
              {!sessionStarted ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={startSession}
                  disabled={!isActive}
                  className="flex-1 btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5" />
                  START SESSION ({totalPhotos} photo{totalPhotos !== 1 ? 's' : ''})
                </motion.button>
              ) : isCapturing ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={cancelSession}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-full py-4 font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </motion.button>
              ) : allCaptured ? (
                <>
                  <button
                    onClick={cancelSession}
                    className="btn-ghost text-gray-400 flex-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Retake All
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleContinue}
                    className="flex-1 btn-primary text-base py-4"
                  >
                    <Check className="w-5 h-5" />
                    Use These Photos
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={startSession}
                  disabled={!isActive}
                  className="flex-1 btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5" />
                  START SESSION ({totalPhotos} photo{totalPhotos !== 1 ? 's' : ''})
                </motion.button>
              )}
            </div>
          </div>

          {/* Captured photos sidebar */}
          <div className="flex flex-col gap-4">
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-gray-300">
                  Captured Photos
                </h3>
                <span className="text-blush-400 text-sm font-medium">
                  {capturedPhotos.length}/{totalPhotos}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {Array.from({ length: totalPhotos }).map((_, i) => {
                  const photo = capturedPhotos[i];
                  const isRetaking = retakeIndex === i;
                  const isNext = !photo && capturedPhotos.length === i && sessionStarted;

                  return (
                    <div key={i} className="relative group">
                      <motion.div
                        layout
                        className={`aspect-video rounded-xl overflow-hidden relative ${
                          isRetaking ? 'ring-2 ring-blush-400' : ''
                        }`}
                      >
                        {photo ? (
                          <>
                            <img
                              src={photo}
                              alt={`Photo ${i + 1}`}
                              className="w-full h-full object-cover"
                              style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
                            />
                            {/* Retake button */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                onClick={() => startRetake(i)}
                                disabled={isCapturing}
                                className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 transition-all"
                              >
                                <SwitchCamera className="w-3 h-3" />
                                Retake
                              </button>
                            </div>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-1.5 left-1.5 w-5 h-5 bg-blush-400 rounded-full flex items-center justify-center"
                            >
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </motion.div>
                          </>
                        ) : (
                          <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${
                            isNext ? 'bg-blush-400/20' : 'bg-white/5'
                          }`}>
                            {isNext && isCapturing ? (
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                className="text-blush-400"
                              >
                                <Camera className="w-8 h-8" />
                              </motion.div>
                            ) : (
                              <Camera className="w-6 h-6 text-gray-600" />
                            )}
                            <span className="text-gray-600 text-xs">Photo {i + 1}</span>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  );
                })}
              </div>

              {allCaptured && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-blush-400/20 border border-blush-400/30 rounded-xl text-center"
                >
                  <div className="text-blush-300 text-sm font-medium">✨ All photos captured!</div>
                  <div className="text-gray-400 text-xs mt-1">Continue to the editor</div>
                </motion.div>
              )}
            </div>

            {/* Layout info */}
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="text-xs text-gray-500 mb-2">SELECTED LAYOUT</div>
              <div className="font-medium text-gray-200">{layout.name}</div>
              <div className="text-gray-500 text-sm">{layout.description}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
