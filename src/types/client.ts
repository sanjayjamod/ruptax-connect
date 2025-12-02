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
  headMasterPlace: string;
  annualIncome: string;
  occupation: string;
  assessmentYear: string;
  formStatus: 'pending' | 'completed' | 'submitted';
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
  headMasterPlace: string;
  annualIncome: string;
  occupation: string;
  assessmentYear: string;
}
