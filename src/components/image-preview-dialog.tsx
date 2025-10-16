'use client';

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import Image from 'next/image';

interface ImagePreviewDialogProps {
  imageUrl: string;
  children: React.ReactNode;
}

export function ImagePreviewDialog({ imageUrl, children }: ImagePreviewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl p-2 sm:p-4">
        <div className="relative aspect-[16/9] w-full">
          <Image src={imageUrl} alt="Image preview" layout="fill" objectFit="contain" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
