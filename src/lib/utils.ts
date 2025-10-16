import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              return reject(new Error('Failed to get canvas context'));
            }
            // Fill background with white. This is important for transparent images (PNGs)
            // to ensure they have a solid background when converted to JPEG.
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            // Always convert to JPEG for standardization
            resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = (error) => {
            // This might happen for PDFs or other non-image files
            // For now, we reject, but a more robust solution could handle PDFs differently
            // if direct PDF-to-image conversion on the client was needed.
            // For this app, we will assume PDF content is extracted by AI and we don't need a preview.
            // Let's create a placeholder data URI for PDFs.
            if (file.type.includes('pdf')) {
               // We'll pass the base64 of the PDF to the AI, so we'll resolve with the reader result
               resolve(event.target?.result as string);
            } else {
               reject(error);
            }
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
      
      // If converting to JPEG, fill background with white
      if (format === 'jpeg') {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

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
