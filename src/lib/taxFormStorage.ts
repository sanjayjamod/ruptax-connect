import { TaxFormData, getEmptyTaxFormData } from "@/types/taxForm";

const TAX_FORMS_KEY = "ruptax_tax_forms";

// Get all tax forms
export const getAllTaxForms = (): TaxFormData[] => {
  const data = localStorage.getItem(TAX_FORMS_KEY);
  return data ? JSON.parse(data) : [];
};

// Get tax form by client ID
export const getTaxFormByClientId = (clientId: string): TaxFormData | undefined => {
  const forms = getAllTaxForms();
  return forms.find((f) => f.clientId === clientId);
};

// Save or update tax form
export const saveTaxForm = (formData: TaxFormData): TaxFormData => {
  const forms = getAllTaxForms();
  const index = forms.findIndex((f) => f.clientId === formData.clientId);
  
  const updatedForm = {
    ...formData,
    updatedAt: new Date().toISOString(),
  };

  if (index === -1) {
    updatedForm.createdAt = new Date().toISOString();
    forms.push(updatedForm);
  } else {
    forms[index] = updatedForm;
  }

  localStorage.setItem(TAX_FORMS_KEY, JSON.stringify(forms));
  return updatedForm;
};

// Delete tax form
export const deleteTaxForm = (clientId: string): boolean => {
  const forms = getAllTaxForms();
  const filtered = forms.filter((f) => f.clientId !== clientId);
  if (filtered.length === forms.length) return false;
  localStorage.setItem(TAX_FORMS_KEY, JSON.stringify(filtered));
  return true;
};

// Get or create tax form for client
export const getOrCreateTaxForm = (clientId: string): TaxFormData => {
  const existing = getTaxFormByClientId(clientId);
  if (existing) return existing;
  
  const newForm = getEmptyTaxFormData(clientId);
  saveTaxForm(newForm);
  return newForm;
};

// Calculate salary totals
export const calculateSalaryTotals = (formData: TaxFormData): TaxFormData => {
  const months = Object.values(formData.salaryData.months);
  const totals = {
    basic: months.reduce((sum, m) => sum + (m.basic || 0), 0),
    gradePay: months.reduce((sum, m) => sum + (m.gradePay || 0), 0),
    da: months.reduce((sum, m) => sum + (m.da || 0), 0),
    hra: months.reduce((sum, m) => sum + (m.hra || 0), 0),
    medical: months.reduce((sum, m) => sum + (m.medical || 0), 0),
    disabilityAllowance: months.reduce((sum, m) => sum + (m.disabilityAllowance || 0), 0),
    principalAllowance: months.reduce((sum, m) => sum + (m.principalAllowance || 0), 0),
    daArrears: months.reduce((sum, m) => sum + (m.daArrears || 0), 0),
    salaryArrears: months.reduce((sum, m) => sum + (m.salaryArrears || 0), 0),
    totalSalary: months.reduce((sum, m) => sum + (m.totalSalary || 0), 0),
    gpf: months.reduce((sum, m) => sum + (m.gpf || 0), 0),
    cpf: months.reduce((sum, m) => sum + (m.cpf || 0), 0),
    professionTax: months.reduce((sum, m) => sum + (m.professionTax || 0), 0),
    society: months.reduce((sum, m) => sum + (m.society || 0), 0),
    groupInsurance: months.reduce((sum, m) => sum + (m.groupInsurance || 0), 0),
    incomeTax: months.reduce((sum, m) => sum + (m.incomeTax || 0), 0),
    totalDeduction: months.reduce((sum, m) => sum + (m.totalDeduction || 0), 0),
    netPay: months.reduce((sum, m) => sum + (m.netPay || 0), 0),
  };

  return {
    ...formData,
    salaryData: {
      ...formData.salaryData,
      totals,
    },
  };
};

// Calculate tax
export const calculateTax = (formData: TaxFormData): TaxFormData => {
  // First calculate salary totals
  const withTotals = calculateSalaryTotals(formData);
  const totals = withTotals.salaryData.totals;

  // Tax Calculation A
  const grossSalary = totals.totalSalary;
  const professionTax = totals.professionTax;
  const standardDeduction = 50000;
  const professionalIncome = grossSalary - professionTax - standardDeduction;
  
  const { bankInterest, nscInterest, fdInterest, examIncome, otherIncome } = formData.declarationData;
  const totalInterestIncome = bankInterest + nscInterest + fdInterest;
  const totalOtherIncome = totalInterestIncome + examIncome + otherIncome;
  const grossTotalIncome = professionalIncome + totalOtherIncome;
  const housingLoanInterest = formData.declarationData.housingLoanInterest;
  const proIncome = grossTotalIncome - housingLoanInterest;

  // Tax Calculation B - Section 80C
  const gpf = totals.gpf;
  const cpf = totals.cpf;
  const groupInsurance = totals.groupInsurance;
  const licPremium = formData.declarationData.licPremium;
  const pliPremium = formData.declarationData.postInsurance;
  const ppf = formData.declarationData.ppf;
  const nscInvestment = formData.declarationData.nscInvestment;
  const housingLoanPrincipal = formData.declarationData.housingLoanPrincipal;
  const educationFee = formData.declarationData.educationFee;
  const otherInvestment80C = formData.declarationData.sbiLife + formData.declarationData.sukanyaSamridhi + formData.declarationData.fiveYearFD;

  const total80C = gpf + cpf + licPremium + pliPremium + groupInsurance + ppf + nscInvestment + housingLoanPrincipal + educationFee + otherInvestment80C;
  const max80C = Math.min(total80C, 150000);

  // Other deductions
  const medicalInsurance80D = formData.declarationData.medicalInsurance;
  const donation80G = formData.taxCalculationB.donation80G;
  const savingsBankInterest80TTA = formData.taxCalculationB.savingsBankInterest80TTA;

  const totalDeductions = max80C + medicalInsurance80D + formData.taxCalculationB.disabledDependent80DD + 
    formData.taxCalculationB.seriousDisease80DDB + formData.taxCalculationB.disability80U + donation80G + savingsBankInterest80TTA;

  const taxableIncome = proIncome - totalDeductions;
  const roundedTaxableIncome = Math.ceil(taxableIncome / 10) * 10;

  // Tax slabs
  let taxSlab1 = 0;
  let taxSlab2 = 0;
  let taxSlab3 = 0;

  if (roundedTaxableIncome > 250000) {
    const above250k = roundedTaxableIncome - 250000;
    if (above250k <= 250000) {
      taxSlab2 = above250k * 0.05;
    } else {
      taxSlab2 = 250000 * 0.05; // 12500
      const above500k = above250k - 250000;
      if (above500k <= 500000) {
        taxSlab3 = above500k * 0.20;
      } else {
        taxSlab3 = 500000 * 0.20; // 100000
      }
    }
  }

  const totalTax = taxSlab1 + taxSlab2 + taxSlab3;
  
  // Tax rebate 87A (if income <= 500000, rebate up to 12500)
  const taxRebate87A = roundedTaxableIncome <= 500000 ? Math.min(totalTax, 12500) : 0;
  const taxAfterRebate = totalTax - taxRebate87A;
  
  const educationCess = Math.round(taxAfterRebate * 0.04);
  const totalTaxPayable = taxAfterRebate + educationCess;
  const relief89 = formData.taxCalculationB.relief89;
  const netTaxPayable = totalTaxPayable - relief89;

  const taxPaid = totals.incomeTax;
  const balanceTax = netTaxPayable - taxPaid;

  return {
    ...withTotals,
    taxCalculationA: {
      ...formData.taxCalculationA,
      grossSalary,
      professionTax,
      standardDeduction,
      professionalIncome,
      bankInterest,
      nscInterest,
      fdInterest,
      totalInterestIncome,
      examIncome,
      otherIncome,
      totalOtherIncome,
      grossTotalIncome,
      housingLoanInterest,
      proIncome,
    },
    taxCalculationB: {
      ...formData.taxCalculationB,
      gpf,
      cpf,
      licPremium,
      pliPremium,
      groupInsurance,
      ppf,
      nscInvestment,
      housingLoanPrincipal,
      educationFee,
      otherInvestment80C,
      total80C,
      max80C,
      medicalInsurance80D,
      donation80G,
      savingsBankInterest80TTA,
      totalDeductions,
      taxableIncome,
      roundedTaxableIncome,
      taxSlab1,
      taxSlab2,
      taxSlab3,
      totalTax,
      taxRebate87A,
      taxAfterRebate,
      educationCess,
      totalTaxPayable,
      relief89,
      netTaxPayable,
      taxPaid,
      balanceTax,
      totalTaxPaid: netTaxPayable,
    },
  };
};

// Number to words (Indian format)
export const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';

  const convertToWords = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertToWords(n % 100) : '');
    if (n < 100000) return convertToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convertToWords(n % 1000) : '');
    if (n < 10000000) return convertToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convertToWords(n % 100000) : '');
    return convertToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convertToWords(n % 10000000) : '');
  };

  return convertToWords(Math.abs(Math.round(num))) + ' Only';
};
