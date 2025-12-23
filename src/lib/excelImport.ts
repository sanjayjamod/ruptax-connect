// Excel/HTML Table Import Utility for Teacher Data

import * as XLSX from 'xlsx';
import { ClientFormData } from "@/types/client";

interface TeacherRow {
  kram: string;
  pagarSchool: string;
  schoolName: string;
  teacherNameEn: string;
  teacherCode: string;
  teacherNameGu: string;
  gender: string;
  designation: string;
  mobile: string;
  pagarType: string;
  email: string;
  pfNumber: string;
  bankAcNo: string;
  bankName: string;
  ifscCode: string;
  societyLoanNo: string;
  panNo: string;
  aadharNo: string;
  voterId: string;
  dateOfBirth: string;
  joinDate: string;
  districtTransfer: string;
  schoolJoinDate: string;
  fullPagar: string;
  higherPayScale: string;
  basic6Pay: string;
  basic7Pay: string;
  caste: string;
  qualification: string;
  specialQualification: string;
  teachingClass: string;
  recruitment: string;
}

// Parse Excel file (.xlsx, .xls, .xlsm)
export const parseExcelFile = async (file: File): Promise<TeacherRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        
        const teachers: TeacherRow[] = [];
        
        // Skip header row (index 0)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length < 10) continue;
          
          const getCellText = (index: number) => String(row[index] || '').trim();
          
          const teacher: TeacherRow = {
            kram: getCellText(0),
            pagarSchool: getCellText(1),
            schoolName: getCellText(2),
            teacherNameEn: getCellText(3),
            teacherCode: getCellText(4),
            teacherNameGu: getCellText(5),
            gender: getCellText(6),
            designation: getCellText(7),
            mobile: getCellText(8),
            pagarType: getCellText(9),
            email: getCellText(10),
            pfNumber: getCellText(11),
            bankAcNo: getCellText(12),
            bankName: getCellText(13),
            ifscCode: getCellText(14),
            societyLoanNo: getCellText(15),
            panNo: getCellText(16),
            aadharNo: getCellText(17),
            voterId: getCellText(18),
            dateOfBirth: getCellText(19),
            joinDate: getCellText(20),
            districtTransfer: getCellText(21),
            schoolJoinDate: getCellText(22),
            fullPagar: getCellText(23),
            higherPayScale: getCellText(24),
            basic6Pay: getCellText(27),
            basic7Pay: getCellText(28),
            caste: getCellText(29),
            qualification: getCellText(30),
            specialQualification: getCellText(31),
            teachingClass: getCellText(32),
            recruitment: getCellText(33),
          };
          
          // Only add if kram (serial number) exists and looks like a number
          if (teacher.kram && /^\d+$/.test(teacher.kram)) {
            teachers.push(teacher);
          }
        }
        
        resolve(teachers);
      } catch (error) {
        reject(new Error('Failed to parse Excel file: ' + (error as Error).message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

// Parse HTML table from Excel export
export const parseTeacherHTML = (htmlContent: string): TeacherRow[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const rows = doc.querySelectorAll('tr');
  
  const teachers: TeacherRow[] = [];
  
  // Skip header row (index 0)
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll('td, th');
    if (cells.length < 10) continue;
    
    const getCellText = (index: number) => cells[index]?.textContent?.trim() || '';
    
    const teacher: TeacherRow = {
      kram: getCellText(0),
      pagarSchool: getCellText(1),
      schoolName: getCellText(2),
      teacherNameEn: getCellText(3),
      teacherCode: getCellText(4),
      teacherNameGu: getCellText(5),
      gender: getCellText(6),
      designation: getCellText(7),
      mobile: getCellText(8),
      pagarType: getCellText(9),
      email: getCellText(10),
      pfNumber: getCellText(11),
      bankAcNo: getCellText(12),
      bankName: getCellText(13),
      ifscCode: getCellText(14),
      societyLoanNo: getCellText(15),
      panNo: getCellText(16),
      aadharNo: getCellText(17),
      voterId: getCellText(18),
      dateOfBirth: getCellText(19),
      joinDate: getCellText(20),
      districtTransfer: getCellText(21),
      schoolJoinDate: getCellText(22),
      fullPagar: getCellText(23),
      higherPayScale: getCellText(24),
      basic6Pay: getCellText(27),
      basic7Pay: getCellText(28),
      caste: getCellText(29),
      qualification: getCellText(30),
      specialQualification: getCellText(31),
      teachingClass: getCellText(32),
      recruitment: getCellText(33),
    };
    
    // Only add if kram (serial number) exists and looks like a number
    if (teacher.kram && /^\d+$/.test(teacher.kram)) {
      teachers.push(teacher);
    }
  }
  
  return teachers;
};

// Convert teacher row to client form data
export const teacherToClientFormData = (teacher: TeacherRow): ClientFormData => {
  // Determine Gujarati designation
  const getGujaratiDesignation = (eng: string): string => {
    const lower = eng.toLowerCase();
    if (lower.includes('principal') || lower.includes('head')) return 'આચાર્ય';
    if (lower.includes('assistant') || lower.includes('ass.')) return 'મદદનીશ શિક્ષક';
    if (lower.includes('senior')) return 'વરિષ્ઠ શિક્ષક';
    return 'શિક્ષક';
  };

  return {
    enterNo: teacher.kram,
    name: teacher.teacherNameEn,
    nameGujarati: teacher.teacherNameGu,
    schoolName: teacher.schoolName,
    schoolNameGujarati: teacher.pagarSchool,
    designation: teacher.designation,
    designationGujarati: getGujaratiDesignation(teacher.designation),
    schoolAddress: `${teacher.pagarSchool}`,
    addressGujarati: teacher.pagarSchool,
    panNo: teacher.panNo,
    bankAcNo: teacher.bankAcNo,
    ifscCode: teacher.ifscCode,
    aadharNo: teacher.aadharNo,
    dateOfBirth: teacher.dateOfBirth,
    mobileNo: teacher.mobile,
    email: teacher.email,
    payCenterName: teacher.pagarSchool,
    payCenterAddress: teacher.pagarSchool,
    place: teacher.schoolName.split(' ')[0] || '',
    tdo: '',
    headMasterPlace: '',
    annualIncome: '',
    occupation: 'Teacher',
    assessmentYear: '2026-2027',
  };
};

// Import teachers from Excel file
export const importTeachersFromExcel = async (file: File): Promise<ClientFormData[]> => {
  const teachers = await parseExcelFile(file);
  return teachers.map(teacherToClientFormData);
};

// Import teachers from HTML content
export const importTeachersFromHTML = (htmlContent: string): ClientFormData[] => {
  const teachers = parseTeacherHTML(htmlContent);
  return teachers.map(teacherToClientFormData);
};

// Read file as text
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Main import function - handles both Excel and HTML files
export const importTeachersFromFile = async (file: File): Promise<ClientFormData[]> => {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.xlsm')) {
    return importTeachersFromExcel(file);
  } else if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
    const htmlContent = await readFileAsText(file);
    return importTeachersFromHTML(htmlContent);
  } else {
    throw new Error('Unsupported file format. Please use .xlsx, .xls, .xlsm, or .html files.');
  }
};
