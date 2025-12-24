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

// Fields that are manually filled (yellow highlight)
const manualFields: (keyof MonthlySalary)[] = [
  'basic', 'gradePay', 'da', 'hra', 'medical', 'disabilityAllowance', 
  'principalAllowance', 'daArrears', 'salaryArrears', 'otherIncome1', 'otherIncome2',
  'gpf', 'cpf', 'professionTax', 'society', 'groupInsurance', 'incomeTax'
];

// Fields that are auto-calculated (formula)
const autoFields: (keyof MonthlySalary)[] = ['totalSalary', 'totalDeduction', 'netPay'];

const PagarForm = ({ client, formData, onChange, readOnly = false, isManualMode = false }: PagarFormProps) => {
  const updateMonthField = (month: typeof months[number], field: keyof MonthlySalary, value: number) => {
    const newMonths = { ...formData.salaryData.months };
    newMonths[month] = { ...newMonths[month], [field]: value };
    
    // Calculate totals for the month (only if not in manual mode or if it's an income/deduction field)
    if (!isManualMode || !autoFields.includes(field)) {
      const m = newMonths[month];
      m.totalSalary = (m.basic || 0) + (m.gradePay || 0) + (m.da || 0) + (m.hra || 0) + (m.medical || 0) + 
                      (m.disabilityAllowance || 0) + (m.principalAllowance || 0) + (m.daArrears || 0) + 
                      (m.salaryArrears || 0) + (m.otherIncome1 || 0) + (m.otherIncome2 || 0);
      m.totalDeduction = (m.gpf || 0) + (m.cpf || 0) + (m.professionTax || 0) + (m.society || 0) + 
                         (m.groupInsurance || 0) + (m.incomeTax || 0);
      m.netPay = m.totalSalary - m.totalDeduction;
    }

    onChange({
      ...formData,
      salaryData: { ...formData.salaryData, months: newMonths },
    });
  };

  const calculateColumnTotal = (field: keyof MonthlySalary): number => {
    return months.reduce((sum, month) => sum + (Number(formData.salaryData.months[month][field]) || 0), 0);
  };

  // Manual input cell - yellow background (editable by user)
  const renderManualInputCell = (month: typeof months[number], field: keyof MonthlySalary) => (
    <td key={`${month}-${field}`} className="amount-cell">
      {readOnly ? (
        <span>{formData.salaryData.months[month][field] || ''}</span>
      ) : (
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          defaultValue={formData.salaryData.months[month][field] || ''}
          onBlur={(e) => updateMonthField(month, field, Number(e.target.value) || 0)}
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
          defaultValue={formData.salaryData.months[month][field] || ''}
          onBlur={(e) => updateMonthField(month, field, Number(e.target.value) || 0)}
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

  return (
    <div className="tax-form-container tax-form-print" id="pagar-form">
      {/* Header */}
      <div className="text-center font-bold text-lg mb-2 border-b-2 border-black pb-1">
        {formData.salaryData.financialYear}
      </div>
      
      {/* Mode Indicator (only in edit mode) */}
      {!readOnly && (
        <div className="flex items-center gap-4 mb-2 text-[10px] no-print">
          <div className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 bg-yellow-100 border border-yellow-300"></span>
            <span>Manual Input / હાથે ભરો</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 bg-gray-50 border border-gray-300"></span>
            <span className="text-blue-800">Auto Calculated / ઓટો ગણતરી</span>
          </div>
          {isManualMode && (
            <div className="flex items-center gap-1">
              <span className="inline-block w-4 h-4 bg-blue-50 border border-blue-300"></span>
              <span className="text-blue-600">Manual Override Enabled</span>
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
          {/* Income Rows - Manual Input (Yellow) */}
          <tr>
            <td className="text-center">1</td>
            <td className="bg-yellow-50 print:bg-transparent">બેઝિક પગાર</td>
            {months.map(month => renderManualInputCell(month, "basic"))}
            {renderTotalCell('basic')}
            <td></td>
          </tr>
          <tr>
            <td className="text-center">2</td>
            <td className="bg-yellow-50 print:bg-transparent">ગ્રેડ પે</td>
            {months.map(month => renderManualInputCell(month, "gradePay"))}
            {renderTotalCell('gradePay')}
            <td></td>
          </tr>
          <tr>
            <td className="text-center">3</td>
            <td className="bg-yellow-50 print:bg-transparent">મોંઘવારી ભથ્થું</td>
            {months.map(month => renderManualInputCell(month, "da"))}
            {renderTotalCell('da')}
            <td></td>
          </tr>
          <tr>
            <td className="text-center">4</td>
            <td className="bg-yellow-50 print:bg-transparent">ઘરભાડા ભથ્થું</td>
            {months.map(month => renderManualInputCell(month, "hra"))}
            {renderTotalCell('hra')}
            <td></td>
          </tr>
          <tr>
            <td className="text-center">6</td>
            <td className="bg-yellow-50 print:bg-transparent">મેડીકલ ભથ્થું</td>
            {months.map(month => renderManualInputCell(month, "medical"))}
            {renderTotalCell('medical')}
            <td></td>
          </tr>
          <tr>
            <td className="text-center">7</td>
            <td className="bg-yellow-50 print:bg-transparent">અપંગ એલાઉન્સ</td>
            {months.map(month => renderManualInputCell(month, "disabilityAllowance"))}
            {renderTotalCell('disabilityAllowance')}
            <td></td>
          </tr>
          <tr>
            <td className="text-center">8</td>
            <td className="bg-yellow-50 print:bg-transparent">આચાર્ય એલાઉન્સ</td>
            {months.map(month => renderManualInputCell(month, "principalAllowance"))}
            {renderTotalCell('principalAllowance')}
            <td></td>
          </tr>
          <tr>
            <td className="text-center">9</td>
            <td className="bg-yellow-50 print:bg-transparent">મોંઘવારી એરિયર્સ</td>
            {months.map(month => renderManualInputCell(month, "daArrears"))}
            {renderTotalCell('daArrears')}
            <td></td>
          </tr>
          <tr>
            <td className="text-center">10</td>
            <td className="bg-yellow-50 print:bg-transparent">પગાર એરિયર્સ</td>
            {months.map(month => renderManualInputCell(month, "salaryArrears"))}
            {renderTotalCell('salaryArrears')}
            <td></td>
          </tr>
          <tr>
            <td className="text-center">11</td>
            <td className="bg-yellow-50 print:bg-transparent">અન્ય આવક 1</td>
            {months.map(month => renderManualInputCell(month, "otherIncome1"))}
            {renderTotalCell('otherIncome1')}
            <td></td>
          </tr>
          <tr>
            <td className="text-center">12</td>
            <td className="bg-yellow-50 print:bg-transparent">અન્ય આવક 2</td>
            {months.map(month => renderManualInputCell(month, "otherIncome2"))}
            {renderTotalCell('otherIncome2')}
            <td></td>
          </tr>
          
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

          {/* Deduction Rows - Manual Input (Yellow) */}
          <tr>
            <td className="text-center">14</td>
            <td className="bg-yellow-50 print:bg-transparent">G.P.F.</td>
            {months.map(month => renderManualInputCell(month, "gpf"))}
            {renderTotalCell('gpf')}
            <td></td>
          </tr>
          <tr>
            <td className="text-center">15</td>
            <td className="bg-yellow-50 print:bg-transparent">C.P.F.</td>
            {months.map(month => renderManualInputCell(month, "cpf"))}
            {renderTotalCell('cpf')}
            <td></td>
          </tr>
          <tr>
            <td className="text-center">16</td>
            <td className="bg-yellow-50 print:bg-transparent">વ્યવસાય વેરો</td>
            {months.map(month => renderManualInputCell(month, "professionTax"))}
            {renderTotalCell('professionTax')}
            <td></td>
          </tr>
          <tr>
            <td className="text-center">17</td>
            <td className="bg-yellow-50 print:bg-transparent">મંડળી</td>
            {months.map(month => renderManualInputCell(month, "society"))}
            {renderTotalCell('society')}
            <td></td>
          </tr>
          <tr>
            <td className="text-center">18</td>
            <td className="bg-yellow-50 print:bg-transparent">જૂથ વિમા પ્રિમિયમ</td>
            {months.map(month => renderManualInputCell(month, "groupInsurance"))}
            {renderTotalCell('groupInsurance')}
            <td></td>
          </tr>
          <tr>
            <td className="text-center">19</td>
            <td className="bg-yellow-50 print:bg-transparent">ઇન્કમટેક્ષ કપાત</td>
            {months.map(month => renderManualInputCell(month, "incomeTax"))}
            {renderTotalCell('incomeTax')}
            <td></td>
          </tr>
          
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