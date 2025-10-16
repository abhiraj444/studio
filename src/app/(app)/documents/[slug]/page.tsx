'use client';

import { useState, useMemo, ChangeEvent } from 'react';
import { useAppState } from '@/context/app-provider';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { fileToDataUri } from '@/lib/utils';
import { extractDocumentDetails } from '@/ai/flows/extract-document-details';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { UploadCloud, FileJson, Download, Share2, AlertCircle } from 'lucide-react';
import type { ExtractedField } from '@/lib/definitions';

export default function DocumentPage() {
  const { slug } = useParams();
  const { state, updateDocument, isInitialized } = useAppState();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const document = useMemo(
    () => state.documents.find((doc) => doc.id === slug),
    [state.documents, slug]
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleExtract = async () => {
    if (!file || !document) return;
    setIsLoading(true);
    try {
      const dataUri = await fileToDataUri(file);
      updateDocument(document.id, { imageDataUri: dataUri });

      const result = await extractDocumentDetails({
        documentDataUri: dataUri,
        documentType: document.name,
        customInstructions: 'Extract all key-value pairs from the document. Ensure keys are in camelCase. For example, "Aadhar Number" should be "aadharNumber".',
      });

      const newFields: ExtractedField[] = Object.entries(
        result.extractedDetails
      ).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      updateDocument(document.id, { fields: newFields });
      toast({
        title: 'Extraction Complete',
        description: `Successfully extracted ${newFields.length} fields from ${document.name}.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Extraction Failed',
        description: 'Could not extract details from the document. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    if (!document) return;
    const updatedFields = document.fields.map((field) =>
      field.key === key ? { ...field, value } : field
    );
    updateDocument(document.id, { fields: updatedFields });
  };
  
  if (!isInitialized) {
    return (
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="h-[500px] w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }
  
  if (!document) {
    return (
       <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertCircle className="text-destructive"/> Document Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The document you are looking for does not exist.</p>
        </CardContent>
      </Card>
    );
  }

  const renderedImage = file ? URL.createObjectURL(file) : document.imageDataUri;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Document Image</CardTitle>
          <CardDescription>Upload your document image here to start extraction.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-video w-full rounded-lg border-2 border-dashed bg-muted/50">
            {renderedImage ? (
              <Image src={renderedImage} alt={document.name} layout="fill" objectFit="contain" className="rounded-lg"/>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                <UploadCloud className="mb-2 h-10 w-10" />
                <p>Upload an image to preview it here</p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input type="file" onChange={handleFileChange} accept="image/*,application/pdf" />
            <Button onClick={handleExtract} disabled={!file || isLoading} className="w-full sm:w-auto">
              <FileJson className="mr-2 h-4 w-4" />
              {isLoading ? 'Extracting...' : 'Extract Details'}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Extracted Details</CardTitle>
          <CardDescription>View and edit the details extracted from your document.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : document.fields.length > 0 ? (
            <div className="max-h-[400px] space-y-4 overflow-y-auto pr-2">
            {document.fields.map(({ key, value }) => (
              <div key={key} className="grid gap-2">
                <Label htmlFor={key} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                <Input
                  id={key}
                  value={value}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                />
              </div>
            ))}
            </div>
          ) : (
             <div className="flex h-[200px] flex-col items-center justify-center text-center text-muted-foreground">
                <p>No details extracted yet.</p>
                <p className="text-sm">Upload a document and click "Extract Details".</p>
            </div>
          )}
           {document.fields.length > 0 && (
            <div className="flex gap-2 pt-4">
                <Button variant="outline"><Download className="mr-2 h-4 w-4"/> Download</Button>
                <Button variant="outline"><Share2 className="mr-2 h-4 w-4"/> Share</Button>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
