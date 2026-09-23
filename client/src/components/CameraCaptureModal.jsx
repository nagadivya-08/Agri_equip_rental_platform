import { useState, useRef, useEffect, useCallback } from 'react';

const CameraCaptureModal = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // default to rear camera for machinery
  const [loadingCamera, setLoadingCamera] = useState(false);
  const [devices, setDevices] = useState([]);

  // Stop media tracks
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore error on stop
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start media stream
  const startCamera = useCallback(
    async (mode) => {
      stopStream();
      setCameraError('');
      setLoadingCamera(true);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          'Camera API is not supported on this browser or requires a secure (HTTPS or localhost) connection.'
        );
        setLoadingCamera(false);
        return;
      }

      try {
        const constraints = {
          video: {
            facingMode: mode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }

        // List video devices to see if flip camera button is useful
        try {
          const allDevices = await navigator.mediaDevices.enumerateDevices();
          const videoDevs = allDevices.filter((d) => d.kind === 'videoinput');
          setDevices(videoDevs);
        } catch {
          // ignore enumerate errors
        }
      } catch (err) {
        console.error('Camera access error:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError(
            'Camera permission was denied. Please allow camera access in your browser settings (look for the lock/camera icon in your address bar).'
          );
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('No camera found on this device.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setCameraError('Camera is already in use by another application.');
        } else {
          setCameraError(err.message || 'Unable to access camera.');
        }
      } finally {
        setLoadingCamera(false);
      }
    },
    [stopStream]
  );

  // Manage start/stop on modal open/close
  useEffect(() => {
    if (isOpen) {
      setCapturedBlob(null);
      setCapturedPreview(null);
      startCamera(facingMode);
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, startCamera, stopStream]);

  if (!isOpen) return null;

  // Toggle front/rear camera
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Capture frame to canvas
  const handleSnap = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (facingMode === 'user') {
      // Flip horizontally if front camera for natural mirror feel
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCapturedBlob(blob);
        setCapturedPreview(URL.createObjectURL(blob));
        // Pause stream preview while reviewing
        stopStream();
      },
      'image/jpeg',
      0.92
    );
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedBlob(null);
    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
      setCapturedPreview(null);
    }
    startCamera(facingMode);
  };

  // Confirm photo
  const handleConfirmPhoto = () => {
    if (!capturedBlob) return;
    const filename = `equipment-photo-${Date.now()}.jpg`;
    const file = new File([capturedBlob], filename, { type: 'image/jpeg' });
    onCapture(file);
    handleClose();
  };

  const handleClose = () => {
    stopStream();
    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
    }
    setCapturedBlob(null);
    setCapturedPreview(null);
    setCameraError('');
    onClose();
  };

  return (
    <div className="camera-modal-backdrop" onClick={handleClose}>
      <div
        className="camera-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="camera-modal-title"
      >
        <div className="camera-modal-header">
          <h3 id="camera-modal-title">📷 Take Equipment Photo</h3>
          <button
            type="button"
            className="camera-modal-close"
            onClick={handleClose}
            aria-label="Close camera"
          >
            ✕
          </button>
        </div>

        <div className="camera-modal-body">
          {cameraError ? (
            <div className="camera-error-box">
              <span className="camera-error-icon">⚠️</span>
              <h4>Camera Access Needed</h4>
              <p>{cameraError}</p>
              <div className="camera-error-actions">
                <button
                  type="button"
                  className="btn-retry-camera"
                  onClick={() => startCamera(facingMode)}
                >
                  🔄 Try Again
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleClose}
                >
                  Use Browse Files Instead
                </button>
              </div>
            </div>
          ) : capturedPreview ? (
            <div className="camera-preview-container">
              <img
                src={capturedPreview}
                alt="Captured machinery"
                className="camera-captured-image"
              />
              <div className="camera-preview-badge">Snapshot Ready</div>
            </div>
          ) : (
            <div className="camera-video-wrapper">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`camera-video-feed ${
                  facingMode === 'user' ? 'mirrored' : ''
                }`}
              />
              {loadingCamera && (
                <div className="camera-loading-overlay">
                  <span>Initializing camera stream...</span>
                </div>
              )}
              <div className="camera-viewfinder-overlay">
                <div className="viewfinder-frame"></div>
                <div className="viewfinder-hint">
                  Position equipment clearly in the frame
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="camera-modal-footer">
          {capturedPreview ? (
            <div className="camera-actions-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleRetake}
              >
                🔄 Retake Photo
              </button>
              <button
                type="button"
                className="btn-confirm-photo"
                onClick={handleConfirmPhoto}
              >
                ✅ Use This Photo
              </button>
            </div>
          ) : (
            <div className="camera-actions-row">
              {devices.length > 1 && (
                <button
                  type="button"
                  className="btn-flip-camera"
                  onClick={handleToggleFacingMode}
                  title="Switch camera"
                >
                  🔄 Switch Camera
                </button>
              )}
              <button
                type="button"
                className="btn-snap-photo"
                onClick={handleSnap}
                disabled={loadingCamera || !!cameraError}
              >
                <span className="snap-inner-circle"></span>
                <span>Click Photo</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClose}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCaptureModal;
