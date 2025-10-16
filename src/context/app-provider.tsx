'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { AppState, AppContextType, Document, Photo, Signature } from '@/lib/definitions';
import { useRouter } from 'next/navigation';

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  documents: [
    { id: 'aadhar-card', name: 'Aadhar Card', fields: [], isCustom: false },
    { id: 'pan-card', name: 'PAN Card', fields: [], isCustom: false },
    { id: 'voter-id', name: 'Voter ID', fields: [], isCustom: false },
    { id: 'class-10', name: 'Class 10th Marksheet', fields: [], isCustom: false },
    { id: 'class-12', name: 'Class 12th Marksheet', fields: [], isCustom: false },
    { id: 'graduation', name: 'Graduation Marksheet', fields: [], isCustom: false },
  ],
  photos: [],
  signatures: [],
};

const STORAGE_KEY = 'document-digitizer-pro-state';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedState = localStorage.getItem(STORAGE_KEY);
      if (storedState) {
        const parsedState: AppState = JSON.parse(storedState);
        // Merge with initial state to ensure all default documents are present
        const mergedDocs = initialState.documents.map(initDoc => {
          const storedDoc = parsedState.documents.find(d => d.id === initDoc.id);
          return storedDoc ? { ...initDoc, ...storedDoc } : initDoc;
        });
        // Get all unique custom documents from storage
        const storedCustomDocs = parsedState.documents.filter(d => d.isCustom && !initialState.documents.some(id => id.id === d.id));
        
        setState({
            ...initialState, // Start with a clean slate of photos and signatures from initial
            ...parsedState, // Then layer on stored photos and signatures
            documents: [...mergedDocs, ...storedCustomDocs],
        });
      } else {
        setState(initialState);
      }
    } catch (error) {
      console.error('Failed to load state from localStorage:', error);
      setState(initialState);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save state to localStorage:', error);
      }
    }
  }, [state, isInitialized]);

  const addDocument = (doc: Document) => {
    setState(prevState => ({
      ...prevState,
      documents: [...prevState.documents, doc],
    }));
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setState(prevState => ({
      ...prevState,
      documents: prevState.documents.map(doc =>
        doc.id === id ? { ...doc, ...updates } : doc
      ),
    }));
  };
  
  const addPhoto = (photo: Photo) => {
    setState(prevState => ({
      ...prevState,
      photos: [...prevState.photos, photo],
    }));
  };

  const updatePhoto = (id: string, updates: Partial<Photo>) => {
    setState(prevState => ({
        ...prevState,
        photos: prevState.photos.map(p => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }

  const addSignature = (signature: Signature) => {
    setState(prevState => ({
        ...prevState,
        signatures: [...prevState.signatures, signature],
    }));
  };

  const updateSignature = (id: string, updates: Partial<Signature>) => {
    setState(prevState => ({
        ...prevState,
        signatures: prevState.signatures.map(s => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }

  const resetState = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setState(initialState);
      // Redirect to dashboard to ensure a clean state visually
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to reset state:', error);
    }
  };


  return (
    <AppContext.Provider
      value={{ state, addDocument, updateDocument, addPhoto, updatePhoto, addSignature, updateSignature, resetState, isInitialized }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}
