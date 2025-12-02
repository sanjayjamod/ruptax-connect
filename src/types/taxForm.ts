// Monthly salary data structure
export interface MonthlySalary {
  basic: number;
  gradePay: number;
  da: number; // Dearness Allowance
  hra: number; // House Rent Allowance
  medical: number;
  disabilityAllowance: number;
  principalAllowance: number;
  daArrears: number;
  salaryArrears: number;
  totalSalary: number;
  // Deductions
  gpf: number;
  cpf: number;
  professionTax: number;
  society: number;
  groupInsurance: number;
  incomeTax: number;
  totalDeduction: number;
  netPay: number;
}

export interface SalaryData {
  financialYear: string;
  accountingYear: string;
  months: {
    apr: MonthlySalary;
    may: MonthlySalary;
    jun: MonthlySalary;
    jul: MonthlySalary;
    aug: MonthlySalary;
    sep: MonthlySalary;
    oct: MonthlySalary;
    nov: MonthlySalary;
    dec: MonthlySalary;
    jan: MonthlySalary;
    feb: MonthlySalary;
    mar: MonthlySalary;
  };
  totals: MonthlySalary;
}

export interface DeclarationData {
  // Income section
  bankInterest: number;
  nscInterest: number;
  examIncome: number;
  fdInterest: number;
  otherIncome: number;
  totalIncome: number;
  // Deduction section
  licPremium: number;
  postInsurance: number;
  ppf: number;
  nscInvestment: number;
  housingLoanInterest: number;
  housingLoanPrincipal: number;
  educationFee: number;
  sbiLife: number;
  sukanyaSamridhi: number;
  medicalInsurance: number;
  fiveYearFD: number;
  otherDeduction: number;
  totalDeduction: number;
}

export interface TaxCalculationA {
  grossSalary: number;
  hraExempt: number;
  transportAllowance: number;
  totalExempt: number;
  balanceSalary: number;
  professionTax: number;
  standardDeduction: number;
  professionalIncome: number;
  // Other income
  bankInterest: number;
  nscInterest: number;
  fdInterest: number;
  totalInterestIncome: number;
  examIncome: number;
  otherIncome: number;
  totalOtherIncome: number;
  housePropertyIncome: number;
  grossTotalIncome: number;
  housingLoanInterest: number;
  proIncome: number;
}

export interface TaxCalculationB {
  // Section 80C
  gpf: number;
  cpf: number;
  licPremium: number;
  pliPremium: number;
  groupInsurance: number;
  ppf: number;
  nscInvestment: number;
  housingLoanPrincipal: number;
  educationFee: number;
  otherInvestment80C: number;
  total80C: number;
  max80C: number;
  // Other sections
  medicalInsurance80D: number;
  disabledDependent80DD: number;
  seriousDisease80DDB: number;
  disability80U: number;
  donation80G: number;
  savingsBankInterest80TTA: number;
  totalDeductions: number;
  taxableIncome: number;
  roundedTaxableIncome: number;
  // Tax calculation
  taxSlab1: number; // 0-2.5L at 0%
  taxSlab2: number; // 2.5L-5L at 5%
  taxSlab3: number; // 5L-10L at 20%
  totalTax: number;
  taxRebate87A: number;
  taxAfterRebate: number;
  educationCess: number;
  totalTaxPayable: number;
  relief89: number;
  netTaxPayable: number;
  taxPaid: number;
  balanceTax: number;
  recoveredMonth: string;
  totalTaxPaid: number;
}

export interface Form16Data {
  employerName: string;
  employerAddress: string;
  employerPan: string;
  employerTan: string;
  tdsCircle: string;
  quarters: {
    q1: { acknowledgementNo: string; from: string; to: string };
    q2: { acknowledgementNo: string; from: string; to: string };
    q3: { acknowledgementNo: string; from: string; to: string };
    q4: { acknowledgementNo: string; from: string; to: string };
  };
  monthlyTds: {
    apr: { tds: number; surcharge: number; cess: number; total: number };
    may: { tds: number; surcharge: number; cess: number; total: number };
    jun: { tds: number; surcharge: number; cess: number; total: number };
    jul: { tds: number; surcharge: number; cess: number; total: number };
    aug: { tds: number; surcharge: number; cess: number; total: number };
    sep: { tds: number; surcharge: number; cess: number; total: number };
    oct: { tds: number; surcharge: number; cess: number; total: number };
    nov: { tds: number; surcharge: number; cess: number; total: number };
    dec: { tds: number; surcharge: number; cess: number; total: number };
    jan: { tds: number; surcharge: number; cess: number; total: number };
    feb: { tds: number; surcharge: number; cess: number; total: number };
    mar: { tds: number; surcharge: number; cess: number; total: number };
  };
  headMasterName: string;
  headMasterFatherName: string;
  headMasterDesignation: string;
  certificationDate: string;
  certificationPlace: string;
}

export interface TaxFormData {
  clientId: string;
  salaryData: SalaryData;
  declarationData: DeclarationData;
  taxCalculationA: TaxCalculationA;
  taxCalculationB: TaxCalculationB;
  form16Data: Form16Data;
  createdAt: string;
  updatedAt: string;
}

// Empty defaults
export const emptyMonthlySalary: MonthlySalary = {
  basic: 0,
  gradePay: 0,
  da: 0,
  hra: 0,
  medical: 0,
  disabilityAllowance: 0,
  principalAllowance: 0,
  daArrears: 0,
  salaryArrears: 0,
  totalSalary: 0,
  gpf: 0,
  cpf: 0,
  professionTax: 0,
  society: 0,
  groupInsurance: 0,
  incomeTax: 0,
  totalDeduction: 0,
  netPay: 0,
};

export const getEmptyTaxFormData = (clientId: string): TaxFormData => ({
  clientId,
  salaryData: {
    financialYear: "2025-2026",
    accountingYear: "01-04-2025 TO 31-03-2026",
    months: {
      apr: { ...emptyMonthlySalary },
      may: { ...emptyMonthlySalary },
      jun: { ...emptyMonthlySalary },
      jul: { ...emptyMonthlySalary },
      aug: { ...emptyMonthlySalary },
      sep: { ...emptyMonthlySalary },
      oct: { ...emptyMonthlySalary },
      nov: { ...emptyMonthlySalary },
      dec: { ...emptyMonthlySalary },
      jan: { ...emptyMonthlySalary },
      feb: { ...emptyMonthlySalary },
      mar: { ...emptyMonthlySalary },
    },
    totals: { ...emptyMonthlySalary },
  },
  declarationData: {
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
  },
  taxCalculationA: {
    grossSalary: 0,
    hraExempt: 0,
    transportAllowance: 0,
    totalExempt: 0,
    balanceSalary: 0,
    professionTax: 0,
    standardDeduction: 50000,
    professionalIncome: 0,
    bankInterest: 0,
    nscInterest: 0,
    fdInterest: 0,
    totalInterestIncome: 0,
    examIncome: 0,
    otherIncome: 0,
    totalOtherIncome: 0,
    housePropertyIncome: 0,
    grossTotalIncome: 0,
    housingLoanInterest: 0,
    proIncome: 0,
  },
  taxCalculationB: {
    gpf: 0,
    cpf: 0,
    licPremium: 0,
    pliPremium: 0,
    groupInsurance: 0,
    ppf: 0,
    nscInvestment: 0,
    housingLoanPrincipal: 0,
    educationFee: 0,
    otherInvestment80C: 0,
    total80C: 0,
    max80C: 150000,
    medicalInsurance80D: 0,
    disabledDependent80DD: 0,
    seriousDisease80DDB: 0,
    disability80U: 0,
    donation80G: 0,
    savingsBankInterest80TTA: 0,
    totalDeductions: 0,
    taxableIncome: 0,
    roundedTaxableIncome: 0,
    taxSlab1: 0,
    taxSlab2: 0,
    taxSlab3: 0,
    totalTax: 0,
    taxRebate87A: 0,
    taxAfterRebate: 0,
    educationCess: 0,
    totalTaxPayable: 0,
    relief89: 0,
    netTaxPayable: 0,
    taxPaid: 0,
    balanceTax: 0,
    recoveredMonth: "",
    totalTaxPaid: 0,
  },
  form16Data: {
    employerName: "EDUCATION DEPARTMENT",
    employerAddress: "",
    employerPan: "",
    employerTan: "RKTT01474E",
    tdsCircle: "",
    quarters: {
      q1: { acknowledgementNo: "", from: "Apr-25", to: "Jun-25" },
      q2: { acknowledgementNo: "", from: "Jul-25", to: "Sep-25" },
      q3: { acknowledgementNo: "", from: "Oct-25", to: "Dec-25" },
      q4: { acknowledgementNo: "", from: "Jan-26", to: "Mar-26" },
    },
    monthlyTds: {
      apr: { tds: 0, surcharge: 0, cess: 0, total: 0 },
      may: { tds: 0, surcharge: 0, cess: 0, total: 0 },
      jun: { tds: 0, surcharge: 0, cess: 0, total: 0 },
      jul: { tds: 0, surcharge: 0, cess: 0, total: 0 },
      aug: { tds: 0, surcharge: 0, cess: 0, total: 0 },
      sep: { tds: 0, surcharge: 0, cess: 0, total: 0 },
      oct: { tds: 0, surcharge: 0, cess: 0, total: 0 },
      nov: { tds: 0, surcharge: 0, cess: 0, total: 0 },
      dec: { tds: 0, surcharge: 0, cess: 0, total: 0 },
      jan: { tds: 0, surcharge: 0, cess: 0, total: 0 },
      feb: { tds: 0, surcharge: 0, cess: 0, total: 0 },
      mar: { tds: 0, surcharge: 0, cess: 0, total: 0 },
    },
    headMasterName: "",
    headMasterFatherName: "",
    headMasterDesignation: "HEAD MASTER",
    certificationDate: "",
    certificationPlace: "",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
