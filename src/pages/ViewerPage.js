import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  Pause,
  SkipPrevious,
  SkipNext,
  Download,
  Settings,
  ZoomIn,
  ZoomOut,
  Refresh,
  Tune,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ViewerPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [metadata, setMetadata] = useState(null);
  const [currentSlice, setCurrentSlice] = useState(0);
  const [sliceImage, setSliceImage] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(500);
  const [windowCenter, setWindowCenter] = useState(50);
  const [windowWidth, setWindowWidth] = useState(350);
  const [windowPreset, setWindowPreset] = useState('soft_tissue');
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [windowed, setWindowed] = useState(false);

  // Windowing presets
  const windowingPresets = {
    lung: { center: -600, width: 1500, label: 'Phổi' },
    soft_tissue: { center: 50, width: 350, label: 'Mô mềm' },
    bone: { center: 400, width: 1500, label: 'Xương' },
    brain: { center: 40, width: 80, label: 'Não' },
    liver: { center: 60, width: 160, label: 'Gan' },
    mediastinum: { center: 50, width: 350, label: 'Trung thất' },
  };

  // Load metadata
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}/metadata`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMetadata(data);
        setCurrentSlice(Math.floor(data.num_slices / 2));
        setLoading(false);
      } catch (err) {
        setError('Không thể load metadata');
        setLoading(false);
        toast.error('Không thể load metadata');
      }
    };

    if (sessionId) {
      loadMetadata();
    }
  }, [sessionId]);

  // Load slice image
  const loadSlice = useCallback(async (sliceIdx, useWindowed = false) => {
    try {
      const response = await fetch(`/api/slice/${sessionId}/${sliceIdx}?windowed=${useWindowed}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSliceImage(data.slice_data);
    } catch (err) {
      console.error('Error loading slice:', err);
      toast.error('Không thể load slice');
    }
  }, [sessionId]);

  // Load current slice
  useEffect(() => {
    if (metadata && currentSlice >= 0 && currentSlice < metadata.num_slices) {
      loadSlice(currentSlice, windowed);
    }
  }, [currentSlice, metadata, windowed, loadSlice]);

  // Auto-play functionality
  useEffect(() => {
    let interval;
    if (isPlaying && metadata) {
      interval = setInterval(() => {
        setCurrentSlice((prev) => (prev + 1) % metadata.num_slices);
      }, playSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playSpeed, metadata]);

  // Apply windowing
  const applyWindowing = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/windowing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          window_center: windowCenter,
          window_width: windowWidth,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setWindowed(true);
      await loadSlice(currentSlice, true);
      setLoading(false);
      toast.success('Áp dụng windowing thành công');
    } catch (err) {
      setError('Lỗi khi apply windowing');
      setLoading(false);
      toast.error('Lỗi khi apply windowing');
    }
  };

  // Handle preset change
  const handlePresetChange = (preset) => {
    const settings = windowingPresets[preset];
    setWindowPreset(preset);
    setWindowCenter(settings.center);
    setWindowWidth(settings.width);
  };

  // Navigation functions
  const goToPreviousSlice = () => {
    if (currentSlice > 0) {
      setCurrentSlice(currentSlice - 1);
    }
  };

  const goToNextSlice = () => {
    if (metadata && currentSlice < metadata.num_slices - 1) {
      setCurrentSlice(currentSlice + 1);
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  // Download functions
  const handleDownload = async (format) => {
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

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography variant="h5">Đang tải...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate('/')} startIcon={<ArrowBack />}>
          Quay lại trang chủ
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Button
              onClick={() => navigate('/')}
              startIcon={<ArrowBack />}
              sx={{ mb: 2 }}
            >
              Quay lại
            </Button>
            <Typography variant="h3" gutterBottom>
              CTPA Viewer
            </Typography>
            <Box display="flex" gap={1}>
              <Chip label={`${metadata?.num_slices} slices`} color="primary" />
              <Chip label={`${metadata?.shape?.join(' × ')}`} color="secondary" />
              <Chip 
                label={`${metadata?.processing_time?.toFixed(1)}s`} 
                variant="outlined" 
              />
            </Box>
          </Box>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Main Viewer */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent sx={{ p: 3 }}>
                {/* Viewer Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h5">
                    Slice {currentSlice + 1} / {metadata?.num_slices}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Zoom Out">
                      <IconButton onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
                        <ZoomOut />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Zoom In">
                      <IconButton onClick={() => setZoom(Math.min(3, zoom + 0.25))}>
                        <ZoomIn />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset Zoom">
                      <IconButton onClick={() => setZoom(1)}>
                        <Refresh />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Image Display */}
                <Box
                  sx={{
                    width: '100%',
                    height: 400,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    backgroundColor: 'black',
                  }}
                >
                  {sliceImage ? (
                    <img
                      src={`data:image/png;base64,${sliceImage}`}
                      alt={`Slice ${currentSlice + 1}`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        transform: `scale(${zoom})`,
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  ) : (
                    <Typography variant="h6" color="text.secondary">
                      Đang tải slice...
                    </Typography>
                  )}
                </Box>

                {/* Controls */}
                <Box mt={3}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <IconButton
                        onClick={goToPreviousSlice}
                        disabled={currentSlice === 0}
                      >
                        <SkipPrevious />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <IconButton onClick={togglePlayback}>
                        {isPlaying ? <Pause /> : <PlayArrow />}
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <IconButton
                        onClick={goToNextSlice}
                        disabled={currentSlice === (metadata?.num_slices || 0) - 1}
                      >
                        <SkipNext />
                      </IconButton>
                    </Grid>
                    <Grid item xs>
                      <Slider
                        value={currentSlice}
                        onChange={(e, newValue) => setCurrentSlice(newValue)}
                        min={0}
                        max={(metadata?.num_slices || 1) - 1}
                        step={1}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Play Speed Control */}
                <Box mt={2}>
                  <Typography variant="body2" gutterBottom>
                    Tốc độ phát: {playSpeed}ms
                  </Typography>
                  <Slider
                    value={playSpeed}
                    onChange={(e, newValue) => setPlaySpeed(newValue)}
                    min={100}
                    max={2000}
                    step={100}
                    marks={[
                      { value: 100, label: '100ms' },
                      { value: 500, label: '500ms' },
                      { value: 1000, label: '1s' },
                      { value: 2000, label: '2s' },
                    ]}
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Controls Panel */}
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  <Tune sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Điều khiển
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Windowing Presets */}
                <Typography variant="h6" gutterBottom>
                  Windowing Presets
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Preset</InputLabel>
                  <Select
                    value={windowPreset}
                    onChange={(e) => handlePresetChange(e.target.value)}
                    label="Preset"
                  >
                    {Object.entries(windowingPresets).map(([key, preset]) => (
                      <MenuItem key={key} value={key}>
                        {preset.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Window Center */}
                <Typography variant="body2" gutterBottom>
                  Window Center: {windowCenter}
                </Typography>
                <Slider
                  value={windowCenter}
                  onChange={(e, newValue) => setWindowCenter(newValue)}
                  min={-1000}
                  max={1000}
                  step={10}
                  sx={{ mb: 2 }}
                />

                {/* Window Width */}
                <Typography variant="body2" gutterBottom>
                  Window Width: {windowWidth}
                </Typography>
                <Slider
                  value={windowWidth}
                  onChange={(e, newValue) => setWindowWidth(newValue)}
                  min={1}
                  max={2000}
                  step={10}
                  sx={{ mb: 2 }}
                />

                <Button
                  variant="contained"
                  fullWidth
                  onClick={applyWindowing}
                  startIcon={<Settings />}
                  sx={{ mb: 3 }}
                >
                  Áp dụng Windowing
                </Button>

                <Divider sx={{ my: 2 }} />

                {/* Download Options */}
                <Typography variant="h6" gutterBottom>
                  Download
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="small"
                      onClick={() => handleDownload('nii')}
                      startIcon={<Download />}
                    >
                      NIfTI
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="small"
                      onClick={() => handleDownload('png')}
                      startIcon={<Download />}
                    >
                      PNG
                    </Button>
                  </Grid>
                </Grid>

                {/* Metadata Display */}
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Thông tin
                </Typography>
                {metadata && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Kích thước:</strong> {metadata.shape?.join(' × ')}<br />
                      <strong>Số slices:</strong> {metadata.num_slices}<br />
                      <strong>Thời gian xử lý:</strong> {metadata.processing_time?.toFixed(1)}s<br />
                      <strong>Zoom:</strong> {Math.round(zoom * 100)}%
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ViewerPage;