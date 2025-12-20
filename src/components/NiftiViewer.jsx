import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Settings,
  Download,
  Eye,
  Layers
} from 'lucide-react';

const NiftiViewer = ({ sessionId, metadata }) => {
  const [currentPlane, setCurrentPlane] = useState('axial');
  const [sliceIndex, setSliceIndex] = useState(0);
  const [sliceData, setSliceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [windowCenter, setWindowCenter] = useState(50);
  const [windowWidth, setWindowWidth] = useState(350);
  const [useWindowing, setUseWindowing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Window presets cho medical imaging
  const windowPresets = {
    'soft_tissue': { center: 50, width: 350, name: 'Soft Tissue' },
    'lung': { center: -600, width: 1500, name: 'Lung' },
    'bone': { center: 400, width: 1500, name: 'Bone' },
    'brain': { center: 40, width: 80, name: 'Brain' },
    'liver': { center: 60, width: 160, name: 'Liver' },
    'mediastinum': { center: 50, width: 350, name: 'Mediastinum' }
  };

  const planes = ['axial', 'sagittal', 'coronal'];
  const planeNames = {
    'axial': 'Axial (Ngang)',
    'sagittal': 'Sagittal (Dọc)',
    'coronal': 'Coronal (Đứng)'
  };

  // Lấy số slices cho plane hiện tại
  const getCurrentSliceCount = useCallback(() => {
    if (!metadata || !metadata.slice_data) return 0;
    return metadata.slice_data[currentPlane]?.num_slices || 0;
  }, [metadata, currentPlane]);

  // Load slice data
  const loadSlice = useCallback(async (plane, index, windowCenter = null, windowWidth = null) => {
    if (!sessionId || !metadata) return;

    setLoading(true);
    try {
      let url = `/api/nifti-slice/${sessionId}/${plane}/${index}`;
      
      if (windowCenter !== null && windowWidth !== null) {
        url += `?window_center=${windowCenter}&window_width=${windowWidth}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setSliceData(data.slice_data);
      }
    } catch (error) {
      console.error('Error loading slice:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId, metadata]);

  // Effect để load slice khi thay đổi plane hoặc index
  useEffect(() => {
    const maxSlices = getCurrentSliceCount();
    if (maxSlices > 0) {
      const validIndex = Math.min(sliceIndex, maxSlices - 1);
      setSliceIndex(validIndex);
      
      if (useWindowing) {
        loadSlice(currentPlane, validIndex, windowCenter, windowWidth);
      } else {
        loadSlice(currentPlane, validIndex);
      }
    }
  }, [currentPlane, sliceIndex, useWindowing, windowCenter, windowWidth, loadSlice, getCurrentSliceCount]);

  // Reset slice index khi đổi plane
  useEffect(() => {
    setSliceIndex(0);
  }, [currentPlane]);

  // Xử lý navigation
  const handlePrevSlice = () => {
    setSliceIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextSlice = () => {
    const maxSlices = getCurrentSliceCount();
    setSliceIndex(prev => Math.min(maxSlices - 1, prev + 1));
  };

  const handleSliceChange = (e) => {
    setSliceIndex(parseInt(e.target.value));
  };

  // Xử lý zoom và pan
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.1));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Xử lý mouse events cho pan
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Xử lý windowing
  const handleWindowingToggle = () => {
    setUseWindowing(!useWindowing);
  };

  const handlePresetChange = (preset) => {
    setWindowCenter(preset.center);
    setWindowWidth(preset.width);
  };

  if (!metadata) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không có dữ liệu để hiển thị</p>
      </div>
    );
  }

  const maxSlices = getCurrentSliceCount();

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Plane Selection */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Plane:</span>
            <div className="flex space-x-1">
              {planes.map(plane => (
                <button
                  key={plane}
                  onClick={() => setCurrentPlane(plane)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    currentPlane === plane
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {planeNames[plane]}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-1 text-gray-600 hover:text-gray-800"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600 min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 text-gray-600 hover:text-gray-800"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1 text-gray-600 hover:text-gray-800"
              title="Reset View"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>

          {/* Windowing Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleWindowingToggle}
              className={`flex items-center space-x-1 px-3 py-1 text-sm rounded transition-colors ${
                useWindowing
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>Windowing</span>
            </button>
          </div>
        </div>

        {/* Windowing Controls */}
        {useWindowing && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <div className="flex flex-wrap items-center gap-4">
              {/* Window Presets */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Presets:</span>
                <select
                  onChange={(e) => handlePresetChange(windowPresets[e.target.value])}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="">Select preset...</option>
                  {Object.entries(windowPresets).map(([key, preset]) => (
                    <option key={key} value={key}>{preset.name}</option>
                  ))}
                </select>
              </div>

              {/* Manual Controls */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Center:</label>
                  <input
                    type="number"
                    value={windowCenter}
                    onChange={(e) => setWindowCenter(parseFloat(e.target.value))}
                    className="w-20 text-sm border border-gray-300 rounded px-2 py-1"
                    step="10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Width:</label>
                  <input
                    type="number"
                    value={windowWidth}
                    onChange={(e) => setWindowWidth(parseFloat(e.target.value))}
                    className="w-20 text-sm border border-gray-300 rounded px-2 py-1"
                    step="10"
                    min="1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Viewer */}
      <div className="flex">
        {/* Image Display */}
        <div className="flex-1 relative bg-black">
          <div
            className="relative overflow-hidden"
            style={{ height: '500px' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : sliceData ? (
              <img
                src={sliceData}
                alt={`${planeNames[currentPlane]} slice ${sliceIndex}`}
                className="absolute inset-0 w-full h-full object-contain cursor-move"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  imageRendering: 'pixelated'
                }}
                draggable={false}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <p>Không thể load slice</p>
              </div>
            )}

            {/* Slice Info Overlay */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
              <p>{planeNames[currentPlane]}</p>
              <p>Slice: {sliceIndex + 1} / {maxSlices}</p>
              {useWindowing && (
                <p>W: {windowWidth} C: {windowCenter}</p>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 border-l border-gray-200 p-4">
          {/* Slice Navigation */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Slice Navigation</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevSlice}
                  disabled={sliceIndex === 0}
                  className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max={maxSlices - 1}
                    value={sliceIndex}
                    onChange={handleSliceChange}
                    className="w-full"
                  />
                </div>
                <button
                  onClick={handleNextSlice}
                  disabled={sliceIndex === maxSlices - 1}
                  className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="text-center text-sm text-gray-600">
                Slice {sliceIndex + 1} of {maxSlices}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Metadata</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Dimensions:</span>
                <span>{metadata.shape.join(' × ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Spacing:</span>
                <span>{metadata.spacing.map(s => s.toFixed(2)).join(' × ')} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data Type:</span>
                <span>{metadata.data_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Min Value:</span>
                <span>{metadata.min_value.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Value:</span>
                <span>{metadata.max_value.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mean:</span>
                <span>{metadata.mean_value.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Slice Counts */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Slice Counts</h3>
            <div className="space-y-2 text-sm">
              {planes.map(plane => (
                <div key={plane} className="flex justify-between">
                  <span className="text-gray-600">{planeNames[plane]}:</span>
                  <span>{metadata.slice_data[plane].num_slices}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NiftiViewer; 