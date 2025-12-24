// Excel/HTML Table Import Utility for Teacher Data

import * as XLSX from 'xlsx';
import { ClientFormData } from "@/types/client";

interface TeacherRow {
  kram: string;
  pagarSchool: string;
  headMaster: string;
  headMasterFather: string;
  headMasterPlace: string;
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
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][];
        
        const teachers: TeacherRow[] = [];
        
        console.log('Excel rows found:', jsonData.length);
        console.log('First data row:', jsonData[1]);
        
        // Skip header row (index 0)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length < 10) continue;
          
          const getCellText = (index: number) => {
            const val = row[index];
            if (val === null || val === undefined) return '';
            // Handle scientific notation for numbers like Aadhar/Mobile
            if (typeof val === 'number') {
              return String(Math.round(val));
            }
            return String(val).trim();
          };
          
          // Correct column mapping based on actual Excel structure:
          // 0: ક્રમ (Serial Number)
          // 1: પગાર શાળા (Pay School)
          // 2: HEAD MASTER
          // 3: HEAD MASTER FATHER NAME
          // 4: HEAD MASTER PLACE
          // 5: શાળા નું નામ (School Name)
          // 6: સરનામું (Address)
          // 7: ગામ નું નામ (Village Name)
          // 8: શિક્ષક નું નામ (અંગ્રેજી) (Teacher Name English)
          // 9: શિક્ષક કોડ (Teacher Code)
          // 10: શિક્ષક નું નામ (ગુજરાતી) (Teacher Name Gujarati)
          // 11: જાતિ (Gender)
          // 12: હોદ્દો (Designation)
          // 13: મોબાઈલ (Mobile)
          // 14: પગાર નો પ્રકાર (Pay Type)
          // 15: ઈ-મેલ (Email)
          // 16: પ્રો.ફંડ નંબર (PF Number)
          // 17: બઁક અકાઉન્ટ નંબર (Bank Account)
          // 18: બેંક નું નામ (Bank Name)
          // 19: I.F.S.C કોડ (IFSC)
          // 20: મંડળી લોન નંબર (Society Loan)
          // 21: પાન નંબર (PAN)
          // 22: આધાર કાર્ડ (Aadhar)
          // 23: ચુટણી કાર્ડ (Voter ID)
          // 24: જન્મ તારીખ (DOB)
          // 25: ખાતા માં દાખલ (Join Date)
          // 26: જિલ્લા ફેરબદલ (District Transfer)
          // 27: શાળા માં દાખલ (School Join Date)
          // 28: ફુલ પગાર (Full Pay)
          // 29: ઉચ્ચતર પગાર ધોરણ (Higher Pay Scale)
          // 30-32: મળ્યા તારીખ 1,2,3
          // 33: ૬-પે બેઝિક (6th Pay Basic)
          // 34: ૭-પે બેઝિક (7th Pay Basic)
          // 35: જ્ઞાતિ (Caste)
          // 36: શૈક્ષણિક લાયકાત (Qualification)
          // 37: વિશેષ લાયકાત (Special Qualification)
          // 38: ધોરણ માં શીખવે (Teaching Class)
          // 39: ભરતી (Recruitment)
          
          const teacher: TeacherRow = {
            kram: getCellText(0),
            pagarSchool: getCellText(1),
            headMaster: getCellText(2),
            headMasterFather: getCellText(3),
            headMasterPlace: getCellText(4),
            schoolName: getCellText(5),
            teacherNameEn: getCellText(8),
            teacherCode: getCellText(9),
            teacherNameGu: getCellText(10),
            gender: getCellText(11),
            designation: getCellText(12),
            mobile: getCellText(13),
            pagarType: getCellText(14),
            email: getCellText(15),
            pfNumber: getCellText(16),
            bankAcNo: getCellText(17)?.replace(/^'/, ''),
            bankName: getCellText(18),
            ifscCode: getCellText(19),
            societyLoanNo: getCellText(20),
            panNo: getCellText(21),
            aadharNo: getCellText(22),
            voterId: getCellText(23),
            dateOfBirth: getCellText(24),
            joinDate: getCellText(25),
            districtTransfer: getCellText(26),
            schoolJoinDate: getCellText(27),
            fullPagar: getCellText(28),
            higherPayScale: getCellText(29),
            basic6Pay: getCellText(33),
            basic7Pay: getCellText(34),
            caste: getCellText(35),
            qualification: getCellText(36),
            specialQualification: getCellText(37),
            teachingClass: getCellText(38),
            recruitment: getCellText(39),
          };
          
          // Add if kram exists (allow any non-empty value)
          if (teacher.kram && teacher.teacherNameEn) {
            teachers.push(teacher);
          }
        }
        
        console.log('Teachers parsed:', teachers.length);
        resolve(teachers);
      } catch (error) {
        console.error('Excel parsing error:', error);
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
      headMaster: getCellText(2),
      headMasterFather: getCellText(3),
      headMasterPlace: getCellText(4),
      schoolName: getCellText(5),
      teacherNameEn: getCellText(6),
      teacherCode: getCellText(7),
      teacherNameGu: getCellText(8),
      gender: getCellText(9),
      designation: getCellText(10),
      mobile: getCellText(11),
      pagarType: getCellText(12),
      email: getCellText(13),
      pfNumber: getCellText(14),
      bankAcNo: getCellText(15),
      bankName: getCellText(16),
      ifscCode: getCellText(17),
      societyLoanNo: getCellText(18),
      panNo: getCellText(19),
      aadharNo: getCellText(20),
      voterId: getCellText(21),
      dateOfBirth: getCellText(22),
      joinDate: getCellText(23),
      districtTransfer: getCellText(24),
      schoolJoinDate: getCellText(25),
      fullPagar: getCellText(26),
      higherPayScale: getCellText(27),
      basic6Pay: getCellText(30),
      basic7Pay: getCellText(31),
      caste: getCellText(32),
      qualification: getCellText(33),
      specialQualification: getCellText(34),
      teachingClass: getCellText(35),
      recruitment: getCellText(36),
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
    tdf: '',
    headMaster: teacher.headMaster,
    headMasterFather: teacher.headMasterFather,
    headMasterPlace: teacher.headMasterPlace,
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
