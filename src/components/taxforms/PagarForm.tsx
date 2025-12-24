import { Client } from "@/types/client";
import { TaxFormData, MonthlySalary } from "@/types/taxForm";
import { useState } from "react";
import "./PrintStyles.css";

interface PagarFormProps {
  client: Client;
  formData: TaxFormData;
  onChange: (data: TaxFormData) => void;
  readOnly?: boolean;
  isManualMode?: boolean; // Manual mode allows editing auto-calculated fields too
}

const months = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'] as const;
const monthNames = ['એપ્રિલ', 'મે', 'જુન', 'જુલાઇ', 'ઑગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર', 'જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ'];

// First cell (April) - manual entry, yellow highlight - value copies to other months
const firstCellManualFields: (keyof MonthlySalary)[] = [
  'basic', 'gradePay', 'da', 'hra', 'medical', 'disabilityAllowance', 
  'principalAllowance', 'gpf', 'cpf', 'professionTax', 'groupInsurance'
];

// Fields where each month has independent manual entry (yellow highlight)
const independentManualFields: (keyof MonthlySalary)[] = [
  'daArrears', 'salaryArrears', 'otherIncome1', 'otherIncome2', 'society', 'incomeTax'
];

// Fields that are auto-calculated (formula) - gray/blue
const autoFields: (keyof MonthlySalary)[] = ['totalSalary', 'totalDeduction', 'netPay'];

const PagarForm = ({ client, formData, onChange, readOnly = false, isManualMode = false }: PagarFormProps) => {
  // Track which months have been manually edited (to break formula chain)
  const [manualOverrides, setManualOverrides] = useState<Record<string, Set<typeof months[number]>>>({});

  const hasManualOverride = (field: keyof MonthlySalary, month: typeof months[number]): boolean => {
    return manualOverrides[field]?.has(month) || false;
  };

  const calculateMonthTotals = (m: MonthlySalary): MonthlySalary => {
    const updated = { ...m };
    updated.totalSalary = (m.basic || 0) + (m.gradePay || 0) + (m.da || 0) + (m.hra || 0) + (m.medical || 0) + 
                    (m.disabilityAllowance || 0) + (m.principalAllowance || 0) + (m.daArrears || 0) + 
                    (m.salaryArrears || 0) + (m.otherIncome1 || 0) + (m.otherIncome2 || 0);
    updated.totalDeduction = (m.gpf || 0) + (m.cpf || 0) + (m.professionTax || 0) + (m.society || 0) + 
                       (m.groupInsurance || 0) + (m.incomeTax || 0);
    updated.netPay = updated.totalSalary - updated.totalDeduction;
    return updated;
  };

  // Update field for a single month (for independent fields or manual overrides)
  const updateMonthField = (month: typeof months[number], field: keyof MonthlySalary, value: number, markAsOverride = false) => {
    const newMonths = { ...formData.salaryData.months };
    
    // If it's a first-cell-manual field and it's the April cell OR in manual mode
    if (firstCellManualFields.includes(field) && (month === 'apr' || isManualMode)) {
      if (month === 'apr' && !isManualMode) {
        // April value - copy to all subsequent months that don't have manual overrides
        months.forEach((m) => {
          if (!hasManualOverride(field, m)) {
            newMonths[m] = { ...newMonths[m], [field]: value };
          }
        });
      } else {
        // Manual override mode - only update this specific month
        newMonths[month] = { ...newMonths[month], [field]: value };
        if (markAsOverride && month !== 'apr') {
          setManualOverrides(prev => {
            const fieldSet = new Set(prev[field] || []);
            fieldSet.add(month);
            return { ...prev, [field]: fieldSet };
          });
        }
      }
    } else {
      // Independent field or other scenarios - just update this month
      newMonths[month] = { ...newMonths[month], [field]: value };
    }
    
    // Calculate totals for all affected months
    if (!isManualMode || !autoFields.includes(field)) {
      months.forEach((m) => {
        newMonths[m] = calculateMonthTotals(newMonths[m]);
      });
    }

    onChange({
      ...formData,
      salaryData: { ...formData.salaryData, months: newMonths },
    });
  };

  const calculateColumnTotal = (field: keyof MonthlySalary): number => {
    return months.reduce((sum, month) => sum + (Number(formData.salaryData.months[month][field]) || 0), 0);
  };

  // First cell (April) - yellow with special icon, value copies to other months
  const renderFirstCellInput = (field: keyof MonthlySalary) => (
    <td key={`apr-${field}`} className="amount-cell">
      {readOnly ? (
        <span>{formData.salaryData.months.apr[field] || ''}</span>
      ) : (
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={formData.salaryData.months.apr[field] || ''}
          onChange={(e) => updateMonthField('apr', field, Number(e.target.value) || 0)}
          className="w-full h-5 text-[9px] text-right p-0.5 border-0 bg-yellow-200 focus:outline-none focus:bg-yellow-300 print:bg-transparent font-semibold"
          title="Enter value here - copies to all months / અહીં વેલ્યુ દાખલ કરો - બધા મહિનામાં કોપી થશે"
        />
      )}
    </td>
  );

  // Formula cell - shows copied value from April (gray background, non-editable unless manual mode)
  const renderFormulaCellInput = (month: typeof months[number], field: keyof MonthlySalary) => (
    <td key={`${month}-${field}`} className="amount-cell">
      {readOnly ? (
        <span>{formData.salaryData.months[month][field] || ''}</span>
      ) : isManualMode ? (
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={formData.salaryData.months[month][field] || ''}
          onChange={(e) => updateMonthField(month, field, Number(e.target.value) || 0, true)}
          className={`w-full h-5 text-[9px] text-right p-0.5 border-0 focus:outline-none print:bg-transparent ${
            hasManualOverride(field, month) ? 'bg-orange-100 focus:bg-orange-200' : 'bg-blue-50 focus:bg-blue-100'
          }`}
          title={hasManualOverride(field, month) ? "Manual Override" : "Formula: =April / ફોર્મુલા: =એપ્રિલ (Manual Mode ON)"}
        />
      ) : (
        <span className="text-gray-600 bg-gray-100 block w-full h-5 text-[9px] text-right p-0.5 print:bg-transparent" title="Formula: =April / ફોર્મુલા: =એપ્રિલ">
          {formData.salaryData.months[month][field] || ''}
        </span>
      )}
    </td>
  );

  // Independent manual input cell - yellow background (editable by user, each month separate)
  const renderManualInputCell = (month: typeof months[number], field: keyof MonthlySalary) => (
    <td key={`${month}-${field}`} className="amount-cell">
      {readOnly ? (
        <span>{formData.salaryData.months[month][field] || ''}</span>
      ) : (
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={formData.salaryData.months[month][field] || ''}
          onChange={(e) => updateMonthField(month, field, Number(e.target.value) || 0)}
          className="w-full h-5 text-[9px] text-right p-0.5 border-0 bg-yellow-100 focus:outline-none focus:bg-yellow-200 print:bg-transparent"
          title="Manual Input / હાથે ભરો"
        />
      )}
    </td>
  );

  // Auto-calculated cell - shows formula result (not editable by default)
  const renderAutoCell = (month: typeof months[number], field: keyof MonthlySalary) => (
    <td key={`${month}-${field}`} className="amount-cell font-bold bg-gray-50 print:bg-transparent">
      {isManualMode && !readOnly ? (
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={formData.salaryData.months[month][field] || ''}
          onChange={(e) => updateMonthField(month, field, Number(e.target.value) || 0)}
          className="w-full h-5 text-[9px] text-right p-0.5 border-0 bg-blue-50 focus:outline-none focus:bg-blue-100 print:bg-transparent"
          title="Manual Override / હાથે ભરો (Auto mode OFF)"
        />
      ) : (
        <span className="text-blue-800">{formData.salaryData.months[month][field] || 0}</span>
      )}
    </td>
  );

  // Total column cell - always auto-calculated
  const renderTotalCell = (field: keyof MonthlySalary) => (
    <td className="amount-cell font-bold bg-gray-100 print:bg-transparent">
      {isManualMode && !readOnly ? (
        <span className="text-purple-800">{calculateColumnTotal(field)}</span>
      ) : (
        <span>{calculateColumnTotal(field)}</span>
      )}
    </td>
  );

  // Render a row with first-cell formula pattern
  const renderFormulaCopiedRow = (rowNum: number, label: string, field: keyof MonthlySalary) => (
    <tr>
      <td className="text-center">{rowNum}</td>
      <td className="bg-yellow-50 print:bg-transparent">{label}</td>
      {renderFirstCellInput(field)}
      {months.slice(1).map(month => renderFormulaCellInput(month, field))}
      {renderTotalCell(field)}
      <td></td>
    </tr>
  );

  // Render a row with independent manual entry for each month
  const renderIndependentRow = (rowNum: number, label: string, field: keyof MonthlySalary) => (
    <tr>
      <td className="text-center">{rowNum}</td>
      <td className="bg-yellow-50 print:bg-transparent">{label}</td>
      {months.map(month => renderManualInputCell(month, field))}
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
      
      {/* Mode Indicator (only in edit mode) */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-4 mb-2 text-[10px] no-print">
          <div className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 bg-yellow-200 border border-yellow-400 font-bold"></span>
            <span>એપ્રિલ (બધા મહિનામાં કોપી થશે)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 bg-gray-100 border border-gray-300"></span>
            <span className="text-gray-600">Formula =એપ્રિલ</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 bg-yellow-100 border border-yellow-300"></span>
            <span>Manual Input / હાથે ભરો</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 bg-gray-50 border border-blue-300"></span>
            <span className="text-blue-800">Auto Calculated / ઓટો</span>
          </div>
          {isManualMode && (
            <div className="flex items-center gap-1 bg-blue-100 px-2 py-0.5 rounded">
              <span className="text-blue-700 font-semibold">🔓 Manual Override ON - બધા ફીલ્ડ એડિટ થાય છે</span>
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
          {/* Income Rows - Formula Copied (April value copies to all months) */}
          {renderFormulaCopiedRow(1, "બેઝિક પગાર", "basic")}
          {renderFormulaCopiedRow(2, "ગ્રેડ પે", "gradePay")}
          {renderFormulaCopiedRow(3, "મોંઘવારી ભથ્થું", "da")}
          {renderFormulaCopiedRow(4, "ઘરભાડા ભથ્થું", "hra")}
          {renderFormulaCopiedRow(6, "મેડીકલ ભથ્થું", "medical")}
          {renderFormulaCopiedRow(7, "અપંગ એલાઉન્સ", "disabilityAllowance")}
          {renderFormulaCopiedRow(8, "આચાર્ય એલાઉન્સ", "principalAllowance")}
          
          {/* Independent Manual Entry Rows (each month separate) */}
          {renderIndependentRow(9, "મોંઘવારી એરિયર્સ", "daArrears")}
          {renderIndependentRow(10, "પગાર એરિયર્સ", "salaryArrears")}
          {renderIndependentRow(11, "અન્ય આવક 1", "otherIncome1")}
          {renderIndependentRow(12, "અન્ય આવક 2", "otherIncome2")}
          
          {/* Total Salary Row - Auto Calculated (Gray/Blue) */}
          <tr className="total-row">
            <td className="text-center">13</td>
            <td className="font-bold">કુલ પગાર</td>
            {months.map(month => renderAutoCell(month, "totalSalary"))}
            {renderTotalCell('totalSalary')}
            <td></td>
          </tr>

          {/* Deduction Header */}
          <tr className="header-row">
            <td colSpan={16} className="text-center font-bold">કપાત</td>
          </tr>

          {/* Deduction Rows - Formula Copied (April value copies to all months) */}
          {renderFormulaCopiedRow(14, "G.P.F.", "gpf")}
          {renderFormulaCopiedRow(15, "C.P.F.", "cpf")}
          {renderFormulaCopiedRow(16, "વ્યવસાય વેરો", "professionTax")}
          
          {/* Independent Deduction Rows */}
          {renderIndependentRow(17, "મંડળી", "society")}
          
          {renderFormulaCopiedRow(18, "જૂથ વિમા પ્રિમિયમ", "groupInsurance")}
          
          {renderIndependentRow(19, "ઇન્કમટેક્ષ કપાત", "incomeTax")}
          
          {/* Total Deduction Row - Auto Calculated */}
          <tr className="total-row">
            <td className="text-center">20</td>
            <td className="font-bold">કુલ કપાત</td>
            {months.map(month => renderAutoCell(month, "totalDeduction"))}
            {renderTotalCell('totalDeduction')}
            <td></td>
          </tr>
          
          {/* Net Pay Row - Auto Calculated */}
          <tr className="total-row">
            <td className="text-center">21</td>
            <td className="font-bold">ચુકવેલ રકમ</td>
            {months.map(month => renderAutoCell(month, "netPay"))}
            {renderTotalCell('netPay')}
            <td></td>
          </tr>
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

      <div className="text-center text-[8px] mt-4 pt-2 border-t border-dashed border-gray-400">
        Created By: Smart Computer Vinchhiya - Rupsangbhai Jamod - 9924640689
      </div>
    </div>
  );
};

export default PagarForm;