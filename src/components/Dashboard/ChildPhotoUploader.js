import React, { useRef } from 'react';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Typography,
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoIcon,
  PhotoCamera as CameraIcon,
  FlipCameraIosOutlined as FlipCameraIcon,
} from '@mui/icons-material';
import colors from '../../assets/theme/colors';
import usePhotoCapture from '../../hooks/usePhotoCapture';

const ChildPhotoUploader = ({
  setPhoto,
  photoURL,
  setPhotoURL,
  label = 'Profile photo',
}) => {
  const uploadInputRef = useRef(null);
  const {
    cameraOpen,
    cameraError,
    videoRef,
    canvasRef,
    handleCameraClick,
    handleFlipCamera,
    capturePhoto,
  } = usePhotoCapture({
    onCapture: (file) => applyFile(file),
    fileNamePrefix: 'child-photo',
  });

  const applyFile = (file) => {
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoURL(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    applyFile(file);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: colors.app.text.muted, mb: 1.25 }}>
        {label}
      </Typography>

      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: { xs: 156, sm: 172 },
          height: { xs: 156, sm: 172 },
          borderRadius: '50%',
          bgcolor: colors.landing.surface,
          border: `1px solid ${colors.landing.borderLight}`,
          boxShadow: `0 10px 24px ${colors.landing.shadowSoft}`,
          overflow: 'hidden',
          mx: 'auto',
        }}
      >
        <input
          ref={uploadInputRef}
          type="file"
          hidden
          accept="image/*"
          onChange={handleUploadChange}
        />

        <Avatar
          src={photoURL || undefined}
          alt="Profile preview"
          sx={{
            width: { xs: 112, sm: 120 },
            height: { xs: 112, sm: 120 },
            bgcolor: colors.landing.sageLight,
            color: colors.brand.navy,
            border: `1px solid ${colors.landing.borderLight}`,
          }}
        >
          {!photoURL ? <CameraIcon /> : null}
        </Avatar>

        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: 10,
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            p: 0.5,
            borderRadius: 999,
            bgcolor: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${colors.landing.borderLight}`,
          }}
        >
          <IconButton
            onClick={() => uploadInputRef.current?.click()}
            aria-label="Upload photo"
            size="small"
            sx={{
              width: 40,
              height: 40,
              color: colors.brand.navy,
              bgcolor: colors.landing.surface,
              '&:hover': { bgcolor: colors.landing.sageLight },
            }}
          >
            <AddPhotoIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={handleCameraClick}
            aria-label="Take photo"
            size="small"
            sx={{
              width: 40,
              height: 40,
              color: colors.brand.navy,
              bgcolor: colors.landing.sageLight,
              '&:hover': { bgcolor: colors.landing.sageMedium },
            }}
          >
            <CameraIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {cameraError ? (
        <Typography sx={{ color: 'error.main', fontSize: '0.86rem', fontWeight: 600, mt: 1.25 }}>
          {cameraError}
        </Typography>
      ) : null}

      <Typography sx={{ color: colors.app.text.muted, fontSize: '0.92rem', textAlign: 'center', mt: 1.25 }}>
        Add a profile photo now or take one with the camera.
      </Typography>

      {cameraOpen ? (
        <Box
          sx={{
            my: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            width: '100%',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 520,
              alignSelf: 'center',
              position: 'relative',
            }}
          >
            <IconButton
              onClick={handleFlipCamera}
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 2,
                bgcolor: 'rgba(17, 24, 39, 0.75)',
                color: '#fff',
                '&:hover': {
                  bgcolor: 'rgba(17, 24, 39, 0.9)',
                },
              }}
            >
              <FlipCameraIcon fontSize="small" />
            </IconButton>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                display: 'block',
                aspectRatio: '4 / 3',
                objectFit: 'cover',
                borderRadius: '12px',
                backgroundColor: '#111827',
                border: '1px solid #d1d5db',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
              }}
            />
          </Box>
          <Button variant="contained" onClick={capturePhoto} sx={{ mt: 1, borderRadius: 999, px: 3 }}>
            Capture
          </Button>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </Box>
      ) : null}
    </Box>
  );
};

export default ChildPhotoUploader;
