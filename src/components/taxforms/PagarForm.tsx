import { Client } from "@/types/client";
import { TaxFormData, MonthlySalary } from "@/types/taxForm";
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

// All manually editable fields (Yellow highlight) - each month has independent value
const manualFields: (keyof MonthlySalary)[] = [
  'basic', 'gradePay', 'da', 'hra', 'medical', 'disabilityAllowance', 
  'principalAllowance', 'daArrears', 'salaryArrears', 'otherIncome1', 'otherIncome2',
  'gpf', 'cpf', 'professionTax', 'society', 'groupInsurance', 'incomeTax'
];

// Fields that are auto-calculated (formula) - Gray/Blue highlight
const autoFields: (keyof MonthlySalary)[] = ['totalSalary', 'totalDeduction', 'netPay'];

const PagarForm = ({ client, formData, onChange, readOnly = false, isManualMode = false }: PagarFormProps) => {
  
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

  // Update field for a single month
  const updateMonthField = (month: typeof months[number], field: keyof MonthlySalary, value: number) => {
    const newMonths = { ...formData.salaryData.months };
    newMonths[month] = { ...newMonths[month], [field]: value };
    
    // Auto-calculate totals unless in manual mode and editing auto fields
    if (!isManualMode || !autoFields.includes(field)) {
      newMonths[month] = calculateMonthTotals(newMonths[month]);
    }

    onChange({
      ...formData,
      salaryData: { ...formData.salaryData, months: newMonths },
    });
  };

  const calculateColumnTotal = (field: keyof MonthlySalary): number => {
    return months.reduce((sum, month) => sum + (Number(formData.salaryData.months[month][field]) || 0), 0);
  };

  // Manual input cell - YELLOW background (editable by user)
  const renderManualInputCell = (month: typeof months[number], field: keyof MonthlySalary) => (
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
          className="w-full h-5 text-[9px] text-right p-0.5 border-0 bg-yellow-100 focus:outline-none focus:bg-yellow-200 print:bg-transparent"
          title="Manual Input / હાથે ભરો"
        />
      )}
    </td>
  );

  // Auto-calculated cell - GRAY/BLUE background (not editable by default)
  const renderAutoCell = (month: typeof months[number], field: keyof MonthlySalary) => (
    <td key={`${month}-${field}`} className="amount-cell font-bold">
      {isManualMode && !readOnly ? (
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9.-]*"
          value={formData.salaryData.months[month][field] || ''}
          onChange={(e) => updateMonthField(month, field, Number(e.target.value) || 0)}
          className="w-full h-5 text-[9px] text-right p-0.5 border-0 bg-blue-100 focus:outline-none focus:bg-blue-200 print:bg-transparent"
          title="Manual Override / હાથે ભરો (Manual Mode ON)"
        />
      ) : (
        <span className="text-blue-800 bg-gray-100 block w-full h-5 text-[9px] text-right p-0.5 print:bg-transparent">
          {formData.salaryData.months[month][field] || 0}
        </span>
      )}
    </td>
  );

  // Total column cell - GRAY background (always auto-calculated)
  const renderTotalCell = (field: keyof MonthlySalary) => (
    <td className="amount-cell font-bold bg-gray-200 print:bg-transparent">
      <span>{calculateColumnTotal(field)}</span>
    </td>
  );

  // Render a manual row (all months yellow, individually editable)
  const renderManualRow = (rowNum: number | string, label: string, field: keyof MonthlySalary) => (
    <tr>
      <td className="text-center">{rowNum}</td>
      <td className="bg-yellow-50 font-medium print:bg-transparent">{label}</td>
      {months.map(month => renderManualInputCell(month, field))}
      {renderTotalCell(field)}
      <td></td>
    </tr>
  );

  // Render an auto-calculated row (all months gray/blue, auto-calculated)
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
      
      {/* Mode Indicator (only in edit mode) */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-4 mb-2 text-[10px] no-print">
          <div className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 bg-yellow-100 border border-yellow-400"></span>
            <span>Manual Input / હાથે ભરો (Yellow)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 bg-gray-100 border border-gray-300"></span>
            <span className="text-blue-800">Auto Calculated / ઓટો ગણતરી (Gray)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 bg-gray-200 border border-gray-400"></span>
            <span>Total / કુલ</span>
          </div>
          {isManualMode && (
            <div className="flex items-center gap-1 bg-blue-100 px-2 py-0.5 rounded">
              <span className="text-blue-700 font-semibold">🔓 Manual Mode ON - Auto fields પણ edit થાય છે</span>
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
          {/* Income Rows - All Manual (Yellow) */}
          {renderManualRow(1, "બેઝિક પગાર", "basic")}
          {renderManualRow(2, "ગ્રેડ પે", "gradePay")}
          {renderManualRow(3, "મોંઘવારી ભથ્થું", "da")}
          {renderManualRow(4, "ઘરભાડા ભથ્થું", "hra")}
          {renderManualRow(6, "મેડીકલ ભથ્થું", "medical")}
          {renderManualRow(7, "અપંગ એલાઉન્સ", "disabilityAllowance")}
          {renderManualRow(8, "આચાર્ય એલાઉન્સ", "principalAllowance")}
          {renderManualRow(9, "મોંઘવારી એરિયર્સ", "daArrears")}
          {renderManualRow(10, "પગાર એરિયર્સ", "salaryArrears")}
          {renderManualRow(11, "અન્ય આવક 1", "otherIncome1")}
          {renderManualRow(12, "અન્ય આવક 2", "otherIncome2")}
          
          {/* Total Salary Row - Auto Calculated (Gray) */}
          {renderAutoRow(13, "કુલ પગાર", "totalSalary")}

          {/* Deduction Header */}
          <tr className="header-row">
            <td colSpan={16} className="text-center font-bold">કપાત</td>
          </tr>

          {/* Deduction Rows - All Manual (Yellow) */}
          {renderManualRow(14, "G.P.F.", "gpf")}
          {renderManualRow(15, "C.P.F.", "cpf")}
          {renderManualRow(16, "વ્યવસાય વેરો", "professionTax")}
          {renderManualRow(17, "મંડળી", "society")}
          {renderManualRow(18, "જૂથ વિમા પ્રિમિયમ", "groupInsurance")}
          {renderManualRow(19, "ઇન્કમટેક્ષ કપાત", "incomeTax")}
          
          {/* Total Deduction Row - Auto Calculated (Gray) */}
          {renderAutoRow(20, "કુલ કપાત", "totalDeduction")}
          
          {/* Net Pay Row - Auto Calculated (Gray) */}
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

      <div className="text-center text-[8px] mt-4 pt-2 border-t border-dashed border-gray-400">
        Created By: Smart Computer Vinchhiya - Rupsangbhai Jamod - 9924640689
      </div>
    </div>
  );
};

export default PagarForm;
