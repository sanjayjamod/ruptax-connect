import { Client } from "@/types/client";
import { TaxFormData } from "@/types/taxForm";
import { Input } from "@/components/ui/input";
import "./PrintStyles.css";

interface AavakVeraFormAProps {
  client: Client;
  formData: TaxFormData;
  onChange: (data: TaxFormData) => void;
  readOnly?: boolean;
}

const AavakVeraFormA = ({ client, formData, onChange, readOnly = false }: AavakVeraFormAProps) => {
  const taxA = formData.taxCalculationA;

  const updateField = (field: keyof typeof formData.taxCalculationA, value: number) => {
    onChange({
      ...formData,
      taxCalculationA: { ...formData.taxCalculationA, [field]: value },
    });
  };

  const InputField = ({ field, value }: { field: keyof typeof taxA; value: number }) => (
    readOnly ? (
      <span>{value || 0}</span>
    ) : (
      <Input
        type="number"
        value={value || ''}
        onChange={(e) => updateField(field, Number(e.target.value) || 0)}
        className="w-20 h-5 text-xs text-right p-1 border-0 bg-transparent inline-block"
      />
    )
  );

  return (
    <div className="tax-form-container tax-form-print" id="aavak-vera-form-a">
      <div className="text-center font-bold text-lg mb-3 border-b-2 border-black pb-1">
        આવક વેરા ગણતરી ફોર્મ
      </div>

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
            <td className="amount-cell font-bold w-24">{taxA.grossSalary || 0}</td>
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
            <td className="amount-cell w-20">{taxA.hraExempt || 0}</td>
          </tr>
          <tr>
            <td></td>
            <td>(VII)</td>
            <td>બાદ મળવા પાત્ર ઘરભાડું</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell">{taxA.hraExempt || 0}</td>
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
            <td className="amount-cell">{taxA.transportAllowance || 0}</td>
          </tr>
          <tr>
            <td>(d)</td>
            <td colSpan={2} className="font-bold">કુલ રકમ 10 હેઠળ બાદ મળવા પાત્ર ભથ્થાઓ</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell font-bold">{taxA.totalExempt || 0}</td>
          </tr>
          <tr className="total-row">
            <td colSpan={3}>બાકી પગાર આવક (Column:1-2(d))</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{taxA.balanceSalary || taxA.grossSalary || 0}</td>
          </tr>
          <tr>
            <td>(a)</td>
            <td colSpan={2}>વ્યવસાય વેરાની ભરેલ રકમ + STANDARD DEDUCTION</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell">{(taxA.professionTax || 0) + (taxA.standardDeduction || 50000)}</td>
          </tr>
          <tr className="total-row">
            <td colSpan={3}>(Column:3-4) PRO INCOME</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{taxA.professionalIncome || 0}</td>
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
            <td>બેંક વ્યાજ આવક SAVING</td>
            <td className="text-right w-10">RS.</td>
            <td className="amount-cell w-20">
              <InputField field="bankInterest" value={taxA.bankInterest} />
            </td>
          </tr>
          <tr>
            <td></td>
            <td>(b)</td>
            <td>એન.એસ.સી. વ્યાજ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">
              <InputField field="nscInterest" value={taxA.nscInterest} />
            </td>
          </tr>
          <tr>
            <td></td>
            <td>(c)</td>
            <td>ફિકસ ડિપૉઝીટ વ્યાજ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">
              <InputField field="fdInterest" value={taxA.fdInterest} />
            </td>
          </tr>
          <tr>
            <td></td>
            <td>(d)</td>
            <td className="font-bold">કુલ વ્યાજ આવક (A TO C)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{taxA.totalInterestIncome || 0}</td>
          </tr>
          <tr>
            <td>(2)</td>
            <td colSpan={4}>સગીર બાળકની ઉમેરવા પાત્ર આવક</td>
          </tr>
          <tr>
            <td>(3)</td>
            <td>(c)</td>
            <td>પરીક્ષાનું મહેનતાણું</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">
              <InputField field="examIncome" value={taxA.examIncome} />
            </td>
          </tr>
          <tr>
            <td></td>
            <td>(e)</td>
            <td className="font-bold">કુલ Total (a TO d)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{taxA.totalOtherIncome || 0}</td>
          </tr>
          <tr>
            <td>(4)</td>
            <td colSpan={2}>મકાન મિલકત સંબંધિત આવક</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{taxA.housePropertyIncome || 0}</td>
          </tr>
          <tr className="total-row">
            <td>(5)</td>
            <td colSpan={2} className="font-bold">કુલ અન્ય આવક</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{taxA.totalOtherIncome || 0}</td>
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
            <td className="amount-cell font-bold w-24">{taxA.grossTotalIncome || 0}</td>
          </tr>
          <tr>
            <td>(2)</td>
            <td>મકાન લોનનું વ્યાજ બાદ મળવા પાત્ર રકમ Rule 24(2)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{taxA.housingLoanInterest || 0}</td>
          </tr>
          <tr className="total-row">
            <td>(3)</td>
            <td className="font-bold">PRO. INCOME (Column 1-2)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{taxA.proIncome || 0}</td>
          </tr>
        </tbody>
      </table>

      <div className="text-center text-[8px] mt-4 pt-2 border-t border-dashed border-gray-400">
        Created By: Smart Computer Vinchhiya - Rupsangbhai Jamod - 9924640689
      </div>
    </div>
  );
};

export default AavakVeraFormA;
