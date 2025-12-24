import { Client } from "@/types/client";
import { TaxFormData } from "@/types/taxForm";
import "./PrintStyles.css";

interface AavakVeraFormBProps {
  client: Client;
  formData: TaxFormData;
  onChange: (data: TaxFormData) => void;
  readOnly?: boolean;
  isManualMode?: boolean;
}

const AavakVeraFormB = ({ client, formData, onChange, readOnly = false, isManualMode = false }: AavakVeraFormBProps) => {
  const taxB = formData.taxCalculationB;

  const updateField = (field: keyof typeof formData.taxCalculationB, value: number | string) => {
    onChange({
      ...formData,
      taxCalculationB: { ...formData.taxCalculationB, [field]: value },
    });
  };

  const renderManualInputField = (field: keyof typeof taxB, value: number) => (
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
    <div className="tax-form-container tax-form-print page-break" id="aavak-vera-form-b">
      <div className="text-center font-bold text-lg mb-1">આવક વેરા ગણતરી ફોર્મ</div>
      <div className="text-center text-xs mb-2">INCOME TAX CALCULATION FORM - PART B</div>
      <div className="text-center text-[10px] mb-3 border-b border-black pb-2">
        Assessment Year: {client.assessmentYear || '2026-2027'} | Name: {client.name}
      </div>

      {/* Section D - Deductions under Chapter VI-A */}
      <div className="font-bold text-[11px] mb-1 bg-gray-200 p-1">
        વિભાગ (D) - કલમ 80C મુજબ કપાત / DEDUCTIONS UNDER SECTION 80C
      </div>
      <table style={{ fontSize: '10px' }}>
        <tbody>
          <tr className="header-row">
            <td className="w-8"></td>
            <td colSpan={2}>Particulars / વિગત</td>
            <td className="w-10"></td>
            <td className="w-24">Amount (RS.)</td>
          </tr>
          <tr>
            <td>(i)</td>
            <td colSpan={2}>G.P.F / જી.પી.એફ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{renderAutoField(taxB.gpf)}</td>
          </tr>
          <tr>
            <td>(ii)</td>
            <td colSpan={2}>C.P.F / સી.પી.એફ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{renderAutoField(taxB.cpf)}</td>
          </tr>
          <tr>
            <td>(iii)</td>
            <td colSpan={2}>L.I.C. Premium / એલ.આઈ.સી. પ્રિમિયમ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{renderAutoField(taxB.licPremium)}</td>
          </tr>
          <tr>
            <td>(iv)</td>
            <td colSpan={2}>P.L.I Premium / પી.એલ.આઈ. પ્રિમિયમ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{renderAutoField(taxB.pliPremium)}</td>
          </tr>
          <tr>
            <td>(v)</td>
            <td colSpan={2}>Group Insurance / જૂથ વીમો</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{renderAutoField(taxB.groupInsurance)}</td>
          </tr>
          <tr>
            <td>(vi)</td>
            <td colSpan={2}>P.P.F / પી.પી.એફ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{renderAutoField(taxB.ppf)}</td>
          </tr>
          <tr>
            <td>(vii)</td>
            <td colSpan={2}>N.S.C. Investment / એન.એસ.સી. રોકાણ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{renderAutoField(taxB.nscInvestment)}</td>
          </tr>
          <tr>
            <td>(viii)</td>
            <td colSpan={2}>Housing Loan Principal / મકાન લોન મુદ્દલ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{renderAutoField(taxB.housingLoanPrincipal)}</td>
          </tr>
          <tr>
            <td>(ix)</td>
            <td colSpan={2}>Education Fee / બાળકોની શિક્ષણ ફી</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{renderAutoField(taxB.educationFee)}</td>
          </tr>
          <tr>
            <td>(x)</td>
            <td colSpan={2}>Other 80C (SSY, FD, etc.) / અન્ય રોકાણ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{renderAutoField(taxB.otherInvestment80C)}</td>
          </tr>
          <tr className="total-row">
            <td></td>
            <td colSpan={2}>Total 80C / કુલ રોકાણ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{renderAutoField(taxB.total80C)}</td>
          </tr>
          <tr className="total-row">
            <td></td>
            <td colSpan={2}>Maximum Allowed (Rs.1,50,000) / મહત્તમ મર્યાદા</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{renderAutoField(taxB.max80C)}</td>
          </tr>
        </tbody>
      </table>

      {/* Other Deductions */}
      <div className="font-bold text-[11px] mt-2 mb-1 bg-gray-200 p-1">
        અન્ય કપાત / OTHER DEDUCTIONS
      </div>
      <table style={{ fontSize: '10px' }}>
        <tbody>
          <tr>
            <td className="w-8">2</td>
            <td className="bg-yellow-50 print:bg-transparent">Medical Insurance 80D (Max Rs.25000)</td>
            <td className="text-right w-10">RS.</td>
            <td className="amount-cell w-24 bg-yellow-100 print:bg-transparent">
              {renderManualInputField("medicalInsurance80D", taxB.medicalInsurance80D)}
            </td>
          </tr>
          <tr>
            <td>3</td>
            <td className="bg-yellow-50 print:bg-transparent">Disabled Dependent 80DD (Max Rs.50000)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell bg-yellow-100 print:bg-transparent">
              {renderManualInputField("disabledDependent80DD", taxB.disabledDependent80DD)}
            </td>
          </tr>
          <tr>
            <td>4</td>
            <td className="bg-yellow-50 print:bg-transparent">Serious Disease 80DDB (Max Rs.40000)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell bg-yellow-100 print:bg-transparent">
              {renderManualInputField("seriousDisease80DDB", taxB.seriousDisease80DDB)}
            </td>
          </tr>
          <tr>
            <td>5</td>
            <td className="bg-yellow-50 print:bg-transparent">Disability 80U (Rs.75000-125000)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell bg-yellow-100 print:bg-transparent">
              {renderManualInputField("disability80U", taxB.disability80U)}
            </td>
          </tr>
          <tr>
            <td>6</td>
            <td className="bg-yellow-50 print:bg-transparent">Donation 80G (50%)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell bg-yellow-100 print:bg-transparent">
              {renderManualInputField("donation80G", taxB.donation80G)}
            </td>
          </tr>
          <tr>
            <td>7</td>
            <td className="bg-yellow-50 print:bg-transparent">Savings Bank Interest 80TTA (Max Rs.10000)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell bg-yellow-100 print:bg-transparent">
              {renderManualInputField("savingsBankInterest80TTA", taxB.savingsBankInterest80TTA)}
            </td>
          </tr>
          <tr className="total-row">
            <td>8</td>
            <td>Total Deductions / કુલ કપાત</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{renderAutoField(taxB.totalDeductions)}</td>
          </tr>
          <tr className="total-row">
            <td>9</td>
            <td className="font-bold">Taxable Income / કરપાત્ર આવક</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{renderAutoField(taxB.taxableIncome)}</td>
          </tr>
          <tr className="total-row">
            <td>10</td>
            <td className="font-bold">Rounded Taxable Income / રાઉન્ડ કરપાત્ર</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{renderAutoField(taxB.roundedTaxableIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Tax Calculation */}
      <div className="font-bold text-[11px] mt-2 mb-1 bg-gray-200 p-1">
        TAX CALCULATION (NEW REGIME 2025-26)
      </div>
      <table style={{ fontSize: '9px' }}>
        <thead>
          <tr className="header-row">
            <th className="w-6">Sr</th>
            <th>Income Slab</th>
            <th className="w-10">Rate</th>
            <th className="w-16">Slab Amt</th>
            <th className="w-16">Taxable</th>
            <th className="w-16">Tax</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Upto Rs.4,00,000</td>
            <td className="text-center">0%</td>
            <td className="amount-cell">400000</td>
            <td className="amount-cell">{Math.min(taxB.roundedTaxableIncome || 0, 400000)}</td>
            <td className="amount-cell">0</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Rs.4,00,001 To 8,00,000</td>
            <td className="text-center">5%</td>
            <td className="amount-cell">400000</td>
            <td className="amount-cell">{Math.min(Math.max(0, (taxB.roundedTaxableIncome || 0) - 400000), 400000)}</td>
            <td className="amount-cell">{Math.round(Math.min(Math.max(0, (taxB.roundedTaxableIncome || 0) - 400000), 400000) * 0.05)}</td>
          </tr>
          <tr>
            <td>3</td>
            <td>Rs.8,00,001 To 12,00,000</td>
            <td className="text-center">10%</td>
            <td className="amount-cell">400000</td>
            <td className="amount-cell">{Math.min(Math.max(0, (taxB.roundedTaxableIncome || 0) - 800000), 400000)}</td>
            <td className="amount-cell">{Math.round(Math.min(Math.max(0, (taxB.roundedTaxableIncome || 0) - 800000), 400000) * 0.10)}</td>
          </tr>
          <tr>
            <td>4</td>
            <td>Rs.12,00,001 To 16,00,000</td>
            <td className="text-center">15%</td>
            <td className="amount-cell">400000</td>
            <td className="amount-cell">{Math.min(Math.max(0, (taxB.roundedTaxableIncome || 0) - 1200000), 400000)}</td>
            <td className="amount-cell">{Math.round(Math.min(Math.max(0, (taxB.roundedTaxableIncome || 0) - 1200000), 400000) * 0.15)}</td>
          </tr>
          <tr>
            <td>5</td>
            <td>Rs.16,00,001 To 20,00,000</td>
            <td className="text-center">20%</td>
            <td className="amount-cell">400000</td>
            <td className="amount-cell">{Math.min(Math.max(0, (taxB.roundedTaxableIncome || 0) - 1600000), 400000)}</td>
            <td className="amount-cell">{Math.round(Math.min(Math.max(0, (taxB.roundedTaxableIncome || 0) - 1600000), 400000) * 0.20)}</td>
          </tr>
          <tr>
            <td>6</td>
            <td>Rs.20,00,001 To 24,00,000</td>
            <td className="text-center">25%</td>
            <td className="amount-cell">400000</td>
            <td className="amount-cell">{Math.min(Math.max(0, (taxB.roundedTaxableIncome || 0) - 2000000), 400000)}</td>
            <td className="amount-cell">{Math.round(Math.min(Math.max(0, (taxB.roundedTaxableIncome || 0) - 2000000), 400000) * 0.25)}</td>
          </tr>
          <tr>
            <td>7</td>
            <td>Above Rs.24,00,000</td>
            <td className="text-center">30%</td>
            <td className="amount-cell">-</td>
            <td className="amount-cell">{Math.max(0, (taxB.roundedTaxableIncome || 0) - 2400000)}</td>
            <td className="amount-cell">{Math.round(Math.max(0, (taxB.roundedTaxableIncome || 0) - 2400000) * 0.30)}</td>
          </tr>
        </tbody>
      </table>

      {/* Tax Summary */}
      <div className="font-bold text-[11px] mt-2 mb-1 bg-gray-200 p-1">
        TAX SUMMARY / ટેક્ષ સારાંશ
      </div>
      <table style={{ fontSize: '10px' }}>
        <tbody>
          <tr>
            <td className="w-8">11</td>
            <td>Total Tax / કુલ ટેક્ષ</td>
            <td className="text-right w-10">RS.</td>
            <td className="amount-cell w-24">{renderAutoField(taxB.totalTax)}</td>
          </tr>
          <tr>
            <td>12</td>
            <td>Tax Rebate 87A (Max Rs.25000 if income ≤7L)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{renderAutoField(taxB.taxRebate87A)}</td>
          </tr>
          <tr>
            <td>13</td>
            <td>Tax After Rebate / રિબેટ બાદ ટેક્ષ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{renderAutoField(taxB.taxAfterRebate)}</td>
          </tr>
          <tr>
            <td>14</td>
            <td>Education Cess 4%</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{renderAutoField(taxB.educationCess)}</td>
          </tr>
          <tr className="total-row">
            <td>15</td>
            <td className="font-bold">Total Tax Payable / કુલ ભરવાપાત્ર ટેક્ષ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{renderAutoField(taxB.totalTaxPayable)}</td>
          </tr>
          <tr>
            <td>16</td>
            <td className="bg-yellow-50 print:bg-transparent">Relief u/s 89</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell bg-yellow-100 print:bg-transparent">
              {renderManualInputField("relief89", taxB.relief89)}
            </td>
          </tr>
          <tr className="total-row">
            <td>17</td>
            <td className="font-bold">Net Tax Payable / ચોખ્ખો ભરવાપાત્ર ટેક્ષ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{renderAutoField(taxB.netTaxPayable)}</td>
          </tr>
          <tr>
            <td>18</td>
            <td>Tax Paid / ભરેલ ટેક્ષ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{renderAutoField(taxB.taxPaid)}</td>
          </tr>
          <tr className="total-row">
            <td>19</td>
            <td className="font-bold">Balance Tax / બાકી ટેક્ષ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{renderAutoField(taxB.balanceTax)}</td>
          </tr>
        </tbody>
      </table>

      {/* Certification */}
      <div className="border border-black p-2 mt-2 text-[9px]">
        <p className="mb-1">
          <strong>કર્મચારી બાંહેધરી:</strong> આ ફોર્મમાં ભરેલ તમામ વિગતો સાચી અને દોષરહિત છે જેની હું ખાત્રી આપું છું.
        </p>
        <div className="flex justify-between mt-3">
          <div>
            <p>Date: _______________</p>
            <p>Place: {client.schoolName || '_______________'}</p>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-1 min-w-[120px] mt-4">
              કર્મચારીની સહી
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-1 min-w-[120px] mt-4">
              સંસ્થાના વડાની સહી
            </div>
          </div>
        </div>
      </div>

      <div className="form-footer text-center text-[8px] mt-2 pt-1 border-t border-dashed border-gray-400">
        Created By: Smart Computer Vinchhiya 9924640689, 9574031243
      </div>
    </div>
  );
};

export default AavakVeraFormB;
