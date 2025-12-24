import { Client } from "@/types/client";
import { TaxFormData } from "@/types/taxForm";
import "./PrintStyles.css";

interface AavakVeraFormAProps {
  client: Client;
  formData: TaxFormData;
  onChange: (data: TaxFormData) => void;
  readOnly?: boolean;
  isManualMode?: boolean;
}

const AavakVeraFormA = ({ client, formData, onChange, readOnly = false, isManualMode = false }: AavakVeraFormAProps) => {
  const taxA = formData.taxCalculationA;

  const updateField = (field: keyof typeof formData.taxCalculationA, value: number) => {
    onChange({
      ...formData,
      taxCalculationA: { ...formData.taxCalculationA, [field]: value },
    });
  };

  const renderManualInputField = (field: keyof typeof taxA, value: number) => (
    readOnly ? (
      <span>{value || 0}</span>
    ) : (
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        defaultValue={value || ''}
        onBlur={(e) => updateField(field, Number(e.target.value) || 0)}
        className="w-20 h-5 text-xs text-right p-1 border-0 bg-yellow-100 inline-block focus:outline-none focus:bg-yellow-200 print:bg-transparent"
        title="Manual Input"
      />
    )
  );

  const renderAutoField = (value: number) => (
    <span className="text-blue-800 font-medium">{value || 0}</span>
  );

  return (
    <div className="tax-form-container tax-form-print" id="aavak-vera-form-a">
      <div className="text-center font-bold text-lg mb-1">આવક વેરા ગણતરી ફોર્મ</div>
      <div className="text-center text-xs mb-2">INCOME TAX CALCULATION FORM - PART A</div>
      <div className="text-center text-[10px] mb-3 border-b border-black pb-2">
        Assessment Year: {client.assessmentYear || '2026-2027'} | Financial Year: {formData.salaryData.financialYear}
      </div>

      {/* Header Info - Two Column Layout like Form 16 */}
      <table className="mb-3" style={{ fontSize: '10px' }}>
        <tbody>
          <tr>
            <td className="w-1/2 align-top border border-black p-2">
              <p className="font-bold mb-1">Employee Details / કર્મચારીની વિગત</p>
              <p><strong>Name:</strong> {client.name}</p>
              <p><strong>Designation:</strong> {client.designation || '-'}</p>
              <p><strong>School:</strong> {client.schoolName || '-'}</p>
              <p><strong>Place:</strong> {client.place || '-'}</p>
              <p className="mt-1"><strong>PAN No:</strong> {client.panNo || '-'}</p>
              <p><strong>Aadhar No:</strong> {client.aadharNo || '-'}</p>
            </td>
            <td className="w-1/2 align-top border border-black p-2">
              <p className="font-bold mb-1">Bank & Contact Details</p>
              <p><strong>Bank A/C:</strong> {client.bankAcNo || '-'}</p>
              <p><strong>IFSC Code:</strong> {client.ifscCode || '-'}</p>
              <p><strong>Mobile:</strong> {client.mobileNo || '-'}</p>
              <p><strong>DOB:</strong> {client.dateOfBirth || '-'}</p>
              <p className="mt-1"><strong>Pay Center:</strong> {client.payCenterName || '-'}</p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Section A - Salary Income */}
      <div className="font-bold text-[11px] mb-1 bg-gray-200 p-1">
        વિભાગ (A) - પગાર આવક / SALARY INCOME
      </div>
      <table style={{ fontSize: '10px' }}>
        <tbody>
          <tr>
            <td className="w-8">1</td>
            <td>કુલ ગ્રોસ આવક / Gross Salary as per Rule 17</td>
            <td className="text-right w-10">RS.</td>
            <td className="amount-cell w-24">{renderAutoField(taxA.grossSalary)}</td>
          </tr>
          <tr>
            <td colSpan={4} className="font-bold bg-gray-100">કલમ ૧૦ મુજબ બાદ પાત્ર / Less: Exemptions u/s 10</td>
          </tr>
          <tr>
            <td></td>
            <td>(a) HRA Exempt / ઘરભાડું બાદ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{renderAutoField(taxA.hraExempt)}</td>
          </tr>
          <tr>
            <td></td>
            <td>(b) Transport Allowance / ટ્રાન્સપોર્ટ ભથ્થું</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{renderAutoField(taxA.transportAllowance)}</td>
          </tr>
          <tr className="total-row">
            <td></td>
            <td>(c) Total Exempt / કુલ બાદ પાત્ર</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{renderAutoField(taxA.totalExempt)}</td>
          </tr>
          <tr className="total-row">
            <td>2</td>
            <td>Balance Salary (1-1c) / બાકી પગાર</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{renderAutoField(taxA.balanceSalary || taxA.grossSalary)}</td>
          </tr>
          <tr>
            <td>3</td>
            <td>Standard Deduction (New Regime) / સ્ટાન્ડર્ડ ડિડક્શન</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{renderAutoField(taxA.standardDeduction || 75000)}</td>
          </tr>
          <tr className="total-row">
            <td>4</td>
            <td>Net Salary Income (2-3) / ચોખ્ખી પગાર આવક</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{renderAutoField(taxA.professionalIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Section B - Other Income */}
      <div className="font-bold text-[11px] mt-2 mb-1 bg-gray-200 p-1">
        વિભાગ (B) - અન્ય આવક / OTHER INCOME
      </div>
      <table style={{ fontSize: '10px' }}>
        <tbody>
          <tr>
            <td className="w-8">5</td>
            <td>Interest Income / વ્યાજ આવક</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td className="bg-yellow-50 print:bg-transparent">(a) Bank Interest (Savings) / બેંક વ્યાજ</td>
            <td className="text-right w-10">RS.</td>
            <td className="amount-cell w-24 bg-yellow-100 print:bg-transparent">
              {renderManualInputField("bankInterest", taxA.bankInterest)}
            </td>
          </tr>
          <tr>
            <td></td>
            <td className="bg-yellow-50 print:bg-transparent">(b) NSC Interest / એન.એસ.સી. વ્યાજ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell bg-yellow-100 print:bg-transparent">
              {renderManualInputField("nscInterest", taxA.nscInterest)}
            </td>
          </tr>
          <tr>
            <td></td>
            <td className="bg-yellow-50 print:bg-transparent">(c) FD Interest / ફિક્સ ડિપોઝિટ વ્યાજ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell bg-yellow-100 print:bg-transparent">
              {renderManualInputField("fdInterest", taxA.fdInterest)}
            </td>
          </tr>
          <tr className="total-row">
            <td></td>
            <td>(d) Total Interest Income / કુલ વ્યાજ આવક</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{renderAutoField(taxA.totalInterestIncome)}</td>
          </tr>
          <tr>
            <td>6</td>
            <td className="bg-yellow-50 print:bg-transparent">Exam Income / પરીક્ષાનું મહેનતાણું</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell bg-yellow-100 print:bg-transparent">
              {renderManualInputField("examIncome", taxA.examIncome)}
            </td>
          </tr>
          <tr>
            <td>7</td>
            <td className="bg-yellow-50 print:bg-transparent">House Property Income / મકાન મિલકત આવક</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell bg-yellow-100 print:bg-transparent">
              {renderManualInputField("housePropertyIncome", taxA.housePropertyIncome)}
            </td>
          </tr>
          <tr className="total-row">
            <td>8</td>
            <td>Total Other Income (5d+6+7) / કુલ અન્ય આવક</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{renderAutoField(taxA.totalOtherIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Section C - Gross Total Income */}
      <div className="font-bold text-[11px] mt-2 mb-1 bg-gray-200 p-1">
        વિભાગ (C) - કુલ આવક / GROSS TOTAL INCOME
      </div>
      <table style={{ fontSize: '10px' }}>
        <tbody>
          <tr className="total-row">
            <td className="w-8">9</td>
            <td>Gross Total Income (4+8) / કુલ આવક</td>
            <td className="text-right w-10">RS.</td>
            <td className="amount-cell font-bold w-24">{renderAutoField(taxA.grossTotalIncome)}</td>
          </tr>
          <tr>
            <td>10</td>
            <td className="bg-yellow-50 print:bg-transparent">Less: Housing Loan Interest u/s 24 / મકાન લોન વ્યાજ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell bg-yellow-100 print:bg-transparent">
              {renderManualInputField("housingLoanInterest", taxA.housingLoanInterest)}
            </td>
          </tr>
          <tr className="total-row">
            <td>11</td>
            <td className="font-bold">Net Income Before Deductions (9-10) / ચોખ્ખી આવક</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{renderAutoField(taxA.proIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Signature Section */}
      <div className="flex justify-between mt-4 text-[10px]">
        <div>
          <p className="mb-6">કર્મચારીની સહી / Employee Signature</p>
          <p>Date: _______________</p>
        </div>
        <div className="text-right">
          <p className="mb-6">સંસ્થાના વડાની સહી / Head of Institution</p>
          <p>Seal & Date: _______________</p>
        </div>
      </div>

      <div className="form-footer text-center text-[8px] mt-2 pt-2 border-t border-dashed border-gray-400">
        Created By: Smart Computer Vinchhiya 9924640689, 9574031243
      </div>
    </div>
  );
};

export default AavakVeraFormA;