'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useAppState } from '@/context/app-provider';
import Image from 'next/image';
import { jsPDF } from 'jspdf';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImagePreviewDialog } from '@/components/image-preview-dialog';
import { AlertCircle, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { processImage } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

export default function DocumentSummaryPage() {
  const { slug } = useParams();
  const { state } = useAppState();
  const { toast } = useToast();

  const document = useMemo(() => state.documents.find(doc => doc.id === slug), [state.documents, slug]);
  const importantFields = useMemo(() => document?.fields.filter(f => f.isImportant) || [], [document]);

  const [downloadFormat, setDownloadFormat] = useState<'jpeg' | 'pdf'>('jpeg');
  const [imageQuality, setImageQuality] = useState(90);
  const [maxSizeKb, setMaxSizeKb] = useState<number | undefined>(100);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!document?.imageDataUri) return;
    setIsDownloading(true);

    try {
      if (downloadFormat === 'pdf') {
        const pdf = new jsPDF();
        const img = new window.Image();
        
        const imgLoadPromise = new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = document.imageDataUri!;
        });
        
        await imgLoadPromise;
        
        // Always convert to JPEG for jsPDF for consistency
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx!.drawImage(img, 0, 0);
        const jpegDataUri = canvas.toDataURL('image/jpeg', 1.0);

        const imgProps = pdf.getImageProperties(jpegDataUri);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgAspectRatio = imgProps.width / imgProps.height;
        const pdfAspectRatio = pdfWidth / pdfHeight;

        let finalPdfWidth, finalPdfHeight;

        if (imgAspectRatio > pdfAspectRatio) {
            finalPdfWidth = pdfWidth;
            finalPdfHeight = pdfWidth / imgAspectRatio;
        } else {
            finalPdfHeight = pdfHeight;
            finalPdfWidth = pdfHeight * imgAspectRatio;
        }

        const x = (pdfWidth - finalPdfWidth) / 2;
        const y = (pdfHeight - finalPdfHeight) / 2;

        pdf.addImage(jpegDataUri, 'JPEG', x, y, finalPdfWidth, finalPdfHeight);
        pdf.save(`${document.name}.pdf`);

      } else {
         const processedBlob = await processImage({
            imageUrl: document.imageDataUri,
            quality: imageQuality / 100,
            maxSizeKb: maxSizeKb,
            format: 'jpeg',
          });

          const url = URL.createObjectURL(processedBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${document.name}.jpg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
           toast({
            title: 'Download Started',
            description: `Image size: ${(processedBlob.size / 1024).toFixed(2)} KB`,
          });
      }
    } catch (error) {
      console.error('Download failed', error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'There was an error preparing your file.',
      });
    } finally {
        setIsDownloading(false);
    }
  };

  if (!document) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertCircle className="text-destructive"/> Document Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The document you are looking for does not exist or has not been processed yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Document</CardTitle>
            </CardHeader>
            <CardContent>
                {document.imageDataUri ? (
                <ImagePreviewDialog imageUrl={document.imageDataUri}>
                    <div className="relative aspect-video w-full cursor-pointer rounded-lg border-2 border-dashed bg-muted/50">
                    <Image src={document.imageDataUri} alt={document.name} layout="fill" objectFit="contain" className="rounded-lg" />
                    </div>
                </ImagePreviewDialog>
                ) : (
                <div className="flex h-40 w-full items-center justify-center bg-muted text-muted-foreground rounded-lg">
                    <FileText className="h-12 w-12" />
                </div>
                )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Download Options</CardTitle>
                <CardDescription>Adjust and download your document.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Format</Label>
                    <Select value={downloadFormat} onValueChange={(value: 'jpeg' | 'pdf') => setDownloadFormat(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="jpeg">JPEG</SelectItem>
                            <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {downloadFormat === 'jpeg' && (
                <>
                  <div className="space-y-2">
                    <Label>Max File Size (KB)</Label>
                    <Input type="number" placeholder="e.g., 100" value={maxSizeKb || ''} onChange={e => setMaxSizeKb(e.target.value ? parseInt(e.target.value) : undefined)}/>
                  </div>
                  <div className="space-y-2">
                    <Label>Quality: {imageQuality}%</Label>
                    <Slider value={[imageQuality]} onValueChange={([val]) => setImageQuality(val)} max={100} step={5} />
                  </div>
                </>
                )}
                
                <Button onClick={handleDownload} disabled={isDownloading || !document.imageDataUri} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    {isDownloading ? 'Processing...' : 'Download'}
                </Button>
            </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>{document.name}</CardTitle>
            <CardDescription>Important details extracted from the document.</CardDescription>
          </CardHeader>
          <CardContent>
            {importantFields.length > 0 ? (
              <dl className="space-y-4">
                {importantFields.map(field => (
                  <div key={field.key} className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 border-b pb-4 last:border-0">
                    <dt className="text-sm font-medium text-muted-foreground capitalize">{field.key.replace(/([A-Z])/g, ' $1')}</dt>
                    <dd className="text-sm text-foreground sm:col-span-2 break-words">
                        {typeof field.value === 'object' ? JSON.stringify(field.value) : String(field.value)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-muted-foreground">No important fields marked for this document.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
