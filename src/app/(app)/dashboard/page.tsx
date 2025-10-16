'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';
import { useAppState } from '@/context/app-provider';
import { Skeleton } from '@/components/ui/skeleton';

const featureCards = [
  {
    title: 'Manage Documents',
    href: '/documents/aadhar-card',
    imageId: 'dashboard-documents',
  },
  {
    title: 'Edit Photograph',
    href: '/photo-editor',
    imageId: 'dashboard-photo',
  },
  {
    title: 'Enhance Signature',
    href: '/signature-editor',
    imageId: 'dashboard-signature',
  },
  {
    title: 'Batch Process',
    href: '/batch-upload',
    imageId: 'dashboard-batch',
  },
];

export default function DashboardPage() {
  const { isInitialized } = useAppState();

  if (!isInitialized) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-8 w-3/4" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Welcome to Document Digitizer Pro
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your one-stop solution for preparing documents for government exams.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {featureCards.map((feature) => {
          const placeholder = PlaceHolderImages.find(
            (p) => p.id === feature.imageId
          );
          return (
            <Link href={feature.href} key={feature.title} className="group">
              <Card className="h-full overflow-hidden transition-all group-hover:shadow-lg group-hover:-translate-y-1">
                <CardHeader className="relative h-40 w-full p-0">
                  {placeholder && (
                    <Image
                      src={placeholder.imageUrl}
                      alt={placeholder.description}
                      fill
                      style={{ objectFit: 'cover' }}
                      data-ai-hint={placeholder.imageHint}
                      className="transition-transform group-hover:scale-105"
                    />
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="flex items-center justify-between font-headline text-lg">
                    {feature.title}
                    <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </CardTitle>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
