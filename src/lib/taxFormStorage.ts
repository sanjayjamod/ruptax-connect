import { TaxFormData, getEmptyTaxFormData, MonthlySalary } from "@/types/taxForm";

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

// Calculate salary totals from monthly data
export const calculateSalaryTotals = (formData: TaxFormData): TaxFormData => {
  const months = Object.values(formData.salaryData.months);
  
  const sumField = (field: keyof MonthlySalary) => 
    months.reduce((sum, m) => sum + (Number(m[field]) || 0), 0);

  const totals: MonthlySalary = {
    basic: sumField('basic'),
    gradePay: sumField('gradePay'),
    da: sumField('da'),
    hra: sumField('hra'),
    medical: sumField('medical'),
    disabilityAllowance: sumField('disabilityAllowance'),
    principalAllowance: sumField('principalAllowance'),
    daArrears: sumField('daArrears'),
    salaryArrears: sumField('salaryArrears'),
    otherIncome1: sumField('otherIncome1'),
    otherIncome2: sumField('otherIncome2'),
    totalSalary: sumField('totalSalary'),
    gpf: sumField('gpf'),
    cpf: sumField('cpf'),
    professionTax: sumField('professionTax'),
    society: sumField('society'),
    groupInsurance: sumField('groupInsurance'),
    incomeTax: sumField('incomeTax'),
    totalDeduction: sumField('totalDeduction'),
    netPay: sumField('netPay'),
  };

  // Update Form16 monthly TDS from income tax
  const monthKeys = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'] as const;
  const newMonthlyTds = { ...formData.form16Data.monthlyTds };
  
  monthKeys.forEach(month => {
    const tax = formData.salaryData.months[month].incomeTax || 0;
    newMonthlyTds[month] = {
      tds: tax,
      surcharge: 0,
      cess: 0,
      total: tax,
    };
  });

  return {
    ...formData,
    salaryData: {
      ...formData.salaryData,
      totals,
    },
    form16Data: {
      ...formData.form16Data,
      monthlyTds: newMonthlyTds,
    },
  };
};

// Calculate tax - Main calculation function (NEW TAX REGIME 2025-26)
export const calculateTax = (formData: TaxFormData): TaxFormData => {
  // First calculate salary totals
  const withTotals = calculateSalaryTotals(formData);
  const totals = withTotals.salaryData.totals;
  const decl = withTotals.declarationData;

  // ============ TAX CALCULATION A ============
  // 1. Gross Salary = Sum of all salary components
  const grossSalary = totals.totalSalary;
  
  // 2. Exemptions under Section 10 (New Regime - No exemptions)
  const hraExempt = 0; // Not available in new regime
  const transportAllowance = 0; // Not available in new regime
  const totalExempt = 0;
  
  // 3. Balance Salary after exemptions
  const balanceSalary = grossSalary - totalExempt;
  
  // 4. Deductions
  const professionTax = totals.professionTax;
  const standardDeduction = 75000; // NEW REGIME: Rs. 75,000 Standard Deduction
  
  // 5. Professional Income = Balance Salary - Standard Deduction
  const professionalIncome = Math.max(0, balanceSalary - standardDeduction);
  
  // 6. Other Income
  const bankInterest = decl.bankInterest || 0;
  const nscInterest = decl.nscInterest || 0;
  const fdInterest = decl.fdInterest || 0;
  const totalInterestIncome = bankInterest + nscInterest + fdInterest;
  
  const examIncome = decl.examIncome || 0;
  const otherIncome = decl.otherIncome || 0;
  const housePropertyIncome = 0;
  
  const totalOtherIncome = totalInterestIncome + examIncome + otherIncome + housePropertyIncome;
  
  // 7. Gross Total Income = Professional Income + Other Income
  const grossTotalIncome = professionalIncome + totalOtherIncome;
  
  // 8. Housing Loan Interest deduction (limited in new regime)
  const housingLoanInterest = 0; // Not deductible in new regime
  
  // 9. PRO Income = Gross Total Income
  const proIncome = grossTotalIncome;

  // ============ TAX CALCULATION B ============
  // Section 80C Deductions - NOT AVAILABLE IN NEW REGIME
  const gpf = totals.gpf;
  const cpf = totals.cpf;
  const groupInsurance = totals.groupInsurance;
  const licPremium = decl.licPremium || 0;
  const pliPremium = decl.postInsurance || 0;
  const ppf = decl.ppf || 0;
  const nscInvestment = decl.nscInvestment || 0;
  const housingLoanPrincipal = decl.housingLoanPrincipal || 0;
  const educationFee = decl.educationFee || 0;
  const otherInvestment80C = (decl.sbiLife || 0) + (decl.sukanyaSamridhi || 0) + (decl.fiveYearFD || 0);

  // Total 80C investments (for reference only - not deductible in new regime)
  const total80C = gpf + cpf + licPremium + pliPremium + groupInsurance + ppf + 
                   nscInvestment + housingLoanPrincipal + educationFee + otherInvestment80C;
  
  // NEW REGIME: No 80C deduction
  const max80C = 0;

  // Other Section Deductions - NOT AVAILABLE IN NEW REGIME
  const medicalInsurance80D = 0;
  const disabledDependent80DD = 0;
  const seriousDisease80DDB = 0;
  const disability80U = 0;
  const donation80G = 0;
  const savingsBankInterest80TTA = 0;

  // Total Deductions under Chapter VI-A (Zero in new regime)
  const totalDeductions = 0;

  // Taxable Income = PRO Income - Total Deductions
  const taxableIncome = Math.max(0, proIncome - totalDeductions);
  
  // Round to nearest 10 (as per IT rules)
  const roundedTaxableIncome = Math.ceil(taxableIncome / 10) * 10;

  // ============ NEW TAX REGIME SLABS 2025-26 ============
  // Slab 1: 0 - 4,00,000 = 0%
  // Slab 2: 4,00,001 - 8,00,000 = 5%
  // Slab 3: 8,00,001 - 12,00,000 = 10%
  // Slab 4: 12,00,001 - 16,00,000 = 15%
  // Slab 5: 16,00,001 - 20,00,000 = 20%
  // Slab 6: 20,00,001 - 24,00,000 = 25%
  // Slab 7: Above 24,00,000 = 30%
  
  let totalTax = 0;
  const taxSlabs: { min: number; max: number; rate: number; tax: number }[] = [];
  
  // Slab 1: 0 to 4L @ 0%
  const slab1Max = Math.min(roundedTaxableIncome, 400000);
  taxSlabs.push({ min: 0, max: 400000, rate: 0, tax: 0 });
  
  // Slab 2: 4L to 8L @ 5%
  if (roundedTaxableIncome > 400000) {
    const slab2Amount = Math.min(roundedTaxableIncome - 400000, 400000);
    const slab2Tax = Math.round(slab2Amount * 0.05);
    taxSlabs.push({ min: 400000, max: 800000, rate: 5, tax: slab2Tax });
    totalTax += slab2Tax;
  }
  
  // Slab 3: 8L to 12L @ 10%
  if (roundedTaxableIncome > 800000) {
    const slab3Amount = Math.min(roundedTaxableIncome - 800000, 400000);
    const slab3Tax = Math.round(slab3Amount * 0.10);
    taxSlabs.push({ min: 800000, max: 1200000, rate: 10, tax: slab3Tax });
    totalTax += slab3Tax;
  }
  
  // Slab 4: 12L to 16L @ 15%
  if (roundedTaxableIncome > 1200000) {
    const slab4Amount = Math.min(roundedTaxableIncome - 1200000, 400000);
    const slab4Tax = Math.round(slab4Amount * 0.15);
    taxSlabs.push({ min: 1200000, max: 1600000, rate: 15, tax: slab4Tax });
    totalTax += slab4Tax;
  }
  
  // Slab 5: 16L to 20L @ 20%
  if (roundedTaxableIncome > 1600000) {
    const slab5Amount = Math.min(roundedTaxableIncome - 1600000, 400000);
    const slab5Tax = Math.round(slab5Amount * 0.20);
    taxSlabs.push({ min: 1600000, max: 2000000, rate: 20, tax: slab5Tax });
    totalTax += slab5Tax;
  }
  
  // Slab 6: 20L to 24L @ 25%
  if (roundedTaxableIncome > 2000000) {
    const slab6Amount = Math.min(roundedTaxableIncome - 2000000, 400000);
    const slab6Tax = Math.round(slab6Amount * 0.25);
    taxSlabs.push({ min: 2000000, max: 2400000, rate: 25, tax: slab6Tax });
    totalTax += slab6Tax;
  }
  
  // Slab 7: Above 24L @ 30%
  if (roundedTaxableIncome > 2400000) {
    const slab7Amount = roundedTaxableIncome - 2400000;
    const slab7Tax = Math.round(slab7Amount * 0.30);
    taxSlabs.push({ min: 2400000, max: roundedTaxableIncome, rate: 30, tax: slab7Tax });
    totalTax += slab7Tax;
  }
  
  // Legacy slab fields (for backward compatibility)
  const taxSlab1 = 0; // 0-4L @ 0%
  const taxSlab2 = taxSlabs[1]?.tax || 0; // 4-8L @ 5%
  const taxSlab3 = (taxSlabs[2]?.tax || 0) + (taxSlabs[3]?.tax || 0) + 
                   (taxSlabs[4]?.tax || 0) + (taxSlabs[5]?.tax || 0) + (taxSlabs[6]?.tax || 0);
  
  // Tax Rebate under Section 87A (NEW REGIME)
  // If taxable income <= 7,00,000, full rebate up to Rs. 25,000
  const taxRebate87A = roundedTaxableIncome <= 700000 ? Math.min(totalTax, 25000) : 0;
  
  const taxAfterRebate = Math.max(0, totalTax - taxRebate87A);
  
  // Education Cess @ 4%
  const educationCess = Math.round(taxAfterRebate * 0.04);
  
  // Total Tax Payable = Tax After Rebate + Education Cess
  const totalTaxPayable = taxAfterRebate + educationCess;
  
  // Relief under Section 89 (for arrears)
  const relief89 = withTotals.taxCalculationB.relief89 || 0;
  
  // Net Tax Payable
  const netTaxPayable = Math.max(0, totalTaxPayable - relief89);

  // Tax already paid (TDS from salary)
  const taxPaid = totals.incomeTax;
  
  // Balance Tax = Net Tax Payable - Tax Already Paid
  const balanceTax = netTaxPayable - taxPaid;

  return {
    ...withTotals,
    taxCalculationA: {
      grossSalary,
      hraExempt,
      transportAllowance,
      totalExempt,
      balanceSalary,
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
      housePropertyIncome,
      grossTotalIncome,
      housingLoanInterest,
      proIncome,
    },
    taxCalculationB: {
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
      medicalInsurance80D: withTotals.taxCalculationB.medicalInsurance80D || 0,
      disabledDependent80DD: withTotals.taxCalculationB.disabledDependent80DD || 0,
      seriousDisease80DDB: withTotals.taxCalculationB.seriousDisease80DDB || 0,
      disability80U: withTotals.taxCalculationB.disability80U || 0,
      donation80G: withTotals.taxCalculationB.donation80G || 0,
      savingsBankInterest80TTA: withTotals.taxCalculationB.savingsBankInterest80TTA || 0,
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
      recoveredMonth: withTotals.taxCalculationB.recoveredMonth || "FEB-2026 paid March 2026",
      totalTaxPaid: netTaxPayable,
    },
  };
};

// Number to words (Indian format)
export const numberToWords = (num: number): string => {
  if (num === 0) return 'Zero Only';
  if (num < 0) return 'Minus ' + numberToWords(Math.abs(num));

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertToWords = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertToWords(n % 100) : '');
    if (n < 100000) return convertToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convertToWords(n % 1000) : '');
    if (n < 10000000) return convertToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convertToWords(n % 100000) : '');
    return convertToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convertToWords(n % 10000000) : '');
  };

  return convertToWords(Math.abs(Math.round(num))) + ' Rupees Only';
};

// Format number with commas (Indian format)
export const formatIndianNumber = (num: number): string => {
  const numStr = Math.round(num).toString();
  const lastThree = numStr.slice(-3);
  const remaining = numStr.slice(0, -3);
  
  if (remaining.length === 0) return lastThree;
  
  const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return formatted + ',' + lastThree;
};
