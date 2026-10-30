import { useState, useRef, useCallback, useEffect } from 'react';

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isMirrored, setIsMirrored] = useState(true);

  const getDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices
        .filter(d => d.kind === 'videoinput')
        .map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${i + 1}`,
        }));
      setDevices(videoDevices);
      return videoDevices;
    } catch {
      return [];
    }
  }, []);

  const startCamera = useCallback(async (deviceId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: deviceId ? undefined : 'user',
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsActive(true);

      // Enumerate devices after permission granted
      const foundDevices = await getDevices();
      if (deviceId) {
        setSelectedDeviceId(deviceId);
      } else if (foundDevices.length > 0) {
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        setSelectedDeviceId(settings.deviceId || foundDevices[0].deviceId);
      }
    } catch (err) {
      const e = err as Error;
      if (e.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (e.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and try again.');
      } else if (e.name === 'NotReadableError') {
        setError('Camera is already in use by another application.');
      } else {
        setError(`Camera error: ${e.message}`);
      }
      setIsActive(false);
    } finally {
      setIsLoading(false);
    }
  }, [getDevices]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const switchCamera = useCallback(async (deviceId: string) => {
    await startCamera(deviceId);
  }, [startCamera]);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.95);
  }, [isMirrored]);

  const toggleMirror = useCallback(() => {
    setIsMirrored(prev => !prev);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return {
    videoRef,
    isActive,
    isLoading,
    error,
    devices,
    selectedDeviceId,
    isMirrored,
    startCamera,
    stopCamera,
    switchCamera,
    capturePhoto,
    toggleMirror,
  };
}
