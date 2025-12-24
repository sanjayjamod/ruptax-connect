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
    <div className="tax-form-container tax-form-print aavak-vera-form page-break" id="aavak-vera-form-a">
      {/* Header */}
      <table className="w-full border-collapse" style={{ fontSize: '6.5pt' }}>
        <tbody>
          <tr>
            <td colSpan={11} className="text-center font-bold border border-black py-0.5" style={{ fontSize: '10pt' }}>
              આવક વેરા ગણતરી ફોર્મ
            </td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5 font-bold" style={{ width: '12%', fontSize: '6pt' }}>NAME</td>
            <td colSpan={3} className="border border-black px-1 py-0.5" style={{ width: '38%', fontSize: '6pt' }}>{client.name}</td>
            <td colSpan={3} className="border border-black px-1 py-0.5" style={{ width: '25%', fontSize: '6pt' }}></td>
            <td colSpan={4} className="border border-black px-1 py-0.5" style={{ width: '25%', fontSize: '6pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5 font-bold" style={{ fontSize: '6pt' }}>INCOME YEAR</td>
            <td colSpan={3} className="border border-black px-1 py-0.5" style={{ fontSize: '6pt' }}>{formData.salaryData.financialYear}</td>
            <td colSpan={3} className="border border-black px-1 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td className="border border-black px-1 py-0.5 font-bold" style={{ fontSize: '6pt' }}>ASSESSMENT YEAR</td>
            <td colSpan={3} className="border border-black px-1 py-0.5" style={{ fontSize: '6pt' }}>{client.assessmentYear || '2026-2027'}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5 font-bold" style={{ fontSize: '6pt' }}>VILLAGE</td>
            <td colSpan={3} className="border border-black px-1 py-0.5" style={{ fontSize: '6pt' }}>{client.schoolName || '-'}</td>
            <td colSpan={3} className="border border-black px-1 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td colSpan={4} className="border border-black px-1 py-0.5" style={{ fontSize: '6pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5 font-bold" style={{ fontSize: '6pt' }}>DESIGNATION</td>
            <td colSpan={3} className="border border-black px-1 py-0.5" style={{ fontSize: '6pt' }}>{client.designation || '-'}</td>
            <td colSpan={3} className="border border-black px-1 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td className="border border-black px-1 py-0.5 font-bold" style={{ fontSize: '6pt' }}>DATE OF BIRTH</td>
            <td colSpan={3} className="border border-black px-1 py-0.5" style={{ fontSize: '6pt' }}>{client.dateOfBirth || '-'}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5 font-bold" style={{ fontSize: '6pt' }}>PAN NO.</td>
            <td colSpan={3} className="border border-black px-1 py-0.5" style={{ fontSize: '6pt' }}>{client.panNo || '-'}</td>
            <td colSpan={3} className="border border-black px-1 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td className="border border-black px-1 py-0.5 font-bold" style={{ fontSize: '6pt' }}>MOBILE NO</td>
            <td colSpan={3} className="border border-black px-1 py-0.5" style={{ fontSize: '6pt' }}>{client.mobileNo || '-'}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5 font-bold" style={{ fontSize: '6pt' }}>BANK ACC.NO</td>
            <td colSpan={3} className="border border-black px-1 py-0.5" style={{ fontSize: '6pt' }}>{client.bankAcNo || '-'}</td>
            <td colSpan={3} className="border border-black px-1 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td className="border border-black px-1 py-0.5 font-bold" style={{ fontSize: '6pt' }}>AADHAR NO</td>
            <td colSpan={3} className="border border-black px-1 py-0.5" style={{ fontSize: '6pt' }}>{client.aadharNo || '-'}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-0.5 font-bold" style={{ fontSize: '6pt' }}>IFSC CODE</td>
            <td colSpan={3} className="border border-black px-1 py-0.5" style={{ fontSize: '6pt' }}>{client.ifscCode || '-'}</td>
            <td colSpan={7} className="border border-black px-1 py-0.5" style={{ fontSize: '6pt' }}></td>
          </tr>
        </tbody>
      </table>

      {/* Section A - Salary Income */}
      <table className="w-full border-collapse mt-0.5" style={{ fontSize: '6pt' }}>
        <tbody>
          <tr>
            <td colSpan={4} className="border border-black px-0.5 py-0.5 font-bold" style={{ fontSize: '6pt' }}>કુલ ગ્રોસ આવક : AS PER RULE 17</td>
            <td colSpan={5} className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td className="border border-black px-0.5 py-0.5 text-right font-bold" style={{ fontSize: '6pt' }}>RS.</td>
            <td className="border border-black px-0.5 py-0.5 text-right font-bold" style={{ fontSize: '6pt' }}>{renderAutoField(taxA.grossSalary)}</td>
          </tr>
          <tr>
            <td colSpan={11} className="border border-black px-0.5 py-0.5 font-bold bg-gray-100" style={{ fontSize: '6pt' }}>કલમ ૧૦ મુજબ બાદ પાત કરમુક્ત ભથ્થાઓ</td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>(a)</td>
            <td colSpan={8} className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>ઘરભાડું ભાડાના મકાનમાં રહેતા હોઈ તો જ જે ઓછુ હોય તે RULE 10(13-A)</td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td colSpan={6} className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>( I ) પગાર બીલેથી મળેલ ઘરભાડું</td>
            <td colSpan={2} className="border border-black px-0.5 py-0.5 text-right" style={{ fontSize: '6pt' }}>Rs.</td>
            <td className="border border-black px-0.5 py-0.5 text-right" style={{ fontSize: '6pt' }}>{renderAutoField(0)}</td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td colSpan={6} className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>( II )ભાડા પેટે ચુકવેલ રકમ જો પગાર અને મોંઘવારી વાર્ષિક</td>
            <td colSpan={2} className="border border-black px-0.5 py-0.5 text-right" style={{ fontSize: '6pt' }}>Rs.</td>
            <td className="border border-black px-0.5 py-0.5 text-right" style={{ fontSize: '6pt' }}></td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td colSpan={6} className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>(VII) બાદ મળવા પાત્ર ઘરભાડું</td>
            <td colSpan={2} className="border border-black px-0.5 py-0.5 text-right" style={{ fontSize: '6pt' }}>RS.</td>
            <td className="border border-black px-0.5 py-0.5 text-right" style={{ fontSize: '6pt' }}>{renderAutoField(taxA.hraExempt)}</td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>(b)</td>
            <td colSpan={8} className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>ડ્રેસ ધોલાઈ ભથ્થું</td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>(c)</td>
            <td colSpan={6} className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>ટ્રાન્સપોર્ટ એલ્લા.વાર્ષિક રૂ.9600 ની મર્યાદા</td>
            <td colSpan={2} className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td className="border border-black px-0.5 py-0.5 text-right" style={{ fontSize: '6pt' }}>{renderAutoField(taxA.transportAllowance)}</td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>(d)</td>
            <td colSpan={6} className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>કુલ રકમ 10 હેઠળ બાદ મળવા પાત્ર ભથ્થાઓ</td>
            <td colSpan={2} className="border border-black px-0.5 py-0.5 text-right" style={{ fontSize: '6pt' }}>Rs.</td>
            <td className="border border-black px-0.5 py-0.5 text-right font-bold" style={{ fontSize: '6pt' }}>{renderAutoField(taxA.totalExempt)}</td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
          </tr>
          <tr>
            <td colSpan={8} className="border border-black px-0.5 py-0.5 font-bold" style={{ fontSize: '6pt' }}>બાકિ પગાર આવક (Column:1-2(d))</td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td className="border border-black px-0.5 py-0.5 text-right font-bold" style={{ fontSize: '6pt' }}>RS.</td>
            <td className="border border-black px-0.5 py-0.5 text-right font-bold" style={{ fontSize: '6pt' }}>{renderAutoField(taxA.balanceSalary || taxA.grossSalary)}</td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>(a)</td>
            <td colSpan={7} className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>STANDERD DIDUCATION</td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td colSpan={2} className="border border-black px-0.5 py-0.5 text-right" style={{ fontSize: '6pt' }}>{renderAutoField(taxA.standardDeduction || 75000)}</td>
          </tr>
          <tr>
            <td colSpan={8} className="border border-black px-0.5 py-0.5 font-bold" style={{ fontSize: '6pt' }}>(Column:3-4) PRO INCOME</td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td className="border border-black px-0.5 py-0.5 text-right font-bold" style={{ fontSize: '6pt' }}>RS.</td>
            <td className="border border-black px-0.5 py-0.5 text-right font-bold" style={{ fontSize: '6pt' }}>{renderAutoField(taxA.professionalIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Section B - Other Income */}
      <table className="w-full border-collapse mt-0.5" style={{ fontSize: '6pt' }}>
        <tbody>
          <tr>
            <td colSpan={11} className="border border-black px-0.5 py-0.5 font-bold bg-gray-100" style={{ fontSize: '6pt' }}>વિભાગ ( B ) અન્ય આવક વિભાગ</td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>"(1)</td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>(a)</td>
            <td colSpan={4} className="border border-black px-0.5 py-0.5 bg-yellow-50 print:bg-transparent" style={{ fontSize: '6pt' }}>બેંક વ્યાજ આવક</td>
            <td colSpan={2} className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>SAVING</td>
            <td className="border border-black px-0.5 py-0.5 text-right" style={{ fontSize: '6pt' }}>RS.</td>
            <td className="border border-black px-0.5 py-0.5 text-right bg-yellow-100 print:bg-transparent" style={{ fontSize: '6pt' }}>{renderManualInputField("bankInterest", taxA.bankInterest)}</td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>(b)</td>
            <td colSpan={5} className="border border-black px-0.5 py-0.5 bg-yellow-50 print:bg-transparent" style={{ fontSize: '6pt' }}>એન.એસ.સી. વ્યાજ</td>
            <td colSpan={2} className="border border-black px-0.5 py-0.5 text-right" style={{ fontSize: '6pt' }}>RS.</td>
            <td className="border border-black px-0.5 py-0.5 text-right bg-yellow-100 print:bg-transparent" style={{ fontSize: '6pt' }}>{renderManualInputField("nscInterest", taxA.nscInterest)}</td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>(c)</td>
            <td colSpan={5} className="border border-black px-0.5 py-0.5 bg-yellow-50 print:bg-transparent" style={{ fontSize: '6pt' }}>ફિકસ ડિપૉજીટ વ્યાજ</td>
            <td colSpan={2} className="border border-black px-0.5 py-0.5 text-right" style={{ fontSize: '6pt' }}>RS.</td>
            <td className="border border-black px-0.5 py-0.5 text-right bg-yellow-100 print:bg-transparent" style={{ fontSize: '6pt' }}>{renderManualInputField("fdInterest", taxA.fdInterest)}</td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>(d)</td>
            <td colSpan={5} className="border border-black px-0.5 py-0.5 font-bold" style={{ fontSize: '6pt' }}>કુલ વ્યાજ આવક ( A TO C )</td>
            <td colSpan={2} className="border border-black px-0.5 py-0.5 text-right" style={{ fontSize: '6pt' }}>RS.</td>
            <td className="border border-black px-0.5 py-0.5 text-right font-bold" style={{ fontSize: '6pt' }}>{renderAutoField(taxA.totalInterestIncome)}</td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>"(2)</td>
            <td colSpan={8} className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>સગીર બાળકની ઉમેરવા પત્ર આવક</td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>"(3)</td>
            <td colSpan={8} className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>નીચેનામાંથી મળેલ આવક</td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>(c)</td>
            <td colSpan={5} className="border border-black px-0.5 py-0.5 bg-yellow-50 print:bg-transparent" style={{ fontSize: '6pt' }}>પરીક્ષાનુ મહેનતાણું</td>
            <td colSpan={2} className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td className="border border-black px-0.5 py-0.5 text-right bg-yellow-100 print:bg-transparent" style={{ fontSize: '6pt' }}>{renderManualInputField("examIncome", taxA.examIncome)}</td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>(e)</td>
            <td colSpan={5} className="border border-black px-0.5 py-0.5 font-bold" style={{ fontSize: '6pt' }}>કુલ Total(a TO d)</td>
            <td colSpan={2} className="border border-black px-0.5 py-0.5 text-right" style={{ fontSize: '6pt' }}>RS.</td>
            <td className="border border-black px-0.5 py-0.5 text-right font-bold" style={{ fontSize: '6pt' }}>{renderAutoField(taxA.examIncome || 0)}</td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>"(4)</td>
            <td colSpan={6} className="border border-black px-0.5 py-0.5 bg-yellow-50 print:bg-transparent" style={{ fontSize: '6pt' }}>મકાન મિલકત સંબધિત આવક</td>
            <td colSpan={2} className="border border-black px-0.5 py-0.5 text-right" style={{ fontSize: '6pt' }}>RS.</td>
            <td className="border border-black px-0.5 py-0.5 text-right bg-yellow-100 print:bg-transparent" style={{ fontSize: '6pt' }}>{renderManualInputField("housePropertyIncome", taxA.housePropertyIncome)}</td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>"(5)</td>
            <td colSpan={7} className="border border-black px-0.5 py-0.5 font-bold" style={{ fontSize: '6pt' }}>કુલ અન્ય આવક [Column (1)(d)+(2)+(3)(e)+(4) ]</td>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td colSpan={2} className="border border-black px-0.5 py-0.5 text-right font-bold" style={{ fontSize: '6pt' }}>{renderAutoField(taxA.totalOtherIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Section C - Gross Total Income */}
      <table className="w-full border-collapse mt-0.5" style={{ fontSize: '6pt' }}>
        <tbody>
          <tr>
            <td colSpan={11} className="border border-black px-0.5 py-0.5 font-bold bg-gray-100" style={{ fontSize: '6pt' }}>વિભાગ (c) સમગ્ર કુલ આવક પગાર તથા અન્ય</td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>"(1)</td>
            <td colSpan={7} className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>PRO. INCOME તથા અન્ય આવક વિભાગ A(5)+B(5)</td>
            <td colSpan={2} className="border border-black px-0.5 py-0.5 text-right" style={{ fontSize: '6pt' }}>RS.</td>
            <td className="border border-black px-0.5 py-0.5 text-right font-bold" style={{ fontSize: '6pt' }}>{renderAutoField(taxA.grossTotalIncome)}</td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>"(2)</td>
            <td colSpan={7} className="border border-black px-0.5 py-0.5 bg-yellow-50 print:bg-transparent" style={{ fontSize: '6pt' }}>મકાન લોનનું વ્યાજ બાદ મળવા પાત્ર રકમ Rule 24(2)</td>
            <td colSpan={2} className="border border-black px-0.5 py-0.5 text-right" style={{ fontSize: '6pt' }}>RS.</td>
            <td className="border border-black px-0.5 py-0.5 text-right bg-yellow-100 print:bg-transparent" style={{ fontSize: '6pt' }}>{renderManualInputField("housingLoanInterest", taxA.housingLoanInterest)}</td>
          </tr>
          <tr>
            <td className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}>"(3)</td>
            <td colSpan={7} className="border border-black px-0.5 py-0.5 font-bold" style={{ fontSize: '6pt' }}>PRO. INCOME (Column 1-2)</td>
            <td colSpan={2} className="border border-black px-0.5 py-0.5" style={{ fontSize: '6pt' }}></td>
            <td className="border border-black px-0.5 py-0.5 text-right font-bold" style={{ fontSize: '6pt' }}>{renderAutoField(taxA.proIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <div className="form-footer text-center mt-1 pt-0.5" style={{ fontSize: '5pt' }}>
        Developed by - Smart Computer - 9924640689 ,9574031243
      </div>
    </div>
  );
};

export default AavakVeraFormA;
