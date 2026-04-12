import { useCallback, useEffect, useRef, useState } from 'react';

const usePhotoCapture = ({
  onCapture,
  fileNamePrefix = 'photo',
  errorMessage = 'Could not access the camera. Try uploading a photo instead.',
} = {}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment');
  const [cameraError, setCameraError] = useState('');

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const closeCamera = useCallback(() => {
    stopStream();
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOpen(false);
  }, [stopStream]);

  const openCamera = useCallback(
    async (facing = cameraFacing) => {
      setCameraError('');
      try {
        stopStream();
        const constraints = {
          video: { facingMode: { ideal: facing } },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        setCameraOpen(true);
        setCameraFacing(facing);
      } catch (error) {
        console.error('Error opening camera:', error);
        setCameraError(errorMessage);
      }
    },
    [cameraFacing, errorMessage, stopStream]
  );

  const handleCameraClick = useCallback(async () => {
    if (cameraOpen) {
      closeCamera();
      return;
    }
    await openCamera(cameraFacing);
  }, [cameraFacing, cameraOpen, closeCamera, openCamera]);

  const handleFlipCamera = useCallback(async () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    if (cameraOpen) {
      await openCamera(nextFacing);
    }
  }, [cameraFacing, cameraOpen, openCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `${fileNamePrefix}-${Date.now()}.png`, { type: 'image/png' });
      onCapture?.(file);
      closeCamera();
    }, 'image/png');
  }, [closeCamera, fileNamePrefix, onCapture]);

  useEffect(() => {
    if (!cameraOpen || !streamRef.current || !videoRef.current) {
      return undefined;
    }

    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.muted = true;
    const play = () => video.play?.().catch(() => {});

    if (video.readyState >= 2) {
      play();
    } else {
      video.onloadedmetadata = play;
    }

    return () => {
      video.onloadedmetadata = null;
    };
  }, [cameraOpen]);

  useEffect(() => () => {
    stopStream();
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stopStream]);

  return {
    cameraOpen,
    cameraFacing,
    cameraError,
    videoRef,
    canvasRef,
    openCamera,
    closeCamera,
    handleCameraClick,
    handleFlipCamera,
    capturePhoto,
  };
};

export default usePhotoCapture;
