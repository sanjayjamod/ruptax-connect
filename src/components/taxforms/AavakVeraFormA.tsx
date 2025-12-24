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
        className="w-full h-5 text-xs text-right p-0 border-0 bg-yellow-100 inline-block focus:outline-none focus:bg-yellow-200 print:bg-transparent"
        title="Manual Input"
      />
    )
  );

  const renderAutoField = (value: number) => (
    <span className="font-medium">{value || 0}</span>
  );

  return (
    <div className="tax-form-container tax-form-print aavak-vera-form" id="aavak-vera-form-a">
      {/* Header */}
      <table className="w-full border-collapse" style={{ fontSize: '9pt' }}>
        <tbody>
          <tr>
            <td colSpan={11} className="text-center font-bold text-base border border-black py-1">
              આવક વેરા ગણતરી ફોર્મ
            </td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5 font-bold">NAME</td>
            <td colSpan={3} className="border border-black px-1 py-0.5">{client.name}</td>
            <td colSpan={3} className="border border-black px-1 py-0.5"></td>
            <td colSpan={4} className="border border-black px-1 py-0.5"></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5 font-bold">INCOME YEAR</td>
            <td colSpan={3} className="border border-black px-1 py-0.5">{formData.salaryData.financialYear}</td>
            <td colSpan={3} className="border border-black px-1 py-0.5"></td>
            <td className="border border-black px-1 py-0.5 font-bold">ASSESSMENT YEAR</td>
            <td colSpan={3} className="border border-black px-1 py-0.5">{client.assessmentYear || '2026-2027'}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5 font-bold">VILLAGE</td>
            <td colSpan={3} className="border border-black px-1 py-0.5">{client.schoolName || '-'}</td>
            <td colSpan={3} className="border border-black px-1 py-0.5"></td>
            <td colSpan={4} className="border border-black px-1 py-0.5"></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5 font-bold">DESIGNATION</td>
            <td colSpan={3} className="border border-black px-1 py-0.5">{client.designation || '-'}</td>
            <td colSpan={3} className="border border-black px-1 py-0.5"></td>
            <td className="border border-black px-1 py-0.5 font-bold">DATE OF BIRTH</td>
            <td colSpan={3} className="border border-black px-1 py-0.5">{client.dateOfBirth || '-'}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5 font-bold">PAN NO.</td>
            <td colSpan={3} className="border border-black px-1 py-0.5">{client.panNo || '-'}</td>
            <td colSpan={3} className="border border-black px-1 py-0.5"></td>
            <td className="border border-black px-1 py-0.5 font-bold">MOBILE NO</td>
            <td colSpan={3} className="border border-black px-1 py-0.5">{client.mobileNo || '-'}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5 font-bold">BANK ACC.NO</td>
            <td colSpan={3} className="border border-black px-1 py-0.5">{client.bankAcNo || '-'}</td>
            <td colSpan={3} className="border border-black px-1 py-0.5"></td>
            <td className="border border-black px-1 py-0.5 font-bold">AADHAR NO</td>
            <td colSpan={3} className="border border-black px-1 py-0.5">{client.aadharNo || '-'}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5 font-bold">IFSC CODE</td>
            <td colSpan={3} className="border border-black px-1 py-0.5">{client.ifscCode || '-'}</td>
            <td colSpan={7} className="border border-black px-1 py-0.5"></td>
          </tr>
        </tbody>
      </table>

      {/* Section A - Salary Income */}
      <table className="w-full border-collapse mt-1" style={{ fontSize: '8pt' }}>
        <tbody>
          <tr>
            <td colSpan={4} className="border border-black px-1 py-0.5 font-bold">કુલ ગ્રોસ આવક : AS PER RULE 17</td>
            <td colSpan={5} className="border border-black px-1 py-0.5"></td>
            <td className="border border-black px-1 py-0.5 text-right font-bold">RS.</td>
            <td className="border border-black px-1 py-0.5 text-right font-bold">{renderAutoField(taxA.grossSalary)}</td>
          </tr>
          <tr>
            <td colSpan={11} className="border border-black px-1 py-0.5 font-bold bg-gray-100">કલમ ૧૦ મુજબ બાદ પાત કરમુક્ત ભથ્થાઓ</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5">(a)</td>
            <td colSpan={8} className="border border-black px-1 py-0.5">ઘરભાડું ભાડાના મકાનમાં રહેતા હોઈ તો જ જે ઓછુ હોય તે RULE 10(13-A)</td>
            <td className="border border-black px-1 py-0.5"></td>
            <td className="border border-black px-1 py-0.5"></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5"></td>
            <td colSpan={6} className="border border-black px-1 py-0.5">( I ) પગાર બીલેથી મળેલ ઘરભાડું</td>
            <td colSpan={2} className="border border-black px-1 py-0.5 text-right">Rs.</td>
            <td className="border border-black px-1 py-0.5 text-right">{renderAutoField(0)}</td>
            <td className="border border-black px-1 py-0.5"></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5"></td>
            <td colSpan={6} className="border border-black px-1 py-0.5">( II )ભાડા પેટે ચુકવેલ રકમ જો પગાર અને મોંઘવારી વાર્ષિક</td>
            <td colSpan={2} className="border border-black px-1 py-0.5 text-right">Rs.</td>
            <td className="border border-black px-1 py-0.5 text-right"></td>
            <td className="border border-black px-1 py-0.5"></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5"></td>
            <td colSpan={6} className="border border-black px-1 py-0.5">(VII) બાદ મળવા પાત્ર ઘરભાડું</td>
            <td colSpan={2} className="border border-black px-1 py-0.5 text-right">RS.</td>
            <td className="border border-black px-1 py-0.5 text-right">{renderAutoField(taxA.hraExempt)}</td>
            <td className="border border-black px-1 py-0.5"></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5">(b)</td>
            <td colSpan={8} className="border border-black px-1 py-0.5">ડ્રેસ ધોલાઈ ભથ્થું</td>
            <td className="border border-black px-1 py-0.5"></td>
            <td className="border border-black px-1 py-0.5"></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5">(c)</td>
            <td colSpan={6} className="border border-black px-1 py-0.5">ટ્રાન્સપોર્ટ એલ્લા.વાર્ષિક રૂ.9600 ની મર્યાદા</td>
            <td colSpan={2} className="border border-black px-1 py-0.5"></td>
            <td className="border border-black px-1 py-0.5 text-right">{renderAutoField(taxA.transportAllowance)}</td>
            <td className="border border-black px-1 py-0.5"></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5">(d)</td>
            <td colSpan={6} className="border border-black px-1 py-0.5">કુલ રકમ 10 હેઠળ બાદ મળવા પાત્ર ભથ્થાઓ</td>
            <td colSpan={2} className="border border-black px-1 py-0.5 text-right">Rs.</td>
            <td className="border border-black px-1 py-0.5 text-right font-bold">{renderAutoField(taxA.totalExempt)}</td>
            <td className="border border-black px-1 py-0.5"></td>
          </tr>
          <tr>
            <td colSpan={8} className="border border-black px-1 py-0.5 font-bold">બાકિ પગાર આવક (Column:1-2(d))</td>
            <td className="border border-black px-1 py-0.5"></td>
            <td className="border border-black px-1 py-0.5 text-right font-bold">RS.</td>
            <td className="border border-black px-1 py-0.5 text-right font-bold">{renderAutoField(taxA.balanceSalary || taxA.grossSalary)}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5">(a)</td>
            <td colSpan={7} className="border border-black px-1 py-0.5">STANDERD DIDUCATION</td>
            <td className="border border-black px-1 py-0.5"></td>
            <td colSpan={2} className="border border-black px-1 py-0.5 text-right">{renderAutoField(taxA.standardDeduction || 75000)}</td>
          </tr>
          <tr>
            <td colSpan={8} className="border border-black px-1 py-0.5 font-bold">(Column:3-4) PRO INCOME</td>
            <td className="border border-black px-1 py-0.5"></td>
            <td className="border border-black px-1 py-0.5 text-right font-bold">RS.</td>
            <td className="border border-black px-1 py-0.5 text-right font-bold">{renderAutoField(taxA.professionalIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Section B - Other Income */}
      <table className="w-full border-collapse mt-1" style={{ fontSize: '8pt' }}>
        <tbody>
          <tr>
            <td colSpan={11} className="border border-black px-1 py-0.5 font-bold bg-gray-100">વિભાગ ( B ) અન્ય આવક વિભાગ</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5">"(1)</td>
            <td className="border border-black px-1 py-0.5">(a)</td>
            <td colSpan={4} className="border border-black px-1 py-0.5 bg-yellow-50 print:bg-transparent">બેંક વ્યાજ આવક</td>
            <td colSpan={2} className="border border-black px-1 py-0.5">SAVING</td>
            <td className="border border-black px-1 py-0.5 text-right">RS.</td>
            <td className="border border-black px-1 py-0.5 text-right bg-yellow-100 print:bg-transparent">{renderManualInputField("bankInterest", taxA.bankInterest)}</td>
            <td className="border border-black px-1 py-0.5"></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5"></td>
            <td className="border border-black px-1 py-0.5">(b)</td>
            <td colSpan={5} className="border border-black px-1 py-0.5 bg-yellow-50 print:bg-transparent">એન.એસ.સી. વ્યાજ</td>
            <td colSpan={2} className="border border-black px-1 py-0.5 text-right">RS.</td>
            <td className="border border-black px-1 py-0.5 text-right bg-yellow-100 print:bg-transparent">{renderManualInputField("nscInterest", taxA.nscInterest)}</td>
            <td className="border border-black px-1 py-0.5"></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5"></td>
            <td className="border border-black px-1 py-0.5">(c)</td>
            <td colSpan={5} className="border border-black px-1 py-0.5 bg-yellow-50 print:bg-transparent">ફિકસ ડિપૉજીટ વ્યાજ</td>
            <td colSpan={2} className="border border-black px-1 py-0.5 text-right">RS.</td>
            <td className="border border-black px-1 py-0.5 text-right bg-yellow-100 print:bg-transparent">{renderManualInputField("fdInterest", taxA.fdInterest)}</td>
            <td className="border border-black px-1 py-0.5"></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5"></td>
            <td className="border border-black px-1 py-0.5">(d)</td>
            <td colSpan={5} className="border border-black px-1 py-0.5 font-bold">કુલ વ્યાજ આવક ( A TO C )</td>
            <td colSpan={2} className="border border-black px-1 py-0.5 text-right">RS.</td>
            <td className="border border-black px-1 py-0.5 text-right font-bold">{renderAutoField(taxA.totalInterestIncome)}</td>
            <td className="border border-black px-1 py-0.5"></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5">"(2)</td>
            <td colSpan={8} className="border border-black px-1 py-0.5">સગીર બાળકની ઉમેરવા પત્ર આવક</td>
            <td className="border border-black px-1 py-0.5"></td>
            <td className="border border-black px-1 py-0.5"></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5">"(3)</td>
            <td colSpan={8} className="border border-black px-1 py-0.5">નીચેનામાંથી મળેલ આવક</td>
            <td className="border border-black px-1 py-0.5"></td>
            <td className="border border-black px-1 py-0.5"></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5"></td>
            <td className="border border-black px-1 py-0.5">(c)</td>
            <td colSpan={5} className="border border-black px-1 py-0.5 bg-yellow-50 print:bg-transparent">પરીક્ષાનુ મહેનતાણું</td>
            <td colSpan={2} className="border border-black px-1 py-0.5"></td>
            <td className="border border-black px-1 py-0.5 text-right bg-yellow-100 print:bg-transparent">{renderManualInputField("examIncome", taxA.examIncome)}</td>
            <td className="border border-black px-1 py-0.5"></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5"></td>
            <td className="border border-black px-1 py-0.5">(e)</td>
            <td colSpan={5} className="border border-black px-1 py-0.5 font-bold">કુલ Total(a TO d)</td>
            <td colSpan={2} className="border border-black px-1 py-0.5 text-right">RS.</td>
            <td className="border border-black px-1 py-0.5 text-right font-bold">{renderAutoField(taxA.examIncome || 0)}</td>
            <td className="border border-black px-1 py-0.5"></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5">"(4)</td>
            <td colSpan={6} className="border border-black px-1 py-0.5 bg-yellow-50 print:bg-transparent">મકાન મિલકત સંબધિત આવક</td>
            <td colSpan={2} className="border border-black px-1 py-0.5 text-right">RS.</td>
            <td className="border border-black px-1 py-0.5 text-right bg-yellow-100 print:bg-transparent">{renderManualInputField("housePropertyIncome", taxA.housePropertyIncome)}</td>
            <td className="border border-black px-1 py-0.5"></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5">"(5)</td>
            <td colSpan={7} className="border border-black px-1 py-0.5 font-bold">કુલ અન્ય આવક [Column (1)(d)+(2)+(3)(e)+(4) ]</td>
            <td className="border border-black px-1 py-0.5"></td>
            <td colSpan={2} className="border border-black px-1 py-0.5 text-right font-bold">{renderAutoField(taxA.totalOtherIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Section C - Gross Total Income */}
      <table className="w-full border-collapse mt-1" style={{ fontSize: '8pt' }}>
        <tbody>
          <tr>
            <td colSpan={11} className="border border-black px-1 py-0.5 font-bold bg-gray-100">વિભાગ (c) સમગ્ર કુલ આવક પગાર તથા અન્ય</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5">"(1)</td>
            <td colSpan={7} className="border border-black px-1 py-0.5">PRO. INCOME તથા અન્ય આવક વિભાગ A(5)+B(5)</td>
            <td colSpan={2} className="border border-black px-1 py-0.5 text-right">RS.</td>
            <td className="border border-black px-1 py-0.5 text-right font-bold">{renderAutoField(taxA.grossTotalIncome)}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5">"(2)</td>
            <td colSpan={7} className="border border-black px-1 py-0.5 bg-yellow-50 print:bg-transparent">મકાન લોનનું વ્યાજ બાદ મળવા પાત્ર રકમ Rule 24(2)</td>
            <td colSpan={2} className="border border-black px-1 py-0.5 text-right">RS.</td>
            <td className="border border-black px-1 py-0.5 text-right bg-yellow-100 print:bg-transparent">{renderManualInputField("housingLoanInterest", taxA.housingLoanInterest)}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5">"(3)</td>
            <td colSpan={7} className="border border-black px-1 py-0.5 font-bold">PRO. INCOME (Column 1-2)</td>
            <td colSpan={2} className="border border-black px-1 py-0.5"></td>
            <td className="border border-black px-1 py-0.5 text-right font-bold">{renderAutoField(taxA.proIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <div className="form-footer text-center mt-2 pt-1" style={{ fontSize: '7pt' }}>
        Developed by - Smart Computer - 9924640689 ,9574031243
      </div>
    </div>
  );
};

export default AavakVeraFormA;
