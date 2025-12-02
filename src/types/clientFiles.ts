export interface ClientDocument {
  id: string;
  clientId: string;
  name: string;
  type: string; // MIME type
  size: number;
  data: string; // Base64
  uploadedAt: string;
  year: string;
}

export interface ClientProfile {
  clientId: string;
  profilePic?: string; // Base64 image
  updatedAt: string;
}

export interface FormDownload {
  clientId: string;
  year: string;
  formType: 'all' | 'pagar' | 'declaration' | 'aavakveraA' | 'aavakveraB' | 'form16A' | 'form16B';
}
