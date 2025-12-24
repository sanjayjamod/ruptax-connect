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
        className="w-full h-6 text-right p-0 border-0 bg-yellow-100 inline-block focus:outline-none focus:bg-yellow-200 print:bg-transparent"
        style={{ fontSize: '11pt' }}
        title="Manual Input"
      />
    )
  );

  const renderAutoField = (value: number) => (
    <span className="font-medium">{value || 0}</span>
  );

  return (
    <div className="tax-form-container tax-form-print aavak-vera-form page-break" id="aavak-vera-form-a" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Main Title - 18pt bold */}
      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td colSpan={6} className="text-center font-bold border border-black py-3" style={{ fontSize: '18pt' }}>
              આવક વેરા ગણતરી ફોર્મ
            </td>
          </tr>
        </tbody>
      </table>

      {/* Header Info Table - 11pt */}
      <table className="w-full border-collapse" style={{ fontSize: '11pt' }}>
        <tbody>
          <tr>
            <td className="border border-black px-2 py-1 font-bold bg-gray-100" style={{ width: '15%' }}>NAME</td>
            <td className="border border-black px-2 py-1" style={{ width: '35%' }}>{client.name}</td>
            <td className="border border-black px-2 py-1" style={{ width: '25%' }}></td>
            <td className="border border-black px-2 py-1" style={{ width: '25%' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1 font-bold bg-gray-100">INCOME YEAR</td>
            <td className="border border-black px-2 py-1">{formData.salaryData.financialYear}</td>
            <td className="border border-black px-2 py-1 font-bold bg-gray-100">ASSESSMENT YEAR</td>
            <td className="border border-black px-2 py-1">{client.assessmentYear || '2026-2027'}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1 font-bold bg-gray-100">VILLAGE</td>
            <td className="border border-black px-2 py-1">{client.schoolName || '-'}</td>
            <td className="border border-black px-2 py-1" colSpan={2}></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1 font-bold bg-gray-100">DESIGNATION</td>
            <td className="border border-black px-2 py-1">{client.designation || '-'}</td>
            <td className="border border-black px-2 py-1 font-bold bg-gray-100">DATE OF BIRTH</td>
            <td className="border border-black px-2 py-1">{client.dateOfBirth || '-'}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1 font-bold bg-gray-100">PAN NO.</td>
            <td className="border border-black px-2 py-1">{client.panNo || '-'}</td>
            <td className="border border-black px-2 py-1 font-bold bg-gray-100">MOBILE NO</td>
            <td className="border border-black px-2 py-1">{client.mobileNo || '-'}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1 font-bold bg-gray-100">BANK ACC.NO</td>
            <td className="border border-black px-2 py-1">{client.bankAcNo || '-'}</td>
            <td className="border border-black px-2 py-1 font-bold bg-gray-100">AADHAR NO</td>
            <td className="border border-black px-2 py-1">{client.aadharNo || '-'}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1 font-bold bg-gray-100">IFSC CODE</td>
            <td className="border border-black px-2 py-1">{client.ifscCode || '-'}</td>
            <td className="border border-black px-2 py-1" colSpan={2}></td>
          </tr>
        </tbody>
      </table>

      {/* Section A - Salary Income */}
      <table className="w-full border-collapse" style={{ fontSize: '11pt' }}>
        <tbody>
          {/* Gross Salary Row - 12pt bold */}
          <tr>
            <td colSpan={4} className="border border-black px-2 py-1 font-bold bg-yellow-50" style={{ fontSize: '12pt' }}>કુલ ગ્રોસ આવક : AS PER RULE 17</td>
            <td className="border border-black px-2 py-1 text-right font-bold">RS.</td>
            <td className="border border-black px-2 py-1 text-right font-bold">{renderAutoField(taxA.grossSalary)}</td>
          </tr>
          
          {/* Section Header - 13pt bold */}
          <tr>
            <td colSpan={6} className="border border-black px-2 py-1 font-bold bg-gray-200" style={{ fontSize: '13pt' }}>કલમ ૧૦ મુજબ બાદ પાત કરમુક્ત ભથ્થાઓ</td>
          </tr>
          
          <tr>
            <td className="border border-black px-2 py-1" style={{ width: '5%' }}>(a)</td>
            <td colSpan={3} className="border border-black px-2 py-1">ઘરભાડું ભાડાના મકાનમાં રહેતા હોઈ તો જ જે ઓછુ હોય તે RULE 10(13-A)</td>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td colSpan={2} className="border border-black px-2 py-1 pl-6">( I ) પગાર બીલેથી મળેલ ઘરભાડું</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right">{renderAutoField(0)}</td>
            <td className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td colSpan={2} className="border border-black px-2 py-1 pl-6">( II )ભાડા પેટે ચુકવેલ રકમ જો પગાર અને મોંઘવારી વાર્ષિક</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right"></td>
            <td className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td colSpan={2} className="border border-black px-2 py-1 pl-6">(VII) બાદ મળવા પાત્ર ઘરભાડું</td>
            <td className="border border-black px-2 py-1 text-right">RS.</td>
            <td className="border border-black px-2 py-1 text-right">{renderAutoField(taxA.hraExempt)}</td>
            <td className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">(b)</td>
            <td colSpan={3} className="border border-black px-2 py-1">ડ્રેસ ધોલાઈ ભથ્થું</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">(c)</td>
            <td colSpan={2} className="border border-black px-2 py-1">ટ્રાન્સપોર્ટ એલ્લા.વાર્ષિક રૂ.9600 ની મર્યાદા</td>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1 text-right">{renderAutoField(taxA.transportAllowance)}</td>
            <td className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">(d)</td>
            <td colSpan={2} className="border border-black px-2 py-1">કુલ રકમ 10 હેઠળ બાદ મળવા પાત્ર ભથ્થાઓ</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right font-bold">{renderAutoField(taxA.totalExempt)}</td>
            <td className="border border-black px-2 py-1"></td>
          </tr>
          
          {/* Balance Salary - 12pt bold */}
          <tr>
            <td colSpan={4} className="border border-black px-2 py-1 font-bold" style={{ fontSize: '12pt' }}>બાકિ પગાર આવક (Column:1-2(d))</td>
            <td className="border border-black px-2 py-1 text-right font-bold">RS.</td>
            <td className="border border-black px-2 py-1 text-right font-bold">{renderAutoField(taxA.balanceSalary || taxA.grossSalary)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">(a)</td>
            <td colSpan={3} className="border border-black px-2 py-1">STANDERD DIDUCATION</td>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1 text-right">{renderAutoField(taxA.standardDeduction || 75000)}</td>
          </tr>
          
          {/* PRO Income - 12pt bold */}
          <tr>
            <td colSpan={4} className="border border-black px-2 py-1 font-bold" style={{ fontSize: '12pt' }}>(Column:3-4) PRO INCOME</td>
            <td className="border border-black px-2 py-1 text-right font-bold">RS.</td>
            <td className="border border-black px-2 py-1 text-right font-bold">{renderAutoField(taxA.professionalIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Section B - Other Income - 13pt header */}
      <table className="w-full border-collapse" style={{ fontSize: '11pt' }}>
        <tbody>
          <tr>
            <td colSpan={6} className="border border-black px-2 py-1 font-bold bg-gray-200" style={{ fontSize: '13pt' }}>વિભાગ ( B ) અન્ય આવક વિભાગ</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1" style={{ width: '5%' }}>"(1)</td>
            <td className="border border-black px-2 py-1" style={{ width: '5%' }}>(a)</td>
            <td className="border border-black px-2 py-1 bg-yellow-50 print:bg-transparent">બેંક વ્યાજ આવક</td>
            <td className="border border-black px-2 py-1">SAVING</td>
            <td className="border border-black px-2 py-1 text-right">RS.</td>
            <td className="border border-black px-2 py-1 text-right bg-yellow-100 print:bg-transparent" style={{ width: '15%' }}>{renderManualInputField("bankInterest", taxA.bankInterest)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1">(b)</td>
            <td className="border border-black px-2 py-1 bg-yellow-50 print:bg-transparent">એન.એસ.સી. વ્યાજ</td>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1 text-right">RS.</td>
            <td className="border border-black px-2 py-1 text-right bg-yellow-100 print:bg-transparent">{renderManualInputField("nscInterest", taxA.nscInterest)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1">(c)</td>
            <td className="border border-black px-2 py-1 bg-yellow-50 print:bg-transparent">ફિકસ ડિપૉજીટ વ્યાજ</td>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1 text-right">RS.</td>
            <td className="border border-black px-2 py-1 text-right bg-yellow-100 print:bg-transparent">{renderManualInputField("fdInterest", taxA.fdInterest)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1">(d)</td>
            <td className="border border-black px-2 py-1 font-bold">કુલ વ્યાજ આવક ( A TO C )</td>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1 text-right">RS.</td>
            <td className="border border-black px-2 py-1 text-right font-bold">{renderAutoField(taxA.totalInterestIncome)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">"(2)</td>
            <td colSpan={4} className="border border-black px-2 py-1">સગીર બાળકની ઉમેરવા પત્ર આવક</td>
            <td className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">"(3)</td>
            <td colSpan={4} className="border border-black px-2 py-1">નીચેનામાંથી મળેલ આવક</td>
            <td className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1">(c)</td>
            <td className="border border-black px-2 py-1 bg-yellow-50 print:bg-transparent">પરીક્ષાનુ મહેનતાણું</td>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1 text-right bg-yellow-100 print:bg-transparent">{renderManualInputField("examIncome", taxA.examIncome)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1">(e)</td>
            <td className="border border-black px-2 py-1 font-bold">કુલ Total(a TO d)</td>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1 text-right">RS.</td>
            <td className="border border-black px-2 py-1 text-right font-bold">{renderAutoField(taxA.examIncome || 0)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">"(4)</td>
            <td colSpan={3} className="border border-black px-2 py-1 bg-yellow-50 print:bg-transparent">મકાન મિલકત સંબધિત આવક</td>
            <td className="border border-black px-2 py-1 text-right">RS.</td>
            <td className="border border-black px-2 py-1 text-right bg-yellow-100 print:bg-transparent">{renderManualInputField("housePropertyIncome", taxA.housePropertyIncome)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">"(5)</td>
            <td colSpan={3} className="border border-black px-2 py-1 font-bold">કુલ અન્ય આવક [Column (1)(d)+(2)+(3)(e)+(4) ]</td>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1 text-right font-bold">{renderAutoField(taxA.totalOtherIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Section C - Gross Total Income - 13pt header */}
      <table className="w-full border-collapse" style={{ fontSize: '11pt' }}>
        <tbody>
          <tr>
            <td colSpan={6} className="border border-black px-2 py-1 font-bold bg-gray-200" style={{ fontSize: '13pt' }}>વિભાગ (c) સમગ્ર કુલ આવક પગાર તથા અન્ય</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1" style={{ width: '5%' }}>"(1)</td>
            <td colSpan={2} className="border border-black px-2 py-1">PRO. INCOME તથા અન્ય આવક વિભાગ A(5)+B(5)</td>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1 text-right">RS.</td>
            <td className="border border-black px-2 py-1 text-right font-bold" style={{ width: '15%' }}>{renderAutoField(taxA.grossTotalIncome)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">"(2)</td>
            <td colSpan={2} className="border border-black px-2 py-1 bg-yellow-50 print:bg-transparent">મકાન લોનનું વ્યાજ બાદ મળવા પાત્ર રકમ Rule 24(2)</td>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1 text-right">RS.</td>
            <td className="border border-black px-2 py-1 text-right bg-yellow-100 print:bg-transparent">{renderManualInputField("housingLoanInterest", taxA.housingLoanInterest)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">"(3)</td>
            <td colSpan={2} className="border border-black px-2 py-1 font-bold">PRO. INCOME (Column 1-2)</td>
            <td className="border border-black px-2 py-1" colSpan={2}></td>
            <td className="border border-black px-2 py-1 text-right font-bold">{renderAutoField(taxA.proIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <div className="text-center mt-4 text-xs text-gray-500 print:text-black">
        Developed by - Smart Computer - 9924640689 ,9574031243
      </div>
    </div>
  );
};

export default AavakVeraFormA;
