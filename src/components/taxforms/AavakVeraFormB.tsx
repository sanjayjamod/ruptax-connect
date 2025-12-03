import { Client } from "@/types/client";
import { TaxFormData } from "@/types/taxForm";
import "./PrintStyles.css";

interface AavakVeraFormBProps {
  client: Client;
  formData: TaxFormData;
  onChange: (data: TaxFormData) => void;
  readOnly?: boolean;
}

const AavakVeraFormB = ({ client, formData, onChange, readOnly = false }: AavakVeraFormBProps) => {
  const taxB = formData.taxCalculationB;

  const updateField = (field: keyof typeof formData.taxCalculationB, value: number | string) => {
    onChange({
      ...formData,
      taxCalculationB: { ...formData.taxCalculationB, [field]: value },
    });
  };

  const renderInputField = (field: keyof typeof taxB, value: number) => (
    readOnly ? (
      <span>{value || 0}</span>
    ) : (
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        defaultValue={value || ''}
        onBlur={(e) => updateField(field, Number(e.target.value) || 0)}
        className="w-20 h-5 text-xs text-right p-1 border-0 bg-transparent inline-block focus:outline-none focus:bg-yellow-50"
      />
    )
  );

  return (
    <div className="tax-form-container tax-form-print page-break" id="aavak-vera-form-b">
      <div className="text-center font-bold text-lg mb-3 border-b-2 border-black pb-1">
        આવક વેરા ગણતરી ફોર્મ
      </div>

      {/* Section D - Deductions under 80C */}
      <div className="font-bold text-[11px] mb-2 bg-gray-800 text-white p-1">
        વિભાગ (D) સમગ્ર કુલ આવક માંથી કલમ મુજબ બાદ મળતર વિભાગ
      </div>
      
      <table style={{ fontSize: '10px' }}>
        <tbody>
          <tr className="header-row">
            <td className="w-6">1</td>
            <td colSpan={2}>Under section 80-C</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td className="w-8">(i)</td>
            <td>જી.પી.એફ</td>
            <td className="text-right w-10">Rs.</td>
            <td className="amount-cell w-20">{taxB.gpf || 0}</td>
          </tr>
          <tr>
            <td></td>
            <td>(ii)</td>
            <td>સી.પી.એફ</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell">{taxB.cpf || 0}</td>
          </tr>
          <tr>
            <td></td>
            <td>(iii)</td>
            <td>એલ.આઈ.સી. પ્રીમિયમ</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell">{taxB.licPremium || 0}</td>
          </tr>
          <tr>
            <td></td>
            <td>(iv)</td>
            <td>પી.એલ.ઈ/આઈ.પ્રીમિયમ</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell">{taxB.pliPremium || 0}</td>
          </tr>
          <tr>
            <td></td>
            <td>(v)</td>
            <td>જૂથ વીમો</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell">{taxB.groupInsurance || 0}</td>
          </tr>
          <tr>
            <td></td>
            <td>(vi)</td>
            <td>પી.પી.એફ</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell">{taxB.ppf || 0}</td>
          </tr>
          <tr>
            <td></td>
            <td>(vii)</td>
            <td>એન.એસ.સી.માં કરેલ રોકાણ</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell">{taxB.nscInvestment || 0}</td>
          </tr>
          <tr>
            <td></td>
            <td>(viii)</td>
            <td>મકાન લોનના હપ્તાની રકમ (મુદ્દલ)</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell">{taxB.housingLoanPrincipal || 0}</td>
          </tr>
          <tr>
            <td></td>
            <td>(ix)</td>
            <td>બાળકોની શિક્ષણ ફી ચુકવેલ</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell">{taxB.educationFee || 0}</td>
          </tr>
          <tr>
            <td></td>
            <td>(x)</td>
            <td>અન્ય રોકાણ ૮૦ સી મુજબ (SSY, FD, etc.)</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell">{taxB.otherInvestment80C || 0}</td>
          </tr>
          <tr className="total-row">
            <td></td>
            <td></td>
            <td className="font-bold">કુલ રોકાણ</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell font-bold">{taxB.total80C || 0}</td>
          </tr>
          <tr className="total-row">
            <td></td>
            <td></td>
            <td className="font-bold">૧૫૦૦૦૦ની મર્યાદામાં</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell font-bold">{taxB.max80C || 0}</td>
          </tr>
          
          {/* Other Sections */}
          <tr>
            <td>2</td>
            <td colSpan={2}>મેડીકલેઇમ 80-D (Upto Rs.25000)</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell">
              {renderInputField("medicalInsurance80D", taxB.medicalInsurance80D)}
            </td>
          </tr>
          <tr>
            <td>3</td>
            <td colSpan={2}>વિકલાંગ આશ્રિત 80-DD (Upto Rs.50000)</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell">
              {renderInputField("disabledDependent80DD", taxB.disabledDependent80DD)}
            </td>
          </tr>
          <tr>
            <td>4</td>
            <td colSpan={2}>ગંભીર રોગ 80-DDB (Upto Rs.40000)</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell">
              {renderInputField("seriousDisease80DDB", taxB.seriousDisease80DDB)}
            </td>
          </tr>
          <tr>
            <td>5</td>
            <td colSpan={2}>અંધ/અપંગ 80-U (75000-125000)</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell">
              {renderInputField("disability80U", taxB.disability80U)}
            </td>
          </tr>
          <tr>
            <td>6</td>
            <td colSpan={2}>દાન 80-G (50%)</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell">
              {renderInputField("donation80G", taxB.donation80G)}
            </td>
          </tr>
          <tr>
            <td>7</td>
            <td colSpan={2}>સેવિંગ બેંક વ્યાજ 80TTA (Rs.10000 મર્યાદા)</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell">
              {renderInputField("savingsBankInterest80TTA", taxB.savingsBankInterest80TTA)}
            </td>
          </tr>
          <tr className="total-row">
            <td>8</td>
            <td colSpan={2} className="font-bold">રોકાણ બાદ મળવા પાત્ર રકમનો સરવાળો</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell font-bold">{taxB.totalDeductions || 0}</td>
          </tr>
          <tr className="total-row">
            <td>9</td>
            <td colSpan={2} className="font-bold">બાકી મળવા પાત્ર આવક</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell font-bold">{taxB.taxableIncome || 0}</td>
          </tr>
          <tr className="total-row">
            <td>10</td>
            <td colSpan={2} className="font-bold">દશનાં રાઉન્ડમાં કરપાત્ર રકમ</td>
            <td className="text-right">Rs.</td>
            <td className="amount-cell font-bold">{taxB.roundedTaxableIncome || 0}</td>
          </tr>
        </tbody>
      </table>

      {/* Tax Slabs - NEW REGIME 2025-26 */}
      <div className="font-bold text-[11px] mt-3 mb-1 bg-gray-200 p-1">TAX CALCULATION (NEW REGIME 2025-26)</div>
      <table style={{ fontSize: '9px' }}>
        <tbody>
          <tr>
            <td className="w-6">1</td>
            <td>Upto Rs.4,00,000 (Male & Female)</td>
            <td className="text-center w-10">0%</td>
            <td className="amount-cell w-16">400000</td>
            <td className="amount-cell w-16">400000</td>
            <td className="amount-cell w-16">0</td>
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
            <td>UP TO Rs.24,00,001+</td>
            <td className="text-center">30%</td>
            <td className="amount-cell"></td>
            <td className="amount-cell">{Math.max(0, (taxB.roundedTaxableIncome || 0) - 2400000)}</td>
            <td className="amount-cell">{Math.round(Math.max(0, (taxB.roundedTaxableIncome || 0) - 2400000) * 0.30)}</td>
          </tr>
        </tbody>
      </table>

      {/* Tax Summary */}
      <div className="font-bold text-[11px] mt-3 mb-1 bg-gray-800 text-white p-1">ઇન્કમટેક્ષ ગણતરી</div>
      <table style={{ fontSize: '10px' }}>
        <tbody>
          <tr>
            <td colSpan={2}>ભરવાપાત્ર ઇન્કમટેક્ષ</td>
            <td className="text-right w-10">RS.</td>
            <td className="amount-cell font-bold w-20">{taxB.totalTax || 0}</td>
          </tr>
          <tr>
            <td colSpan={2}>Tax Rebate Section 87A (Up To Rs.25,000 if income ≤7L)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{taxB.taxRebate87A || 0}</td>
          </tr>
          <tr>
            <td colSpan={2}>ટેક્ષ રિબેટ બાદ ભરવા પાત્ર ઇન્કમટેક્ષ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{taxB.taxAfterRebate || 0}</td>
          </tr>
          <tr>
            <td colSpan={2}>Education Cess 4%</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{taxB.educationCess || 0}</td>
          </tr>
          <tr className="total-row">
            <td colSpan={2} className="font-bold">કુલ ભરવા પાત્ર ઈન્કમટેક્ષ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{taxB.totalTaxPayable || 0}</td>
          </tr>
          <tr>
            <td colSpan={2}>RELIEF UNDER SECTION 89</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">
              {renderInputField("relief89", taxB.relief89)}
            </td>
          </tr>
          <tr className="total-row">
            <td colSpan={2} className="font-bold">કુલ ભરવાપાત્ર ઇન્કમટેક્સ Net Amount</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{taxB.netTaxPayable || 0}</td>
          </tr>
        </tbody>
      </table>

      {/* Tax Payment Summary */}
      <div className="font-bold text-[11px] mt-3 mb-1 bg-gray-200 p-1">
        ઇન્કમટેક્ષની વિગત (પગારમાંથી ભરેલ તથા ભરવા પાત્ર)
      </div>
      <table style={{ fontSize: '10px' }}>
        <tbody>
          <tr>
            <td className="w-6">1</td>
            <td>ભરપાઈ કરેલ ઇન્કમટેક્ષ</td>
            <td className="text-right w-10">RS.</td>
            <td className="amount-cell w-20">{taxB.taxPaid || 0}</td>
          </tr>
          <tr>
            <td>2</td>
            <td>ભરવાપાત્ર બાકી રહેલ ટેક્ષની રકમ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{taxB.balanceTax || 0}</td>
          </tr>
          <tr>
            <td>3</td>
            <td>
              Recovered from pay of{' '}
              {readOnly ? (
                taxB.recoveredMonth || '___________'
              ) : (
                <input
                  type="text"
                  defaultValue={taxB.recoveredMonth || ''}
                  onBlur={(e) => updateField('recoveredMonth', e.target.value)}
                  className="w-24 h-5 text-xs p-1 border-0 bg-transparent inline-block focus:outline-none focus:bg-yellow-50"
                  placeholder="Month"
                />
              )}
            </td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{taxB.balanceTax || 0}</td>
          </tr>
          <tr className="total-row">
            <td>4</td>
            <td className="font-bold">કુલ ભરપાઈ કરેલ ઇન્કમટેક્ષની રકમ</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{taxB.totalTaxPaid || 0}</td>
          </tr>
        </tbody>
      </table>

      {/* Certificates */}
      <div className="mt-3 p-2 border border-black text-[10px]">
        <p className="font-bold">કર્મચારી (શિક્ષક) બાંહેધરી</p>
        <p>આ પત્રકમાં ભરેલ તમામ વિગતો સાચી અને દોષ રહિત છે. જેની આથી હું ખાત્રી આપું છું.</p>
        <p className="text-right mt-2">સહી: _______________</p>
      </div>

      <div className="mt-2 p-2 border border-black text-[10px]">
        <p className="font-bold">સંસ્થાના વડાનું પ્રમાણપત્ર</p>
        <p>આ પત્રકમાં ભરેલ તમામ પગારદાર વિગતો સંસ્થાના હિસાબી દફતરે પ્રમાણે અને રોકાણોના આધારો અત્રેની ઓફિસમાં કર્મચારીએ રાખેલ છે.</p>
        <p className="text-right mt-2">Signature and seal of Head of office</p>
      </div>

      <div className="text-center text-[8px] mt-4 pt-2 border-t border-dashed border-gray-400">
        Created By: Smart Computer Vinchhiya - Rupsangbhai Jamod - 9924640689
      </div>
    </div>
  );
};

export default AavakVeraFormB;
