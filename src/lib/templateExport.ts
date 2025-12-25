import * as XLSX from 'xlsx';
import { Client } from '@/types/client';
import { TaxFormData } from '@/types/taxForm';
import { supabase } from '@/integrations/supabase/client';

interface FormTemplate {
  id: string;
  form_type: string;
  template_name: string;
  file_path: string;
  file_url: string;
  is_active: boolean;
}

// Fetch active template for a form type
export const getActiveTemplate = async (formType: string): Promise<FormTemplate | null> => {
  const { data, error } = await supabase
    .from('form_templates')
    .select('*')
    .eq('form_type', formType)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    console.log(`No active template found for ${formType}`);
    return null;
  }

  return data as FormTemplate;
};

// Cell mapping for આવકવેરા A form - Based on actual template structure
const getAavakVeraACellMapping = (client: Client, formData: TaxFormData) => {
  const taxA = formData.taxCalculationA;
  
  // Mapping based on the uploaded template structure
  // Row 2: Title (આવક વેરા ગણતરી ફોર્મ)
  // Row 3: NAME
  // Row 4: INCOME YEAR, ASSESSMENT YEAR
  // etc.
  
  return {
    // Header Info - Client Details
    'C3': client.name, // NAME value
    'C4': formData.salaryData.financialYear, // INCOME YEAR value
    'I4': client.assessmentYear || '2026-2027', // ASSESSMENT YEAR value
    'C5': client.schoolName || '', // VILLAGE value
    'C6': client.designation || '', // DESIGNATION value
    'I6': client.dateOfBirth || '', // DATE OF BIRTH value
    'C7': client.panNo || '', // PAN NO. value
    'I7': client.mobileNo || '', // MOBILE NO value
    'C8': client.bankAcNo || '', // BANK ACC.NO value
    'I8': client.aadharNo || '', // AADHAR NO value
    'C9': client.ifscCode || '', // IFSC CODE value
    
    // Tax Calculation Values
    'J10': taxA.grossSalary, // કુલ ગ્રોસ આવક
    'H13': 0, // ( I ) પગાર બીલેથી મળેલ ઘરભાડું
    'H19': taxA.hraExempt, // (VII) બાદ મળવા પાત્ર ઘરભાડું
    'J21': taxA.transportAllowance, // ટ્રાન્સપોર્ટ એલ્લા
    'I22': taxA.totalExempt, // કુલ રકમ 10 હેઠળ બાદ
    'J23': taxA.balanceSalary || taxA.grossSalary, // બાકિ પગાર આવક
    'J24': taxA.standardDeduction || 75000, // STANDERD DIDUCATION
    'J25': taxA.professionalIncome, // PRO INCOME
    
    // Section B - Other Income
    'I27': taxA.bankInterest, // બેંક વ્યાજ આવક SAVING
    'I28': taxA.nscInterest, // એન.એસ.સી. વ્યાજ
    'I29': taxA.fdInterest, // ફિકસ ડિપૉજીટ વ્યાજ
    'I30': taxA.totalInterestIncome, // કુલ વ્યાજ આવક
    'J35': taxA.examIncome || 0, // પરીક્ષાનુ મહેનતાણું / કુલ Total
    'I36': taxA.housePropertyIncome, // મકાન મિલકત
    'J37': taxA.totalOtherIncome, // કુલ અન્ય આવક
    
    // Section C - Gross Total Income
    'I40': taxA.grossTotalIncome, // PRO. INCOME તથા અન્ય
    'I41': taxA.housingLoanInterest, // મકાન લોનનું વ્યાજ
    'I42': taxA.proIncome, // PRO. INCOME (Column 1-2)
  };
};

// Cell mapping for આવકવેરા B form
const getAavakVeraBCellMapping = (client: Client, formData: TaxFormData) => {
  const taxB = formData.taxCalculationB;
  
  return {
    // Section 80C Deductions
    'I3': taxB.gpf,
    'I4': taxB.cpf,
    'I5': taxB.licPremium,
    'I6': taxB.pliPremium,
    'I7': taxB.groupInsurance,
    'I8': taxB.ppf,
    'I9': taxB.nscInvestment,
    'I10': taxB.housingLoanPrincipal,
    'I11': taxB.educationFee,
    'I12': taxB.otherInvestment80C,
    'I13': taxB.total80C,
    'I14': taxB.max80C,
    
    // Other Deductions
    'I16': taxB.medicalInsurance80D,
    'I17': taxB.disabledDependent80DD,
    'I18': taxB.seriousDisease80DDB,
    'I19': taxB.disability80U,
    'I20': taxB.donation80G,
    'I21': taxB.savingsBankInterest80TTA,
    'I22': taxB.totalDeductions,
    
    // Tax Calculation
    'I24': taxB.taxableIncome,
    'I25': taxB.roundedTaxableIncome,
    'I27': taxB.taxSlab1,
    'I28': taxB.taxSlab2,
    'I29': taxB.taxSlab3,
    'I30': taxB.totalTax,
    'I31': taxB.taxRebate87A,
    'I32': taxB.taxAfterRebate,
    'I33': taxB.educationCess,
    'I34': taxB.totalTaxPayable,
    'I35': taxB.relief89,
    'I36': taxB.netTaxPayable,
    'I37': taxB.taxPaid,
    'I38': taxB.balanceTax,
  };
};

// Export form data using uploaded template
export const exportWithTemplate = async (
  formType: string,
  client: Client,
  formData: TaxFormData
): Promise<boolean> => {
  try {
    // Get active template
    const template = await getActiveTemplate(formType);
    
    if (!template) {
      console.log('No template found, using default export');
      return false;
    }

    // Fetch template file
    const response = await fetch(template.file_url);
    if (!response.ok) {
      throw new Error('Failed to fetch template');
    }

    const arrayBuffer = await response.arrayBuffer();
    
    // Read the Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Get cell mapping based on form type
    let cellMapping: Record<string, any> = {};
    
    if (formType === 'aavak-vera-a') {
      cellMapping = getAavakVeraACellMapping(client, formData);
    } else if (formType === 'aavak-vera-b') {
      cellMapping = getAavakVeraBCellMapping(client, formData);
    }

    // Fill cells with data
    Object.entries(cellMapping).forEach(([cell, value]) => {
      if (value !== undefined && value !== null) {
        worksheet[cell] = { t: typeof value === 'number' ? 'n' : 's', v: value };
      }
    });

    // Generate output file
    const outputBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([outputBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Download the file
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${client.id}_${client.name.replace(/\s+/g, '_')}_${formType}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Template export error:', error);
    return false;
  }
};

// Auto-detect cell positions from template
export const detectCellPositions = async (templateUrl: string): Promise<Record<string, string>> => {
  try {
    const response = await fetch(templateUrl);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const cellPositions: Record<string, string> = {};
    
    // Scan worksheet for labels to detect positions
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z50');
    
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        
        if (cell && cell.v) {
          const value = String(cell.v).toLowerCase().trim();
          
          // Detect common labels
          if (value.includes('name')) {
            const valueCell = XLSX.utils.encode_cell({ r: row, c: col + 1 });
            cellPositions['name'] = valueCell;
          }
          if (value.includes('pan')) {
            const valueCell = XLSX.utils.encode_cell({ r: row, c: col + 1 });
            cellPositions['panNo'] = valueCell;
          }
          // Add more detection logic as needed
        }
      }
    }

    return cellPositions;
  } catch (error) {
    console.error('Cell detection error:', error);
    return {};
  }
};
