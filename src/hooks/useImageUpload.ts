import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(async (file: File, productId: string): Promise<string | null> => {
    try {
      setUploading(true);
      setError(null);

      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File must be smaller than 5MB');
      }

      // Create unique file name
      const timestamp = Date.now();
      const ext = file.name.split('.').pop();
      const fileName = `${productId}-${timestamp}.${ext}`;
      const filePath = `product-images/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      if (!publicData?.publicUrl) {
        throw new Error('Failed to generate public URL');
      }

      setUploading(false);
      return publicData.publicUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image';
      setError(message);
      setUploading(false);
      return null;
    }
  }, []);

  const deleteImage = useCallback(async (imageUrl: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Extract file path from URL
      const match = imageUrl.match(/\/storage\/v1\/object\/public\/products\/(.+)/);
      if (!match) {
        return true; // If it's not a storage URL, consider it deleted
      }

      const filePath = match[1];
      const { error: deleteError } = await supabase.storage
        .from('products')
        .remove([filePath]);

      if (deleteError) {
        console.error('Failed to delete image:', deleteError);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error deleting image:', err);
      return false;
    }
  }, []);

  return {
    uploadImage,
    deleteImage,
    uploading,
    error,
  };
}
