'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import imageCompression from 'browser-image-compression';

type ImageUploadProps = {
  bucket: 'gallery-images' | 'leader-photos';
  onUploadComplete: (url: string) => void;
  currentImage?: string;
  label?: string;
  accept?: string;
};

export default function ImageUpload({
  bucket,
  onUploadComplete,
  currentImage,
  label = 'Upload Image',
  accept = 'image/*'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [compressionProgress, setCompressionProgress] = useState(0);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setCompressionProgress(0);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Validate file size (max 10MB original)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image must be less than 10MB');
      }

      console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

      // Compression options
      const options = {
        maxSizeMB: 1, // Maximum file size in MB
        maxWidthOrHeight: 1920, // Max width or height
        useWebWorker: true, // Use web worker for better performance
        onProgress: (progress: number) => {
          setCompressionProgress(progress);
        }
      };

      // Compress image
      const compressedFile = await imageCompression(file, options);
      
      console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('Compression ratio:', ((1 - compressedFile.size / file.size) * 100).toFixed(1), '% smaller');

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload compressed file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      onUploadComplete(publicUrl);

    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
      setCompressionProgress(0);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-sm font-bold mb-2 block">{label}</span>
        <div className="relative">
          <input
            type="file"
            accept={accept}
            onChange={uploadImage}
            disabled={uploading}
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-green-500 file:text-black
              hover:file:bg-green-400
              file:cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </label>

      {uploading && (
        <div className="space-y-2">
          <div className="text-sm text-green-500 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {compressionProgress > 0 && compressionProgress < 100 
              ? `Compressing... ${compressionProgress}%` 
              : 'Uploading...'}
          </div>
          
          {/* Progress bar */}
          {compressionProgress > 0 && compressionProgress < 100 && (
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${compressionProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-w-md rounded-lg"
          />
        </div>
      )}
    </div>
  );
}