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

// Calculate tax - Main calculation function
export const calculateTax = (formData: TaxFormData): TaxFormData => {
  // First calculate salary totals
  const withTotals = calculateSalaryTotals(formData);
  const totals = withTotals.salaryData.totals;
  const decl = withTotals.declarationData;

  // ============ TAX CALCULATION A ============
  // 1. Gross Salary = Sum of all salary components
  const grossSalary = totals.totalSalary;
  
  // 2. Exemptions under Section 10
  const hraExempt = 0; // HRA exemption if living in rented house
  const transportAllowance = 0; // Transport allowance (Rs.9600 limit)
  const totalExempt = hraExempt + transportAllowance;
  
  // 3. Balance Salary after exemptions
  const balanceSalary = grossSalary - totalExempt;
  
  // 4. Deductions
  const professionTax = totals.professionTax;
  const standardDeduction = 50000; // Standard deduction as per IT rules
  
  // 5. Professional Income = Balance Salary - Profession Tax - Standard Deduction
  const professionalIncome = balanceSalary - professionTax - standardDeduction;
  
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
  
  // 8. Housing Loan Interest deduction under Section 24(2)
  const housingLoanInterest = decl.housingLoanInterest || 0;
  
  // 9. PRO Income = Gross Total Income - Housing Loan Interest
  const proIncome = grossTotalIncome - housingLoanInterest;

  // ============ TAX CALCULATION B ============
  // Section 80C Deductions
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

  // Total 80C investments
  const total80C = gpf + cpf + licPremium + pliPremium + groupInsurance + ppf + 
                   nscInvestment + housingLoanPrincipal + educationFee + otherInvestment80C;
  
  // Maximum 80C deduction is Rs. 1,50,000
  const max80C = Math.min(total80C, 150000);

  // Other Section Deductions
  const medicalInsurance80D = decl.medicalInsurance || 0; // Max 25000 (50000 for senior)
  const disabledDependent80DD = withTotals.taxCalculationB.disabledDependent80DD || 0; // Max 50000/125000
  const seriousDisease80DDB = withTotals.taxCalculationB.seriousDisease80DDB || 0; // Max 40000
  const disability80U = withTotals.taxCalculationB.disability80U || 0; // 75000/125000
  const donation80G = withTotals.taxCalculationB.donation80G || 0; // 50% deduction
  const savingsBankInterest80TTA = Math.min(bankInterest, 10000); // Max 10000

  // Total Deductions under Chapter VI-A
  const totalDeductions = max80C + medicalInsurance80D + disabledDependent80DD + 
                          seriousDisease80DDB + disability80U + donation80G + savingsBankInterest80TTA;

  // Taxable Income = PRO Income - Total Deductions
  const taxableIncome = Math.max(0, proIncome - totalDeductions);
  
  // Round to nearest 10 (as per IT rules)
  const roundedTaxableIncome = Math.floor(taxableIncome / 10) * 10;

  // ============ TAX SLAB CALCULATION (OLD REGIME) ============
  // Slab 1: 0 - 2,50,000 = 0%
  // Slab 2: 2,50,001 - 5,00,000 = 5%
  // Slab 3: 5,00,001 - 10,00,000 = 20%
  // Slab 4: Above 10,00,000 = 30%
  
  let taxSlab1 = 0; // 0% on first 2.5L
  let taxSlab2 = 0; // 5% on 2.5L to 5L
  let taxSlab3 = 0; // 20% on 5L to 10L

  if (roundedTaxableIncome > 250000) {
    // Calculate tax on 2.5L to 5L @ 5%
    const taxableIn5Percent = Math.min(roundedTaxableIncome - 250000, 250000);
    taxSlab2 = Math.round(taxableIn5Percent * 0.05);
    
    if (roundedTaxableIncome > 500000) {
      // Calculate tax on 5L to 10L @ 20%
      const taxableIn20Percent = Math.min(roundedTaxableIncome - 500000, 500000);
      taxSlab3 = Math.round(taxableIn20Percent * 0.20);
    }
  }

  const totalTax = taxSlab1 + taxSlab2 + taxSlab3;
  
  // Tax Rebate under Section 87A
  // If taxable income <= 5,00,000, rebate up to Rs. 12,500
  const taxRebate87A = roundedTaxableIncome <= 500000 ? Math.min(totalTax, 12500) : 0;
  
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
      medicalInsurance80D,
      disabledDependent80DD,
      seriousDisease80DDB,
      disability80U,
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
      recoveredMonth: withTotals.taxCalculationB.recoveredMonth || "",
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
