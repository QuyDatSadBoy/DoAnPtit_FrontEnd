import React, { useState, useCallback, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  LinearProgress,
  Alert,
  Chip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  CloudUpload,
  Psychology,
  Download,
  Visibility,
  CheckCircle,
  Error,
  Timer,
  Memory,
  WifiOff,
  Computer,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const HomePage = () => {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [guidanceScale, setGuidanceScale] = useState(1.0);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [serverAvailable, setServerAvailable] = useState(true);

  // Check server availability
  useEffect(() => {
    const checkServerAvailability = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('/api/health', {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          setServerAvailable(true);
          setIsOfflineMode(false);
        } else {
          setServerAvailable(false);
          setIsOfflineMode(true);
        }
      } catch (error) {
        setServerAvailable(false);
        setIsOfflineMode(true);
        console.log('Server not available, some features may be limited');
      }
    };

    checkServerAvailability();
    const interval = setInterval(checkServerAvailability, 30000);
    return () => clearInterval(interval);
  }, []);

  // File upload handler
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setUploadedFile(file);

    // Check if server is available for processing
    if (!serverAvailable) {
      toast.error('Server không khả dụng. Vui lòng thử lại sau.');
      return;
    }

    // Upload file
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSessionId(data.session_id);
        toast.success('Upload thành công!');
      } else {
        setError('Lỗi khi upload file');
        toast.error('Lỗi khi upload file');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
      toast.error('Lỗi kết nối server');
      console.error(err);
    }
  }, [serverAvailable]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/octet-stream': ['.npy'],
      'application/dicom': ['.dcm'],
    },
    multiple: false,
  });

  // Process CTPA generation
  const handleGenerate = async () => {
    if (!sessionId || !serverAvailable) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setError(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          guidance_scale: guidanceScale,
        }),
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setResult(data);
        toast.success('Generate CTPA thành công!');
        setTimeout(() => {
          setIsProcessing(false);
        }, 1000);
      } else {
        setError('Lỗi khi generate CTPA');
        toast.error('Lỗi khi generate CTPA');
        setIsProcessing(false);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError('Lỗi khi xử lý: ' + err.message);
      toast.error('Lỗi khi xử lý');
      setIsProcessing(false);
    }
  };

  // View results
  const handleViewResults = () => {
    if (sessionId) {
      navigate(`/viewer/${sessionId}`);
    }
  };

  // Download results
  const handleDownload = async (format) => {
    if (!sessionId || !serverAvailable) return;

    try {
      const response = await fetch(`/api/download/${sessionId}/${format}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ctpa_${sessionId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Lỗi khi download file');
      toast.error('Lỗi khi download file');
    }
  };

  // Navigate to NIfTI viewer
  const handleViewNifti = () => {
    navigate('/nifti-viewer');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Connection Status */}
      <Alert 
        severity={serverAvailable ? "success" : "warning"} 
        sx={{ mb: 3 }}
        icon={serverAvailable ? <Computer /> : <WifiOff />}
      >
        {serverAvailable ? 
          "Server kết nối - Tất cả tính năng đều khả dụng" :
          "Server không khả dụng - Một số tính năng có thể bị hạn chế"
        }
      </Alert>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box textAlign="center" mb={6}>
          <Typography variant="h1" gutterBottom>
            X-ray2CTPA
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            Chuyển đổi ảnh X-ray 2D thành CTPA 3D bằng AI
          </Typography>
          <Box mt={3}>
            <Chip 
              label="AI-Powered" 
              color="primary" 
              sx={{ mr: 1, fontWeight: 600 }} 
            />
            <Chip 
              label="Medical Imaging" 
              color="secondary" 
              sx={{ mr: 1, fontWeight: 600 }} 
            />
            <Chip 
              label="3D Visualization" 
              color="primary" 
              variant="outlined" 
              sx={{ fontWeight: 600 }} 
            />
          </Box>
        </Box>
      </motion.div>

      <Grid container spacing={4}>
        {/* Upload Section */}
        <Grid item xs={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <CloudUpload sx={{ mr: 2, color: 'primary.main' }} />
                  Upload X-ray
                </Typography>

                {/* File Upload Zone */}
                <Box
                  {...getRootProps()}
                  sx={{
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'rgba(255, 255, 255, 0.3)',
                    borderRadius: 3,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: isDragActive 
                      ? 'linear-gradient(45deg, rgba(0, 188, 212, 0.1), rgba(255, 87, 34, 0.1))'
                      : 'rgba(255, 255, 255, 0.05)',
                    '&:hover': {
                      borderColor: 'primary.main',
                      background: 'linear-gradient(45deg, rgba(0, 188, 212, 0.1), rgba(255, 87, 34, 0.1))',
                    },
                    opacity: serverAvailable ? 1 : 0.5,
                  }}
                >
                  <input {...getInputProps()} disabled={!serverAvailable} />
                  <CloudUpload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {isDragActive ? 'Thả file vào đây...' : 'Kéo thả file X-ray hoặc click để chọn'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hỗ trợ: PNG, JPG, JPEG, NPY, DCM
                  </Typography>
                  {!serverAvailable && (
                    <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                      Cần kết nối server để upload và xử lý file
                    </Typography>
                  )}
                </Box>

                {/* Uploaded File Info */}
                <AnimatePresence>
                  {uploadedFile && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Box
                        mt={3}
                        p={2}
                        sx={{
                          background: 'rgba(0, 188, 212, 0.1)',
                          borderRadius: 2,
                          border: '1px solid rgba(0, 188, 212, 0.3)',
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom>
                          <CheckCircle sx={{ mr: 1, verticalAlign: 'middle', color: 'success.main' }} />
                          File đã upload
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </Typography>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Settings */}
                {sessionId && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom>
                      Cài đặt Generation
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Guidance Scale: {guidanceScale}
                      </Typography>
                      <Slider
                        value={guidanceScale}
                        onChange={(e, newValue) => setGuidanceScale(newValue)}
                        min={0.1}
                        max={2.0}
                        step={0.1}
                        marks={[
                          { value: 0.5, label: '0.5' },
                          { value: 1.0, label: '1.0' },
                          { value: 1.5, label: '1.5' },
                          { value: 2.0, label: '2.0' },
                        ]}
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Giá trị cao hơn tạo ra hình ảnh rõ nét hơn nhưng có thể kém tự nhiên
                      </Typography>
                    </Box>
                  </motion.div>
                )}

                {/* Generate Button */}
                {sessionId && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Box mt={3}>
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        onClick={handleGenerate}
                        disabled={isProcessing || !serverAvailable}
                        startIcon={<Psychology />}
                        sx={{
                          py: 2,
                          background: 'linear-gradient(45deg, #00bcd4, #ff5722)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #0097a7, #d84315)',
                          },
                        }}
                      >
                        {isProcessing ? 'Đang xử lý...' : 'Generate CTPA'}
                      </Button>
                    </Box>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Visibility sx={{ mr: 2, color: 'secondary.main' }} />
                  Kết quả
                </Typography>

                {/* Processing Progress */}
                <AnimatePresence>
                  {isProcessing && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Box sx={{ mb: 3 }}>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Timer sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6">
                            Đang xử lý... {Math.round(processingProgress)}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={processingProgress} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Quá trình này có thể mất vài phút
                        </Typography>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Results */}
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Box
                        sx={{
                          background: 'rgba(76, 175, 80, 0.1)',
                          borderRadius: 2,
                          border: '1px solid rgba(76, 175, 80, 0.3)',
                          p: 3,
                          mb: 3,
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          <CheckCircle sx={{ mr: 1, verticalAlign: 'middle', color: 'success.main' }} />
                          Hoàn thành!
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box display="flex" alignItems="center">
                              <Timer sx={{ mr: 1, fontSize: 20 }} />
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Thời gian xử lý
                                </Typography>
                                <Typography variant="h6">
                                  {result.processing_time?.toFixed(1)}s
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box display="flex" alignItems="center">
                              <Memory sx={{ mr: 1, fontSize: 20 }} />
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Kích thước
                                </Typography>
                                <Typography variant="h6">
                                  {result.output_shape?.join(' × ')}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>

                      {/* Action Buttons */}
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={handleViewResults}
                            startIcon={<Visibility />}
                            sx={{ py: 1.5 }}
                          >
                            Xem kết quả
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => handleDownload('nii')}
                            startIcon={<Download />}
                            sx={{ py: 1.5 }}
                          >
                            Download NIfTI
                          </Button>
                        </Grid>
                      </Grid>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* NIfTI Viewer Option */}
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Hoặc xem file NIfTI có sẵn
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleViewNifti}
                    startIcon={<Visibility />}
                    sx={{ py: 1.5 }}
                  >
                    Mở NIfTI Viewer
                  </Button>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Xem và tương tác với file NIfTI (.nii, .nii.gz) {!serverAvailable && 'trong chế độ offline'}
                  </Typography>
                </Box>

                {/* Error Display */}
                {error && (
                  <Alert severity="error" sx={{ mt: 3 }}>
                    {error}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage; 