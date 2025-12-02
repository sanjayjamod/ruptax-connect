import { ClientDocument, ClientProfile } from "@/types/clientFiles";

const DOCUMENTS_KEY = "ruptax_client_documents";
const PROFILES_KEY = "ruptax_client_profiles";

// ============ Profile Picture ============

export const getClientProfile = (clientId: string): ClientProfile | null => {
  const data = localStorage.getItem(PROFILES_KEY);
  const profiles: ClientProfile[] = data ? JSON.parse(data) : [];
  return profiles.find(p => p.clientId === clientId) || null;
};

export const saveProfilePic = (clientId: string, base64Image: string): ClientProfile => {
  const data = localStorage.getItem(PROFILES_KEY);
  const profiles: ClientProfile[] = data ? JSON.parse(data) : [];
  
  const existingIndex = profiles.findIndex(p => p.clientId === clientId);
  const profile: ClientProfile = {
    clientId,
    profilePic: base64Image,
    updatedAt: new Date().toISOString()
  };
  
  if (existingIndex >= 0) {
    profiles[existingIndex] = profile;
  } else {
    profiles.push(profile);
  }
  
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  return profile;
};

export const deleteProfilePic = (clientId: string): boolean => {
  const data = localStorage.getItem(PROFILES_KEY);
  const profiles: ClientProfile[] = data ? JSON.parse(data) : [];
  const filtered = profiles.filter(p => p.clientId !== clientId);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(filtered));
  return true;
};

// ============ Documents ============

export const getClientDocuments = (clientId: string): ClientDocument[] => {
  const data = localStorage.getItem(DOCUMENTS_KEY);
  const documents: ClientDocument[] = data ? JSON.parse(data) : [];
  return documents.filter(d => d.clientId === clientId);
};

export const getDocumentsByYear = (clientId: string, year: string): ClientDocument[] => {
  return getClientDocuments(clientId).filter(d => d.year === year);
};

export const saveDocument = (
  clientId: string, 
  file: { name: string; type: string; size: number; data: string },
  year: string
): ClientDocument => {
  const data = localStorage.getItem(DOCUMENTS_KEY);
  const documents: ClientDocument[] = data ? JSON.parse(data) : [];
  
  const newDoc: ClientDocument = {
    id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    clientId,
    name: file.name,
    type: file.type,
    size: file.size,
    data: file.data,
    uploadedAt: new Date().toISOString(),
    year
  };
  
  documents.push(newDoc);
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
  return newDoc;
};

export const deleteDocument = (docId: string): boolean => {
  const data = localStorage.getItem(DOCUMENTS_KEY);
  const documents: ClientDocument[] = data ? JSON.parse(data) : [];
  const filtered = documents.filter(d => d.id !== docId);
  
  if (filtered.length === documents.length) return false;
  
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(filtered));
  return true;
};

// ============ Password Reset ============

export const resetClientPassword = (
  mobile: string, 
  newPassword: string
): { success: boolean; error?: string } => {
  const STORAGE_KEY = "ruptax_clients";
  const data = localStorage.getItem(STORAGE_KEY);
  const clients = data ? JSON.parse(data) : [];
  
  const index = clients.findIndex((c: any) => c.mobileNo === mobile);
  if (index === -1) {
    return { success: false, error: "Mobile number not registered" };
  }
  
  clients[index].password = newPassword;
  clients[index].updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  
  return { success: true };
};

// ============ File Utils ============

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getAvailableYears = (): string[] => {
  return ['2026-27', '2025-26', '2024-25', '2023-24'];
};
