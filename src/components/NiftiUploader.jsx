import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const NiftiUploader = ({ onUploadSuccess, onUploadError }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Kiểm tra file extension
    if (!file.name.endsWith('.nii') && !file.name.endsWith('.nii.gz')) {
      onUploadError('Chỉ hỗ trợ file NIfTI (.nii, .nii.gz)');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-nifti', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setUploadResult(result);
        onUploadSuccess(result);
      } else {
        throw new Error(result.message || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload error:', error);
      onUploadError(error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onUploadSuccess, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': ['.nii', '.nii.gz'],
      'application/gzip': ['.nii.gz']
    },
    maxFiles: 1,
    disabled: uploading
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-gray-600">Đang upload và xử lý file...</p>
              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Thả file NIfTI tại đây' : 'Upload file NIfTI'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Kéo thả hoặc click để chọn file .nii hoặc .nii.gz
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {uploadResult && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">
                Upload thành công!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p><strong>File:</strong> {uploadResult.filename}</p>
                <p><strong>Kích thước:</strong> {uploadResult.shape.join(' × ')}</p>
                <p><strong>Số slices:</strong> {uploadResult.num_slices}</p>
                <p><strong>Spacing:</strong> {uploadResult.spacing.map(s => s.toFixed(2)).join(' × ')} mm</p>
                <p><strong>Giá trị:</strong> {uploadResult.min_value.toFixed(2)} → {uploadResult.max_value.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NiftiUploader; 