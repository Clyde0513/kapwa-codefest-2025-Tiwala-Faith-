'use client';

import { useState, useRef } from 'react';
import { uploadToSupabaseStorage, savePhotoToDatabase, saveVideoToDatabase } from '../lib/supabase-media';
import { formatBytes, resizeImageFile } from '../lib/client-image-resize';

interface MediaUploadProps {
  postId?: string;
  uploaderId?: string;
  allowedTypes?: ('image' | 'video')[];  // Default: both
  onUploadComplete?: (media: any) => void;
}

export default function MediaUpload({ 
  postId, 
  uploaderId, 
  allowedTypes = ['image', 'video'], 
  onUploadComplete 
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resizeSummary, setResizeSummary] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Determine file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      setError('Please select an image or video file');
      return;
    }

    // Check if file type is allowed
    if (isImage && !allowedTypes.includes('image')) {
      setError('Image uploads are not allowed');
      return;
    }
    
    if (isVideo && !allowedTypes.includes('video')) {
      setError('Video uploads are not allowed');
      return;
    }

    // Validate file size (50MB limit for videos, 10MB for images)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size must be less than ${isVideo ? '50MB' : '10MB'}`);
      return;
    }

    setUploading(true);
    setError(null);
    setResizeSummary(null);
    setProgress(0);

    try {
      // Step 1: Resize images before upload; videos are uploaded as-is.
      setProgress(25);
      const uploadFile = isImage ? await resizeImageFile(file) : null;
      const fileToUpload = uploadFile?.file || file;

      if (uploadFile) {
        setResizeSummary(
          uploadFile.resized
            ? `Resized to ${uploadFile.width}x${uploadFile.height}: ${formatBytes(uploadFile.originalBytes)} -> ${formatBytes(uploadFile.resizedBytes)}`
            : `Image kept at original size: ${formatBytes(uploadFile.originalBytes)}`
        );
      }

      // Step 2: Upload to Supabase storage
      setProgress(50);
      const uploadResult = await uploadToSupabaseStorage(fileToUpload, isVideo ? 'video' : 'image');
      
      // Step 3: Save to database
      setProgress(75);
      const dbResult = isImage 
        ? await savePhotoToDatabase({
            ...uploadResult,
            caption: file.name,
            postId,
            uploaderId,
          })
        : await saveVideoToDatabase({
            ...uploadResult,
            caption: file.name,
            postId,
            uploaderId,
          });

      setProgress(100);
      
      if (onUploadComplete) {
        onUploadComplete(dbResult.media);
      }

      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // Generate accept attribute for file input
  const getAcceptTypes = () => {
    const types = [];
    if (allowedTypes.includes('image')) {
      types.push('image/*');
    }
    if (allowedTypes.includes('video')) {
      types.push('video/*');
    }
    return types.join(',');
  };

  // Generate help text
  const getHelpText = () => {
    if (allowedTypes.length === 2) {
      return 'Images (PNG, JPG, GIF up to 10MB) and Videos (MP4, MOV, etc. up to 50MB)';
    } else if (allowedTypes.includes('image')) {
      return 'PNG, JPG, GIF up to 10MB';
    } else if (allowedTypes.includes('video')) {
      return 'MP4, MOV, WebM up to 50MB';
    }
    return '';
  };

  const getIconSvg = () => {
    if (allowedTypes.length === 2) {
      // Mixed media icon
      return (
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7ZM9 8H15V16L12.5 13.5L10.5 15.5L9 14V8Z" />
        </svg>
      );
    } else if (allowedTypes.includes('video')) {
      // Video icon
      return (
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    } else {
      // Image icon
      return (
        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptTypes()}
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
        id="media-upload"
      />
      
      <label
        htmlFor="media-upload"
        className={`cursor-pointer ${uploading ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <div className="space-y-2">
          {getIconSvg()}
          <div className="text-sm text-gray-600">
            {uploading ? (
              <span>Uploading... {progress}%</span>
            ) : (
              <span>
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>{' '}
                or drag and drop
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">{getHelpText()}</p>
        </div>
      </label>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {resizeSummary && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">{resizeSummary}</p>
        </div>
      )}

      {uploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
