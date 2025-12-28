import { Client } from "@/types/client";
import { TaxFormData, MonthlySalary } from "@/types/taxForm";
import "./PrintStyles.css";

interface PagarFormProps {
  client: Client;
  formData: TaxFormData;
  onChange: (data: TaxFormData) => void;
  readOnly?: boolean;
  isManualMode?: boolean;
}

const months = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'] as const;
const monthNames = ['એપ્રિલ', 'મે', 'જુન', 'જુલાઇ', 'ઑગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર', 'જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ'];

// Excel column mapping: C=apr, D=may, E=jun, F=jul, G=aug, H=sep, I=oct, J=nov, K=dec, L=jan, M=feb, N=mar
// Based on Excel 2025-26 structure - Yellow cells are manual input, rest are formula
// DA rates per Excel: Apr=53%, May-Jul=55%, Aug-Oct=55%, Nov-Mar=58%
const yellowCells: { [key: string]: { field: keyof MonthlySalary; months: (typeof months[number])[] } } = {
  // Row 1 - Basic: C7 (apr), G7 (aug) are yellow input, D-F copy from C, H-N copy from G
  basic: { field: 'basic', months: ['apr', 'aug'] },
  // Row 2 - Grade Pay: ALL empty in Excel (not used in 7th pay)
  gradePay: { field: 'gradePay', months: [] },
  // Row 3 - DA: ALL FORMULA! Calculated from Basic with varying DA rates
  da: { field: 'da', months: [] },
  // Row 4 - HRA: ALL FORMULA! =Basic*8% for each month
  hra: { field: 'hra', months: [] },
  // Row 6 - Medical: C6 (apr) yellow, rest copy from April
  medical: { field: 'medical', months: ['apr'] },
  // Row 7 - Disability Allowance (અપંગ એલા.): ONLY Apr yellow, rest copy from Apr
  disabilityAllowance: { field: 'disabilityAllowance', months: ['apr'] },
  // Row 8 - Principal Allowance (આચાર્ય એલા.): ONLY Apr yellow, rest copy from Apr
  principalAllowance: { field: 'principalAllowance', months: ['apr'] },
  // Row 9 - DA Arrears (મોંઘવારી એરિ.): ALL auto-calculated (green/formula cells)
  daArrears: { field: 'daArrears', months: [] },
  // Row 10 - Salary Arrears: ALL manual input
  salaryArrears: { field: 'salaryArrears', months: months.slice() },
  // Row 11 - Other 1: Not used (empty rows in Excel)
  otherIncome1: { field: 'otherIncome1', months: months.slice() },
  // Row 12 - Other 2: Not used
  otherIncome2: { field: 'otherIncome2', months: months.slice() },
  // Row 14 - GPF: C14 (apr) yellow, rest formula =C (copy from Apr)
  gpf: { field: 'gpf', months: ['apr'] },
  // Row 15 - CPF: ALL formula based on (Basic+DA)*10%
  cpf: { field: 'cpf', months: [] },
  // Row 16 - Profession Tax: C16 (apr) yellow, rest formula =C
  professionTax: { field: 'professionTax', months: ['apr'] },
  // Row 17 - Mandali Loan: C17 (apr) yellow, rest formula =C
  mandaliLoan: { field: 'mandaliLoan', months: ['apr'] },
  // Row 18 - Mandali Bachat: C18 (apr) yellow, rest formula =C
  mandaliBachat: { field: 'mandaliBachat', months: ['apr'] },
  // Row 19 - Other Deduction (અન્ય): ALL manual input
  otherDeduction: { field: 'otherDeduction', months: months.slice() },
  // Row 20 - Group Insurance: C20 (apr) yellow, rest formula =C
  groupInsurance: { field: 'groupInsurance', months: ['apr'] },
  // Row 21 - Income Tax: C21 (apr), N21 (mar) yellow, D-M formula =C
  incomeTax: { field: 'incomeTax', months: ['apr', 'mar'] },
};

// Check if a cell is yellow (manual input)
const isYellowCell = (field: keyof MonthlySalary, month: typeof months[number]): boolean => {
  const config = Object.values(yellowCells).find(c => c.field === field);
  return config ? config.months.includes(month) : false;
};

const PagarForm = ({ client, formData, onChange, readOnly = false, isManualMode = false }: PagarFormProps) => {
  
  // Apply formulas to calculate derived values
  const applyFormulas = (newMonths: { [key in typeof months[number]]: MonthlySalary }) => {
    const updated = { ...newMonths };
    
    // Basic: D7-F7 = C7, H7-N7 = G7
    const basicApr = updated.apr.basic || 0;
    const basicAug = updated.aug.basic || 0;
    ['may', 'jun', 'jul'].forEach(m => {
      updated[m as typeof months[number]].basic = basicApr;
    });
    ['sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'].forEach(m => {
      updated[m as typeof months[number]].basic = basicAug;
    });
    
    // Grade Pay: same pattern as Basic
    const gradePayApr = updated.apr.gradePay || 0;
    const gradePayAug = updated.aug.gradePay || 0;
    ['may', 'jun', 'jul'].forEach(m => {
      updated[m as typeof months[number]].gradePay = gradePayApr;
    });
    ['sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'].forEach(m => {
      updated[m as typeof months[number]].gradePay = gradePayAug;
    });
    
    // DA rates per Excel 2025-26:
    // April = Basic * 53%
    // May, Jun, Jul = Basic * 55%  
    // Aug, Sep, Oct = Basic * 55%
    // Nov, Dec, Jan, Feb, Mar = Basic * 58%
    updated.apr.da = Math.round((updated.apr.basic || 0) * 0.53);
    
    ['may', 'jun', 'jul'].forEach(m => {
      updated[m as typeof months[number]].da = Math.round((updated[m as typeof months[number]].basic || 0) * 0.55);
    });
    
    ['aug', 'sep', 'oct'].forEach(m => {
      updated[m as typeof months[number]].da = Math.round((updated[m as typeof months[number]].basic || 0) * 0.55);
    });
    
    ['nov', 'dec', 'jan', 'feb', 'mar'].forEach(m => {
      updated[m as typeof months[number]].da = Math.round((updated[m as typeof months[number]].basic || 0) * 0.58);
    });
    
    // HRA: 8% of Basic for each month
    months.forEach(m => {
      updated[m].hra = Math.round((updated[m].basic || 0) * 0.08);
    });
    
    // Medical: copy from April
    const medicalApr = updated.apr.medical || 0;
    ['may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'].forEach(m => {
      updated[m as typeof months[number]].medical = medicalApr;
    });
    
    // Disability Allowance (અપંગ એલા.): copy from April
    const disabilityApr = updated.apr.disabilityAllowance || 0;
    ['may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'].forEach(m => {
      updated[m as typeof months[number]].disabilityAllowance = disabilityApr;
    });
    
    // Principal Allowance (આચાર્ય એલા.): copy from April
    const principalApr = updated.apr.principalAllowance || 0;
    ['may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'].forEach(m => {
      updated[m as typeof months[number]].principalAllowance = principalApr;
    });
    
    // DA Arrears (મોંઘવારી એરિ.): Auto calculate formulas
    // D14 (May) = April DA * 3% * 2
    // K14 (Jan) = August DA * 3% * 3
    const aprDA = updated.apr.da || 0;
    const augDA = updated.aug.da || 0;
    updated.may.daArrears = Math.round(aprDA * 0.03 * 2);
    updated.jan.daArrears = Math.round(augDA * 0.03 * 3);
    
    // GPF: copy from April
    const gpfApr = updated.apr.gpf || 0;
    ['may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'].forEach(m => {
      updated[m as typeof months[number]].gpf = gpfApr;
    });
    
    // CPF: calculated as ~10% of (Basic + DA) per Excel formula
    months.forEach(m => {
      const basicPlusDA = (updated[m].basic || 0) + (updated[m].da || 0);
      // CPF rate formula: approximately 10% of (Basic + DA)
      updated[m].cpf = Math.round(basicPlusDA * 0.10);
    });
    
    // Profession Tax: copy from April
    const ptApr = updated.apr.professionTax || 0;
    ['may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'].forEach(m => {
      updated[m as typeof months[number]].professionTax = ptApr;
    });
    
    // Mandali Loan: copy from April
    const mandaliLoanApr = updated.apr.mandaliLoan || 0;
    ['may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'].forEach(m => {
      updated[m as typeof months[number]].mandaliLoan = mandaliLoanApr;
    });
    
    // Mandali Bachat: copy from April
    const mandaliBachatApr = updated.apr.mandaliBachat || 0;
    ['may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'].forEach(m => {
      updated[m as typeof months[number]].mandaliBachat = mandaliBachatApr;
    });
    
    // Group Insurance: copy from April
    const giApr = updated.apr.groupInsurance || 0;
    ['may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'].forEach(m => {
      updated[m as typeof months[number]].groupInsurance = giApr;
    });
    
    // Income Tax: D-M = C, N is yellow (manual)
    const itApr = updated.apr.incomeTax || 0;
    ['may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb'].forEach(m => {
      updated[m as typeof months[number]].incomeTax = itApr;
    });
    
    // Calculate totals for each month
    months.forEach(m => {
      updated[m].totalSalary = (updated[m].basic || 0) + (updated[m].gradePay || 0) + (updated[m].da || 0) + 
                              (updated[m].hra || 0) + (updated[m].medical || 0) + (updated[m].disabilityAllowance || 0) + 
                              (updated[m].principalAllowance || 0) + (updated[m].daArrears || 0) + 
                              (updated[m].salaryArrears || 0) + (updated[m].otherIncome1 || 0) + (updated[m].otherIncome2 || 0);
      updated[m].totalDeduction = (updated[m].gpf || 0) + (updated[m].cpf || 0) + (updated[m].professionTax || 0) + 
                                  (updated[m].mandaliLoan || 0) + (updated[m].mandaliBachat || 0) + 
                                  (updated[m].otherDeduction || 0) + (updated[m].groupInsurance || 0) + (updated[m].incomeTax || 0);
      updated[m].netPay = updated[m].totalSalary - updated[m].totalDeduction;
    });
    
    return updated;
  };

  // Update field for a single month
  const updateMonthField = (month: typeof months[number], field: keyof MonthlySalary, value: number) => {
    const newMonths = { ...formData.salaryData.months };
    newMonths[month] = { ...newMonths[month], [field]: value };
    
    // Apply formulas (unless in full manual mode for auto fields)
    const autoFields = ['totalSalary', 'totalDeduction', 'netPay', 'hra'];
    if (!isManualMode || !autoFields.includes(field)) {
      const updatedMonths = applyFormulas(newMonths);
      onChange({
        ...formData,
        salaryData: { ...formData.salaryData, months: updatedMonths },
      });
    } else {
      onChange({
        ...formData,
        salaryData: { ...formData.salaryData, months: newMonths },
      });
    }
  };

  const calculateColumnTotal = (field: keyof MonthlySalary): number => {
    return months.reduce((sum, month) => sum + (Number(formData.salaryData.months[month][field]) || 0), 0);
  };

  // Yellow cell - manual input
  const renderYellowCell = (month: typeof months[number], field: keyof MonthlySalary) => (
    <td key={`${month}-${field}`} className="amount-cell">
      {readOnly ? (
        <span>{formData.salaryData.months[month][field] || ''}</span>
      ) : (
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9.-]*"
          value={formData.salaryData.months[month][field] || ''}
          onChange={(e) => updateMonthField(month, field, Number(e.target.value) || 0)}
          className="w-full h-5 text-[9px] text-right p-0.5 border-0 bg-yellow-200 focus:outline-none focus:bg-yellow-300 print:bg-transparent"
          title="Manual Input / હાથે ભરો"
        />
      )}
    </td>
  );

  // Gray cell - formula (not directly editable unless manual mode)
  const renderGrayCell = (month: typeof months[number], field: keyof MonthlySalary) => (
    <td key={`${month}-${field}`} className="amount-cell">
      {isManualMode && !readOnly ? (
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9.-]*"
          value={formData.salaryData.months[month][field] || ''}
          onChange={(e) => updateMonthField(month, field, Number(e.target.value) || 0)}
          className="w-full h-5 text-[9px] text-right p-0.5 border-0 bg-blue-100 focus:outline-none focus:bg-blue-200 print:bg-transparent"
          title="Formula Override / ફોર્મ્યુલા ઓવરરાઇડ"
        />
      ) : (
        <span className="block w-full h-5 text-[9px] text-right p-0.5 bg-gray-100 print:bg-transparent">
          {formData.salaryData.months[month][field] || 0}
        </span>
      )}
    </td>
  );

  // Auto-calculated cell (totals) - always formula
  const renderAutoCell = (month: typeof months[number], field: keyof MonthlySalary) => (
    <td key={`${month}-${field}`} className="amount-cell font-bold">
      {isManualMode && !readOnly ? (
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9.-]*"
          value={formData.salaryData.months[month][field] || ''}
          onChange={(e) => updateMonthField(month, field, Number(e.target.value) || 0)}
          className="w-full h-5 text-[9px] text-right p-0.5 border-0 bg-blue-200 focus:outline-none focus:bg-blue-300 print:bg-transparent font-bold"
          title="Total Override / કુલ ઓવરરાઇડ"
        />
      ) : (
        <span className="block w-full h-5 text-[9px] text-right p-0.5 bg-gray-200 print:bg-transparent font-bold">
          {formData.salaryData.months[month][field] || 0}
        </span>
      )}
    </td>
  );

  // Total column cell
  const renderTotalCell = (field: keyof MonthlySalary) => (
    <td className="amount-cell font-bold bg-gray-300 print:bg-transparent">
      <span>{calculateColumnTotal(field)}</span>
    </td>
  );

  // Render a row with yellow/gray cells based on Excel mapping
  const renderMappedRow = (rowNum: number | string, label: string, field: keyof MonthlySalary) => (
    <tr>
      <td className="text-center">{rowNum}</td>
      <td className="font-medium print:bg-transparent">{label}</td>
      {months.map(month => 
        isYellowCell(field, month) 
          ? renderYellowCell(month, field) 
          : renderGrayCell(month, field)
      )}
      {renderTotalCell(field)}
      <td></td>
    </tr>
  );

  // Render an auto-calculated row (totals)
  const renderAutoRow = (rowNum: number | string, label: string, field: keyof MonthlySalary) => (
    <tr className="total-row">
      <td className="text-center">{rowNum}</td>
      <td className="font-bold">{label}</td>
      {months.map(month => renderAutoCell(month, field))}
      {renderTotalCell(field)}
      <td></td>
    </tr>
  );

  return (
    <div className="tax-form-container tax-form-print pagar-page" id="pagar-form">
      {/* Header */}
      <div className="text-center font-bold text-lg mb-2 border-b-2 border-black pb-1">
        {formData.salaryData.financialYear}
      </div>
      
      {/* Mode Indicator */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-4 mb-2 text-[10px] no-print">
          <div className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 bg-yellow-200 border border-yellow-400"></span>
            <span>Manual Input / હાથે ભરો</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 bg-gray-100 border border-gray-300"></span>
            <span>Formula / ફોર્મ્યુલા</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 bg-gray-200 border border-gray-400"></span>
            <span>Total / કુલ</span>
          </div>
          {isManualMode && (
            <div className="flex items-center gap-1 bg-blue-100 px-2 py-0.5 rounded">
              <span className="text-blue-700 font-semibold">🔓 Manual Mode ON</span>
            </div>
          )}
        </div>
      )}
      
      {/* Info Row */}
      <table className="mb-2" style={{ fontSize: '10px' }}>
        <tbody>
          <tr>
            <td className="font-bold w-24">હિસાબી વર્ષ તા</td>
            <td>{formData.salaryData.accountingYear}</td>
            <td className="text-right text-[9px]">નોંધ :- માર્ચ પેઈડ ઇન અપ્રિલનું વર્ષ ગણવું</td>
          </tr>
        </tbody>
      </table>

      <table className="mb-2" style={{ fontSize: '10px' }}>
        <tbody>
          <tr>
            <td className="font-bold w-24">શાળાનું નામ:</td>
            <td>{client.schoolNameGujarati || client.schoolName || '-'}</td>
            <td className="font-bold w-28">કર્મચારીનું નામ:</td>
            <td>{client.nameGujarati || client.name}</td>
          </tr>
          <tr>
            <td className="font-bold">સરનામું:</td>
            <td>{client.addressGujarati || client.schoolAddress || '-'}</td>
            <td className="font-bold">હોદ્દો:</td>
            <td>{client.designationGujarati || client.designation || '-'}</td>
          </tr>
        </tbody>
      </table>

      {/* Main Salary Table */}
      <table style={{ fontSize: '8px' }}>
        <thead>
          <tr className="header-row">
            <th className="w-6">ક્રમ</th>
            <th className="text-left" style={{ minWidth: '80px' }}>વેતનની વિગત</th>
            {monthNames.map((name, i) => (
              <th key={i} style={{ minWidth: '45px' }}>{name}</th>
            ))}
            <th style={{ minWidth: '50px' }}>કુલ</th>
            <th className="w-8">નોંધ</th>
          </tr>
        </thead>
        <tbody>
          {/* Income Rows */}
          {renderMappedRow(1, "બેઝિક પગાર", "basic")}
          {renderMappedRow(2, "ગ્રેડ પે", "gradePay")}
          {renderMappedRow(3, "મોંઘવારી ભથ્થું", "da")}
          {renderMappedRow(4, "ઘરભાડા ભથ્થું", "hra")}
          {renderMappedRow(6, "મેડીકલ ભથ્થું", "medical")}
          {renderMappedRow(7, "અપંગ એલા.", "disabilityAllowance")}
          {renderMappedRow(8, "આચાર્ય એલા.", "principalAllowance")}
          {renderMappedRow(9, "મોંઘવારી એરિ.", "daArrears")}
          {renderMappedRow(10, "પગાર એરિ.", "salaryArrears")}
          {renderMappedRow(11, "અન્ય આવક 1", "otherIncome1")}
          {renderMappedRow(12, "અન્ય આવક 2", "otherIncome2")}
          
          {/* Total Salary Row */}
          {renderAutoRow(13, "કુલ પગાર", "totalSalary")}

          {/* Deduction Header */}
          <tr className="header-row">
            <td colSpan={16} className="text-center font-bold">કપાત</td>
          </tr>

          {/* Deduction Rows */}
          {renderMappedRow(14, "G.P.F.", "gpf")}
          {renderMappedRow(15, "C.P.F.", "cpf")}
          {renderMappedRow(16, "વ્યવસાય વેરો", "professionTax")}
          {renderMappedRow(17, "મંડળી લોન", "mandaliLoan")}
          {renderMappedRow(18, "મંડળી બચત", "mandaliBachat")}
          {renderMappedRow(19, "અન્ય", "otherDeduction")}
          {renderMappedRow(20, "જૂથ વિમા પ્રિમિયમ", "groupInsurance")}
          {renderMappedRow(21, "ઇન્કમટેક્ષ કપાત", "incomeTax")}
          
          {/* Total Deduction Row */}
          {renderAutoRow(22, "કુલ કપાત", "totalDeduction")}
          
          {/* Net Pay Row */}
          {renderAutoRow(23, "ચુકવેલ રકમ", "netPay")}
        </tbody>
      </table>

      {/* Signature Section - More space from table */}
      <div className="flex justify-between items-end mt-16 pt-8 text-[10px]">
        <div>
          <p className="mb-2">સ્થળ: {client.schoolNameGujarati || client.schoolName || '_____________'}</p>
          <p className="mb-8">તારીખ: _______________</p>
          <p className="border-t border-black pt-1">કર્મચારીની સહી</p>
        </div>
        <div className="text-right flex flex-col justify-end">
          <p className="border-t border-black pt-1">આચાર્યની સહી</p>
        </div>
      </div>

      <div className="form-footer text-center text-[8px] mt-8 pt-2 border-t border-dashed border-gray-400">
        Developed by - Smart Computer - 9924640689 ,9574031243
      </div>
    </div>
  );
};

export default PagarForm;
