'use client';

import { useState, ChangeEvent } from 'react';
import { useAppState } from '@/context/app-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FileUp, Loader2, CheckCircle, XCircle, File as FileIcon } from 'lucide-react';
import { fileToDataUri } from '@/lib/utils';
import { extractDocumentDetails } from '@/ai/flows/extract-document-details';
import { Progress } from '@/components/ui/progress';
import type { Document, ExtractedField } from '@/lib/definitions';

type FileStatus = 'pending' | 'processing' | 'success' | 'error';

interface FileWithStatus {
  file: File;
  status: FileStatus;
  message?: string;
}

export default function BatchUploadPage() {
  const { addDocument } = useAppState();
  const { toast } = useToast();

  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).map(file => ({ file, status: 'pending' } as FileWithStatus));
      setFiles(selectedFiles);
      setProgress(0);
    }
  };

  const handleProcessAll = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      setFiles(prev => prev.map((f, index) => index === i ? { ...f, status: 'processing' } : f));
      
      const currentFile = files[i].file;
      try {
        const dataUri = await fileToDataUri(currentFile);
        
        const result = await extractDocumentDetails({
            documentDataUri: dataUri,
            documentType: 'Unknown Document',
            customInstructions: 'First, identify the type of document (e.g., "Aadhar Card", "PAN Card"). Then extract all important key-value pairs. The first key in your JSON response must be "documentName" with the identified document type as its value. Ensure other keys are in camelCase.',
        });

        const { documentName, ...details } = result.extractedDetails;

        const newFields: ExtractedField[] = Object.entries(details).map(([key, value]) => ({
          key,
          value: String(value),
        }));
        
        const newDoc: Document = {
          id: `custom-${Date.now()}-${i}`,
          name: String(documentName || `Scanned Document ${i+1}`),
          fields: newFields,
          imageDataUri: dataUri,
          isCustom: true,
        };

        addDocument(newDoc);
        setFiles(prev => prev.map((f, index) => index === i ? { ...f, status: 'success' } : f));
        successCount++;
      } catch (error) {
        console.error(`Failed to process ${currentFile.name}:`, error);
        setFiles(prev => prev.map((f, index) => index === i ? { ...f, status: 'error', message: 'AI extraction failed.' } : f));
      }

      setProgress(((i + 1) / files.length) * 100);
    }

    setIsProcessing(false);
    toast({
        title: 'Batch Processing Complete',
        description: `Successfully processed ${successCount} out of ${files.length} documents.`,
    });
  };

  const getStatusIcon = (status: FileStatus) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <FileIcon className="h-5 w-5 text-muted-foreground" />;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Document Upload</CardTitle>
        <CardDescription>Upload multiple documents at once for automated detail extraction.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row">
            <Input type="file" onChange={handleFileChange} multiple accept="image/*,application/pdf" disabled={isProcessing} />
            <Button onClick={handleProcessAll} disabled={files.length === 0 || isProcessing} className="w-full sm:w-auto">
                <FileUp className="mr-2 h-4 w-4" />
                {isProcessing ? 'Processing...' : 'Process All'}
            </Button>
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground text-center">Processing file {Math.floor(progress / 100 * files.length)} of {files.length}...</p>
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-2 rounded-lg border max-h-96 overflow-y-auto">
            {files.map((fileWithStatus, index) => (
              <div key={index} className="flex items-center justify-between p-3 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                    {getStatusIcon(fileWithStatus.status)}
                    <span className="truncate max-w-[200px] sm:max-w-xs">{fileWithStatus.file.name}</span>
                </div>
                <span className="text-sm text-muted-foreground capitalize">
                  {fileWithStatus.message || fileWithStatus.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
