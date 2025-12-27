/**
 * FaceCapture Component
 * Component để chụp ảnh khuôn mặt với webcam
 * Sử dụng face-api.js để detect khuôn mặt real-time
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  LinearProgress,
  alpha,
  useTheme,
  Zoom,
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Face as FaceIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  FlipCameraIos as FlipIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import * as faceapi from 'face-api.js';

const FaceCapture = ({
  onCapture,
  minImages = 3,
  maxImages = 5,
  initialImages = [],
  disabled = false,
  mode = 'register', // 'register' | 'login'
}) => {
  const theme = useTheme();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImages, setCapturedImages] = useState(initialImages);
  const [faceDetected, setFaceDetected] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [loadingStatus, setLoadingStatus] = useState('');
  
  // Stop webcam function - needs to be defined first for useEffect cleanup
  const stopCamera = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setCameraActive(false);
    setFaceDetected(false);
  }, []);

  // Face detection function
  const startFaceDetection = useCallback(() => {
    const detectFace = async () => {
      if (!videoRef.current) return;
      
      const video = videoRef.current;
      if (video.readyState !== 4) return;
      
      try {
        const options = new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.5,
        });
        
        const detection = await faceapi.detectSingleFace(video, options);
        
        if (detection) {
          setFaceDetected(true);
          
          const canvas = canvasRef.current;
          if (canvas) {
            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            faceapi.matchDimensions(canvas, displaySize);
            
            const resizedDetection = faceapi.resizeResults(detection, displaySize);
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.strokeStyle = theme.palette.success.main;
            ctx.lineWidth = 3;
            ctx.strokeRect(
              resizedDetection.box.x,
              resizedDetection.box.y,
              resizedDetection.box.width,
              resizedDetection.box.height
            );
          }
        } else {
          setFaceDetected(false);
          
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      } catch (err) {
        console.error('Face detection error:', err);
      }
    };
    
    detectionIntervalRef.current = setInterval(detectFace, 100);
  }, [theme.palette.success.main]);
  
  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      setIsLoading(true);
      setLoadingStatus('Đang tải mô hình nhận diện khuôn mặt...');
      
      try {
        // Sử dụng PUBLIC_URL để đúng path khi deploy qua Kong
        const MODEL_URL = `${process.env.PUBLIC_URL || ''}/models`;
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        
        setModelsLoaded(true);
        setLoadingStatus('');
      } catch (err) {
        console.error('Error loading face-api models:', err);
        setError('Không thể tải mô hình nhận diện. Vui lòng tải lại trang.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadModels();
    
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Start webcam
  const startCamera = useCallback(async () => {
    if (!modelsLoaded) {
      setError('Mô hình nhận diện chưa được tải xong. Vui lòng đợi.');
      return;
    }
    
    // Check if mediaDevices API is available (requires HTTPS or localhost)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isSecure) {
        setError('Camera yêu cầu kết nối HTTPS. Vui lòng truy cập qua HTTPS hoặc localhost.');
      } else {
        setError('Trình duyệt không hỗ trợ truy cập camera. Vui lòng sử dụng Chrome, Firefox hoặc Edge.');
      }
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: facingMode,
        },
        audio: false,
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setCameraActive(true);
      startFaceDetection();
      
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Quyền truy cập camera bị từ chối. Vui lòng cho phép trong cài đặt trình duyệt.');
      } else if (err.name === 'NotFoundError') {
        setError('Không tìm thấy camera. Vui lòng kiểm tra kết nối camera.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera đang được sử dụng bởi ứng dụng khác.');
      } else {
        setError('Không thể truy cập camera: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [modelsLoaded, facingMode, startFaceDetection]);

  // Toggle camera facing mode
  const toggleCamera = useCallback(async () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, [stopCamera]);

  // Effect to restart camera when facingMode changes
  useEffect(() => {
    if (cameraActive === false && modelsLoaded) {
      // Only auto-restart if it was just toggled (not initial state)
    }
  }, [facingMode, cameraActive, modelsLoaded]);

  // Capture image from video
  const captureImage = useCallback(() => {
    if (!videoRef.current || !faceDetected) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    
    if (mode === 'login') {
      onCapture([imageData]);
    } else {
      const newImages = [...capturedImages, imageData];
      setCapturedImages(newImages);
      onCapture(newImages);
    }
  }, [faceDetected, capturedImages, onCapture, mode, facingMode]);

  // Auto capture with countdown
  const autoCapture = useCallback(() => {
    if (!faceDetected) {
      setError('Không phát hiện khuôn mặt. Vui lòng đưa mặt vào khung hình.');
      return;
    }
    
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          captureImage();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [faceDetected, captureImage]);

  // Remove captured image
  const removeImage = (index) => {
    const newImages = capturedImages.filter((_, i) => i !== index);
    setCapturedImages(newImages);
    onCapture(newImages);
  };

  // Clear all images
  const clearAllImages = () => {
    setCapturedImages([]);
    onCapture([]);
  };

  return (
    <Box>
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {error}
        </Alert>
      )}

      {loadingStatus && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2">{loadingStatus}</Typography>
          </Box>
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: '#0F172A',
          aspectRatio: '4/3',
          mb: 2,
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            display: cameraActive ? 'block' : 'none',
          }}
        />
        
        <canvas 
          ref={canvasRef} 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            pointerEvents: 'none',
          }} 
        />
        
        {!cameraActive && !isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <VideocamOffIcon sx={{ fontSize: 64, opacity: 0.5, mb: 2 }} />
            <Typography variant="body1" sx={{ opacity: 0.7 }}>
              Camera chưa được bật
            </Typography>
            {!modelsLoaded && (
              <Typography variant="caption" sx={{ opacity: 0.5, mt: 1 }}>
                Đang tải mô hình nhận diện...
              </Typography>
            )}
          </Box>
        )}
        
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0,0,0,0.7)',
            }}
          >
            <CircularProgress sx={{ color: 'white', mb: 2 }} />
            <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
              {loadingStatus || 'Đang khởi động camera...'}
            </Typography>
          </Box>
        )}
        
        {cameraActive && (
          <>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '55%',
                aspectRatio: '3/4',
                border: `3px dashed ${faceDetected ? theme.palette.success.main : theme.palette.warning.main}`,
                borderRadius: '50%',
                transition: 'all 0.3s',
                boxShadow: faceDetected 
                  ? `0 0 30px ${alpha(theme.palette.success.main, 0.5)}`
                  : 'none',
              }}
            />
            
            <Chip
              icon={faceDetected ? <CheckIcon /> : <FaceIcon />}
              label={faceDetected ? 'Đã nhận diện khuôn mặt' : 'Đưa mặt vào khung hình'}
              color={faceDetected ? 'success' : 'warning'}
              sx={{
                position: 'absolute',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                fontWeight: 600,
              }}
            />
            
            {countdown !== null && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0,0,0,0.5)',
                }}
              >
                <Zoom in>
                  <Typography
                    variant="h1"
                    sx={{
                      color: 'white',
                      fontSize: 120,
                      fontWeight: 700,
                      textShadow: '0 0 20px rgba(255,255,255,0.5)',
                    }}
                  >
                    {countdown}
                  </Typography>
                </Zoom>
              </Box>
            )}
          </>
        )}
        
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 2,
          }}
        >
          {!cameraActive ? (
            <Button
              variant="contained"
              startIcon={<VideocamIcon />}
              onClick={startCamera}
              disabled={isLoading || disabled || !modelsLoaded}
              sx={{
                bgcolor: theme.palette.primary.main,
                '&:hover': { bgcolor: theme.palette.primary.dark },
              }}
            >
              Bật Camera
            </Button>
          ) : (
            <>
              <IconButton
                onClick={toggleCamera}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              >
                <FlipIcon />
              </IconButton>
              
              <IconButton
                onClick={autoCapture}
                disabled={!faceDetected || countdown !== null || (mode === 'register' && capturedImages.length >= maxImages)}
                sx={{
                  bgcolor: faceDetected ? theme.palette.success.main : 'rgba(255,255,255,0.2)',
                  color: 'white',
                  width: 64,
                  height: 64,
                  '&:hover': { 
                    bgcolor: faceDetected ? theme.palette.success.dark : 'rgba(255,255,255,0.3)' 
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.3)',
                  },
                }}
              >
                <PhotoCameraIcon sx={{ fontSize: 32 }} />
              </IconButton>
              
              <IconButton
                onClick={stopCamera}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': { bgcolor: theme.palette.error.main },
                }}
              >
                <VideocamOffIcon />
              </IconButton>
            </>
          )}
        </Box>
      </Paper>

      {mode === 'register' && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Ảnh đã chụp: {capturedImages.length}/{maxImages}
            </Typography>
            <Typography variant="body2" color={capturedImages.length >= minImages ? 'success.main' : 'warning.main'}>
              {capturedImages.length >= minImages ? 'Đủ ảnh ✓' : `Cần tối thiểu ${minImages} ảnh`}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(capturedImages.length / maxImages) * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                background: capturedImages.length >= minImages
                  ? `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`
                  : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                borderRadius: 4,
              },
            }}
          />
        </Box>
      )}

      {mode === 'register' && capturedImages.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              <AutoAwesomeIcon sx={{ mr: 1, fontSize: 18, verticalAlign: 'middle', color: theme.palette.primary.main }} />
              Ảnh đã chụp
            </Typography>
            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={clearAllImages}
            >
              Xóa tất cả
            </Button>
          </Box>
          <Grid container spacing={1}>
            {capturedImages.map((img, index) => (
              <Grid item xs={4} sm={3} md={2} key={index}>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 2,
                    overflow: 'hidden',
                    aspectRatio: '1',
                    '&:hover .delete-btn': {
                      opacity: 1,
                    },
                  }}
                >
                  <img
                    src={img}
                    alt={`Face ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <IconButton
                    className="delete-btn"
                    size="small"
                    onClick={() => removeImage(index)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      '&:hover': {
                        bgcolor: theme.palette.error.main,
                      },
                    }}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                  <Chip
                    label={index + 1}
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 4,
                      left: 4,
                      bgcolor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Alert 
        severity="info" 
        icon={<FaceIcon />}
        sx={{ 
          borderRadius: 2,
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
          Hướng dẫn chụp ảnh tốt:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          <li>Đảm bảo ánh sáng đủ, tránh ngược sáng</li>
          <li>Đưa khuôn mặt vào giữa khung hình oval</li>
          <li>Giữ khuôn mặt thẳng, không nghiêng quá nhiều</li>
          {mode === 'register' && (
            <>
              <li>Chụp nhiều góc khác nhau (chính diện, nghiêng nhẹ)</li>
              <li>Tối thiểu {minImages} ảnh để đăng ký thành công</li>
            </>
          )}
        </Box>
      </Alert>
    </Box>
  );
};

export default FaceCapture;
