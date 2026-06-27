'use client';

import { useState, useRef } from 'react';
import { uploadToSupabaseStorage, savePhotoToDatabase } from '@/lib/supabase-media';
import { formatBytes, resizeImageFile } from '@/lib/client-image-resize';

interface PhotoUploadProps {
  postId?: string;
  uploaderId?: string;
  onUploadComplete?: (photo: any) => void;
}

export default function PhotoUpload({ postId, uploaderId, onUploadComplete }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resizeSummary, setResizeSummary] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (e.g., 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError(null);
    setResizeSummary(null);
    setProgress(0);

    try {
      // Step 1: Resize before upload so mobile photos do not upload at full camera size.
      setProgress(25);
      const resizedImage = await resizeImageFile(file);
      setResizeSummary(
        resizedImage.resized
          ? `Resized to ${resizedImage.width}x${resizedImage.height}: ${formatBytes(resizedImage.originalBytes)} -> ${formatBytes(resizedImage.resizedBytes)}`
          : `Image kept at original size: ${formatBytes(resizedImage.originalBytes)}`
      );

      // Step 2: Upload to Supabase storage
      setProgress(50);
      const uploadResult = await uploadToSupabaseStorage(resizedImage.file);
      
      // Step 3: Save to database
      setProgress(75);
      const dbResult = await savePhotoToDatabase({
        ...uploadResult,
        caption: file.name,
        postId,
        uploaderId,
      });

      setProgress(100);
      
      if (onUploadComplete) {
        onUploadComplete(dbResult.photo);
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

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
        id="photo-upload"
      />
      
      <label
        htmlFor="photo-upload"
        className={`cursor-pointer ${uploading ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
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

