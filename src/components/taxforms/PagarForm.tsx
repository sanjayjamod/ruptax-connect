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
// Yellow cells (manual input) - specific cells from Excel
// IMPORTANT: DA (Row 9) = Basic * 46%, HRA (Row 10) = Basic * 8% - these are FORMULAS not manual!
const yellowCells: { [key: string]: { field: keyof MonthlySalary; months: (typeof months[number])[] } } = {
  // Row 7 - Basic: C7 (apr), G7 (aug) are yellow, rest are formula =C7 or =G7
  basic: { field: 'basic', months: ['apr', 'aug'] },
  // Row 8 - Grade Pay: C8 (apr), G8 (aug) are yellow
  gradePay: { field: 'gradePay', months: ['apr', 'aug'] },
  // Row 9 - DA: ALL FORMULA! C9=C7*46%, D9=C9, E9=C9, F9=C9, G9=G7*50%, H9-K9=G9, L9=L7*53%, M9-N9=L9
  da: { field: 'da', months: [] }, // All formula - calculated from Basic
  // Row 10 - HRA: ALL FORMULA! =Basic*8% for each month
  hra: { field: 'hra', months: [] }, // All formula
  // Row 11 - Medical: C11 (apr) yellow, rest formula =C11
  medical: { field: 'medical', months: ['apr'] },
  // Row 12 - Disability Allowance: all manual
  disabilityAllowance: { field: 'disabilityAllowance', months: months.slice() },
  // Row 13 - Principal Allowance: all manual
  principalAllowance: { field: 'principalAllowance', months: months.slice() },
  // Row 14 - DA Arrears: all manual (varies each month)
  daArrears: { field: 'daArrears', months: months.slice() },
  // Row 15 - Salary Arrears: all manual
  salaryArrears: { field: 'salaryArrears', months: months.slice() },
  // Row 16 - Other Income 1: all manual
  otherIncome1: { field: 'otherIncome1', months: months.slice() },
  // Row 17 - Other Income 2: all manual
  otherIncome2: { field: 'otherIncome2', months: months.slice() },
  // Row 20 - GPF: C20 (apr) yellow, rest formula =C20
  gpf: { field: 'gpf', months: ['apr'] },
  // Row 21 - CPF: C21 (apr) yellow, rest formula =C21
  cpf: { field: 'cpf', months: ['apr'] },
  // Row 22 - Profession Tax: C22 (apr) yellow, rest formula =C22
  professionTax: { field: 'professionTax', months: ['apr'] },
  // Row 23 - Society: C23, E23, G23 yellow (varies)
  society: { field: 'society', months: ['apr', 'jun', 'aug'] },
  // Row 24 - Group Insurance: C24 (apr) yellow, rest formula =C24
  groupInsurance: { field: 'groupInsurance', months: ['apr'] },
  // Row 25 - Income Tax: C25, N25 (apr, mar) yellow, rest formula =C25
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
    
    // DA: C9=C7*46%, D9-F9=C9, G9=G7*50%, H9-K9=G9, L9=L7*53%, M9-N9=L9
    // April DA = April Basic * 46%
    const daApr = Math.round((updated.apr.basic || 0) * 0.46);
    updated.apr.da = daApr;
    ['may', 'jun', 'jul'].forEach(m => {
      updated[m as typeof months[number]].da = daApr;
    });
    
    // August DA = August Basic * 50%
    const daAug = Math.round((updated.aug.basic || 0) * 0.50);
    updated.aug.da = daAug;
    ['sep', 'oct', 'nov', 'dec'].forEach(m => {
      updated[m as typeof months[number]].da = daAug;
    });
    
    // January DA = January Basic * 53%
    const daJan = Math.round((updated.jan.basic || 0) * 0.53);
    updated.jan.da = daJan;
    ['feb', 'mar'].forEach(m => {
      updated[m as typeof months[number]].da = daJan;
    });
    
    // HRA: 8% of Basic for each month
    months.forEach(m => {
      updated[m].hra = Math.round((updated[m].basic || 0) * 0.08);
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
    
    // GPF: copy from April
    const gpfApr = updated.apr.gpf || 0;
    ['may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'].forEach(m => {
      updated[m as typeof months[number]].gpf = gpfApr;
    });
    
    // CPF: copy from April
    const cpfApr = updated.apr.cpf || 0;
    ['may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'].forEach(m => {
      updated[m as typeof months[number]].cpf = cpfApr;
    });
    
    // Profession Tax: copy from April
    const ptApr = updated.apr.professionTax || 0;
    ['may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'].forEach(m => {
      updated[m as typeof months[number]].professionTax = ptApr;
    });
    
    // Society: D23 = C23, F23 = E23, H23-N23 = G23
    const societyApr = updated.apr.society || 0;
    const societyJun = updated.jun.society || 0;
    const societyAug = updated.aug.society || 0;
    updated.may.society = societyApr;
    updated.jul.society = societyJun;
    ['sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'].forEach(m => {
      updated[m as typeof months[number]].society = societyAug;
    });
    
    // Group Insurance: copy from April
    const giApr = updated.apr.groupInsurance || 0;
    ['may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'].forEach(m => {
      updated[m as typeof months[number]].groupInsurance = giApr;
    });
    
    // Income Tax: D25-M25 = C25, N25 is yellow (manual)
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
                                  (updated[m].society || 0) + (updated[m].groupInsurance || 0) + (updated[m].incomeTax || 0);
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
    <div className="tax-form-container tax-form-print" id="pagar-form">
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
          {renderMappedRow(7, "અપંગ એલાઉન્સ", "disabilityAllowance")}
          {renderMappedRow(8, "આચાર્ય એલાઉન્સ", "principalAllowance")}
          {renderMappedRow(9, "મોંઘવારી એરિયર્સ", "daArrears")}
          {renderMappedRow(10, "પગાર એરિયર્સ", "salaryArrears")}
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
          {renderMappedRow(17, "મંડળી", "society")}
          {renderMappedRow(18, "જૂથ વિમા પ્રિમિયમ", "groupInsurance")}
          {renderMappedRow(19, "ઇન્કમટેક્ષ કપાત", "incomeTax")}
          
          {/* Total Deduction Row */}
          {renderAutoRow(20, "કુલ કપાત", "totalDeduction")}
          
          {/* Net Pay Row */}
          {renderAutoRow(21, "ચુકવેલ રકમ", "netPay")}
        </tbody>
      </table>

      {/* Signature Section */}
      <div className="flex justify-between mt-4 text-[10px]">
        <div>
          <p>સ્થળ: {client.schoolNameGujarati || client.schoolName || '_____________'}</p>
          <p>તારીખ: _______________</p>
        </div>
        <div className="text-right">
          <p className="mt-8 border-t border-black pt-1">સંસ્થાના વડાની સહી</p>
        </div>
      </div>

      <div className="text-center text-[8px] mt-4 pt-2 border-t border-dashed border-gray-400 form-footer">
        Created By: Smart Computer Vinchhiya 9924640689, 9574031243
      </div>
    </div>
  );
};

export default PagarForm;
