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
      <table className="w-full border-collapse" style={{ fontSize: '7pt' }}>
        <tbody>
          <tr>
            <td colSpan={11} className="text-center font-bold border border-black py-2" style={{ fontSize: '11pt' }}>
              આવક વેરા ગણતરી ફોર્મ
            </td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2 font-bold" style={{ width: '12%', fontSize: '7pt' }}>NAME</td>
            <td colSpan={3} className="border border-black px-1 py-2" style={{ width: '38%', fontSize: '7pt' }}>{client.name}</td>
            <td colSpan={3} className="border border-black px-1 py-2" style={{ width: '25%', fontSize: '7pt' }}></td>
            <td colSpan={4} className="border border-black px-1 py-2" style={{ width: '25%', fontSize: '7pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2 font-bold" style={{ fontSize: '7pt' }}>INCOME YEAR</td>
            <td colSpan={3} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>{formData.salaryData.financialYear}</td>
            <td colSpan={3} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td className="border border-black px-1 py-2 font-bold" style={{ fontSize: '7pt' }}>ASSESSMENT YEAR</td>
            <td colSpan={3} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>{client.assessmentYear || '2026-2027'}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2 font-bold" style={{ fontSize: '7pt' }}>VILLAGE</td>
            <td colSpan={3} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>{client.schoolName || '-'}</td>
            <td colSpan={3} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td colSpan={4} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2 font-bold" style={{ fontSize: '7pt' }}>DESIGNATION</td>
            <td colSpan={3} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>{client.designation || '-'}</td>
            <td colSpan={3} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td className="border border-black px-1 py-2 font-bold" style={{ fontSize: '7pt' }}>DATE OF BIRTH</td>
            <td colSpan={3} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>{client.dateOfBirth || '-'}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2 font-bold" style={{ fontSize: '7pt' }}>PAN NO.</td>
            <td colSpan={3} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>{client.panNo || '-'}</td>
            <td colSpan={3} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td className="border border-black px-1 py-2 font-bold" style={{ fontSize: '7pt' }}>MOBILE NO</td>
            <td colSpan={3} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>{client.mobileNo || '-'}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2 font-bold" style={{ fontSize: '7pt' }}>BANK ACC.NO</td>
            <td colSpan={3} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>{client.bankAcNo || '-'}</td>
            <td colSpan={3} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td className="border border-black px-1 py-2 font-bold" style={{ fontSize: '7pt' }}>AADHAR NO</td>
            <td colSpan={3} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>{client.aadharNo || '-'}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2 font-bold" style={{ fontSize: '7pt' }}>IFSC CODE</td>
            <td colSpan={3} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>{client.ifscCode || '-'}</td>
            <td colSpan={7} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
          </tr>
        </tbody>
      </table>

      {/* Section A - Salary Income */}
      <table className="w-full border-collapse mt-1" style={{ fontSize: '7pt' }}>
        <tbody>
          <tr>
            <td colSpan={4} className="border border-black px-1 py-2 font-bold" style={{ fontSize: '7pt' }}>કુલ ગ્રોસ આવક : AS PER RULE 17</td>
            <td colSpan={5} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td className="border border-black px-1 py-2 text-right font-bold" style={{ fontSize: '7pt' }}>RS.</td>
            <td className="border border-black px-1 py-2 text-right font-bold" style={{ fontSize: '7pt' }}>{renderAutoField(taxA.grossSalary)}</td>
          </tr>
          <tr>
            <td colSpan={11} className="border border-black px-1 py-2 font-bold bg-gray-100" style={{ fontSize: '7pt' }}>કલમ ૧૦ મુજબ બાદ પાત કરમુક્ત ભથ્થાઓ</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>(a)</td>
            <td colSpan={8} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>ઘરભાડું ભાડાના મકાનમાં રહેતા હોઈ તો જ જે ઓછુ હોય તે RULE 10(13-A)</td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td colSpan={6} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>( I ) પગાર બીલેથી મળેલ ઘરભાડું</td>
            <td colSpan={2} className="border border-black px-1 py-2 text-right" style={{ fontSize: '7pt' }}>Rs.</td>
            <td className="border border-black px-1 py-2 text-right" style={{ fontSize: '7pt' }}>{renderAutoField(0)}</td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td colSpan={6} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>( II )ભાડા પેટે ચુકવેલ રકમ જો પગાર અને મોંઘવારી વાર્ષિક</td>
            <td colSpan={2} className="border border-black px-1 py-2 text-right" style={{ fontSize: '7pt' }}>Rs.</td>
            <td className="border border-black px-1 py-2 text-right" style={{ fontSize: '7pt' }}></td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td colSpan={6} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>(VII) બાદ મળવા પાત્ર ઘરભાડું</td>
            <td colSpan={2} className="border border-black px-1 py-2 text-right" style={{ fontSize: '7pt' }}>RS.</td>
            <td className="border border-black px-1 py-2 text-right" style={{ fontSize: '7pt' }}>{renderAutoField(taxA.hraExempt)}</td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>(b)</td>
            <td colSpan={8} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>ડ્રેસ ધોલાઈ ભથ્થું</td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>(c)</td>
            <td colSpan={6} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>ટ્રાન્સપોર્ટ એલ્લા.વાર્ષિક રૂ.9600 ની મર્યાદા</td>
            <td colSpan={2} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td className="border border-black px-1 py-2 text-right" style={{ fontSize: '7pt' }}>{renderAutoField(taxA.transportAllowance)}</td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>(d)</td>
            <td colSpan={6} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>કુલ રકમ 10 હેઠળ બાદ મળવા પાત્ર ભથ્થાઓ</td>
            <td colSpan={2} className="border border-black px-1 py-2 text-right" style={{ fontSize: '7pt' }}>Rs.</td>
            <td className="border border-black px-1 py-2 text-right font-bold" style={{ fontSize: '7pt' }}>{renderAutoField(taxA.totalExempt)}</td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
          </tr>
          <tr>
            <td colSpan={8} className="border border-black px-1 py-2 font-bold" style={{ fontSize: '7pt' }}>બાકિ પગાર આવક (Column:1-2(d))</td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td className="border border-black px-1 py-2 text-right font-bold" style={{ fontSize: '7pt' }}>RS.</td>
            <td className="border border-black px-1 py-2 text-right font-bold" style={{ fontSize: '7pt' }}>{renderAutoField(taxA.balanceSalary || taxA.grossSalary)}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>(a)</td>
            <td colSpan={7} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>STANDERD DIDUCATION</td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td colSpan={2} className="border border-black px-1 py-2 text-right" style={{ fontSize: '7pt' }}>{renderAutoField(taxA.standardDeduction || 75000)}</td>
          </tr>
          <tr>
            <td colSpan={8} className="border border-black px-1 py-2 font-bold" style={{ fontSize: '7pt' }}>(Column:3-4) PRO INCOME</td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td className="border border-black px-1 py-2 text-right font-bold" style={{ fontSize: '7pt' }}>RS.</td>
            <td className="border border-black px-1 py-2 text-right font-bold" style={{ fontSize: '7pt' }}>{renderAutoField(taxA.professionalIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Section B - Other Income */}
      <table className="w-full border-collapse mt-1" style={{ fontSize: '7pt' }}>
        <tbody>
          <tr>
            <td colSpan={11} className="border border-black px-1 py-2 font-bold bg-gray-100" style={{ fontSize: '7pt' }}>વિભાગ ( B ) અન્ય આવક વિભાગ</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>"(1)</td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>(a)</td>
            <td colSpan={4} className="border border-black px-1 py-2 bg-yellow-50 print:bg-transparent" style={{ fontSize: '7pt' }}>બેંક વ્યાજ આવક</td>
            <td colSpan={2} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>SAVING</td>
            <td className="border border-black px-1 py-2 text-right" style={{ fontSize: '7pt' }}>RS.</td>
            <td className="border border-black px-1 py-2 text-right bg-yellow-100 print:bg-transparent" style={{ fontSize: '7pt' }}>{renderManualInputField("bankInterest", taxA.bankInterest)}</td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>(b)</td>
            <td colSpan={5} className="border border-black px-1 py-2 bg-yellow-50 print:bg-transparent" style={{ fontSize: '7pt' }}>એન.એસ.સી. વ્યાજ</td>
            <td colSpan={2} className="border border-black px-1 py-2 text-right" style={{ fontSize: '7pt' }}>RS.</td>
            <td className="border border-black px-1 py-2 text-right bg-yellow-100 print:bg-transparent" style={{ fontSize: '7pt' }}>{renderManualInputField("nscInterest", taxA.nscInterest)}</td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>(c)</td>
            <td colSpan={5} className="border border-black px-1 py-2 bg-yellow-50 print:bg-transparent" style={{ fontSize: '7pt' }}>ફિકસ ડિપૉજીટ વ્યાજ</td>
            <td colSpan={2} className="border border-black px-1 py-2 text-right" style={{ fontSize: '7pt' }}>RS.</td>
            <td className="border border-black px-1 py-2 text-right bg-yellow-100 print:bg-transparent" style={{ fontSize: '7pt' }}>{renderManualInputField("fdInterest", taxA.fdInterest)}</td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>(d)</td>
            <td colSpan={5} className="border border-black px-1 py-2 font-bold" style={{ fontSize: '7pt' }}>કુલ વ્યાજ આવક ( A TO C )</td>
            <td colSpan={2} className="border border-black px-1 py-2 text-right" style={{ fontSize: '7pt' }}>RS.</td>
            <td className="border border-black px-1 py-2 text-right font-bold" style={{ fontSize: '7pt' }}>{renderAutoField(taxA.totalInterestIncome)}</td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>"(2)</td>
            <td colSpan={8} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>સગીર બાળકની ઉમેરવા પત્ર આવક</td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>"(3)</td>
            <td colSpan={8} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>નીચેનામાંથી મળેલ આવક</td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>(c)</td>
            <td colSpan={5} className="border border-black px-1 py-2 bg-yellow-50 print:bg-transparent" style={{ fontSize: '7pt' }}>પરીક્ષાનુ મહેનતાણું</td>
            <td colSpan={2} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td className="border border-black px-1 py-2 text-right bg-yellow-100 print:bg-transparent" style={{ fontSize: '7pt' }}>{renderManualInputField("examIncome", taxA.examIncome)}</td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>(e)</td>
            <td colSpan={5} className="border border-black px-1 py-2 font-bold" style={{ fontSize: '7pt' }}>કુલ Total(a TO d)</td>
            <td colSpan={2} className="border border-black px-1 py-2 text-right" style={{ fontSize: '7pt' }}>RS.</td>
            <td className="border border-black px-1 py-2 text-right font-bold" style={{ fontSize: '7pt' }}>{renderAutoField(taxA.examIncome || 0)}</td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>"(4)</td>
            <td colSpan={6} className="border border-black px-1 py-2 bg-yellow-50 print:bg-transparent" style={{ fontSize: '7pt' }}>મકાન મિલકત સંબધિત આવક</td>
            <td colSpan={2} className="border border-black px-1 py-2 text-right" style={{ fontSize: '7pt' }}>RS.</td>
            <td className="border border-black px-1 py-2 text-right bg-yellow-100 print:bg-transparent" style={{ fontSize: '7pt' }}>{renderManualInputField("housePropertyIncome", taxA.housePropertyIncome)}</td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>"(5)</td>
            <td colSpan={7} className="border border-black px-1 py-2 font-bold" style={{ fontSize: '7pt' }}>કુલ અન્ય આવક [Column (1)(d)+(2)+(3)(e)+(4) ]</td>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td colSpan={2} className="border border-black px-1 py-2 text-right font-bold" style={{ fontSize: '7pt' }}>{renderAutoField(taxA.totalOtherIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Section C - Gross Total Income */}
      <table className="w-full border-collapse mt-1" style={{ fontSize: '7pt' }}>
        <tbody>
          <tr>
            <td colSpan={11} className="border border-black px-1 py-2 font-bold bg-gray-100" style={{ fontSize: '7pt' }}>વિભાગ (c) સમગ્ર કુલ આવક પગાર તથા અન્ય</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>"(1)</td>
            <td colSpan={7} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>PRO. INCOME તથા અન્ય આવક વિભાગ A(5)+B(5)</td>
            <td colSpan={2} className="border border-black px-1 py-2 text-right" style={{ fontSize: '7pt' }}>RS.</td>
            <td className="border border-black px-1 py-2 text-right font-bold" style={{ fontSize: '7pt' }}>{renderAutoField(taxA.grossTotalIncome)}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>"(2)</td>
            <td colSpan={7} className="border border-black px-1 py-2 bg-yellow-50 print:bg-transparent" style={{ fontSize: '7pt' }}>મકાન લોનનું વ્યાજ બાદ મળવા પાત્ર રકમ Rule 24(2)</td>
            <td colSpan={2} className="border border-black px-1 py-2 text-right" style={{ fontSize: '7pt' }}>RS.</td>
            <td className="border border-black px-1 py-2 text-right bg-yellow-100 print:bg-transparent" style={{ fontSize: '7pt' }}>{renderManualInputField("housingLoanInterest", taxA.housingLoanInterest)}</td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}>"(3)</td>
            <td colSpan={7} className="border border-black px-1 py-2 font-bold" style={{ fontSize: '7pt' }}>PRO. INCOME (Column 1-2)</td>
            <td colSpan={2} className="border border-black px-1 py-2" style={{ fontSize: '7pt' }}></td>
            <td className="border border-black px-1 py-2 text-right font-bold" style={{ fontSize: '7pt' }}>{renderAutoField(taxA.proIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <div className="form-footer text-center mt-2 pt-1.5" style={{ fontSize: '6pt' }}>
        Developed by - Smart Computer - 9924640689 ,9574031243
      </div>
    </div>
  );
};

export default AavakVeraFormA;
