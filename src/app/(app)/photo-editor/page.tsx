'use client';

import { useState, ChangeEvent } from 'react';
import { useAppState } from '@/context/app-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { UploadCloud, Wand2, Download, Crop, ImagePlus } from 'lucide-react';
import { generateProfessionalPhoto } from '@/ai/flows/generate-professional-photo';
import { fileToDataUri } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

export default function PhotoEditorPage() {
  const { toast } = useToast();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const dataUri = await fileToDataUri(selectedFile);
      setOriginalImage(dataUri);
      setEnhancedImage(null);
    }
  };

  const handleEnhance = async () => {
    if (!originalImage) return;
    setIsLoading(true);
    setEnhancedImage(null);
    try {
      const result = await generateProfessionalPhoto({ photoDataUri: originalImage });
      setEnhancedImage(result.professionalPhotoDataUri);
      toast({
        title: 'Photo Enhanced',
        description: 'Your professional photo has been generated.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Enhancement Failed',
        description: 'Could not generate a professional photo. Please try another image.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Photo Tools</CardTitle>
          <CardDescription>Upload and enhance your photograph.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
             <Label htmlFor="photo-upload">Upload Photo</Label>
             <Input id="photo-upload" type="file" onChange={handleFileChange} accept="image/*" />
          </div>
          <Button onClick={handleEnhance} disabled={!originalImage || isLoading} className="w-full">
            <Wand2 className="mr-2 h-4 w-4" />
            {isLoading ? 'Enhancing...' : 'Generate Professional Photo'}
          </Button>
          <Separator />
          <div className="space-y-4 rounded-lg border bg-background p-4">
            <h3 className="font-semibold">Manual Adjustments</h3>
             <div className="space-y-2">
                <Label>Dimensions (px)</Label>
                <div className="flex gap-2">
                    <Input placeholder="Width" type="number" />
                    <Input placeholder="Height" type="number" />
                </div>
            </div>
             <div className="space-y-2">
                <Label>File Size (kb)</Label>
                <Input placeholder="e.g., 50" type="number" />
            </div>
             <Button variant="secondary" className="w-full">
                <Crop className="mr-2 h-4 w-4" />
                Apply & Download
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Image Preview</CardTitle>
          <CardDescription>Compare your original and AI-enhanced photos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-center font-medium text-muted-foreground">Original</h3>
              <div className="relative aspect-square w-full rounded-lg border-2 border-dashed bg-muted/50">
                {originalImage ? (
                  <Image src={originalImage} alt="Original" layout="fill" objectFit="contain" className="rounded-lg" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                    <UploadCloud className="mb-2 h-10 w-10" />
                    <p>Upload a photo to begin</p>
                  </div>
                )}
              </div>
               {originalImage && <Button variant="outline" className="w-full"><Download className="mr-2 h-4 w-4"/>Download Original</Button>}
            </div>
            <div className="space-y-2">
                <h3 className="text-center font-medium text-muted-foreground">AI Enhanced</h3>
                <div className="relative aspect-square w-full rounded-lg border-2 border-dashed bg-muted/50">
                    {isLoading && <div className="absolute inset-0 flex items-center justify-center"><Skeleton className="h-full w-full"/></div>}
                    {!isLoading && enhancedImage ? (
                        <Image src={enhancedImage} alt="Enhanced" layout="fill" objectFit="contain" className="rounded-lg" />
                    ) : !isLoading && (
                        <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                            <ImagePlus className="mb-2 h-10 w-10" />
                            <p>Your enhanced photo will appear here</p>
                        </div>
                    )}
                </div>
                {enhancedImage && <Button variant="outline" className="w-full"><Download className="mr-2 h-4 w-4"/>Download Enhanced</Button>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
