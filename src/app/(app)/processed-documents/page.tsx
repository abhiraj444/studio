'use client';
import { useAppState } from '@/context/app-provider';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight, Info } from 'lucide-react';
import Image from 'next/image';

export default function ProcessedDocumentsPage() {
  const { state } = useAppState();

  const processedDocuments = state.documents.filter(doc => doc.hasBeenProcessed);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processed Documents</CardTitle>
        <CardDescription>
          View all the documents that have had details extracted.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {processedDocuments.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {processedDocuments.map(doc => (
              <Link href={`/processed-documents/${doc.id}`} key={doc.id}>
                <Card className="group h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                  {doc.imageDataUri ? (
                    <div className="relative h-40 w-full">
                      <Image
                        src={doc.imageDataUri}
                        alt={doc.name}
                        width={400}
                        height={225}
                        objectFit="cover"
                        className="transition-transform group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center bg-muted">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{doc.name}</h3>
                     <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                        <span>View Summary</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-20 text-center">
            <Info className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Processed Documents</h3>
            <p className="text-muted-foreground">
              Extract details from a document to see it here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
