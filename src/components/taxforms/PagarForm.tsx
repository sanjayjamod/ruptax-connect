import { Client } from "@/types/client";
import { TaxFormData, MonthlySalary } from "@/types/taxForm";
import { Input } from "@/components/ui/input";
import "./PrintStyles.css";

interface PagarFormProps {
  client: Client;
  formData: TaxFormData;
  onChange: (data: TaxFormData) => void;
  readOnly?: boolean;
}

const months = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'] as const;
const monthNames = ['એપ્રિલ', 'મે', 'જુન', 'જુલાઇ', 'ઑગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર', 'જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ'];

const PagarForm = ({ client, formData, onChange, readOnly = false }: PagarFormProps) => {
  const updateMonthField = (month: typeof months[number], field: keyof MonthlySalary, value: number) => {
    const newMonths = { ...formData.salaryData.months };
    newMonths[month] = { ...newMonths[month], [field]: value };
    
    // Calculate totals for the month
    const m = newMonths[month];
    m.totalSalary = (m.basic || 0) + (m.gradePay || 0) + (m.da || 0) + (m.hra || 0) + (m.medical || 0) + 
                    (m.disabilityAllowance || 0) + (m.principalAllowance || 0) + (m.daArrears || 0) + (m.salaryArrears || 0);
    m.totalDeduction = (m.gpf || 0) + (m.cpf || 0) + (m.professionTax || 0) + (m.society || 0) + 
                       (m.groupInsurance || 0) + (m.incomeTax || 0);
    m.netPay = m.totalSalary - m.totalDeduction;

    onChange({
      ...formData,
      salaryData: { ...formData.salaryData, months: newMonths },
    });
  };

  const calculateColumnTotal = (field: keyof MonthlySalary): number => {
    return months.reduce((sum, month) => sum + (Number(formData.salaryData.months[month][field]) || 0), 0);
  };

  const InputCell = ({ month, field }: { month: typeof months[number]; field: keyof MonthlySalary }) => (
    <td className="amount-cell">
      {readOnly ? (
        <span>{formData.salaryData.months[month][field] || ''}</span>
      ) : (
        <Input
          type="number"
          value={formData.salaryData.months[month][field] || ''}
          onChange={(e) => updateMonthField(month, field, Number(e.target.value) || 0)}
          className="w-full h-5 text-[9px] text-right p-0.5 border-0 bg-transparent"
        />
      )}
    </td>
  );

  return (
    <div className="tax-form-container tax-form-print" id="pagar-form">
      {/* Header */}
      <div className="text-center font-bold text-lg mb-2 border-b-2 border-black pb-1">
        {formData.salaryData.financialYear}
      </div>
      
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
          <tr>
            <td className="text-center">1</td>
            <td>બેઝિક પગાર</td>
            {months.map(month => <InputCell key={month} month={month} field="basic" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('basic')}</td>
            <td></td>
          </tr>
          <tr>
            <td className="text-center">2</td>
            <td>ગ્રેડ પે</td>
            {months.map(month => <InputCell key={month} month={month} field="gradePay" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('gradePay')}</td>
            <td></td>
          </tr>
          <tr>
            <td className="text-center">3</td>
            <td>મોંઘવારી ભથ્થું</td>
            {months.map(month => <InputCell key={month} month={month} field="da" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('da')}</td>
            <td></td>
          </tr>
          <tr>
            <td className="text-center">4</td>
            <td>ઘરભાડા ભથ્થું</td>
            {months.map(month => <InputCell key={month} month={month} field="hra" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('hra')}</td>
            <td></td>
          </tr>
          <tr>
            <td className="text-center">6</td>
            <td>મેડીકલ ભથ્થું</td>
            {months.map(month => <InputCell key={month} month={month} field="medical" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('medical')}</td>
            <td></td>
          </tr>
          <tr>
            <td className="text-center">7</td>
            <td>અપંગ એલાઉન્સ</td>
            {months.map(month => <InputCell key={month} month={month} field="disabilityAllowance" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('disabilityAllowance')}</td>
            <td></td>
          </tr>
          <tr>
            <td className="text-center">8</td>
            <td>આચાર્ય એલાઉન્સ</td>
            {months.map(month => <InputCell key={month} month={month} field="principalAllowance" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('principalAllowance')}</td>
            <td></td>
          </tr>
          <tr>
            <td className="text-center">9</td>
            <td>મોંઘવારી એરિયર્સ</td>
            {months.map(month => <InputCell key={month} month={month} field="daArrears" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('daArrears')}</td>
            <td></td>
          </tr>
          <tr>
            <td className="text-center">10</td>
            <td>પગાર એરિયર્સ</td>
            {months.map(month => <InputCell key={month} month={month} field="salaryArrears" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('salaryArrears')}</td>
            <td></td>
          </tr>
          <tr className="total-row">
            <td className="text-center"></td>
            <td className="font-bold">કુલ પગાર</td>
            {months.map(month => (
              <td key={month} className="amount-cell font-bold">
                {formData.salaryData.months[month].totalSalary || 0}
              </td>
            ))}
            <td className="amount-cell font-bold">{calculateColumnTotal('totalSalary')}</td>
            <td></td>
          </tr>

          {/* Deduction Header */}
          <tr className="header-row">
            <td colSpan={16} className="text-center font-bold">કપાત</td>
          </tr>

          {/* Deduction Rows */}
          <tr>
            <td className="text-center">14</td>
            <td>G.P.F.</td>
            {months.map(month => <InputCell key={month} month={month} field="gpf" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('gpf')}</td>
            <td></td>
          </tr>
          <tr>
            <td className="text-center">15</td>
            <td>C.P.F.</td>
            {months.map(month => <InputCell key={month} month={month} field="cpf" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('cpf')}</td>
            <td></td>
          </tr>
          <tr>
            <td className="text-center">16</td>
            <td>વ્યવસાય વેરો</td>
            {months.map(month => <InputCell key={month} month={month} field="professionTax" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('professionTax')}</td>
            <td></td>
          </tr>
          <tr>
            <td className="text-center">17</td>
            <td>મંડળી</td>
            {months.map(month => <InputCell key={month} month={month} field="society" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('society')}</td>
            <td></td>
          </tr>
          <tr>
            <td className="text-center">18</td>
            <td>જૂથ વિમા પ્રિમિયમ</td>
            {months.map(month => <InputCell key={month} month={month} field="groupInsurance" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('groupInsurance')}</td>
            <td></td>
          </tr>
          <tr>
            <td className="text-center">19</td>
            <td>ઇન્કમટેક્ષ કપાત</td>
            {months.map(month => <InputCell key={month} month={month} field="incomeTax" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('incomeTax')}</td>
            <td></td>
          </tr>
          <tr className="total-row">
            <td className="text-center">20</td>
            <td className="font-bold">કુલ કપાત</td>
            {months.map(month => (
              <td key={month} className="amount-cell font-bold">
                {formData.salaryData.months[month].totalDeduction || 0}
              </td>
            ))}
            <td className="amount-cell font-bold">{calculateColumnTotal('totalDeduction')}</td>
            <td></td>
          </tr>
          <tr className="total-row">
            <td className="text-center">21</td>
            <td className="font-bold">ચુકવેલ રકમ</td>
            {months.map(month => (
              <td key={month} className="amount-cell font-bold">
                {formData.salaryData.months[month].netPay || 0}
              </td>
            ))}
            <td className="amount-cell font-bold">{calculateColumnTotal('netPay')}</td>
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
