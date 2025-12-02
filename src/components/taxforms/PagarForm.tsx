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
const monthNames = ['એપ્રિલ', 'મે', 'જુન', 'જુલાઇ', 'ઑગષ્ટ', 'સપ્ટેમ્બર', 'ઓકટોમ્બર', 'નવેમ્બર', 'ડિસેમ્બર', 'જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ'];

const PagarForm = ({ client, formData, onChange, readOnly = false }: PagarFormProps) => {
  const updateMonthField = (month: typeof months[number], field: keyof MonthlySalary, value: number) => {
    const newMonths = { ...formData.salaryData.months };
    newMonths[month] = { ...newMonths[month], [field]: value };
    
    // Calculate totals for the month
    const m = newMonths[month];
    m.totalSalary = m.basic + m.gradePay + m.da + m.hra + m.medical + m.disabilityAllowance + m.principalAllowance + m.daArrears + m.salaryArrears;
    m.totalDeduction = m.gpf + m.cpf + m.professionTax + m.society + m.groupInsurance + m.incomeTax;
    m.netPay = m.totalSalary - m.totalDeduction;

    onChange({
      ...formData,
      salaryData: { ...formData.salaryData, months: newMonths },
    });
  };

  const calculateColumnTotal = (field: keyof MonthlySalary): number => {
    return months.reduce((sum, month) => sum + (formData.salaryData.months[month][field] || 0), 0);
  };

  const InputCell = ({ month, field }: { month: typeof months[number]; field: keyof MonthlySalary }) => (
    <td className="amount-cell p-1">
      <Input
        type="number"
        value={formData.salaryData.months[month][field] || ''}
        onChange={(e) => updateMonthField(month, field, Number(e.target.value) || 0)}
        className="w-full h-6 text-xs text-right p-1 border-0 bg-transparent"
        disabled={readOnly}
      />
    </td>
  );

  return (
    <div className="tax-form-container tax-form-print" id="pagar-form">
      <div className="form-title gujarati-text">પગાર સ્લીપ</div>
      
      {/* Header Info */}
      <table className="mb-4">
        <tbody>
          <tr>
            <td className="label-cell w-32 gujarati-text">હિસાબી વર્ષ તા</td>
            <td colSpan={3}>{formData.salaryData.accountingYear}</td>
            <td className="label-cell w-32 text-xs">નોંધ :- માર્ચ પેઈડ ઇન અપ્રિલનું વર્ષ ગણવું</td>
          </tr>
          <tr>
            <td className="label-cell gujarati-text">શાળાનુ નામ</td>
            <td colSpan={2}>{client.schoolNameGujarati || client.schoolName}</td>
            <td className="label-cell gujarati-text">કર્મચારીનું નામ</td>
            <td>{client.nameGujarati || client.name}</td>
          </tr>
          <tr>
            <td className="label-cell gujarati-text">સરનામુ</td>
            <td colSpan={2}>{client.addressGujarati || client.schoolAddress}</td>
            <td className="label-cell gujarati-text">હોદો</td>
            <td>{client.designationGujarati || client.designation}</td>
          </tr>
        </tbody>
      </table>

      {/* Salary Table */}
      <table>
        <thead>
          <tr className="header-row">
            <th className="w-8 gujarati-text">ક્રમ</th>
            <th className="gujarati-text">વેતનની વિગત</th>
            {monthNames.map((name, i) => (
              <th key={i} className="gujarati-text text-xs">{name}</th>
            ))}
            <th className="gujarati-text">કુલ</th>
          </tr>
        </thead>
        <tbody>
          {/* Income Rows */}
          <tr>
            <td className="text-center">1</td>
            <td className="gujarati-text">બેઝિક પગાર</td>
            {months.map(month => <InputCell key={month} month={month} field="basic" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('basic')}</td>
          </tr>
          <tr>
            <td className="text-center">2</td>
            <td className="gujarati-text">ગ્રેડ પે</td>
            {months.map(month => <InputCell key={month} month={month} field="gradePay" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('gradePay')}</td>
          </tr>
          <tr>
            <td className="text-center">3</td>
            <td className="gujarati-text">મોંઘવારી ભથ્થું</td>
            {months.map(month => <InputCell key={month} month={month} field="da" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('da')}</td>
          </tr>
          <tr>
            <td className="text-center">4</td>
            <td className="gujarati-text">ઘરભાડા ભથ્થું</td>
            {months.map(month => <InputCell key={month} month={month} field="hra" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('hra')}</td>
          </tr>
          <tr>
            <td className="text-center">5</td>
            <td className="gujarati-text">મેડીકલ ભથ્થું</td>
            {months.map(month => <InputCell key={month} month={month} field="medical" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('medical')}</td>
          </tr>
          <tr>
            <td className="text-center">6</td>
            <td className="gujarati-text">અપંગ એલા</td>
            {months.map(month => <InputCell key={month} month={month} field="disabilityAllowance" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('disabilityAllowance')}</td>
          </tr>
          <tr>
            <td className="text-center">7</td>
            <td className="gujarati-text">આચાર્ય એલાઉન્સ</td>
            {months.map(month => <InputCell key={month} month={month} field="principalAllowance" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('principalAllowance')}</td>
          </tr>
          <tr>
            <td className="text-center">8</td>
            <td className="gujarati-text">મોંધવારી એરિયર્સ</td>
            {months.map(month => <InputCell key={month} month={month} field="daArrears" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('daArrears')}</td>
          </tr>
          <tr>
            <td className="text-center">9</td>
            <td className="gujarati-text">પગાર એરિયર્સ</td>
            {months.map(month => <InputCell key={month} month={month} field="salaryArrears" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('salaryArrears')}</td>
          </tr>
          <tr className="total-row">
            <td className="text-center">10</td>
            <td className="gujarati-text font-bold">કુલ પગાર</td>
            {months.map(month => (
              <td key={month} className="amount-cell font-bold">
                {formData.salaryData.months[month].totalSalary}
              </td>
            ))}
            <td className="amount-cell font-bold">{calculateColumnTotal('totalSalary')}</td>
          </tr>

          {/* Deduction Header */}
          <tr className="header-row">
            <td colSpan={15} className="gujarati-text font-bold text-center">કપાત</td>
          </tr>

          {/* Deduction Rows */}
          <tr>
            <td className="text-center">11</td>
            <td className="gujarati-text">G.P.F.</td>
            {months.map(month => <InputCell key={month} month={month} field="gpf" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('gpf')}</td>
          </tr>
          <tr>
            <td className="text-center">12</td>
            <td className="gujarati-text">C.P.F.</td>
            {months.map(month => <InputCell key={month} month={month} field="cpf" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('cpf')}</td>
          </tr>
          <tr>
            <td className="text-center">13</td>
            <td className="gujarati-text">વ્યવસાય વેરો</td>
            {months.map(month => <InputCell key={month} month={month} field="professionTax" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('professionTax')}</td>
          </tr>
          <tr>
            <td className="text-center">14</td>
            <td className="gujarati-text">મંડળી</td>
            {months.map(month => <InputCell key={month} month={month} field="society" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('society')}</td>
          </tr>
          <tr>
            <td className="text-center">15</td>
            <td className="gujarati-text">જુથ વિમા પ્રિમિયમ</td>
            {months.map(month => <InputCell key={month} month={month} field="groupInsurance" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('groupInsurance')}</td>
          </tr>
          <tr>
            <td className="text-center">16</td>
            <td className="gujarati-text">ઇન્કમટેક્ષ કપાત</td>
            {months.map(month => <InputCell key={month} month={month} field="incomeTax" />)}
            <td className="amount-cell font-bold">{calculateColumnTotal('incomeTax')}</td>
          </tr>
          <tr className="total-row">
            <td className="text-center">17</td>
            <td className="gujarati-text font-bold">કુલ કપાત</td>
            {months.map(month => (
              <td key={month} className="amount-cell font-bold">
                {formData.salaryData.months[month].totalDeduction}
              </td>
            ))}
            <td className="amount-cell font-bold">{calculateColumnTotal('totalDeduction')}</td>
          </tr>
          <tr className="total-row">
            <td className="text-center">18</td>
            <td className="gujarati-text font-bold">ચુકવેલ રકમ</td>
            {months.map(month => (
              <td key={month} className="amount-cell font-bold">
                {formData.salaryData.months[month].netPay}
              </td>
            ))}
            <td className="amount-cell font-bold">{calculateColumnTotal('netPay')}</td>
          </tr>
        </tbody>
      </table>

      {/* Certificate */}
      <div className="mt-4 p-2 border border-gray-400">
        <p className="gujarati-text text-xs">
          પ્રમાણપત્ર ઉપરોકત વિગત સંસ્થાના હિસાબી દફતર પ્રમાણે બરાબર છે તેમજ આ પત્રકના આડા-ઉભા સરવાળાની ખરાઈ કરેલ છે.
        </p>
      </div>

      {/* Signature Section */}
      <div className="signature-box">
        <div className="signature-item">
          <p className="gujarati-text">સ્થળ: {client.schoolNameGujarati || client.schoolName}</p>
          <p className="gujarati-text">તારીખ: _______________</p>
        </div>
        <div className="signature-item">
          <div className="signature-line gujarati-text">સંસ્થાના વડાની સહી</div>
        </div>
      </div>

      <div className="footer-note">
        Created By: Smart Computer Vinchhiya - Rupsangbhai Jamod-9924640689
      </div>
    </div>
  );
};

export default PagarForm;
