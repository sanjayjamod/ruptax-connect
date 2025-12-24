// Excel Import Utility for Complete Tax Form Data (with multi-sheet mapping)
// Maps data from Excel file similar to the original formula-based Excel: =Sheet2!B19

import * as XLSX from 'xlsx';
import { TaxFormData, getEmptyTaxFormData, MonthlySalary } from "@/types/taxForm";
import { Client } from "@/types/client";

interface ExcelSheetData {
  [key: string]: (string | number | null)[][];
}

// Parse the complete Excel file with all sheets
export const parseFullExcelFile = async (file: File): Promise<ExcelSheetData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const allSheets: ExcelSheetData = {};
        
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1, 
            defval: null,
            raw: true 
          }) as (string | number | null)[][];
          allSheets[sheetName] = jsonData;
        });
        
        console.log('Excel sheets found:', Object.keys(allSheets));
        resolve(allSheets);
      } catch (error) {
        console.error('Excel parsing error:', error);
        reject(new Error('Failed to parse Excel file: ' + (error as Error).message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

// Get cell value safely (0-indexed row and column)
const getCell = (sheet: (string | number | null)[][], row: number, col: number): string | number => {
  if (!sheet || !sheet[row]) return '';
  const val = sheet[row][col];
  if (val === null || val === undefined) return '';
  return val;
};

const getCellNum = (sheet: (string | number | null)[][], row: number, col: number): number => {
  const val = getCell(sheet, row, col);
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val.replace(/[^\d.-]/g, '')) || 0;
  return 0;
};

const getCellStr = (sheet: (string | number | null)[][], row: number, col: number): string => {
  const val = getCell(sheet, row, col);
  return String(val).trim();
};

// Extract client profile data from Sheet1 or Sheet2
export const extractClientFromExcel = (sheets: ExcelSheetData): Partial<Client> => {
  // Try Sheet2 first (data sheet), then Sheet1
  const dataSheet = sheets['Sheet2'] || sheets['Sheet1'] || Object.values(sheets)[0];
  
  if (!dataSheet) return {};
  
  // Based on the Excel structure, find key fields
  // Common positions in the demo Excel file
  const client: Partial<Client> = {};
  
  // Search for labeled cells and extract values
  for (let row = 0; row < Math.min(dataSheet.length, 50); row++) {
    const rowData = dataSheet[row];
    if (!rowData) continue;
    
    for (let col = 0; col < Math.min(rowData.length, 20); col++) {
      const cellValue = String(rowData[col] || '').toLowerCase().trim();
      const nextValue = rowData[col + 1];
      
      // Match label patterns and extract adjacent values
      if (cellValue.includes('enter no') || cellValue.includes('ક્રમ')) {
        client.id = String(nextValue || '');
      }
      if (cellValue.includes('school name') || cellValue.includes('શાળાનુ નામ')) {
        client.schoolName = String(nextValue || '');
      }
      if (cellValue.includes('designation') || cellValue.includes('હોદ્દો')) {
        client.designation = String(nextValue || '');
      }
      if (cellValue.includes('pan no') || cellValue.includes('pan')) {
        client.panNo = String(nextValue || '');
      }
      if (cellValue.includes('bank ac') || cellValue.includes('bank account')) {
        client.bankAcNo = String(nextValue || '');
      }
      if (cellValue.includes('ifsc')) {
        client.ifscCode = String(nextValue || '');
      }
      if (cellValue.includes('aadhar') || cellValue.includes('આધાર')) {
        client.aadharNo = String(nextValue || '');
      }
      if (cellValue.includes('mobile') || cellValue.includes('મોબાઈલ')) {
        client.mobileNo = String(nextValue || '');
      }
      if (cellValue.includes('date of birth') || cellValue.includes('જન્મ')) {
        client.dateOfBirth = String(nextValue || '');
      }
      if (cellValue.includes('pay center name') || cellValue.includes('paycenter')) {
        client.payCenterName = String(nextValue || '');
      }
      if (cellValue.includes('place') || cellValue.includes('સ્થળ')) {
        client.place = String(nextValue || '');
      }
      if (cellValue.includes('નામ') && !cellValue.includes('શાળા')) {
        if (nextValue && String(nextValue).length > 3) {
          client.nameGujarati = String(nextValue);
        }
      }
      if (cellValue.includes('head master place')) {
        client.headMasterPlace = String(nextValue || '');
      }
    }
  }
  
  return client;
};

// Parse Pagar (Salary) form data - typically Sheet3 or sheet named "પગાર"
const parsePagarSheet = (sheets: ExcelSheetData): TaxFormData['salaryData'] | null => {
  // Find pagar sheet
  const pagarSheet = sheets['Sheet3'] || sheets['પગાર'] || Object.values(sheets).find(
    sheet => sheet.some(row => row?.some(cell => String(cell).includes('પગાર સ્લીપ') || String(cell).includes('વેતનની વિગત')))
  );
  
  if (!pagarSheet) return null;
  
  const months: (keyof TaxFormData['salaryData']['months'])[] = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'];
  
  const salaryData: TaxFormData['salaryData'] = {
    financialYear: "2025-2026",
    accountingYear: "01-04-2025 TO 31-03-2026",
    months: {
      apr: { basic: 0, gradePay: 0, da: 0, hra: 0, medical: 0, disabilityAllowance: 0, principalAllowance: 0, daArrears: 0, salaryArrears: 0, otherIncome1: 0, otherIncome2: 0, totalSalary: 0, gpf: 0, cpf: 0, professionTax: 0, society: 0, groupInsurance: 0, incomeTax: 0, totalDeduction: 0, netPay: 0 },
      may: { basic: 0, gradePay: 0, da: 0, hra: 0, medical: 0, disabilityAllowance: 0, principalAllowance: 0, daArrears: 0, salaryArrears: 0, otherIncome1: 0, otherIncome2: 0, totalSalary: 0, gpf: 0, cpf: 0, professionTax: 0, society: 0, groupInsurance: 0, incomeTax: 0, totalDeduction: 0, netPay: 0 },
      jun: { basic: 0, gradePay: 0, da: 0, hra: 0, medical: 0, disabilityAllowance: 0, principalAllowance: 0, daArrears: 0, salaryArrears: 0, otherIncome1: 0, otherIncome2: 0, totalSalary: 0, gpf: 0, cpf: 0, professionTax: 0, society: 0, groupInsurance: 0, incomeTax: 0, totalDeduction: 0, netPay: 0 },
      jul: { basic: 0, gradePay: 0, da: 0, hra: 0, medical: 0, disabilityAllowance: 0, principalAllowance: 0, daArrears: 0, salaryArrears: 0, otherIncome1: 0, otherIncome2: 0, totalSalary: 0, gpf: 0, cpf: 0, professionTax: 0, society: 0, groupInsurance: 0, incomeTax: 0, totalDeduction: 0, netPay: 0 },
      aug: { basic: 0, gradePay: 0, da: 0, hra: 0, medical: 0, disabilityAllowance: 0, principalAllowance: 0, daArrears: 0, salaryArrears: 0, otherIncome1: 0, otherIncome2: 0, totalSalary: 0, gpf: 0, cpf: 0, professionTax: 0, society: 0, groupInsurance: 0, incomeTax: 0, totalDeduction: 0, netPay: 0 },
      sep: { basic: 0, gradePay: 0, da: 0, hra: 0, medical: 0, disabilityAllowance: 0, principalAllowance: 0, daArrears: 0, salaryArrears: 0, otherIncome1: 0, otherIncome2: 0, totalSalary: 0, gpf: 0, cpf: 0, professionTax: 0, society: 0, groupInsurance: 0, incomeTax: 0, totalDeduction: 0, netPay: 0 },
      oct: { basic: 0, gradePay: 0, da: 0, hra: 0, medical: 0, disabilityAllowance: 0, principalAllowance: 0, daArrears: 0, salaryArrears: 0, otherIncome1: 0, otherIncome2: 0, totalSalary: 0, gpf: 0, cpf: 0, professionTax: 0, society: 0, groupInsurance: 0, incomeTax: 0, totalDeduction: 0, netPay: 0 },
      nov: { basic: 0, gradePay: 0, da: 0, hra: 0, medical: 0, disabilityAllowance: 0, principalAllowance: 0, daArrears: 0, salaryArrears: 0, otherIncome1: 0, otherIncome2: 0, totalSalary: 0, gpf: 0, cpf: 0, professionTax: 0, society: 0, groupInsurance: 0, incomeTax: 0, totalDeduction: 0, netPay: 0 },
      dec: { basic: 0, gradePay: 0, da: 0, hra: 0, medical: 0, disabilityAllowance: 0, principalAllowance: 0, daArrears: 0, salaryArrears: 0, otherIncome1: 0, otherIncome2: 0, totalSalary: 0, gpf: 0, cpf: 0, professionTax: 0, society: 0, groupInsurance: 0, incomeTax: 0, totalDeduction: 0, netPay: 0 },
      jan: { basic: 0, gradePay: 0, da: 0, hra: 0, medical: 0, disabilityAllowance: 0, principalAllowance: 0, daArrears: 0, salaryArrears: 0, otherIncome1: 0, otherIncome2: 0, totalSalary: 0, gpf: 0, cpf: 0, professionTax: 0, society: 0, groupInsurance: 0, incomeTax: 0, totalDeduction: 0, netPay: 0 },
      feb: { basic: 0, gradePay: 0, da: 0, hra: 0, medical: 0, disabilityAllowance: 0, principalAllowance: 0, daArrears: 0, salaryArrears: 0, otherIncome1: 0, otherIncome2: 0, totalSalary: 0, gpf: 0, cpf: 0, professionTax: 0, society: 0, groupInsurance: 0, incomeTax: 0, totalDeduction: 0, netPay: 0 },
      mar: { basic: 0, gradePay: 0, da: 0, hra: 0, medical: 0, disabilityAllowance: 0, principalAllowance: 0, daArrears: 0, salaryArrears: 0, otherIncome1: 0, otherIncome2: 0, totalSalary: 0, gpf: 0, cpf: 0, professionTax: 0, society: 0, groupInsurance: 0, incomeTax: 0, totalDeduction: 0, netPay: 0 },
    },
    totals: { basic: 0, gradePay: 0, da: 0, hra: 0, medical: 0, disabilityAllowance: 0, principalAllowance: 0, daArrears: 0, salaryArrears: 0, otherIncome1: 0, otherIncome2: 0, totalSalary: 0, gpf: 0, cpf: 0, professionTax: 0, society: 0, groupInsurance: 0, incomeTax: 0, totalDeduction: 0, netPay: 0 }
  };
  
  // Find the header row with month columns (એપ્રિલ, મે, જુન...)
  let headerRowIndex = -1;
  let colOffset = 2; // Default column offset for month data
  
  for (let i = 0; i < pagarSheet.length; i++) {
    const row = pagarSheet[i];
    if (row && row.some(cell => String(cell).includes('એપ્રિલ') || String(cell).includes('April'))) {
      headerRowIndex = i;
      // Find column offset
      for (let c = 0; c < row.length; c++) {
        if (String(row[c]).includes('એપ્રિલ') || String(row[c]).includes('April')) {
          colOffset = c;
          break;
        }
      }
      break;
    }
  }
  
  if (headerRowIndex === -1) return null;
  
  // Map row labels to salary fields
  const rowMappings: { [key: string]: keyof MonthlySalary } = {
    'બેઝિક': 'basic',
    'ગ્રેડ પે': 'gradePay',
    'મોંઘવારી ભથ્થું': 'da',
    'ઘરભાડા ભથ્થું': 'hra',
    'મેડીકલ': 'medical',
    'અપંગ': 'disabilityAllowance',
    'આચાર્ય': 'principalAllowance',
    'મોંધવારી એરિયર્સ': 'daArrears',
    'પગાર એરિયર્સ': 'salaryArrears',
    'કુલ પગાર': 'totalSalary',
    'G.P.F': 'gpf',
    'C.P.F': 'cpf',
    'વ્યવસાય વેરો': 'professionTax',
    'મંડળી': 'society',
    'જુથ વિમા': 'groupInsurance',
    'ઇન્કમટેક્ષ': 'incomeTax',
    'કુલ કપાત': 'totalDeduction',
    'ચુકવેલ રકમ': 'netPay',
  };
  
  // Parse data rows
  for (let rowIdx = headerRowIndex + 2; rowIdx < pagarSheet.length; rowIdx++) {
    const row = pagarSheet[rowIdx];
    if (!row || !row[1]) continue;
    
    const labelCell = String(row[1] || '').trim();
    
    // Find which field this row maps to
    let mappedField: keyof MonthlySalary | null = null;
    for (const [pattern, field] of Object.entries(rowMappings)) {
      if (labelCell.includes(pattern)) {
        mappedField = field;
        break;
      }
    }
    
    if (mappedField) {
      // Extract month values
      months.forEach((month, monthIndex) => {
        const value = getCellNum(pagarSheet, rowIdx, colOffset + monthIndex);
        salaryData.months[month][mappedField as keyof MonthlySalary] = value as never;
      });
      
      // Total column (usually last)
      const totalValue = getCellNum(pagarSheet, rowIdx, colOffset + 12);
      salaryData.totals[mappedField as keyof MonthlySalary] = totalValue as never;
    }
  }
  
  return salaryData;
};

// Parse Declaration form data
const parseDeclarationSheet = (sheets: ExcelSheetData): TaxFormData['declarationData'] | null => {
  const declSheet = sheets['Sheet4'] || sheets['ડેકલેરેશન'] || Object.values(sheets).find(
    sheet => sheet.some(row => row?.some(cell => String(cell).includes('ડેકલેરેશન') || String(cell).includes('Declaration')))
  );
  
  if (!declSheet) return null;
  
  const declaration: TaxFormData['declarationData'] = {
    bankInterest: 0,
    nscInterest: 0,
    examIncome: 0,
    fdInterest: 0,
    otherIncome: 0,
    totalIncome: 0,
    licPremium: 0,
    postInsurance: 0,
    ppf: 0,
    nscInvestment: 0,
    housingLoanInterest: 0,
    housingLoanPrincipal: 0,
    educationFee: 0,
    sbiLife: 0,
    sukanyaSamridhi: 0,
    medicalInsurance: 0,
    fiveYearFD: 0,
    otherDeduction: 0,
    totalDeduction: 0,
  };
  
  // Parse declaration values - only numeric fields
  type NumericDeclarationKeys = 'bankInterest' | 'nscInterest' | 'examIncome' | 'fdInterest' | 'otherIncome' | 'totalIncome' | 'licPremium' | 'postInsurance' | 'ppf' | 'nscInvestment' | 'housingLoanInterest' | 'housingLoanPrincipal' | 'educationFee' | 'sbiLife' | 'sukanyaSamridhi' | 'medicalInsurance' | 'fiveYearFD' | 'otherDeduction' | 'totalDeduction';
  
  const incomeMapping: { [key: string]: NumericDeclarationKeys } = {
    'બેન્ક વ્યાજ': 'bankInterest',
    'N.S.C. શ્રેણી': 'nscInterest',
    'પરીક્ષાનું મહેનતાણું': 'examIncome',
    'ફિકસ ડિપૉજીટ': 'fdInterest',
  };
  
  const deductionMapping: { [key: string]: NumericDeclarationKeys } = {
    'જીવન વિમા': 'licPremium',
    'પોસ્ટ વિમા': 'postInsurance',
    'P.P.F': 'ppf',
    'N.S.C ભરેલ': 'nscInvestment',
    'હાઉસીગ બિલ્ડીંગ લોનનુ વ્યાજ': 'housingLoanInterest',
    'હાઉસીંગ બિલ્ડીગ લોનના હપતા': 'housingLoanPrincipal',
    'શિક્ષણ ખર્ચ': 'educationFee',
    'S.B.I': 'sbiLife',
    'સુકન્યા': 'sukanyaSamridhi',
    'મેડીકલેઇમ': 'medicalInsurance',
    'ટાઇમ': 'fiveYearFD',
  };
  
  for (let rowIdx = 0; rowIdx < declSheet.length; rowIdx++) {
    const row = declSheet[rowIdx];
    if (!row) continue;
    
    // Check income columns (usually col 1-2)
    const incomeLabel = String(row[1] || '');
    for (const [pattern, field] of Object.entries(incomeMapping)) {
      if (incomeLabel.includes(pattern)) {
        declaration[field] = getCellNum(declSheet, rowIdx, 2);
        break;
      }
    }
    
    // Check deduction columns (usually col 4-5)
    const deductionLabel = String(row[4] || '');
    for (const [pattern, field] of Object.entries(deductionMapping)) {
      if (deductionLabel.includes(pattern)) {
        declaration[field] = getCellNum(declSheet, rowIdx, 5);
        break;
      }
    }
    
    // Total rows
    if (String(row[1] || '').includes('કુલ') && getCellNum(declSheet, rowIdx, 2) > 0) {
      declaration.totalIncome = getCellNum(declSheet, rowIdx, 2);
    }
    if (String(row[4] || '').includes('કુલ') && getCellNum(declSheet, rowIdx, 5) > 0) {
      declaration.totalDeduction = getCellNum(declSheet, rowIdx, 5);
    }
  }
  
  return declaration;
};

// Parse Form 16 data
const parseForm16Sheet = (sheets: ExcelSheetData): Partial<TaxFormData['form16Data']> | null => {
  const form16Sheet = sheets['Sheet7'] || sheets['Form16A'] || Object.values(sheets).find(
    sheet => sheet.some(row => row?.some(cell => String(cell).includes('FORM 16') || String(cell).includes('Certificate under section 203')))
  );
  
  if (!form16Sheet) return null;
  
  const form16: Partial<TaxFormData['form16Data']> = {};
  
  // Extract Form 16 specific data
  for (let rowIdx = 0; rowIdx < form16Sheet.length; rowIdx++) {
    const row = form16Sheet[rowIdx];
    if (!row) continue;
    
    const rowText = row.map(c => String(c || '')).join(' ').toLowerCase();
    
    if (rowText.includes('tan')) {
      for (let col = 0; col < row.length; col++) {
        const cellValue = String(row[col] || '');
        if (/^[A-Z]{4}\d{5}[A-Z]$/.test(cellValue)) {
          form16.employerTan = cellValue;
        }
      }
    }
    
    if (rowText.includes('working in the capacity') || rowText.includes('head master')) {
      for (let col = 0; col < row.length; col++) {
        const cellValue = String(row[col] || '');
        if (cellValue.length > 5 && /^[A-Z]/.test(cellValue)) {
          form16.headMasterName = cellValue;
        }
      }
    }
  }
  
  return form16;
};

// Main function to import complete tax form data from Excel
export const importTaxFormFromExcel = async (file: File, clientId: string): Promise<TaxFormData> => {
  const sheets = await parseFullExcelFile(file);
  
  console.log('Importing tax form from Excel with sheets:', Object.keys(sheets));
  
  // Start with empty form
  const formData = getEmptyTaxFormData(clientId);
  
  // Parse salary data
  const salaryData = parsePagarSheet(sheets);
  if (salaryData) {
    formData.salaryData = salaryData;
    console.log('Parsed salary data - Total salary:', salaryData.totals.totalSalary);
  }
  
  // Parse declaration data
  const declarationData = parseDeclarationSheet(sheets);
  if (declarationData) {
    formData.declarationData = declarationData;
    console.log('Parsed declaration data');
  }
  
  // Parse Form 16 data
  const form16Data = parseForm16Sheet(sheets);
  if (form16Data) {
    formData.form16Data = { ...formData.form16Data, ...form16Data };
    console.log('Parsed Form 16 data');
  }
  
  // Auto-calculate tax calculation fields from salary totals
  if (salaryData) {
    formData.taxCalculationA.grossSalary = salaryData.totals.totalSalary;
    formData.taxCalculationA.balanceSalary = salaryData.totals.totalSalary;
    formData.taxCalculationA.professionalIncome = salaryData.totals.totalSalary - 75000; // Standard deduction
    formData.taxCalculationA.proIncome = formData.taxCalculationA.professionalIncome;
    formData.taxCalculationA.grossTotalIncome = formData.taxCalculationA.professionalIncome;
    
    // 80C deductions from salary
    formData.taxCalculationB.gpf = salaryData.totals.gpf;
    formData.taxCalculationB.cpf = salaryData.totals.cpf;
    formData.taxCalculationB.groupInsurance = salaryData.totals.groupInsurance;
    formData.taxCalculationB.taxPaid = salaryData.totals.incomeTax;
  }
  
  return formData;
};

// Extract both client and tax form data from a single Excel file
export const importCompleteDataFromExcel = async (file: File): Promise<{
  client: Partial<Client>;
  taxFormData: TaxFormData;
}> => {
  const sheets = await parseFullExcelFile(file);
  
  const client = extractClientFromExcel(sheets);
  const clientId = client.id || 'temp_' + Date.now();
  const taxFormData = await importTaxFormFromExcel(file, clientId);
  
  return { client, taxFormData };
};
