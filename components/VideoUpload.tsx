'use client';

import { useState, useRef } from 'react';
import { uploadToSupabaseStorage, saveVideoToDatabase } from '../lib/supabase-media';

interface VideoUploadProps {
  postId?: string;
  uploaderId?: string;
  onUploadComplete?: (video: any) => void;
}

export default function VideoUpload({ postId, uploaderId, onUploadComplete }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }

    // Validate file size (e.g., 100MB limit for videos)
    if (file.size > 100 * 1024 * 1024) {
      setError('Video file size must be less than 100MB');
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Step 1: Upload to Supabase storage
      setProgress(25);
      const uploadResult = await uploadToSupabaseStorage(file, 'video');
      
      // Step 2: Save to database
      setProgress(75);
      const dbResult = await saveVideoToDatabase({
        ...uploadResult,
        caption: file.name,
        postId,
        uploaderId,
      });

      setProgress(100);
      
      if (onUploadComplete) {
        onUploadComplete(dbResult.video);
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
        accept="video/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
        id="video-upload"
      />
      
      <label
        htmlFor="video-upload"
        className={`cursor-pointer ${uploading ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
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
          <p className="text-xs text-gray-500">MP4, MOV, AVI up to 100MB</p>
        </div>
      </label>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
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

