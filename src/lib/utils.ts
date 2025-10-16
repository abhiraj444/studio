import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // For PDFs, we can't show a direct preview, so we return a placeholder or handle it differently.
    // For this app, we'll assume PDF processing happens on the backend and we just need the data URI for upload.
    if (file.type.includes('pdf')) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
    }
    
    // For images, create a jpeg version for preview.
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx!.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg'));
        };
        img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface ProcessImageOptions {
  imageUrl: string;
  width?: number;
  height?: number;
  quality?: number;
  maxSizeKb?: number;
  format: 'jpeg' | 'png' | 'webp';
}

export const processImage = ({
  imageUrl,
  width,
  height,
  quality = 0.9,
  maxSizeKb,
  format = 'jpeg',
}: ProcessImageOptions): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context not found');

      let targetWidth = width || img.width;
      let targetHeight = height || img.height;
      
      if (width && !height) {
        targetHeight = img.height * (width / img.width);
      } else if (!width && height) {
        targetWidth = img.width * (height / img.height);
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const mimeType = `image/${format}`;

      const processToBlob = (currentQuality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject('Canvas toBlob failed');
            
            if (maxSizeKb && blob.size / 1024 > maxSizeKb && currentQuality > 0.1) {
              // If size is too large, reduce quality and try again
              processToBlob(currentQuality - 0.1);
            } else {
              resolve(blob);
            }
          },
          mimeType,
          currentQuality
        );
      }
      
      processToBlob(quality);
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
};
