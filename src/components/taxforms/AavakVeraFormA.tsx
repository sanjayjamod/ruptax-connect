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

// Manual fields that user can edit (yellow)
const manualFields = ['bankInterest', 'nscInterest', 'fdInterest', 'examIncome', 'otherIncome', 'housePropertyIncome', 'housingLoanInterest'];

// Auto-calculated fields (gray/blue)
const autoFields = ['grossSalary', 'hraExempt', 'transportAllowance', 'totalExempt', 'balanceSalary', 'standardDeduction', 'professionalIncome', 'totalInterestIncome', 'totalOtherIncome', 'grossTotalIncome', 'proIncome'];

const AavakVeraFormA = ({ client, formData, onChange, readOnly = false, isManualMode = false }: AavakVeraFormAProps) => {
  const taxA = formData.taxCalculationA;

  const updateField = (field: keyof typeof formData.taxCalculationA, value: number) => {
    onChange({
      ...formData,
      taxCalculationA: { ...formData.taxCalculationA, [field]: value },
    });
  };

  // Manual input field - yellow background
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
        title="Manual Input / હાથે ભરો"
      />
    )
  );

  // Auto-calculated field - gray/blue background
  const renderAutoField = (field: keyof typeof taxA, value: number) => (
    isManualMode && !readOnly ? (
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        defaultValue={value || ''}
        onBlur={(e) => updateField(field, Number(e.target.value) || 0)}
        className="w-20 h-5 text-xs text-right p-1 border-0 bg-blue-50 inline-block focus:outline-none focus:bg-blue-100 print:bg-transparent"
        title="Manual Override / હાથે ભરો"
      />
    ) : (
      <span className="text-blue-800 font-medium">{value || 0}</span>
    )
  );

  return (
    <div className="tax-form-container tax-form-print" id="aavak-vera-form-a">
      <div className="text-center font-bold text-lg mb-3 border-b-2 border-black pb-1">
        આવક વેરા ગણતરી ફોર્મ
      </div>

      {/* Mode Indicator */}
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
        </div>
      )}

      {/* Header Info */}
      <table className="mb-3" style={{ fontSize: '11px' }}>
        <tbody>
          <tr>
            <td className="font-bold w-28">NAME:</td>
            <td colSpan={2} className="font-bold">{client.name}</td>
            <td></td>
          </tr>
          <tr>
            <td className="font-bold">INCOME YEAR:</td>
            <td>{formData.salaryData.financialYear}</td>
            <td className="font-bold">ASSESSMENT YEAR:</td>
            <td>{client.assessmentYear || '2026-2027'}</td>
          </tr>
          <tr>
            <td className="font-bold">VILLAGE:</td>
            <td>{client.schoolName || '-'}</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td className="font-bold">DESIGNATION:</td>
            <td>{client.designation || '-'}</td>
            <td className="font-bold">DATE OF BIRTH:</td>
            <td>{client.dateOfBirth || '-'}</td>
          </tr>
          <tr>
            <td className="font-bold">PAN NO.:</td>
            <td>{client.panNo || '-'}</td>
            <td className="font-bold">MOBILE NO:</td>
            <td>{client.mobileNo || '-'}</td>
          </tr>
          <tr>
            <td className="font-bold">BANK ACC.NO:</td>
            <td>{client.bankAcNo || '-'}</td>
            <td className="font-bold">AADHAR NO:</td>
            <td>{client.aadharNo || '-'}</td>
          </tr>
          <tr>
            <td className="font-bold">IFSC CODE:</td>
            <td>{client.ifscCode || '-'}</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {/* Section A - Salary Income */}
      <table style={{ fontSize: '10px' }}>
        <tbody>
          <tr className="header-row">
            <td colSpan={3} className="font-bold">કુલ ગ્રોસ આવક: AS PER RULE 17</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold w-24 bg-gray-50 print:bg-transparent">
              {renderAutoField('grossSalary', taxA.grossSalary)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Section 10 Exemptions */}
      <div className="font-bold text-[11px] mt-2 mb-1 bg-gray-200 p-1">
        કલમ ૧૦ મુજબ બાદ પાત્ર કરમુક્ત ભથ્થાઓ
      </div>
      
      <table style={{ fontSize: '10px' }}>
        <tbody>
          <tr>
            <td className="w-8">(a)</td>
            <td colSpan={2}>ઘરભાડું ભાડાના મકાનમાં રહેતા હોઈ તો જ RULE 10(13-A)</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td className="w-8">(I)</td>
            <td>પગાર બીલેથી મળેલ ઘરભાડું</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell w-20 bg-gray-50 print:bg-transparent">{renderAutoField('hraExempt', taxA.hraExempt)}</td>
          </tr>
          <tr>
            <td></td>
            <td>(VII)</td>
            <td>બાદ મળવા પાત્ર ઘરભાડું</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell bg-gray-50 print:bg-transparent">{renderAutoField('hraExempt', taxA.hraExempt)}</td>
          </tr>
          <tr>
            <td>(b)</td>
            <td colSpan={2}>ડ્રેસ ધોલાઈ ભથ્થું</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>(c)</td>
            <td colSpan={2}>ટ્રાન્સપોર્ટ એલા. વાર્ષિક રૂ.9600 ની મર્યાદા</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell bg-gray-50 print:bg-transparent">{renderAutoField('transportAllowance', taxA.transportAllowance)}</td>
          </tr>
          <tr>
            <td>(d)</td>
            <td colSpan={2} className="font-bold">કુલ રકમ 10 હેઠળ બાદ મળવા પાત્ર ભથ્થાઓ</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell font-bold bg-gray-50 print:bg-transparent">{renderAutoField('totalExempt', taxA.totalExempt)}</td>
          </tr>
          <tr className="total-row">
            <td colSpan={3}>બાકી પગાર આવક (Column:1-2(d))</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold bg-gray-100 print:bg-transparent">{renderAutoField('balanceSalary', taxA.balanceSalary || taxA.grossSalary)}</td>
          </tr>
          <tr>
            <td>(a)</td>
            <td colSpan={2}>STANDARD DEDUCTION (NEW REGIME)</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell font-bold bg-gray-50 print:bg-transparent">{renderAutoField('standardDeduction', taxA.standardDeduction || 75000)}</td>
          </tr>
          <tr className="total-row">
            <td colSpan={3}>(Column:3-4) PRO INCOME</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold bg-gray-100 print:bg-transparent">{renderAutoField('professionalIncome', taxA.professionalIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Section B - Other Income */}
      <div className="font-bold text-[11px] mt-3 mb-1 bg-gray-800 text-white p-1">
        વિભાગ (B) અન્ય આવક વિભાગ
      </div>
      
      <table style={{ fontSize: '10px' }}>
        <tbody>
          <tr>
            <td className="w-8">(1)</td>
            <td className="w-8">(a)</td>
            <td className="bg-yellow-50 print:bg-transparent">બેંક વ્યાજ આવક SAVING</td>
            <td className="text-right w-10">RS.</td>
            <td className="amount-cell w-20 bg-yellow-100 print:bg-transparent">
              {renderManualInputField("bankInterest", taxA.bankInterest)}
            </td>
          </tr>
          <tr>
            <td></td>
            <td>(b)</td>
            <td className="bg-yellow-50 print:bg-transparent">એન.એસ.સી. વ્યાજ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell bg-yellow-100 print:bg-transparent">
              {renderManualInputField("nscInterest", taxA.nscInterest)}
            </td>
          </tr>
          <tr>
            <td></td>
            <td>(c)</td>
            <td className="bg-yellow-50 print:bg-transparent">ફિકસ ડિપૉઝીટ વ્યાજ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell bg-yellow-100 print:bg-transparent">
              {renderManualInputField("fdInterest", taxA.fdInterest)}
            </td>
          </tr>
          <tr>
            <td></td>
            <td>(d)</td>
            <td className="font-bold">કુલ વ્યાજ આવક (A TO C)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold bg-gray-50 print:bg-transparent">{renderAutoField('totalInterestIncome', taxA.totalInterestIncome)}</td>
          </tr>
          <tr>
            <td>(2)</td>
            <td colSpan={4}>સગીર બાળકની ઉમેરવા પાત્ર આવક</td>
          </tr>
          <tr>
            <td>(3)</td>
            <td>(c)</td>
            <td className="bg-yellow-50 print:bg-transparent">પરીક્ષાનું મહેનતાણું</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell bg-yellow-100 print:bg-transparent">
              {renderManualInputField("examIncome", taxA.examIncome)}
            </td>
          </tr>
          <tr>
            <td></td>
            <td>(e)</td>
            <td className="font-bold">કુલ Total (a TO d)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold bg-gray-50 print:bg-transparent">{renderAutoField('totalOtherIncome', taxA.totalOtherIncome)}</td>
          </tr>
          <tr>
            <td>(4)</td>
            <td colSpan={2} className="bg-yellow-50 print:bg-transparent">મકાન મિલકત સંબંધિત આવક</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell bg-yellow-100 print:bg-transparent">{renderManualInputField('housePropertyIncome', taxA.housePropertyIncome)}</td>
          </tr>
          <tr className="total-row">
            <td>(5)</td>
            <td colSpan={2} className="font-bold">કુલ અન્ય આવક</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold bg-gray-100 print:bg-transparent">{renderAutoField('totalOtherIncome', taxA.totalOtherIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Section C - Gross Total Income */}
      <div className="font-bold text-[11px] mt-3 mb-1 bg-gray-800 text-white p-1">
        વિભાગ (C) સમગ્ર કુલ આવક પગાર તથા અન્ય
      </div>
      
      <table style={{ fontSize: '10px' }}>
        <tbody>
          <tr>
            <td className="w-8">(1)</td>
            <td>PRO. INCOME તથા અન્ય આવક વિભાગ A(5)+B(5)</td>
            <td className="text-right w-10">RS.</td>
            <td className="amount-cell font-bold w-24 bg-gray-100 print:bg-transparent">{renderAutoField('grossTotalIncome', taxA.grossTotalIncome)}</td>
          </tr>
          <tr>
            <td>(2)</td>
            <td className="bg-yellow-50 print:bg-transparent">મકાન લોનનું વ્યાજ બાદ મળવા પાત્ર રકમ Rule 24(2)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell bg-yellow-100 print:bg-transparent">{renderManualInputField('housingLoanInterest', taxA.housingLoanInterest)}</td>
          </tr>
          <tr className="total-row">
            <td>(3)</td>
            <td className="font-bold">PRO. INCOME (Column 1-2)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold bg-gray-100 print:bg-transparent">{renderAutoField('proIncome', taxA.proIncome)}</td>
          </tr>
        </tbody>
      </table>

      <div className="text-center text-[8px] mt-4 pt-2 border-t border-dashed border-gray-400 form-footer">
        Created By: Smart Computer Vinchhiya 9924640689, 9574031243
      </div>
    </div>
  );
};

export default AavakVeraFormA;