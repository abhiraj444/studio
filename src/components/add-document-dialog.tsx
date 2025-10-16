'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppState } from '@/context/app-provider';
import type { Document } from '@/lib/definitions';
import { PlusCircle } from 'lucide-react';

export function AddDocumentDialog() {
  const [open, setOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const { addDocument } = useAppState();
  const router = useRouter();

  const handleAddDocument = () => {
    if (docName.trim()) {
      const slug = `custom-${Date.now()}`;
      const newDoc: Document = {
        id: slug,
        name: docName.trim(),
        fields: [],
        isCustom: true,
      };
      addDocument(newDoc);
      setOpen(false);
      setDocName('');
      router.push(`/documents/${slug}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Custom Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Custom Document</DialogTitle>
          <DialogDescription>
            Name your new document. You can add fields after it's created.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Driving License"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddDocument}>Create Document</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
