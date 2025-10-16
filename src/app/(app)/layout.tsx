'use client';
import {
  FileText,
  LayoutDashboard,
  Image as ImageIcon,
  PenSquare,
  Package,
  PlusCircle,
  FileUp,
  Archive,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/logo';
import { useAppState } from '@/context/app-provider';
import { AddDocumentDialog } from '@/components/add-document-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state } = useAppState();

  const defaultDocuments = state.documents.filter((d) => !d.isCustom);
  const customDocuments = state.documents.filter((d) => d.isCustom);

  return (
    <SidebarProvider>
      <Sidebar className="border-sidebar-border">
        <SidebarContent>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Logo className="size-8 text-primary" />
              <div className="flex flex-col">
                <h2 className="font-headline text-lg font-semibold tracking-tighter text-primary">
                  Digitizer Pro
                </h2>
              </div>
            </div>
          </SidebarHeader>

          <ScrollArea className="flex-grow">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/dashboard'}
                >
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/processed-documents'}
                >
                  <Link href="/processed-documents">
                    <Archive />
                    Processed Documents
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <SidebarGroup>
              <SidebarGroupLabel>Documents</SidebarGroupLabel>
              <SidebarMenu>
                {defaultDocuments.map((doc) => (
                  <SidebarMenuItem key={doc.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/documents/${doc.id}`}
                    >
                      <Link href={`/documents/${doc.id}`}>
                        <FileText />
                        {doc.name}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                 {customDocuments.map((doc) => (
                  <SidebarMenuItem key={doc.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/documents/${doc.id}`}
                    >
                      <Link href={`/documents/${doc.id}`}>
                        <FileText />
                        {doc.name}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                 <SidebarMenuItem>
                    <AddDocumentDialog />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Assets</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === '/photo-editor'}
                        >
                        <Link href="/photo-editor">
                            <ImageIcon />
                            Photograph
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === '/signature-editor'}
                        >
                        <Link href="/signature-editor">
                            <PenSquare />
                            Signature
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Tools</SidebarGroupLabel>
              <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === '/batch-upload'}
                        >
                        <Link href="/batch-upload">
                            <FileUp />
                            Batch Upload
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </ScrollArea>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <h1 className="font-headline text-xl font-semibold">
            {
              // Simple logic to derive title from pathname
              pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard'
            }
          </h1>
          <div>
            {/* Can add user menu or actions here */}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
