import { Client } from "@/types/client";
import { TaxFormData } from "@/types/taxForm";
import { Input } from "@/components/ui/input";
import "./PrintStyles.css";

interface AavakVeraFormBProps {
  client: Client;
  formData: TaxFormData;
  onChange: (data: TaxFormData) => void;
  readOnly?: boolean;
}

const AavakVeraFormB = ({ client, formData, onChange, readOnly = false }: AavakVeraFormBProps) => {
  const taxB = formData.taxCalculationB;

  const updateField = (field: keyof typeof formData.taxCalculationB, value: number) => {
    onChange({
      ...formData,
      taxCalculationB: { ...formData.taxCalculationB, [field]: value },
    });
  };

  return (
    <div className="tax-form-container tax-form-print page-break" id="aavak-vera-form-b">
      <div className="form-title gujarati-text">આવક વેરા ગણતરી ફોર્મ (ભાગ-B)</div>

      {/* Section D - Deductions */}
      <div className="section-title gujarati-text">વિભાગ (D) સમગ્ર કુલ આવક માંથી કલમ મુજબ બાદ મળતર વિભાગ</div>
      
      <table>
        <tbody>
          <tr className="header-row">
            <td>1</td>
            <td colSpan={3}>Under section 80-C</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td>(i)</td>
            <td className="gujarati-text">જી.પી.એફ</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxB.gpf}</td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td>(ii)</td>
            <td className="gujarati-text">સી.પી.એફ</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.cpf}</td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td>(iii)</td>
            <td className="gujarati-text">એલ.આઈ.સી. પ્રીમિયમ</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.licPremium}</td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td>(iv)</td>
            <td className="gujarati-text">પી.એલ.ઈ/આઈ.પ્રીમિયમ</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.pliPremium}</td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td>(v)</td>
            <td className="gujarati-text">જૂથ વીમો</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.groupInsurance}</td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td>(vi)</td>
            <td className="gujarati-text">પી.પી.એફ</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.ppf}</td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td>(vii)</td>
            <td className="gujarati-text">એન.એસ.સી.માં કરેલ રોકાણ</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.nscInvestment}</td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td>(viii)</td>
            <td className="gujarati-text">મકાન લોનના હપ્તાની રકમ (મુદ્દલ)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.housingLoanPrincipal}</td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td>(ix)</td>
            <td className="gujarati-text">બાળકોની શિક્ષણ ફિ ચુકવેલ</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.educationFee}</td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td>(x)</td>
            <td className="gujarati-text">અન્ય રોકાણ ૮૦ સી મુજબ (SSY, FD, etc.)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.otherInvestment80C}</td>
            <td></td>
          </tr>
          <tr className="total-row">
            <td></td>
            <td></td>
            <td className="gujarati-text font-bold">કુલ રોકાણ</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxB.total80C}</td>
            <td></td>
          </tr>
          <tr className="total-row">
            <td></td>
            <td></td>
            <td className="gujarati-text font-bold">૧૫૦૦૦૦ની મર્યાદામાં</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxB.max80C}</td>
            <td></td>
          </tr>
          
          {/* Other Sections */}
          <tr>
            <td>2</td>
            <td colSpan={2} className="gujarati-text">મેડીકલેઇમ 80-D (Upto Rs.25000)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">
              <Input
                type="number"
                value={taxB.medicalInsurance80D || ''}
                onChange={(e) => updateField('medicalInsurance80D', Number(e.target.value) || 0)}
                className="w-full h-6 text-xs text-right p-1 border-0 bg-transparent"
                disabled={readOnly}
              />
            </td>
            <td></td>
          </tr>
          <tr>
            <td>3</td>
            <td colSpan={2} className="gujarati-text">વિકલાંગ આશ્રિત 80-DD (Upto Rs.50000)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">
              <Input
                type="number"
                value={taxB.disabledDependent80DD || ''}
                onChange={(e) => updateField('disabledDependent80DD', Number(e.target.value) || 0)}
                className="w-full h-6 text-xs text-right p-1 border-0 bg-transparent"
                disabled={readOnly}
              />
            </td>
            <td></td>
          </tr>
          <tr>
            <td>4</td>
            <td colSpan={2} className="gujarati-text">ગંભીર રોગ 80-DDB (Upto Rs.40000)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">
              <Input
                type="number"
                value={taxB.seriousDisease80DDB || ''}
                onChange={(e) => updateField('seriousDisease80DDB', Number(e.target.value) || 0)}
                className="w-full h-6 text-xs text-right p-1 border-0 bg-transparent"
                disabled={readOnly}
              />
            </td>
            <td></td>
          </tr>
          <tr>
            <td>5</td>
            <td colSpan={2} className="gujarati-text">અંધ/અપંગ 80-U (75000-125000)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">
              <Input
                type="number"
                value={taxB.disability80U || ''}
                onChange={(e) => updateField('disability80U', Number(e.target.value) || 0)}
                className="w-full h-6 text-xs text-right p-1 border-0 bg-transparent"
                disabled={readOnly}
              />
            </td>
            <td></td>
          </tr>
          <tr>
            <td>6</td>
            <td colSpan={2} className="gujarati-text">દાન 80-G (50%)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">
              <Input
                type="number"
                value={taxB.donation80G || ''}
                onChange={(e) => updateField('donation80G', Number(e.target.value) || 0)}
                className="w-full h-6 text-xs text-right p-1 border-0 bg-transparent"
                disabled={readOnly}
              />
            </td>
            <td></td>
          </tr>
          <tr>
            <td>7</td>
            <td colSpan={2} className="gujarati-text">સવિંગ બેંક વ્યાજ 80TTA (Rs.10000 મર્યાદા)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">
              <Input
                type="number"
                value={taxB.savingsBankInterest80TTA || ''}
                onChange={(e) => updateField('savingsBankInterest80TTA', Number(e.target.value) || 0)}
                className="w-full h-6 text-xs text-right p-1 border-0 bg-transparent"
                disabled={readOnly}
              />
            </td>
            <td></td>
          </tr>
          <tr className="total-row">
            <td>8</td>
            <td colSpan={2} className="gujarati-text font-bold">રોકાણ બાદ મળવા પાત્ર રકમનો સરવાળો</td>
            <td className="amount-cell">RS.</td>
            <td></td>
            <td className="amount-cell font-bold">{taxB.totalDeductions}</td>
          </tr>
          <tr className="total-row">
            <td>9</td>
            <td colSpan={2} className="gujarati-text font-bold">બાકિ મળવા પાત્ર આવક</td>
            <td className="amount-cell">RS.</td>
            <td></td>
            <td className="amount-cell font-bold">{taxB.taxableIncome}</td>
          </tr>
          <tr className="total-row">
            <td>10</td>
            <td colSpan={2} className="gujarati-text font-bold">દશનાં રાઉન્ડમાં કરપાત્ર રકમ</td>
            <td className="amount-cell">RS.</td>
            <td></td>
            <td className="amount-cell font-bold">{taxB.roundedTaxableIncome}</td>
          </tr>
        </tbody>
      </table>

      {/* Tax Slabs */}
      <div className="section-title">TAX CALCULATION</div>
      <table>
        <tbody>
          <tr>
            <td>1</td>
            <td>Upto Rs.2,50,000 (Male & Female)</td>
            <td className="text-center">0%</td>
            <td className="amount-cell">250000</td>
            <td className="amount-cell">{taxB.taxSlab1}</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Rs.2,50,001 To 5,00,000</td>
            <td className="text-center">5%</td>
            <td className="amount-cell">250000</td>
            <td className="amount-cell">{taxB.taxSlab2}</td>
          </tr>
          <tr>
            <td>3</td>
            <td>Rs.5,00,001 To 10,00,000</td>
            <td className="text-center">20%</td>
            <td className="amount-cell">{Math.max(0, taxB.roundedTaxableIncome - 500000)}</td>
            <td className="amount-cell">{taxB.taxSlab3}</td>
          </tr>
        </tbody>
      </table>

      {/* Tax Summary */}
      <div className="section-title gujarati-text">ઇન્કમટેક્ષ ગણતરી</div>
      <table>
        <tbody>
          <tr>
            <td colSpan={2} className="gujarati-text">ભરવાપાત્ર ઇન્કમટેક્ષ</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxB.totalTax}</td>
          </tr>
          <tr>
            <td colSpan={2}>Tax Rebate Section 87A (Up To Rs.2500)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.taxRebate87A}</td>
          </tr>
          <tr>
            <td colSpan={2} className="gujarati-text">ટેક્ષ રિબેટ બાદ ભરવા પાત્ર ઇન્કમટેક્ષ</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.taxAfterRebate}</td>
          </tr>
          <tr>
            <td colSpan={2}>Education Cess 4%</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.educationCess}</td>
          </tr>
          <tr className="total-row">
            <td colSpan={2} className="gujarati-text font-bold">કુલ ભરવા પાત્ર ઈન્કમટેક્ષ</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxB.totalTaxPayable}</td>
          </tr>
          <tr>
            <td colSpan={2}>RELIEF UNDER SECTION 89</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">
              <Input
                type="number"
                value={taxB.relief89 || ''}
                onChange={(e) => updateField('relief89', Number(e.target.value) || 0)}
                className="w-full h-6 text-xs text-right p-1 border-0 bg-transparent"
                disabled={readOnly}
              />
            </td>
          </tr>
          <tr className="total-row">
            <td colSpan={2} className="gujarati-text font-bold">કુલ ભરવાપાત્ર ઇન્કમટેક્સ Net Amount</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxB.netTaxPayable}</td>
          </tr>
        </tbody>
      </table>

      {/* Tax Payment Summary */}
      <div className="section-title gujarati-text">ઇન્કમટેક્ષની વિગત (પગારમાંથી ભરેલ તથા ભરવા પાત્ર)</div>
      <table>
        <tbody>
          <tr>
            <td>1</td>
            <td className="gujarati-text">ભરપાઈ કરેલ ઇન્કમટેક્ષ</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.taxPaid}</td>
          </tr>
          <tr>
            <td>2</td>
            <td className="gujarati-text">ભરવાપાત્ર બાકિ રહેલ ટેક્ષની રકમ</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.balanceTax}</td>
          </tr>
          <tr>
            <td>3</td>
            <td>Recovered from pay of {taxB.recoveredMonth || "___________"}</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.balanceTax}</td>
          </tr>
          <tr className="total-row">
            <td>4</td>
            <td className="gujarati-text font-bold">કુલ ભરપાઈ કરેલ ઇન્કમટેક્ષની રકમ</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxB.totalTaxPaid}</td>
          </tr>
        </tbody>
      </table>

      {/* Certificate */}
      <div className="mt-4 p-3 border border-gray-400">
        <p className="font-bold gujarati-text">કર્મચારી (શિક્ષક) બાહેંધરી</p>
        <p className="text-sm gujarati-text">
          આ પત્રકમાં ભરેલ તમામ વિગતો સાચી અને દોષ રહિત છે. જેની આથી હું ખાત્રી આપું છું.
        </p>
        <div className="text-right mt-2 gujarati-text">સહી: _______________</div>
      </div>

      <div className="mt-4 p-3 border border-gray-400">
        <p className="font-bold gujarati-text">સંસ્થાના વડાનું પ્રમાણપત્ર</p>
        <p className="text-sm gujarati-text">
          આ પત્રકમાં ભરેલ તમામ પગારદાર વિગતો સંસ્થાના હિસાબી દફતરે પ્રમાણે અને રોકાણોના આધારો અત્રેની ઓફિસમાં કર્મચારીએ રાખેલ છે.
          જેની આથી હું ખાત્રી આપું છું.
        </p>
        <div className="text-right mt-2">Signature and seal of Head of office</div>
      </div>

      <div className="footer-note">
        Created By: Smart Computer Vinchhiya - Rupsangbhai Jamod-9924640689
      </div>
    </div>
  );
};

export default AavakVeraFormB;
