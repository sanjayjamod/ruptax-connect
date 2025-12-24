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
      <span className="print-value">{value || 0}</span>
    ) : (
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        defaultValue={value || ''}
        onBlur={(e) => updateField(field, Number(e.target.value) || 0)}
        className="w-full text-right p-0 border-0 bg-yellow-100 focus:outline-none focus:bg-yellow-200 print:bg-transparent print-input"
      />
    )
  );

  const renderAutoField = (value: number) => (
    <span className="font-medium print-value">{value || 0}</span>
  );

  return (
    <div className="tax-form-container tax-form-print aavak-vera-form page-break" id="aavak-vera-form-a">
      {/* Main Title */}
      <div className="form-title">આવક વેરા ગણતરી ફોર્મ</div>

      {/* Header Info Table */}
      <table className="info-table">
        <tbody>
          <tr>
            <td className="label-cell">NAME</td>
            <td className="value-cell">{client.name}</td>
            <td className="empty-cell"></td>
            <td className="empty-cell"></td>
          </tr>
          <tr>
            <td className="label-cell">INCOME YEAR</td>
            <td className="value-cell">{formData.salaryData.financialYear}</td>
            <td className="label-cell">ASSESSMENT YEAR</td>
            <td className="value-cell">{client.assessmentYear || '2026-2027'}</td>
          </tr>
          <tr>
            <td className="label-cell">VILLAGE</td>
            <td className="value-cell">{client.schoolName || '-'}</td>
            <td className="empty-cell" colSpan={2}></td>
          </tr>
          <tr>
            <td className="label-cell">DESIGNATION</td>
            <td className="value-cell">{client.designation || '-'}</td>
            <td className="label-cell">DATE OF BIRTH</td>
            <td className="value-cell">{client.dateOfBirth || '-'}</td>
          </tr>
          <tr>
            <td className="label-cell">PAN NO.</td>
            <td className="value-cell">{client.panNo || '-'}</td>
            <td className="label-cell">MOBILE NO</td>
            <td className="value-cell">{client.mobileNo || '-'}</td>
          </tr>
          <tr>
            <td className="label-cell">BANK ACC.NO</td>
            <td className="value-cell">{client.bankAcNo || '-'}</td>
            <td className="label-cell">AADHAR NO</td>
            <td className="value-cell">{client.aadharNo || '-'}</td>
          </tr>
          <tr>
            <td className="label-cell">IFSC CODE</td>
            <td className="value-cell">{client.ifscCode || '-'}</td>
            <td className="empty-cell" colSpan={2}></td>
          </tr>
        </tbody>
      </table>

      {/* Section A - Salary Income */}
      <table className="data-table">
        <tbody>
          <tr className="highlight-row">
            <td colSpan={4} className="section-label">કુલ ગ્રોસ આવક : AS PER RULE 17</td>
            <td className="rs-cell">RS.</td>
            <td className="amount-cell">{renderAutoField(taxA.grossSalary)}</td>
          </tr>
          <tr className="section-header">
            <td colSpan={6}>કલમ ૧૦ મુજબ બાદ પાત કરમુક્ત ભથ્થાઓ</td>
          </tr>
          <tr>
            <td className="sn-cell">(a)</td>
            <td colSpan={3}>ઘરભાડું ભાડાના મકાનમાં રહેતા હોઈ તો જ જે ઓછુ હોય તે RULE 10(13-A)</td>
            <td className="empty-cell"></td>
            <td className="empty-cell"></td>
          </tr>
          <tr>
            <td className="empty-cell"></td>
            <td colSpan={2} className="sub-item">( I ) પગાર બીલેથી મળેલ ઘરભાડું</td>
            <td className="rs-cell">Rs.</td>
            <td className="amount-cell">{renderAutoField(0)}</td>
            <td className="empty-cell"></td>
          </tr>
          <tr>
            <td className="empty-cell"></td>
            <td colSpan={2} className="sub-item">( II )ભાડા પેટે ચુકવેલ રકમ જો પગાર અને મોંઘવારી વાર્ષિક</td>
            <td className="rs-cell">Rs.</td>
            <td className="amount-cell"></td>
            <td className="empty-cell"></td>
          </tr>
          <tr>
            <td className="empty-cell"></td>
            <td colSpan={2} className="sub-item">(VII) બાદ મળવા પાત્ર ઘરભાડું</td>
            <td className="rs-cell">RS.</td>
            <td className="amount-cell">{renderAutoField(taxA.hraExempt)}</td>
            <td className="empty-cell"></td>
          </tr>
          <tr>
            <td className="sn-cell">(b)</td>
            <td colSpan={3}>ડ્રેસ ધોલાઈ ભથ્થું</td>
            <td className="rs-cell">Rs.</td>
            <td className="empty-cell"></td>
          </tr>
          <tr>
            <td className="sn-cell">(c)</td>
            <td colSpan={2}>ટ્રાન્સપોર્ટ એલ્લા.વાર્ષિક રૂ.9600 ની મર્યાદા</td>
            <td className="empty-cell"></td>
            <td className="amount-cell">{renderAutoField(taxA.transportAllowance)}</td>
            <td className="empty-cell"></td>
          </tr>
          <tr>
            <td className="sn-cell">(d)</td>
            <td colSpan={2}>કુલ રકમ 10 હેઠળ બાદ મળવા પાત્ર ભથ્થાઓ</td>
            <td className="rs-cell">Rs.</td>
            <td className="amount-cell font-bold">{renderAutoField(taxA.totalExempt)}</td>
            <td className="empty-cell"></td>
          </tr>
          <tr className="highlight-row">
            <td colSpan={4} className="section-label">બાકિ પગાર આવક (Column:1-2(d))</td>
            <td className="rs-cell">RS.</td>
            <td className="amount-cell">{renderAutoField(taxA.balanceSalary || taxA.grossSalary)}</td>
          </tr>
          <tr>
            <td className="sn-cell">(a)</td>
            <td colSpan={3}>STANDERD DIDUCATION</td>
            <td className="empty-cell"></td>
            <td className="amount-cell">{renderAutoField(taxA.standardDeduction || 75000)}</td>
          </tr>
          <tr className="highlight-row">
            <td colSpan={4} className="section-label">(Column:3-4) PRO INCOME</td>
            <td className="rs-cell">RS.</td>
            <td className="amount-cell">{renderAutoField(taxA.professionalIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Section B - Other Income */}
      <table className="data-table">
        <tbody>
          <tr className="section-header">
            <td colSpan={6}>વિભાગ ( B ) અન્ય આવક વિભાગ</td>
          </tr>
          <tr>
            <td className="sn-cell">"(1)</td>
            <td className="sn-cell">(a)</td>
            <td className="input-label">બેંક વ્યાજ આવક</td>
            <td>SAVING</td>
            <td className="rs-cell">RS.</td>
            <td className="input-cell">{renderManualInputField("bankInterest", taxA.bankInterest)}</td>
          </tr>
          <tr>
            <td className="empty-cell"></td>
            <td className="sn-cell">(b)</td>
            <td className="input-label">એન.એસ.સી. વ્યાજ</td>
            <td className="empty-cell"></td>
            <td className="rs-cell">RS.</td>
            <td className="input-cell">{renderManualInputField("nscInterest", taxA.nscInterest)}</td>
          </tr>
          <tr>
            <td className="empty-cell"></td>
            <td className="sn-cell">(c)</td>
            <td className="input-label">ફિકસ ડિપૉજીટ વ્યાજ</td>
            <td className="empty-cell"></td>
            <td className="rs-cell">RS.</td>
            <td className="input-cell">{renderManualInputField("fdInterest", taxA.fdInterest)}</td>
          </tr>
          <tr>
            <td className="empty-cell"></td>
            <td className="sn-cell">(d)</td>
            <td className="font-bold">કુલ વ્યાજ આવક ( A TO C )</td>
            <td className="empty-cell"></td>
            <td className="rs-cell">RS.</td>
            <td className="amount-cell">{renderAutoField(taxA.totalInterestIncome)}</td>
          </tr>
          <tr>
            <td className="sn-cell">"(2)</td>
            <td colSpan={4}>સગીર બાળકની ઉમેરવા પત્ર આવક</td>
            <td className="empty-cell"></td>
          </tr>
          <tr>
            <td className="sn-cell">"(3)</td>
            <td colSpan={4}>નીચેનામાંથી મળેલ આવક</td>
            <td className="empty-cell"></td>
          </tr>
          <tr>
            <td className="empty-cell"></td>
            <td className="sn-cell">(c)</td>
            <td className="input-label">પરીક્ષાનુ મહેનતાણું</td>
            <td className="empty-cell"></td>
            <td className="empty-cell"></td>
            <td className="input-cell">{renderManualInputField("examIncome", taxA.examIncome)}</td>
          </tr>
          <tr>
            <td className="empty-cell"></td>
            <td className="sn-cell">(e)</td>
            <td className="font-bold">કુલ Total(a TO d)</td>
            <td className="empty-cell"></td>
            <td className="rs-cell">RS.</td>
            <td className="amount-cell">{renderAutoField(taxA.examIncome || 0)}</td>
          </tr>
          <tr>
            <td className="sn-cell">"(4)</td>
            <td colSpan={3} className="input-label">મકાન મિલકત સંબધિત આવક</td>
            <td className="rs-cell">RS.</td>
            <td className="input-cell">{renderManualInputField("housePropertyIncome", taxA.housePropertyIncome)}</td>
          </tr>
          <tr>
            <td className="sn-cell">"(5)</td>
            <td colSpan={3} className="font-bold">કુલ અન્ય આવક [Column (1)(d)+(2)+(3)(e)+(4) ]</td>
            <td className="empty-cell"></td>
            <td className="amount-cell">{renderAutoField(taxA.totalOtherIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Section C - Gross Total Income */}
      <table className="data-table">
        <tbody>
          <tr className="section-header">
            <td colSpan={6}>વિભાગ (c) સમગ્ર કુલ આવક પગાર તથા અન્ય</td>
          </tr>
          <tr>
            <td className="sn-cell">"(1)</td>
            <td colSpan={2}>PRO. INCOME તથા અન્ય આવક વિભાગ A(5)+B(5)</td>
            <td className="empty-cell"></td>
            <td className="rs-cell">RS.</td>
            <td className="amount-cell">{renderAutoField(taxA.grossTotalIncome)}</td>
          </tr>
          <tr>
            <td className="sn-cell">"(2)</td>
            <td colSpan={2} className="input-label">મકાન લોનનું વ્યાજ બાદ મળવા પાત્ર રકમ Rule 24(2)</td>
            <td className="empty-cell"></td>
            <td className="rs-cell">RS.</td>
            <td className="input-cell">{renderManualInputField("housingLoanInterest", taxA.housingLoanInterest)}</td>
          </tr>
          <tr>
            <td className="sn-cell">"(3)</td>
            <td colSpan={2} className="font-bold">PRO. INCOME (Column 1-2)</td>
            <td className="empty-cell" colSpan={2}></td>
            <td className="amount-cell">{renderAutoField(taxA.proIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <div className="form-footer">
        Developed by - Smart Computer - 9924640689 ,9574031243
      </div>
    </div>
  );
};

export default AavakVeraFormA;
