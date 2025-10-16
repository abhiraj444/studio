export type ExtractedField = {
  key: string;
  value: string;
};

export type Document = {
  id: string;
  name: string;
  fields: ExtractedField[];
  imageDataUri?: string;
  isCustom: boolean;
};

export type Photo = {
  id: string;
  name: string;
  originalUri: string;
  enhancedUri?: string;
  createdAt: string;
};

export type Signature = {
  id: string;
  name: string;
  originalUri: string;
  enhancedUri?: string;
  createdAt: string;
};

export type AppState = {
  documents: Document[];
  photos: Photo[];
  signatures: Signature[];
};

export type AppContextType = {
  state: AppState;
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  addPhoto: (photo: Photo) => void;
  updatePhoto: (id: string, updates: Partial<Photo>) => void;
  addSignature: (signature: Signature) => void;
  updateSignature: (id: string, updates: Partial<Signature>) => void;
  isInitialized: boolean;
};
