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

  return (
    <div className="tax-form-container tax-form-print" id="aavak-vera-form-a">
      <div className="form-title gujarati-text">આવક વેરા ગણતરી ફોર્મ</div>

      {/* Header Info */}
      <table className="mb-4">
        <tbody>
          <tr>
            <td className="label-cell w-32">NAME</td>
            <td colSpan={3} className="font-bold">{client.name}</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td className="label-cell">INCOME YEAR</td>
            <td colSpan={2}>{formData.salaryData.financialYear}</td>
            <td className="label-cell">ASSESSMENT YEAR</td>
            <td>{client.assessmentYear}</td>
            <td></td>
          </tr>
          <tr>
            <td className="label-cell">VILLAGE</td>
            <td colSpan={2}>{client.schoolName}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td className="label-cell">DESIGNATION</td>
            <td colSpan={2}>{client.designation}</td>
            <td className="label-cell">DATE OF BIRTH</td>
            <td>{client.dateOfBirth}</td>
            <td></td>
          </tr>
          <tr>
            <td className="label-cell">PAN NO.</td>
            <td colSpan={2}>{client.panNo}</td>
            <td className="label-cell">MOBILE NO</td>
            <td>{client.mobileNo}</td>
            <td></td>
          </tr>
          <tr>
            <td className="label-cell">BANK ACC.NO</td>
            <td colSpan={2}>{client.bankAcNo}</td>
            <td className="label-cell">AADHAR NO</td>
            <td>{client.aadharNo}</td>
            <td></td>
          </tr>
          <tr>
            <td className="label-cell">IFSC CODE</td>
            <td colSpan={2}>{client.ifscCode}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {/* Section A - Salary Income */}
      <table>
        <tbody>
          <tr className="header-row">
            <td colSpan={4} className="gujarati-text font-bold">કુલ ગ્રોસ આવક : AS PER RULE 17</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxA.grossSalary}</td>
          </tr>
          
          <tr className="header-row">
            <td colSpan={6} className="gujarati-text">કલમ ૧૦ મુજબ બાદ પાત કરમુક્ત ભથ્થાઓ</td>
          </tr>
          
          <tr>
            <td>(a)</td>
            <td colSpan={3} className="gujarati-text">ઘરભાડું ભાડાના મકાનમાં રહેતા હોઈ તો જ RULE 10(13-A)</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td>(I)</td>
            <td colSpan={2} className="gujarati-text">પગાર બીલેથી મળેલ ઘરભાડું</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxA.hraExempt}</td>
          </tr>
          
          <tr>
            <td>(b)</td>
            <td colSpan={3} className="gujarati-text">ડ્રેસ ધોલાઈ ભથ્થું</td>
            <td></td>
            <td></td>
          </tr>
          
          <tr>
            <td>(c)</td>
            <td colSpan={3} className="gujarati-text">ટ્રાન્સપોર્ટ એલ્લા.વાર્ષિક રૂ.9600 ની મર્યાદા</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxA.transportAllowance}</td>
          </tr>
          
          <tr>
            <td>(d)</td>
            <td colSpan={3} className="gujarati-text">કુલ રકમ 10 હેઠળ બાદ મળવા પાત્ર ભથ્થાઓ</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxA.totalExempt}</td>
          </tr>
          
          <tr className="total-row">
            <td colSpan={4} className="gujarati-text">બાકિ પગાર આવક (Column:1-2(d))</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxA.balanceSalary || taxA.grossSalary}</td>
          </tr>
          
          <tr>
            <td>(a)</td>
            <td colSpan={3} className="gujarati-text">વ્યવસાય વેરાની ભરેલ રકમ + STANDARD DEDUCTION</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxA.professionTax + taxA.standardDeduction}</td>
          </tr>
          
          <tr className="total-row">
            <td colSpan={4}>(Column:3-4) PRO INCOME</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxA.professionalIncome}</td>
          </tr>
        </tbody>
      </table>

      {/* Section B - Other Income */}
      <div className="section-title gujarati-text">વિભાગ (B) અન્ય આવક વિભાગ</div>
      <table>
        <tbody>
          <tr>
            <td>(1)</td>
            <td>(a)</td>
            <td className="gujarati-text">બેંક વ્યાજ આવક SAVING</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell w-24">
              <Input
                type="number"
                value={taxA.bankInterest || ''}
                onChange={(e) => updateField('bankInterest', Number(e.target.value) || 0)}
                className="w-full h-6 text-xs text-right p-1 border-0 bg-transparent"
                disabled={readOnly}
              />
            </td>
          </tr>
          <tr>
            <td></td>
            <td>(b)</td>
            <td className="gujarati-text">એન.એસ.સી. વ્યાજ</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">
              <Input
                type="number"
                value={taxA.nscInterest || ''}
                onChange={(e) => updateField('nscInterest', Number(e.target.value) || 0)}
                className="w-full h-6 text-xs text-right p-1 border-0 bg-transparent"
                disabled={readOnly}
              />
            </td>
          </tr>
          <tr>
            <td></td>
            <td>(c)</td>
            <td className="gujarati-text">ફિકસ ડિપૉજીટ વ્યાજ</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">
              <Input
                type="number"
                value={taxA.fdInterest || ''}
                onChange={(e) => updateField('fdInterest', Number(e.target.value) || 0)}
                className="w-full h-6 text-xs text-right p-1 border-0 bg-transparent"
                disabled={readOnly}
              />
            </td>
          </tr>
          <tr>
            <td></td>
            <td>(d)</td>
            <td className="gujarati-text font-bold">કુલ વ્યાજ આવક (A TO C)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxA.totalInterestIncome}</td>
          </tr>
          
          <tr>
            <td>(2)</td>
            <td colSpan={2} className="gujarati-text">સગીર બાળકની ઉમેરવા પત્ર આવક</td>
            <td></td>
            <td></td>
          </tr>
          
          <tr>
            <td>(3)</td>
            <td>(c)</td>
            <td className="gujarati-text">પરીક્ષાનુ મહેનતાણું</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">
              <Input
                type="number"
                value={taxA.examIncome || ''}
                onChange={(e) => updateField('examIncome', Number(e.target.value) || 0)}
                className="w-full h-6 text-xs text-right p-1 border-0 bg-transparent"
                disabled={readOnly}
              />
            </td>
          </tr>
          <tr>
            <td></td>
            <td>(e)</td>
            <td className="gujarati-text font-bold">કુલ Total (a TO d)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxA.totalOtherIncome}</td>
          </tr>
          
          <tr>
            <td>(4)</td>
            <td colSpan={2} className="gujarati-text">મકાન મિલકત સંબધિત આવક</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxA.housePropertyIncome}</td>
          </tr>
          
          <tr className="total-row">
            <td>(5)</td>
            <td colSpan={2} className="gujarati-text font-bold">કુલ અન્ય આવક</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxA.totalOtherIncome}</td>
          </tr>
        </tbody>
      </table>

      {/* Section C - Gross Total Income */}
      <div className="section-title gujarati-text">વિભાગ (C) સમગ્ર કુલ આવક પગાર તથા અન્ય</div>
      <table>
        <tbody>
          <tr>
            <td>(1)</td>
            <td colSpan={2} className="gujarati-text">PRO. INCOME તથા અન્ય આવક વિભાગ A(5)+B(5)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxA.grossTotalIncome}</td>
          </tr>
          <tr>
            <td>(2)</td>
            <td colSpan={2} className="gujarati-text">મકાન લોનનું વ્યાજ બાદ મળવા પાત્ર રકમ Rule 24(2)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxA.housingLoanInterest}</td>
          </tr>
          <tr className="total-row">
            <td>(3)</td>
            <td colSpan={2} className="font-bold">PRO. INCOME (Column 1-2)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxA.proIncome}</td>
          </tr>
        </tbody>
      </table>

      <div className="footer-note">
        Created By: Smart Computer Vinchhiya - Rupsangbhai Jamod-9924640689
      </div>
    </div>
  );
};

export default AavakVeraFormA;
