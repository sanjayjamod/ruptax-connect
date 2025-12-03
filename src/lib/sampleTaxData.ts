// Sample Tax Form Data for Client 2026354 (JAMOD ROOPASAGNBHAI DHANAJIBHAI)
import { TaxFormData, MonthlySalary, emptyMonthlySalary } from "@/types/taxForm";
import { saveTaxForm, calculateTax } from "./taxFormStorage";

// Create monthly salary data from Excel values
const createMonthlySalary = (
  basic: number, da: number, hra: number, medical: number, 
  daArrears: number, otherIncome1: number, gpf: number, 
  society: number, incomeTax: number
): MonthlySalary => ({
  basic,
  gradePay: 0,
  da,
  hra,
  medical,
  disabilityAllowance: 0,
  principalAllowance: 0,
  daArrears,
  salaryArrears: 0,
  otherIncome1,
  otherIncome2: 0,
  totalSalary: basic + da + hra + medical + daArrears + otherIncome1,
  gpf,
  cpf: 0,
  professionTax: 200,
  society,
  groupInsurance: 800,
  incomeTax,
  totalDeduction: gpf + 200 + society + 800 + incomeTax,
  netPay: 0, // Will be calculated
});

// Sample data for Client 2026354 (from RUPSANGBHAI_NAMUNO Excel)
export const getSampleTaxFormData = (clientId: string): TaxFormData => {
  const months = {
    apr: createMonthlySalary(56900, 26174, 4552, 1000, 6828, 0, 15000, 0, 5000),
    may: createMonthlySalary(56900, 26174, 4552, 1000, 6828, 0, 15000, 0, 5000),
    jun: createMonthlySalary(56900, 26174, 4552, 1000, 4552, 0, 15000, 2000, 5000),
    jul: createMonthlySalary(56900, 26174, 4552, 1000, 0, 0, 15000, 2000, 5000),
    aug: createMonthlySalary(58600, 29300, 4688, 1000, 4552, 0, 15000, 1000, 5000),
    sep: createMonthlySalary(58600, 29300, 4688, 1000, 4552, 0, 15000, 1000, 5000),
    oct: createMonthlySalary(58600, 29300, 4688, 1000, 4552, 0, 15000, 1000, 5000),
    nov: createMonthlySalary(58600, 29300, 4688, 1000, 0, 1500000, 15000, 1000, 5000),
    dec: createMonthlySalary(58600, 29300, 4688, 1000, 0, 25000, 15000, 1000, 5000),
    jan: createMonthlySalary(58600, 31058, 4688, 1000, 8790, 0, 15000, 1000, 5000),
    feb: createMonthlySalary(58600, 31058, 4688, 1000, 0, 0, 15000, 1000, 5000),
    mar: createMonthlySalary(58600, 31058, 4688, 1000, 0, 0, 15000, 1000, 339932),
  };

  // Calculate net pay for each month
  Object.values(months).forEach(m => {
    m.netPay = m.totalSalary - m.totalDeduction;
  });

  const formData: TaxFormData = {
    clientId,
    salaryData: {
      financialYear: "2025-2026",
      accountingYear: "01-04-2025 TO 31-03-2026",
      months,
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
      standardDeduction: 75000,
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
      max80C: 0,
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
      recoveredMonth: "FEB-2026 paid March 2026",
      totalTaxPaid: 0,
    },
    form16Data: {
      employerName: "EDUCATION DEPARTMENT",
      employerAddress: "VINCHHIYA KANYA TA. SHALA, TALUKO VINCHHIYA, DIST RAJKOT",
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
        apr: { tds: 5000, surcharge: 0, cess: 0, total: 5000 },
        may: { tds: 5000, surcharge: 0, cess: 0, total: 5000 },
        jun: { tds: 5000, surcharge: 0, cess: 0, total: 5000 },
        jul: { tds: 5000, surcharge: 0, cess: 0, total: 5000 },
        aug: { tds: 5000, surcharge: 0, cess: 0, total: 5000 },
        sep: { tds: 5000, surcharge: 0, cess: 0, total: 5000 },
        oct: { tds: 5000, surcharge: 0, cess: 0, total: 5000 },
        nov: { tds: 5000, surcharge: 0, cess: 0, total: 5000 },
        dec: { tds: 5000, surcharge: 0, cess: 0, total: 5000 },
        jan: { tds: 5000, surcharge: 0, cess: 0, total: 5000 },
        feb: { tds: 5000, surcharge: 0, cess: 0, total: 5000 },
        mar: { tds: 324742, surcharge: 0, cess: 15190, total: 339932 },
      },
      headMasterName: "BHARATBHAI JADAVBHAI ROJASARA",
      headMasterFatherName: "JADAVBHAI CHHAGANBHAI ROJASARA",
      headMasterDesignation: "HEAD MASTER",
      certificationDate: "31-03-2026",
      certificationPlace: "VINCHHIYA KANYA TA. SHALA",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Calculate all tax values
  return calculateTax(formData);
};

// Fill sample data for a specific client
export const fillSampleDataForClient = (clientId: string): TaxFormData => {
  const formData = getSampleTaxFormData(clientId);
  return saveTaxForm(formData);
};
