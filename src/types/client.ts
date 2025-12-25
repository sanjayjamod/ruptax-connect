export interface Client {
  id: string; // Auto-generated: 202601, 202602, etc.
  enterNo: string;
  name: string;
  nameGujarati: string;
  schoolName: string;
  schoolNameGujarati: string;
  designation: string;
  designationGujarati: string;
  schoolAddress: string;
  addressGujarati: string;
  panNo: string;
  bankAcNo: string;
  ifscCode: string;
  aadharNo: string;
  dateOfBirth: string;
  mobileNo: string;
  email: string;
  payCenterName: string;
  payCenterAddress: string;
  place: string;
  tdo: string;
  tdf: string; // TDO Father name
  headMaster: string; // HEAD MASTER name
  headMasterFather: string; // HEAD MASTER FATHER NAME
  headMasterPlace: string;
  annualIncome: string;
  occupation: string;
  assessmentYear: string;
  formStatus: 'pending' | 'completed' | 'submitted';
  completedAt?: string; // Date when form was completed
  password?: string; // For client login
  createdAt: string;
  updatedAt: string;
}

export interface ClientFormData {
  enterNo: string;
  name: string;
  nameGujarati: string;
  schoolName: string;
  schoolNameGujarati: string;
  designation: string;
  designationGujarati: string;
  schoolAddress: string;
  addressGujarati: string;
  panNo: string;
  bankAcNo: string;
  ifscCode: string;
  aadharNo: string;
  dateOfBirth: string;
  mobileNo: string;
  email: string;
  payCenterName: string;
  payCenterAddress: string;
  place: string;
  tdo: string;
  tdf: string;
  headMaster: string;
  headMasterFather: string;
  headMasterPlace: string;
  annualIncome: string;
  occupation: string;
  assessmentYear: string;
}
